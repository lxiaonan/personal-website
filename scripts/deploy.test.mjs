import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { access, readFile, mkdtemp, mkdir, writeFile, readlink, rm, symlink } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import path from 'node:path';
import * as tar from 'tar';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import test from 'node:test';
import { deploymentPlan, shellQuote, validateConfig } from './deploy.mjs';

const exec = promisify(execFile);
const config = JSON.parse(await readFile(new URL('../deploy.config.json', import.meta.url), 'utf8'));
const serverScript = fileURLToPath(new URL('./server-install.sh', import.meta.url));
let bash;
for (const candidate of [process.env.DEPLOY_TEST_BASH, '/bin/bash', 'D:/Git/bin/bash.exe', 'C:/Program Files/Git/bin/bash.exe'].filter(Boolean)) {
  if (await access(candidate).then(() => true, () => false)) { bash = candidate; break; }
}

test('默认目标使用正确域名、root、SSH 22，配置不保存密码', () => {
  assert.equal(validateConfig(config).domain, 'yunan.aiutil.cloud');
  assert.equal(config.host, 'yunan.aiutil.cloud');
  assert.equal(config.username, 'root');
  assert.equal(config.port, 22);
  assert.equal(Object.hasOwn(config, 'password'), false);
});

test('拒绝 URL、路径穿越与 Shell 元字符进入域名', () => {
  for (const domain of ['https://yunan.aiutil.cloud', '../../etc', 'x;printf nope', 'x.cloud/other', 'x..cloud']) {
    assert.throws(() => validateConfig({ ...config, domain }));
  }
});

test('拒绝错误端口、非 root 用户与无效证书邮箱', () => {
  for (const port of [0, -1, 65536, '22']) assert.throws(() => validateConfig({ ...config, port }));
  assert.throws(() => validateConfig({ ...config, username: 'guest' }));
  assert.throws(() => validateConfig({ ...config, certificateEmail: 'not-an-email' }));
  assert.doesNotThrow(() => validateConfig({ ...config, host: '8.163.108.10', certificateEmail: 'owner@example.com' }));
});

test('Shell 参数往返保持引号、空格、换行与命令替换为普通文本', { skip: !bash }, async () => {
  const value = "带空格的目录/a'b\n$(printf SHOULD_NOT_EXPAND) `printf SHOULD_NOT_EXPAND` ; & ";
  const result = await exec(bash, ['-c', `printf '%s' ${shellQuote(value)}`], { encoding: 'utf8', timeout: 10_000 });
  assert.equal(result.stdout, value);
});

test('完整服务器脚本可被 Bash 解析', { skip: !bash }, async () => {
  await exec(bash, ['-n', serverScript], { encoding: 'utf8', timeout: 10_000 });
});

test('首次 HTTP 配置可服务页面和 ACME 校验，保留 Nginx URI 变量', { skip: !bash }, async () => {
  const { stdout } = await exec(bash, [serverScript, '--render-nginx', config.domain, '0'], { encoding: 'utf8', timeout: 10_000 });
  assert.equal((stdout.match(/server \{/g) ?? []).length, 1);
  assert.match(stdout, /location \^~ \/\.well-known\/acme-challenge\//);
  assert.match(stdout, /root \/var\/www\/yunan\.aiutil\.cloud\/acme;/);
  assert.match(stdout, /root \/var\/www\/yunan\.aiutil\.cloud\/current;/);
  assert.match(stdout, /try_files \$uri \$uri\/ =404;/);
  assert.doesNotMatch(stdout, /ssl_certificate|return 301/);
});

test('HTTPS 配置保留独立 HTTP 验证路径，并重定向普通请求', { skip: !bash }, async () => {
  const { stdout } = await exec(bash, [serverScript, '--render-nginx', config.domain, '1'], { encoding: 'utf8', timeout: 10_000 });
  assert.equal((stdout.match(/server \{/g) ?? []).length, 2);
  assert.match(stdout, /listen 443 ssl;/);
  assert.match(stdout, /return 301 https:\/\/yunan\.aiutil\.cloud\$request_uri;/);
  assert.match(stdout, /ssl_certificate \/etc\/letsencrypt\/live\/yunan\.aiutil\.cloud\/fullchain.pem;/);
  assert.match(stdout, /location \^~ \/\.well-known\/acme-challenge\/ \{[^}]+try_files \$uri =404;/s);
  assert.match(stdout, /max-age=31536000, immutable/);
  assert.match(stdout, /Cache-Control "no-cache" always/);
});

test('配置渲染模式拒绝非法输入，且不进入服务器安装', { skip: !bash }, async () => {
  await assert.rejects(exec(bash, [serverScript, '--render-nginx', '../../etc', '1'], { encoding: 'utf8', timeout: 10_000 }));
  await assert.rejects(exec(bash, [serverScript, '--render-nginx', config.domain, 'invalid'], { encoding: 'utf8', timeout: 10_000 }));
});

test('文件更新只选择更新脚本，不传证书参数；原部署模式保持原入口', () => {
  const prepared = { releaseId: '20261015T040000Z-12345678', checksum: 'a'.repeat(64) };
  const plan = deploymentPlan(['--update-only'], config, prepared, '/tmp/site');
  assert.equal(plan.script, 'server-update.sh');
  assert.deepEqual(plan.args, [config.domain, '/tmp/site/site.tar.gz', prepared.releaseId, prepared.checksum]);
  assert.equal(deploymentPlan([], config, prepared, '/tmp/site').script, 'server-install.sh');
  assert.equal(deploymentPlan(['--https-only'], config, null, '/tmp/site').args[2], '-');
  assert.throws(() => deploymentPlan(['--update-only'], config, null, '/tmp/site'));
});

test('更新脚本可以被 Bash 解析，且没有安装、配置或证书命令', { skip: !bash }, async () => {
  const script = fileURLToPath(new URL('./server-update.sh', import.meta.url));
  await exec(bash, ['-n', script], { encoding: 'utf8', timeout: 10_000 });
  const source = await readFile(script, 'utf8');
  assert.doesNotMatch(source, /\b(?:certbot|apt-get|systemctl|ufw|nginx)\b/);
  assert.doesNotMatch(source, /\/etc\/(?:nginx|letsencrypt)/);
});

test('实际文件更新成功切换，健康检查失败回滚，未初始化时拒绝更新', {
  skip: !bash || (process.platform === 'win32' ? '需要 Linux 符号链接语义；Windows 普通用户无法创建原生符号链接' : false)
}, async () => {
  const temporary = await mkdtemp(path.join(tmpdir(), 'yunan-update-test-'));
  const unixPath = p => p.replaceAll('\\', '/').replace(/^([A-Za-z]):/, (_, drive) => '/' + drive.toLowerCase());
  const site = path.join(temporary, 'site');
  const old = path.join(site, 'releases', 'old');
  const mocks = path.join(temporary, 'bin');
  const payload = path.join(temporary, 'payload');
  const releaseId = '20261015T040000Z-12345678';
  try {
    await mkdir(old, { recursive: true });
    await mkdir(mocks);
    await mkdir(payload);
    await writeFile(path.join(old, 'index.html'), 'old');
    await writeFile(path.join(site, '.yunan-personal-site'), 'managed');
    await symlink(old, path.join(site, 'current'), 'dir');
    await writeFile(path.join(payload, 'index.html'), 'new');
    await writeFile(path.join(payload, '__deploy-check.txt'), releaseId + '\n');
    const archive = path.join(temporary, 'site.tar.gz');
    await tar.c({ cwd: payload, file: archive, gzip: true }, ['.']);
    const checksum = createHash('sha256').update(await readFile(archive)).digest('hex');
    for (const [name, content] of Object.entries({
      id: '#!/bin/sh\necho 0\n',
      flock: '#!/bin/sh\nexit 0\n',
      curl: '#!/bin/sh\nprintf "%s\\n" "$UPDATE_TEST_RESPONSE"\n'
    })) await writeFile(path.join(mocks, name), content, { mode: 0o755 });
    let source = await readFile(new URL('./server-update.sh', import.meta.url), 'utf8');
    // 仅在临时副本重定向文件系统位置，并模拟 root、锁和 HTTPS；执行真实解包和版本切换。
    source = source.replace(/^export PATH=.*$/m, `export PATH=${shellQuote(unixPath(mocks))}:$PATH`)
      .replace('SITE=/var/www/$DOMAIN', `SITE=$(readlink -f ${shellQuote(unixPath(site))})`)
      .replace('/var/lock/yunan-personal-site-$DOMAIN.lock', unixPath(path.join(temporary, 'update.lock')));
    const script = path.join(temporary, 'update.sh');
    await writeFile(script, source);
    const invoke = response => exec(bash, [script, config.domain, unixPath(archive), releaseId, checksum], {
      encoding: 'utf8', timeout: 15_000, env: { ...process.env, UPDATE_TEST_RESPONSE: response }
    });
    await assert.rejects(invoke('wrong-version'), error => {
      assert.match(error.stderr, /已恢复旧版本/, error.stderr);
      return true;
    });
    assert.equal(path.basename(await readlink(path.join(site, 'current'))), 'old');
    await rm(path.join(site, 'releases', releaseId), { recursive: true });
    const result = await invoke(releaseId);
    assert.match(result.stdout, /DEPLOY_RELEASE_ID=20261015T040000Z-12345678/);
    assert.equal(path.basename(await readlink(path.join(site, 'current'))), releaseId);
    assert.equal(path.basename(await readlink(path.join(site, 'previous'))), 'old');
    await rm(path.join(site, '.yunan-personal-site'));
    await assert.rejects(invoke(releaseId), error => error.stderr.includes('尚未初始化'));
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});
