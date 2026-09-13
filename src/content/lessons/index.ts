import type { Lesson } from '../../types/learning'
import { chapters } from '../../features/curriculum/registry'
import { toolsMisconceptions } from '../../features/tools-lesson/data/toolsMisconceptions'

const foundationLessons: Lesson[] = [
  {
    id: 'system-overview',
    order: 1,
    title: 'AI 系统全景',
    subtitle: '从一句提问，认识整个 AI 系统',
    minutes: 10,
    category: 'foundation',
    published: true,
    learningGoal: '能用自己的话，讲清 AI 怎样从收到问题，一步步找到资料并给出回答。',
    beginnerHeading: '你看到的对话，只是入口。',
    beginnerExplanation:
      '从“帮我查 NVIDIA 最新的 AI GPU，并简单告诉我它是什么”开始，跟随一个问题认识整个系统：信息如何交给模型，模型为什么请求搜索，运行系统怎样执行，再把资料交回模型生成回答。',
    analogy:
      '把它想成一次在服务台咨询：你说清楚需求，工作人员参考手边的资料组织回答，再把结果交给你。这个比喻帮助我们区分角色，但模型没有人类的意识，也不会天然知道资料里没有的事情。',
    technicalExplanation:
      'Context 是模型当前能看到的信息。Model 根据这些信息判断下一步；需要外部能力时，发出工具请求，由 Harness 调用 Tool。工具结果经 Harness 加入 Context，模型再根据新信息生成 Answer。',
    misconceptions: [
      {
        wrong: 'AI 的聊天界面就是模型本身。',
        correct: '界面是你使用系统的入口。模型、可用资料、工具与检查机制可以是系统中的不同部分。',
      },
      {
        wrong: '回答听起来很确定，就一定是对的。',
        correct: '模型会生成连贯的文字，也可能生成错误的内容。涉及事实时，需要核对可靠来源。',
      },
      {
        wrong: 'AI 回答之前，总会先上网查一遍。',
        correct: '只有系统提供并实际使用了联网或检索工具，回答才可能包含新查到的信息。',
      },
    ],
    relatedConcepts: ['AI System', 'Context', 'Model', 'Tool', 'Harness'],
    visualization: 'system-overview',
    visualizationNote: '教学模拟：追踪同一个 NVIDIA 问题，不进行实时搜索。',
    completion: {
      promptTitle: '把各个角色连起来，完成一个小挑战。',
      promptDescription: '能够说清谁判断、谁执行、信息怎么返回了吗？',
      completedTitle: '你已经能读懂第一张 AI 系统架构图了',
    },
  },
  {
    id: 'context',
    order: 2,
    title: 'Context',
    subtitle: 'AI 此刻能看到哪些信息？',
    minutes: 12,
    category: 'foundation',
    published: true,
    learningGoal: '说清模型这一次看见哪些信息，并为 NVIDIA GPU 的问题选出真正相关的资料。',
    beginnerExplanation:
      '沿着上一章的问题继续看：你的提问、系统规则、当前对话和找到的资料，怎样一起进入模型当前的工作台。',
    analogy:
      'Context 就像当前工作台，Memory 像长期仓库，RAG 是去外部找资料的方法。只有放上工作台的信息，才是这一次模型能看到的资料。',
    technicalExplanation:
      'Context 是模型当前一次推理能看到的信息集合。Context Window 限定单次可处理的信息范围；Context Engineering 负责为当前任务选择、组织、补充和控制这些信息。',
    misconceptions: [
      {
        wrong: 'Prompt 就是全部 Context。',
        correct: 'Prompt 只是 Context 的一部分，系统还可能提供规则、对话和检索资料。',
      },
      {
        wrong: 'Memory 就是 Context。',
        correct: 'Memory 是长期仓库，只有取出的相关信息才进入当前 Context。',
      },
      {
        wrong: 'RAG 就是 Context。',
        correct: 'RAG 是找资料的方法，找回的资料进入 Context 后才能被模型使用。',
      },
      {
        wrong: 'Context 越多越好。',
        correct: '重要的是信息相关、清楚和有用，无关或重复内容可能挤占容量。',
      },
    ],
    relatedConcepts: ['Prompt', 'Context', 'Context Window', 'Context Engineering'],
    visualization: 'context-workspace',
    visualizationNote: '教学模拟：延续 NVIDIA 问题，展示本次信息如何组装，不进行实时搜索。',
  },
  {
    id: 'model-inside',
    order: 3,
    title: 'Model Inside',
    subtitle: '一句回答，是怎样生成的？',
    minutes: 15,
    category: 'foundation',
    published: true,
    learningGoal:
      '把文字、Token、数字表示、多层计算与逐步生成连起来，并区分正常使用模型和训练模型。',
    beginnerHeading: 'Context 已经准备好了。模型里面发生了什么？',
    beginnerExplanation:
      '沿着 NVIDIA 问题进入模型内部：亲手拆开文字、观察数字表示，穿过 Transformer 层，在层内探索 Attention，再一步一步生成输出。',
    analogy:
      '可以把多层结构想成对同一份信息反复加工的工作台：每一层都结合上下文更新表示。这只是空间结构的比喻，不代表每层有独立业务职责，也不代表模型具有人的意识。',
    technicalExplanation:
      '文字经 Tokenization 变成 Tokens，再映射为 Embedding。表示经过包含 Attention 的多层 Transformer 处理后，模型为候选 Token 产生分数，选择一个并加入已有上下文，重复计算直到形成输出。正常聊天主要发生的是 Inference。',
    misconceptions: [
      {
        wrong: '模型先想好完整回答，再一次输出。',
        correct: '模型通常生成一个 Token，再把它加入当前上下文，继续计算后续 Token。',
      },
      {
        wrong: '一个 Token 就是一个字。',
        correct: 'Token 的切分由 tokenizer 决定，不固定等于一个汉字或一个完整英文单词。',
      },
      {
        wrong: 'Attention 就是模型像人一样集中注意力。',
        correct: 'Attention 是 Transformer 层内计算上下文关系的机制，注意力只是便于理解的说法。',
      },
      {
        wrong: '我每次聊天，模型都在重新训练自己。',
        correct: '正常使用时主要是在进行 Inference，使用已训练好的参数来计算和生成。',
      },
      {
        wrong: '逐 Token 生成意味着模型完全没有推理能力。',
        correct: '现代推理模型仍建立在逐步生成之上，但可以投入更多计算来进行多步分析、检查和调整。',
      },
    ],
    relatedConcepts: ['Token', 'Embedding', 'Transformer', 'Attention', 'Inference'],
    visualization: 'model-inside',
    visualizationNote:
      '教学示意：Token 切分、关系强弱、数字表示与候选分数均为模拟，不是真实模型内部数据。',
    completion: {
      promptTitle: '把模型内部的流程连起来，完成理解挑战。',
      promptDescription: '完成必要互动，再用流程与场景判断检验理解。',
      completedTitle: '你已经第一次真正“进入模型内部”',
    },
  },
  {
    id: 'tools',
    order: 4,
    title: 'Tools',
    subtitle: '模型做决定，工具做事情',
    minutes: 15,
    category: 'action',
    published: true,
    learningGoal:
      '分清 Tool、Tool Schema、Tool Call 和 Tool Result，并讲清模型决定、Harness 执行、结果回到 Context 的完整过程。',
    beginnerHeading: '模型会生成文字。怎样才能调用外部能力？',
    beginnerExplanation:
      '继续查 NVIDIA 最新 AI GPU 的任务：先选择合适的工具，再亲手生成结构化请求，跟随 Harness 执行，观察工具结果如何回到 Context。',
    analogy:
      '工具像可以借用的外部服务，Schema 像使用说明书，Call 像按说明书填写的本次请求单；Harness 负责把请求交给服务执行。',
    technicalExplanation:
      '系统提前提供 Tool Schema。Model 通过 Function Calling 生成含工具名称与参数的 Tool Call，Harness 接收、验证并执行请求，Tool Result 再加入 Context，供模型继续处理。',
    misconceptions: toolsMisconceptions,
    relatedConcepts: ['Tool', 'Function Calling', 'Tool Call', 'Tool Schema', 'Tool Result'],
    visualization: 'tools-lesson',
    visualizationNote:
      '教学模拟：所有工具调用、JSON 与搜索资料均为示例，不连接真实工具，也不代表 NVIDIA 当前产品信息。',
    completion: {
      promptTitle: '用四个情境，检验你是否分清决定、执行和结果。',
      promptDescription: '完成工具选择、请求构建与信息往返，再通过理解挑战。',
      completedTitle: '你已经理解模型是怎么“调用外部能力”的',
    },
  },
]

export const lessons: Lesson[] = [
  ...foundationLessons,
  ...chapters.map((chapter): Lesson => ({
    id: chapter.id,
    order: chapter.phase - 1,
    title: chapter.title,
    subtitle: chapter.subtitle,
    minutes: chapter.minutes,
    category:
      chapter.phase <= 7 || chapter.phase === 11 || chapter.phase === 12
        ? 'action'
        : chapter.phase <= 10
          ? 'context'
          : 'reliability',
    published: true,
    learningGoal: chapter.goal,
    beginnerHeading: chapter.heading,
    beginnerExplanation: chapter.steps[0].beginnerExplanation,
    technicalExplanation: chapter.steps[0].technicalExplanation,
    misconceptions: chapter.misconceptions,
    relatedConcepts: chapter.terms.map((term) => term.name),
    visualization: 'curriculum',
    visualizationNote: '教学示意：所有外部服务、资料与执行结果均为模拟。',
  })),
]

export function getLessonById(id: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === id)
}
