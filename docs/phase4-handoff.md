# PHASE 4 COMPLETE

交付日期：2026-09-12。三个并行子任务已回归主任务整合。按用户最新要求，仅做桌面端交付与验收。

本次修订针对用户反馈的“数字表示”和“层层计算”难以理解，重做这两处演示。下文已更新为当前设计；第 15 节保留本次修订前的验收记录，第 18 节记录本轮验收。

## 1. 本阶段实现内容

完成「03 Model Inside」专章。沿用已有导航、学习地图、白色与蓝色设计语言、课程工作区、术语卡和进度保存机制。课程以 NVIDIA 查询衔接前后章节；Embedding 改用“苹果”演示查表，Transformer 对照“我刚吃了一口苹果”和“我用的手机来自苹果”；Attention 使用“小明把苹果给了小红，因为她很饿”。

## 2. 修改文件

新增功能与测试位于 `src/features/model-inside/`。

现有文件改动：`src/pages/Lesson/LessonPage.tsx` 接入课程；`src/pages/Learn/LearnPage.tsx` 更新三章开放状态；`src/features/context-lesson/ContextLesson.tsx` 增加直接进入模型内部的 CTA；`src/content/lessons/index.ts` 发布课程并更新元信息；`src/types/learning.ts` 和 `src/stores/learningStore.ts` 扩展独立状态；`src/styles.css`、两处原有解释组件统一深入入口的文字和 hover。

相应更新课程数据、状态、Context 与应用回归测试，以及 README。计划见 `docs/phase4-plan.md`。

本次主要修订 `EmbeddingDemo.tsx`、`embedding-demo.css`、`embeddingDemoData.ts`、`TransformerExplorer.tsx`、`TransformerScene.tsx`、`transformer.css`、`transformerDemoData.ts`，并同步课程案例、步骤解释和相关测试。

## 3. 新增组件

`ModelInsideLesson` 组合课程；`ModelStepExplanation`、`ModelTerminology`、`ModelMiniChallenge`、`ModelFlowSummary` 呈现解释、术语、挑战与总结。

演示组件为 `TokenizationDemo`、`EmbeddingDemo`、`TransformerExplorer` / `TransformerScene`、`AttentionExplorer`、`TokenPredictionDemo`、`TrainingInferenceCompare`、`TemperatureExplorer`。`InteractionHint`、`DeepDivePanel` 提供一致的入口与提示。

## 4. Model Inside Lesson Flow

9 步：Context 衔接 → 文字拆分 → 数字表示 → Transformer 多层计算 → 放大层内 Attention → 候选打分 → 逐 Token 生成 → Training / Inference → 完整关系回顾。

最后通过三道流程挑战。Attention 在总图和挑战中明确嵌入 Transformer 层内部，避免误解为多层处理之后的独立工序。

## 5. Tokenization 实现

完整句子通过明确按钮拆为 7 个教学小块，轻微错开入场；操作后解锁 Token。始终标注切分为教学示意，实际由 tokenizer 决定，不等同于汉字或单词。

## 6. Embedding 演示

以“苹果”为默认示例，按“找到编号 → 按编号取卡 → 把整组数字交给计算”分步操作。右侧展示 3 行数字表，按编号高亮对应行，再将该行相同的 4 个数取到数字卡。可切换“手机”或“GPU”重看查表。

取卡后回答“哪一个交给模型计算”：选择编号会得到解释，选择整组数字才完成互动并解锁 Embedding。编号仅用于定位，不表示概率或重要性，也不是通过算术变成向量；真实表值在训练中学到。示例切分、编号和数值均为教学示意。结尾连接下一步：同一个“苹果”查表得到相同初始表示，后续计算再结合前文更新它。

## 7. Transformer 多层计算与位置图

以两句前文中的同一个“苹果”为对象，展示“本层收到的数字 → 结合前文的数字表示做计算 → 本层交出的数字”。两句共享 Embedding 演示中的初始数字卡；计算后的示意值不同，用水果与公司说明上下文差别，不将某个数解释为固定词义。

用户先让本层计算，再将输出原样交给下一层，依次走过 5 层。尚未计算的输出保持隐藏，跳看后续层会提示等待前一层。可切换句子比较同一轮的结果；完成 5 轮并对比前文后确认完成，解锁术语和下一步。支持自动演示、暂停与重启，末尾可展开完整接力表核对“上一层输出 = 下一层输入”。

5 层 3D 与简化位置图辅助定位当前计算轮次，层选择与左侧计算卡同步。使用已有 SceneCanvas；WebGL 或加载失败时保留简化视图和完整 HTML 操作。页面隐藏、互动区离屏时暂停计时和持续渲染，卸载时清理资源。数值是人为编写的机制示意，不是实测输出、概率或真实语义解码；各层没有固定业务分工。

## 8. Attention Interaction

首次提示“试试看：点击「她」”，按钮具有单次提示、hover、focus 与当前选中状态。支持句中各词探索，动态更新观察对象、SVG 连线和解释。对“她”显示小红重点关注、小明次要参考、苹果较弱关联。

无伪真实概率；关系为教学示意。数据采用可参考前文的关系，避免生成式模型直接引用未来位置的误解。

## 9. Next Token Generation

候选 A / B / C 条形图解释打分；随后手动或自动生成 12 个示意 Token，形成“NVIDIA 的最新 AI GPU 信息需要结合官方资料核对。”每一步更新候选，并显示 Context + 已生成内容 → Model → 下一个 Token → 加入输出 → 重复。

支持暂停、重启、后台暂停；完整生成后才能继续主线。固定演示路径与示意切分都有明确标注，不使用具体 GPU 型号暗示当前事实。

## 10. Training vs Inference

静态对比训练过程改变参数，与当前 Context 驱动已训练模型进行计算。明确正常聊天不等于重新训练。推理模型投入更多计算的解释位于可选深入面板。

## 11. Interaction Discoverability 改进

每步有明确操作与下一步 CTA；未完成互动时显示原因。复杂交互先显示提示，按钮具备边框、pointer、hover 和 focus。深入入口统一为“深入一点 →”“查看技术解释 →”。桌面 Embedding 突出查表与取卡的对应，Transformer 突出输入、计算、输出的接力，位置图辅助观察。

## 12. Terminology Unlock

只将 Token、Embedding、Transformer、Attention、Inference 放入 5 个核心术语卡，分别包含人话、准确定义和折叠技术补充。Tokenizer、Self-Attention、Logits、Sampling、Temperature 保持可选，不阻塞主线。

## 13. Learning State 更新

Zustand 持久化升级到 v4，独立存储当前步骤、最远步骤、互动成果、术语、总结与挑战状态。兼容 v1 / v2 / v3 的已有进度；重温保留成果。

完成状态要求全部 5 项互动、抵达总结并通过挑战。修复损坏存档位置及无依据成果；重复完成回调幂等。完成后地图显示 Model Inside 已完成，并解锁 Tools 的已有预览，不自动跳转。

## 14. 桌面与 Reduced Motion

按用户“不做手机端”的要求，不进行手机端交付或验收。先前写入的基础窄屏样式保留。

减少动态效果模式禁用入场与持续动画，使用静态位置图与手动操作，保留数字卡、层间接力、前文对照和完成路径。

## 15. 本次修订前的 Build / Lint / Test 验收记录

以下为首次 Phase 4 交付的历史结果，不代表本次演示修订已通过全量检查或浏览器验收。

- `npm run build`：通过。
- `npm run lint`：通过，0 error / 0 warning。
- `npm run test`：16 个测试文件、146 项测试全部通过。
- 项目没有 `test:e2e` 脚本。新增完整 React 集成通关测试，并执行浏览器生产预览验收。
- `node work/check-bundle.mjs`：通过；Three.js 不在初始静态依赖树，也没有被首屏 preload。

浏览器生产预览使用独立的 `127.0.0.1:4174`，避免改动正在查看的开发页面进度。已验证前进门槛、3D 层选择/播放/暂停/重启、Attention 提示与关系、候选打分、逐 Token 生成、Temperature 分布、刷新恢复第 8 步、错误答案不完成、正确答案完成、地图更新及 Tools 预览。生产预览控制台无 error / warning。

Phase 1 / 2 / 3 的自动化回归全部通过。新增测试还覆盖减少动态效果、WebGL 失败、隐藏/离屏暂停、卸载清理、异常存档恢复及旧进度兼容。

## 16. 已知限制

修订前构建保留 Three.js 核心分包约 516.61 kB（gzip 131.53 kB）的体积提示；该包按需加载，未修改阈值掩盖提示。未进行跨设备 FPS 基准测试；上述桌面视觉、加载边界和暂停/卸载检查属于修订前验收记录。

所有 Token、数字表示、候选、关系与 Temperature 数据为明确标示的教学示意。没有真实模型 API 或训练过程。首次交付开发过程中曾因修改 hook 结构产生热更新错误，刷新后消除；修订前的独立生产预览没有复现。

## 17. Phase 5 建议

下一阶段可继续沿用这套教学与状态结构开发 Tools：先看到模型请求，再看到系统执行，最后把工具结果带回 Context。当前仅保留预览入口，未启动后续章节。

## 18. 易懂性修订验收（2026-09-12）

- `npm run build`：通过；Three.js 核心分包仍有 516.61 kB 的体积提示。
- `npm run lint`：通过，0 error / 0 warning。
- `npm run test`：17 个测试文件、151 项测试全部通过，包括既有章节回归与新版完整通关流程。
- 独立开发预览实测查编号、表格高亮、取出相同数字、选错编号不解锁、交出整组数字后解锁；Transformer 两句的初始向量一致，前文变化产生不同的示意输出，上一层输出原样成为下一层输入。
- 浏览器实测五层计算与传递、前文切换、自动演示与暂停、3D / 简化位置图切换，以及确认完成后解锁下一步。页面日志无 error / warning。
- 已刷新用户的 `127.0.0.1:4174` 生产预览，检查两处新版内容和交互；原有已完成状态、5 个术语与挑战成果仍保留。开发与生产预览在实际 1265 px、1043 px 桌面内容宽度下均无页面横向溢出。

本轮仅验收桌面端。示例值为人为编写的机制说明，不连接真实模型 API。
