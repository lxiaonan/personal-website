---
name: find-skills
title: 'find-skills：先找到合适的能力，再开始工作'
description: '从任务出发搜索已有 Skill，比较来源和适用范围，减少重复编写提示词与工作流。'
category: discovery
repo: vercel-labs/skills
sourcePath: skills/find-skills/SKILL.md
install: 'npx skills add vercel-labs/skills --skill find-skills'
benefit: '把“有没有工具能做这件事”变成有来源、可安装的候选清单。'
output: '候选 Skill、适用说明、来源链接与安装命令'
order: 1
related: [setup-matt-pocock-skills, agent-browser]
---

## 它是干什么的

`find-skills` 是一个技能发现助手。当你只知道“想让 AI 做什么”，却不知道应该安装哪个 Skill 时，它会把目标拆成领域、具体任务和关键词，再从开放的 Agent Skills 生态里寻找可复用的方案。

它解决的典型问题是：你想检查网页体验、生成项目文档或者补充测试，却每次都从零写很长的提示词。已有 Skill 往往已经整理了操作顺序、参考资料和工具用法，找到合适的能力后，可以直接复用这些经验。

## 什么时候值得用

- 遇到新任务，不确定当前 AI 是否具备需要的工具和流程。
- 想为某一类重复工作建立稳定方法，例如代码审查、前端检查或部署。
- 已经有几个候选 Skill，需要核对作者、用途、依赖和维护情况。

如果任务很简单，例如改一句文案，直接让 AI 完成通常就够了。发现 Skill 的目的，是减少后续重复劳动。

## 安装与调用

在项目目录执行以下命令，并在安装界面选择自己使用的 Agent：

```bash
npx skills add vercel-labs/skills --skill find-skills
```

安装后，在支持 Skill 的 Agent 对话里明确提出任务：

```text
使用 find-skills，帮我寻找适合 Astro 个人网站的无障碍检查 Skill。
比较它们能检查什么、需要什么工具、是否会修改代码，给出来源和安装命令。
先推荐最匹配的 2～3 个，说明选择原因。
```

也可以直接使用 Skills CLI 搜索；这一步只是搜索，不等于安装搜索结果：

```bash
npx skills find accessibility
npx skills find java testing
npx skills list
```

## 一次使用会经历什么

1. **明确目标。** 比起“找个前端 Skill”，说明“检查 Astro 页面键盘可操作性与移动端溢出”会得到更准确的候选。
2. **搜索与比较。** 检查描述、原始 `SKILL.md`、作者仓库和维护情况，确认它实际指导哪些操作。
3. **展示推荐。** 给出名称、解决的问题、依赖、来源与安装方式，而不是只抛出一串排名。
4. **按需安装。** 选定后再安装到当前项目或用户范围，并用一个小任务验证是否适合。

## 放到开发中有什么作用

例如你要给个人网站新增一个视频介绍模块，可以先找“视频创作”和“浏览器验收”能力。前者帮助制作素材，后者检查页面实际显示效果。它承担的是能力选型，让后续工作有合适的方法和工具可用。

推荐要求 AI 给出一个对照表：**任务、推荐 Skill、推荐原因、工具依赖、预期产出**。这样更容易判断是否值得引入。

## 使用边界与常见误区

- 搜索排名、下载量和仓库 Star 可以作为线索，但不能代替阅读实际说明，也不能证明适合你的项目。
- Skill 是指导 Agent 的工作方法。浏览器、FFmpeg、测试框架等运行依赖，仍然需要单独具备。
- 安装后若未生效，先查看 `npx skills list`，确认装到了当前 Agent 能读取的范围，再刷新技能列表或开启新会话。
- 原仓库会持续更新；复制到项目的版本不会因为你读了新文档就自动变成最新版，可通过 `npx skills check` 检查更新。
