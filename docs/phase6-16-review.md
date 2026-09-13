# Phase 6–16 独立质量审查

审查日期：2026-09-12。Reviewer：独立 reviewer 子任务。评审依据为用户提供的 Master Goal 与 QUALITY_GATE。用户明确允许并行，并免除手机端设计与验收；桌面、键盘和 Reduced Motion 仍在范围内。

## 评审边界与证据

本报告逐章核对教学数据、核心可视化、交互门槛、情境挑战、可访问性实现和自动化测试，并向各 Builder 发出问题，修复后重新读取代码。应用没有被连接到真实模型、检索服务、MCP Server 或数据库；课程演示均有明确标识。

Reviewer 受主任务委派实现了新版存储基础设施，因此本报告**不自评该存储实现为通过**；存储代码由主任务独立复审。存储测试覆盖成果与解锁原子同步、旧版本迁移、损坏记录清洗、迟到回调、重温与旧章状态隔离。

下列分数是代码与教学内容审查分数，不伪称真人学习实验结果。最终章节 Gate 还须结合主任务记录的全量 Build、Lint、Test 及桌面浏览器证据。手机端不作为未通过项。

| Phase | Knowledge /25 | Beginner /20 | Progression /15 | Discoverability /15 | Visualization /10 | Engineering /10 | Consistency /5 | Total /100 | 代码/内容复审 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 6 Agent Loop | 25 | 18 | 14 | 14 | 9 | 9 | 5 | 94 | PASS |
| 7 Harness | 25 | 18 | 14 | 14 | 8 | 9 | 5 | 93 | PASS |
| 8 RAG | 25 | 18 | 14 | 14 | 9 | 9 | 5 | 94 | PASS，原 MAJOR 已关闭 |
| 9 Memory | 25 | 19 | 14 | 14 | 9 | 9 | 5 | 95 | PASS |
| 10 MCP | 25 | 18 | 14 | 14 | 9 | 9 | 5 | 94 | PASS |
| 11 Workflow vs Agent | 25 | 18 | 14 | 14 | 9 | 9 | 5 | 94 | PASS，原 MAJOR 已关闭 |
| 12 Multi-Agent | 25 | 19 | 14 | 14 | 9 | 9 | 5 | 95 | PASS |
| 13 Verification / Eval | 25 | 19 | 14 | 14 | 9 | 9 | 5 | 95 | PASS，原 MAJOR 已关闭 |
| 14 Guardrail / HITL | 25 | 19 | 14 | 14 | 9 | 9 | 5 | 95 | PASS，原 MINOR 已关闭 |
| 15 Compaction | 25 | 19 | 14 | 14 | 9 | 9 | 5 | 95 | PASS |
| 16 Final System Map | 25 | 19 | 14 | 14 | 9 | 9 | 5 | 95 | PASS，原 MAJOR 已关闭 |

## Phase 6 — Agent Loop / ReAct

- Learning Outcome：面对只有论坛转载的工具结果，能找出来源缺口，继续行动；单次检查通过不代表整份任务完成。
- BLOCKER：无。
- MAJOR：无。
- MINOR：首轮缺少页面隐藏暂停、自动播放清理和 Reduced Motion 测试；闭环方向欠明确。现已增加 visibilitychange 暂停、SVG 方向箭头，并补齐自动播放、卸载定时器清理及减少动态效果下手动完成测试，关闭。
- SUGGESTION：后续可增加“不值得继续时停止”的预算情境；现有正文已经说明步数、预算与停止条件，不是缺失主流程。
- Re-check：两轮 Observe / Reason / Plan / Act / Observe / Verify 顺序明确，第一次失败改变第二轮来源策略。ReAct 是经典思想之一，界面判断摘要不冒充隐藏推理。末步需手动确认，自动播放不能自动授予章节完成。
- Files：`src/features/agent-loop/data.ts`、`Visual.tsx`、`agent-loop.css`、`Visual.test.tsx`。
- Tests：4 项核心互动及动画生命周期测试；全部章节还使用共同的步骤与挑战门禁。
- Hard Fail：代码与知识层未发现；最终桌面结果由主任务记录。

## Phase 7 — Harness

- Learning Outcome：区分模型判断与运行层职责，并理解权限拒绝和可重试的只读超时需要不同处理。
- BLOCKER：无。
- MAJOR：无。
- MINOR：11 个模块同时展开信息密度较高；桌面检查应重点确认 1280 视口的模块名称和输入/输出详情。没有据代码猜测实际溢出。
- SUGGESTION：可进一步为模块详情增加显式标题关联；现有按钮支持 Tab / Enter、选中态和实时详情。
- Re-check：拆盖→全部 11 模块→两条失败路径→系统关系。Timeout 不保证远端取消、Retry 需考虑副作用、Trace 不等于隐藏推理、Eval 不一定每轮执行，均表述准确。
- Files：`src/features/harness/` 中教学数据、Visual、样式和测试。
- Tests：要求逐一查看 11 模块；要求比较超时与权限拒绝后才完成。
- Hard Fail：代码与知识层未发现。

## Phase 8 — RAG

- Learning Outcome：从任务问题形成 Query，经 1000 文档→20 候选→5 片段的检索、重排与 Context 注入，再看到基于证据的回答。
- BLOCKER：无。
- MAJOR：首轮末按钮“交给模型生成有依据的回答”只记录互动完成，没有生成阶段的可见结果。Builder 已新增 Model → Answer 第五帧，引用五段示例资料的出处，并要求看过回答后再次确认才完成。复核关闭。
- MINOR：Embedding 复习缺返回 Model Inside 的入口，重排缺视觉追踪；已增加回链与短过渡，Reduced Motion 下禁用过渡，关闭。
- SUGGESTION：真实接入检索后，可用同一问题的不同资料质量做更丰富的比较；本任务不需要联网检索。
- Re-check：Rerank 使用同一组候选，未凭空添加证据。所有计数和片段均标注示意。RAG 不等于训练、不等于 Memory；向量库也不是所有 RAG 的强制依赖。关键词检索对比注明是简化字面规则，避免把实际关键词系统描述成只能精确匹配。
- Files：`src/features/rag/`。
- Tests：验证 20 个候选、重排次序、5 个片段、Model 回答出现且不提前完成；语义比较须实际切换。
- Hard Fail：原流程缺口修复后未发现。

## Phase 9 — Memory

- Learning Outcome：跨任务保存→新 Task Context 中暂不可见→检索→选入 Context，并区分时间范围与内容类型两种记忆分类。
- BLOCKER：无。
- MAJOR：无。
- MINOR：未发现阻碍当前范围的问题。
- SUGGESTION：可增加过期偏好更新的案例；当前写入、取回与选入三个关键边界已完整。
- Re-check：不保存偏好时会明确提示无法凭空恢复，并提供返回 Task 1 的补救入口。保存的两条信息中仅相关偏好加入新 Context。Context、Memory、RAG 三情境比较均需正确；短期/长期与 Episodic/Semantic 不被当作互斥四类。
- Files：`src/features/memory/`。
- Tests：保存区与当前 Context 分离；未保存信息检索失败且可返回修正。
- Hard Fail：代码与知识层未发现。

## Phase 10 — MCP

- Learning Outcome：同一 Agent 经 Client / 协议 / Server 使用 GitHub、Database、Slack 示例能力，区分发现、请求、结果及传输方式。
- BLOCKER：无。
- MAJOR：无。
- MINOR：服务按钮的拼接朗读名称已由 Builder 增加明确 aria-label，关闭。
- SUGGESTION：可在扩展内容中加入更多能力协商场景；当前已明确 Server 不必提供所有能力。
- Re-check：三服务必须分别模拟读取，发现工具不会立即显示已执行结果。Tool、Resource、Prompt 和 Transport 都有独立可点击内容。MCP 中的 Prompt 明确是提示模板，与基础章 Prompt 作为 Context 组成部分的定义不冲突。stdio 与 Streamable HTTP 准确，协议不自动授予业务权限。
- Files：`src/features/mcp/`。
- Tests：三服务调用结果和完成门槛；三类能力及 Transport 比较门槛。
- Hard Fail：代码与知识层未发现。

## Phase 11 — Workflow vs Agent

- Learning Outcome：固定路径中的条件/异常分支仍由程序预定义；模型依据观察选择行动才是本章强调的动态决策。
- BLOCKER：无。
- MAJOR：初版备用 PDF 节点放在 D“写入报告”之后，并被向下箭头连接，错误地表示先写报告再补资料。已改为 A 失败→读取本地 PDF→B 提取参数→C→D；测试断言列表顺序。复核关闭。
- MINOR：未发现剩余阻碍问题。
- SUGGESTION：后续可让同一异常提供多个程序预定义分支，展示更复杂规则；当前单分支已经足以建立区别。
- Re-check：制造异常后，Agent 一侧必须选择能补充来源的动作；运行代码并不解决本场景来源缺口。Workflow 可包含循环，因此不把全部 Workflow 都称为 DAG。Deterministic 明确指此例的路径规则，不保证 LLM 输出相同。
- Files：`src/features/workflow-agent/`。
- Tests：异常前动作不可选、无效动作不完成、有效改道；备用分支顺序。
- Hard Fail：错误图序已修复，代码与知识层未发现剩余项。

## Phase 12 — Multi-Agent

- Learning Outcome：清楚说明 Agent-as-Tool 的结果回传和 Handoff 的后续控制权转移，以及它们所需的任务包与 Context 边界。
- BLOCKER：无。
- MAJOR：无。
- MINOR：未发现阻碍当前范围的问题。
- SUGGESTION：可在高级内容添加并发子任务的合并冲突；本章目前聚焦两种控制方式，范围清楚。
- Re-check：Agent-as-Tool 等待子任务结果后 Manager 恢复；Handoff 则让 Data Agent 接手，未来是否返回取决于策略。没有声称子 Agent 必须使用不同模型，也没有声称默认共享全部历史。角色数量成本与验证责任有明确说明。
- Files：`src/features/multi-agent/`。
- Tests：委派后不提前完成、结果返回后完成；控制权转交后接手者继续行动。
- Hard Fail：代码与知识层未发现。

## Phase 13 — Verification / Eval

- Learning Outcome：对照 400 W = 0.4 kW 的可检查条件发现错误，读报错、修复、重测，再检查完整需求。
- BLOCKER：无。
- MAJOR：首轮 UI 的 TEST PASS 标签由步骤编号硬编码，未用已计算的 `check.passed` 决定成功。已改为断言失败时展示 TEST FAIL、返回修复并阻止需求/DONE；新增强制让重测失败的 UI 测试。复核关闭。
- MINOR：未发现剩余阻碍问题。
- SUGGESTION：真实测试接入应让测试输出和退出码共同提供证据；当前浏览器断言固定示例已经明确标注能力边界。
- Re-check：单元测试只覆盖被测条件，后续仍需来源与任务要求检查；模型评分可能偏差，Critic 不自动等于最终裁判，单样例不代表 Benchmark 表现。验证失败回流和通过出口两分支均需查看。
- Files：`src/features/verification/`。
- Tests：完整 FAIL→修复→PASS→需求检查；真实数值函数；强制第二次测试仍失败时不能完成并可再次修复。
- Hard Fail：虚假通过风险已关闭；代码与知识层未发现剩余项。

## Phase 14 — Guardrail / Human in the Loop

- Learning Outcome：高风险 Tool Call 停在执行前，查看具体目标、影响和替代方案后手动选择批准或拒绝；批准与验证职责不同。
- BLOCKER：无。
- MAJOR：无。
- MINOR：初版审批后仍显示“等待风险检查 / 等待批准”，与结果反馈不一致。现已依据 checked / decision 更新顶部、风险标签与当前状态，复核关闭。
- SUGGESTION：可在技术解释补充审批有效期的具体案例；正文已包含审批绑定动作、参数和有效期的规则。
- Re-check：Approve / Reject 均为有效选择，均只更改教学状态；拒绝后不允许换工具绕过。Input / Tool / Output Guardrail 分处不同位置，最终输出检查不能撤销早先危险动作。批准不等于执行成功或内容正确。
- Files：`src/features/guardrail/`。
- Tests：风险检查前没有审批按钮；两个决策路径均有效且不发起 fetch；拒绝后绕过操作不授予完成。
- Hard Fail：代码与知识层未发现。

## Phase 15 — Compaction / Long-running Agent

- Learning Outcome：看到 Context 占用增长与压缩，能保留六项关键状态并依据接续记录继续未完成的单位核验。
- BLOCKER：无。
- MAJOR：无。
- MINOR：未发现阻碍当前范围的问题。
- SUGGESTION：后续可加入摘要遗漏证据的恢复案例；当前选择题已经检查丢失 Key Evidence 时不能通过。
- Re-check：40%→70%→90%→35% 为标明的教学容量，不承诺真实压缩率。Memory 位于独立区域，压缩不删除它。六项字段分别覆盖 Goal、Current State、Key Decisions、Failures、TODO、Key Evidence；旧工具全文只有已保留必要事实和引用后才能移出。恢复后仍继续待办，没有把压缩成功当成研究完成。
- Files：`src/features/compaction/`。
- Tests：容量变化与 Memory 不变、读摘要后才完成；缺证据不能通过，六字段完整才通过。
- Hard Fail：代码与知识层未发现。

## Phase 16 — Final System Map / Knowledge Graph

- Learning Outcome：从 USER→MODEL→ANSWER 展开全系统；跟随 12 个事件；查询概念关系；完成职责匹配和 12 个综合任务情境。
- BLOCKER：未发现知识 Hard Fail。
- MAJOR：首轮 TaskWalkthrough 的 `activeNode` 始终覆盖手动 selected，导致图中节点虽然提示可点，却不改变详情。现以事件节点初始化 selected，手动选中决定详情；TaskWalkthrough 的每个事件使用不同 key，切换事件时恢复该事件默认焦点。已独立读取修复，关闭。
- MAJOR：节点与术语详情原先只有泛指“重新学习这一章”的链接，没有显式所属章节；现均显示 Phase 与章名，并保留直接回链。复核关闭。
- MINOR：搜索 User / Router 时 results 非空但四个分组均空白；现检索只统计四个可显示分组，零匹配呈现清楚空态。复核关闭。
- SUGGESTION：核心术语直接查询建议已采纳，新增 ReAct、Workflow、Multi-Agent、Agent-as-Tool、MCP Client / Server、Resource、MCP Prompt、Transport、Context Window、Checkpoint、Retrieved Context 共 12 个概念。
- Re-check：修复后代码与知识层通过。综合挑战覆盖 Context、Memory、RAG、File Tool、谁执行工具、Harness、MCP、Loop、Verification、Human Approval、Compaction 和两种委派模式。答案位置交替，不只要求背定义。新增概念的依赖均指向已有概念，MCP Prompt 的特殊含义没有覆盖一般 Prompt。
- Files：`src/features/final-system-map/`。
- Tests：共享课程集成测试实际完成 Final System Map 的展开、四关键节点、12 个事件、四类术语、职责匹配与 12 题毕业挑战；注册表测试检查悬空节点、依赖与回链。
- Hard Fail：代码与知识层未发现剩余项；桌面浏览器中实际节点点击、尺寸与焦点表现由主任务完成最终复核。

## 三章批次 Architecture / Knowledge Consistency Review

### Phase 6–8

Feature 独立，教学数据与可视化分离；统一 Shell、步骤导航、术语和情境挑战负责教学流程，局部演示只报告当前步骤完成。没有新增 3D 场景、没有场景控制路由。Agent Loop 定时器和可见性监听有清理；RAG 排序动画支持 Reduced Motion。

一致性通过：Model 提出 Tool Call，Harness 执行，Observation 经 Context 成为后续决策输入；RAG 为 Context 提供外部证据，没有改写模型参数的说法。旧章复习以一句责任边界承接，未重新复制 Tools 完整课程。

### Phase 9–11

Memory 演示仓库是局部模拟状态，不复用学习进度存储；MCP 示例没有发真实请求；Workflow 的异常和分支局限在本章局部状态。共享 UI 没有被各章重复实现，CSS 使用章节前缀。

一致性通过：Memory 的保存与当前 Context 可见性不同；Memory 与 RAG 可以共享检索技术。MCP 负责协议，Tool 负责能力，Prompt 在 MCP 语境中明确为可复用模板。Workflow 可以有复杂条件和重试，关键差别是决策来源，不把 Workflow 与 Agent 等价或把前者说成必然僵死。

### Phase 12–14

多 Agent 的任务包、验证实验和审批选择均为局部状态。验证结果使用可测试的纯函数并约束后续状态；审批选择不调用真实服务。没有引入全局协作角色或审批状态。

一致性通过：Handoff 与 Agent-as-Tool 的返回责任不同；子 Agent 的结果仍需 Verification。权限与批准解决能不能做，验证解决是否符合要求；模型主观自检不能代替可检查证据。

### Phase 15–16

Compaction 使用容量与信息选择表现过程，不新增 Canvas。Final System Map 由 concepts / systemRows / edges 数据驱动，位置基于行列派生，未堆积逐节点坐标。图、详情、术语探索、任务轨迹与职责匹配分开，教学主流程仍由公共 Shell 管理。

一致性复核通过：Compaction 整理历史 Context，不删除长期 Memory；完整图保留 Context→Model、请求→Harness、Observation→Context、Verifier→Loop / Final。最终图的首轮节点交互和所属章节显示问题均已修复，新加入的核心术语与所属课程定义一致。该批代码/内容 Architecture Review PASS。

## 工程与回归证据记录

- Reviewer 已独立运行存储测试：4 文件、77 测试通过；此结果不能替代主任务对 Reviewer 所写存储代码的独立审查。
- Reviewer 曾独立运行 TypeScript `--noEmit` 与存储相关 ESLint，均通过。
- Phase 8 Builder 修复后核心测试通过。Phase 11 / 13 / 14 修复后 Builder 报告 3 个文件、8 测试通过，Build / Lint 通过；Reviewer 已重新读取修复与新增测试。
- 新章到齐后，Reviewer 独立执行 Phase 6–15 feature 测试与全部 stores 测试：**14 文件、101 测试通过**，耗时 26.79 秒。存储通关用例实际遍历已到齐的 Phase 6–16 全部 11 个章节，验证顺序解锁和各章全部术语获得。
- 主任务报告最终整合自动检查：**Full Build PASS、Full Lint PASS、36 文件 / 236 测试 PASS**。Reviewer 已读取其中课程集成测试与注册表一致性测试，确认不是仅检查组件能够挂载。
- Phase 16 修复后 Reviewer 独立重跑 `src/features/curriculum`：**2 文件、4 测试通过**，耗时 29.46 秒，包括 Agent Loop 与 Final 的真实交互集成流程、全章节契约与图依赖校验。
- 最终全产品检查及桌面浏览器报告由主任务记录，不将 RTL / Vitest 伪称真实浏览器 E2E。

## 审查结论

Phase 6–16 的知识准确性、数据真实性标识、代码中的主交互路径与架构边界均通过独立复审；已发现的 5 项 MAJOR（RAG 生成尾帧、Workflow 异常图序、Verification 真实门禁、Final 图点击、Final 所属章节显示）均已修复，没有遗留 BLOCKER / MAJOR。各章分数均大于 85，知识准确性均为 25/25，可发现性均为 14/15。

本报告支持进入最终桌面产品验收。真实浏览器的完整结果、旧章视觉回归、最终存储独立审查与项目 Gate 签发由主任务补齐；不能把本报告中的静态评分单独当作“所有用户都已学会”的证据。
