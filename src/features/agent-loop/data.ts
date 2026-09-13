import type { ChapterDefinition } from '../curriculum/types'

export const loopStages = [
  {
    node: 'observe',
    label: '观察',
    text: '搜索结果回到 Context：关于 NVIDIA 新 GPU 的信息只有论坛转载。',
    round: 1,
  },
  {
    node: 'reason',
    label: '判断',
    text: '来源不足以支持报告里的产品规格结论。这里展示的是教学决策摘要。',
    round: 1,
  },
  { node: 'plan', label: '计划', text: '先核对信息出处，再决定是否需要换一个来源。', round: 1 },
  {
    node: 'act',
    label: '行动',
    text: '模型请求打开转载里的出处链接；Harness 执行这个工具调用。',
    round: 1,
  },
  {
    node: 'observe',
    label: '再次观察',
    text: '工具返回：出处仍然是一篇未注明原始来源的转载。新结果加入 Context。',
    round: 1,
  },
  {
    node: 'verify',
    label: '检查 · 未完成',
    text: '检查条件是“结论有可核对的一手来源”。当前未满足，因此回到循环。',
    round: 1,
  },
  {
    node: 'observe',
    label: '观察新状态',
    text: '现在知道转载链没有可靠出处。保留这条失败信息，避免重复打开同一链接。',
    round: 2,
  },
  { node: 'reason', label: '重新判断', text: '应该改变来源策略，寻找官方产品资料。', round: 2 },
  { node: 'plan', label: '调整计划', text: '在官方域名中查找对应产品的规格页。', round: 2 },
  {
    node: 'act',
    label: '再次行动',
    text: '模型请求读取官方资料；Harness 调用工具并收集返回结果。',
    round: 2,
  },
  {
    node: 'observe',
    label: '观察官方资料',
    text: '工具返回一段可追溯到官方产品页的模拟资料，补入当前 Context。',
    round: 2,
  },
  {
    node: 'verify',
    label: '检查 · 通过',
    text: '来源条件已满足。本次查证子任务可以结束；完整报告仍要检查其余要求。',
    round: 2,
  },
]

export const chapter: ChapterDefinition = {
  id: 'agent-loop',
  phase: 6,
  title: 'Agent Loop',
  heading: '结果不够好，就再走一圈。',
  subtitle: '一次调用只是一步。可靠的行动，需要观察、调整和检查。',
  minutes: 8,
  connection: '上一章的 Tool Result 会回到 Context。这一章从“结果不够用”继续。',
  goal: '看到不可靠的工具结果时，能解释为什么继续行动，以及什么时候应当停止。',
  steps: [
    {
      id: 'source-gap',
      title: '有搜索结果，就能交报告了吗？',
      beginnerExplanation:
        '你正在研究 NVIDIA 的新 GPU。工具找到了论坛转载，但没有可核对的官方出处。有内容，不代表已经完成查证。',
      whyItMatters: '先明确差在哪里，下一次行动才有方向。',
      technicalExplanation:
        'Observation 是系统接收到的结果或状态。它通常加入 Context，成为模型下一次决策的依据；工具返回成功不代表任务要求满足。',
      interactionHint: '先判断眼前的来源是否够用。',
      terms: ['observation'],
    },
    {
      id: 'live-loop',
      title: '让一次失败，改变下一次行动。',
      beginnerExplanation:
        '沿着闭环走两轮：第一轮找不到原始来源，第二轮改为读取官方资料。每次新结果都会影响接下来做什么。',
      whyItMatters: '循环的价值是根据反馈修正行动，而不是机械重复。',
      technicalExplanation:
        'Agent Loop 通常由运行系统调度：Observe → Reason / Plan → Act → Observe → Verify。实际系统会合并或拆分阶段，并用步数、预算、超时和完成条件控制停止。图中判断是教学摘要，不是模型内部思维的记录。',
      interactionHint: '点击“推进循环”，或自动播放；观察亮起的节点和轮次。',
      terms: ['agent-loop', 'action', 'reasoning', 'planning'],
    },
    {
      id: 'react-boundary',
      title: '给刚才的动作起名字。',
      beginnerExplanation:
        '“想下一步、采取行动、观察反馈”是 ReAct 的核心思路。现代 Agent 还需要计划、状态、检查与运行保护。',
      whyItMatters: '认识经典思想，也保留完整系统的边界。',
      technicalExplanation:
        'ReAct（Reasoning and Acting）是交替进行推理与行动、利用环境观察更新决策的经典范式。它不是所有 Agent 架构的统称；现代实现可能使用隐藏推理、显式规划、并行工具与外部验证。',
      interactionHint: '展开现代 Agent 的配套能力，再确认差别。',
      terms: ['react'],
    },
    {
      id: 'loop-system',
      title: '把闭环放回整个系统。',
      beginnerExplanation:
        '模型决定下一步请求。Harness 执行工具，把新观察补回 Context，并根据完成条件决定继续还是结束。',
      whyItMatters: '下一章将打开这个承载循环的运行系统。',
      technicalExplanation:
        'Loop 调度、工具执行和停止策略属于运行系统。模型产出的 Tool Call 是请求；只有运行系统成功执行后才会产生相应 Tool Result。验证也可以由测试或其他可检查规则完成。',
      interactionHint: '沿箭头读一遍，再确认工具由谁执行。',
      terms: [],
    },
  ],
  terms: [
    {
      id: 'agent-loop',
      name: 'Agent Loop',
      label: '持续行动循环',
      definition: 'Agent 持续执行观察、判断或计划、行动、再次观察和验证的运行循环。',
    },
    {
      id: 'react',
      name: 'ReAct',
      label: '推理与行动交替',
      definition:
        '结合 Reason、Act 与环境 Observation 的经典 Agent 思想之一，并不等于现代 Agent 的全部。',
    },
    {
      id: 'observation',
      name: 'Observation',
      label: '收到的新反馈',
      definition: '系统从工具或环境得到的结果与状态，可加入 Context 供后续决策使用。',
    },
    {
      id: 'action',
      name: 'Action',
      label: '采取下一步行动',
      definition: '系统执行的下一步行为，例如工具调用或交接；模型提出请求，运行系统负责执行。',
    },
    {
      id: 'planning',
      name: 'Planning',
      label: '安排接下来怎么做',
      definition: '围绕目标组织子任务与行动顺序，并随新反馈调整的过程。',
    },
    {
      id: 'reasoning',
      name: 'Reasoning',
      label: '依据当前信息作判断',
      definition:
        '模型基于当前 Context 进行推断和决策的过程；界面中的解释不等于可观测的完整内部推理。',
    },
  ],
  misconceptions: [
    {
      wrong: 'Agent 一次想完，然后一次执行。',
      correct: '新观察可能改变计划。许多任务需要多轮行动和验证。',
    },
    {
      wrong: 'ReAct 就是现代 Agent 的全部。',
      correct: '它是经典思想之一；状态、权限、重试、验证等仍需系统提供。',
    },
    {
      wrong: '循环越多，答案越好。',
      correct: '循环要有目标与停止条件；反复失败时需要换策略、请求帮助或停止。',
    },
  ],
  challenge: [
    {
      id: 'forum',
      prompt: '搜索工具执行成功，但结果只有论坛转载。报告要求官方来源。下一步？',
      answer: 'seek',
      options: [
        {
          id: 'finish',
          label: '工具成功了，直接完成报告',
          explanation: '工具调用成功只说明拿到了结果，还没有满足来源要求。',
        },
        {
          id: 'seek',
          label: '观察来源缺口，继续寻找官方资料',
          explanation: '用结果更新判断，再采取能补上证据缺口的行动。',
        },
      ],
    },
    {
      id: 'stop',
      prompt: '官方来源已核实，但报告还缺内部 PDF 的对比数据。能结束整个任务吗？',
      answer: 'continue',
      options: [
        {
          id: 'done',
          label: '能，刚才的来源检查已经通过',
          explanation: '一个子任务通过，不等于全部完成条件满足。',
        },
        {
          id: 'continue',
          label: '不能，继续处理 PDF 并检查剩余要求',
          explanation: '停止应由完整任务要求决定，而不是某一个成功结果。',
        },
      ],
    },
  ],
  takeaway: 'Agent Loop 用反馈改变下一步，用可检查的完成条件决定何时停止。',
}
