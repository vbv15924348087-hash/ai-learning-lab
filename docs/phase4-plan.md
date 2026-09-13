# Phase 4 Implementation Plan

本阶段仅交付 Model Inside。保留首页、导航、学习地图结构、设计变量、Lesson Layout、既有学习进度与 Phase 2 / 3 的课程。用户补充要求“不做手机端”，以桌面端实现与验收为准，不再追加手机端开发与验证。

- 复用：课程版式、步骤条、术语卡样式、MisconceptionCard、ProgressIndicator、SceneCanvas 和现有测试框架。
- 新增：9 步 Model Inside 课程；文字拆分、数字表示、Transformer Explorer、Attention Explorer、候选分数、逐 Token 生成、静态训练对比、流程总结与三题挑战。
- 核心 3D：仅 Transformer 多层结构使用 R3F；程序化几何、一次进入镜头、按需渲染、可点击计算层，支持播放、暂停和重启。
- 核心 2D：Attention 使用定性关系线；生成过程逐步附加 Token 并更新候选，明确标示教学模拟。
- 可发现性：每步明确操作提示和下一步 CTA；原生按钮、focus 与 hover；深入知识统一为“深入一点 →”和“查看技术解释 →”。
- 状态：数据定义教学步骤，hook 管理门槛和术语；独立 modelInsideProgress 持久化，与可视化解耦，兼容旧进度。
- 降级：减少动态效果或 WebGL 不可用时提供完整可操作层叠视图；减少动态效果使用手动生成。已写入的基础窄屏样式保留，但不做手机端交付。
- 验证：执行 build / lint / test；新增状态、互动、整章通关测试；浏览器检查桌面、3D、恢复进度、挑战与地图。

协作：三个子代理分别实现状态与数据、3D 场景和 2D 互动。主任务完成页面整合、基础演示、术语与挑战、浏览器验证和交付。Tools 仅解锁现有预览，不实现下一阶段。
