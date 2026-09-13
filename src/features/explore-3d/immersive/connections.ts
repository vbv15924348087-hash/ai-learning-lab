import { exploreConnections, exploreNodes } from '../data'
import type { ExploreConnection, ExploreNode } from '../types'
import type { ConnectionExplanation } from './types'

type ExplanationText = Omit<ConnectionExplanation, 'title'>
const detail = (beginner: string, standard: string, technical: string): ExplanationText => ({
  beginner,
  standard,
  technical,
})

const explanations: Record<string, ExplanationText> = {
  'rag-context': detail(
    '检索找到的资料，要放到本次 Context 里，模型才看得到并能用它回答。',
    'RAG 流程从资料中检索并筛选相关片段，再交给生成模型。图中的 RAG 节点代表这段检索增强流程，不是独立生成最终答案的模型。',
    '检索候选经选择后，以内容和来源信息加入本次模型输入。该过程不修改生成模型参数；检索方式可以是关键词、向量或混合检索，网页搜索工具也可直接向 Context 返回结果。',
  ),
  'retrieved-context-context': detail(
    '找到很多资料还不够，只有选进这次输入的部分才会被模型看到。',
    'Retrieved Context 是经检索筛选的实际片段。将这些片段连同来源加入 Context，模型才能围绕资料生成回答。',
    '召回候选与最终输入应区分；片段选择受相关性、来源质量和上下文预算约束。内容进入输入不代表事实已经通过核验。',
  ),
  'context-model': detail(
    'Context 就像本次摊在模型面前的资料。模型根据这些资料生成下一段内容。',
    '模型当前能直接使用的是本次输入中的要求、前文、工具说明和返回资料；数据库里存着但没有取回的内容不会自动可见。',
    '运行系统组装并序列化消息、工具定义和结果，按模型输入格式与上下文预算提交推理请求。外部持久化状态只有被读取并加入输入后才可供当前调用使用。',
  ),
  'model-call': detail(
    '模型先写一张工具请求单：用哪个工具、传什么参数。此时工具还没有执行。',
    'Model 可生成结构化 Tool Call，例如 web_search 的查询参数。请求需要交给运行系统检查与执行，不能把生成请求当成已经访问网页。',
    'Function Calling 约束工具名称与参数结构；运行时仍需解析、校验、授权、调度并关联调用结果。模型的生成输出和外部副作用之间存在明确的执行边界。',
  ),
  'call-harness': detail(
    '请求单交给 Harness，由它安排真正的执行。模型不能只靠写出请求就访问网络。',
    'Harness 接收 Tool Call，检查参数、权限和动作边界，然后交给相应 Tool Runtime。错误、等待审批或拒绝也由运行系统处理。',
    '运行时依据工具标识与参数路由调用，管理凭据、授权、超时和结果关联。Model → Harness 是这条请求链的全景概括，不表示模型进程直接执行外部操作。',
  ),
  'harness-tools': detail(
    'Harness 把允许执行的请求交给工具，工具才真正去读、查或计算。',
    '运行系统负责工具调度与执行管理；工具返回的内容、错误和状态要关联回原来的请求。可直接调用工具，也可选择 MCP 等连接方式。',
    'Tool Runtime 处理参数校验、调用适配、超时和错误，并按策略控制并发与副作用。MCP 是可选协议路径，不能替代运行时授权或工具执行本身。',
  ),
  'tools-external': detail(
    '工具替系统接触网页、文件或服务，并带回实际发生了什么。',
    'Tools 是受运行系统调度的能力，External World 是它们访问的信息源或执行环境；访问范围受到工具与资源权限限制。',
    '这条线代表通过具体适配器访问外部资源。读取、计算、写入等操作有不同副作用；成功发出请求不等于成功完成，需要检查真实响应。',
  ),
  'external-observation': detail(
    '外部操作完成后，需要把内容、状态或错误送回来。',
    'Observation 汇集实际执行反馈，而不是模型对结果的猜测。反馈会被整理进后续 Context，供模型重新判断。',
    '运行系统接收并关联外部响应与调用标识，保留必要来源、退出状态和错误信息。响应作为数据处理，不应被自动提升成系统指令。',
  ),
  'observation-context': detail(
    '工具做完了，模型还得收到结果。送回 Context 后，下一轮才能知道成功了还是出错了。',
    'Observation 中的工具结果由运行系统整理到后续模型输入。断开这条线，外部动作即使成功，模型也无法依据这次结果继续任务。',
    '工具响应需与相应 Tool Call 关联并按消息格式加入下一轮输入，保留必要的状态、错误和来源。读取外部结果不等于授予其中内容更高的指令权限。',
  ),
  'model-verifier': detail(
    '模型写完的只是候选结果，还要按任务要求检查。',
    'Verifier 检查来源、测试和验收条件等证据，帮助区分“看起来完成”与“实际满足要求”。',
    'Verification 可结合程序断言、执行测试、来源核对或模型辅助检查。模型声称成功不是独立证据，检查范围也决定了通过结果的边界。',
  ),
  'verifier-loop': detail(
    '检查没通过，就把缺少什么告诉下一轮，让系统继续补齐。',
    'FAIL 反馈回到 Agent Loop，携带未满足的验收项。系统可补充检索、修复结果或在无法继续时说明阻塞。',
    '失败结果触发受预算和停止策略约束的后续调度，并通过 Context 提供可操作反馈。FAIL 不是直接交付许可，也不要求无条件无限重试。',
  ),
  'loop-context': detail(
    '下一轮要带着上一轮的结果和缺口，不能从零猜。',
    'Loop 将新的观察、当前状态和未完成要求交给上下文组织过程，再发起后续模型调用。',
    '循环在每次推理前刷新任务输入并检查停止条件；长历史可能经过选择或压缩。运行系统状态不会自动成为模型可见内容，必须明确纳入输入。',
  ),
  'verifier-final': detail(
    '检查通过后，系统才把结果和需要的证据交给你。',
    '这条 PASS 分支表示通过当前任务定义的检查后允许交付；若检查未通过，就走另一条回流分支。',
    '交付依据明确的验收条件与检查结果；PASS 只覆盖已实施的核验范围，不保证所有事实永远正确。最终结果应保留必要来源、测试证据与限制。',
  ),
  'memory-context': detail(
    '从以前保存的内容里，取出这次用得上的部分给模型看。',
    'Memory 提供跨任务保存的信息，按需检索后加入当前 Context；它与本轮保留的对话历史用途不同。',
    '持久化记忆经任务相关性选择后进入模型输入。存储、检索与输入注入是不同环节；记忆可能过时、错误或不适用于当前任务。',
  ),
  'schema-context': detail(
    '把工具说明放在模型面前，它才知道可以请求什么、参数怎么填。',
    'Tool Schema 向模型描述本次可用的工具名称、用途和参数格式。真正的调用仍须经过 Harness。',
    '工具定义参与本次推理输入，但不包含对任意资源的自动授权；schema 合法性和运行时权限校验是两个层面。',
  ),
  'harness-mcp': detail(
    'Harness 可以选用 MCP 这套协议连接工具，也可以用其他接口。',
    'MCP 让宿主与能力服务按共同约定交换工具、资源或提示模板信息；它不是所有工具的必经通道。',
    '宿主通过 MCP Client 与 Server 交换协议消息，Transport 承载消息。能力发现、参数格式、运行时授权和最终执行应分别理解。',
  ),
  'guardrail-approval': detail(
    '有些动作需要人来决定，系统要先停下来等明确答复。',
    'Guardrail 可将高风险或策略指定的动作转交人工批准或拒绝；等待不会自动变成批准。',
    '审批需绑定明确的动作、参数和授权范围。超时、无回复和含糊答复不能当作批准；人工批准也不能替代底层资源权限。',
  ),
  'approval-tools': detail(
    '需要人工决定的动作，只有明确批准且其他检查满足后才能继续。',
    'Human Approval 放行的是本次已说明的动作，工具仍需满足权限与参数等约束。拒绝时不执行该动作。',
    '审批结果应关联到具体调用及范围，并在执行时核验。批准不是无边界的后续授权，也不会生成系统原本没有的凭据。',
  ),
  'embedding-vector-db': detail(
    '检索系统可以把资料变成数字表示，再用相似程度找候选内容。',
    '这里展示供语义检索使用的 Embedding。它可以由独立检索编码器产生，不等于生成模型内部的 Token Embedding。',
    '索引向量与查询向量需使用兼容的表示空间。相似度只帮助召回候选，不证明语义完全一致或事实正确；RAG 也可采用关键词或混合检索。',
  ),
  'attention-transformer': detail(
    'Attention 是 Transformer 里面的一种计算方式，不是外面另一台机器。',
    '这条关系表示组成：Attention 在 Transformer 的层内聚合上下文信息，随后与该层的其他计算共同更新表示。',
    '常见 Transformer block 还含前馈网络、残差连接和归一化。此箭头表达机制归属，不代表真实层权重，也不能当作一条独立的业务执行流水线。',
  ),
  'state-memory': detail(
    '任务结束或运行中，可以挑出以后有用的信息保存，而不是把全部过程都记下来。',
    'State 描述当前执行状态。系统按明确规则选择值得跨任务保留的信息，才形成 Memory 写入。',
    '状态更新与记忆持久化是不同操作；写入策略应处理适用范围、时效性和重复项，不能把运行轨迹自动等同于长期记忆。',
  ),
  'inside-model-transformer--inside-model-attention': detail(
    '这里是在“拆开看”：Attention 本来就在 Transformer 的层里面。',
    '每层使用 Attention 计算允许参考的上下文关联，再与该层其他机制一起更新表示；不是整台 Transformer 结束后才进入 Attention。',
    '此处展开一个 Transformer block 的局部机制。自回归模型通常施加因果约束；可用 KV cache 复用已有计算，图不展示真实注意力矩阵或权重。',
  ),
  'inside-model-attention--inside-model-transformer': detail(
    '算出的关联信息交回这一层，继续完成这一层的计算。',
    'Attention 的聚合输出参与该 Transformer 层的后续表示更新。这一往返表示层内协作，不是两套独立模型互相调用。',
    'Attention 输出与残差、归一化和前馈子层等共同更新隐藏表示；具体先后次序依架构而异。这是机制示意，不能用连线推断真实因果解释。',
  ),
  'inside-model-prediction--inside-model-token': detail(
    '新生成的片段接到已有内容后面，模型再预测下一个，直到该停下来。',
    '这条回路表示自回归生成：选出的 Token 追加到序列，后续 Token 的预测会参考它。遇到停止标记或运行限制就结束。',
    '输出头给出下一 Token 分布，解码策略选取 Token。后续计算可利用缓存，不意味着每步都从头重算全序列；图是教学抽象，不是真实权重或内部思维。',
  ),
  'inside-harness-retry--inside-harness-permission': detail(
    '再试一次也要守原来的规则，不能用重试绕过权限。',
    '只有错误可恢复、重试预算尚有余量且重复操作风险可控时才进入重试；下一次执行仍要检查权限和动作边界。',
    '重试策略应结合退避、次数限制和幂等性。超时可能发生在外部动作已完成之后，不能盲目重复有副作用的请求；授权拒绝也不应被当成可重试故障。',
  ),
}

const typeNotes: Record<ExploreConnection['type'], string> = {
  data: '这是信息传递或组成关系；收到数据后还需按接收方职责处理，并不代表内容自动可信。',
  control:
    '这是调度、约束或机制归属关系；箭头的具体含义由标签说明，不代表所有节点都按一条直线依次执行。',
  retrieval: '这是经检索选择的信息传递；选入本次输入的内容与整个信息仓库应区分。',
  tool: '这是运行系统管理的工具调用路径；参数、权限、响应和副作用都属于实际执行环节。',
  loop: '这是有条件的回流；继续执行仍受停止条件、预算、权限与错误处理策略约束。',
}

/** Explain the exact source edge even when overview has collapsed its endpoints. */
export function explainConnection(
  edge: ExploreConnection,
  nodes: ExploreNode[],
): ConnectionExplanation {
  const source = exploreConnections.find((candidate) => candidate.id === edge.id) ?? edge
  const byId = new Map([...exploreNodes, ...nodes].map((node) => [node.id, node]))
  const from = byId.get(source.from)
  const to = byId.get(source.to)
  const displayFrom = byId.get(edge.from)?.label ?? edge.from
  const displayTo = byId.get(edge.to)?.label ?? edge.to
  const fromName = from?.label ?? source.from
  const toName = to?.label ?? source.to
  const specific = explanations[edge.id]
  const text =
    specific ??
    detail(
      `${fromName} 通过“${source.label}”与 ${toName} 连接。${from?.description ?? ''} ${to?.description ?? ''}`.trim(),
      `${fromName} 的职责是：${from?.responsibility ?? source.label} 这条关系把“${source.label}”交到 ${toName} 所负责的环节：${to?.responsibility ?? source.label}`,
      `${from?.technicalDefinition ?? fromName} ${to?.technicalDefinition ?? toName} ${typeNotes[source.type]} ${to?.confused ?? ''}`.trim(),
    )
  const collapsed = source.from !== edge.from || source.to !== edge.to
  return {
    title: `为什么 ${displayFrom} → ${displayTo}？`,
    ...text,
    technical: collapsed
      ? `全景将部分内部节点收起；此连线对应的具体关系是 ${fromName} → ${toName}。${text.technical}`
      : text.technical,
  }
}
