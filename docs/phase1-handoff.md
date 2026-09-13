# Inside AI · Phase 1 交付与验收

项目位置：`D:\VBV\ai-learning-lab`。本地验收预览：http://127.0.0.1:4173/ 。开发服务：http://127.0.0.1:5173/ 。本阶段完成后停止，未进入 Phase 2。

## 1. 当前实现

- 首页：用“一句提问之后，AI 内部发生了什么”建立学习动机；可交互的输入、模型、回答图示；进入学习地图的明确入口。
- Learning Map：文档指定的 14 章，按四段路径相连。第 01 章可学，其余 13 章明确显示即将开放。
- Lesson：统一布局包含标题、目标、可视化、直觉解释、类比、折叠技术说明、误解对照、前后导航、完成操作和进度。
- 学习流程：章节开始、完成、重温、刷新恢复和当前节点选择；首课完成计为 1/14、7%。
- 路由恢复：未开放章节和不存在的地址都有明确提示及返回入口。
- 模式：引导学习可用；探索和挑战仅保留类型及禁用入口。

## 2. 文件变更

在新文件夹中新建项目，没有修改 `D:\VBV` 的其他已有目录。

| 文件或目录                                         | 作用                                          |
| -------------------------------------------------- | --------------------------------------------- |
| package.json / package-lock.json                   | 可复现依赖与运行检查脚本                      |
| index.html / public/favicon.svg                    | 中文入口、元信息与图标                        |
| tsconfig*.json / vite.config.ts / eslint.config.js | strict、构建、Tailwind、拆包、Lint 和测试配置 |
| src/app/App.tsx / src/main.tsx                     | 路由与启动                                    |
| src/pages                                          | 首页、地图、课程和 404                        |
| src/components/layout                              | 外壳、导航、键盘跳过入口                      |
| src/components/learning                            | 解释、误解、概念标签和进度条                  |
| src/components/visualization                       | 场景边界、等效 DOM 控件和解释                 |
| src/components/three                               | R3F 场景、节点、初始化与降级                  |
| src/features                                       | 学习路径、统一课程布局和节点教学内容          |
| src/content / src/types / src/stores               | 课程数据、共享协议、状态与持久化              |
| src/styles.css                                     | 语义 Token、响应式与可访问性样式              |
| src/tests 及相邻 _.test._                          | 状态、内容、流程和失败恢复测试                |
| README.md / docs                                   | 启动方法、架构、原需求、文件清单和交接说明    |

完整清单见 `docs/file-manifest.txt`。

## 3. 项目结构

采用 app / pages / components / features / content / stores / types / hooks / tests。课程内容、学习流程与渲染职责分别归属。每个目录都有实际实现，没有为架构展示创建空目录。详细目录树及开发前十项检查见 `README.md` 和 `docs/architecture.md`。

## 4. Learning State

Zustand 统一管理 currentLessonId、completedLessonIds、startedLessonIds、currentMode、selectedNode。progress 由有效完成记录派生，避免保存两份互相矛盾的数据。状态支持 locked、available、in-progress、completed。

localStorage key 为 `ai-learning-lab:learning`，使用版本 1 的持久化与恢复清洗。未知 ID、未发布章节、重复完成、未启用模式和损坏数据均受保护；存储不可用时当前标签页仍可学习。challengeScores、unlockedConcepts、guidedTourStep 只预留类型。

## 5. Lesson Schema

内容字段包括 id、order、title、subtitle、minutes、category、published、learningGoal、beginnerHeading、beginnerExplanation、analogy、technicalExplanation、misconceptions、relatedConcepts、visualization、visualizationNote、completion。

`published` 管理内容发布，学习状态由用户记录派生。章节专属的说明标题和完成文案也来自内容数据，统一布局可继续复用。首课有完整示范内容，后续章节只有规划结构和简短说明。

## 6. Design System

浅中性底色、深灰文字、蓝色重点。背景、表面、提升表面、主要/次要文字、边框、强调、成功、警告和错误均有语义 Token。排版包含 Display、H1–H3、Body、Body Small、Caption、Code，间距采用统一比例。

桌面为疏朗双列，手机使用上下布局及单列学习路径；主导航、课程卡片和按钮支持键盘与明显焦点。技术解释默认折叠，先阅读直觉说明。支持 prefers-reduced-motion。

## 7. 3D 预留

轻量正交三节点场景只展示 User → Model → Answer。场景接收选中节点及回调，不导入学习 Store，不决定课程跳转或完成。节点 ID 使用统一类型，课程文字不放进 Three 场景。

Three 引擎与场景按需加载。HTML 预加载和入口静态依赖已与 Three 分离；直接进入学习地图无需加载场景。等效 DOM 按钮持续提供文字解释与操作，场景异常只影响图示区域。场景不含复杂动画、粒子、Shader 或 Agent 模拟。

## 8. 测试结果

最终自动检查于 2026-09-12 15:37（Asia/Shanghai）执行：

| 检查 | 结果 |
| --- | --- |
| npm run build | 通过，TypeScript strict 与 Vite 生产构建成功 |
| npm run lint | 通过，无错误或警告 |
| npm run test | 5 个测试文件、35 项全部通过 |
| npm 依赖审计 | 最后安装后显示 0 个已知漏洞 |
| 构建入口依赖 | HTML 和入口静态依赖不包含 Three 引擎 |

35 项测试包含课程数据 2 项、状态与持久化 15 项、页面流程 5 项、可视化失败隔离 1 项，以及场景初始化/生命周期 12 项。后者涵盖无 WebGL、仅 WebGL 1、初始化抛错、异步拒绝、上下文丢失、尺寸变化、零尺寸等待、StrictMode、卸载清理以及避免重复释放上下文。没有现成的 test:e2e 脚本；采用 RTL 集成测试并补充真实浏览器操作验证。

真实浏览器已实际验证 1440×1000、768×1024、390×844、320×740 四组视口的首页、地图和首课。键盘 Tab / Enter / Space、跳过主内容、节点选择、技术解释、完成本节以及刷新后恢复 1/14（7%）均通过。

320 像素加滚动条的横向溢出已修复。修复后，三个页面 clientWidth 与 scrollWidth 都为 305，无横向滚动。检查主要文字和按钮的对比度符合普通文字 4.5:1 基线。未声称完成实体设备、全量屏幕阅读器或正式 WCAG 认证。

最后一次浏览器复验于 15:37:45–15:38:41 完成：完整刷新后依次切换首页、地图、首课、地图，每步等待 800 ms，覆盖 R3F 的延迟清理；新增 error=0、warn=0，重复释放 WebGL 上下文的警告已关闭。生产预览 4173 的首页真实 3D 渲染和节点点击同步也通过，检查期间 error=0、warn=0。Windows 文件监听因短暂文件占用中断的问题已改用轮询并忽略文档/工作目录处理，服务已恢复并通过 HTTP 200 检查。

## 9. 当前限制与已知问题

- 只开放第一章；其余章节、Explore 和 Challenge 属于后续阶段范围。
- Three 核心为 516.61 kB，仍有单个 chunk 超过 500 kB 的体积提示。当前按需加载，gzip 131.53 kB，不影响无场景页面加载；后续复杂可视化加入前需要继续维护体积预算。
- 学习进度保存在当前浏览器，清理站点数据后会丢失；本阶段没有登录、云同步或跨设备进度。
- 浏览器正常 WebGL 路径已实际检查，初始化故障路径使用针对性自动测试验证；不把模拟测试称为真实旧设备实测。

## 10. Phase 2 建议

从 Context 一章开始，先明确“模型此刻看得到什么”的学习目标、交互动作和常见误解，再接入现有课程 schema 与 visualization 接口。增加可视化前先约定场景的状态事件、加载预算和降级验收，然后再逐章扩展。建议保持每次只完成一个能被验证的教学单元。

以上仅为建议。本次没有开发 Phase 2。

## 并行任务与组装

按用户要求新建三个独立 Codex 任务，分别完成页面体验、课程与状态、3D 与工程验收。主任务整合了窄屏溢出、共享分包、可视化失败隔离、课程文案数据化与节点类型统一等修复，并负责最终构建、测试和交付。
