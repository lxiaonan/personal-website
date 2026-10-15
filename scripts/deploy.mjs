import { spawn } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { resolve4 } from 'node:dns/promises';
import { access, mkdir, readFile, readdir, lstat, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { isIP } from 'node:net';
import path from 'node:path';
import { emitKeypressEvents } from 'node:readline';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const localState = path.join(root, '.deploy');
const require = createRequire(import.meta.url);
const runId = randomBytes(8).toString('hex');

async function writeStatus(phase, details = {}) {
  await mkdir(localState, { recursive: true, mode: 0o700 });
  await writeFile(path.join(localState, 'deploy-status.json'), JSON.stringify({
    runId, pid: process.pid, phase, updatedAt: new Date().toISOString(), ...details
  }, null, 2) + '\n', { encoding: 'utf8', mode: 0o600 });
}

export function shellQuote(value) {
  return "'" + String(value).replaceAll("'", "'\\''") + "'";
}

// 文件更新使用独立的服务器脚本，避免进入安装及证书流程。
export function deploymentPlan(args, config, prepared, temp) {
  if (args.includes('--update-only')) {
    if (!prepared) throw new Error('仅更新模式需要先构建发布包。');
    return {
      script: 'server-update.sh',
      args: [config.domain, `${temp}/site.tar.gz`, prepared.releaseId, prepared.checksum],
      message: '[3/4] 更新网站文件并切换发布版本……'
    };
  }
  return {
    script: 'server-install.sh',
    args: [config.domain, config.certificateEmail, prepared ? `${temp}/site.tar.gz` : '-', prepared?.releaseId ?? '-', prepared?.checksum ?? '-'],
    message: '[3/4] 配置 Nginx、发布网站并申请 HTTPS……'
  };
}

export function validateConfig(config) {
  const domainPattern = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
  if (!domainPattern.test(config.domain ?? '')) throw new Error('deploy.config.json 中 domain 必须是小写域名，不含 https:// 或路径。');
  if (!isIP(config.host ?? '') && !domainPattern.test(config.host ?? '')) throw new Error('host 必须是服务器域名或 IP。');
  if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) throw new Error('SSH port 必须是 1 到 65535 的整数。');
  if (config.username !== 'root') throw new Error('此一键脚本使用 root 安装 Nginx 和证书，请将 username 设置为 root。');
  if (typeof config.certificateEmail !== 'string' || (config.certificateEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.certificateEmail))) {
    throw new Error('certificateEmail 留空或填写真实邮箱。');
  }
  return config;
}

function runNode(args, { timeout = 600_000, env = process.env } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { cwd: root, env, stdio: 'inherit', windowsHide: true });
    const timer = setTimeout(() => {
      if (process.platform === 'win32' && child.pid) {
        spawn('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
      } else {
        child.kill('SIGTERM');
      }
      reject(new Error('本地命令超时，已停止本次构建。'));
    }, timeout);
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.once('exit', code => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(`本地命令执行失败（退出码 ${code}）。请先解决上方错误。`));
    });
  });
}

async function npmCli() {
  const candidates = [
    process.env.npm_execpath,
    path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
    path.resolve(path.dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js'),
    '/usr/share/nodejs/npm/bin/npm-cli.js'
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (!candidate.endsWith('npm-cli.js')) continue;
    if (await access(candidate).then(() => true, () => false)) return candidate;
  }
  throw new Error('未找到 npm，请使用包含 npm 的 Node.js 安装版本。');
}

async function dependencies() {
  try {
    require.resolve('ssh2');
    require.resolve('tar');
    require.resolve('astro/package.json');
  } catch {
    console.log('首次运行：正在安装项目依赖……');
    await runNode([await npmCli(), 'ci', '--no-audit', '--no-fund']);
  }
  return { Client: (await import('ssh2')).default.Client, tar: await import('tar') };
}

async function ensureRegularFiles(directory) {
  for (const item of await readdir(directory)) {
    const target = path.join(directory, item);
    const stat = await lstat(target);
    if (stat.isSymbolicLink()) throw new Error(`构建产物不能包含符号链接：${target}`);
    if (stat.isDirectory()) await ensureRegularFiles(target);
    else if (!stat.isFile()) throw new Error(`构建产物包含非普通文件：${target}`);
  }
}

async function prepare(config, tar) {
  const env = { ...process.env, DEPLOY_SITE_URL: `https://${config.domain}`, DEPLOY_BASE_PATH: '/' };
  const astro = path.join(path.dirname(require.resolve('astro/package.json')), 'bin/astro.mjs');
  console.log('\n[1/4] 检查并构建网站……');
  await runNode([astro, 'check'], { env });
  await runNode([astro, 'build'], { env });
  const dist = path.join(root, 'dist');
  await ensureRegularFiles(dist);
  const releaseId = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z') + '-' + randomBytes(4).toString('hex');
  await writeFile(path.join(dist, '__deploy-check.txt'), releaseId + '\n', 'utf8');
  const archive = path.join(localState, `site-${releaseId}.tar.gz`);
  await tar.c({ cwd: dist, file: archive, gzip: true, portable: true, noMtime: true }, ['.']);
  const checksum = createHash('sha256').update(await readFile(archive)).digest('hex');
  console.log(`构建完成，发布版本：${releaseId}`);
  return { archive, releaseId, checksum };
}

function passwordPrompt() {
  if (!process.stdin.isTTY) throw new Error('请在本机终端运行或双击 deploy.cmd，然后隐藏输入服务器密码。不要通过命令参数传入密码。');
  return new Promise((resolve, reject) => {
    let password = '';
    const wasRaw = process.stdin.isRaw;
    emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdout.write('\n服务器 root 密码（输入不显示，完成后按回车）：');
    const cleanup = () => {
      process.stdin.removeListener('keypress', onKey);
      process.stdin.setRawMode(Boolean(wasRaw));
      process.stdin.pause();
      process.stdout.write('\n');
    };
    const onKey = (text, key = {}) => {
      if (key.ctrl && key.name === 'c') { cleanup(); reject(new Error('已取消部署。')); return; }
      if (key.name === 'return' || key.name === 'enter') {
        cleanup();
        if (!password) reject(new Error('密码不能为空。'));
        else resolve(password);
        return;
      }
      if (key.name === 'backspace') { password = Array.from(password).slice(0, -1).join(''); return; }
      if (!key.ctrl && !key.meta && text && !/[\r\n\x00-\x1f\x7f]/.test(text)) password += text;
    };
    process.stdin.on('keypress', onKey);
  });
}

async function connect(config, password, Client) {
  const knownFile = path.join(localState, 'known-hosts.json');
  let known = {};
  try { known = JSON.parse(await readFile(knownFile, 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw new Error('SSH 指纹记录损坏，请检查 .deploy/known-hosts.json。'); }
  const identity = `${config.host}:${config.port}`;
  let fingerprint;
  let changed = false;
  const client = new Client();
  await new Promise((resolve, reject) => {
    client.on('error', error => reject(new Error(changed
      ? '服务器 SSH 指纹发生变化，已停止连接。确认服务器更换原因后，再处理 .deploy/known-hosts.json 中对应记录。'
      : `SSH 连接失败：${error.message}`)));
    client.once('ready', resolve);
    client.on('keyboard-interactive', (_name, _instructions, _language, prompts, finish) => {
      finish(prompts.length === 1 && /password/i.test(prompts[0].prompt) ? [password] : []);
    });
    client.connect({
      host: config.host, port: config.port, username: config.username, password,
      tryKeyboard: true, readyTimeout: 30_000, keepaliveInterval: 10_000, keepaliveCountMax: 3,
      hostHash: 'sha256',
      hostVerifier(hash) {
        fingerprint = hash;
        changed = Boolean(known[identity] && known[identity] !== hash);
        if (!known[identity]) console.log(`首次连接 SSH 指纹：SHA256:${Buffer.from(hash, 'hex').toString('base64').replace(/=+$/, '')}`);
        return !changed;
      }
    });
  }).catch(error => { client.end(); throw error; });
  if (!known[identity]) {
    known[identity] = fingerprint;
    await writeFile(knownFile, JSON.stringify(known, null, 2) + '\n', { encoding: 'utf8', mode: 0o600 });
  }
  return client;
}

function remote(client, command, { print = false, timeout = 1_800_000 } = {}) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { reject(new Error('远程部署超时。再次运行前请确认服务器安装状态；部署锁会阻止并发发布。')); }, timeout);
    client.exec(command, (error, stream) => {
      if (error) { clearTimeout(timer); reject(error); return; }
      let output = '';
      let errors = '';
      stream.setEncoding('utf8');
      stream.stderr.setEncoding('utf8');
      stream.on('data', chunk => { output += chunk; if (print) process.stdout.write(chunk); });
      stream.stderr.on('data', chunk => { errors += chunk; if (print) process.stderr.write(chunk); });
      stream.once('error', error => { clearTimeout(timer); reject(error); });
      stream.once('close', (code, signal) => {
        clearTimeout(timer);
        if (code === 0) resolve(output.trim());
        else reject(new Error(`服务器部署未完成（退出码 ${code ?? signal}）。${errors ? '\n' + errors.trim().slice(-2500) : '请根据窗口中的提示修正后重试。'}`));
      });
    });
  });
}

async function upload(client, files) {
  const sftp = await new Promise((resolve, reject) => client.sftp((error, result) => error ? reject(error) : resolve(result)));
  try {
    for (const [local, destination] of files) {
      await new Promise((resolve, reject) => sftp.fastPut(local, destination, { mode: 0o600 }, error => error ? reject(error) : resolve()));
    }
  } finally { sftp.end(); }
}

async function verify(domain, releaseId) {
  console.log('\n[4/4] 验证公网 HTTPS 证书和发布版本……');
  const response = await fetch(`https://${domain}/__deploy-check.txt?t=${Date.now()}`, { signal: AbortSignal.timeout(20_000), redirect: 'follow' });
  const received = (await response.text()).trim();
  if (!response.ok || received !== releaseId) throw new Error('服务器发布已执行，但公网 HTTPS 版本核验失败。请检查 DNS、代理缓存及安全组 443 端口。');
}

export async function main(args = process.argv.slice(2)) {
  if (args.includes('--help')) {
    console.log('node scripts/deploy.mjs [--prepare-only | --https-only | --update-only]\n默认：检查、构建、上传、部署、申请 HTTPS。\n--prepare-only：只检查、构建和打包，不连接服务器。\n--https-only：只重新配置 HTTPS，不重新构建和上传网站。\n--update-only：构建并更新网站文件，沿用已有 Nginx 和证书配置。');
    return;
  }
  if (args.some(arg => !['--prepare-only', '--https-only', '--update-only'].includes(arg)) || args.length > 1) throw new Error('参数不正确，请使用 --help 查看用法。');
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major < 22 || (major === 22 && minor < 12)) throw new Error('需要 Node.js 22.12 或更高版本。');
  const config = validateConfig(JSON.parse(await readFile(path.join(root, 'deploy.config.json'), 'utf8')));
  await mkdir(localState, { recursive: true, mode: 0o700 });
  await writeStatus('preparing', { domain: config.domain });
  const { Client, tar } = await dependencies();
  console.log(`目标网站：https://${config.domain}\nSSH：${config.username}@${config.host}:${config.port}`);
  const prepared = args.includes('--https-only') ? null : await prepare(config, tar);
  if (args.includes('--prepare-only')) {
    await writeStatus('prepared', { domain: config.domain, releaseId: prepared.releaseId });
    console.log(`\n本地检查完成，尚未连接服务器。\n发布包：${prepared.archive}`);
    return;
  }
  const addresses = await resolve4(config.domain).catch(() => []);
  console.log(`域名 IPv4 解析：${addresses.join(', ') || '暂未查询到，请先配置 DNS'}`);
  await writeStatus('awaiting-password', { domain: config.domain });
  const password = await passwordPrompt();
  await writeStatus('connecting', { domain: config.domain });
  console.log('\n[2/4] 连接服务器并上传部署文件……');
  const client = await connect(config, password, Client);
  let temp;
  try {
    temp = await remote(client, 'umask 077; mktemp -d /tmp/yunan-personal-site.XXXXXXXX');
    if (!/^\/tmp\/yunan-personal-site\.[A-Za-z0-9]+$/.test(temp)) throw new Error('服务器临时目录返回值异常，已停止上传。');
    const plan = deploymentPlan(args, config, prepared, temp);
    const files = [[path.join(root, 'scripts', plan.script), `${temp}/install.sh`]];
    if (prepared) files.push([prepared.archive, `${temp}/site.tar.gz`]);
    await writeStatus('uploading', { domain: config.domain });
    await upload(client, files);
    console.log('\n' + plan.message);
    await writeStatus('installing', { domain: config.domain });
    const output = await remote(client, `bash ${shellQuote(`${temp}/install.sh`)} ${plan.args.map(shellQuote).join(' ')}`, { print: true });
    const releaseId = prepared?.releaseId ?? output.match(/^DEPLOY_RELEASE_ID=(.+)$/m)?.[1];
    if (!releaseId) throw new Error('没有收到服务器发布版本标识。');
    await writeStatus('verifying', { domain: config.domain, releaseId });
    await verify(config.domain, releaseId);
    await writeStatus('succeeded', { domain: config.domain, releaseId });
    console.log(args.includes('--update-only')
      ? `\n网站文件更新成功：https://${config.domain}/\n已沿用现有 Nginx 和 HTTPS 配置。`
      : `\n部署成功：https://${config.domain}/\nHTTPS 证书已配置，Certbot 定时续期已启用。`);
  } finally {
    if (temp && /^\/tmp\/yunan-personal-site\.[A-Za-z0-9]+$/.test(temp)) {
      await remote(client, `rm -f ${shellQuote(`${temp}/site.tar.gz`)} ${shellQuote(`${temp}/install.sh`)}; rmdir ${shellQuote(temp)}`, { timeout: 10_000 }).catch(() => {});
    }
    client.end();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(async error => {
    await writeStatus('failed', { message: error.message }).catch(() => {});
    console.error(`\n部署失败：${error.message}`);
    process.exitCode = 1;
  });
}
