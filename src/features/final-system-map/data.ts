import type { ChapterDefinition, ChallengeQuestion } from '../curriculum/types'

const question = (
  id: string,
  prompt: string,
  right: string,
  wrong: string,
  reason: string,
): ChallengeQuestion => ({
  id,
  prompt,
  answer: 'apply',
  options: [
    { id: 'apply', label: right, explanation: reason },
    { id: 'skip', label: wrong, explanation: `${reason}请据此重新判断。` },
  ],
})

export const chapter: ChapterDefinition = {
  id: 'final-system-map',
  phase: 16,
  title: 'Final System Map',
  heading: '现在，把整个系统连起来。',
  subtitle: '从最初的一问一答，到一个可以行动、检查与持续工作的 AI 系统。',
  minutes: 15,
  connection:
    '你已看过模型、资料、工具与运行系统。现在研究 AI GPU、读取内部 PDF，并生成一份经过检查的报告。',
  goal: '面对一个完整任务，能解释每个模块为什么存在、信息怎么流动，以及什么时候该继续或停止。',
  steps: [
    {
      id: 'expand',
      title: '从三个节点展开',
      beginnerExplanation:
        '刚开始，你只看到提问、模型和回答。现在揭开界面背后的结构：模型需要相关信息，外部动作需要运行系统，最终结果还需要检查。',
      whyItMatters: '孤立的术语只有连成信息流，才能解释一个系统怎样工作。',
      technicalExplanation:
        '本图是常见逻辑职责的教学示意。不同产品可以把职责合并、拆分或放在不同进程；它不代表某个厂商的真实内部架构。Model 可直接回答，也可生成工具或交接请求；并非每轮都需要工具。',
      interactionHint:
        '点击“展开完整 AI 系统 →”，再分别查看 Context、Model、Harness 与 Verification。',
      terms: ['modern-system'],
    },
    {
      id: 'trace',
      title: '跟随一次完整任务',
      beginnerExplanation:
        '让同一项 GPU 研究任务穿过这些模块。结果不可靠时继续查找，Context 快满时保留关键状态，检查通过后再交付。',
      whyItMatters: '系统图描述关系；任务轨迹解释这些关系何时真正起作用。',
      technicalExplanation:
        '每个高亮是可观察的教学事件，分析摘要不是模型隐藏推理。Tool Result 要经组织进入 Context，模型才能使用；异常、权限等待和验证失败都是运行状态。',
      interactionHint: '使用“下一事件”或自动播放看完 12 个事件；可以随时暂停或回看。',
      terms: ['observation-cycle', 'completion'],
    },
    {
      id: 'graph',
      title: '探索术语之间的关系',
      beginnerExplanation:
        '一个概念会连接到多个章节。比如 Embedding 既出现在模型内部，也用于语义检索；RAG 输出的信息最后进入 Context。',
      whyItMatters: '知道概念属于哪里、依赖什么、容易与什么混淆，比孤立背定义更有用。',
      technicalExplanation:
        '术语图按主要职责分组，连接表示知识依赖或信息流，不意味着各概念只能属于一个组。RAG 可结合关键词、向量和混合检索；长期 Memory 也可以使用检索技术。',
      interactionHint:
        '搜索或点击术语，分别查看 Context、Model、Tools、Runtime 四组中至少一个概念。',
      terms: ['knowledge-graph'],
    },
    {
      id: 'synthesis',
      title: '用自己的话解释系统',
      beginnerExplanation:
        '现在，你可以把“AI 帮我做事”拆开解释：谁准备信息、谁决定、谁执行、谁核验，以及谁负责持续运行。',
      whyItMatters: 'Codex 或 Claude Code 这类产品需要一整套系统配合，才能完成多步真实任务。',
      technicalExplanation:
        'Modern AI System ≈ Model + Context Engineering + Harness。这是职责归纳，不是严格数学公式。Agent 的具体实现可以混合确定性工作流、模型决策、多 Agent、工具和人工控制。',
      interactionHint: '把“准备信息”“决定下一步”“调度执行”对应到三类职责，再进入毕业挑战。',
      terms: ['system-responsibility'],
    },
  ],
  terms: [
    {
      id: 'modern-system',
      name: 'Modern AI System',
      label: '现代 AI 系统',
      definition: '模型、上下文组织与运行系统共同完成用户任务；界面呈现的是这一系统的结果。',
    },
    {
      id: 'observation-cycle',
      name: 'Observation → Context → Model',
      label: '反馈闭环',
      definition: '外部执行结果经组织进入 Context，模型基于新的可见信息再次判断。',
    },
    {
      id: 'completion',
      name: 'Completion Criteria',
      label: '完成条件',
      definition: '事先明确且可检查的成功条件，决定任务是否可以结束。',
    },
    {
      id: 'knowledge-graph',
      name: 'Knowledge Graph',
      label: '知识关系图',
      definition: '以节点和关系组织概念，帮助查询归属、依赖、输出与易混淆项。',
    },
    {
      id: 'system-responsibility',
      name: 'System Responsibility',
      label: '系统职责边界',
      definition: '区分模型决策、上下文准备和运行系统执行等职责，避免把整个产品等同于一个模型。',
    },
  ],
  misconceptions: [
    {
      wrong: '图里的每个任务都必须经过所有模块。',
      correct:
        '图展示可用职责；简单问题可以直接回答，工具、RAG、Memory 或多 Agent 都应按任务需要使用。',
    },
    {
      wrong: '把更强模型接进来，就能替代权限、状态和验证。',
      correct: '模型能力不能替代运行系统的可靠执行和边界控制，结果仍需要可检查的条件。',
    },
    {
      wrong: '系统图就是某个产品真实内部架构。',
      correct: '这里展示常见职责和信息流的教学示意，实际产品的模块边界与实现会不同。',
    },
  ],
  challenge: [
    question(
      'context',
      'GPU 报告任务刚开始。哪些信息应该进入本次 Context？',
      '目标、规则、相关资料、必要历史与工具说明。',
      '把所有历史、所有文件和数据库全部放进去。',
      'Context 应选择当前任务相关、可信且容量允许的信息。Prompt 是其中一部分。',
    ),
    question(
      'memory',
      '上次任务保存了“优先中文，必须标注来源”。这次怎样使用？',
      '检索相关 Memory，再把这条偏好加入当前 Context。',
      '认为模型已自动看见长期仓库里的全部内容。',
      'Memory 可跨任务保存信息，但需要取出并加入 Context，才是本次可见内容。',
    ),
    question(
      'rag',
      '内部资料库有 1000 份文档，需要找 AI GPU 的采购约束。应该怎样做？',
      '用 RAG 检索并筛选相关片段，补充 Context。',
      '用这些文件重新训练模型后才能回答。',
      'RAG 临时检索外部知识并加入 Context，不要求更新模型参数。',
    ),
    question(
      'file',
      '用户指定“打开这份内部 PDF，看第 3 页表格”。最直接的能力是什么？',
      '由系统调用 File Tool 读取指定文件内容。',
      '认为知道文件名就等于模型已经看见文件内容。',
      '文件要经过实际读取，结果进入 Context；指定文件读取与大资料库检索是不同需求。',
    ),
    question(
      'execute',
      '模型生成了 browser.open 的 Tool Call。此时发生了什么？',
      '生成了请求；Harness 仍需检查并调度工具执行。',
      '模型已经亲自打开网页并确认其内容。',
      'Function Calling 生成结构化请求，Tool Runtime 执行后才有真实 Tool Result。',
    ),
    question(
      'harness',
      '搜索超时，需要判断是否重试并保存任务状态。谁承载这些能力？',
      'Harness 运行系统；模型可参与制定下一步策略。',
      'MCP 协议自动替系统做全部决策。',
      'Harness 管理循环、执行、状态和策略；MCP 负责标准连接，不承担整个 Agent 的职责。',
    ),
    question(
      'mcp',
      '同一个 Agent 要访问多个外部服务，MCP 在哪里？',
      'Harness 中的 Client 通过 MCP 连接暴露能力的 Server。',
      'MCP 就是负责推理的模型。',
      'MCP 是连接工具、资源等能力的标准协议；它不是模型或 Agent。',
    ),
    question(
      'loop',
      '第一次搜索只有论坛转载，报告要求官方来源。下一步是什么？',
      '观察不足，继续循环查官方资料。',
      '因为已经搜过一次，直接结束。',
      '循环依据反馈继续行动，并以完成条件决定何时停止。',
    ),
    question(
      'verification',
      '模型说“报告写完了”。怎样判断任务真的完成？',
      '核验来源、引用和所有任务要求，不通过就修复。',
      '只要模型再说一次“我检查过了”即可。',
      'Verification 使用可检查证据。流畅且自信的主观检查不能代替外部验证。',
    ),
    question(
      'guardrail',
      '一个请求要求删除保存报告的数据库。系统应该怎样处理？',
      '风险检查触发权限门禁，在需要时请求人工批准或拒绝。',
      'Agent 自主工作意味着可以直接删除。',
      'Guardrail 限制动作边界，Human in the Loop 为关键高风险动作引入人的判断。',
    ),
    question(
      'compaction',
      '长时间研究使 Context 快满了，如何继续？',
      '压缩重复历史，保留目标、状态、决策、失败、待办与关键证据。',
      '清空长期 Memory，就能无限扩大 Context Window。',
      'Compaction 整理历史 Context，不能改变窗口上限，也不等于删除 Memory。',
    ),
    question(
      'delegation',
      '研究子 Agent 完成资料收集后，把结果交回 Manager；另一场景则把后续任务交给 Data Agent。它们如何区分？',
      '前者是 Agent-as-Tool，后者是 Handoff。',
      '两者都是把工具同时运行，与控制权无关。',
      '子任务调用返回管理者；Handoff 转移后续控制权。多 Agent 的价值是清晰分工与上下文隔离。',
    ),
  ].map((q, i) => (i % 2 ? { ...q, options: [...q.options].reverse() } : q)),
  takeaway:
    'Modern AI System ≈ Model + Context Engineering + Harness。任务能否完成，取决于信息、决策、执行、反馈与验证能否连成闭环。',
}
