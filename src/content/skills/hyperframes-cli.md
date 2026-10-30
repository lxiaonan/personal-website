---
name: hyperframes-cli
title: 'hyperframes-cli：把视频项目跑通、检查并渲染出来'
description: '指导 Agent 使用 HyperFrames 命令行完成初始化、预览、检查、截图与视频导出。'
category: video
repo: heygen-com/hyperframes
sourcePath: skills/hyperframes-cli/SKILL.md
install: 'npx hyperframes skills update'
benefit: '把视频创作连接到可运行的预览和渲染流程，便于定位问题和重复交付。'
output: '可预览的视频工程、检查结果、画面截图与导出文件'
order: 7
related: [hyperframes, agent-browser]
---

## 它是干什么的

`hyperframes-cli` 负责 HyperFrames 的命令行开发循环。它告诉 AI 什么时候初始化工程、怎样启动预览、如何检查时间线与布局、何时截图、如何导出视频以及怎样排查渲染失败。

如果把视频创作类比为开发应用，`hyperframes` 负责理解“要做什么视频并选择工作流”，`hyperframes-cli` 则负责“怎么把项目跑起来、检查并生成文件”。两者来自同一个仓库，配合使用最完整。

## 环境与安装

上游 CLI 要求 Node.js 22 或更新版本，并需要 FFmpeg。首次运行前应检查环境：

```bash
node --version
ffmpeg -version
npx hyperframes --help
```

上游为 Agent 安装核心技能集提供了以下命令，其中包括 `hyperframes-cli` 与相关基础能力：

```bash
npx hyperframes skills update
```

如果只想通过通用 Skills CLI 选装此项，也可以执行：

```bash
npx skills add heygen-com/hyperframes --skill hyperframes-cli
```

单装 CLI Skill 适合已了解 HyperFrames 的用户。创作完整视频仍然需要核心创作、动画和素材等配套能力。

## 从空目录到视频的基本流程

```bash
npx hyperframes init my-video
cd my-video
npx hyperframes preview
```

初始化后，需要实际编写或由 AI 生成合成内容，空模板不会自动变成完整宣传片。交互式预览可在独立终端中运行。

完成内容后，在项目目录运行检查：

```bash
npx hyperframes lint
npx hyperframes check
npx hyperframes snapshot --at 2,5,8
```

`lint` 适合编辑过程中的快速检查；最终的 `check` 已经包含 lint，并进一步检查运行时、请求、布局等问题，因此最终验收不需要重复堆叠相同检查。截图时间应替换为实际片长内的关键节点。

预览确认后再渲染并检查文件：

```bash
npx hyperframes render --quality looks --output out.mp4
ffprobe -v error -show_format -show_streams out.mp4
```

当前版本提供草稿、观感与交付等质量档位，最终交付可以按项目需求选择。安装版本的可用参数以 `npx hyperframes render --help` 为准。

## 给 AI 的调用示例

```text
使用 hyperframes-cli 检查现有的视频介绍项目。
先核对 Node.js、FFmpeg 和项目固定的 CLI 版本。
运行 check，检查每个场景的关键帧，并启动最终预览。
我确认画面后再导出 MP4，验证文件非空、时长、帧率与抽样画面。
如果失败，区分环境问题、素材请求失败、合成内容错误和渲染资源不足。
```

## 它能解决什么问题

- **预览正常，导出异常。** 沿渲染日志、素材路径和实际输出帧定位差异。
- **多个场景衔接错误。** 检查时间线与各子合成的可见时刻，避免只看片头。
- **有画面但没有声音。** 分别检查素材存在、音轨配置和导出媒体流。
- **批量导出不稳定。** 统一命令、版本、资源路径与输出验证，方便复现。

## 使用边界

通过静态检查或成功编码，不等于内容质量合格。文字溢出、字幕过快、音画不同步和画布内部细节仍需观看关键帧或成片。

本地渲染与云渲染的依赖和授权不同，云端能力可能需要账号、配置和费用。用于产品演示时，先跑通本地小样，再评估是否需要云端。它是运行与交付工具链，素材授权和具体文案仍需要创作者负责。
