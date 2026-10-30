---
name: agent-browser
title: 'agent-browser：让 AI 在真实浏览器里操作和验证'
description: '通过浏览器快照、元素引用、点击、填表与截图，让 Agent 能检查真实页面行为。'
category: engineering
repo: vercel-labs/agent-browser
sourcePath: skills/agent-browser/SKILL.md
install: 'npx skills add vercel-labs/agent-browser --skill agent-browser'
benefit: '为 AI 增加可观察的浏览器反馈，验证页面是否真的能用。'
output: '页面操作结果、截图、提取的数据与问题记录'
order: 4
related: [tdd, find-skills]
---

## 它是干什么的

`agent-browser` 是面向 AI Agent 的浏览器自动化 CLI，配套 Skill 指导 AI 正确使用它。它可以打开网页、读取页面结构、点击、输入、选择、截图和提取信息，适合网页验收、表单流程检查、数据采集和重复操作。

它的关键机制是页面快照：将可访问性树中的元素表示为紧凑的引用，例如 `@e1`、`@e2`。AI 先观察实际页面，再用这些引用操作元素，降低凭空猜选择器的概率。

## 哪些场景最有用

- 新增页面后，实际检查导航、链接、主题切换和移动端展示。
- 复现“点按钮没有反应”“表单提交失败”等浏览器问题。
- 从页面提取结构化信息，或检查列表筛选后的结果。
- 为一次操作留下截图与复现步骤，便于开发者判断结果。

## 安装：Skill 与运行工具分开准备

先安装 Skill，让 Agent 知道怎样使用浏览器：

```bash
npx skills add vercel-labs/agent-browser --skill agent-browser
```

然后安装实际运行的 CLI 和浏览器。以下为上游推荐的全局安装方式：

```bash
npm install -g agent-browser
agent-browser install
agent-browser skills get core
```

`agent-browser install` 下载所需的 Chrome。当前版本的 Skill 文件是发现入口，完整工作流通过 `skills get core` 获取，以便和本机 CLI 版本保持一致。仅安装 Skill 不会自动获得全部浏览器运行环境。

## 最小操作流程

```bash
agent-browser open https://example.com
agent-browser snapshot
agent-browser screenshot page.png
agent-browser close
```

如果快照中某个链接标记为 `@e2`，可以执行：

```bash
agent-browser click @e2
agent-browser snapshot
```

这里的 `@e2` 只是示例。必须替换为当前快照里真实存在的引用，页面跳转或明显变化后应重新获取快照。

## 可以直接交给 AI 的任务

```text
使用 agent-browser 检查本地个人网站，地址是 http://127.0.0.1:4321。
从首页进入 AI Skills，搜索 tdd，再打开它的详细指南。
检查安装命令、目录跳转、返回列表和深浅色切换。
分别观察桌面与手机宽度，记录横向溢出和不可点击的元素。
输出复现步骤与截图，说明哪些检查通过、哪些尚未验证。
```

一个完整循环应该是：**打开 → 观察 → 操作 → 再观察 → 判断是否达到预期**。命令执行成功只说明操作完成，仍需确认页面结果是否符合目标。

## 与自动化测试是什么关系

它提供浏览器操作能力，适合探索性验证和发现问题。如果某条路径需要每次发布都稳定回归，应把验证整理为项目已有测试体系中的断言和用例。浏览器截图也不能证明数据库写入、权限或账务逻辑正确，这些需要后端测试共同覆盖。

## 常见问题

- **元素引用失效：** 页面结构已经变化，重新 `snapshot`，再使用新引用。
- **按钮被遮挡：** 先检查弹窗或遮罩，处理后重新观察，不要盲目重复点击。
- **需要登录：** 说明允许使用的测试账号与会话范围，保留用户完成登录的方式。
- **网页截图正常但操作有误：** 同时记录交互前后的状态，避免只看静态截图下结论。

涉及提交表单、发消息、购买或删除等行为时，应把允许执行的操作范围写清楚。检查页面展示时无需顺带提交真实业务数据。
