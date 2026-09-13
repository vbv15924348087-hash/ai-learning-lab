# Phase 2 Implementation Plan

基于现有 React 19 + Vite + TypeScript + Zustand 项目，仅完成「AI 系统全景」第一章。

- 保留：首页、学习地图、路由、全局 Design Tokens 与首页轻量 Three 场景。
- 修改：首课内容、首课路由分流、Learning Store v2 与相关集成测试。
- 新增：`features/system-overview` 内的数据、控制 hook、2D 场景、解释、播放控制、术语笔记与小挑战。
- 状态：Zustand 保存当前位置、最远位置、选择题回答、Harness 揭晓、术语与测验通过；统一 hook 控制步骤，UI 和 Scene 读取同一 LessonStep。播放及临时节点焦点不持久化。
- 动画：CSS/SVG 渐进出现与有向信息流；上下文的四项内容逐步加入；关键疑问暂停；9 步完整流程可手动和自动播放；尊重 reduced-motion。
- 测试：build、lint、test；迁移与异常存储、互动门控、暂停/重启、术语、测验、地图写回及刷新恢复；使用真实浏览器检查桌面、窄屏、键盘和 Console。

页面沿用 2D 教学表达，不接入实时搜索、AI API、后端或下一章。示例不宣称任何 GPU 型号是实时最新。
