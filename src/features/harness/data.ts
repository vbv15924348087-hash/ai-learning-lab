import type { ChapterDefinition } from '../curriculum/types'

export const modules = [
  {
    id: 'context',
    name: 'Context Manager',
    label: '整理当前信息',
    input: '指令、历史、检索结果',
    output: '本次推理的 Context',
    explanation: '选择模型这一轮需要看到的信息，并控制它占用的空间。',
  },
  {
    id: 'loop',
    name: 'Agent Loop',
    label: '安排下一轮',
    input: '最新观察与完成条件',
    output: '继续决策，或结束任务',
    explanation: '调度观察、决策、行动与验证，限制步数和预算。',
  },
  {
    id: 'router',
    name: 'Tool Router',
    label: '找到正确的工具',
    input: 'Tool Call 的名称',
    output: '匹配的工具处理器',
    explanation: '把请求分派到对应的实现。工具名字不会自己执行。',
  },
  {
    id: 'runtime',
    name: 'Tool Runtime',
    label: '实际执行工具',
    input: '已校验和授权的请求',
    output: 'Tool Result 或错误',
    explanation: '调用实际程序、等待返回、处理异常，并把结果交回系统。',
  },
  {
    id: 'state',
    name: 'State',
    label: '记录做到哪一步',
    input: '本轮执行事件',
    output: '任务进度与当前状态',
    explanation: '例如已读过哪些资料、哪一步失败了，以及下一步待办。',
  },
  {
    id: 'retry',
    name: 'Retry',
    label: '按规则再试一次',
    input: '可恢复的暂时失败',
    output: '有次数上限的新尝试',
    explanation: '网络暂时失败时可以重试；要避免重复付款等不可安全重复的动作。',
  },
  {
    id: 'timeout',
    name: 'Timeout',
    label: '限制等待时间',
    input: '工具执行时钟与时限',
    output: '超时事件',
    explanation: '超过设定时限就停止等待或尝试取消，让任务有机会恢复。',
  },
  {
    id: 'permission',
    name: 'Permission',
    label: '判断是否有权执行',
    input: '主体、工具与目标资源',
    output: '允许、拒绝或待批准',
    explanation: '模型想执行某个动作，不代表系统已经授予权限。',
  },
  {
    id: 'guardrail',
    name: 'Guardrail',
    label: '检查动作是否合规',
    input: '输入、工具请求或输出',
    output: '放行、拦截或升级处理',
    explanation: '按规则检查内容或行为，例如阻止向外部发送敏感数据。',
  },
  {
    id: 'trace',
    name: 'Trace',
    label: '留下运行记录',
    input: '调用、耗时、结果与错误',
    output: '可追踪的事件链',
    explanation: '帮助定位问题、分析成本；不意味着能看到模型完整内部推理。',
  },
  {
    id: 'eval',
    name: 'Eval',
    label: '衡量表现',
    input: '任务样本、输出和标准',
    output: '质量指标或评估结果',
    explanation: '按明确标准评估系统表现，可在线或离线运行；不一定每轮都执行。',
  },
]

export const chapter: ChapterDefinition = {
  id: 'harness',
  phase: 7,
  title: 'Harness',
  heading: '聪明的模型，需要一个运行系统。',
  subtitle: '拆开外壳，看一次请求怎样成为可靠的行动。',
  minutes: 9,
  connection: '上一章的循环需要有人调度。这一章认识承担这些工作的 Harness。',
  goal: '能区分模型的判断与运行系统的职责，并找到执行、权限、超时和状态所在的位置。',
  steps: [
    {
      id: 'runtime-gap',
      title: '模型说“打开资料”，是谁真的打开？',
      beginnerExplanation:
        '模型能生成一个工具请求。但网络连接、等待结果、保存状态和处理超时，都需要运行系统来承接。',
      whyItMatters: '先找到智能与执行之间的空缺，才能理解为什么需要 Harness。',
      technicalExplanation:
        'Model 输出文本或结构化请求；Harness 通常是宿主应用的运行层，管理模型调用、Context、工具调度和生命周期。具体模块边界因产品而异。',
      interactionHint: '选择谁负责执行一次已经生成的工具请求。',
      terms: [],
    },
    {
      id: 'open-harness',
      title: '打开外壳，逐个认识配套模块。',
      beginnerExplanation:
        '每个模块只负责一部分事情。点击模块，看看它接收什么、做什么、再把什么交出去。',
      whyItMatters: '“Agent 能做事”来自一组协作能力，而不只是一个模型。',
      technicalExplanation:
        'Harness 是承载 Context 管理、Agent Loop、Tool 执行、状态、权限、重试、Guardrail、Trace 等能力的运行系统。Runtime 偏重执行环境；Orchestrator 偏重协调执行；Router 偏重请求分派。它们可以由同一套程序实现。',
      interactionHint: '先点击“打开运行系统”，再探索全部 11 个模块。',
      terms: ['harness', 'runtime', 'orchestrator', 'router', 'state', 'trace'],
    },
    {
      id: 'failure-routing',
      title: '请求失败时，系统要有不同的处理。',
      beginnerExplanation:
        '临时超时可以按规则重试；权限不足应该停止或申请授权。对所有错误都“再试一次”，会让系统失控。',
      whyItMatters: '运行系统把错误变成可处理的状态，而不是让模型盲目重复。',
      technicalExplanation:
        'Timeout 不保证远端操作一定已经取消。Retry 需要考虑错误是否可恢复、操作是否幂等、退避策略和重试预算。权限拒绝通常不应作为临时故障自动重试。',
      interactionHint: '分别注入“网络超时”和“权限拒绝”，比较两条路径。',
      terms: ['retry', 'timeout'],
    },
    {
      id: 'agent-system',
      title: '模型是核心，Agent 是一套系统。',
      beginnerExplanation:
        '模型负责根据当前信息判断。Context 给它材料，Tools 提供外部能力，Harness 把循环、状态和执行连起来。',
      whyItMatters: '下一章会进一步研究：系统该怎样为模型准备资料。',
      technicalExplanation:
        'Agent 能力可以近似理解为 Model + Context + Tools + Loop + State + Runtime 的共同结果。公式表达组成关系，并非可计算的性能相加。',
      interactionHint: '确认各部分的关系，再进入章节挑战。',
      terms: [],
    },
  ],
  terms: [
    {
      id: 'harness',
      name: 'Harness',
      label: '承载 Agent 的运行系统',
      definition:
        '承载 Context 管理、Agent Loop、工具执行、状态、权限、重试、Guardrail 和 Trace 等能力的运行系统。',
    },
    {
      id: 'runtime',
      name: 'Runtime',
      label: '实际运行任务的环境',
      definition: '为模型调用和外部工具执行提供调度、资源与生命周期管理的执行环境。',
    },
    {
      id: 'orchestrator',
      name: 'Orchestrator',
      label: '协调多步工作的调度者',
      definition: '组织不同组件或任务的执行顺序、依赖、并发与结果汇总的协调机制。',
    },
    {
      id: 'router',
      name: 'Router',
      label: '把请求送到正确入口',
      definition: '根据请求名称、类型或规则，将其分派到相应处理器的组件。',
    },
    {
      id: 'state',
      name: 'State',
      label: '任务当前进行到哪里',
      definition:
        '描述任务当前状态的信息，例如进度、待办、已知结果和失败记录；可临时保存或持久化。',
    },
    {
      id: 'retry',
      name: 'Retry',
      label: '有条件地再次尝试',
      definition: '对可恢复的失败按策略重新执行，通常包含次数、间隔与安全重复执行的限制。',
    },
    {
      id: 'timeout',
      name: 'Timeout',
      label: '给等待设定时限',
      definition: '操作超过时间限制时触发超时处理，避免无限等待；远端操作是否取消需单独确认。',
    },
    {
      id: 'trace',
      name: 'Trace',
      label: '可追踪的运行记录',
      definition: '记录请求、执行步骤、结果、耗时和错误，帮助还原系统发生过什么。',
    },
  ],
  misconceptions: [
    {
      wrong: 'Agent 就是 Model。',
      correct: 'Agent 还依赖 Context、Tools、Loop、State 和 Runtime 等能力。',
    },
    {
      wrong: '生成 Tool Call，就已经执行工具。',
      correct: 'Tool Call 是请求；Harness 需要分派、检查权限并实际执行。',
    },
    {
      wrong: '所有失败都应该自动重试。',
      correct: '暂时性网络失败与权限拒绝需要不同处理，重试还需考虑副作用。',
    },
  ],
  challenge: [
    {
      id: 'execution',
      prompt: '模型输出了 read_pdf(file_id)。下一步由谁打开文件并返回内容？',
      answer: 'runtime',
      options: [
        {
          id: 'model',
          label: '模型仅凭这段文字直接读取磁盘',
          explanation: '模型输出的是请求，不具有自动读取磁盘的能力。',
        },
        {
          id: 'runtime',
          label: 'Harness 中的工具运行层',
          explanation: '运行层校验和执行请求，将工具结果交回系统。',
        },
      ],
    },
    {
      id: 'permission',
      prompt: '工具返回“当前账号无权读取此文件”。合理的下一步？',
      answer: 'stop',
      options: [
        {
          id: 'retry',
          label: '不断重试同一个请求直到成功',
          explanation: '重复调用通常不会改变权限，还会浪费资源。',
        },
        {
          id: 'stop',
          label: '停止该动作，说明权限缺口或申请适当授权',
          explanation: '权限状态需要明确处理，而不是当成暂时网络故障。',
        },
      ],
    },
  ],
  takeaway: 'Harness 把模型的判断接到真实执行，也承担状态、失败处理和运行边界。',
}
