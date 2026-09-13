import type { ToolsLessonStep } from '../types'

export const toolsLessonSteps: ToolsLessonStep[] = [
  {
    id: 'boundary',
    mode: 'boundary',
    kicker: '01 / 遇到能力边界',
    title: '要查今天的信息，模型能自己上网吗？',
    beginnerExplanation:
      '继续这个任务：帮我查 NVIDIA 最新的 AI GPU，并简单告诉我它是什么。模型可以根据已有知识生成文字，但要核对最新信息，就需要外部能力。',
    whyItMatters: '先分清已有知识和新获取的信息，才能判断什么时候需要 Tool。',
    nextLabel: '看看有哪些外部能力',
    interactionHint: '试试看：为这个需要最新信息的任务选择下一步。',
  },
  {
    id: 'shelf',
    mode: 'shelf',
    kicker: '02 / 选择合适的工具',
    title: '给模型一个可以请求使用的工具架',
    beginnerExplanation:
      'Tool 就是模型可以请求使用的外部能力。系统提供了哪些工具，模型才能从中选择；搜索、读文件和运行代码分别适合不同的任务。',
    whyItMatters: '工具补充模型自身无法直接完成的能力。先选对工具，才有后面的调用。',
    nextLabel: '用三个任务试试手',
    interactionHint: '试试看：选择最适合获取“最新信息”的 Tool。',
    unlockedTerm: 'tool',
  },
  {
    id: 'matching',
    mode: 'matching',
    kicker: '03 / 让任务找到工具',
    title: '查最新、算乘法、读 PDF，分别交给谁？',
    beginnerExplanation:
      '先看任务缺少哪一种能力，再选择对应的工具。找到最新信息需要搜索，精确计算可以用代码，读取用户文件需要读文件工具。',
    whyItMatters: '模型不是想调用什么就有什么；要从系统提供的工具中选出适合当前任务的能力。',
    nextLabel: '把“我要搜索”告诉系统',
    interactionHint: '试试看：依次为三个小任务选择工具，并查看原因。',
  },
  {
    id: 'call',
    mode: 'call',
    kicker: '04 / 从一句话到一份请求',
    title: '“我要搜索”，怎样变成系统读得懂的请求？',
    beginnerExplanation:
      '模型用结构化格式告诉系统：这一次调用哪个 Tool，传入什么参数。生成这种请求的机制叫 Function Calling；这一次具体的请求叫 Tool Call。',
    whyItMatters: '生成请求和执行工具是两个不同的动作。现在还没有发生网页搜索。',
    nextLabel: '看看模型从哪里知道参数格式',
    interactionHint: '试试看：生成结构化请求，再点击 tool 和 query 字段查看含义。',
    unlockedTerm: 'tool-call',
  },
  {
    id: 'schema',
    mode: 'schema',
    kicker: '05 / 工具也有使用说明书',
    title: '模型为什么知道 Web Search 需要 query？',
    beginnerExplanation:
      '系统会提前提供 Tool Schema，说明工具的名称、用途和参数格式。工具是能力，Schema 是说明书，Tool Call 则是照着说明书写出的本次请求。',
    whyItMatters: '同一份工具说明书，可以对应许多次参数不同的调用请求。',
    nextLabel: '亲手构建一次 Tool Call',
    interactionHint: '深入一点：展开使用说明书，查看名称、用途和参数。',
    unlockedTerm: 'tool-schema',
  },
  {
    id: 'builder',
    mode: 'builder',
    kicker: '06 / 亲手构建请求',
    title: '选择工具，填入参数，生成你的 Tool Call',
    beginnerExplanation:
      '任务仍然是查 NVIDIA 最新的 AI GPU。选择合适的工具，再按照它的说明书填写参数，看看结构化请求怎样形成。',
    whyItMatters: '你正在模拟模型生成请求这一步。请求描述了要做的事，还需要 Harness 才能执行。',
    nextLabel: '停一下：搜索真的发生了吗？',
    interactionHint: '试试看：选择 Web Search、填写搜索词，然后点击“生成 Tool Call”。',
  },
  {
    id: 'checkpoint',
    mode: 'checkpoint',
    kicker: '07 / 分清决定和执行',
    title: 'Tool Call 已经生成。网页搜索已经发生了吗？',
    beginnerExplanation:
      '模型刚才只是生成了一份请求。接下来还需要 Harness 接收、验证并执行这份请求，外部工具才会开始做事。',
    whyItMatters: 'Model 负责决定要调用什么；Harness 负责让这个动作真的发生。',
    nextLabel: '跟着请求，看谁真正执行',
    interactionHint: '试试看：判断请求生成以后，搜索是否已经发生。',
  },
  {
    id: 'execution',
    mode: 'execution',
    kicker: '08 / 跟随一次完整往返',
    title: '请求离开模型，再带着结果回来',
    beginnerExplanation:
      '跟随这张数据卡：Model 决定并生成 Tool Call，Harness 调用 Web Search，搜索结果返回后加入 Context，Model 才能继续处理。',
    whyItMatters: '留意每一步由谁完成，以及传递的是请求还是结果。所有搜索与数据都是教学模拟。',
    nextLabel: '看看返回的结果怎样被使用',
    interactionHint: '试试看：逐步播放一次工具执行流程，观察高亮节点、连线和当前解释。',
  },
  {
    id: 'result',
    mode: 'result',
    kicker: '09 / 让结果进入 Context',
    title: 'Tool 返回了资料，模型还要继续读',
    beginnerExplanation:
      'Tool Result 是工具执行后返回的结果，可能包含标题、来源和相关内容。它通常先加入模型当前的 Context，再由 Model 根据这些资料继续生成回答。',
    whyItMatters: '回到 Context 这一章：只有进入当前工作台的信息，模型这一次才能看到并使用。',
    nextLabel: '把六个角色连起来，完成挑战',
    interactionHint: '试试看：点击“将 Tool Result 加入 Context”，观察模型继续处理。',
    unlockedTerm: 'tool-result',
  },
  {
    id: 'summary',
    mode: 'summary',
    kicker: '10 / 从会生成到能调用',
    title: '你已经理解模型怎么调用外部能力了',
    beginnerExplanation:
      'Tool 是能力，Tool Schema 是说明书，Tool Call 是本次请求，Function Calling 是生成请求的机制。Harness 真正执行 Tool，Tool Result 再进入 Context。',
    whyItMatters: '记住责任边界：模型决定做什么，Harness 执行动作，工具返回信息，模型继续处理。',
    nextLabel: '返回学习地图',
    interactionHint: '试试看：用四个情境判断，检验你是否分清了谁决定、谁执行、信息往哪里走。',
  },
]
