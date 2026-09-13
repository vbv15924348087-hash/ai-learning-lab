# Explore 3D 独立审查

审查日期：2026-09-12。审查者为独立 Reviewer 子代理，不承担本轮生产代码实现；本轮仅新增 `src/features/explore-3d/ExploreExperience.test.tsx`，并复测实现方修复。

## 范围与证据边界

本轮依据 `Explore_3D_AI_System_Refactor_Goal.md` 与 `QUALITY_GATE.md` 审查 `/explore`。用户此前明确“不用管手机端”，因此手机端不属于本轮验收要求。课程内容、课程解锁规则与全局成绩系统不是本轮改造范围。

已阅读 `ExploreExperience`、控制器、概念数据与图转换、导航和详情、任务面板、所有 3D 场景模块，以及复用的 `SceneCanvas` 和课程/存储边界。独立测试使用真实页面组件、URL 控制器、教学数据和学习 Store，仅以可点击组件替代 WebGL 场景接口。这是 Vitest / React Testing Library 集成测试，不能作为浏览器 E2E 或真实 GPU 性能证据。

主代理已补齐桌面实际渲染、相机操作、控制台、帧率和最终构建证据；Reviewer 独立查看三张最终截图，并审阅 `docs/explore-3d-completion.md` 后完成本报告的最终 Gate 补录。没有开展真人 5 秒 / 10 秒 / 30 秒学习研究，不宣称新手理解率已经被验证。

## 问题与修复复查

### BLOCKER

本轮独立源码审查与目标自动化测试中未发现尚未解决的 BLOCKER。

### MAJOR

**EX3-01：手动缩放后的自动层级展开会被视角保存覆盖。已修复并复测。**

初版 `CameraController.finishManual` 同步先调用 `onDepthChange(2)`，再调用 `onCameraChange(pose)`；两次调用分别更新 Search Params。React Router 的同一轮函数更新没有累积前一次参数，最终只保留视角，场景仍为 6 个核心节点。独立 UI 测试首次真实复现失败，预期 56 节点、实际 6 节点。

实现方将接口改为 `onCameraChange(pose, depth?)`，控制器在一次 URL 更新内保存视角和层级。Reviewer 检查真实 CameraController 已使用该接口，再按同一接口复跑测试；URL 同时包含正确 `view` 与 `depth=2`，场景完整展开。回归测试保留在测试文件中。

**EX3-03：点击节点与同一事件中的相机结束回调竞争，导致选中节点丢失。已修复，集成回归通过。**

主代理在真实浏览器发现：点击 Model 后偶尔只留下全景 `view` 参数，没有 `node`，页面仍显示初始提示。Orbit 的结束回调与节点点击都在同一轮更新 URL，后一次视角保存覆盖选择，构成点击无反馈的关键交互缺陷。

实现方在控制器加入按当前 URL 参数对象分组的 `pendingParams`，使同一轮多次参数修改累积；场景端还通过比较操作前后视角，避免未产生位移的点击写入相机参数，并阻止 HTML 标签指针事件冒泡。Reviewer 检查控制器和 CameraController 改动，并新增真实 UI/controller 集成回归：同一事件先 `onSelect('model')`、再保存全景视角，验证 URL 同时保留 `node=model` 与 `view`、场景选中 Model、右侧详情出现且初始提示退出。该回归已通过。主代理随后在 1280 桌面视口连续两次点击真实 Model 标签，确认 URL 保留 `node=model`、模型详情出现，Context / Model / Harness 同屏可见；Reviewer 查看对应最终截图后关闭该问题。

### MINOR

**EX3-02：三维标签的课程状态粒度与左侧导航不同。已修复并复查。**

初版三维标签只显示已学与未学两态，未解锁概念与可学概念共用 `○`。实现方现已接入真实解锁节点集合，在三维标签中用 Check / Circle / LockKeyhole 区分三态，并在 aria-label 中明确“课程未解锁，可在此探索”。Reviewer 复查 SceneNode、场景数据传递和课程门禁一致，已关闭该问题。

### SUGGESTION

- 性能采样用于开发观察，不宜把一次活动期间的采样值当作全场景帧率保证；最终报告应注明实际测试机器、视口、层级和交互。
- 下一轮真人试用优先让新手解释“工具结果为什么回到 Context”和“FAIL 为什么不能交付”，用情境复述补足纯技术验收。

## 知识与教学审查

1. **知识来源一致。** Context、Prompt、Memory、RAG、Model、Harness、MCP 与 Compaction 复用现有概念定义。State 与 Trace 已拆开，并通过 Harness 的持续记录关系呈现，避免误导为仅在最终交付后才存在。
2. **请求与执行区分。** Model 生成 Tool Call；Harness 检查并调度 Tools。没有 Model 直接访问 External 的边。工具可直接由 Harness 调度，MCP 是可选连接路径。
3. **反馈通过当前上下文。** Observation → Context → Model 明确存在。Memory 与 RAG 将相关信息提供给 Context，文字未把整个记忆仓或外部资料库等同于模型本次输入。
4. **失败与完成分开。** Verification 的 FAIL 路径进入 Loop，再更新 Context；PASS 才进入 Final。17 步任务明确经历缺少官方来源、失败、修复、重新观察与最终检查。
5. **折叠图避免虚假关系。** 隐藏节点映射到可见所属模块，Verification 所属运行系统而非 Final；两端都隐藏的内部关系不直接提升为两个主模块的事实关系。精确可见边优先，折叠后去掉自环与重复连接。
6. **渐进呈现。** 默认 6 个核心节点、模块层 12 个节点；搜索和选择能临时显示深层概念及直接关系。提供 13 站系统导览，不增加第二套课程成绩或必修流程。
7. **模拟标记明确。** 页面与任务均明确教学模拟；来源、请求和结果没有冒充真实外部工具运行记录。

## 交互与工程审查

- Explore 仅订阅 `completedLessonIds` 与 `unlockedLessonIds`；未调用开始课程、完成课程、全局选中节点或成绩写入动作。
- 搜索包含 MCP、Workflow、Multi-Agent、Compaction 与中文说明，精确名称优先；锁定概念仍可探索。未解锁课程入口回到学习地图，已解锁入口保留原 Lesson 路由。
- 任务支持播放、暂停、手动前后步、时间线与重播。选择其他节点或切换模式会停止自动播放；下一步恢复该任务事件的焦点。
- Reduced Motion 禁用自动任务播放和连续信息流，保留完整手动路径。后台页面或离开可见区域会暂停。键盘操作跳过输入区域和修饰键组合。
- Reset 清空焦点、手动视角和展开深度并回到自由全景；Esc、R 和任务方向键均有可达实现。
- Orbit 对旋转角、距离与 Pan 目标设有边界；独立相机负责聚焦，场景不控制课程流程。主代理实际复测节点聚焦、拖动保存视角及 Esc 回全景通过。
- SceneCanvas 复用 WebGL2 检查、Context Lost 失败路径、StrictMode 独立 canvas、ResizeObserver 清理与 renderer/root 释放。新增几何已注册；场景拆为环境、节点、几何、连接、相机、标签碰撞模块。
- 默认按需渲染，流动限于活动任务连接。标签预算与碰撞处理控制 DOM 标签数量和遮挡；视觉效果由桌面截图复核。
- WebGL 失败后仍保留概念搜索、详情和完整任务步骤，3D 不是唯一学习入口。
- 新样式使用功能专属命名空间；主要页面和控制器分别约 240 行，数据与渲染分离。没有把局部细节追加到全站 Store。

## 独立验证结果

执行：

```text
npx vitest run src/features/explore-3d/ExploreExperience.test.tsx src/features/explore-3d/graph.test.ts
2 test files PASS · 20 tests PASS

npx eslint src/features/explore-3d/ExploreExperience.test.tsx
PASS
```

其中新增 11 个 UI/controller 集成测试覆盖：锁定概念探索与门禁链接、可学课链接与关系跳转、播放/暂停/重播/模式切换、手动查看中断播放、Reduced Motion 完整 17 步、键盘不抢搜索输入、Reset、URL 异常参数、缩放深度与视角同步、同事件的节点选择与相机保存竞争、后台暂停和卸载清理、WebGL 失效后的替代入口。多条用例核对真实 Store 对象未改变，搜索用例额外验证持久化没有写入。

其余 9 项数据/图测试由实现方编写，Reviewer 独立执行通过，覆盖定义与课程引用、关系完整性、核心路径、FAIL/PASS、逐层展示、折叠语义、搜索、任务和导览数据，以及 17 步任务在全景深度下的所有活动边端点完整性。

最终类型检查指出新增测试中的 14 处 `getByRole/queryByRole` 查询使用了不属于 `ByRoleOptions` 的 `exact` 参数；Reviewer 已移除冗余参数，保留完整字符串名称匹配。补齐 EX3-03 回归后，Reviewer 再次执行上述 20 项目标测试与测试文件 ESLint，均通过。主代理最终整站 TypeScript 构建也已通过。

## 最终桌面证据复核

Reviewer 独立打开并检查以下最终截图：

- `work/explore-3d/production-overview-1440.png`：六核心拥有不同几何形态与空间层级；浅色产品风格一致。入口提示、三态标签、概念搜索、模式切换和回到全景按钮可见，没有大量标签叠压。
- `work/explore-3d/model-1280-final.png`：Model 高亮、右侧模型职责与输入输出关系一致，Context / Model / Harness 均可见。相邻节点弱化，相关功能和课程链接可达，没有关键详情被 Canvas 覆盖。
- `work/explore-3d/task-return-1280.png`：Observation → Context 的活动路径与“实际结果回到工作台”说明一致。时间线、重播、前后步和播放控制清楚。画面顶部因点击时间线后页面滚动而在截图视口之外，不属于布局遮挡；当前任务场景与控制区可通过正常滚动查看。

以下实际操作与运行检查由主代理执行，Reviewer 依据其结果与完工报告核对，未重复宣称为自己执行的浏览器操作：

| 检查 | 证据与结果 |
| --- | --- |
| 真实点击 | 1280 视口连续两次点 Model，URL、场景选中和详情一致 |
| 相机与键盘 | 拖动保存 `view`；Esc 重置；搜索输入框中的 R 正常输入 |
| 桌面布局 | DOM 核对 1440×900、1280×800；未发现横向页面溢出 |
| 任务与导航 | 搜索锁定概念、导览、任务播放/暂停、失败回流、PASS、重播与模式切换通过 |
| 生产控制台 | 干净生产页面检查无错误；开发过程的 HMR Hook 顺序日志在刷新后消失，不属于当前生产错误 |
| 活动性能样本 | 当前本地浏览器，生产 1440×900、L2 细节层、任务播放 5 秒采样为 60 FPS、265 draw calls、19,368 triangles |
| 最终构建 | `npm run build` PASS，包括 TypeScript |
| 最终静态检查 | `npm run lint` PASS |
| 最终整站测试 | `npm run test` PASS，39 个文件、259 项测试 |

性能样本满足本次观察中的桌面目标，但没有硬件矩阵、长时间压力或降速实验，因此不作为所有设备持续 60 FPS 的保证。Reduced Motion、WebGL 故障和后台暂停采用本报告注明的自动化与代码证据，没有冒充真实操作系统设置或 GPU 故障注入。整站 259 项测试包含 Explore 的 23 项新增测试：Reviewer 独立执行的 20 项，以及场景代理的 3 项相机位移判断测试。

## 最终评分与 Gate

以下评分结合独立源码审查、目标自动化、最终截图复核和主代理补充的桌面/整站证据。维持审慎的 92 分评价，不以技术验收替代真人学习成效。

| 维度 | 分数 | 依据 |
| --- | ---: | --- |
| Knowledge Accuracy | 24 / 25 | 黄金概念一致，关键请求/执行/反馈/验证路径清楚 |
| Beginner Understandability | 18 / 20 | 人话优先、渐进层级、情境任务；尚无人类学习研究 |
| Learning Progression | 14 / 15 | 全景、节点、关系、导览与任务自然递进 |
| Interaction Discoverability | 14 / 15 | 点击提示、Reset、概念导航、键盘和完整控制 |
| Visualization Effectiveness | 8 / 10 | 不同几何、空间与反馈路径可见；密集细节仍需结合导航和说明 |
| Engineering Quality | 9 / 10 | 状态隔离、清理、故障替代、20 项独立目标测试及整站 259 项通过 |
| Global Consistency | 5 / 5 | 复用课程定义与解锁规则，探索不写成绩 |
| **合计** | **92 / 100** | **本轮桌面技术交付评分** |

EX3-01、EX3-02 与 EX3-03 均已修复并复查，真实点击缺陷已完成浏览器复测。在本轮约定的桌面 `/explore` 技术交付范围内，未发现剩余 Hard Fail，知识准确性与交互可发现性均达到门槛，Build / Lint / Test 通过。

**独立 Reviewer 最终 Gate：PASS（本轮桌面 Explore 交付）。** 手机端不在用户要求范围；真人学习成效尚待试用，本报告不替代课程历史验收，也不声称存在独立的全站浏览器 E2E 测试套件。
