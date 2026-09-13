# PHASE 3 COMPLETE

验收日期：2026-09-12。按用户最新要求，以桌面端为验收重点。三个并行子任务已回归主任务整合，未启动 Phase 4 开发。

## 1. 本阶段实现内容

新增「02 Context」专章，沿用上一章 NVIDIA 查询案例。通过认知判断、逐张资料装配、来源追踪、容量变化、相关/噪声对比、亲手整理与关系小测，建立「Context 是模型当前这一次推理真正能看到的全部信息」的理解。

首页、导航、学习地图结构、原有设计变量、第一章完整课程保持延续。未增加依赖、后端、真实搜索、AI API 或新 3D 场景。

## 2. 修改文件

| 文件 | 用途 |
| --- | --- |
| `src/stores/learningStore.ts` / `.test.ts` | 独立第二章状态、v3 迁移、完成条件、恢复学习与后续入口 |
| `src/types/learning.ts` | 第二章状态与课程可视化类型、预览解锁状态 |
| `src/content/lessons/index.ts` / `lessons.test.ts` | 发布 Context，更新课程目标与元数据 |
| `src/pages/Lesson/LessonPage.tsx` | 路由接入 Context，提供第三章已解锁预览 |
| `src/pages/Learn/LearnPage.tsx` | 两章开放文案及继续学习入口 |
| `src/features/learning-map/LessonCard.tsx` | 呈现已解锁预览卡片 |
| `src/features/system-overview/SystemOverviewLesson.tsx` | 第一章底部连接 Context |
| `src/features/system-overview/components/LessonControls.tsx` | 可选步骤总数与演示起点，默认行为保持第一章设置 |
| `src/styles.css` | 预览解锁状态沿用现有可开始样式 |
| `src/tests/app.test.tsx` | 更新两章开放与后续锁定预期，继续验证 Phase 1 / 2 |
| `README.md` | 更新当前阶段、课程入口、进度和文档链接 |

新增功能全部位于 `src/features/context-lesson/`；实施计划为 `docs/phase3-plan.md`。验证日志为 `work/phase3-build.log`、`work/phase3-lint.log`、`work/phase3-test.log`。

## 3. 新增组件

`ContextLesson` 负责课程组合；`ContextExplanation` 负责右侧讲解；`ContextWorkspace` 根据步骤呈现可视化。

展示组件包括 `ContextWorkbench`、`ContextCard`、`ContextSourceNode`、`ContextFlow`、`ContextWindowMeter`、`ContextComparison`；学习互动包括 `ContextEngineeringChallenge`、`ContextMiniChallenge`、`ContextTerminology`。

教学步骤、来源、八张练习卡和术语分别存放于 `data/`。课程控制位于 `hooks/useContextLesson.ts`，可视化通过回调通知父级，不自行更改课程步骤。

## 4. Context Lesson Flow

19 步分为四段：

1. 01–09：先选直觉，依次加入问题、规则、对话、工具说明、取出的记忆、找回的资料、工具结果，再解释 Prompt 是 Context 的一部分。
2. 10–11：点击来源，区分 Memory 仓库、RAG 检索方法与 Context 工作台。
3. 12–15：观察 30% → 60% → 90% 容量变化，解锁 Context Window，再比较相关信息与混杂信息。
4. 16–19：理解筛选与组织，亲手完成八卡练习，认识 Context Engineering，最后阅读关系总图并完成三道小测。

首步判断与整理练习是教学门槛。支持前进、后退、7.5 秒自动播放、暂停和重新开始。来源点击、模式切换与练习操作会暂停播放；切到后台也会暂停。

## 5. Context Assembly 动画方案

每步只让新增的一张卡入场并高亮，已加入的卡维持稳定 key 和 DOM 节点。520ms 轻位移与淡入配合来源标签、右侧同步解释；工作台使用半透明底色、细边框与浅层叠投影。

无粒子、复杂材质或自由镜头。信息流始终有文字说明。`prefers-reduced-motion: reduce` 会禁用动画与过渡，同时保留信息内容、数字与操作。

## 6. Memory / RAG / Context 关系实现

Memory 显示「长期仓库 → 取出相关偏好 → Context」。RAG 显示「外部知识 → 搜索 / 检索 → 相关资料 → Context」。七个来源均可点击，右侧提供解释与实际放入工作台的内容。

切换来源时，主图、讲解和底部信息流同步更新。教学数据特别解释检索资料与工具结果可能重叠、实际使用时应去重，避免暗示必须重复提供。

## 7. Context Window 实现

容量条分三步从 30% 增加至 60%、90%，由蓝色变为接近边界的暖色。显示已用数字、两端准确刻度及状态文字，明确比例是教学示意。

先体验容量再命名；强调当前工作台容量与长期 Memory 容量不同。token 仅在术语的折叠技术补充中用一句话介绍。

## 8. Context Engineering Challenge

八卡支持点击或键盘选择。必选 1 / 2 / 4 / 7；排除无关聊天、旅游文章与重复网页；昨天的项目要求属于 Depends，可选或不选，但解释需要先判断关联。

练习明确当前仍可能继续搜索，因此需要工具定义；官方页面用于核对原始细节，摘要提供互补要点。错误提交逐卡解释并聚焦第一处需要调整的卡片，允许修正重试。通过后显示术语与答案回顾。

## 9. Terminology Unlock

四个核心术语：Prompt、Context、Context Window、Context Engineering。未到对应教学节点时隐藏名称，已解锁术语显示「人话 → 准确定义 → 折叠技术补充」三层内容。

重播保留已认识术语。辅助来源术语在相关流程内解释，不扩展成新的技术课程。

## 10. Learning State 更新

保留第一章原有字段，在同一 Learning Store 中加入独立 `contextProgress`，含步骤、最远位置、术语、判断选择与两类练习成绩；新增派生 `lessonProgress` 和 `unlockedLessonIds`。

存储格式升级 v3，兼容 v1 / v2 历史记录，不把旧阶段未发布的 Context 错误记录当作完成。第二章必须到达末步、通过整理练习并通过小测才可记录完成。重播保留已获成绩，总进度不重复累加。

两章均完成时地图为 2 / 14（14%）。完成 Context 后解锁 Model Inside 预览链接；第三章保持未发布，不能记录完成，也不会自动进入。

## 11. Build / Lint / Test 结果

- `npm run build`：通过，输出到 `dist/`。
- `npm run lint`：通过。
- `npm run test`：11 个测试文件、106 项测试全部通过。
- 仓库没有 `test:e2e` 脚本，使用 Browser 实际操作补充验证。

测试包括旧课程完整流程、持久化迁移、章节隔离、恢复学习、播放与门槛、整理练习纠错、小测即时反馈、最终地图更新，以及进入答题时暂停回放。

桌面浏览器检查覆盖：第一章自动播放并在判断题暂停、第一章到第二章链接、Context 全部步骤、来源切换、容量三阶段、噪声切换、错误提交与修正、三题小测、刷新保存、完成地图、第三章预览与重新开始。检查期间页面控制台无 error。

用户提出无需手机端之前，已做窄屏基础检查并保留相应响应式样式；不作为本次最终验收要求。Reduced motion 已检查 CSS 规则与文字等价内容，未在浏览器运行时切换系统偏好模拟。

## 12. 已知问题

未发现阻塞本章学习或完成流程的问题。构建仍提示已有 `three-core` 资源约 516.61 kB，来自原有首页 3D 依赖，Context 本章没有增加 Three.js 场景。

学习记录按浏览器和站点来源保存，不跨设备同步；所有 GPU 内容是教学示例，没有声称任何具体型号当前最新。Model Inside 目前只是已解锁的待建设入口。

## 13. Phase 4 建议

人工验收本章后，再单独规划 Model Inside：延续同一个问题，先解释逐步生成现象，再引入新的术语。当前停止在 Phase 3。
