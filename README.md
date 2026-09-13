# Inside AI · AI 学习实验室

面向 AI 新手的交互式学习网站。从一问一答出发，通过资料整理、工具调用、Agent 循环、检索、记忆、运行系统与验证，逐步理解现代 AI 系统怎样工作。Phase 6–16 的 11 个章节已经接入，连同原有 4 门基础课，共 **15 门正式课程**。Phase 1 是产品骨架，不计入课程数量。

本次按用户要求交付桌面端。新增课程实现、独立审查与已修复问题见 [Phase 6–16 审查记录](docs/phase6-16-review.md)；最终交付、浏览器检查范围和限制见 [Phase 6–16 完工报告](docs/phase6-16-completion.md)。Phase 1–5 的历史交付记录继续保留。

## 本地运行

环境：Node.js 22.12+（推荐 Node.js 24 LTS）、npm。

Windows 可双击项目根目录的 **打开学习实验室.cmd**。它通过 `start-local.ps1` 启动或复用本地构建预览，并在浏览器打开 [学习地图](http://127.0.0.1:4174/learn)。后台服务日志位于 `work/local-preview/`。首次使用需安装依赖；没有构建文件时，启动器会先构建，已有构建需要更新时请先运行 `npm run build`。

请通过 HTTP 地址访问，**不要直接双击 `dist/index.html`**。页面使用模块脚本和浏览器路由，通过 `file:///` 打开会出现空白页。

```powershell
cd D:\VBV\ai-learning-lab
npm ci
npm run dev
```

打开 [本地开发首页](http://127.0.0.1:5173)、[学习地图](http://127.0.0.1:5173/learn) 或 [自由探索](http://127.0.0.1:5173/explore)。开发服务器只绑定本机回环地址，并严格使用指定端口。端口 5173 已使用时，关闭本项目之前启动的实例，或运行 `npm run dev -- --port 5174`。

```powershell
npm run build
npm run lint
npm run test
npm run preview
```

构建目录为 `dist/`。`npm run preview` 默认使用 [本地构建预览](http://127.0.0.1:4173)，Windows 启动器使用 **4174 /learn**。启动器端口被其他服务占用时，可运行 `powershell -ExecutionPolicy Bypass -File .\start-local.ps1 -Port 4175`。路由采用 BrowserRouter，托管时需要将未知文件路径回退到 `index.html`。当前没有部署。

Windows 开发模式使用文件轮询并忽略文档、工作记录和覆盖率目录，避免文件被编辑器或扫描程序短暂占用时中断服务。`npm run format` 可统一整理源码格式。

## 学习流程

- `/`：从输入、模型与回答的关系开始，进入学习地图。
- `/learn`：展示全部 15 门正式课程、学习分组、当前进度与章节状态。
- `/lesson/:id`：循序学习。前一章完成后解锁下一章，页面不会自动跳转；直接访问尚未解锁的课程也会检查前置条件。
- `/explore`：3D AI 系统探索空间。六个区域逐层展开，点击节点聚焦并查看职责、上下游和课程入口；支持概念搜索、13 站系统导览、17 步任务模拟及失败回流。点击场景工具栏的 **全屏探索**，进入沉浸探索实验室。自由探索不改变课程成绩，详情课程遵循原有解锁规则。
- 不存在的课程或页面：显示 404，并提供返回地图的入口。

| 课程 | Phase | 内容                               | 路由                        |
| ---- | ----- | ---------------------------------- | --------------------------- |
| 01   | 2     | AI 系统全景                        | `/lesson/system-overview`   |
| 02   | 3     | Context                            | `/lesson/context`           |
| 03   | 4     | Model Inside                       | `/lesson/model-inside`      |
| 04   | 5     | Tools / Function Calling           | `/lesson/tools`             |
| 05   | 6     | Agent Loop / ReAct                 | `/lesson/agent-loop`        |
| 06   | 7     | Harness                            | `/lesson/harness`           |
| 07   | 8     | RAG                                | `/lesson/rag`               |
| 08   | 9     | Memory                             | `/lesson/memory`            |
| 09   | 10    | MCP                                | `/lesson/mcp`               |
| 10   | 11    | Workflow vs Agent                  | `/lesson/workflow-vs-agent` |
| 11   | 12    | Multi-Agent                        | `/lesson/multi-agent`       |
| 12   | 13    | Verification / Eval                | `/lesson/verification`      |
| 13   | 14    | Guardrail / Human in the Loop      | `/lesson/guardrail`         |
| 14   | 15    | Compaction / Long-running Agent    | `/lesson/compaction`        |
| 15   | 16    | Final System Map / Knowledge Graph | `/lesson/final-system-map`  |

Phase 6–16 共用课程外壳：先看到问题，再完成互动、解锁术语、阅读可折叠的技术解释，最后通过情境挑战。每步都有完成条件和明确的下一步入口；所有步骤及本章挑战通过后，才记录章节完成。Agent Loop 提供自动播放、暂停与手动推进；其他场景按教学需要使用点击、选择和逐步执行。

毕业章将所有模块放回同一张系统图，再通过“研究 AI GPU、读取内部 PDF、生成报告、检查结果并处理高风险动作”的完整任务复盘。系统图与术语图也可在 `/explore` 独立查看。

## 全屏沉浸探索

在 [系统探索](http://127.0.0.1:4174/explore) 点击 **全屏探索**，即可在同一套 3D 系统上继续深入。原页面的布局、核心节点位置和视觉风格保留；沉浸层默认收起概念导航，详情可折叠，让主要空间留给系统本身。浏览器支持时，可通过顶部图标进一步进入浏览器原生全屏；不支持时仍能在窗口内使用全部探索功能。

- **自由探索**：搜索或点选节点，聚焦模块、查看上下游；点击连线或详情中的“为什么？”了解连接理由。解释深度可切换小白、标准、专业。
- **关系**：查看所选节点的直接上游、直接下游或全部相关概念，保留实际存在的连接。
- **进入内部 / X-Ray**：拆开 Context、Model、Harness。内部视图聚焦一个模块；X-Ray 保留六核心背景，一次只展开一个模块的内部结构。
- **运行任务**：沿用 17 步 GPU 研究教学模拟，包含工具结果回流、检查失败、修复和交付。支持播放、暂停、前后步、拖动时间轴、点击步骤与重播。
- **实验**：对比关闭 RAG、关闭 Memory、跳过 Verification、断开 Tool Result → Context、移除 Human Approval 后的教学结果。每次只改一个条件，可恢复正常系统后再次运行。

沉浸探索使用独立的临时状态。进入时继承原页面的选中节点、展开层级、任务位置和手动视角；退出后回到原页面，实验改动不写入课程成绩或原页面 URL。`R` 回到系统全景，`← / →` 切换时间轴步骤，`Esc` 退出沉浸；搜索框展开时先用 `Esc` 关闭搜索结果。减少动态效果时使用手动步骤，页面切入后台会暂停播放。

实验均为固定教学情境，不调用真实模型、网络或数据库。关闭 RAG 不等于关闭独立网页搜索；跳过核验后到达 Final 也不代表检查通过。实现范围、教学边界和本轮验收记录见 [沉浸探索完工报告](docs/immersive-explore-completion.md)。

## 进度与重播

课程总进度以 **15 门课程**计算，重复完成不会累加。学习进度保存在当前浏览器的 `ai-learning-lab:learning` 中，存储格式为 **v6**，迁移时兼容并清洗 v1–v5 的旧学习记录。新章节的完成状态由连续完成的步骤和正确挑战答案推导，不能仅凭存储中的一个完成标记解锁后续课程。

刷新后可恢复当前课程位置、已完成步骤、已解锁术语和挑战成果。**每步的局部演示会在切换步骤、刷新或重新开始时重置，已获得的学习成果仍然保留。**例如 Memory 章的教学仓库属于当前演示，不是网站的真实长期记忆服务；它与学习成绩存储分开。重新开始用于重播课程，不扣除已完成成果。

清理站点数据会清除学习进度。项目没有账号、跨设备同步或后端服务；浏览器存储不可用时，当前标签页仍可继续学习。

## 验证与开发验收入口

Phase 6–16 课程交付时的检查结果：**Build 通过、Lint 通过、36 个测试文件 / 236 项测试通过**。测试覆盖原有课程回归、新章主要互动、顺序解锁、旧存储迁移、损坏状态恢复、课程契约与最终系统图关系。后续 3D Explore 和沉浸探索的检查结果分别记录在各自完工报告中。Three.js 核心包仍有压缩前超过 500 kB 的构建提示，保留记录，不屏蔽警告。

Vitest / React Testing Library 检查不等同于真实浏览器 E2E，也不代表完整的 1440 / 1280 视口验收。实际浏览器检查、截图与剩余范围以 [完工报告](docs/phase6-16-completion.md) 为准；独立内容及代码审查见 [审查记录](docs/phase6-16-review.md)。本次不验收手机端。

开发验收夹具位于 `work/qa/`。启动 Vite 开发服务器后，可打开 [Agent Loop 第二步验收页](http://127.0.0.1:5173/work/qa/index.html?chapter=agent-loop&step=1)。`chapter` 使用课程 ID，`step` 从 0 开始；页面顶部提供章节和步骤入口。它使用 **仅内存的测试进度**准备前置条件，不写入学习者的浏览器成绩。该入口只用于开发，不参与生产构建，也不进入 `dist/`。

## 工程结构

```text
src/
  app/                         路由组合
  pages/                       Home、Learn、Lesson、Explore、404
  components/
    layout/                    网站外壳、主导航
    learning/                  解释、误区、概念、进度
    visualization/             可视化容器、懒加载边界、等效 DOM 控件
    three/                     轻量 R3F 场景、材质配置与降级
  features/
    learning-map/              路径分组和课程卡片
    lesson/                    原有课程的 LessonLayout
    system-map/                基础系统节点教学内容
    system-overview/           AI 系统全景课程
    context-lesson/            Context 工作台与独立学习状态
    model-inside/              模型内部结构、表示与生成互动
    tools-lesson/              工具选择、请求构建与结果回流
    curriculum/                Phase 6–16 公共壳、契约、注册表与进度转换
    agent-loop/                反馈驱动的两轮循环
    harness/                   运行系统拆解与失败路径
    rag/                       检索、重排、Context 与示意回答
    memory/                    记忆写入、检索与 Context 注入
    mcp/                       Client / Server、能力与传输
    workflow-agent/            固定流程与动态决策对比
    multi-agent/               分工、Agent-as-Tool 与 Handoff
    verification/              外部检查、修复与完成条件
    guardrail/                 风险检查与人工批准
    compaction/                容量变化、压缩与状态保留
    final-system-map/          全系统图、术语关系与综合任务
    explore-3d/                默认 3D 系统探索与共享场景
      immersive/              沉浸层、关系、内部结构、时间轴和实验
  content/lessons/             基础课与新章节合并后的课程目录
  stores/                      Zustand 持久化、迁移与测试
  types/                       原有课程、状态、模式和节点类型
  hooks/                       页面标题等页面能力
  tests/                       页面流程与失败场景集成测试
  styles.css                   设计 Token、排版与减少动态效果
docs/
  architecture.md             Phase 1 架构记录与 Phase 6–16 附录
  phase1-handoff.md            Phase 1 骨架交付记录
  phase2-handoff.md            Phase 2 系统全景交付记录
  phase3-handoff.md            Phase 3 Context 交付记录
  phase4-handoff.md            Phase 4 Model Inside 交付记录
  phase5-handoff.md            Phase 5 Tools 交付记录
  phase6-16-review.md          独立审查、问题修复与复核记录
  phase6-16-completion.md      最终交付与浏览器验收范围
  explore-3d-completion.md     默认 3D Explore 交付记录
  immersive-explore-completion.md  沉浸探索增强与验收记录
work/
  qa/                         开发验收页、仅内存夹具与截图
  local-preview/              Windows 启动器服务日志
```

## 技术栈与教学边界

React 19.2、TypeScript strict、Vite 7、Tailwind CSS 4、React Router 7、Zustand 5、Three.js、React Three Fiber、Drei、Lucide、Vitest 4、React Testing Library。依赖精确解析结果见 `package-lock.json`。

页面使用语义化 CSS Token 和组件样式，Tailwind 通过 Vite 插件接入。课程主要使用 HTML / SVG / CSS，Model Inside 的多层计算结构按需加载 R3F；Phase 6–16 使用独立按需加载的可视化模块。可点击对象提供键盘操作和焦点样式，教学流程保留文字等价说明，动态效果支持 Reduced Motion。

所有模型数值、检索资料、工具调用、MCP 请求、库存查询、审批与删除场景均为明确标注的教学模拟，不接入真实模型或外部业务 API。

3D 探索复用 R3F / Drei / Three.js，通过按需渲染、标签避让和相机边界控制桌面体验；支持减少动态效果、后台暂停和 WebGL 失败后的文字操作入口。实施与验收见 [Explore 3D 完工报告](docs/explore-3d-completion.md) 和 [独立审查](docs/explore-3d-review.md)。

## 扩展课程

Phase 6–16 的公共体系位于 `src/features/curriculum/`，原有基础课程继续使用各自实现。

1. 在独立 `src/features/<feature>/data.ts` 导出符合 `ChapterDefinition` 的 `chapter`，包含稳定 ID、Phase、步骤、术语、误区和情境挑战。注册表会收集这些数据并按 Phase 排序。
2. 在同目录 `Visual.tsx` 默认导出接收 `ChapterVisualProps` 的组件。组件只处理当前演示，并在本步必要互动完成时调用 `onComplete`；导航、解锁、成绩与持久化由公共壳和进度层负责。
3. 通常让目录名与课程 ID 一致。现有 `workflow-agent` 目录对应 `workflow-vs-agent` 路由，是 `ChapterRoute` 中的显式映射。
4. 使用章节前缀组织样式，清理计时器和事件监听，保留键盘与 Reduced Motion 路径。新增课程涉及分组或完整系统图时，同步维护对应目录与关系数据。
5. 补充有意义的互动与状态测试，执行 build、lint、test，再独立审查教学内容、桌面表现和前序章节回归。

进一步的职责划分与状态恢复规则见 [架构说明中的 Phase 6–16 附录](docs/architecture.md)。
