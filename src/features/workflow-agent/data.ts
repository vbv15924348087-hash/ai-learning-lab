import type { ChapterDefinition } from '../curriculum/types'

export const chapter: ChapterDefinition = {
  id: 'workflow-vs-agent',
  phase: 11,
  title: 'Workflow vs Agent',
  heading: '遇到意外，谁来决定下一步？',
  subtitle: '在同一个任务里，对比预先安排的路线与根据现场情况重新选路。',
  minutes: 7,
  connection: '上一章用 MCP 接好了外部能力。这一章看：谁决定以什么顺序使用它们？',
  goal: '能根据路径是否预先定义，区分 Workflow、Agent 和两者结合的系统。',
  steps: [
    {
      id: 'problem',
      title: '同一份报告，两种做法',
      beginnerExplanation:
        '任务是研究 AI GPU 并写报告。先查资料、再提取参数、然后比较、最后写报告，这条固定路线很清楚。可是资料突然无法访问了呢？',
      whyItMatters: '是否需要现场重新判断，决定了流程应该怎样设计。',
      technicalExplanation:
        '区分重点是执行路径的决策来源，而不是有没有调用模型。固定步骤里也可以调用 LLM。',
      interactionHint: '点击“查看两条路线”，先认清两边谁在安排步骤。',
      terms: [],
    },
    {
      id: 'detour',
      title: '让任务遇到一次异常',
      beginnerExplanation:
        '左边按已写好的规则执行；右边先观察结果，再选择新的行动。给两边同样的“资料无法访问”，看看会发生什么。',
      whyItMatters: '动态选择可以应对未预料的情况，也带来更多成本和不确定性。',
      technicalExplanation:
        'Agent 在工具返回后，把观察结果加入 Context，由模型基于目标与当前状态选择下一次动作。固定 Workflow 的失败策略由程序定义。',
      interactionHint: '先点“制造异常”，再为右侧选择可行的下一步。',
      terms: ['workflow', 'autonomy'],
    },
    {
      id: 'branch',
      title: '固定路线也能准备应急分支',
      beginnerExplanation:
        '给左边提前写上“网站失败时读本地文件”，它也能处理这类异常。区别在于：这条分支在运行前已经写好。',
      whyItMatters: '工作流并不等于遇到意外就失效。明确、可重复的任务，常常适合预定义流程。',
      technicalExplanation:
        'DAG 是有向无环图，只适合不含循环的流程表达；Workflow 也可以含循环，因此并非每个 Workflow 都是 DAG。这里 Deterministic 指相同条件下走同一规则分支，不保证外部服务或 LLM 的输出相同。',
      interactionHint: '点击“加入预定义异常分支”，观察左侧怎样恢复。',
      terms: ['dag', 'deterministic', 'orchestration'],
    },
    {
      id: 'system',
      title: '把两种方法放在一起',
      beginnerExplanation:
        '现实里可以先用固定流程检查权限、读取文件，再让 Agent 自己选择资料来源，最后回到固定的审核步骤。按任务给它合适的自主空间。',
      whyItMatters: '选择架构时先看任务需要，不必把所有步骤都交给模型决定。',
      technicalExplanation:
        'Agentic Workflow 通常指在编排流程中引入模型决策或 Agent 子过程。Orchestration 负责协调任务、工具、控制流与状态，它既可以是预定义的，也可以包含动态决策。',
      interactionHint: '点亮流程中的动态研究环节，再确认整条路线。',
      terms: ['agentic-workflow'],
    },
  ],
  terms: [
    {
      id: 'workflow',
      name: 'Workflow',
      label: '预定义流程',
      definition: '由程序预先定义执行路径的流程，可以包含条件、重试和异常分支。',
    },
    {
      id: 'dag',
      name: 'DAG',
      label: '有向无环图',
      definition: '用有方向的连接表达依赖，且不允许沿连接回到原点的一类图；可描述部分工作流。',
    },
    {
      id: 'deterministic',
      name: 'Deterministic',
      label: '确定性的',
      definition:
        '相同输入和条件按相同规则产生相同结果；本例特指路径选择规则，不代表模型输出必然相同。',
    },
    {
      id: 'orchestration',
      name: 'Orchestration',
      label: '任务编排',
      definition: '协调任务、工具、执行顺序、状态与异常处理的过程。',
    },
    {
      id: 'autonomy',
      name: 'Autonomy',
      label: '自主程度',
      definition: '系统在既定目标和权限边界内，自行决定下一步行动的程度。',
    },
    {
      id: 'agentic-workflow',
      name: 'Agentic Workflow',
      label: '包含 Agent 决策的流程',
      definition: '在流程编排中加入由模型动态决定行动的环节，使固定步骤与自主决策协作。',
    },
  ],
  misconceptions: [
    {
      wrong: '工作流一遇到异常就只能硬着头皮继续。',
      correct:
        '工作流可以预先定义异常、重试和备用分支。本章第一条固定路线是故意没有配置备用来源的简化例子。',
    },
    {
      wrong: '只要流程里用了模型，它就一定是 Agent。',
      correct: '固定步骤可以调用模型。关键是模型有没有根据当前状态动态决定后续行动。',
    },
    {
      wrong: 'Agent 总是比固定流程更好。',
      correct: '清晰稳定的任务常适合固定流程；开放任务可能受益于动态决策，但需要预算、权限和验证。',
    },
  ],
  challenge: [
    {
      id: 'predefined',
      prompt: '程序提前写好：API 超时后重试两次，再改读缓存。这属于哪种路径决策？',
      answer: 'workflow',
      options: [
        {
          id: 'workflow',
          label: 'Workflow 的预定义异常分支',
          explanation: '分支和重试条件在运行前就已经由程序定义。',
        },
        {
          id: 'agent',
          label: '一定是 Agent 的自主判断',
          explanation: '有分支不等于由模型动态决定；这里的策略早已写好。',
        },
      ],
    },
    {
      id: 'choose',
      prompt:
        '研究中发现某 GPU 的参数相互矛盾，需要依据新证据决定查官网、读 PDF 还是继续检索。哪种设计更合适？',
      answer: 'hybrid',
      options: [
        {
          id: 'fixed',
          label: '无论资料内容如何，都按同一条无分支路线输出',
          explanation: '固定路线无法在这个案例里依据新的矛盾选择查证方式。',
        },
        {
          id: 'hybrid',
          label: '让 Agent 选择查证动作，并保留固定的审核与权限检查',
          explanation: '动态判断适合开放的查证过程，固定控制适合明确的约束。',
        },
      ],
    },
  ],
  takeaway: 'Workflow 按预先定义的路径走；Agent 根据当前状态动态选择。两者可以组合。',
}
