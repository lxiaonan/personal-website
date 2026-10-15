# 一键部署到 yunan.aiutil.cloud

目标：root@yunan.aiutil.cloud:22。支持使用 systemd 的 Ubuntu / Debian；网站在本机构建，服务器只运行 Nginx，不需要 Node.js 或 Java。

## 你需要做什么

1. 确认域名的 A 记录指向服务器公网 IP。当前查询结果为 8.163.108.10；如果这就是目标服务器，无需再改。若使用 Cloudflare，请保持 DNS only（灰色云朵），保证 SSH 可以直接连到服务器。若以后启用代理，先将 deploy.config.json 的 host 改为服务器公网 IP，domain 保持不变。没有 IPv6 服务时不要添加 AAAA 记录。
2. 在云服务器安全组放行入方向 TCP 80、443。SSH 22 当前可连接，保留现有规则。80 端口后续仍用于证书续期验证。脚本会在 UFW 已启用时添加 80/443 规则，但无法修改云平台安全组。
3. 本机安装 Node.js 22.12 或更高版本，然后双击项目根目录的 **deploy.cmd**。
4. 等构建完成后，输入服务器 root 密码并回车。密码输入不显示，也不会写进配置、文件或命令参数。

脚本会自动构建、打包、加密上传、安装缺少的软件、发布网站、申请免费的 Let’s Encrypt 证书、启用 HTTP 到 HTTPS 跳转及 Certbot 自动续期。无需手动上传证书。

成功后访问：https://yunan.aiutil.cloud/

## 后续更新

日常修改内容后双击 **update.cmd**，输入服务器密码即可。这个入口只构建、上传和更新网站文件，不安装软件、不修改 Nginx 配置，也不调用 Certbot。现有 HTTPS 和自动续期继续由服务器处理。

新版本使用独立目录发布，完成服务器本地 HTTPS 检查后通过软链接保留新版本；检查失败会自动恢复旧版本。旧版本保留，不清空整台服务器的网站目录。首次部署仍使用 deploy.cmd；如果本站尚未初始化，update.cmd 会提示先完整部署。

也可以在项目目录执行：

```bash
npm run deploy:update
```

## HTTPS 如何申请和续期

证书使用 HTTP-01 验证：Let’s Encrypt 通过公网 80 端口读取域名下的临时验证文件。因此域名解析和安全组需要先配置正确。

脚本通过 Certbot 的 webroot 模式申请证书，ACME 验证路径独立于普通页面跳转。证书保存在 /etc/letsencrypt/live/yunan.aiutil.cloud/，certbot.timer 定时检查续期，续期成功后自动检查并重新加载 Nginx。

deploy.config.json 的 certificateEmail 可以填写真实邮箱；默认留空，可直接申请，不需要额外输入邮箱。运行脚本申请证书会创建或复用 ACME 账户，并接受 Let’s Encrypt 的服务条款。

如页面已部署，但首次证书申请失败，先根据错误修正 DNS、安全组或代理，然后执行：

```bash
npm run deploy:https
```

此命令只重新配置 HTTPS，无需重新构建网站。仍会隐藏提示输入服务器密码。

需要在服务器手动检查时：

```bash
nginx -t
systemctl status nginx --no-pager
systemctl status certbot.timer --no-pager
certbot certificates
certbot renew --cert-name yunan.aiutil.cloud --dry-run
```

## 文件与配置

| 位置 | 用途 |
| --- | --- |
| deploy.cmd | Windows 双击入口 |
| update.cmd | 日常更新入口，只更新网站文件 |
| deploy.config.json | 域名、服务器地址、SSH 端口和证书邮箱；不保存密码 |
| scripts/deploy.mjs | 本机检查、构建、打包、SSH 上传与公网 HTTPS 核验 |
| scripts/server-install.sh | 服务器安装、Nginx、版本切换及证书管理 |
| scripts/server-update.sh | 仅切换网站文件版本、检查结果并在失败时回滚 |
| .deploy/ | 本地压缩包和首次连接记录的 SSH 指纹，Git 忽略 |
| /var/www/yunan.aiutil.cloud/releases/ | 各次发布的网站文件 |
| /var/www/yunan.aiutil.cloud/current | 当前版本软链接 |
| /var/www/yunan.aiutil.cloud/previous | 上一次成功版本软链接 |
| /etc/nginx/conf.d/yunan.aiutil.cloud.conf | 本站独立 Nginx 配置 |
| /var/lib/yunan-personal-site/yunan.aiutil.cloud/ | 部署过程中使用的临时配置备份 |

首次 SSH 连接会显示并记录服务器指纹；后续指纹不一致会停止连接。服务器重装或更换后，需要先核实新的指纹，再处理 .deploy/known-hosts.json 中的对应记录。

如果同域名已经出现在其他 Nginx 配置中，或 80/443 被其他 HTTP 服务、容器代理占用，脚本会停止并指出冲突，不会停止已有应用。

## 本地预检查

```bash
npm run test:deploy
npm run deploy:prepare
```

第一条检查配置、Shell 参数转义及 HTTP/HTTPS 模板（模板测试需要 Bash）。第二条执行 Astro 检查、构建与打包，不连接服务器、不提示密码。真正部署需要服务器密码和公网 ACME 校验通过后才能确认成功。

## GitHub Pages 兼容

默认构建面向 https://yunan.aiutil.cloud/ 的根路径。原 GitHub Pages 手动工作流显式设置 DEPLOY_SITE_URL 和 DEPLOY_BASE_PATH，仍可构建 /personal-website 子路径版本。

## 本次上线验证

2026-10-15 已实际部署成功，版本为 20261015T035907Z-d6beabca。首页、踩坑栏目、AI 开发总结、RSS、Sitemap 和版本标识均通过公网 HTTPS 返回 200；HTTP 返回 301 并跳转到 HTTPS。TLS 主机名和信任链验证通过，证书签发方为 Let’s Encrypt，当前证书有效期至 2027-01-13；部署脚本已确认 certbot.timer 处于运行状态。

## 仅更新入口验证

2026-10-15 新增 update.cmd 与 deploy:update。部署专项测试 10 项通过，覆盖更新模式路由、服务器脚本 Bash 语法，以及更新脚本不含软件安装、Nginx 配置或证书命令。Linux 实际符号链接切换与失败回滚用例已提供，但当前 Windows 普通用户缺少原生符号链接权限，该用例跳过；本次没有连接服务器执行文件更新。
