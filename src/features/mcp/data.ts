import type { ChapterDefinition } from '../curriculum/types'

export const services = [
  {
    id: 'github',
    name: 'GitHub',
    symbol: 'GH',
    purpose: '查看代码仓库的研究资料',
    tool: 'get_repository',
    args: '{ repository: "demo/gpu-research" }',
    resource: 'repo://demo/gpu-research/README',
    prompt: 'review_research_repository',
    result: '示例仓库包含 README、研究计划和来源清单。',
    external: '代码托管 API',
  },
  {
    id: 'database',
    name: 'Database',
    symbol: 'DB',
    purpose: '读取内部设备库存',
    tool: 'query_inventory',
    args: '{ category: "training_gpu" }',
    resource: 'schema://inventory/gpu_devices',
    prompt: 'summarize_inventory',
    result: '示例库存返回 3 条设备记录，包含型号、数量和机房位置。',
    external: '数据库查询接口',
  },
  {
    id: 'slack',
    name: 'Slack',
    symbol: 'SL',
    purpose: '查找项目已有讨论',
    tool: 'search_messages',
    args: '{ query: "GPU 采购约束" }',
    resource: 'channel://research/project-brief',
    prompt: 'summarize_project_discussion',
    result: '示例讨论提到了预算范围与机房交付时间。',
    external: '团队消息 API',
  },
]

export const capabilityTypes = [
  {
    id: 'tool',
    name: 'Tool',
    label: '可请求执行的能力',
    analogy: '请帮我查一次库存。',
    detail:
      '暴露名称、说明与参数结构，供系统发现和调用。通常由模型提出请求，经宿主应用按权限规则执行。',
    example: 'query_inventory({ category: "training_gpu" })',
  },
  {
    id: 'resource',
    name: 'Resource',
    label: '可读取的资料',
    analogy: '把库存表的字段说明拿给我看。',
    detail:
      '通过 URI 等标识提供可读取的内容。应用决定何时读取、如何加入 Context；资源本身不是一个动作请求。',
    example: 'schema://inventory/gpu_devices',
  },
  {
    id: 'prompt',
    name: 'Prompt',
    label: '可复用的提示模板',
    analogy: '按这个盘点模板整理结果。',
    detail:
      '服务器可以提供带参数的提示模板，由用户或应用选择并展开。模板进入输入后依然需要模型处理。',
    example: 'summarize_inventory(department: "research")',
  },
]

export const chapter: ChapterDefinition = {
  id: 'mcp',
  phase: 10,
  title: 'MCP',
  heading: '不同外部服务，使用共同的连接语言。',
  subtitle: '认识 Client、Server 与连接协议，分清连接和智能。',
  minutes: 9,
  connection:
    'Tools 提供外部能力，Harness 负责运行。MCP 帮助宿主应用用标准方式发现和使用这些能力。',
  goal: '能指出 MCP 在 Agent 与外部服务之间的位置，区分 Tool、Resource、Prompt 和 Transport。',
  steps: [
    {
      id: 'connection-problem',
      title: '多接一个服务，就要重新约定一套方式吗？',
      beginnerExplanation:
        '研究助手需要读代码仓库、查数据库、看项目讨论。服务各有接口，但发现能力、描述参数、发出请求和接收结果，可以使用共同的协议。',
      whyItMatters: '通用连接约定能减少重复集成工作，但仍需要各服务自己的实现。',
      technicalExplanation:
        'MCP（Model Context Protocol）为宿主应用与服务器之间的能力发现和交互提供标准协议。服务器通常包装已有 API 或本地能力；协议不消除认证、权限、业务语义和服务维护的工作。',
      interactionHint: '选择共同连接协议负责的部分。',
      terms: [],
    },
    {
      id: 'switch-servers',
      title: '同一个助手，切换三种外部能力。',
      beginnerExplanation:
        'Agent 在 Harness 里工作。宿主应用中的 MCP Client 连接对应 MCP Server，服务器再对接外部服务。切换服务，观察相同的调用结构与不同的业务内容。',
      whyItMatters: '共同的是协议，变化的是服务器提供的能力与结果。',
      technicalExplanation:
        'MCP Host 可以管理多个 Client 连接；图中的 Client 区域概括这些连接。Server 提供它声明支持的能力，通过约定传输交换消息。Tool Call 必须实际执行后才有结果；图中请求与返回全部为本地教学模拟。',
      interactionHint: '依次选择 GitHub、Database、Slack，并模拟一次只读调用。',
      terms: ['mcp', 'mcp-client', 'mcp-server'],
    },
    {
      id: 'protocol-parts',
      title: '协议里不只有工具，还有资料与模板。',
      beginnerExplanation:
        'Tool 是可执行能力；Resource 是可读内容；Prompt 是可复用的提示模板。Transport 则负责把协议消息送到另一端。',
      whyItMatters: '区分提供什么，与怎样传送，可以准确理解一次 MCP 集成。',
      technicalExplanation:
        'MCP 的能力通过协商确定，服务器不必实现全部能力。常见传输包括本地进程的 stdio 与网络服务的 Streamable HTTP。不同传输具有不同部署、会话与认证考虑；统一协议不代表所有实现互换即用。',
      interactionHint: '点开 Tool、Resource、Prompt，并比较两种 Transport。',
      terms: ['tool', 'resource', 'prompt', 'transport'],
    },
    {
      id: 'mcp-system',
      title: '连接协议位于运行层，模型仍负责判断。',
      beginnerExplanation:
        'MCP 让系统连接外部能力。它不会自己决定研究目标，也不会替模型思考。返回的结果进入 Context，模型再判断下一步。',
      whyItMatters: '下一章比较预设流程与动态决策，它们都可能使用同样的 MCP 连接。',
      technicalExplanation:
        'MCP 不是 Model、Agent 或 Tool 本身，而是协议与基础设施层。MCP Server 可以暴露工具，但该工具的业务实现是独立的。权限和 Guardrail 仍由宿主应用及服务端共同落实。',
      interactionHint: '沿着结果返回路径阅读，再确认 MCP 的位置。',
      terms: [],
    },
  ],
  terms: [
    {
      id: 'mcp',
      name: 'MCP',
      label: '连接外部能力的标准协议',
      definition:
        'Model Context Protocol：连接外部 Tool、Resource 等能力的标准协议与基础设施层，不是 Model 或 Agent。',
    },
    {
      id: 'mcp-client',
      name: 'MCP Client',
      label: '宿主应用里的连接端',
      definition: '由宿主应用创建，用于与 MCP Server 建立连接、协商能力并交换协议消息的客户端。',
    },
    {
      id: 'mcp-server',
      name: 'MCP Server',
      label: '对外暴露能力的服务端',
      definition:
        '通过 MCP 提供其支持的工具、资源、提示模板等能力，并与外部服务或本地实现对接的服务器。',
    },
    {
      id: 'tool',
      name: 'Tool',
      label: '可以请求调用的外部能力',
      definition: '系统向模型暴露的、可以被请求调用的外部能力；MCP 是发现和调用它的一种连接方式。',
    },
    {
      id: 'resource',
      name: 'Resource',
      label: '供应用读取的内容',
      definition: 'MCP Server 通过标识符提供的可读取内容，例如文件、数据库结构或文档片段。',
    },
    {
      id: 'prompt',
      name: 'Prompt',
      label: '可复用的提示模板',
      definition:
        '在 MCP 中指服务器提供的可复用、可带参数的提示模板；展开后可作为模型输入的一部分。',
    },
    {
      id: 'transport',
      name: 'Transport',
      label: '传送协议消息的方式',
      definition:
        'Client 与 Server 交换协议消息的传输机制，例如本地 stdio 或网络 Streamable HTTP。',
    },
  ],
  misconceptions: [
    {
      wrong: 'MCP 就是一个 Agent。',
      correct: 'MCP 是连接协议。Agent 的目标、决策与循环仍由模型和运行系统承担。',
    },
    {
      wrong: '支持 MCP，模型就能直接访问所有服务。',
      correct: '还需要服务器实现、能力协商、认证与权限配置。',
    },
    {
      wrong: 'MCP Server 一定提供全部 Tool、Resource、Prompt。',
      correct: '服务器只需要实现其声明支持的能力，实际内容依实现而定。',
    },
    {
      wrong: '统一协议意味着可以跳过权限检查。',
      correct: '协议不授予业务权限，宿主和服务器仍需检查可执行的动作。',
    },
  ],
  challenge: [
    {
      id: 'server-swap',
      prompt: '助手从 GitHub 切换到数据库后，需要换一个模型才能用 MCP 吗？',
      answer: 'same',
      options: [
        {
          id: 'new',
          label: '需要，MCP 就是针对每个服务的专用模型',
          explanation: 'MCP 不负责模型推理，也不是专用模型。',
        },
        {
          id: 'same',
          label: '不必；连接对应 Server，使用它提供的能力',
          explanation: '连接与能力定义可以改变，执行判断的模型可以仍然相同。',
        },
      ],
    },
    {
      id: 'capability',
      prompt: '你只想把数据库字段说明加入当前输入，没有要执行查询。对应哪类 MCP 能力？',
      answer: 'resource',
      options: [
        {
          id: 'resource',
          label: '读取 Server 提供的 Resource',
          explanation: '字段说明属于可读取的内容，读取后可由应用加入 Context。',
        },
        {
          id: 'model',
          label: '把 MCP Server 当作新的推理模型',
          explanation: 'Server 提供外部能力，不因此等同于推理模型。',
        },
      ],
    },
    {
      id: 'permission',
      prompt: 'Server 声明了一个删除工具，是否代表当前用户自动获得删除权限？',
      answer: 'check',
      options: [
        { id: 'yes', label: '是，能发现工具就有权执行', explanation: '发现能力不等于已授权执行。' },
        {
          id: 'check',
          label: '否，仍需权限与风险检查',
          explanation: '统一协议与业务授权承担不同职责。',
        },
      ],
    },
  ],
  takeaway: 'MCP 标准化连接与能力交互；Agent 的决策、工具实现和权限仍各有负责人。',
}
