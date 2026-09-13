# Phase 1 Architecture / Implementation

## 开发前检查

目标目录 `D:\VBV` 原本是多个软件、素材及其他项目的父目录。它的根目录没有 package.json、Git 仓库或指向本任务的现有 Web 工程。用户授权新建文件夹，因此在新的 `D:\VBV\ai-learning-lab` 实现本任务。

| 检查项         | 开发前结论             | 本阶段选择                      |
| -------------- | ---------------------- | ------------------------------- |
| 框架           | 没有指定现有框架       | React 19.2                      |
| 构建工具       | 没有现有构建配置       | Vite 7                          |
| TypeScript     | 未初始化               | strict 开启                     |
| Tailwind       | 未安装                 | Tailwind 4 + Vite 插件          |
| 路由           | 无                     | React Router 7 / BrowserRouter  |
| 状态管理       | 无                     | Zustand 5，局部且单一学习 Store |
| Three.js / R3F | 无                     | 按需加载的轻量三节点场景        |
| 目录结构       | 没有本任务的源码目录   | 按页面、领域、内容与展示分离    |
| 可保留代码     | 没有被指定的既有源码   | 新建独立项目，不改动同级目录    |
| 现有技术债     | 没有可评估的本任务工程 | 不迁移无关工程，不创建空架构层  |

实现顺序为类型和课程注册表 → 学习状态 → 页面与设计系统 → 三节点可视化 → 自动检查与真实浏览器验收。

## 内容和状态

`Lesson` 的内容由 `src/content/lessons/index.ts` 统一管理，页面不存储整章正文。字段包括稳定 ID、顺序、标题和副标题、时长、分类、发布开关、学习目标、直觉解释、类比、技术说明、误解对照、相关概念和可视化类型。章节专属标题、可视化提示和完成提示也属于课程数据。

`published` 表示编辑发布状态；`LessonStatus` 是运行时学习状态。锁定、可开始、学习中、已完成由发布信息与学习记录共同派生，两类状态不会混在内容对象里。

状态持久化 key：`ai-learning-lab:learning`，版本为 1。

| 状态               | 用途                                        |
| ------------------ | ------------------------------------------- |
| currentLessonId    | 最近进入的合法已发布章节                    |
| completedLessonIds | 去重后的已完成章节                          |
| startedLessonIds   | 区分可开始与学习中                          |
| currentMode        | 当前只允许 guided，其他模式只预留类型       |
| selectedNode       | UI 和可视化共享的选中节点                   |
| progress           | 通过 getProgress 派生，不重复写入持久化数据 |

操作包括 startLesson、completeLesson、setSelectedNode、resetProgress。无效 ID 和未发布课程不会改变状态。持久化恢复会清洗 ID、去重、校正未启用模式，并避免外部数据覆盖状态操作函数。浏览器存储不可用、数据损坏或空间不足时，当前标签页仍可学习。`FutureLearningState` 单独预留 challengeScores、unlockedConcepts、guidedTourStep，没有创建未使用的业务状态。

## 视觉接口

```text
课程数据 ──→ LessonLayout
                  │
             Learning Store
                  │
         ┌────────┴────────┐
       React UI        可视化适配层
                         │
                selectedNode / onSelectNode
                         │
                  R3F Three.js Scene
```

场景只接收 `selectedNode` 和 `onSelectNode`；它不导入 Store，不控制课程跳转、解锁或完成。共享的 `SystemNodeId` 由学习类型模块提供。场景材质与坐标集中在单独配置中，教学文字位于 system-map 数据文件。

Canvas 使用正交相机、按需渲染和受限像素比，无持续动画。SceneCanvas 管理真实 WebGL 2 context、renderer 创建以及 R3F createRoot 的异步配置；同步创建错误和配置拒绝统一转为降级，并清理尺寸观察器、事件、renderer 和 context。每次挂载拥有独立 canvas，避免 StrictMode 重新挂载受到旧实例延迟清理的影响。等效 DOM 按钮提供键盘访问和文字解释；3D 只作为补充呈现。WebGL 不可用、上下文丢失、场景渲染异常有简化图；可视化容器外层错误边界还覆盖懒加载模块下载失败，课程 UI 可以继续工作。

React、Three 核心和场景适配代码分包；显式分包不吞入共享依赖。进入不包含场景的页面时不应加载 Three 引擎。Three 核心仍存在压缩前超过 500 kB 的构建体积提示，属于已记录性能预算，不屏蔽该提示。

## Design System

主色采用中性浅底、深灰正文和克制蓝色重点。基础语义 Token 在 `styles.css` 的 `@theme` 中统一定义：background、surface、surface-elevated、text-primary、text-secondary、border、accent、success、warning、danger。色彩使用明确语义，不在 JSX 中散布样式颜色。

排版定义 Display、H1、H2、H3、Body、Body Small、Caption 和 Code；正文 16 px，常用控件 14 px，中文使用系统字体回退。间距使用 4、8、12、16、24、32、48、64、96 px 的一致比例。布局包括 1150、850、560 px 响应式断点，学习地图在手机上保留路径连接并使用单列卡片。

键盘支持包括跳转主内容、路由后主内容聚焦、链接与按钮语义、focus-visible、节点 aria-pressed、进度条属性，以及默认收起且原生键盘可用的技术说明。减少动态效果采用 prefers-reduced-motion；没有自动运动的教学场景。

## 验证范围

状态测试覆盖完成去重、非法/未发布 ID、模式清洗、持久化往返、旧版本和损坏数据、存储不可用、重置。页面集成测试覆盖首页到完成并返回地图、节点选择、技术解释、继续学习、锁定路径和不存在的页面。失败场景测试验证可视化异常时文字控件仍可操作。

真实浏览器验收由单独任务执行桌面、手机、边界宽度、刷新恢复和键盘操作。结果及开放限制记录在 `phase1-handoff.md`。没有现成 E2E 套件，未引入第二套浏览器运行器；不把 RTL 测试称为真实浏览器 E2E。

## Phase 6–16 架构附录

本节记录后续课程完工后的增量架构。前文保留 Phase 1 当时的设计与验证范围，不作为当前课程数量、存储版本或开放模式的说明。当前产品共有 15 门课程，对应 Phase 2–16；Phase 1 是产品骨架。原有 Phase 2–5 的课程实现继续保留，新增 11 章使用独立 feature 与公共课程壳。

### 教学数据、注册表与视图

`src/features/curriculum/types.ts` 定义 `ChapterDefinition`、`LessonStep`、术语、挑战、`ChapterProgress` 和 `ChapterVisualProps`。每个新章由自身目录中的 `data.ts` 导出教学数据，由 `Visual.tsx` 默认导出当前步骤的可视化。数据与 JSX 分离；章节组件不直接操作全局成绩或路由。

`curriculum/registry.ts` 通过 Vite `import.meta.glob` 收集独立 feature 的 `data.ts`，按 Phase 排序，并提供课程查询。注册表不依赖 UI 或 Store。`src/content/lessons/index.ts` 将新章注册数据与四门基础课程合并，供地图、导航和状态检查使用。

`curriculum/ChapterRoute.tsx` 按需加载各章 `Visual.tsx`。目录名通常与课程 ID 一致；`workflow-agent` 到 `workflow-vs-agent` 是显式映射。`ChapterLesson` 负责标题、步骤、进度、解释、术语解锁、误区、深度内容、前后导航与完成入口，`ChapterChallenge` 负责情境题界面。各章只把当前必要互动达成事件通过 `onComplete` 交给公共壳。

```text
各章 data.ts → curriculum/registry → 合并课程目录与学习地图
                         │
                    ChapterRoute
                         │
                    ChapterLesson
                    ├─ 当前步骤的 Visual（局部演示）
                    ├─ 解释 / 术语 / 误区
                    └─ ChapterChallenge
                         │
                Learning Store 的章节动作
                         │
             curriculum/progress 纯状态转换与清洗
                         │
                  v6 学习成果持久化
```

### 学习进度与局部状态

`curriculum/progress.ts` 集中处理新章初始状态、步骤转换、回答判定、前置链可用性与恢复清洗。持久化恢复只接受按教学顺序连续完成的步骤；术语由这些步骤派生，挑战通过由有效题目答案重新判断。没有前置课程证据的后续完成记录会被清除，存储中的布尔标记不能直接授予成就。

`learningStore.ts` 仍是统一持久化入口，存储 key 保持 `ai-learning-lab:learning`，版本升级为 **v6**。迁移保留并清洗 v1–v5 可用的基础课程记录；新章节独立记录当前步骤、完成步骤、术语与挑战答案。章节动作同时检查课程和步骤归属，重复完成不累加，完成后解锁下一章但不自动跳转。

动画帧、选中的服务、模拟库存、记忆演示仓库、审批选择与任务轨迹停在各章局部状态，不进入全局 Store。`ChapterLesson` 根据课程、步骤与重播序号重新挂载 `Visual`，因此切换步骤、刷新或重播会重置局部演示；已完成步骤、术语和挑战成果仍持久保存。重新开始只调整学习位置并重播，不清除已经取得的成果。

### 系统探索与生产边界

`/explore` 复用 `final-system-map` 中的系统图、术语图和完整任务轨迹。系统节点、关系和所属章节由独立数据描述，图的选择与展开只影响探索视图，不写入课程成绩。毕业章使用同一套图组件，在公共壳内增加步骤与挑战完成要求。

Phase 6–16 使用 HTML / SVG / CSS 展示流程、对比、容量和关系，没有新增 3D 场景。所有工具、检索、Memory、MCP 和审批操作明确标记为教学模拟；它们不调用真实外部服务。计时器和监听在组件卸载时清理，支持 Reduced Motion 与手动完成路径。

`work/qa/index.html` 和 `work/qa/preview.tsx` 是开发浏览器验收入口。夹具先把持久化适配器切换为内存，再准备指定章节前置条件；不修改学习者的浏览器成绩。它使用独立开发入口，不被生产应用导入，也不进入 `dist/`。正式 Windows 启动器使用端口 4174 并打开 `/learn`。

### 本阶段验证记录

整合自动检查为 Build / Lint 通过、36 个测试文件 / 236 项测试通过。新增测试覆盖主要互动、顺序解锁、v6 迁移、损坏状态恢复、章节契约与系统图关系。测试通过不等于完整真实浏览器 E2E 或所有桌面尺寸均已验收。本次按用户要求不验收手机端；实际浏览器检查与限制以 [Phase 6–16 完工报告](phase6-16-completion.md) 为准，独立审查与修复记录见 [Phase 6–16 审查报告](phase6-16-review.md)。
