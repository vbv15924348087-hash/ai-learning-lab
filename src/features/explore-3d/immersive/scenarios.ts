import { exploreConnections, exploreNodes } from '../data'
import type { ExploreConnection, ExploreNode, ExploreTaskStep } from '../types'
import type { ExplanationLevel } from './types'

export type PacketType =
  'task' | 'context' | 'tool-call' | 'result' | 'verification' | 'pass' | 'fail'
export type EdgeState = 'idle' | 'upcoming' | 'active' | 'completed' | 'disabled'
export type ApprovalStatus = 'not-required' | 'pending' | 'approved' | 'rejected'
export type CompareFilter = 'all' | 'common' | 'added' | 'differences'
export type TaskPathStep = ExploreTaskStep & {
  action: string
  packetType: PacketType
  explanationBeginner: string
  explanationStandard: string
  explanationExpert: string
  activeConnections: string[]
  contextUsage?: number
  gate?: 'approval'
  iteration?: number
}
export type TaskScenario = {
  id: string
  title: string
  question: string
  category: 'simple' | 'fresh-info' | 'file' | 'research' | 'high-risk' | 'long-running'
  level: number
  complexity: {
    reasoning: number
    tools: number
    loops: number
    externalInfo: number
    risk: number
    verification: number
  }
  steps: TaskPathStep[]
  explanation: string
  whyNot: Record<string, string>
}

type StepInput = {
  nodeId: string
  title: string
  explanation: string
  message?: string
  packetType?: PacketType
  expert?: string
  contextUsage?: number
  gate?: 'approval'
  iteration?: number
  outcome?: 'pass' | 'fail'
}

const supplementalConnections = new Map<string, ExploreConnection>()
const existingEdges = new Map(exploreConnections.map((edge) => [`${edge.from}:${edge.to}`, edge]))
const descriptions: Record<string, string> = {
  'user-context': '任务要求进入本次上下文',
  'model-final': '已有知识足够，生成概念回答',
  'harness-web': '运行系统调度只读网页搜索',
  'harness-files': '运行系统调度文件读取',
  'harness-browser': '运行系统调度页面读取',
  'planning-loop': '按计划安排后续行动',
  'model-loop': '依据观察判断下一轮任务',
  'loop-call': '下一轮生成具体工具请求',
  'guardrail-risk-check': '检查目标、范围与动作风险',
  'risk-check-approval': '高风险动作等待明确人工决定',
  'approval-database': '批准后执行限定范围内的模拟动作',
  'observation-verifier': '检查真实返回状态与验收条件',
  'context-context-window': '统计本次输入占用的上下文预算',
  'context-window-model': '在上下文预算内发起模型调用',
  'model-state': '记录当前研究结果与待办',
  'memory-context-window': '记录取回资料后的上下文占用',
  'model-context-window': '检查多轮累积的上下文占用',
  'context-window-loop': '继续下一轮研究',
  'context-window-verifier': '压缩后核对目标、证据与待办',
  'compaction-context-window': '摘要替换历史后重新计算占用',
}

/** Edges represent the incoming transition of each step, so only one packet moves at a time. */
function makeSteps(prefix: string, input: StepInput[]): TaskPathStep[] {
  return input.map((entry, index) => {
    const previous = input[index - 1]
    const edgeIds: string[] = []
    if (previous && previous.nodeId !== entry.nodeId) {
      const key = `${previous.nodeId}:${entry.nodeId}`
      let edge = existingEdges.get(key)
      if (!edge) {
        const id = `${previous.nodeId}-${entry.nodeId}`
        edge = supplementalConnections.get(id) ?? {
          id,
          from: previous.nodeId,
          to: entry.nodeId,
          type:
            entry.packetType === 'result'
              ? 'data'
              : entry.nodeId === 'loop' || previous.nodeId === 'loop'
                ? 'loop'
                : 'control',
          label: descriptions[id] ?? entry.title,
        }
        supplementalConnections.set(id, edge)
      }
      edgeIds.push(edge.id)
    }
    return {
      id: `${prefix}-${index}-${entry.nodeId}`,
      nodeId: entry.nodeId,
      title: entry.title,
      action: entry.title,
      explanation: entry.explanation,
      explanationBeginner: entry.explanation,
      explanationStandard: `${entry.explanation} ${entry.message ?? ''}`.trim(),
      explanationExpert:
        entry.expert ??
        `${entry.explanation} 图中的步骤是系统责任和可观察状态的教学示意，不展示模型内部思维或真实工具执行。`,
      message: entry.message ?? '教学模拟',
      edgeIds,
      activeConnections: edgeIds,
      packetType: entry.packetType ?? 'task',
      ...(entry.contextUsage !== undefined ? { contextUsage: entry.contextUsage } : {}),
      ...(entry.gate ? { gate: entry.gate } : {}),
      ...(entry.iteration ? { iteration: entry.iteration } : {}),
      ...(entry.outcome ? { outcome: entry.outcome } : {}),
    }
  })
}

const start = (question: string, reason: string): StepInput[] => [
  {
    nodeId: 'user',
    title: '用户提出目标',
    explanation: '先明确用户要解决的问题和交付要求。',
    message: question,
    packetType: 'task',
  },
  {
    nodeId: 'context',
    title: '准备本次 Context',
    explanation: '系统组织本次要求和必要资料，成为模型这一轮可以看到的输入。',
    message: 'TASK → CONTEXT',
    packetType: 'context',
  },
  {
    nodeId: 'model',
    title: '模型判断下一步',
    explanation: reason,
    message: '依据当前可见信息选择回答或行动。',
    packetType: 'context',
  },
]
const finish: StepInput = {
  nodeId: 'final',
  title: '交付最终回答',
  explanation: '把本次任务的回答交给用户；Final 表示交付，独立核验是否必要由任务要求决定。',
  message: 'FINAL · 教学示例完成',
  packetType: 'result',
}
const verify: StepInput = {
  nodeId: 'verifier',
  title: '按来源和任务要求核验',
  explanation: '核对来源日期、比较口径、未证实信息和交付要求；本例检查通过后才提交报告。',
  message: 'PASS · 已核对本例的来源与验收项',
  packetType: 'verification',
  outcome: 'pass',
}
const noMemory =
  '本次任务不需要跨任务保存的偏好或进度，因此没有读取 Memory。当前 Context 仍然存在。'
const noApproval =
  '本任务没有执行需要人工决定的高风险动作，因此没有经过高风险审批分支；一般工具权限仍由运行系统检查。'
const commonWhyNot = {
  memory: noMemory,
  approval: noApproval,
  guardrail: noApproval,
  'risk-check': noApproval,
  mcp: '本例的工具可以由运行系统直接调用。MCP 是可选连接协议，并非所有工具调用的必经节点。',
  rag: '本例没有检索内部资料库。直接搜索公开网页或读取指定文件，不要求经过独立的 RAG 管线。',
}
const metrics = (
  reasoning: number,
  tools: number,
  loops: number,
  externalInfo: number,
  risk: number,
  verification: number,
) => ({ reasoning, tools, loops, externalInfo, risk, verification })

function simple(id = 'simple', question = '什么是 RAG？', title = '简单概念问答'): TaskScenario {
  return {
    id,
    question,
    title,
    category: 'simple',
    level: 1,
    complexity: metrics(1, 0, 0, 0, 1, 1),
    explanation: '当前模型已有足够知识，不需要访问外部系统，也不需要复杂工具或循环。',
    steps: makeSteps(id, [
      ...start(question, '这是稳定的基础概念，已有知识足以解释，可以直接组织回答。'),
      {
        ...finish,
        message: question.includes('GPU')
          ? 'GPU：擅长同时处理大量相似运算的处理器。'
          : 'RAG：先检索相关资料，再让模型结合资料回答。',
      },
    ]),
    whyNot: {
      ...commonWhyNot,
      web: '当前问题不依赖实时信息，模型已有足够知识，因此没有必要增加外部搜索步骤。',
      files: '用户没有要求读取某份文件，概念问答不需要 File Tool。',
      loop: '一次回答足以完成当前目标，不需要多轮行动与反馈。',
      verifier: '这道基础概念题采用直接回答路径，没有配置独立检查器；这不代表回答天然不会出错。',
    },
  }
}

function toolRound(
  tool: 'web' | 'files' | 'browser',
  subject: string,
  iteration?: number,
): StepInput[] {
  const name = tool === 'web' ? '网页搜索' : tool === 'files' ? '文件工具' : '浏览器'
  return [
    {
      nodeId: 'call',
      title: `生成${name}请求`,
      explanation: `模型生成结构化请求：${subject}。生成请求本身不执行外部操作。`,
      message: `CALL · ${tool}(${subject})`,
      packetType: 'tool-call',
      iteration,
    },
    {
      nodeId: 'harness',
      title: 'Harness 检查并调度',
      explanation:
        '运行系统校验参数、检查访问权限，并调度相应工具。模型负责提出请求，Harness 负责真实执行。',
      message: `CALL → ${name}`,
      packetType: 'tool-call',
      iteration,
    },
    {
      nodeId: tool,
      title: `${name}获取资料`,
      explanation: `工具在授权范围内获取“${subject}”的内容，保留来源或文件定位信息。`,
      message: `模拟工具返回：${subject}；本页不访问外部系统。`,
      packetType: 'tool-call',
      iteration,
    },
    {
      nodeId: 'observation',
      title: 'Tool Result 返回系统',
      explanation: '系统接收工具真正返回的内容与状态。此时工具已完成，但模型还没有读取这一轮结果。',
      message: `RESULT · ${subject}`,
      packetType: 'result',
      iteration,
    },
    {
      nodeId: 'context',
      title: '结果加入下一轮 Context',
      explanation: '工具结果要加入下一轮模型输入，模型才能看到新信息并据此继续判断。',
      message: 'RESULT → CONTEXT · 保留来源、内容与状态',
      packetType: 'result',
      iteration,
    },
    {
      nodeId: 'model',
      title: '模型根据新证据继续判断',
      explanation: `模型现在可以使用刚收到的“${subject}”，判断是否已经满足目标、还缺少什么。`,
      message: '观察结果 → 更新判断',
      packetType: 'context',
      iteration,
    },
  ]
}

function fresh(id = 'fresh-info', question = 'NVIDIA 今天最新的 AI GPU 是什么？'): TaskScenario {
  return {
    id,
    question,
    title: '最新信息查询',
    category: 'fresh-info',
    level: 2,
    complexity: metrics(2, 1, 1, 4, 1, 2),
    explanation:
      '这个问题依赖最新事实，模型需要通过 Web 获取外部信息；搜索结果必须回到 Context，模型才能基于新资料回答。',
    steps: makeSteps(id, [
      ...start(question, '“今天最新”超出静态知识的可靠范围，需要查阅当前公开来源。'),
      ...toolRound('web', 'NVIDIA 官方发布与产品页面'),
      {
        ...finish,
        message: '示意回答：依据带日期的官方资料说明最新产品，并附来源；没有在此页面执行实时查询。',
      },
    ]),
    whyNot: {
      ...commonWhyNot,
      files: '本题要查当前公开发布信息，没有提供需要读取的本地文件，因此选择 Web。',
      database: '公开产品查询不需要修改数据库，也不需要数据库工具。',
      compaction: '本例只有一轮检索，输入仍在预算内，不需要压缩历史。',
    },
  }
}

const fileScenario: TaskScenario = {
  id: 'file',
  title: '文件总结',
  question: '帮我总结这份 PDF。',
  category: 'file',
  level: 2,
  complexity: metrics(2, 1, 1, 2, 1, 2),
  explanation:
    '资料位于用户指定的 PDF，因此选择 File Tool。文件内容返回 Context 后，模型才可以做有依据的总结。',
  steps: makeSteps('file', [
    ...start('帮我总结这份 PDF。', '任务内容在指定文件中，需要先读取 PDF，再按章节总结。'),
    ...toolRound('files', '用户指定 PDF 的章节与页码'),
    { ...finish, message: '示意摘要：主要观点、关键数据、对应页码和未解析的部分。' },
  ]),
  whyNot: {
    ...commonWhyNot,
    web: '用户要求总结指定 PDF，证据就在文件中。无需用网页搜索替代文件内容。',
    database: '读取 PDF 不需要访问或修改数据库。',
    compaction: '当前示例的文件内容可在预算内组织，无需进行历史压缩。',
  },
}

function research(
  id: string,
  question: string,
  subjects: string[],
  title = '深度研究',
  level = 4,
): TaskScenario {
  const rounds: StepInput[] = subjects.flatMap((subject, index) => [
    {
      nodeId: 'loop',
      title: `第 ${index + 1} 轮 · ${index === 0 ? '启动研究' : '带着缺口继续'}`,
      explanation: `Agent Loop 安排第 ${index + 1} 轮行动：${subject}。每轮都经过 Model、Harness、Tool、Result 和 Context。`,
      message: `LOOP ${index + 1}/${subjects.length} · ${subject}`,
      packetType: 'context' as const,
      iteration: index + 1,
    },
    ...toolRound(
      index === subjects.length - 1 && subjects.length > 3 ? 'browser' : 'web',
      subject,
      index + 1,
    ),
  ])
  return {
    id,
    title,
    question,
    category: 'research',
    level,
    complexity: metrics(level, subjects.length > 3 ? 4 : 3, level, 5, 2, level),
    explanation:
      '研究需要先规划，再多次调用工具、观察结果和补齐缺口，最后核验。复杂度来自更多步骤、外部信息、循环和验证要求，而不只是 Prompt 更长。',
    steps: makeSteps(id, [
      ...start(question, '多个对象需要统一比较口径，单次搜索不能覆盖所有证据。'),
      {
        nodeId: 'planning',
        title: '拆分研究计划',
        explanation: `先统一性能、价格和定位的口径，再依次查证 ${subjects.length} 组资料，并标出缺失项。`,
        message: 'PLAN · 来源 → 比较 → 缺口 → 补查 → 验证',
        packetType: 'context',
      },
      ...rounds,
      verify,
      {
        ...finish,
        title: '交付有来源的比较报告',
        message: 'REPORT · 比较结果、来源日期、价格口径与不确定项。',
      },
    ]),
    whyNot: {
      ...commonWhyNot,
      database: '研究读取公开来源并形成报告，不需要修改生产数据。',
      files: '本例的证据来自公开网页；生成报告文本不等于一定调用文件读取工具。',
      compaction: '这次有限研究仍在上下文预算内。持续更长时间才需要展示历史压缩。',
    },
  }
}

const riskScenario: TaskScenario = {
  id: 'high-risk',
  title: '高风险操作',
  question: '删除生产数据库中的旧数据。',
  category: 'high-risk',
  level: 4,
  complexity: metrics(3, 1, 1, 2, 5, 5),
  explanation:
    '模型提出删除请求后，运行系统检查权限、目标和范围，再等待人明确批准。Reject 会停止本次运行，Approve 才会继续模拟执行。',
  steps: makeSteps('high-risk', [
    ...start(
      '删除生产数据库中的旧数据。',
      '删除有外部副作用，需要限定条件、检查风险，并在执行前请求人工决定。',
    ),
    {
      nodeId: 'call',
      title: '生成待审查的删除请求',
      explanation: '先明确目标数据库、旧数据条件和影响范围，形成等待审查的请求。',
      message: 'CALL · demo_production / 过期记录 / 模拟 120 条；尚未执行。',
      packetType: 'tool-call',
    },
    {
      nodeId: 'harness',
      title: '运行系统接收动作',
      explanation: '运行系统接管参数检查与工具调度，模型不会直接连接数据库。',
      packetType: 'tool-call',
    },
    {
      nodeId: 'guardrail',
      title: '检查动作边界',
      explanation: '检查权限、允许操作类型及目标范围。删除动作需要进入高风险分支。',
      message: 'GUARDRAIL · 需要风险检查与人工决定',
      packetType: 'verification',
    },
    {
      nodeId: 'risk-check',
      title: '检查影响范围与恢复条件',
      explanation:
        '本教学情境把目标固定为 120 条过期记录，并展示备份、筛选条件和预计影响，供人做具体决定。',
      message: 'RISK · 120 条 / 已限定范围 / 有恢复方案',
      packetType: 'verification',
    },
    {
      nodeId: 'approval',
      title: '等待人工批准或拒绝',
      explanation: '没有明确批准就不能执行。播放、下一步和拖动时间轴都不能越过这个审批点。',
      message: 'WAIT · Approve → 模拟执行；Reject → STOP',
      packetType: 'verification',
      gate: 'approval',
    },
    {
      nodeId: 'database',
      title: '执行已批准的模拟动作',
      explanation:
        '只有本次动作得到明确批准，运行系统才会调度数据库工具。这里仅改变教学状态，不连接真实数据库。',
      message: 'EXECUTE · 模拟删除 120 条已批准的过期记录',
      packetType: 'tool-call',
    },
    {
      nodeId: 'observation',
      title: '接收数据库返回状态',
      explanation: '返回受影响记录数和执行状态，作为核验依据；提出请求和完成执行是两个步骤。',
      message: 'RESULT · 模拟影响 120 条；返回成功状态',
      packetType: 'result',
    },
    {
      ...verify,
      explanation:
        '核对模拟影响数量与批准范围，确认结果符合本例验收要求。批准动作与验证执行结果是两个独立环节。',
    },
    { ...finish, message: 'PASS · 模拟操作符合本次批准范围。' },
  ]),
  whyNot: {
    ...commonWhyNot,
    web: '这是对指定数据库的操作，公开网页不能提供该数据库的执行权限或结果。',
    memory: '本次批准必须针对当前具体动作，不能以过去的偏好或旧批准代替。',
    loop: '本例是有明确范围的一次动作，审批拒绝后停止，不通过循环重试绕过决定。',
  },
}

function longRunning(
  id = 'long-running',
  question = '连续研究大量资料并持续更新报告。',
): TaskScenario {
  return {
    id,
    title: '长周期 Agent',
    question,
    category: 'long-running',
    level: 5,
    complexity: metrics(5, 4, 5, 5, 2, 5),
    explanation:
      '长周期任务跨多轮保存状态和相关记忆。Context 从 38% 增长到 72%、91%，系统压缩历史后降到 34%，保留目标、证据引用和待办再继续。',
    steps: makeSteps(id, [
      ...start(question, '任务需要持续多轮，需要计划、状态管理、资料回流和停止条件。'),
      {
        nodeId: 'planning',
        title: '规划持续研究与更新条件',
        explanation:
          '定义研究范围、报告更新条件、观察周期和检查要求；时间在本页面中按步骤压缩演示。',
        message: 'PLAN · 观察变化 → 更新报告 → 核验',
        packetType: 'context',
      },
      {
        nodeId: 'loop',
        title: '开始持续工作循环',
        explanation: '运行系统按计划和已保存状态安排下一轮研究。',
        message: 'LOOP 1 · 恢复目标与进度',
        packetType: 'context',
        iteration: 1,
      },
      {
        nodeId: 'harness',
        title: '运行系统恢复研究任务',
        explanation: '运行系统读取可恢复的任务状态，再决定本轮需要哪些信息。',
        packetType: 'context',
      },
      {
        nodeId: 'state',
        title: '恢复当前 State',
        explanation: 'State 保存已完成项目、报告版本、证据引用和待办，是跨轮恢复的依据。',
        message: 'STATE · 已完成 / 待办 / 报告版本',
        packetType: 'context',
      },
      {
        nodeId: 'memory',
        title: '取回相关 Memory',
        explanation: '按相关性取回已保存的研究偏好和长期信息；Memory 不会自动整体进入模型。',
        message: 'MEMORY · 取回相关项',
        packetType: 'context',
      },
      {
        nodeId: 'context',
        title: '相关状态和记忆进入 Context',
        explanation: '运行系统把相关的状态和记忆连同要求组织进本轮输入，模型才可以使用它们。',
        packetType: 'context',
      },
      {
        nodeId: 'context-window',
        title: 'Context 占用 38%',
        explanation: '当前输入占可用上下文预算的 38%，还能继续容纳研究结果。百分比是教学示意。',
        message: 'CONTEXT WINDOW · 38%',
        contextUsage: 38,
        packetType: 'context',
      },
      {
        nodeId: 'model',
        title: '决定第一轮检索',
        explanation: '模型依据恢复的目标和资料生成下一步请求。',
        packetType: 'context',
      },
      ...toolRound('web', '第一批厂商发布资料', 1),
      {
        nodeId: 'context-window',
        title: 'Context 增长到 72%',
        explanation: '多轮工具结果与保留的历史增加了输入占用；系统继续监测预算。',
        message: 'CONTEXT WINDOW · 72%',
        contextUsage: 72,
        packetType: 'context',
      },
      {
        nodeId: 'loop',
        title: '第 2 轮 · 补充变化来源',
        explanation: '新资料出现后继续调度，沿同一系统再次经过请求、执行和结果回流。',
        message: 'LOOP 2 · 获取变化',
        packetType: 'context',
        iteration: 2,
      },
      ...toolRound('browser', '新增技术说明与价格变动', 2),
      {
        nodeId: 'state',
        title: '更新报告进度与证据引用',
        explanation: '记录本轮新增证据和未解决问题，避免历史压缩后丢失任务进度。',
        message: 'STATE · 保存目标、证据引用、未完成项',
        packetType: 'context',
      },
      {
        nodeId: 'memory',
        title: '保存值得跨轮保留的信息',
        explanation: '按规则选择相关研究状态保存，原始工具输出仍可通过引用找到。',
        packetType: 'context',
      },
      {
        nodeId: 'context-window',
        title: 'Context 接近上限：91%',
        explanation: '当前示例在 91% 时触发压缩策略，避免后续资料挤掉目标和重要证据。',
        message: 'CONTEXT WINDOW · 91% → 触发压缩',
        contextUsage: 91,
        packetType: 'context',
      },
      {
        nodeId: 'compaction',
        title: 'Compaction 压缩历史',
        explanation:
          '把冗长历史整理成可继续工作的摘要，保留目标、决定、证据引用、进度和待办；这不是修改模型参数。',
        message: 'COMPACTION · 保留目标 / 证据 / 状态 / 待办',
        packetType: 'context',
      },
      {
        nodeId: 'context-window',
        title: '压缩后 Context 降到 34%',
        explanation:
          '摘要替换冗长历史后占用降到 34%。资料依据仍通过引用保留，后续轮次可以继续工作。',
        message: 'CONTEXT WINDOW · 34% · 可继续研究',
        contextUsage: 34,
        packetType: 'context',
      },
      {
        ...verify,
        explanation: '核对压缩后是否保留目标、关键证据引用和待办，再检查本轮报告是否满足更新要求。',
      },
      {
        ...finish,
        title: '交付本轮更新，保留后续状态',
        message: 'REPORT · 本轮已更新；之后按计划从保存的 State 继续。',
      },
    ]),
    whyNot: {
      approval: noApproval,
      guardrail: noApproval,
      'risk-check': noApproval,
      database: '本例持续读取研究资料并更新报告，不执行生产数据库删除。',
      rag: commonWhyNot.rag,
      mcp: commonWhyNot.mcp,
    },
  }
}

export const taskScenarios: TaskScenario[] = [
  simple(),
  fresh(),
  fileScenario,
  research(
    'research',
    '调研 NVIDIA、AMD、Google 最新 AI 芯片，比较性能、价格和市场定位，并输出报告。',
    [
      'NVIDIA 官方规格与日期',
      'AMD 官方规格与日期',
      'Google 官方规格与日期',
      '补查缺少的价格和相同测试口径',
    ],
  ),
  riskScenario,
  longRunning(),
]
export const gpuComplexityLadder: TaskScenario[] = [
  simple('gpu-1', '什么是 GPU？', 'GPU · 基础概念'),
  { ...fresh('gpu-2', '最新 GPU 是什么？'), title: 'GPU · 最新信息' },
  research(
    'gpu-3',
    '比较三款最新 GPU。',
    ['第一款 GPU 的官方资料', '第二款 GPU 的官方资料', '第三款 GPU 的官方资料'],
    'GPU · 三款对比',
    3,
  ),
  research(
    'gpu-4',
    '调研十家厂商并生成报告。',
    Array.from({ length: 10 }, (_, i) => `第 ${i + 1} 家厂商的 AI 加速器规格、价格与定位`),
    'GPU · 十家研究',
    4,
  ),
  { ...longRunning('gpu-5', '持续监控一个月，有变化就更新报告。'), title: 'GPU · 持续监控' },
]
export const allTaskScenarios = [...taskScenarios, ...gpuComplexityLadder]
export const getTaskScenario = (id: string): TaskScenario =>
  allTaskScenarios.find((item) => item.id === id) ?? taskScenarios[0]

const riskNode: ExploreNode = {
  id: 'risk-check',
  label: 'Risk Check',
  chineseLabel: '动作风险检查',
  category: 'verification',
  level: 1,
  position: [10.4, 3.1, 3.8],
  kind: 'check',
  parentId: 'guardrail',
  description: '在动作执行前检查可能影响的范围和恢复条件。',
  technicalDefinition:
    '评估目标、参数、影响范围、可恢复性与操作副作用，将具体信息交给审批或拒绝分支。',
  responsibility: '让人工决定针对一个具体、可审查的动作。',
  confused: '风险检查不等于人工批准，也不能代替底层权限。',
  upstream: ['guardrail'],
  downstream: ['approval'],
  related: ['verifier', 'database'],
  lessonId: 'harness',
}
export const immersiveScenarioConnections = [
  ...exploreConnections,
  ...supplementalConnections.values(),
]
export const immersiveScenarioNodes = [...exploreNodes, riskNode].map((node) => ({
  ...node,
  upstream: [
    ...new Set([
      ...node.upstream,
      ...immersiveScenarioConnections
        .filter((edge) => edge.to === node.id)
        .map((edge) => edge.from),
    ]),
  ],
  downstream: [
    ...new Set([
      ...node.downstream,
      ...immersiveScenarioConnections
        .filter((edge) => edge.from === node.id)
        .map((edge) => edge.to),
    ]),
  ],
}))
const simulatorNodeIds = new Set([
  ...allTaskScenarios.flatMap((task) => task.steps.map((step) => step.nodeId)),
  'rag',
  'mcp',
  'tools',
  'code',
  'api',
  'external',
])
/** A task changes emphasis, never the set or positions of nodes in the simulator map. */
export const simulatorGraph = {
  nodes: immersiveScenarioNodes.filter((node) => simulatorNodeIds.has(node.id)),
  connections: immersiveScenarioConnections.filter(
    (edge) => simulatorNodeIds.has(edge.from) && simulatorNodeIds.has(edge.to),
  ),
}

export function explainTaskStep(step: TaskPathStep, level: ExplanationLevel): string {
  return level === 'beginner'
    ? step.explanationBeginner
    : level === 'standard'
      ? step.explanationStandard
      : step.explanationExpert
}
export function whyThisNode(
  task: TaskScenario,
  nodeId: string,
  level: ExplanationLevel = 'beginner',
): string[] {
  return [
    ...new Set(
      task.steps
        .filter((step) => step.nodeId === nodeId)
        .map((step) => explainTaskStep(step, level)),
    ),
  ]
}
export function whyNotThisNode(task: TaskScenario, nodeId: string): string {
  if (task.steps.some((step) => step.nodeId === nodeId))
    return '这个节点已在当前任务路径中；展开“为什么走这里”可以查看各轮职责。'
  if (task.whyNot[nodeId]) return task.whyNot[nodeId]
  const node = immersiveScenarioNodes.find((entry) => entry.id === nodeId)
  return `当前“${task.title}”的目标不需要单独经过${node?.chineseLabel ?? nodeId}。${node?.responsibility ?? '系统按任务实际需要选择能力。'} 这张图强调本任务采用的路径，并不代表其他系统不能采用不同实现。`
}
