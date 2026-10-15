# Java Backend Personal Site

一个面向 Java 后端开发者的个人网站：主页、文章、项目、关于、RSS 和搜索数据。

线上地址：

https://yunan.aiutil.cloud/

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## 服务器一键部署

双击根目录 `deploy.cmd`，构建完成后隐藏输入服务器 root 密码。脚本自动上传网站、配置 Nginx、申请 Let’s Encrypt HTTPS 并启用自动续期。默认连接 `root@yunan.aiutil.cloud:22`。

首次部署前，确认域名指向服务器并在云安全组放行 TCP 80、443。详细说明见 [服务器部署说明](docs/server-deployment.md)。

- `npm run deploy`：完整部署。
- `npm run deploy:update`：日常仅更新网站文件，也可双击 `update.cmd`；沿用现有 Nginx 和 HTTPS 配置。
- `npm run deploy:https`：只重新配置 HTTPS。
- `npm run deploy:prepare`：本地检查、构建和打包。
- `npm run test:deploy`：部署专项验证。

## GitHub Pages

仓库已包含 `.github/workflows/deploy.yml`，当前通过 `workflow_dispatch` 手动触发 GitHub Actions，检查并构建后发布 `dist`。

如果第一次部署后地址仍然是 404，在仓库 `Settings -> Pages` 中把 `Source` 设为 `GitHub Actions`。

## 内容维护

- `src/content/projects/`：项目案例，包含负责范围、交付能力和个人技能。
- `src/content/blog/`：Markdown / MDX 内容，`category` 可为 `article`（默认技术文章）、`pitfall`（踩过的小坑）、`ai-development`（AI 开发总结）。
- 可选 `project` 字段填写项目文件名（不带扩展名），内容详情会显示关联项目，项目详情也会列出相关记录。
- 新增内容会进入 RSS 和搜索数据；首页与栏目按类别展示。
- `docs/project-content-evidence.md`：本次项目整理的作者范围、代表提交和表述依据，不作为网页发布。

更新后运行 `npm run check` 和 `npm run build`。
