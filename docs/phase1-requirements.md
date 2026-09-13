# Phase 1 Goal — AI 大模型学习网站基础骨架

## 任务目标

基于当前项目，先完成「AI 大模型学习网站」的第一阶段开发。

这一阶段的目标不是把完整 3D 学习网站一次性做完，而是先建立一个稳定、清晰、可继续扩展的产品骨架，为后续 Context、RAG、Memory、Agent Loop、Harness、MCP、Verification、Multi-Agent 等教学模块提供统一基础。

这一阶段必须优先保证：

- 项目结构清晰
- 页面可以正常运行
- 信息架构明确
- Design System 统一
- 内容数据结构可扩展
- 学习状态可管理
- 后续 3D 场景能够自然接入
- 不产生大量技术债

不要为了“看起来完整”提前堆大量功能。

---

# 一、当前阶段只做什么

Phase 1 只完成以下内容：

1. 检查并理解当前 repository
2. 确认已有技术栈
3. 建立整体项目架构
4. 建立 Design System
5. 建立 Learning Content Schema
6. 建立 Learning State
7. 建立基础页面结构
8. 建立基础导航与章节系统
9. 建立首页
10. 建立学习主页 / Learning Map
11. 预留 3D Visualization 接口
12. 确保 Build / Lint / Test 正常

不要进入完整 3D 场景开发。

不要开始实现完整 Agent Loop。

不要开始实现 RAG 动画。

不要开始实现 MCP 动画。

不要一次性开发所有章节。

---

# 二、开发前必须先检查项目

开始编码之前，先检查当前代码库。

必须回答：

1. 当前使用什么框架？
2. 当前使用什么构建工具？
3. 当前是否已经使用 TypeScript？
4. 当前是否已经使用 Tailwind？
5. 当前路由方案是什么？
6. 当前状态管理方案是什么？
7. 当前是否已经存在 Three.js / React Three Fiber？
8. 当前目录结构是否合理？
9. 哪些已有代码可以直接保留？
10. 是否存在明显技术债或重复实现？

如果已有项目结构可用：

> 优先在现有项目上迭代。

不要无理由重新初始化项目。

不要删除已有正常功能。

---

# 三、推荐技术栈

如果当前项目没有明确技术栈，可以使用：

```text
React
TypeScript
Vite

Styling:
Tailwind CSS

Routing:
React Router

State:
Zustand

3D（仅预留，不大规模实现）:
Three.js
@react-three/fiber
@react-three/drei

Animation:
Framer Motion

Testing:
Vitest
React Testing Library
Playwright
```

如果已有项目技术栈不同，但成熟、稳定，则优先沿用。

不要为了匹配这份文档而强制重构。

---

# 四、产品定位

这是一个面向 AI / 大模型纯新手的交互式学习网站。

用户可能完全不知道：

- Token
- Transformer
- Attention
- Context
- RAG
- Memory
- Tool
- MCP
- Agent
- Harness

因此整个网站的设计原则是：

```text
先建立直觉
↓
再解释关系
↓
再引入术语
↓
最后进入技术细节
```

禁止一上来堆技术定义。

---

# 五、Phase 1 页面结构

本阶段至少建立以下页面或核心区域。

## 1. 首页 Home

首页第一屏不要堆概念。

建议核心文案：

```text
你每天都在和 AI 对话。

但当你输入一句话之后，
里面到底发生了什么？
```

核心 CTA：

```text
进入 AI 内部
```

首页需要传达：

> 这是一个通过交互和可视化学习现代 AI 系统的产品。

不要做成长篇教程页。

---

## 2. Learning Map

建立一个学习地图。

初始章节结构：

```text
01  AI 系统全景
02  Context
03  Model Inside
04  Tools
05  Agent Loop
06  Harness
07  RAG
08  Memory
09  MCP
10  Workflow vs Agent
11  Multi-Agent
12  Verification
13  Guardrail
14  Compaction
```

Phase 1 只需要建立结构和状态。

不要求把所有章节内容做完。

章节状态至少支持：

```text
locked
available
in-progress
completed
```

---

## 3. Lesson 页面骨架

建立统一 Lesson Layout。

页面至少预留：

```text
Lesson Header

Learning Goal

Main Visualization Area

Explanation Panel

Beginner Explanation

Technical Explanation

Common Misconception

Previous / Next Lesson

Progress
```

后续每个章节都复用这一套结构。

---

# 六、Design System

建立一套克制、统一、现代的视觉系统。

整体风格：

- 极简
- 高级
- 空间感强
- 中性色
- 轻科技感
- 高可读性
- 不赛博朋克
- 不做传统 Dashboard

参考气质：

- Apple
- Linear
- Stripe
- Vercel
- Observable

不要直接复制任何品牌。

---

## 色彩

建议建立语义 Token：

```text
background
surface
surfaceElevated
textPrimary
textSecondary
border
accent
success
warning
danger
```

不要在组件里到处硬编码颜色。

---

## Typography

至少定义：

```text
Display
Heading 1
Heading 2
Heading 3
Body
Body Small
Caption
Code
```

保证：

- 新手阅读舒适
- 中文排版清晰
- 英文术语可识别
- 技术代码块区分明显

---

## Spacing

建立统一 spacing scale。

例如：

```text
4
8
12
16
24
32
48
64
```

避免各组件随意写 margin / padding。

---

# 七、内容必须数据驱动

不要把大量教学内容直接写死在组件中。

建立统一类型。

例如：

```ts
export type Lesson = {
  id: string
  order: number
  title: string
  subtitle?: string

  learningGoal: string

  beginnerExplanation: string
  analogy?: string

  technicalExplanation?: string

  misconceptions?: {
    wrong: string
    correct: string
  }[]

  relatedConcepts?: string[]

  status?: "locked" | "available" | "in-progress" | "completed"
}
```

建立类似：

```text
src/content/lessons/
```

所有课程内容统一管理。

---

# 八、Learning State

建立统一学习状态。

推荐使用 Zustand。

至少保存：

```ts
currentLessonId
completedLessonIds
currentMode
progress
```

为后续预留：

```ts
challengeScores
unlockedConcepts
selectedNode
guidedTourStep
```

但本阶段不要过度实现。

---

# 九、学习模式预留

未来会存在三种模式：

```text
Guided Tour
Explore
Challenge
```

Phase 1 可以先建立类型和 UI 入口。

但只需要：

```text
Guided Tour
```

能够正常进入。

其他模式可以显示：

```text
Coming in later phase
```

但不要出现不可点击却像可用功能的假交互。

---

# 十、3D 架构预留

Phase 1 不需要制作完整 3D 系统。

但是必须把架构设计好。

要求 3D 与教学 UI 解耦。

正确关系：

```text
Learning State
     │
     ├── React UI
     │
     └── Three.js Scene
```

禁止：

Three.js Scene 自己管理课程流程。

建议提前建立：

```text
src/components/three/
src/features/system-map/
```

可以实现一个非常轻量的 Placeholder Scene：

```text
User Node
↓
Model Node
↓
Answer Node
```

目的只是验证：

- R3F 正常工作
- 页面布局合理
- 3D 与普通 UI 可以共存
- 后续可以扩展

不要在 Phase 1 制作复杂动画。

---

# 十一、建议目录结构

可以参考：

```text
src/

  app/
    router/
    providers/

  pages/
    Home/
    Learn/
    Lesson/

  components/
    ui/
    layout/
    learning/
    visualization/
    three/

  features/
    learning-map/
    lesson/
    system-map/

  content/
    lessons/
    concepts/

  stores/
    learningStore.ts

  hooks/

  lib/

  types/

  tests/
```

目录不是必须完全一致。

原则是：

> 清晰、简单、可维护。

不要为了“架构高级”制造大量空文件夹。

---

# 十二、核心组件

Phase 1 至少需要合理实现：

```text
AppLayout
TopNavigation
HomeHero
LearningMap
LessonCard
LessonLayout
ProgressIndicator
ConceptTag
ExplanationPanel
MisconceptionCard
VisualizationContainer
```

如果引入 R3F：

```text
SystemMapCanvas
SystemNode
```

先保持轻量。

---

# 十三、首页体验

首页应该有明确的视觉焦点。

建议结构：

```text
Hero

一句核心问题
+
简短解释

CTA
进入 AI 内部

↓

一个极简 AI 系统预览

User
↓
Model
↓
Answer

↓

提示：

“真正的系统远比这复杂。”
```

用户点击 CTA 后进入 Learning Map。

---

# 十四、Learning Map 体验

不要做普通课程列表。

最好做成：

> 一张 AI System Learning Journey。

例如：

```text
AI System
   │
   ├─ Context
   ├─ Model
   ├─ Tool
   ├─ Agent Loop
   └─ Harness
```

Phase 1 不需要复杂动画。

但视觉上应该已经让用户感觉：

> 这些知识属于同一个系统。

---

# 十五、响应式

Desktop：

完整体验。

Tablet：

保持学习地图结构。

Mobile：

不要单纯把桌面页面缩小。

确保：

- 不横向溢出
- 卡片正常换行
- 导航可用
- 教学内容可读
- 3D Canvas 不遮挡 UI

---

# 十六、Accessibility

必须做到：

- 可键盘导航
- 清晰 Focus State
- Button 使用 button
- Link 使用 link
- 合理 aria-label
- 文字对比度足够

预留：

```css
prefers-reduced-motion
```

后续复杂动画必须支持减少动态效果。

---

# 十七、代码质量要求

必须：

- TypeScript strict
- 组件单一职责
- 清晰 props 类型
- 无巨型组件
- 无重复逻辑
- 无大量 magic numbers
- 无 giant global store
- 无 inline 巨型内容对象
- 无无意义 abstraction

如果组件超过约 250～300 行：

检查是否应该拆分。

不要为了满足行数机械拆组件。

---

# 十八、当前阶段禁止做的事

Phase 1 禁止：

- 一次性开发全部课程
- 完整 Agent Loop 动画
- 完整 RAG 动画
- 完整 MCP 动画
- Multi-Agent 复杂场景
- 复杂 Shader
- 大量粒子效果
- 3D 星空背景
- 大型后端
- 用户登录
- 数据库
- 云同步
- AI API 接入
- 复杂 CMS

当前目标：

> 先把“学习产品骨架”做对。

---

# 十九、测试要求

完成后必须执行：

```bash
npm run build
npm run lint
npm run test
```

如果已有 E2E：

```bash
npm run test:e2e
```

检查：

- TypeScript error
- console error
- broken route
- broken interaction
- overflow
- mobile layout
- missing content
- accessibility basics

所有明显问题先修复。

不要把报错留给用户。

---

# 二十、Phase 1 验收标准

只有同时满足以下条件，Phase 1 才算完成。

## 产品

- 首页能明确解释产品价值
- 用户知道下一步该点击哪里
- Learning Map 清晰
- Lesson 页面结构清晰

## 教学

- 新手不会一进入就看到大量专业术语
- 概念学习路径明确
- 所有章节属于统一 AI 系统框架

## UI

- 视觉统一
- 无明显模板感
- 无廉价赛博朋克风格
- 信息密度合理

## 工程

- 项目结构清晰
- 内容数据驱动
- Learning State 独立
- UI 和 3D 解耦
- 可以继续扩展

## 技术

- Build 成功
- Lint 成功
- Tests 成功
- 无明显 Console Error

---

# 二十一、完成后不要继续 Phase 2

Phase 1 完成后立即停止。

输出：

```text
1. 当前实现了什么
2. 修改了哪些文件
3. 当前项目结构
4. Learning State 设计
5. Lesson Schema
6. Design System
7. 3D 预留方式
8. 测试结果
9. 当前已知问题
10. Phase 2 建议
```

不要自动继续开发 Phase 2。

等待人工确认。

---

# 最终原则

这一步不是为了“尽快看见一个完整 AI 网站”。

而是为了建立一个：

> 后续可以持续增加教学内容、3D 交互和 Agent 模拟，而不会迅速变成屎山的基础系统。

优先级：

```text
清晰
>
正确
>
稳定
>
可维护
>
炫酷
```

现在开始：

1. 检查当前 repository
2. 输出简短 Architecture / Implementation Plan
3. 开始 Phase 1
4. 完成后自行测试
5. 停止并等待人工验收
