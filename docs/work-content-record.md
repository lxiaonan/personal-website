# 工作内容与实现记录

整理日期：2026-10-15。本文供个人网站维护、工作回顾和技术讨论使用，不参与静态网页渲染。

## 依据与归属

- 团队业务后端：D:\JavaProject\motu-data-web-server -push - 副本 - 副本 (2)
- 个人 AI 网站：D:\Desktop\aiproject\ai-tool-platform
- 团队仓库采用版本：86b2053c5f0bdbe6fc724342e37740f3bcab631f。
- AI 仓库采用版本：982124b01ca33d5dccd278079df6feb6dd5134d9。
- 个人工作按 Git author 为 LuoYuNan 的提交定位，再对照提交差异与上述版本源码。提交署名只能帮助确认参与范围，不证明每一行由个人手写，也不证明由个人独立设计整个模块。
- 两个来源仓库都有未提交修改。CodeGraph 返回当前工作区源码，因此关键描述另外用 git show HEAD:路径 核对，避免把工作区修复写成已提交功能。
- 用户使用 AI 辅助大量实现。记录需求、规则、实现及修复，不虚构手写比例、系统规模、性能收益、用户数和收入。
- 已提交不等于已上线。本次只校验个人网站，未运行来源业务测试，未连接数据库、媒体账号、模型服务商或飞书。

## 工作事项索引

| 编号 | 事项 | 个人提交依据 | 对外表述 |
| --- | --- | --- | --- |
| AD-01 | 百度 SEM、华为商店花费接入 | 4d1dd3a8、73a43fc4 | 参与渠道报表字段映射及采集入库 |
| AD-02 | B站素材关系查询限流补偿 | fd35b0b7 | 区分限流与 IO 异常，任务内有限尝试 |
| AD-03 | 投放数据权限 | 58989fa7 | 参与投放数据权限修复 |
| BC-01 | 快手、B站批创 | 03799996、03ad34da | 参与草稿展开、素材处理、媒体提交与回写 |
| BC-02 | 广点通提交状态和重提 | 455f05c0 | 增加提交中状态、优化创意重提 |
| BC-03 | 广点通预览异常详情 | fcdccde8 | 修复事务上下文混用及原始错误被覆盖 |
| BI-01 | 路径查询、下钻、分群 | 44091b04、f910529c | 参与路径 SQL、节点用户查询及完整结果写入 |
| BI-02 | 资产箱及重复开箱 | e2c578c5、2e611ab7 | 参与依赖收集、冲突复用、导入顺序与引用映射 |
| BI-03 | 数据验收 | 0a3ccfa2、78b97d3a | 参与验收记录、详情和后续优化 |
| BI-04 | CSV 主体值还原 | d8f09264 | 修复包裹引号进入 ID 标签、分群业务值 |
| BI-05 | 第三方集成 | 904d426a、ac974733 | 参与 AppLovin、Tenjin 报表及回调处理 |
| BI-06 | 事件条数差异告警 | 452586f3 | 比较两侧同名事件，分类并提供差异明细 |
| BI-07 | 多维表格导出与独立事务 | cd56e9bb、7fe59afa | 参与导出实现，修复后台读不到未提交排队记录 |
| AI-01 | Token 预扣结算 | c79dc120 | 梳理预扣上限、usage 回退及失败退款 |
| AI-02 | 持久化视频任务 | 5782aca2、fabc0cb8 | 将任务创建、提交、轮询和查询移至后端管理 |
| AI-03 | 模型与素材规则 | 5386096b、f8bfde62 | 适配视频模型并校验参考素材 |
| AI-04 | 漫剧预检、静态漫画 | 8129d070、4fac5a9c | 增加生成前错误警告与工作台 |
| AI-05 | 存储和发布修复 | d19fb267、d67ad169、6bb9a22f | 清理审计 Base64、历史重复图片及过期 chunk 恢复 |

## AD-02：B站采集与素材关系

### 场景和处理

花费任务按账号配置为广告主创建异步任务，统一等待结果。请求日期、报表层级与媒体字段在 Handler 中处理，Mapper 负责写入对应账号、广告组、创意花费。

成本采用 Math.round(chargedCostMilli / 1000.0)，从毫分转换为分。并发任务整体等待最多 30 分钟；超时抛出异常，不表示所有尚在执行的 HTTP 请求已被取消。

素材关系补齐先排除已有本地映射，再查缺失创意详情。最多 3 次调用（首次 + 最多 2 次再次调用）。限流分别等待 1、4 秒；IO 异常分别等待 1、2 秒。达到上限记录广告主与原因，跳过当前批次。

### 应复核的场景（本次未执行）

- 给定已知金额，比较媒体原值与本地分值，检查四舍五入。
- 已存在映射的素材不应再次请求详情。
- 连续限流应仅尝试 3 次；普通业务错误不应进入限流重试。
- 单广告主超时后检查任务状态，不能仅凭等待超时判定外部调用已停止。

### 限制

日志不是补跑队列；缺失素材需要继续排查和按业务对象重新处理。此处只记录源码行为，不提供吞吐量或采集完整率结论。

## BC-01 / BC-02：批创草稿与提交

### 输入、对象和输出

B站预览接收模板配置，展开并落库计划、单元和创意，返回 batchId 与预览列表。提交读取本地草稿，先上传视频，再按计划 → 单元 → 创意创建媒体对象。上游返回有效媒体 ID 后才处理下游。

每层保存媒体 ID、成功标记和原因。预览也有本地写操作；素材上传在逐对象提交之前，上传失败不一定产生完整的逐对象结果。

广点通入口位于 /media/tencent/batch，包含 /preview、/commit/{batchId}、/choose/preview 和 /choose/commit。媒体对象中 commit 与 success 含义不同：异常分支仍可能把 commit 设为 1，再把 success 设为 false，必须联合检查。

### 应复核的场景（本次未执行）

- 多广告主、多计划的草稿数量和命名、素材、标题分配。
- 预览写入失败时本地数据是否回滚。
- 计划失败时不创建单元；单元失败时不创建其创意。
- 素材上传失败与创意创建失败分别返回什么。
- 重提读取已有对象后的媒体 ID、success、reason 是否正确。
- 媒体成功、本地写入失败时是否需要人工查询，避免重复创建。

## BC-03：广点通预览事务

fcdccde8 的差异删除 catch 中的 TransactionAspectSupport.currentTransactionStatus().setRollbackOnly()，并将 choosePreview 从 Spring @Transactional 调整为 dynamic-datasource @DSTransactional。

原来可能在没有对应 Spring 本地事务时查找其上下文，另一个异常盖住预览失败原因。修复依靠实际事务注解与异常抛出处理回滚。源码中两个 catch 的异常包装形式仍有差别，记录不宣称已完成异常体系统一。

应在两类预览入口分别构造失败，检查原始错误及本地回滚。本次只审阅差异，没有执行媒体或数据库验证。

## BI-01：路径、下钻与结果分群

输入包括时间、事件、用户条件、属性拆分、会话间隔及方向。路径 SQL 构建器生成基础事件 CTE，按用户与时间切会话，使用 LEAD/LAG 展开 10 步。

节点下钻在数据权限和语义准备后构建节点用户 SQL。保存结果分群时，去掉最外层预览 LIMIT，元数据探测结果列必须为一个主体值列，再写结果表。内部子查询 LIMIT 保留，路径节点分群按项目预置 #user_id 主体处理。

应复核预览超过 1000 用户、内部子查询含 LIMIT、虚拟事件、对象属性拆分、反向路径、不同时间精度以及权限范围。本次未跑 StarRocks 查询，也未测查询耗时。

## BI-02：资产箱

接口以 /asset-box 为前缀，目录、封箱计划、确认和任务查询分开。流程是收集资产及依赖 → 封箱 → 目标预览冲突 → 确认计划 → 执行并保存明细。

Planner 用依赖图规划顺序。可复用冲突不再创建，但必须保留目标映射；丢弃的必需依赖传播到下游；可复用节点截断丢弃传播。待创建节点采用入度排序，未排序节点记为循环。

复核场景包括首次导入、重复导入、父属性复用而子属性新建、维表绑定、循环、目标分析主体和目标缺列。

工作区另有 SQL 表名与 ID 内容迁移修复，本次没有采用为已提交成果。历史数据不迁移和历史引用是否保留是两个规则，不能自行推导为需要清理原选择。

## BI-03 / BI-04：数据验收与 CSV

DataValidationServiceImpl.check 创建项目下的验收记录；executeValidation 执行，后续可查询记录和详情、写备注、导出。详情读取先检查记录归属。异步执行状态、样例字段和历史记录兼容需要分别复核。

CSV 修复从引号外的逗号切列、去掉成对包裹引号、还原转义引号、处理 BOM。需要核对前导零、字段内逗号、双写引号、单列、缺列和导出再导入。按行读取的实现不支持由一个字段跨越物理行的完整 CSV 语义；源码还有 trim，不能宣称保留所有空白字符。

## BI-06：事件条数比较

TaEventDiffComparator 先累加同名事件，取两侧事件并集，移除忽略事件。相等略过；不等时返回项目、事件、两侧数量、差值及差异类型。平台数量为 0 分为本平台缺失，数数数量为 0 分为数数缺失，其余为条数不一致。

应复核同名多行、仅一侧有事件、忽略列表、相等、双方空列表以及上游调用失败。空集合和真实零条并不是所有情况下都能互换，上游失败要单独检查。没有线上漏报、误报统计。

当前 bi/pom.xml 已将 bi-admin 和 bi-job 纳入模块。来源 AGENTS 的早期模块清单仅列 bi-admin，因此模块归属以采用版本的 POM 和源码核对。

## BI-07：导出与事务隔离

导出实现包含任务配置、查询结果转表格、目标表处理和日志。后台按 logId 读取并领取排队记录，记录必须先对后台连接可见。

7fe59afa 将日志写入器置于独立 Bean，startRun / finishRun 使用 @DSTransactional + DsPropagation.REQUIRES_NEW，挂起同一框架外层 XID。Spring REQUIRES_NEW 无法替代这个挂起动作。

应复核外层未提交、外层回滚、后台独立连接查询、重复触发、活动记录过期及终态更新。本次只验证文案依据，未连接飞书、Nacos、MySQL 或 StarRocks。

## AI-01：Token 结算

请求依据能力与 modelId 加载配置，按估算输入和最大输出预扣。成功有 usage 时按费率计算，并使用 min(actualCost, initialCost) 限制结算上限；usage 为 null 则使用 fallbackCostCredits。服务商失败走关联交易退款。

CreditService 对交易和余额行加锁，退款遇到 REFUNDED 直接返回。输入估算以文本长度、图片等规则计算，无法当成精确 tokenizer。

已有 AiRequestServiceTest 包含：
- chatUsageSettlesCreditsFromProviderTokenUsage
- chatUsagePrechargeBlocksBeforeProviderWhenCeilingExceedsBalance
- chatUsageAbovePrechargeCeilingIsCappedButStillReturnsResult
- chatUsageBillingFallsBackToFixedCostWhenProviderUsageMissing
- providerFailureRefundsCreditsAndLogsRefunded
- ledgerSumMatchesBalanceAfterAiSuccessAndRefund

这些名称核对自采用版本；本次未重新执行，不能写成“本轮测试全部通过”。

## AI-02：视频任务

/api/ai/jobs 提供创建、列表、详情、活动数量和取消。任务以用户和 requestId 查重；执行依次涉及 PENDING、SUBMITTING、PROVIDER_PROCESSING 与成功或失败终态。待提交任务可取消并退款。

Dispatcher 把文生视频提交、图生视频提交和轮询分配到相应工作线程及槽位，使用租约领取。旧租约不得覆盖新线程结果。已提交版本的队列能力是视频，后续工作区异步图像改动未纳入本文。

已有 GenerationJobServiceTest 覆盖重复请求、用户数量限制、取消退款、用户隔离、领取公平性、失败退款、旧轮询租约、禁用模型后的任务处理。外部受理到本地落任务 ID 之间仍有窗口，本地持久化不保证服务商端 exactly-once。

## AI-04 / AI-05：预检与维护

漫剧 review 校验项目、jobType 与分镜列表，拒绝重复 ID，检查分镜归属，汇总 ERROR / WARNING，返回 errorCount == 0 的可继续标记。它是当前生成输入检查，不能代替内容质量验收。

静态漫画工作台以 4fac5a9c 为已提交依据。页面布局、并发与导出扩展存在工作区修改，不能提前记录发布收益。

审计 Base64 清理、本地历史去重和 chunk 恢复各有独立修复提交。生成内容、浏览器历史与后端任务元数据分别保存，不能概括成全量后端素材备份。

## 后续记录模板

每次功能或修复保留以下内容：

1. 发生在什么业务动作，现象和可复现输入是什么。
2. 自己负责哪部分，相关模块和调用入口。
3. 输入字段、对象关系、状态与外部调用顺序。
4. 关键取舍及失败分支，修复前后行为。
5. 提交版本、源码位置、已有文档或测试。
6. 本次实际执行了什么验证、观察到什么；尚未验证什么。
7. 仅在有测量方法、样本和结果时记录性能或业务收益。

避免单独写“提升稳定性”“形成闭环”“具备链路思维”。例如将“提升异步导出稳定性”改成“独立提交排队记录后再投递后台，修复后台读不到记录导致任务一直 QUEUED”。

## 本轮操作纠错

- Windows cmd 的 Python 内联命令遇到引号解析失败，改用 Node 文件 API 和参数数组执行子进程，文本显式 UTF-8。
- CodeGraph 最初查询符号不够精确，输出过宽；后续用真实文件名、限制输出，并通过指定 Git 版本复核关键段落。
- 批量补丁同时删除和新增同一路径被校验拒绝，未修改文件；改为 UTF-8 文件写入，并保留本轮开始前内容用于比较。

## 已提交版本源码索引

以下行号对应上文采用的 Git 版本，工作区后续编辑可能使行号移动。

| 仓库 | 文件 | 行号 | 定位内容 |
| --- | --- | --- | --- |
| 团队后端 | bi/bi-admin/src/main/java/com/motu/daas/bi/admin/service/analyze/compiler/planner/trace/TraceAnalysisSqlBuilder.java | 96 | public TraceAnalysisPlan build |
| 团队后端 | bi/bi-admin/src/main/java/com/motu/daas/bi/admin/service/analyze/executor/TraceAnalysisExecutor.java | 209 | public Map<String, Object> drill |
| 团队后端 | bi/bi-admin/src/main/java/com/motu/daas/bi/admin/service/user/impl/UserGroupServiceImpl.java | 701 | private Long traceNodeResultGroup |
| 团队后端 | bi/bi-admin/src/main/java/com/motu/daas/bi/admin/service/assetbox/AssetBoxUnboxPlanner.java | 33 | public Plan plan |
| 团队后端 | bi/bi-admin/src/main/java/com/motu/daas/bi/admin/controller/assetbox/AssetBoxController.java | 39 | @RequestMapping |
| 团队后端 | bi/bi-admin/src/main/java/com/motu/daas/bi/admin/service/conf/impl/DataValidationServiceImpl.java | 141 | public DataValidationResultVO check |
| 团队后端 | bi/bi-admin/src/main/java/com/motu/daas/bi/admin/service/user/support/IdCsvFieldSupport.java | 24 | public static String firstColumn |
| 团队后端 | bi/bi-job/src/main/java/com/motu/daas/bi/job/service/alert/TaEventDiffComparator.java | 37 | public static Comparison compare |
| 团队后端 | bi/bi-admin/src/main/java/com/motu/daas/bi/admin/service/analyze/export/AnalyzeBitableExportLogWriter.java | 54 | public void startRun |
| 团队后端 | ad/ad-job/src/main/java/com/motu/daas/ad/job/service/impl/BilibiliMediaHandler.java | 97 | allTasks.get |
| 团队后端 | ad/ad-admin/src/main/java/com/motu/daas/ad/admin/service/media/bilibili/impl/MediaBilibiliBatchCreateServiceImpl.java | 112 | public BilibiliBatchCreateCommitView commit |
| 团队后端 | ad/ad-admin/src/main/java/com/motu/daas/ad/admin/service/media/tencent/impl/MediaTencentBatchCreateServiceImpl.java | 499 | public BatchTencentCreatePreviewView choosePreview |
| 个人 AI | backend/src/main/java/com/apertureai/ai/AiRequestService.java | 708 | private BillingResult settleBilling |
| 个人 AI | backend/src/main/java/com/apertureai/credit/CreditService.java | 111 | public TransactionResult settleAiCharge |
| 个人 AI | backend/src/main/java/com/apertureai/ai/GenerationJobService.java | 67 | public GenerationJobResponse create |
| 个人 AI | backend/src/main/java/com/apertureai/ai/GenerationJobDispatcher.java | 70 | public void dispatchSubmissions |
| 个人 AI | backend/src/main/java/com/apertureai/comicdrama/ComicDramaService.java | 424 | public ReviewResponse review |

## 本轮交付验证

Astro 内容及类型检查通过（28 个文件，0 errors / warnings / hints），构建 30 页。761 个站内路径与锚点可解析。首页、关于、项目列表、四个项目详情和 AI 协作记录共 8 页，在桌面、390px、320px 下检查了 24 个视图，无页面横向溢出。来源项目已有测试仅核对场景，未在本轮重跑。
