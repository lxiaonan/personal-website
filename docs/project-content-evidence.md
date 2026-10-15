# 项目内容整理依据

整理日期：2026-10-15。用于维护网站内容的证据索引，不参与静态页面渲染。

## 范围与归属

- 来源：用户指定的业务后端仓库和 ai-tool-platform 仓库。
- 作者筛选：Git author 大小写不敏感匹配 luoyunan，实际名称为 LuoYuNan；同时覆盖其姓名匹配到的邮箱身份。
- 当前分支 HEAD：业务后端共 591 条、AI 平台共 93 条匹配的非合并提交。该数字是检索范围，不代表独立功能数量或业务成效。
- 查看全分支日志帮助定位历史；网站采用当前 HEAD 可达的提交，避免把重复分支或归档快照重复计为贡献。
- 两个来源仓库都有未提交修改；内容只采用已提交版本中的能力，没有将未提交的调度支持或漫画并发扩展写成已交付成果。
- 用户说明大量代码由 AI 完成；角色表述采用需求拆解、约束、问题定位、协作实现和交付验证，不表述为独立手写全平台。
- 团队项目只描述作者提交覆盖的负责范围。新增能力描述通过代表性提交及 HEAD 源码核对，未逐行审计全部历史提交。

## 内容调整原则

- 删除旧项目文案中无实测记录支持的“效率提升 60%+”“减少 70%–85%”“天级到分钟级”等结论。
- 不将仓库全局媒体 Handler 数量直接当作作者独立接入数量。
- 业务后端的主要数据库按仓库结构使用 PostgreSQL；个人 AI 平台使用 MySQL。
- 踩坑笔记的发布日期是整理日期，正文另标明源修复日期；表格中的输入是解释用边界示例。
- AI 视频任务只描述本地租约、状态和结果追踪，不承诺跨服务商 exactly-once。
- 原有 13 篇技术文章保留；新增内容通过 category 区分，RSS 与 search.json 包含所有已发布类别。

## 能力与证据

| 个人能力 | 可核对的交付 | 内容位置 |
| --- | --- | --- |
| 业务流程拆解 | 预览、提交、提交中状态与失败重提 | 批创项目 |
| 外部系统适配 | 多媒体授权、花费、素材关系与限流重试 | 广告投放项目 |
| 分析语义与 SQL | 路径分析、下钻、结果分群 | BI 项目 |
| 依赖与身份建模 | 资产箱、复用冲突、父子属性、目标引用与列结构 | BI 项目、资产迁移踩坑 |
| 成本与状态设计 | Token 预扣结算、异步视频任务 | AI 项目、计费踩坑、异步任务总结 |
| 跨层问题治理 | CSV 还原、Base64 审计、浏览器 chunk 恢复 | 踩坑栏目 |
| AI 协作与知识沉淀 | 规则文档、服务测试、前端恢复测试与部署说明 | AI 开发总结 |

## 业务后端代表提交

| 提交 | 日期 | 主题 |
| --- | --- | --- |
| 91850db77251a897c54c7bb4ea926d1a71107eed | 2026-10-14 | feat(bi-admin): 【数数】手动创建报表重名自动加后缀 |
| 452586f3faa08703a312d857a96257ed29afd816 | 2026-10-13 | feat(common,bi-admin,bi-job): 【数数】数数与gd-bi事件条数差异告警 |
| ac9747331ad6c5280f090112c05e04750a14e931 | 2026-10-10 | feat(common,bi-admin): 【数数】三方集成Tenjin回调 |
| d8f0926478d017ccef91c4c03ef9592a22f01bc0 | 2026-10-09 | feat(bi-admin): 【数数】ID标签和分群解决csv自带字符串问题 |
| 734509a1f234b3cc932e9caf6bc0de2d7437727a | 2026-10-08 | feat(common,bi-admin): 【数数】资产箱开箱增加数据源补齐列结构的逻辑 |
| cd56e9bba36f7a5f5524c9922155adff4c711a3a | 2026-09-24 | feat(common,bi-admin): 【数数】报表、看板导出到多维表格 |
| 904d426a4e7adcdb0055428fe59594f318d4326a | 2026-09-16 | feat(common,bi-admin): 【数数】第三方集成：AppLovin Revenue Reporting API、Tenjin Reporting Metrics API |
| 2e611ab7f8cea780bfe244ee729150f590d9234c | 2026-09-09 | feat(common,bi-admin): 【数数】资产箱重复开箱修复 |
| e2c578c50887ca8f24e73cca4726b7104b8fb3fc | 2026-08-28 | feat(common,bi-admin): 【数数】资产箱 |
| f910529c16ece99018137f2bb8311012cf8f7615 | 2026-06-11 | feat(common,bi-admin): 【数数】路径分析下钻计算和保存结果为分群实现 |
| 6e722ed8563d5c110c237bd253c5ac54bace83df | 2026-05-29 | feat(common,bi-admin,bi-job): 【数数】看板预计算 |
| 44091b04a9e9a62874e691f8d0141f62f01391e6 | 2026-04-29 | feat(common,bi-admin): 【数数】路径分析 |
| 73a43fc405eb2f883891145e9a19024387f2e4cb | 2026-03-07 | feat(common,ad): 华为商店渠道的花费拉取 |
| fd35b0b7f67d54832ce9ce188e135c2c0151ea31 | 2025-08-27 | feat(business模块): B站维护素材关系限流报错，添加补偿机制 |
| 4d1dd3a867ad21fac27255ba5c96ce698ffe5ee0 | 2025-06-20 | feat(business模块和common模块): 百度SEM的花费拉取 |
| 455f05c0bad947b0d07810b7401a47a0175f17c0 | 2026-01-22 | feat(common,ad-admin): 【投放】 广点通批创添加提交中状态、创意重新提交优化 |
| fcdccde8edffb19c681fc0ebd9704078102af60c | 2026-02-03 | feat(common,ad-admin): 【投放】 广点通批创解决分布式事务内异常详情未显示问题 |
| 03799996412bab1f636f069ab1b40ece853dd918 | 2025-07-23 | feat(common模块 和 business模块): 快手批创逻辑代码 |
| 03ad34daebd633645fee877f199a3b16d751d500 | 2025-08-21 | feat(common模块 和 business模块): B站批创提交 |
| 58989fa70b16c33fc91f0ad902206214047af0f6 | 2026-08-07 | fix(ad-admin): 【投放】数据权限bug修复 |

## 个人 AI 平台代表提交

| 提交 | 日期 | 主题 |
| --- | --- | --- |
| 4f625c8238a8baf033186315e5674933d95cb01b | 2026-07-03 | feat: initial ai tool platform |
| 5782aca21638b62efff2bb86f04b321e671cbe0a | 2026-07-23 | feat: add durable async video generation jobs |
| fabc0cb8a3ec2267caee6a7bccdd1f6818687ea7 | 2026-07-23 | feat: add generation task center |
| c79dc1205d1f933e068fd75d2e7439a44fefc8e2 | 2026-07-10 | 修正聊天 Token 计费预扣结算 |
| d19fb267925e2441b354af6536903d424519ea30 | 2026-07-20 | fix: 清理 AI 请求审计中的 Base64 数据 |
| d67ad169283a2f103e3d9912b66506fc70850735 | 2026-07-15 | fix: 避免本地历史重复存储图片数据 |
| 6bb9a22f04a3f0283113e4d7fc31d2608e548a07 | 2026-07-20 | fix: 自动恢复失效的前端懒加载资源 |
| 8129d070f2735ef5d55ee0525109f34f627b7625 | 2026-08-03 | feat(comic-drama): add generation preflight review |
| f8bfde62ce240212b0f8a4eb3424001ea53eeb43 | 2026-08-03 | feat(video): validate reference media inputs |
| 4fac5a9c5fa942097b4a0b7bfd6920aa9b23d809 | 2026-08-03 | feat(comic-studio): add static comic workbench |
| 5386096b5a896db97f86eebfbb4daa6cea10bf71 | 2026-07-29 | feat(video): integrate Bafang Sora Veo and Omni models |
| 76b12fe4d07a5f950f021b0a1fa52a8d37314217 | 2026-07-15 | feat: 增加 AI 穿搭带货视频工作台 |
| cd810b88b47426cf7cfd66606810d47d92e8d128 | 2026-07-13 | 实现多轮上下文与流式聊天 |
| 0cda230c5268fbd65a6231c15992983ef4240c8c | 2026-07-29 | docs: document video and comic drama contracts |

## 验证范围

本次仅修改个人网站。Astro 内容校验、构建与页面检查验证的是网站内容、路由和展示；没有运行两个来源项目的测试或连接其数据库、线上接口。源仓库既有测试仅作为实现和验收意图的证据，未宣称在本次重新通过。

## 网站验证结果

- Astro check：24 个文件，0 errors / 0 warnings / 0 hints。
- Astro build：30 个页面构建成功。
- 生成物静态检查：437 个站内链接及资源引用可解析，无缺失路径。
- search.json：13 篇技术文章、5 篇踩坑、2 篇 AI 总结；RSS 共 20 条。
- 浏览器：桌面及 390px、320px 宽度；新栏目列表、归属导航、笔记与项目双向关联、深浅主题、CSV 精确字符和原有 Java 标签筛选（6 篇）已检查。
- 修正窄屏三列导航、CSV 表格样式与目录锚点的导航遮挡。
