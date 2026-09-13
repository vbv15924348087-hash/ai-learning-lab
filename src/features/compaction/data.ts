import type { ChapterDefinition } from '../curriculum/types'

export const chapter: ChapterDefinition = {
  id: 'compaction',
  phase: 15,
  title: 'Compaction / Long-running Agent',
  heading: '工作很久以后，怎样接着做？',
  subtitle: '缩短历史，留下足以继续工作的目标、状态与证据。',
  minutes: 8,
  connection: 'Agent 已经会行动、协作、验证和请求审批。长任务还需要控制不断增长的 Context。',
  goal: '能说明 Compaction 压缩的是历史 Context，并选择继续工作所需的关键状态。',
  steps: [
    {
      id: 'capacity',
      title: '资料越查越多，桌面快放不下了',
      beginnerExplanation:
        '每一轮搜索结果、文件内容和报错都可能进入当前工作资料。模型这一次能处理的信息范围有限，长任务不能无止境地累积全部原文。',
      whyItMatters: '保留全部记录不等于保留最有用的信息。目标和下一步容易淹没在重复历史里。',
      technicalExplanation:
        'Context Window 是模型单次推理可以处理的信息范围，不是长期 Memory 的容量。系统应给新的输入、工具结果及输出预留预算。这里的百分比仅为教学示意，不对应具体模型的 token 限制。',
      interactionHint: '点击“开始长任务”，观察当前 Context 与长期 Memory 的不同位置。',
      terms: [],
    },
    {
      id: 'compress',
      title: '从 40% 到 90%，再整理工作资料',
      beginnerExplanation:
        '模拟继续查资料，Context 从 40% 增长到 70%、90%。快满时，把旧历史整理成更短的工作摘要，保留继续工作需要的线索。',
      whyItMatters: '压缩以后腾出的是当前工作空间，长期保存的 Memory 并不会因此被删除。',
      technicalExplanation:
        'Compaction 可以结合裁剪、摘要、结构化状态抽取与外部保存。压缩有信息损失风险；必须保存关键证据或可重新获取它们的引用。压缩率依内容与方法而变，本例 90% → 35% 不代表任何产品的保证。',
      interactionHint: '先推进两轮资料读取，再点“压缩历史 Context”，最后读取摘要继续。',
      terms: ['compaction', 'context-compression', 'summarization'],
    },
    {
      id: 'checkpoint',
      title: '留下什么，才能真正接得上？',
      beginnerExplanation:
        '一份有用的接续记录要保留：目标、现在做到哪里、关键决定、失败教训、待办，以及能核对的证据。重复日志和无关旧页面可以合并或移出当前 Context。',
      whyItMatters: '只留下“研究了很多资料”的泛泛摘要，无法支持下一轮可靠行动。',
      technicalExplanation:
        'Checkpoint 是某一时点的可恢复记录；State Persistence 将必要状态保存到可持续读取的位置。二者不能只依赖一个随时可能丢失的内存对象，真实系统需要持久化与恢复策略。',
      interactionHint: '选择需要保留的 6 项关键信息，再检查接续记录。',
      terms: ['checkpoint', 'state-persistence'],
    },
    {
      id: 'resume',
      title: '读取接续记录，继续未完成的事',
      beginnerExplanation:
        '新的 Context 先装入目标、关键状态和待办，再按需要找回证据。Agent 就能接着检查 GPU 功耗数据，而不用把旧网页全文重新读一遍。',
      whyItMatters: '长任务的连续性依赖可恢复状态与可靠验证，不只是更长的上下文窗口。',
      technicalExplanation:
        'Long-horizon Agent 面向多步骤、长时间任务，需要预算管理、状态持久化、错误恢复和完成条件。Compaction 不会自动完成任务，也不保证永不遗忘；接续摘要本身可能需要核验。',
      interactionHint: '点击“从 Checkpoint 恢复”，再执行待办中的下一项检查。',
      terms: ['long-horizon-agent'],
    },
  ],
  terms: [
    {
      id: 'compaction',
      name: 'Compaction',
      label: '整理长任务的历史',
      definition: '在长任务中压缩历史 Context，并保留继续工作所需的关键状态。',
    },
    {
      id: 'context-compression',
      name: 'Context Compression',
      label: '减少当前上下文占用',
      definition:
        '通过摘要、裁剪或结构化提取等方法减少 Context 内容的长度，同时尽量保留任务相关信息。',
    },
    {
      id: 'summarization',
      name: 'Summarization',
      label: '把内容概括成摘要',
      definition: '用更短的表述保留原信息中的关键内容，是上下文压缩的常见手段之一。',
    },
    {
      id: 'checkpoint',
      name: 'Checkpoint',
      label: '可接续的状态记录',
      definition: '在某个时点保存的目标、进度及其他恢复所需信息，用于从该处继续工作。',
    },
    {
      id: 'state-persistence',
      name: 'State Persistence',
      label: '持续保存工作状态',
      definition: '把必要状态保存在后续仍能读取的位置，使任务在中断或切换上下文后可以恢复。',
    },
    {
      id: 'long-horizon-agent',
      name: 'Long-horizon Agent',
      label: '执行长程任务的 Agent',
      definition: '持续完成多步骤、长时间跨度任务，并需要状态、预算、恢复和验证机制的 Agent 系统。',
    },
  ],
  misconceptions: [
    {
      wrong: 'Compaction 就是删除长期 Memory。',
      correct:
        '它整理的是历史 Context。长期 Memory 是独立的保存与检索机制，不会因为压缩当前历史就自动被删除。',
    },
    {
      wrong: '把旧内容全部删掉，任务也能自然接着做。',
      correct: '必须保留目标、当前状态、决定、失败、待办和关键证据，必要时留下重新获取原文的引用。',
    },
    {
      wrong: '压缩能无损地记住一切，并自动把任务完成。',
      correct: '摘要可能丢失信息。恢复后仍需按待办行动，核验证据，并满足任务的完成条件。',
    },
  ],
  challenge: [
    {
      id: 'memory',
      prompt: '一次 Compaction 把当前 Context 占用从 90% 降到 35%。这意味着什么？',
      answer: 'context',
      options: [
        {
          id: 'memory',
          label: '长期 Memory 被删除了一半以上',
          explanation: 'Context 占用和长期 Memory 是不同的概念。',
        },
        {
          id: 'context',
          label: '旧历史被整理成更短的内容，关键状态仍用于继续工作',
          explanation: '腾出的是当前推理空间，不能据此推断长期记忆被删除。',
        },
      ],
    },
    {
      id: 'keep',
      prompt: '压缩研究任务的历史时，下面哪份记录更有用？',
      answer: 'state',
      options: [
        {
          id: 'logs',
          label: '只留下十次完全重复的网页抓取日志',
          explanation: '重复日志占空间，却不足以说明目标、决定和下一步。',
        },
        {
          id: 'state',
          label: '保留目标、进度、决定、失败教训、待办和出处',
          explanation: '这些信息共同支撑下一轮工作的连续性与可核查性。',
        },
      ],
    },
    {
      id: 'resume',
      prompt: '接续摘要写着“功耗数据已找到，但单位尚未核对”。恢复后应该怎么做？',
      answer: 'verify',
      options: [
        {
          id: 'done',
          label: '因为压缩成功，所以直接标记研究完成',
          explanation: '整理 Context 不会代替执行和验证未完成的待办。',
        },
        {
          id: 'verify',
          label: '读取对应证据并完成单位检查，再判断任务是否满足要求',
          explanation: '从当前状态接着推进，同时保留原任务的验证标准。',
        },
      ],
    },
  ],
  takeaway: '压缩历史 Context，保留目标、状态、决定、失败、待办和证据；读取接续记录，再继续行动。',
}

export const checkpointItems = [
  { id: 'goal', title: 'Goal · 目标', text: '完成有来源的 GPU 对比报告', keep: true },
  {
    id: 'state',
    title: 'Current State · 当前状态',
    text: '已找到官方参数，尚未核对单位',
    keep: true,
  },
  {
    id: 'decisions',
    title: 'Key Decisions · 关键决定',
    text: '使用官方资料，统一按 kW 比较',
    keep: true,
  },
  {
    id: 'failures',
    title: 'Failures · 失败教训',
    text: '论坛转载不可靠；旧换算除数错误',
    keep: true,
  },
  { id: 'todo', title: 'TODO · 待办', text: '检查 400 W → kW，补齐报告来源', keep: true },
  {
    id: 'evidence',
    title: 'Key Evidence · 关键证据',
    text: '示例内部参数表第 2 页：400 W',
    keep: true,
  },
  {
    id: 'logs',
    title: 'Repeated Logs · 重复日志',
    text: '十次完全相同的读取成功信息',
    keep: false,
  },
  {
    id: 'outputs',
    title: 'Old Tool Outputs · 旧工具全文',
    text: '已提取必要事实和引用的旧输出',
    keep: false,
  },
  {
    id: 'pages',
    title: 'Duplicate Pages · 重复页面',
    text: '同一个资料页面的多份拷贝',
    keep: false,
  },
  {
    id: 'messages',
    title: 'Redundant Messages · 冗余消息',
    text: '反复确认“我会继续研究”',
    keep: false,
  },
]
