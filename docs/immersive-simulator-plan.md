# Immersive Explore Upgrade Plan

日期：2026-09-13。目标：在现有 `/explore` 与沉浸模式基础上，将单一任务演示升级为可比较、可解释的 AI System Simulator。用户本轮明确不要求移动端；桌面、键盘、Reduced Motion、旧页面回归仍在范围内。

## 输入与现状

需求参考文件为 `C:/Users/岁翎/Downloads/Explore_Immersive_AI_System_Simulator_Goal.md`。文件中的角色描述和执行话术作为需求背景；实际工作范围由用户的“完成该任务，不必管移动端”确定。保留当前探索及课程主线，通过现有沉浸层增量实现。

当前已有真正的窗口级全屏 dialog、可选浏览器 Fullscreen、折叠侧栏、独立状态控制器、六核心地图、单一 17 步任务、三核心内部结构、X-Ray、五组实验、搜索、解释深度、键盘退出与 Reduced Motion。主要差距是六类任务、复杂度阶梯、地图路径对比、逐任务 Why / Why Not、人工审批分支与长期 Context 容量变化。

在仓库及其父目录的有界文件搜索中未找到 `QUALITY_GATE.md`；历史审查记录保留七维评分和阈值。先采用本轮附件的明确 Hard Fail、现有测试和历史质量维度推进，来源文件缺失不阻塞已经授权的实现。若后续找到原文件，再补充核对。

## Stage A — Immersive Shell

保留 Portal + modal dialog 的顶层覆盖、body 滚动恢复、退出焦点恢复、可选原生全屏与拒绝降级。加入任务入口和模式入口，默认侧栏折叠，场景占主要面积；核对桌面 1440 × 900 与 1280 × 800，默认页 Header / Footer / Task Bar 不能露出。

验证：相关集成测试、Build / Lint / Test；实际浏览器检验遮盖范围、退出和焦点。

## Stage B — Node Visual Hierarchy

复用现有几何、位置与材质风格，强化 S / A / B / C 角色差异：Model 几何核心、Harness 控制平台、Context 信息容器、Agent Loop 环、RAG 漏斗、Memory 档案、Verification 检查点、Guardrail 闸门、MCP 连接器与工具组。

验证：数据类型和现有场景回归；独立查看真实桌面截图核对层级、标签、相机可恢复性。

## Stage C — Dynamic Path Engine

任务数据独立于 JSX，定义步骤、解释、当前信息包与活动连接。路径状态覆盖 idle / upcoming / active / completed / disabled；请求与结果同时通过线型、方向及标记区分。只让当前活动步骤产生有限动画。复用可播放、暂停、重启、拖动和逐步选择的 Timeline。

验证：有意义的顺序、边端点、完成状态和暂停测试；Reduced Motion 保留完整手动流程。

## Stage D — Task Examples

新增简单问答、实时查询、PDF 总结、深度研究、高风险操作、长周期 Agent 六类任务。同一系统地图显示明显不同路径；深度研究必须有多次工具调用及循环，高风险在人工 Approve / Reject 前停止，长周期呈现 38 → 72 → 91 → Compaction → 34 的上下文变化。提供 GPU 主题五级复杂度阶梯和六轴“教学示意”复杂度仪表。

验证：全部任务可完整浏览，Web 与 File 分支不同，审批无法通过时间轴跳过，Reject 后不执行 Database；课程状态与默认 URL 不写入。

## Stage E — Compare / Why

同一地图展示两任务路径；可看全部、共同、新增和差异，使用文字标记及线型辅助区分。任务解释能逐节点回答 Why This Path，点击不在当前路径上的节点能回答 Why Not。保留任意连接线的职责解释。

验证：简单与研究的共同路径和新增节点准确，筛选影响三维图而非只有文字；2D 控件和键盘可访问全部解释。

## Stage F — X-Ray / Experiment

保持 Context / Model / Harness 单模块展开及 L2 搜索进入内部。延续五组模块关闭实验、结果回流断开、恢复系统，并与任务路径新引擎衔接。

验证：模块归属与场景端点完整；实验条件切换重置时间轴且保留正确差异说明；模拟始终不调用真实外部动作。

## Stage G — Polish / Quality Review

完善搜索、三级解释、F / R / Space / 左右键、输入框快捷键隔离、页面隐藏暂停、卸载清理、WebGL 失败替代入口。核对按需渲染、有限 packet、Drawer 不重建 Canvas。执行最终 Build、Lint、全量 Test 与桌面浏览器回归，记录实际输出及性能样本范围。

最终审查以 `docs/immersive-simulator-review.md` 为准；历史报告中的 PASS 不代表本轮新增功能已经验收。移动端记 N/A，真人 5 / 15 / 30 / 60 秒学习效果仅作为走查目标，不声称已经完成真人试验。
