# Java Backend Personal Site

一个面向 Java 后端开发者的个人网站：主页、文章、项目、关于、RSS 和搜索数据。

线上地址：

https://lxiaonan.github.io/personal-website/

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## GitHub Pages

仓库已包含 `.github/workflows/deploy.yml`，推送到 `main` 后会通过 GitHub Actions 构建并发布 `dist`。

如果第一次部署后地址仍然是 404，在仓库 `Settings -> Pages` 中把 `Source` 设为 `GitHub Actions`。
