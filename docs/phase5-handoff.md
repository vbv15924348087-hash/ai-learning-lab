# Phase 5 · Tools / Function Calling 交付说明

交付日期：2026-09-12。多个并行子任务回到主任务整合。按用户最新要求，本阶段只交付桌面端。构建、测试及浏览器验收的具体证据见第 14 节。

## 1. 本阶段实现内容

新增「04 Tools / Function Calling」正式课程，延续“帮我查 NVIDIA 最新的 AI GPU，并简单告诉我它是什么”的主案例。用户先遇到最新信息的能力边界，再选择工具、生成结构化请求、查看工具说明书，最后跟随 Harness 执行和结果回到 Context 的完整过程。

课程反复强化同一条责任边界：Model 决定做什么；Harness 验证并执行请求；Tool 返回资料；Model 根据更新的 Context 继续处理。所有工具、请求和结果都是教学模拟。

保留现有首页、14 章学习地图、导航、LessonLayout 路由结构、设计 Token、学习状态及 Phase 2–4 已有课程。沿用 ProgressIndicator、MisconceptionCard、已有课程工作区与测验样式，以及 Interaction Hint / Deep Dive 的明显入口规范。新增部分使用 HTML、SVG 与 CSS。

## 2. 修改文件

新增功能目录：`src/features/tools-lesson/`。

| 文件或目录                                           | 用途                                         |
| ---------------------------------------------------- | -------------------------------------------- |
| `ToolsLesson.tsx`、`tools-lesson.css`                | 课程组合、双列工作区、导航、完成页           |
| `types.ts`                                           | 步骤、互动、术语与进度协议                   |
| `data/toolsLessonSteps.ts`                           | 十步课程的标题、解释、操作提示与下一步文案   |
| `data/toolDefinitions.ts`、`data/toolTasks.ts`       | 六种工具、三种可构建调用和三道匹配任务       |
| `data/toolExecutionSteps.ts`                         | 七阶段执行流程、数据卡与解释                 |
| `data/toolsTerms.ts`、`data/toolsMisconceptions.ts`  | 五术语的三层说明、五个常见误区               |
| `hooks/useToolsLesson.ts`                            | 课程步骤、前进门槛、完成回调及重温           |
| `hooks/useToolExecution.ts`                          | 执行演示的前后切换、播放、暂停与重启         |
| `components/`、`tools-widgets.css`、`tools-flow.css` | 互动组件及 2D 流程视觉                       |
| `ToolsLesson.test.tsx`、两个 hook 测试、两组组件测试 | 完整通关与关键交互验证                       |
| `src/stores/toolsProgress.test.ts`                   | 独立状态、迁移、损坏存档修复、完成与解锁验证 |

现有接入点为 `src/pages/Lesson/LessonPage.tsx`、`src/content/lessons/index.ts`、`src/types/learning.ts`、`src/stores/learningStore.ts`。学习地图的开放说明与相应测试同步到四章；`src/features/model-inside/ModelInsideLesson.tsx` 将下一站说明改为 Tools 已开放。课程注册表测试、应用回归测试与既有存储测试随发布状态更新。

`start-local.ps1` 的默认打开地址改为 `/lesson/tools`，继续由 `打开学习实验室.cmd` 调用。项目说明更新于 `README.md` 与本文档。

## 3. 新增组件

| 组件                                                             | 用户可见的作用                                       |
| ---------------------------------------------------------------- | ---------------------------------------------------- |
| `ToolBoundary`                                                   | 判断直接回答还是使用外部能力                         |
| `ToolShelf`、`ToolMatchingChallenge`                             | 选择六种工具，为三个任务匹配工具                     |
| `ToolCallInspector`                                              | 自然语言转换成 JSON，点击字段检查含义                |
| `ToolCallBuilder`                                                | 选择工具、填写参数、生成本次请求                     |
| `ToolSchemaPanel`、`ToolConceptCompare`                          | 展开说明书，比较能力、说明书与本次请求               |
| `ToolExecutionCheckpoint`                                        | 暂停确认“有了请求，搜索是否已经发生”                 |
| `ToolExecutionFlow`                                              | 七阶段往返演示与同步解释                             |
| `ToolResultCard`                                                 | 将模拟结果加入 Context，再显示模型处理               |
| `ToolsFlowSummary`                                               | 展示 Schema → Model 与请求、执行、结果回流的完整关系 |
| `ToolsStepExplanation`、`ToolsTerminology`、`ToolsMiniChallenge` | 右侧解释、术语解锁与四道情境挑战                     |
| `ToolsWidgetUI`                                                  | 复用工具卡、教学模拟标识、交互提示与反馈             |

## 4. Tools Lesson Flow

| 步骤            | 用户操作与理解目标                                   |
| --------------- | ---------------------------------------------------- |
| 01 能力边界     | 选择“使用 Tool”，理解已有知识无法保证今天最新        |
| 02 工具架       | 为 NVIDIA 最新信息任务选择 Web Search                |
| 03 工具匹配     | 依次完成查最新、算乘法、读 PDF 三个任务              |
| 04 结构化请求   | 把一句话转换为 Tool Call，分别检查 `tool` 与 `query` |
| 05 使用说明书   | 展开 Tool Schema，对比说明书和本次请求并确认理解     |
| 06 亲手构建     | 选择工具、填入参数，生成搜索 Tool Call               |
| 07 执行判断     | 回答“还没有”，看到 Harness 才负责真正执行            |
| 08 完整往返     | 走完七阶段执行流程，跟踪请求与结果                   |
| 09 返回 Context | 将 Tool Result 加入 Context，看到模型继续组织回答    |
| 10 总结与挑战   | 回顾系统图、五个误区，完成四道情境判断               |

前九步各有实际互动门槛。页面通过 `useToolsLesson` 控制课程顺序，互动组件只报告完成；流程动画只控制本步骤内的演示。抵达总结还不会直接授予完成状态，需要全部互动和四题挑战通过。

## 5. Tool Selector

工具架包括 Web Search、Read File、Run Code、Database、Browser、API。每张工具卡都有 Lucide 图标、用途、一句“点击选择 →”提示、pointer、hover、键盘 focus 与明确选中状态。首次进入 Web Search 卡有一次轻微提示动画。

选择不适合当前任务的工具时，页面解释它适合做什么，以及为什么本次查询更适合 Web Search。不会把 Browser、API 描述为在所有情况下都无法搜索。

工具匹配共三题，正确答案依次为 Web Search、Run Code、Read File。错误选择可重新尝试；答对后先阅读原因，再进入下一题。第三题之后点击“完成工具匹配”才记录完成。

## 6. Function Call Builder

初始不选工具，参数也不预填。三个工具均可操作：`web_search(query)`、`run_code(code)`、`read_file(file_id)`。选择后显示对应参数标签、说明和空输入框，并提供“填入示例”按钮。

未选择工具或参数为空时给出明确反馈；错误字段通过 `aria-invalid` 和 `aria-describedby` 关联提示。输入通过 `JSON.stringify` 展示为结构化请求，包含引号等字符时也能正确转义。

用 Run Code 或 Read File 可以生成相应示意请求，但会解释它与本次最新信息任务的区别，不会授予本步完成。选择 Web Search 并填写非空参数后，生成搜索请求并确认一次 Function Calling 已完成。组件不执行代码、不读取文件，也不触发搜索。

## 7. Tool Schema / Tool Call 对比

自然语言拆解器先显示“帮我搜索 NVIDIA 最新 AI GPU”，点击“转换成 Tool Call”才出现 JSON 示意。分别点击 `tool` 和 `query`，查看工具名称与调用参数的含义；两个字段均查看后记录完成。

Schema 入口使用完整提示：“深入一点：为什么模型知道 Tool 需要哪些参数？ →”。展开后展示 Tool Name、Description、Arguments，以及 `query: string` 的人话解释。对比卡同时呈现 Tool 是外部能力、Schema 是使用说明书、Call 是本次填入具体参数的请求。用户确认这一区别后完成本步。

“查看技术解释 →”提供可选 JSON Schema 示例。Arguments、Parameters 作为辅助说明出现，不计入核心术语进度；Structured Output 不额外设为本章学习门槛。

## 8. Tool Execution Flow

执行流程采用七节点 2D SVG，路径从上排请求方向走向下排返回方向：

```text
Model 决定 → Tool Call → Harness → Web Search
                                      ↓
Model 继续 ← Context ← Tool Result
```

七阶段依次是：模型决定使用工具；模型生成请求；Harness 接收与检查；Harness 调用 Web Search；搜索返回 Tool Result；结果加入 Context；模型读取结果并继续回答。

每一阶段同步高亮节点、连线、沿路径移动的数据卡和右侧“现在发生了什么”说明。数据卡文字从决定、请求、参数切换到结果、资料，帮助用户区分传递的内容。

支持上一步、明确命名的下一步、自动演示、暂停和从头演示。自动演示间隔 2.8 秒，到最后一步停止；页面隐藏时暂停，组件卸载时清理定时器。流程完成回调仅在用户实际推进或播放至末步之后产生，不控制主课程的自动跳转。

## 9. Tool Result → Context

工具结果卡使用虚构的 NVIDIA“示例 GPU A”，明确标注“虚构数据 · 教学模拟”“课程内置模拟资料（无真实网页）”，并说明不代表 NVIDIA 当前或最新产品。卡片包含来源、标题和相关内容。

用户点击“试试看：把 Tool Result 加入 Context”后，结果进入本次可见资料，与原始问题并列；随后显示 Model 读取新资料并组织出的教学回答。这个动作同时解锁 Tool Result。

总图和完成页保留 Tool Schema 指向 Model 的关系，以及 Model → Tool Call → Harness → Tool → Tool Result → Context → Model 的返回路径。模型看见工具结果的前提是结果进入本次 Context。

## 10. Terminology Unlock

核心术语只有 Tool、Function Calling、Tool Call、Tool Schema、Tool Result。每个术语包含人话、准确定义、技术补充三个层次。

选择正确的搜索工具后解锁 Tool；转换请求并检查两个字段后解锁 Function Calling 和 Tool Call；阅读并确认说明书后解锁 Tool Schema；将结果加入 Context 后解锁 Tool Result。术语依据真实互动成果派生，单纯前进步骤不制造已学成果。

完成挑战前展示五个常见误区：模型自己上网、请求等于执行、说明书等于本次请求、结果直接成为答案、模型能任意调用未提供的工具。挑战分别检验读 PDF、Harness 执行、结果返回 Context，以及工具说明的识别。

## 11. Interaction Discoverability

每步提供“试试看”的明确动作和具名下一步。未完成互动时，下一步禁用并显示原因。工具卡显示选择 CTA，字段显示点击提示，参数输入提供标签和示例，Schema 使用独立展开按钮。深入入口沿用“深入一点 →”“查看技术解释 →”。

工具卡、字段、输入、单选题和所有控制按钮可用键盘操作。错误挑战提交后聚焦首个未通过的问题，并提供解释。流程有 SVG 可访问名称、当前阶段文字和同步解释，用户无需依赖动画位置来理解顺序。

## 12. Learning State 更新

Zustand 持久化格式升级为 v5，存储键仍为 `ai-learning-lab:learning`。新增 `toolsProgress`，保存当前步骤、最远步骤、九项互动成果、已解锁术语、抵达总结与挑战通过状态。兼容 v1–v4 已有进度，旧存档不会凭空产生 Tools 完成记录。

存档恢复时规范化步骤与互动字段，修复损坏位置、重复互动及无依据术语。缺少必要互动、未抵达总结或挑战未通过时，不能把 Tools 标为已完成。重复完成保持幂等。

四章课程正式开放，14 章地图结构保留。完成 Tools 后显示 Completed 并解锁 05 Agent Loop 的预览，由用户自行进入。重温将步骤回到开头，保留已学互动、术语与挑战成果；已完成章节进度仍为 100%。刷新恢复章节位置与已获成果，未完成组件的局部选择或输入不持久化。

## 13. Desktop / Reduced Motion

按用户“不用管手机端”的要求，只进行桌面布局与验收。本章采用左侧交互、右侧解释的桌面工作区；七阶段流程使用整块工作区呈现 SVG 和同步说明。没有新增手机专用设计或进行手机端验收。

`prefers-reduced-motion: reduce` 下禁用工具提示脉冲、结构化请求入场和数据卡沿路径运动；流程使用静态位置、当前节点高亮和文字说明，隐藏自动播放入口，保留手动前后切换和完整通关路径。

## 14. Build / Lint / Test 验收记录

以下记录来自最终整合构建、自动化回归和桌面浏览器实测。

| 检查                      | 当前记录                                                                                                                                                                                                 |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run build`           | 最终整合构建通过；保留既有 Three.js 核心分包体积提示                                                                                                                                                     |
| `npm run lint`            | 最终整合检查通过                                                                                                                                                                                         |
| Tools 完整 React 集成测试 | 已通过，覆盖十步互动、刷新恢复、四题挑战、完成和 Agent Loop 解锁                                                                                                                                         |
| 工具互动组件测试          | 6 项通过，包含键盘选择、三题匹配、字段检查、参数校验与三个工具、Schema 展开                                                                                                                              |
| 全套测试                  | `npm run test -- --maxWorkers=2` 通过：23 个文件、197 项测试，耗时 42.04 秒                                                                                                                              |
| 桌面浏览器验收            | 十步课程完整通关：键盘选工具、三题匹配、JSON 字段、Schema、空参数校验与生成、执行判断、自动播放/暂停/重播、结果加入 Context、四题纠错与通过、地图完成与预览解锁；刷新恢复正常，本章控制台无 error / warn |
| `npm run test:e2e`        | 项目未配置该脚本，使用完整 React 集成测试和桌面浏览器检查                                                                                                                                                |

全套测试包含 Phase 1–4 回归；新增测试还覆盖执行流程自动播放、暂停、重启、页面隐藏暂停、卸载清理、减少动态效果，以及持久化迁移、无依据完成阻止和旧课程进度保留。旧地图数量和按钮选择器断言已随四章发布状态更新，并在上述最终重跑中通过。

## 15. 已知问题与限制

现有 Three.js 核心分包为 516.61 kB，构建仍提示超过 500 kB 的建议阈值。它来自已有 3D 场景，本章没有新增 Three.js 使用，也没有通过调高阈值掩盖提示。

本课程以固定教学资料解释调用机制，没有真实模型、搜索、文件、代码、数据库或 API Runtime。示例结果不能用于判断 NVIDIA 最新产品。局部练习输入不跨刷新保存，已完成成果和课程步骤独立保存。

桌面浏览器还核对了首页、学习地图、AI 系统全景、Context 和 Model Inside 的页面入口与标题，未见控制台 error。旧章节的完整交互回归由上述自动化测试覆盖；减少动态效果由组件和 hook 测试验证。浏览器验收通过后，Tools 页面已回到开头，保留已完成成就，便于重温。

## 16. Phase 6 建议

后续可从“模型得到工具结果之后，如何继续决定下一步”切入 Agent Loop，沿用当前职责边界、Context 回流和数据驱动步骤。建议继续先让用户做一次选择，再揭示流程名称。

本阶段仅提供建议和下一章预览入口。Agent Loop、ReAct、MCP、Tool Router、Handoff、多智能体教学、真实 Tool Runtime 与 Harness 内部机制均未实现；Phase 5 之后停止扩展，等待人工验收。
