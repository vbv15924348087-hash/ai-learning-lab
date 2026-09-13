# PHASE 2 COMPLETE

项目：`D:\VBV\ai-learning-lab`。生产预览：<http://127.0.0.1:4173/lesson/system-overview>。开发地址：<http://127.0.0.1:5173/lesson/system-overview>。

用户在实现过程中明确表示「可以不做手机端」，因此最终范围和验收以桌面端为准；已有响应式规则保留，不承诺移动端完成验收。

## 1. 本阶段实现内容

只深化「AI 系统全景」第一章。保留首页、学习地图、全局设计 Token 与首页 3D 场景。以“帮我查 NVIDIA 最新的 AI GPU，并简单告诉我它是什么。”贯穿教学，先用直觉和现象建立理解，再揭示术语。

## 2. 修改文件

- `src/pages/Lesson/LessonPage.tsx`：第一章路由使用专属课程组件。
- `src/content/lessons/index.ts`：首课目标、10 分钟时长、内容与完成文案。
- `src/types/learning.ts`、`src/stores/learningStore.ts`：扩展学习进度、迁移和重温行为。
- `src/stores/learningStore.test.ts`、`src/tests/app.test.tsx`：持久化与课程旅程回归测试。
- `README.md`：当前学习流程与交付入口。
- 新增 `src/features/system-overview/`、`docs/phase2-plan.md` 和本交付说明。

## 3. 新增组件与职责

`SystemOverviewLesson` 组合页面；`SystemScene` 读取步骤渲染；`SystemNode` 提供节点状态与点击；`FlowConnection` 画有向连线；`ExplanationPanel` 同步解释现在发生什么、为什么需要；`LessonControls` 控制节奏；`TerminologyUnlock` 展示学习笔记；`MiniChallenge` 负责情景测验。

`data/systemOverviewSteps.ts` 是 22 步教学数据源；`hooks/useSystemOverviewLesson.ts` 统一推进、门控、播放和解锁。场景不导入 Store，不自行推进课程。

## 4. Lesson Flow

1. 熟悉的一问一答，随后回答“模型是否总能直接知道最新信息”。两种选择都有解释。
2. 把问题、对话、规则和工具说明逐项加入工作台；再命名 Context。
3. 看模型读取任务、判断需要最新资料、选择请求搜索；再命名 Model 与 Tool。
4. 暂停在搜索请求处，点击“继续看”后揭示真正执行者，再命名 Harness。
5. 九步完整演示：提问 → 进入 Context → 交给 Model → 判断需要新资料 → 发出请求 → Harness 调用搜索 → 结果返回 Harness → 放回 Context 并交给 Model → 生成回答。
6. 完整流程后解锁 AI System 和节点探索，再完成挑战。

## 5. 动画实现方式

使用 HTML 节点、SVG 有向连线与 CSS 渐入。新增节点依次出现；当前节点与信息流同步强调；搜索结果沿返回路径经过 Harness 与 Context 回到 Model。每个步骤都有等价文字表达，模拟状态不冒充模型内部思考。

播放支持上一、下一、自动（每步 7.5 秒）、暂停、重新开始。两处互动会自动暂停；手动切换也暂停；离开页面或隐藏标签会清理/暂停定时器。手动推进时，若图示已滚出视口，会将图示带回视野。

`prefers-reduced-motion` 下关闭位移和路径动画，保留状态高亮与完整文字。

## 6. Terminology Unlock

按 Context → Model → Tool → Harness → AI System 顺序解锁五词。未解锁只显示中性占位；解锁后出现英文、中文和一句话解释。初始 USER / MODEL / ANSWER 简图按需求保留，不提前显示后续运行概念。

## 7. Challenge

第一题用键盘可操作的下拉框补全 Context、Harness；第二题判断是否由模型自行访问互联网。点击“检查答案”后逐项反馈，错误时聚焦相应控件。必须全部正确才写入通过和章节完成，不能只点完成按钮跳过。

通过后显示“你已经能读懂第一张 AI 系统架构图了”、五个已掌握术语、完整回路与回到地图入口。可查看答案解释和重看流程。

## 8. Learning State

保留原有状态，新增 `currentStep`、`furthestStep`、`unlockedTerms`、`predictionChoice`、`harnessRevealed`、`challengePassed`、`lessonCompleted`。完成写入 `completedLessonIds: ['system-overview']`，地图显示 1 / 14、7%。

存储版本升级至 v2。迁移保留 Phase 1 历史完成，但不会凭空授予新测验成绩或术语。清洗无效步骤、未知术语、错误类型和重复数据。重启当前课程保留历史成绩与术语，重置本轮步骤及互动；刷新恢复位置，但自动播放保持暂停。存储不可用时，当前标签仍可学习。

## 9. Build / Lint / Test

最终自动验收于 2026-09-12 16:12–16:13（Asia/Shanghai）完成：

| 检查 | 结果 |
| --- | --- |
| `npm run build` | 通过，TypeScript 与生产构建成功 |
| `npm run lint` | 通过 |
| `npm run test` | 7 个文件，69 项全部通过 |
| `npm run test:e2e` | 原项目无此脚本；以真实浏览器操作补充验收 |

测试包括：Store 27 项、播放 hook 13 项、测验/术语 9 项、App 5 项、原场景生命周期 12 项、故障隔离 1 项、课程注册 2 项。

真实浏览器已检查：首页 → 地图 → 第一章；互动的正确/错误反馈；全部 22 步及九步回放；自动推进和暂停；上一步；七个可点击节点；键盘 Enter；术语；测验错误不能完成；全对后地图 7%；中途刷新、通过后刷新；重启保留成绩。测试使用独立本地来源保存验收进度。

桌面 1440 与 1280 宽度检查通过；1280 视口实际可用宽度 1265px，`scrollWidth` 同为 1265px，无横向溢出。浏览器错误与警告记录为空。减少动态效果的媒体规则已在真实浏览器中解析检查，未切换操作系统偏好进行人工实测。

## 10. 已知边界

- 教学模拟不实时访问 NVIDIA，不声称某个具体型号现在最新。
- 延续原项目 Three 核心包 516.61kB 的构建体积提示，仅首页场景按需加载；本章新场景使用 2D，不新增 Three 依赖。
- 学习进度保存在当前浏览器来源，不跨端同步。
- 按用户最新要求，手机端不在本轮验收范围。

## 11. Phase 3 建议

先请没有技术背景的人体验第一章，让其复述“信息怎么到模型、谁请求、谁执行、结果怎么回来”。根据复述中的实际卡点调整本课；人工验收之后，再考虑单独展开 Context。当前未开始后续章节。

## 并行协作

主任务负责教学数据、页面整合与真实浏览器验收；三个子代理分别完成场景、学习状态/集成测试、术语/挑战及独立教学审阅。结果已全部回归本主任务。
