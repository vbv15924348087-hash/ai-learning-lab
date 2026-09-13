import type { ContextTermId } from '../types'

export type ContextTerm = {
  id: ContextTermId
  english: string
  chinese: string
  plain: string
  definition: string
  technical: string
}

export const contextTerms: ContextTerm[] = [
  {
    id: 'prompt',
    english: 'Prompt',
    chinese: '输入或指令',
    plain: '你交给 AI 的问题或要求。',
    definition: '给模型的输入或指令。',
    technical:
      '在本例中，用户的 NVIDIA 问题是一条 Prompt。它进入 Context 后，会与本轮提供的规则、资料等一起供模型使用；它只是 Context 的一部分。',
  },
  {
    id: 'context',
    english: 'Context',
    chinese: '上下文',
    plain: '模型这一刻工作台上的全部资料。',
    definition: '模型当前这一次推理能够看到的信息集合。',
    technical:
      '通常包含系统指令、用户输入、历史对话、检索结果、工具定义和工具结果等。Memory 中保存的信息或外部资料，只有被选出并加入当前 Context，才能在本轮被模型使用。',
  },
  {
    id: 'context-window',
    english: 'Context Window',
    chinese: '上下文窗口',
    plain: '这张工作台能处理的资料有容量边界。',
    definition: '模型单次推理能够处理的信息范围。',
    technical: '实际系统通常使用 token 来衡量 Context 的容量，我们会在后续课程单独解释。',
  },
  {
    id: 'context-engineering',
    english: 'Context Engineering',
    chinese: '上下文工程',
    plain: '决定模型这一次到底应该看到什么。',
    definition: '为当前任务选择、组织、补充和控制模型上下文的过程。',
    technical:
      '按当前任务筛选有用信息，补上缺少的资料，安排清晰的顺序，并去掉无关或重复内容。目标是相关、清楚和够用；任务变化时，选择也应重新判断。',
  },
]
