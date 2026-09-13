# Phase 3 Implementation Plan

- 保留：首页、学习地图视觉、导航、设计变量、Phase 2 System Overview、既有学习记录。
- 复用：现有课程布局样式、LessonControls、MisconceptionCard、ProgressIndicator、术语卡与小测的视觉和解锁机制。
- 新增：`features/context-lesson`，19 步教学数据、工作台、来源流程、容量计、相关/噪声对比、八卡整理练习、三题关系测试、四个三层术语卡。
- 动画：每步一张新增卡入台，已有卡保留；Memory / RAG 提取信息轻动画；30/60/90 容量条连续变化。支持 reduced motion，提供文字等价说明。
- 状态：继续使用 Learning Store；新增独立 contextProgress，迁移 v2 记录，派生每章进度及解锁入口。可视化仅读取父状态。
- Challenge：先整理八张信息卡，再完成三道关系题。逐卡解释、即时反馈、支持重试；通过前不记完成。
- Learning Map：开放 Context，完成后更新进度、解锁 Model Inside 预览入口；不开发第三章课程，不自动跳转。
- 测试：build / lint / test，状态迁移与播放、评估及完整课程集成测试，浏览器检查桌面、移动端、导航、刷新和错误日志。仓库没有已有 test:e2e 脚本。
