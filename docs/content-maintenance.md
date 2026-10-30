# 内容维护指南

适用于本站 Astro 内容集合。字段以 `src/content.config.ts` 为准，本文提供最小可用示例。所有文本保存为 UTF-8。

## 新增文章

在 `src/content/blog/` 新建 `my-topic.mdx`，文件名会形成 `/blog/my-topic/`。不要随意修改已公开的文件名，否则旧链接会失效。

```yaml
---
title: 一次重复请求，怎样回到同一个业务结果
description: 用订单创建场景推演幂等边界，说明唯一约束、并发冲突和重试的验收方法。
pubDate: 2026-10-26
category: article
kind: design-note
tags: [Java, 幂等]
draft: true
---
```

在这段元数据后写 Markdown 正文。日期使用 `YYYY-MM-DD`；实际更新内容时可增加 `updatedDate`。

| 字段 | 规则 |
| --- | --- |
| `category` | `article`、`pitfall`、`ai-development`；默认 `article` |
| `kind` | `design-note` 为方案推演；`case-study` 为有依据的项目复盘 |
| `project` | 可选，填写 `src/content/projects/` 下已存在的文件名，不带扩展名 |
| `star` | 可选；提供时必须包含非空的 situation / task / action / result |
| `takeaways` | 最多 3 条，写读者可以复用的动作 |
| `draft` | `true` 时不生成详情路由，也不进入列表、RSS、搜索和 sitemap |

准备发布时，将 `draft` 改为 `false`，按 [写作规范](article-writing-guide.md) 补齐摘要与依据。`case-study` 不能仅因为有示例代码就写成已落地成果。

## 新增项目

在 `src/content/projects/` 新建 Markdown 文件：

```yaml
---
title: 示例项目
status: 持续维护
summary: 用一句话说明业务问题和自己的负责范围。
period: '2026'
role: 后端开发
stack: [Java, Spring Boot]
metrics: []
skills: []
order: 5
---
```

正文记录业务背景、负责事项、实现步骤和验证限制。`metrics` 仅填写有依据的交付项，不补造业务量或提升比例。`order` 越小越靠前；项目集合没有草稿字段，未准备公开的材料先放在 `docs/`。

## 新增 AI Skill 指南

在 `src/content/skills/` 新建 `my-skill.md`：

```yaml
---
name: my-skill
title: my-skill：解决什么问题
description: 用一句话解释适用场景。
category: engineering
repo: owner/repository
sourcePath: skills/my-skill/SKILL.md
install: npx skills add owner/repository --skill my-skill
benefit: 帮助使用者减少哪一种重复工作。
output: 最终得到什么可检查的结果。
order: 10
related: []
---
```

以上仓库和命令是字段示例，发布前必须换成已核对的真实来源。分类只能是 `discovery`、`planning`、`engineering`、`video`；`related` 填其他指南文件名。详情页目前以 `main` 分支拼接来源链接，来源使用其他分支时需要调整页面实现。Skills 没有草稿字段。

正文建议包含：适用问题、运行依赖、安装命令、调用示例、产出和使用边界。数量会自动更新；`src/data/skills.ts` 中的来源核对日期只在实际核对后修改。

## 链接、代码和阅读体验

- Astro 模板中的站内路径使用 `withBase()`；文章和项目分别使用 `postUrl()`、`projectUrl()`，避免子路径部署丢失前缀。
- 普通 Markdown 的站内内容链接可优先使用相对路径；构建后用 `test:site` 检查目标与锚点。Markdown 中的根路径不会自动经过 `withBase()`。
- 文章二级标题的 `S ·` / `T ·` / `A ·` / `R ·` 前缀用于关联 STAR 摘要。改标题后验证摘要和目录跳转。
- 使用带语言标记的围栏代码块；普通文章、项目正文及 Skill 指南会增强为可复制代码块。剪贴板失败时保留手动选择方式。
- 真实邮箱填写 `name@example.com` 形式；未公开邮箱、Linux.do 主页、简历时留空。不要填写示例链接。

## 本地验证和发布

```bash
npm run check
npm run build
npm run test:site
npm run preview
```

确认详情页、栏目归属、搜索结果、关联项目与目录锚点；在窄屏和深色模式下检查代码块、表格和导航。文章草稿预览需在本地临时设为非草稿，检查后恢复，避免意外发布。

GitHub Pages 子路径构建时，build 和 test:site 都要使用 `DEPLOY_SITE_URL=https://lxiaonan.github.io` 与 `DEPLOY_BASE_PATH=/personal-website`。CI 会自动执行两种构建；本地测试后如需发布主域名，清除这两个临时环境变量并重新构建。

使用服务器更新入口前先检查 Git diff，避免把其他尚未完成的内容一起发布。CI 检查通过不表示已上线，发布后的页面、RSS、搜索与 HTTPS 仍需核验。
