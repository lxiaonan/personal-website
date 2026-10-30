---
name: setup-matt-pocock-skills
title: 'setup-matt-pocock-skills：先为工程技能约定项目规则'
description: '配置事项跟踪方式、分流标签与领域文档位置，让 Matt Pocock 的工程技能按项目习惯协作。'
category: engineering
repo: mattpocock/skills
sourcePath: skills/engineering/setup-matt-pocock-skills/SKILL.md
install: 'npx skills add mattpocock/skills'
benefit: '让后续技能知道去哪里读背景、记录决策和跟踪事项，减少重复确认。'
output: 'Agent 项目约定、事项跟踪配置与领域文档规则'
order: 9
related: [grill-with-docs, improve-codebase-architecture, tdd]
---

## 它是干什么的

`setup-matt-pocock-skills` 是 Matt Pocock 工程技能包的项目初始化助手。它读取仓库现状，和你确认工作约定，再把约定写进项目，让后续技能知道应该去哪里跟踪任务、如何使用标签，以及从哪里读取业务术语和架构决策。

这里的 setup 是“配置当前仓库的协作方式”。它不负责替你安装 Java、Node.js 或全部测试工具，也不是执行一次就能自动改善整个项目架构的脚本。

## 它具体配置什么

### 事项跟踪方式

确认使用 GitHub Issues、GitLab Issues、本地 Markdown 文件，还是项目已有的平台。配置通常写入 `docs/agents/issue-tracker.md`。后续拆任务或整理事项的技能，会按照这里的规则工作。

### 分流标签

安装了 `triage` 时，会确认待分流、待补充、可交给 Agent、需人工处理、不处理等角色对应的标签。当前默认名包括 `needs-triage`、`needs-info`、`ready-for-agent`、`ready-for-human` 和 `wontfix`。

没有安装 `triage` 时，这部分会跳过。若选择远程事项平台并需要补标签，还可能涉及远程标签创建，应先确认配置范围。

### 领域文档约定

约定 `GLOSSARY.md` 和 ADR 的位置及读取规则，通常写入 `docs/agents/domain.md`。大多数单仓项目使用一份根目录词汇表和 `docs/adr/`；大型多上下文仓库才需要更细分的布局。

## 安装与调用

```bash
npx skills add mattpocock/skills
```

选择 `setup-matt-pocock-skills`，以及后续需要的工程技能。然后在目标仓库里调用：

```text
使用 setup-matt-pocock-skills 配置当前项目。
这是个人维护的 Astro 网站，任务暂时用本地 Markdown 跟踪。
先检查现有 AGENTS.md、文档和仓库配置，保留已有约定。
采用单一领域文档布局，展示准备写入的内容后再确认。
这次只配置项目协作规则。
```

在支持斜杠调用的环境中，可以使用 `/setup-matt-pocock-skills`。应在目标项目目录运行，让它读取正确的仓库上下文。

## 你可以期待的执行过程

1. 检查仓库 remote、现有 Agent 说明、词汇表、ADR 和已安装技能。
2. 根据实际情况推荐事项平台，确认必要的分支选项。
3. 展示项目说明与配置文档草案。
4. 确认后写入或更新配置，不覆盖无关内容。
5. 说明哪些工程技能会读取这些配置，以及后续如何修改。

当前上游优先更新已有 `CLAUDE.md`，没有时再使用 `AGENTS.md`；两者都没有时，会询问创建哪一个。不要在已有说明旁边机械生成另一份重复规则。

## 什么时候运行最合适

第一次把这套工程技能引入仓库时运行一次，之后根据项目变化维护 `docs/agents/` 即可。换事项平台、调整领域文档布局，或者希望重新配置时再运行。

完成后可以接着用 `grill-with-docs` 澄清需求，用 `improve-codebase-architecture` 调查重构机会，再用 `tdd` 验证实现。初始化的价值是为这些能力提供一致上下文。

## 如何检查配置是否合理

检查事项路径是否真实可用、术语表和 ADR 是否与已有结构冲突、标签是否沿用团队现有含义，以及项目说明是否能让新会话找到这些文件。配置文档需要简洁明确；过时或互相矛盾的规则，会让自动化协作更难维护。
