import type { LessonStep, NodeExplanation } from '../types'

export const NVIDIA_QUESTION = '帮我查 NVIDIA 最新的 AI GPU，并简单告诉我它是什么。'
const simple: LessonStep['scene'] = { variant: 'simple', visibleNodes: ['user', 'model', 'answer'] }
const desk = (items: number, named = false): LessonStep['scene'] => ({
  variant: 'context',
  visibleNodes:
    items < 2
      ? ['user', 'context', 'model']
      : items < 3
        ? ['user', 'context', 'model', 'action']
        : ['user', 'context', 'model', 'action', 'result'],
  contextItems: items,
  showContextTerm: named,
})
const system: LessonStep['scene'] = {
  variant: 'system',
  visibleNodes: ['user', 'context', 'model', 'harness', 'tool', 'result', 'answer'],
  contextItems: 4,
  showContextTerm: true,
  showModelTerm: true,
  showToolTerm: true,
  showHarnessTerm: true,
}

export const systemOverviewSteps: LessonStep[] = [
  {
    id: 'familiar',
    section: 'intuition',
    kicker: '从你熟悉的体验开始',
    title: '你问一句，AI 回一句。',
    beginnerExplanation:
      '平时你看到的 AI，很像这样：你输入一个问题，模型处理，然后给你一段回答。先从这个熟悉的画面开始。',
    whyItMatters: '接下来，我们只追踪上面这一个 NVIDIA 问题，看看一句回答是怎样来到你面前的。',
    activeNodes: ['user', 'model', 'answer'],
    activeConnections: ['user-model', 'model-answer'],
    flowText: '你的问题 → 模型处理 → 生成回答',
    scene: simple,
  },
  {
    id: 'prediction',
    section: 'intuition',
    kicker: '先做一个小判断',
    title: '“最新”，它也知道吗？',
    beginnerExplanation:
      '如果你问：今天 NVIDIA 最新的 AI GPU 是什么？模型真的可以只靠自己直接回答吗？',
    whyItMatters: '先选出你的直觉。接下来的过程会解释，系统为什么还需要模型之外的部分。',
    activeNodes: ['model'],
    activeConnections: [],
    flowText: '问题来到模型：我拥有的知识，足够回答“最新”吗？',
    gate: 'prediction',
    scene: simple,
  },
  {
    id: 'desk-question',
    section: 'discover',
    kicker: '01 / 先把信息放到桌上',
    title: '回答之前，先看见问题。',
    beginnerExplanation:
      '模型需要先看到与当前任务相关的信息。应用先把你的 NVIDIA 问题放到它这一次工作的桌面上。',
    whyItMatters: '“查最新的 AI GPU”和“简单介绍”都是需求。模型需要读到它们，才能知道你要它做什么。',
    activeNodes: ['context'],
    activeConnections: ['user-context'],
    flowText: '你的问题 → 本次任务的工作台',
    scene: desk(1),
  },
  {
    id: 'desk-conversation',
    section: 'discover',
    kicker: '01 / 再放入对话',
    title: '你刚才说过的话，也有用。',
    beginnerExplanation:
      '如果前面对话里你说过“我是新手，请讲简单一点”，应用也可以把这段对话交给模型。本例把这个要求一起放到桌上。',
    whyItMatters:
      '同一个 GPU，给新手的解释和给工程师的解释可以不同。相关对话帮助模型理解你的需要。',
    activeNodes: ['context'],
    activeConnections: [],
    flowText: '工作台加入：当前对话「我是新手，请讲简单一点」',
    scene: desk(2),
  },
  {
    id: 'desk-rules',
    section: 'discover',
    kicker: '01 / 加入回答规则',
    title: '应用也会给一些规则。',
    beginnerExplanation:
      '系统可以告诉模型：“最新信息请核对来源，回答用容易理解的中文。”这些规则与问题一起，成为它当前能看到的信息。',
    whyItMatters:
      '这能帮助模型按当前应用的要求完成任务。例如，介绍 NVIDIA GPU 时优先参考官方资料。',
    activeNodes: ['context'],
    activeConnections: [],
    flowText: '工作台加入：系统给模型的规则',
    scene: desk(3),
  },
  {
    id: 'desk-tools',
    section: 'discover',
    kicker: '01 / 告诉它有哪些外部能力',
    title: '还要知道，可以找谁帮忙。',
    beginnerExplanation:
      '应用告诉模型：这里提供网页搜索。桌上放的是这项能力的说明，搜索还没有真正发生。',
    whyItMatters:
      '知道有搜索可用，模型才能在需要最新 NVIDIA 资料时提出请求。能看到工具说明，不等于已经拿到搜索结果。',
    activeNodes: ['context'],
    activeConnections: [],
    flowText: '工作台加入：可用的网页搜索说明',
    scene: desk(4),
  },
  {
    id: 'context-name',
    section: 'discover',
    kicker: '认识第一个专业词',
    title: '这张工作台，就叫上下文。',
    beginnerExplanation:
      '你的问题、相关对话、系统规则和可用工具说明，组成模型这一刻真正能看到的信息。我们把它叫作 Context，也就是上下文。',
    whyItMatters:
      '模型靠当前收到的信息工作。后面我们会单独拆开 Context；这一章，先记住“模型当前的工作台”。',
    activeNodes: ['context', 'model'],
    activeConnections: ['context-model'],
    flowText: '工作台上的信息 → 交给模型',
    unlocks: 'context',
    scene: desk(4, true),
  },
  {
    id: 'model-read',
    section: 'discover',
    kicker: '02 / 根据现有信息判断',
    title: '这次任务，需要新资料。',
    beginnerExplanation:
      '模型读到“最新”，判断这次任务需要核对新资料。它有训练得到的知识，但这些知识不保证涵盖今天刚发布的产品。',
    whyItMatters:
      '我们显示的是任务状态：读取问题 → 判断需求 → 需要最新资料。这是教学概括，不是模型内部思考的记录。',
    activeNodes: ['model'],
    activeConnections: ['context-model'],
    flowText: '读取问题 → 判断任务 → 发现需要最新资料',
    scene: desk(4, true),
  },
  {
    id: 'model-decision',
    section: 'discover',
    kicker: '02 / 选择下一步',
    title: '先搜索，再回答。',
    beginnerExplanation:
      '负责理解当前信息、判断下一步的部分，就是 Model（模型）。在这个案例里，它选择请求网页搜索，先获取 NVIDIA 最新资料。',
    whyItMatters:
      '模型可以直接回答，也可以请求外部帮助。对于“最新”的问题，先查资料更符合这次任务的需要。',
    activeNodes: ['model', 'action'],
    activeConnections: ['model-action'],
    flowText: '模型做决定 → 请求使用网页搜索',
    unlocks: 'model',
    scene: {
      variant: 'decision',
      visibleNodes: ['model', 'answer', 'action'],
      showModelTerm: true,
      packet: '搜索 NVIDIA 最新 AI GPU 官方资料',
    },
  },
  {
    id: 'tool-pause',
    section: 'discover',
    kicker: '03 / 模型请求外部帮助',
    title: '等一下，谁真的去搜索？',
    beginnerExplanation:
      '网页搜索这样的外部能力，叫作 Tool（工具）。模型已经提出“我要搜索”。但模型真的自己打开浏览器了吗？',
    whyItMatters: '先停在请求发出的这一刻：决定要做什么，与让动作真的发生，是两个不同的工作。',
    activeNodes: ['action'],
    activeConnections: ['model-action'],
    flowText: '模型 →「我要搜索」→ 等待执行',
    unlocks: 'tool',
    gate: 'harness',
    scene: {
      variant: 'request',
      visibleNodes: ['model', 'action', 'tool'],
      showModelTerm: true,
      showToolTerm: true,
      packet: '网页搜索请求 · 尚未执行',
    },
  },
  {
    id: 'harness-reveal',
    section: 'discover',
    kicker: '04 / 让决定成为动作',
    title: '有一个系统，替它执行。',
    beginnerExplanation:
      '模型只提出搜索请求。承载它工作的运行系统接到请求后，才真正调用网页搜索，再把工具返回的资料接回来。',
    whyItMatters:
      '模型负责决定“要做什么”。运行系统负责让这个动作“真的发生”，并把结果送回去，让模型继续回答。',
    activeNodes: ['harness'],
    activeConnections: ['action-harness', 'harness-tool'],
    flowText: '模型的搜索请求 → 运行系统 → 网页搜索',
    scene: {
      variant: 'request',
      visibleNodes: ['model', 'action', 'harness', 'tool'],
      showModelTerm: true,
      showToolTerm: true,
      packet: '接收请求，调用搜索',
    },
  },
  {
    id: 'harness-name',
    section: 'discover',
    kicker: '认识让任务运转的部分',
    title: '它叫 Harness，运行系统。',
    beginnerExplanation:
      'Harness 是承载模型工作、执行工具和控制流程的运行系统。如果 Model 像大脑，Harness 就像身体与神经系统，把决定变成动作，再传回结果。',
    whyItMatters: '现在各个角色已经出现。接下来用九步，从头看一遍这条 NVIDIA 任务怎样完成。',
    activeNodes: ['harness', 'tool'],
    activeConnections: ['action-harness', 'harness-tool'],
    flowText: '模型决定 → Harness 执行 → 工具工作',
    unlocks: 'harness',
    scene: {
      variant: 'request',
      visibleNodes: ['model', 'action', 'harness', 'tool'],
      showModelTerm: true,
      showToolTerm: true,
      showHarnessTerm: true,
    },
  },
  {
    id: 'demo-input',
    section: 'demo',
    kicker: '完整演示 · 01 / 09',
    title: '你提出一个问题。',
    beginnerExplanation: `“${NVIDIA_QUESTION}” 这句话给整个系统一个明确的任务。`,
    whyItMatters: '任务包含两件事：找到最新资料，再用简单的话介绍。接下来每一步都围绕这个目标。',
    activeNodes: ['user'],
    activeConnections: [],
    flowText: '你 → 提出 NVIDIA 问题',
    scene: { ...system, packet: '查最新产品 + 简单介绍' },
  },
  {
    id: 'demo-context',
    section: 'demo',
    kicker: '完整演示 · 02 / 09',
    title: '问题进入当前工作台。',
    beginnerExplanation:
      '应用把问题与相关对话、规则、可用工具说明放在一起，准备交给模型。这就是这一次任务的 Context。',
    whyItMatters: '模型不仅需要问题本身，也需要知道回答要求，以及有没有搜索这样的外部能力可用。',
    activeNodes: ['context'],
    activeConnections: ['user-context'],
    flowText: '用户问题 → Context',
    scene: { ...system, packet: '问题、对话、规则、工具说明' },
  },
  {
    id: 'demo-model',
    section: 'demo',
    kicker: '完整演示 · 03 / 09',
    title: '模型读到这些信息。',
    beginnerExplanation:
      'Context 交给 Model。模型依据当前收到的信息，理解你要查 NVIDIA 最新 AI GPU，并需要一段新手能看懂的介绍。',
    whyItMatters: '它用当前能看到的信息处理任务。此时桌上还没有刚刚搜索到的网页内容。',
    activeNodes: ['model'],
    activeConnections: ['context-model'],
    flowText: 'Context → Model',
    scene: { ...system, packet: '读取当前任务的信息' },
  },
  {
    id: 'demo-decision',
    section: 'demo',
    kicker: '完整演示 · 04 / 09',
    title: '模型判断：需要最新资料。',
    beginnerExplanation:
      '已有知识不保证覆盖最新发布。模型判断，这次应先查 NVIDIA 官方信息，再介绍产品。',
    whyItMatters: '“最新”会随时间变化，不能只凭已有知识就保证答案是最新的。',
    activeNodes: ['model'],
    activeConnections: [],
    flowText: 'Model：先获取最新资料，再组织回答',
    scene: { ...system, packet: '下一步：请求网页搜索' },
  },
  {
    id: 'demo-request',
    section: 'demo',
    kicker: '完整演示 · 05 / 09',
    title: '发出请求，还没有执行。',
    beginnerExplanation:
      '模型发出工具请求，说明要用网页搜索查 NVIDIA 最新 AI GPU。这个请求先交给 Harness。',
    whyItMatters: '请求只表达“要做什么”。模型本身没有因此直接访问互联网，执行还需要运行系统。',
    activeNodes: ['model', 'harness'],
    activeConnections: ['model-harness'],
    flowText: 'Model → 搜索请求 → Harness',
    scene: { ...system, packet: 'Tool Request：搜索 NVIDIA 最新 AI GPU' },
  },
  {
    id: 'demo-execute',
    section: 'demo',
    kicker: '完整演示 · 06 / 09',
    title: '运行系统调用网页搜索。',
    beginnerExplanation:
      'Harness 接到模型的请求，调用 Web Search 工具。到这一步，搜索动作才真正由系统发起。',
    whyItMatters: '工具为模型提供外部能力；Harness 负责把模型的请求交给工具执行。',
    activeNodes: ['harness', 'tool'],
    activeConnections: ['harness-tool'],
    flowText: 'Harness → 执行 Web Search',
    scene: { ...system, packet: 'Web Search · 搜索 NVIDIA 官方资料' },
  },
  {
    id: 'demo-result',
    section: 'demo',
    kicker: '完整演示 · 07 / 09',
    title: '搜索结果先返回运行系统。',
    beginnerExplanation:
      '网页搜索返回资料，由 Harness 接收。资料包含产品名称、发布时间和用途等内容；它还不是给用户的最终回答。',
    whyItMatters:
      '工具负责带回资料。接下来还需要把资料交给模型，让它根据你的问题组织成容易理解的答案。',
    activeNodes: ['result', 'harness'],
    activeConnections: ['tool-result', 'result-harness'],
    flowText: 'Web Search → Result（资料）→ Harness',
    scene: { ...system, packet: '教学示例资料：产品名称、发布时间、AI 计算用途' },
  },
  {
    id: 'demo-return',
    section: 'demo',
    kicker: '完整演示 · 08 / 09',
    title: '新资料回到模型的工作台。',
    beginnerExplanation:
      'Harness 把搜索结果放回 Context，再交给 Model。现在模型终于看到了刚才缺少的外部资料。',
    whyItMatters:
      '拿到新资料后，模型才有依据继续介绍产品。这补充了当前任务的信息，并不等于重新训练了模型。',
    activeNodes: ['context', 'model'],
    activeConnections: ['harness-context', 'context-model'],
    flowText: 'Harness → 带上搜索结果的 Context → Model',
    scene: { ...system, packet: '新增资料已放回 Context' },
  },
  {
    id: 'demo-answer',
    section: 'demo',
    kicker: '完整演示 · 09 / 09',
    title: '把查到的资料，讲给你听。',
    beginnerExplanation:
      '模型结合新资料组织回答。例如：“这款 GPU 是用于大量并行计算的芯片，可以帮助训练和运行 AI。”实际产品名称和发布时间，应来自刚查到的官方资料。',
    whyItMatters:
      '你看到的一段回答，来自问题、信息、判断和执行的配合。本页是教学模拟，不进行实时搜索，也不宣称某个型号现在最新。',
    activeNodes: ['model', 'answer'],
    activeConnections: ['model-answer'],
    flowText: 'Model + 新资料 → Answer → 你',
    scene: { ...system, packet: '给新手的产品介绍 · 附官方来源' },
  },
  {
    id: 'explore',
    section: 'explore',
    kicker: '把各个角色连起来',
    title: 'AI 是一个相互配合的系统。',
    beginnerExplanation:
      '这就是 AI System：你的问题变成模型能看到的信息；模型判断需要什么；Harness 执行工具；结果返回后，模型再生成回答。',
    whyItMatters: '点击图中任一节点，复述它在 NVIDIA 案例里做了什么。准备好后，完成下方的小挑战。',
    activeNodes: [],
    activeConnections: [],
    flowText:
      'User → Context → Model → Harness → Tool → Result → Harness → Context → Model → Answer',
    unlocks: 'ai-system',
    scene: system,
  },
]

export const nodeExplanations: Record<string, NodeExplanation> = {
  user: {
    id: 'user',
    label: '提出问题的人',
    term: 'User / User Input',
    explanation: '用一句话告诉系统，你想完成什么。',
    connections: '你的问题 → Context',
    example: `你提出：“${NVIDIA_QUESTION}”`,
  },
  context: {
    id: 'context',
    label: '模型当前的工作台',
    term: 'Context · 上下文',
    explanation: '模型当前这次任务真正能看到的信息。',
    connections: '接收问题和工具结果 → 交给 Model',
    example: '放着 NVIDIA 问题、简单讲解的要求、搜索说明，以及后来查到的资料。',
    followUp: '后面会单独拆开 Context。',
  },
  model: {
    id: 'model',
    label: '理解信息，判断下一步',
    term: 'Model · 模型',
    explanation: '根据当前信息判断下一步，并组织回答。',
    connections: '读取 Context → 向 Harness 提出请求，或生成 Answer',
    example: '发现“最新”需要查资料，于是请求搜索；收到资料后再介绍 GPU。',
  },
  harness: {
    id: 'harness',
    label: '把决定变成真正的动作',
    term: 'Harness · 运行系统',
    explanation: '承载模型工作、执行工具和控制流程的运行系统。',
    connections: '接收 Model 请求 → 调用 Tool → 把结果放回 Context',
    example: '模型说“我要搜索 NVIDIA 最新 GPU”，Harness 才真正调用 Web Search。',
    followUp: '后面会单独拆解 Harness 内部。',
  },
  tool: {
    id: 'tool',
    label: '提供外部帮助',
    term: 'Tool · 工具',
    explanation: '模型可以请求调用的外部能力。',
    connections: '由 Harness 调用 → 返回 Result',
    example: 'Web Search 搜索 NVIDIA 官方资料，把检索到的内容返回。',
  },
  result: {
    id: 'result',
    label: '从外面带回的资料',
    term: 'Result · 工具结果',
    explanation: '工具执行后返回的信息，还不是最终回答。',
    connections: 'Tool → Result → Harness → Context → Model',
    example: '搜索带回产品名称、发布时间和用途，模型根据它们继续回答。',
  },
  answer: {
    id: 'answer',
    label: '回到你面前的回答',
    term: 'Answer · 最终回答',
    explanation: '模型根据现有信息，组织出对你有用的内容。',
    connections: 'Model → Answer → 你',
    example: '用简单的话介绍查到的 NVIDIA AI GPU，并附上资料来源。',
  },
}
