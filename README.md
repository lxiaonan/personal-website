# YuNan · Java 后端开发笔记

基于 Astro + MDX 的静态个人网站，记录项目实现、问题修复、后端方案与 AI 协作实践。线上地址：[yunan.aiutil.cloud](https://yunan.aiutil.cloud/)。

## 快速开始

使用 Node.js **22.12+（22.x）** 和 npm，与 CI 保持一致。项目不需要 Java 服务或数据库。

```bash
npm ci
npm run dev
```

打开终端输出的本地地址，默认是 [http://127.0.0.1:4321/](http://127.0.0.1:4321/)。`npm ci` 根据已提交的 lockfile 安装依赖；需要主动升级依赖时再使用 `npm install` 并审阅 lockfile 变化。

## 页面与内容入口

| 路径 | 内容 |
| --- | --- |
| `/` | 个人概要、阅读路线、精选案例、代表项目和常用资源 |
| `/blog/` | 技术文章，可按标签筛选 |
| `/pitfalls/` | 有具体问题和修复依据的踩坑记录 |
| `/ai-development/` | AI 协作开发总结 |
| `/projects/` | 项目案例与关联笔记 |
| `/ai-skills/` | AI Skills 中文指南、安装步骤与使用边界 |
| `/about/` | 工作经历、技术栈和已配置的联系方式 |
| `/search/` | 站内搜索，覆盖标题、摘要、标签，支持分类与可分享查询链接 |
| `/rss.xml` | 已发布文章订阅，不包含项目和 Skills |
| `/search.json` | 与搜索页面共用的数据索引 |
| `/sitemap-index.xml` | 站点地图 |

搜索支持多个空格分隔的关键词，按“全部词均匹配”筛选；不搜索正文。关闭 JavaScript 后，搜索页仍可浏览全部内容，文章与目录锚点仍可访问。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 本地开发 |
| `npm run check` | Astro / TypeScript 静态检查 |
| `npm run build` | 生成静态站点到 `dist/` |
| `npm run preview` | 本地预览最近一次构建 |
| `npm run test:site` | 检查构建后的站内链接、锚点、canonical 与搜索索引；先执行 build |
| `npm run test:deploy` | 部署脚本测试；部分测试需要 Bash，实际符号链接用例需要 Linux |
| `npm run deploy:prepare` | 本地检查、构建、打包，不连接服务器 |
| `npm run deploy:update` | 向现有服务器发布网站文件 |
| `npm run deploy` | 完整部署，包含 Nginx 与 HTTPS 配置 |
| `npm run deploy:https` | 重新配置服务器 HTTPS |

改动后的基础验证：

```bash
npm run check
npm run build
npm run test:site
```

涉及部署脚本时再运行 `npm run test:deploy`。布局变化还应检查手机与桌面、深浅主题、键盘访问和目录定位。`test:site` 检查构建 HTML 中的链接，不代替真实浏览器交互或公网外链检查。

## 项目结构

```text
src/
  components/       导航、文章列表、精选阅读和代码复制
  content/blog/     技术文章、踩坑记录、AI 开发总结（Markdown / MDX）
  content/projects/ 项目案例（Markdown）
  content/skills/   AI Skills 指南（Markdown）
  content.config.ts 内容集合字段与校验
  data/             个人资料、导航、栏目、技术栈、Skills 分类
  layouts/          全站壳层、主题初始化与页面元信息
  pages/            页面路由、RSS、搜索数据和 404
  styles/           配色、布局与阅读样式
  utils/            站内路径、阅读时长和搜索条目
public/             原样复制到发布目录的静态文件
scripts/            构建产物检查与服务器部署
docs/               维护指南、写作规范、部署说明及项目证据
```

只修改源文件，不直接编辑 `dist/`、`.astro/` 和 `node_modules/`。

## 内容与配置维护

- 个人资料与导航：`src/data/site.ts`。邮箱使用真实地址；`email`、`linuxdo`、`resume` 留空时隐藏相应入口，不展示示例联系信息。
- 文章：`src/content/blog/`。用 `category` 区分三类笔记，`draft: true` 同时从列表、文章路由、RSS 和搜索中排除。
- 项目：`src/content/projects/`。文章的 `project` 填项目文件名（无扩展名），详情页自动建立关联。
- Skills：`src/content/skills/` 与 `src/data/skills.ts`。数量自动统计；原仓库、相关指南和来源核对日期需要作者维护。
- 精选入口：`src/components/FeaturedReads.astro`。修改文件名时同步更新精选 ID 和已发布链接。
- 配色与导航避让：`src/styles/global.css` 的颜色变量与 `--header-offset`。页面内链接统一使用 `withBase` / `postUrl` / `projectUrl`。
- 部署域名与子路径：`astro.config.mjs` 的 `DEPLOY_SITE_URL`、`DEPLOY_BASE_PATH`。本地与 CI 的构建和 `test:site` 必须使用相同环境变量。

完整例子和发布流程见 [内容维护指南](docs/content-maintenance.md)。

## 部署

**现有服务器日常更新：** 双击 `update.cmd` 或执行 `npm run deploy:update`。首次部署使用 `deploy.cmd` 或 `npm run deploy`。部署会提示输入服务器密码，默认目标为 `root@yunan.aiutil.cloud:22`。

先确认域名解析以及 TCP 80、443 放行。更新入口沿用现有 Nginx 与 HTTPS 配置；若要启用本次新增的自定义 404，需要先通过完整部署更新 Nginx 模板，后续再使用日常更新。见 [服务器部署说明](docs/server-deployment.md)。

**GitHub Pages：** `.github/workflows/deploy.yml` 通过 `workflow_dispatch` 手动触发，默认构建 `https://lxiaonan.github.io/personal-website`。仓库 `Settings → Pages → Source` 选择 `GitHub Actions`。迁移仓库或域名时同步修改工作流中的两个部署环境变量。

**持续检查：** `.github/workflows/check.yml` 在 push / pull request 时执行静态检查、部署测试，并验证根路径和 GitHub Pages 子路径构建。它不会发布网站。

## 文档导航

| 文档 | 何时阅读 |
| --- | --- |
| [内容维护指南](docs/content-maintenance.md) | 新增文章、项目或 Skill，检查发布结果 |
| [文章编排与阅读路线](docs/article-writing-guide.md) | STAR 结构、摘要、复盘与方案推演的区别 |
| [优化记录与后续建议](docs/site-improvements.md) | 本轮调整、验证范围与后续优先级 |
| [服务器部署说明](docs/server-deployment.md) | 域名、HTTPS、更新与回滚 |
| [项目内容依据](docs/project-content-evidence.md) | 核对作者范围、代表提交与成果表述 |
| [工作事项记录](docs/work-content-record.md) | 业务步骤、源码索引与验证范围 |

`docs/` 是仓库维护文档，不会自动发布为网站页面。历史文档中的验证数量和日期只代表当时快照，当前状态以本次检查结果为准。
