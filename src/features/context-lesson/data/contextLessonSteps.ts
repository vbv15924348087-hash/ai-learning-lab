import type { ContextLessonStep, ContextSource } from '../types'
import { NVIDIA_QUESTION } from '../../system-overview/data/systemOverviewSteps'

export const contextSources: ContextSource[] = [
  {
    id: 'prompt',
    label: '用户问题',
    english: 'User Prompt',
    origin: '来自你',
    content: NVIDIA_QUESTION,
    explanation:
      '用户这一次直接提出的问题。它说明要查什么、希望怎样回答，是当前工作资料中的一部分。',
    flow: ['你提出问题', '加入当前工作台', '交给模型'],
  },
  {
    id: 'rules',
    label: '系统规则',
    english: 'System Instruction',
    origin: '来自应用',
    content: '最新信息先核对来源，用容易理解的中文回答。',
    explanation: '系统提前告诉模型应该怎么工作、有哪些规则。这些说明也会与用户问题一起提供给模型。',
    flow: ['应用提供工作规则', '加入 Context', '指导这一次回答'],
  },
  {
    id: 'history',
    label: '当前对话',
    english: 'Conversation History',
    origin: '来自这段对话',
    content: '你刚才说：“我是新手，请讲简单一点。”',
    explanation: '当前对话里之前已经发生过的内容。系统选入的相关对话帮助模型理解你此刻的需要。',
    flow: ['之前的对话', '选入相关内容', '加入 Context'],
  },
  {
    id: 'tools',
    label: '可用工具说明',
    english: 'Tool Definition',
    origin: '来自应用提供的能力',
    content: '网页搜索：用关键词查找公开网页，返回标题、来源与摘要。',
    explanation:
      '告诉模型有哪些工具、怎样请求它们。工具说明本身不会带来新资料，实际搜索后的结果需要另外加入。',
    flow: ['工具的使用说明', '加入 Context', '模型知道可请求搜索'],
  },
  {
    id: 'memory',
    label: '取出的记忆',
    english: 'Memory',
    origin: '来自长期保存的信息',
    content: '本例取出一条偏好：“介绍技术时，优先用生活中的例子。”',
    explanation:
      'Memory 像长期仓库。仓库里的东西不会自动全部放到桌面上；与当前任务有关的内容被取出后，才进入 Context。',
    flow: ['Memory · 长期仓库', '取出相关偏好', '加入 Context'],
  },
  {
    id: 'rag',
    label: '找回的参考资料',
    english: 'RAG',
    origin: '来自外部知识资料',
    content: '从官方 GPU 资料页找到的相关片段：产品用途与 AI 计算场景。',
    explanation:
      'RAG 是先去外部找资料，再带着相关资料回答的方法。找到的内容放进 Context 后，模型才能在这次回答中使用。',
    flow: ['外部知识', '搜索 / 检索', '相关资料片段', '加入 Context'],
  },
  {
    id: 'result',
    label: '工具返回的结果',
    english: 'Tool Result',
    origin: '来自刚才的搜索',
    content: '搜索返回的核对信息：官方来源、产品名称、发布时间。',
    explanation:
      '工具执行后带回的信息也需要加入 Context。搜索结果可以承载检索资料，两者可能重叠；实际使用时要去重。这里展示的是互补的教学示例。',
    flow: ['网页搜索执行', '返回核对信息', '加入 Context', '模型继续回答'],
  },
]

const allItems = contextSources.map((source) => source.id)
const assembly: Omit<
  ContextLessonStep,
  'id' | 'title' | 'kicker' | 'beginnerExplanation' | 'whyItMatters' | 'flowText' | 'items'
> = { section: 'discover', variant: 'assembly' }

export const contextLessonSteps: ContextLessonStep[] = [
  {
    id: 'first-look',
    section: 'discover',
    variant: 'question',
    items: [],
    gate: 'prediction',
    kicker: '先凭直觉，做一个判断',
    title: '它看到的，只有这一句话吗？',
    beginnerExplanation:
      '上一章，系统查到了资料，模型才继续回答。现在把时间停在回答之前：它面前真的只有你输入的那一句话吗？',
    whyItMatters: '先选出你的直觉。接下来，我们把模型拿到的资料一张张展开。',
    flowText: '你提出 NVIDIA 问题 → 模型准备回答',
  },
  {
    ...assembly,
    id: 'assemble-prompt',
    kicker: '放上第 1 张资料卡',
    title: '先把你的问题放到桌上。',
    items: allItems.slice(0, 1),
    activeSource: 'prompt',
    beginnerExplanation:
      '模型需要读到你这一次的需求。查 NVIDIA 最新的 AI GPU，再简单介绍：这句话告诉它现在要完成什么。',
    whyItMatters: '把这个空间想成模型当前的工作台。此刻先放上问题，接下来还会加入其他资料。',
    flowText: '用户问题 → 当前工作台',
  },
  {
    ...assembly,
    id: 'assemble-rules',
    kicker: '放上第 2 张资料卡',
    title: '还会收到应用的工作规则。',
    items: allItems.slice(0, 2),
    activeSource: 'rules',
    beginnerExplanation:
      '应用可以提前告诉模型：“最新信息先核对来源，用容易理解的中文回答。”这些要求会与问题一起交给它。',
    whyItMatters: '它不仅需要知道查什么，也需要知道应该怎样完成这次任务。',
    flowText: '系统规则 → 与问题放在一起',
  },
  {
    ...assembly,
    id: 'assemble-history',
    kicker: '放上第 3 张资料卡',
    title: '你刚才说过的话，也可能在场。',
    items: allItems.slice(0, 3),
    activeSource: 'history',
    beginnerExplanation:
      '比如，你前面说过“我是新手，请讲简单一点”。相关对话被一起放上工作台，模型才能接着当前话题回答。',
    whyItMatters: '对话记录只有实际被提供给模型的部分，才属于它这一刻能看到的信息。',
    flowText: '相关对话 → 当前工作台',
  },
  {
    ...assembly,
    id: 'assemble-tools',
    kicker: '放上第 4 张资料卡',
    title: '先告诉它，有哪些工具可用。',
    items: allItems.slice(0, 4),
    activeSource: 'tools',
    beginnerExplanation:
      '应用提供一张网页搜索说明：可以查什么、怎样请求搜索、会返回什么。模型读到说明后，才知道这项能力可以帮上忙。',
    whyItMatters: '工具说明介绍的是能力。搜索还需要真正执行，才会带回资料。',
    flowText: '网页搜索的使用说明 → 当前工作台',
  },
  {
    ...assembly,
    id: 'assemble-memory',
    kicker: '放上第 5 张资料卡',
    title: '长期保存的偏好，要先取出来。',
    items: allItems.slice(0, 5),
    activeSource: 'memory',
    beginnerExplanation:
      '假设系统曾保存你喜欢生活化例子的偏好。这次它取出这条相关信息，放到工作台上，帮助模型把 GPU 讲得更易懂。',
    whyItMatters: '长期仓库仍在外面。进入工作台的，只是这次取出的相关内容。',
    flowText: '长期仓库 → 取出相关偏好 → 当前工作台',
  },
  {
    ...assembly,
    id: 'assemble-rag',
    kicker: '放上第 6 张资料卡',
    title: '去外部找到相关的参考资料。',
    items: allItems.slice(0, 6),
    activeSource: 'rag',
    beginnerExplanation:
      '系统从外部资料里找到 NVIDIA 官方页面中与 GPU 用途相关的片段。它把这些内容带回来，交给模型参考。',
    whyItMatters: '找到资料只是前半步。资料还要放上当前工作台，模型这一次才能使用它。',
    flowText: '外部资料 → 找到相关片段 → 当前工作台',
  },
  {
    ...assembly,
    id: 'assemble-result',
    kicker: '放上第 7 张资料卡',
    title: '刚才工具带回的结果，也要加入。',
    items: allItems,
    activeSource: 'result',
    beginnerExplanation:
      '继续上一章的搜索：工具返回的官方来源、产品名称和发布时间被补充进来。模型现在拿到的信息，比你最初输入的一句话丰富得多。',
    whyItMatters:
      '工作台由系统动态组装。搜索结果与参考资料可能重叠，实际使用时应合并重复内容；这里用互补信息演示不同来源。',
    flowText: '工具执行 → 结果加入工作台 → 模型读取',
  },
  {
    id: 'prompt-in-context',
    section: 'discover',
    variant: 'subset',
    items: allItems,
    activeSource: 'prompt',
    unlocks: ['prompt', 'context'],
    kicker: '看懂关系，再认识名字',
    title: '你的提问，是整个工作台的一部分。',
    beginnerExplanation:
      '你直接给模型的问题或指令，叫 Prompt。模型当前这一次推理真正能看到的全部信息，合起来就是 Context（上下文）。',
    whyItMatters:
      'Prompt 只是 Context 的一部分。系统规则、相关对话、工具说明和找回的资料，都可能一起在场。',
    flowText: 'Prompt ⊂ Context → Model',
  },
  {
    id: 'memory-source',
    section: 'sources',
    variant: 'sources',
    items: allItems,
    activeSource: 'memory',
    kicker: '点击来源，看看信息怎样进来',
    title: '仓库里的东西，不会自动全上桌。',
    beginnerExplanation:
      'Memory 像长期保存信息的仓库。系统先找到与当前任务有关的内容，再把它加入 Context。仓库与当前工作台，是两个不同的部分。',
    whyItMatters: '点击任一来源，查看它的作用。保存过某条信息，不代表模型此刻已经看到了它。',
    flowText: 'Memory → 取出相关信息 → Context → Model',
  },
  {
    id: 'rag-source',
    section: 'sources',
    variant: 'sources',
    items: allItems,
    activeSource: 'rag',
    kicker: '再看一种补充资料的方式',
    title: '找资料的方法，也不是工作台本身。',
    beginnerExplanation:
      'RAG 是临时去外部找资料，再把相关内容放进 Context 的方法。Memory 是仓库，RAG 是找资料的方法，Context 是当前工作台。',
    whyItMatters: 'Memory 和 RAG 都可以提供当前任务的信息，进入 Context 的是取出的内容或检索结果。',
    flowText: '外部知识 → 搜索 / 检索 → 相关内容 → Context',
  },
  {
    id: 'capacity-small',
    section: 'capacity',
    variant: 'capacity',
    items: ['prompt', 'rules'],
    contextLoad: 30,
    kicker: '观察这张工作台的容量',
    title: '这一次能放下的信息，有边界。',
    beginnerExplanation:
      '先放上问题和必要规则。你会看到容量条占用了一部分：模型单次能够处理的信息并不是无限的。',
    whyItMatters: '这里的百分比只用于演示容量变化，不代表某个真实模型的测量值。',
    flowText: '用户问题 + 系统规则 → 示例容量 30%',
  },
  {
    id: 'capacity-medium',
    section: 'capacity',
    variant: 'capacity',
    items: ['prompt', 'rules', 'history', 'tools'],
    contextLoad: 60,
    kicker: '资料继续加入',
    title: '对话和工具说明，也占用空间。',
    beginnerExplanation:
      '加入相关对话与工具说明后，容量条继续增加。它们都属于这一次提供给模型的信息。',
    whyItMatters: '容量不会只计算你最后输入的一句话，其他被提供的内容同样需要空间。',
    flowText: '再加入对话 + 工具说明 → 示例容量 60%',
  },
  {
    id: 'capacity-name',
    section: 'capacity',
    variant: 'capacity',
    items: allItems,
    contextLoad: 90,
    unlocks: ['context-window'],
    kicker: '看见容量边界，再认识术语',
    title: '这道边界，叫 Context Window。',
    beginnerExplanation:
      '找回的网页资料与工具结果继续占用空间。Context Window（上下文窗口），就是模型单次推理能够处理的信息范围。',
    whyItMatters: '当前工作台接近容量边界，不代表长期 Memory 仓库快满了。这是两个不同的空间。',
    flowText: '补充资料与工具结果 → 示例容量 90% · 接近边界',
  },
  {
    id: 'signal-and-noise',
    section: 'capacity',
    variant: 'comparison',
    items: ['prompt', 'rag', 'result'],
    kicker: '切换两种工作台，比较一下',
    title: '资料越多，真的越好吗？',
    beginnerExplanation:
      '一边是问题、NVIDIA 官方资料和必要的工具结果。另一边还塞进了无关文章、旧聊天、旅游攻略与重复网页。切换看看，两边分别多了什么。',
    whyItMatters:
      '信息多，不代表信息有效。无关和重复的内容占用空间，也可能干扰回答；关键是相关、清晰、有用。',
    flowText: '相同任务 → 比较相关信息与混杂信息',
  },
  {
    id: 'organize-information',
    section: 'practice',
    variant: 'engineering',
    items: ['prompt', 'rag', 'tools', 'result'],
    kicker: '先用人话理解这份工作',
    title: '决定这一次，到底让模型看到什么。',
    beginnerExplanation:
      '从很多可用信息里选出相关内容，合并重复资料，再按问题、要求和证据组织好。必要时补充缺少的资料，同时照顾容量边界。',
    whyItMatters:
      '不是把能找到的内容都放进去，而是让模型拿到完成当前任务真正需要的信息。下一步，交给你来选择。',
    flowText: '可用信息 → 筛选 / 组织 / 排序 → 当前资料 → Model',
  },
  {
    id: 'engineering-practice',
    section: 'practice',
    variant: 'engineering',
    items: ['prompt', 'rag', 'tools', 'result'],
    gate: 'engineering',
    kicker: '轮到你来整理工作台',
    title: '这八张卡，你会留下哪些？',
    beginnerExplanation:
      '仍然是 NVIDIA 最新 AI GPU 的问题。到下方练习中选择值得提供给模型的卡片，再查看逐张反馈。',
    whyItMatters:
      '这个练习假设系统仍可能继续搜索。与当前任务无关的旧信息可以移走，重复信息可以合并，拿不准的内容要看是否相关。',
    flowText: '选择资料 → 查看反馈 → 整理当前工作台',
  },
  {
    id: 'engineering-name',
    section: 'practice',
    variant: 'engineering',
    items: ['prompt', 'rag', 'tools', 'result'],
    unlocks: ['context-engineering'],
    kicker: '你已经亲手做过了',
    title: '刚才的整理，就是 Context Engineering。',
    beginnerExplanation:
      'Context Engineering（上下文工程），就是为当前任务选择、组织、补充和控制模型上下文的过程。你刚才已经完成了一次最小实践。',
    whyItMatters:
      '用一句话记住它：决定模型这一次到底应该看到什么。完成下方三个关系判断，就能记录本章进度。',
    flowText: '选择 + 组织 + 补充 + 控制 → 合适的 Context',
  },
  {
    id: 'whole-picture',
    section: 'practice',
    variant: 'summary',
    items: allItems,
    kicker: '把这张关系图带走',
    title: '现在，解释它这一刻看见了什么。',
    beginnerExplanation:
      'Prompt 是 Context 的一部分。Memory 中取出的相关信息、RAG 找回的资料与工具结果，进入当前工作台后，再一起交给模型。',
    whyItMatters:
      'Context Window 有容量边界。Context Engineering 决定这一次该留下什么，让信息相关、清晰、有用。',
    flowText: '各个信息来源 → Context → Model',
  },
]

export const contextMisconceptions = [
  {
    wrong: 'Prompt = Context',
    correct: 'Prompt 只是 Context 的一部分，其他工作资料也可能被一起提供。',
  },
  { wrong: 'Memory = Context', correct: 'Memory 是仓库，只有取出的相关信息才进入当前 Context。' },
  { wrong: 'RAG = Context', correct: 'RAG 是找资料的方法，找回的内容需要进入 Context。' },
  { wrong: 'Context 越多越好', correct: '相关、清晰、有用比单纯增加信息量更重要。' },
]
