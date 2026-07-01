# Java Backend Personal Site

一个面向 Java 后端开发者的个人网站第一版：主页、文章、项目、关于、RSS、搜索数据和 Cloudflare Pages 部署友好的静态输出。

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

Cloudflare Pages 推荐配置：

- Build command: `npm run build`
- Build output directory: `dist`
- Node.js version: 22

部署前把 `astro.config.mjs` 里的 `site` 改成你的真实域名。
