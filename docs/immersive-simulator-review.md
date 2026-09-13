# AI System Simulator 独立审查

日期：2026-09-13。结论：**桌面 Simulator 增量 Gate PASS，92 / 100，无尚未解决的适用 Hard Fail。** 移动端依据用户明确要求记 N/A。

本报告由独立审查子任务编写。Reviewer 负责基线检查、新增 UI 回归与截图复核，并按主任务委派实现 Search-off 实验及“结果预览”文案；主任务及另外两个实现子任务负责 Simulator UI、状态引擎和三维场景。以下区分 Reviewer 独立执行、主任务浏览器操作和源代码证据，不将技术验收冒充真人学习效果测量。

## 基线发现

独立审查已读取本轮附件、现有沉浸页面 / 控制器 / 搜索 / 时间轴 / 实验，以及历史 Explore 审查。既有实现已经覆盖应用级全屏、三模块 X-Ray、五组固定实验、完整单任务时间轴、搜索和退出焦点恢复。历史 PASS 只对应旧需求，不能代替本轮验证。

本轮新增能力缺口包括六任务、复杂度阶梯、地图双路径比较、Why This Path / Why Not、审批门与长期上下文变化；键盘缺少 F 与 Space。需要验证场景并非仅静态高亮整条路径、研究具有真实步骤循环、请求与回流用形状 / 线型区分。

`QUALITY_GATE.md` 未在仓库或父目录的有界搜索中找到；采用附件明确 Hard Fail，并参考历史报告保留的七维标准：知识准确性 25、小白理解 20、教学递进 15、交互发现 15、可视化 10、工程 10、一致性 5；总分至少 85，知识至少 22，交互发现至少 13，无适用 Hard Fail。最终报告必须明确原文件的可获得状态。

## 本轮证据清单

| 项目 | 状态 | 需要的证据 |
| --- | --- | --- |
| 基线 Build | PASS | `npm run build`，退出码 0；保留既有 three-core 522.45 KB 分块提示 |
| 基线 Lint | PASS | `npm run lint`，退出码 0 |
| 基线全量 Test | PASS | `npm test -- --run`，46 文件 / 304 测试，116.69 秒，退出码 0 |
| 全屏 Shell / 退出 / 原页面隔离 | PASS | 真实全屏矩形、原生全屏进出、原 URL / 焦点 / 课程状态集成回归 |
| 节点角色与大小层级 | PASS | Model 多层核心、Harness 平台、Context 容器、Loop 环等源码与截图 |
| 顺序路径 / Request 与 Result / packet | PASS | 顺序状态契约、真实播放、实线请求 / 虚线返回与不同 payload |
| 六任务 / 循环 / Approve 与 Reject | PASS | 九项独立集成测试包含顺序、审批导航与自动播放门；主任务真实浏览器确认审批与长任务 |
| 复杂度五级与六轴 | UI 契约 PASS | GPU 五级切换、六轴 meter、教学示意与同图位置保持 |
| 三维同图比较及筛选 | PASS | 两任务成员与四种筛选传入场景；真实截图确认同图两路径与新增模块 |
| Why This Path / Why Not | UI 契约 PASS | 可访问按钮、任务因果、专业深度与节点详情 |
| X-Ray / 内部搜索 | PASS | Attention 精确搜索进入 Model 内部；旧模块回归由最终全量套件覆盖 |
| 六组实验 / 恢复系统 | PASS | 原五组 + Search-off，13 项定向回归及最终全量套件通过 |
| Reduced Motion / 键盘 / WebGL 降级 | PASS | 新旧集成测试与源码证据；不冒称真实 GPU 故障注入 |
| 最终 Build / Lint / 全量 Test | PASS | 主任务最终 50 文件 / 331 测试通过，Build / Lint 通过；详细时间顺序见下文 |
| 桌面布局 / 控制台 / 性能 | PASS（有限证据范围） | 六张真实截图独立复核，两个桌面视口实际操作，最终生产页面无错误；性能样本范围见下文 |

## 证据边界

自动化中的场景代理只能证明数据与交互契约，不能证明真实三维像素位置、遮挡、连线可读性或 GPU 性能。审查者会独立查看交付截图，浏览器操作和采样由执行者明确署名。短帧率样本不代表设备矩阵或长期压力保证。没有真人学习测试时不将教学目标描述为已测量的理解率。

## 已完成的增量审查与验证

发现原来的 RAG-off 实验针对公司内部资料，其独立 Web Search 仍可用；无法直接展示附件要求的“实时 GPU 查询缺少最新外部信息”。本轮保留原五实验并增加 Search-off。正常轨迹展示 Web → Result → Context → 核验交付；异常轨迹在 Harness 检出能力不可用，将失败 Observation 送回 Context，最后时效 / 来源检查失败，不再经过 Web 或 Final。明确保留其他工具与已有知识，避免把 RAG 与 Search 说成同一能力。

实验结果在开始运行时已经展示，现标注“结果预览”，明确是固定教学轨迹的预览，避免用户误认为第一步即已执行成功。

Reviewer 独立执行 `npx vitest run src/features/explore-3d/immersive/experiments.test.ts src/features/explore-3d/immersive/ExperimentPanel.test.tsx`：2 文件 / 13 测试 PASS，24.92 秒，退出码 0。对修改的实验数据、组件和两测试文件执行 ESLint：PASS。此定向结果不替代最终整站测试与真实三维验证。

### 任务 Simulator 独立 UI 回归

新增 `Simulator.test.tsx` 使用真实 UI、控制器、场景数据和学习 Store，只有 WebGL 渲染器被可观测场景契约替代。最终定向执行 9 / 9 PASS，16.87 秒，退出码 0。首次执行 7 / 8 PASS；失败来自测试向初始值为 1 的原生 range 再写入 1，并不会产生真实 change，已把操作调整为 2 → 1 的实际移动，未放宽功能断言。随后加入 Attention 搜索回归并完整复跑 9 项通过。

覆盖六任务同图位置稳定、Web / File 不同分支、学习状态不写入、六轴与五级 GPU 复杂度、任务 Why / Why Not 及三级深度、双路径成员和四种比较筛选、人工审批对拖动 / 逐步按钮 / 自动播放的统一拦截、Reject STOP、重播及换任务清空旧批准、Context 38 / 72 / 91 / 34、Reduced Motion 手动访问、F / Space 不抢输入框与按钮原生键盘行为。

发现并由实现方修复：原 `verification` packet 统一写作 PASS，会在高风险检查和等待审批时误称已通过；现分为 CHECK 与明确结果 PASS，只有真实步骤的 `outcome: pass` 才给 PASS。比较说明原称 B 双线 / 共同菱形，与实际 A / +B / A+B 标记不一致，现图例按实际线旁标记表述。根任务同时修复普通 Attention 搜索命中原概念后未进入内部的问题；独立新增回归确认选择 `inside-model-attention` 并展开 Model。

性能源码审查发现：几个空数组 props 在每次 UI 更新时重新创建，会穿透 Scene 的 memo 边界。主任务已用共享 `EMPTY_IDS` 保持无活动边和无禁用条件时的引用稳定；同时保留已 memo 的目录、学习状态与回调。Drawer 可改变可用尺寸，但不因此销毁重建 Canvas。动画最多分配三个当前活动 packet，Reduced Motion 和隐藏页面停止连续流动。

### 浏览器修整前的整站检查

主任务执行 `npm test`：50 文件 / 329 测试 PASS，89.49 秒；`npm run lint`：PASS；`npm run build`：PASS，16.23 秒，保留既有 three-core 522.45 KB 提示。此轮发生在浏览器发现取景偏远和简单路径多余亮线的修整之前，暂不将其称为最终交付验证。

主任务在真实浏览器 1440 × 900 读取 dialog 为 `(0, 0, 1440, 900)`，默认场景高 756，占 84%；只有一个沉浸 Canvas，body overflow 为 hidden。实际审批操作中 End 被拦在 8 / 12，Reject 后变为 STOP 8 / 8，重播需要重新审批，Approve 后进入数据库 9 / 12。以上浏览器操作由主任务完成；最终截图的独立复核见下文。

## 最终自动化与桌面证据

主任务在场景取景、闲置连线与标签优先级修整后执行最终 `npm test`：**50 文件 / 331 测试 PASS，85.94 秒**；`npm run build`：**PASS，17.55 秒**；`npm run lint` 与 `git diff --check`：**PASS**。构建只保留既有 three-core 522.45 KB 提示。Scene 定向测试 **17 / 17 PASS**。所有产品源码变化限于 Explore 功能，课程和 package 文件未改。

随后仅调整两条 CSS：图例默认移至左下角，打开 Drawer 时隐藏该常驻图例，解决与底部节点副标题重叠。最后重新执行 `npm run build`：**PASS，9.84 秒**；Reviewer 重新查看 12:05:18 更新的 1280 截图，确认 Agent Loop 完整标签已露出。交互和状态代码没有改变，因此未为这两条可逆样式重复全量测试；前述 331 测试与单项断言复核的时间顺序保留。

此后 Reviewer 仅在已有审批 UI 测试中增加具体状态断言：等待审批时为 verification / CHECK，实际核验通过步骤为 pass / PASS。执行 `npx vitest run src/features/explore-3d/immersive/Simulator.test.tsx -t 'blocks scrubbing'`：**1 PASS / 8 未选中，6.29 秒**。这次断言补充没有改变产品源码，也没有把定向复核写成再次全量运行。

主任务实际检查生产预览 `http://127.0.0.1:4175/explore`：浏览器全屏按钮进入后显示“退出浏览器全屏”，退出后恢复“进入浏览器全屏”；应用级全屏仍独立可用。1280 × 800 的 GPU Level 4 可用 End 到达 **76 / 76**，页面 scrollWidth 为 1280；长时间轴在自身内部滚动，scrollWidth 1820、clientWidth 1236，310 像素侧栏仍可使用。

最终生产页面（4175）的控制台错误查询为空。开发源代码尚未写完时的历史 HMR 日志属于先前的 5173 页面，没有将它们当作当前生产错误，也没有声称所有历史日志均为空。退出沉浸后，默认 Explore 标题和“全屏探索”入口均恢复可见。

开发渲染器有限样本为 **57 FPS / 390 draw calls / 29,844 triangles**。该样本采集于最后的相机取景与闲置线淡化修整之前，只表示该次开发环境活动样本，没有宣称最终构建在所有设备恒定 60 FPS，也没有做长期显存或硬件矩阵压力测试。

Reviewer 已独立查看以下真实截图：

| 截图 | 独立观察 |
| --- | --- |
| [全屏全景 1440](screenshots/simulator/overview-1440.png) | 原应用 Header / Footer / Task Bar 不露出；六核心形态差异清楚，任务入口、模式和退出可见，默认侧栏收起 |
| [简单路径 1440](screenshots/simulator/simple-1440.png) | 当前 Model 与简单路径突出，其余能力淡化；4 步时间轴与逐步按钮可见，未把大量能力显示为此任务必经 |
| [简单与研究对比 1440](screenshots/simulator/compare-1440.png) | 相同地图上可辨共同节点与 +B 新增 Planning / Tool Call / Harness / Loop / Web / Browser / Verification；四个过滤按钮与实际标记一致 |
| [复杂度侧栏 1280](screenshots/simulator/ladder-1280.png) | 最新稳定画面为 76 / 76，当前 Final / RESULT、User、Context、Model、Verification、Agent Loop 完整标签和路径侧栏均在可用区域；图例在 Drawer 展开时已隐藏，长时间轴局部滚动；初次过渡画面已替换，不用于验收 |
| [Attention 内部 1280](screenshots/simulator/xray-1280.png) | 普通 Attention 搜索进入 Model X-Ray，内部 Attention 与 Transformer 关系清楚，右侧解释可读；背景外部节点部分切出不影响本次内部探索 |
| [压缩后 Context 1440](screenshots/simulator/compaction-1440.png) | 30 / 32 步的 Context Window、34% meter 与 38 → 72 → 91 → 压缩 → 34 教学轨迹一致；Memory / Compaction / Loop 参与路径可见 |

主任务还逐个确认真实 Context meter 为 38、72、91、34。较早的 GPU 4 截图显示 1 / 76 播放过渡帧，与已确认的 76 / 76 DOM 不一致；在稳定生产页面重新抓取后，Reviewer 已复看替换图并关闭取景疑问。没有为了截图问题改动测试断言或隐藏必要节点。

## 最终评分与问题清单

评分沿用仓库历史审查保留的七维标准，结合本轮源码、独立测试、主任务实际交互和六张最终截图；不是对真实初学者学习成效的统计评分。

| 维度 | 得分 | 依据 |
| --- | ---: | --- |
| 知识准确性 | 24 / 25 | 清楚区分请求、执行、结果回流、时效证据、独立核验和人工批准；RAG 与 Search 分开，所有动作标注教学模拟 |
| 小白可理解性 | 18 / 20 | 简单问答 → 搜索 → 文件 → 研究 → 高风险 → 长周期路径具有具体因果，Why / Why Not 可按任务读取 |
| 教学递进 | 14 / 15 | 五级同主题阶梯、双路径比较、单模块 X-Ray 和反事实实验互相补充；完整时间轴可自主控制 |
| 交互可发现性 | 14 / 15 | 顶部任务入口、从简单问答开始、路径原因、六种模式和退出可见；键盘、搜索、审批与恢复路径明确 |
| 可视化有效性 | 8 / 10 | 节点语法、请求 / 返回、A / +B / A+B、循环与完成标记有助于读图；密集路径仍有少量标签与图例接近 |
| 工程质量 | 9 / 10 | 最终 Build / Lint / 331 测试通过，审批统一守卫、状态与课程隔离，Reduced Motion 与故障替代入口保留 |
| 全局一致性 | 5 / 5 | 复用既有 Explore 位置、视觉语言、数据及课程入口，只增加沉浸功能，不修改课程主线和成绩规则 |
| **合计** | **92 / 100** | 达到历史门槛：总分 ≥ 85、知识 ≥ 22、交互发现 ≥ 13 |

- **BLOCKER：无。** 应用级与浏览器全屏可进出，任务 / 审批 / 比较 / 实验 / 搜索和回归检查有完成证据。
- **MAJOR：已解决，无遗留。** 审批等待阶段误标 PASS、搜索 Attention 未钻取、全图过远、闲置路径过亮和路径标签优先级已修正并核对。
- **已关闭的样式问题：** 底部图例与 Agent Loop / Verification 副标题重叠已修复；图例移至左下角且在 Drawer 展开时隐藏。最新 1280 图已经独立复核，完整节点标签可读。
- **MINOR：** 密集长周期和研究路径中，完成标记或 packet 标签仍可能靠近其他标签。当前选中节点、任务解释、时间轴和所有替代导航清楚可达，不构成无法操作。
- **证据边界：** 未找到原始 `QUALITY_GATE.md`，已明确采用附件 Hard Fail 与历史记录标准；移动端 N/A。没有真人 5 / 15 / 30 / 60 秒试验，没有设备矩阵或长期显存压力测试。57 FPS 是明确注明阶段的有限开发样本。

在本轮约定的桌面增量范围内，**适用 Hard Fail：0；最终 Gate：PASS**。
