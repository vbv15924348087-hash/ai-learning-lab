import type { ChapterDefinition } from '../curriculum/types'

export const memoryCandidates = [
  {
    id: 'preference',
    text: '后续研究报告请使用中文，并为结论附来源。',
    label: '稳定偏好',
    usefulNextTask: true,
  },
  {
    id: 'episode',
    text: '这次 GPU 比较中，已经排除了不符合机房散热条件的方案。',
    label: '本次任务的关键决策',
    usefulNextTask: false,
  },
  { id: 'chatter', text: '好的，收到。', label: '礼貌回应', usefulNextTask: false },
]

export const memoryTypes = [
  {
    id: 'short',
    name: 'Short-term Memory',
    label: '短期工作记忆',
    example: '这次任务刚读到的片段、接下来准备检查什么。',
    explanation: '保留当前任务需要的近程信息，常通过 Context 和临时 State 实现。',
  },
  {
    id: 'long',
    name: 'Long-term Memory',
    label: '长期记忆',
    example: '跨任务保存的报告语言偏好或项目背景。',
    explanation: '在当前会话或任务之外仍能保留的信息；需要时再检索。',
  },
  {
    id: 'episodic',
    name: 'Episodic Memory',
    label: '经历与事件',
    example: '上次采购评估中，某方案因散热约束被排除。',
    explanation: '保存发生过什么、何时发生及其背景；可以作为长期记忆的一种组织方式。',
  },
  {
    id: 'semantic',
    name: 'Semantic Memory',
    label: '事实与知识',
    example: '报告通常使用中文，并在结论旁标注来源。',
    explanation: '保存抽象出的事实、规则与稳定偏好，不需要保留整段事件过程。',
  },
]

export const chapter: ChapterDefinition = {
  id: 'memory',
  phase: 9,
  title: 'Memory',
  heading: '上次知道的事，这次怎样用上？',
  subtitle: '先决定保存什么，再在需要时取回。',
  minutes: 9,
  connection: 'RAG 为当前问题找外部证据。Memory 让跨轮次或跨任务的信息可以被保存与检索。',
  goal: '能完成一次有选择的记忆写入与检索，并区分 Memory、Context 和 RAG。',
  steps: [
    {
      id: 'new-task-gap',
      title: '新任务开始了，为什么又要说一遍？',
      beginnerExplanation:
        '上次你说过“报告请用中文并附来源”。新的任务输入里却只有“再研究一款 GPU”。如果那条偏好没有保存和取回，模型这一轮就未必能看到。',
      whyItMatters: '知道一件事曾经出现过，不等于它现在仍在输入里。',
      technicalExplanation:
        'Context 是当前这一次推理实际可见的信息集合。跨任务连续性需要显式保存、检索与注入机制；并非所有产品默认提供持久记忆。',
      interactionHint: '清空上次 Context，观察新任务里少了什么。',
      terms: [],
    },
    {
      id: 'memory-lifecycle',
      title: '亲手完成：保存 → 新任务 → 检索 → 加入输入。',
      beginnerExplanation:
        '先决定哪些信息值得记住。开始新任务后，保存的内容仍在仓库中，但还没有进入 Context。检索找到相关偏好，再把它加入这次输入。',
      whyItMatters: 'Memory 的价值来自选择与取回，不是无限累积聊天记录。',
      technicalExplanation:
        'Memory Write 通常包含筛选、提取、去重、存储与更新。Memory Retrieval 根据任务找到相关记忆，再由 Context 管理逻辑选择注入。此处仓库只在本次教学演示中存在，重播会清空。',
      interactionHint: '勾选值得保存的信息，进入 Task 2，再检索并加入 Context。',
      terms: ['memory', 'memory-write', 'memory-retrieval', 'state'],
    },
    {
      id: 'three-boundaries',
      title: '三个概念，三个不同的重点。',
      beginnerExplanation:
        'Context 关心“现在看见什么”；Memory 关心“跨任务留下什么”；RAG 关心“怎样找来当前需要的外部资料”。它们可以配合使用。',
      whyItMatters: '同样用了检索，仍然可能承担不同的产品职责。',
      technicalExplanation:
        'RAG 与 Memory 可以共享向量索引或关键词检索。区别不在某一个存储技术，而在信息来源、生命周期和使用目的；被选中的结果最终都可能进入 Context。',
      interactionHint: '为三个具体情境选择最贴切的概念。',
      terms: [],
    },
    {
      id: 'memory-kinds',
      title: '保存多久，和保存什么，是两种划分。',
      beginnerExplanation:
        '短期与长期描述保留的时间范围；经历型与知识型描述保存的内容。一次采购失败的经历，也可以被长期保存。',
      whyItMatters: '避免把四种术语当成互斥的四个抽屉。',
      technicalExplanation:
        'Short-term / Long-term 关注生命周期；Episodic / Semantic 关注表示与组织形式。分类在具体系统中的边界并不统一。State 是更广泛的当前状态表示，部分 State 可以持久化或整理成记忆。',
      interactionHint: '点开四种视角，查看具体例子，然后确认系统关系。',
      terms: ['short-term', 'long-term', 'episodic', 'semantic'],
    },
  ],
  terms: [
    {
      id: 'memory',
      name: 'Memory',
      label: '可保存和取回的信息',
      definition:
        '可跨轮次或任务保存和检索的信息或状态；其中的信息不代表自动全部进入当前 Context。',
    },
    {
      id: 'short-term',
      name: 'Short-term Memory',
      label: '短期工作记忆',
      definition: '支持近期轮次或当前任务的信息，常由 Context、临时状态或工作区承载。',
    },
    {
      id: 'long-term',
      name: 'Long-term Memory',
      label: '跨任务保留的信息',
      definition: '在当前会话或任务结束后仍可保留，并在之后按需找回的信息。',
    },
    {
      id: 'episodic',
      name: 'Episodic Memory',
      label: '记住发生过什么',
      definition: '对过去事件、任务经历及其背景的记录，例如一次失败的原因与当时条件。',
    },
    {
      id: 'semantic',
      name: 'Semantic Memory',
      label: '记住事实与规律',
      definition: '对事实、规则、知识或稳定偏好的抽象记录，不必保存完整事件过程。',
    },
    {
      id: 'state',
      name: 'State',
      label: '系统当前的状态',
      definition: '描述任务当前进度、已知结果、决策与待办等的信息；可以短暂存在，也可以持久化。',
    },
    {
      id: 'memory-write',
      name: 'Memory Write',
      label: '有选择地写入记忆',
      definition: '把值得保留的信息提取、整理并存入记忆的过程，也可能更新或删除旧信息。',
    },
    {
      id: 'memory-retrieval',
      name: 'Memory Retrieval',
      label: '按任务找回相关记忆',
      definition: '根据当前需求，从保存的信息中查找相关内容；之后仍需选择是否加入 Context。',
    },
  ],
  misconceptions: [
    {
      wrong: 'Memory 是把所有历史对话塞进 Context。',
      correct: 'Memory 可以独立存储，只有选中的相关内容才进入当前 Context。',
    },
    {
      wrong: '保存过的信息，模型每一轮都会看见。',
      correct: '保存与注入是不同步骤。信息需要被取回并放进当前输入。',
    },
    {
      wrong: 'Memory 与 RAG 的区别是有没有向量数据库。',
      correct: '两者可以使用同样的检索技术，重点在跨任务保留信息与按问题补充证据的职责。',
    },
    {
      wrong: '短期、长期、经历型、知识型是四个互斥类别。',
      correct: '前两者描述生命周期，后两者描述内容组织方式，可以组合。',
    },
  ],
  challenge: [
    {
      id: 'stored-visible',
      prompt: '报告语言偏好已存在 Memory，但新任务的 Context 没有它。模型现在一定知道该用中文吗？',
      answer: 'retrieve',
      options: [
        {
          id: 'yes',
          label: '一定知道，存过就永久可见',
          explanation: '仓库存有信息，不代表当前推理能看到它。',
        },
        {
          id: 'retrieve',
          label: '不一定，需要取回并加入本轮 Context',
          explanation: '保存、检索、注入是不同的步骤。',
        },
      ],
    },
    {
      id: 'choose-write',
      prompt: '下面哪条信息最适合保留，帮助后续研究任务？',
      answer: 'preference',
      options: [
        {
          id: 'all',
          label: '每一次“好的、收到”和所有重复日志',
          explanation: '无差别保存会增加噪声与检索负担。',
        },
        {
          id: 'preference',
          label: '稳定报告偏好，以及有用的关键决策及其背景',
          explanation: '保留可复用信息，后续再按相关性取回。',
        },
      ],
    },
  ],
  takeaway: 'Memory 负责留下与取回，Context 决定这一轮真正看见什么。',
}
