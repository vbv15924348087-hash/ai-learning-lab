import type { ModelTerm } from '../types'

export const modelTerms: ModelTerm[] = [
  {
    id: 'token',
    english: 'Token',
    chinese: '词元',
    plain: '模型处理文字时使用的小块。',
    definition: '模型处理文本时使用的基本单位。',
    technical:
      'Token 的具体切分由 tokenizer 决定，不一定对应一个完整汉字或英文单词；一个词也可能被拆成多个 Token。',
  },
  {
    id: 'embedding',
    english: 'Embedding',
    chinese: '嵌入表示',
    plain: '按文字小块的编号取出的一组数字，交给模型继续计算。',
    definition: 'Token 在模型内部的向量表示。',
    technical:
      'Token ID 用来查表；Embedding 是表里取出的向量，表中的数值在训练中学得。同一模型中，同一个 Token 的初始词嵌入相同，随后会结合位置信息和上下文继续计算。',
  },
  {
    id: 'transformer',
    english: 'Transformer',
    chinese: '多层信息处理结构',
    plain: '多层相连的计算：每层结合上下文，把更新后的数字交给下一层。',
    definition: '输入表示会经过很多 Transformer Layers，被不断更新和组合。',
    technical:
      '每层通常包含 Attention 和其他计算模块。Attention 发生在这些层内部，并非所有 Transformer 层结束后的独立阶段。',
  },
  {
    id: 'attention',
    english: 'Attention',
    chinese: '注意力机制',
    plain: '计算现在应该重点参考上下文里的哪些信息。',
    definition: '一种根据当前信息动态建立上下文不同位置关系的核心机制。',
    technical:
      'Self-Attention 让同一序列中的表示建立关系。对逐步生成的语言模型，当前位置通常只能参考已有位置；这是一种计算机制，不是人的主观注意力。',
  },
  {
    id: 'inference',
    english: 'Inference',
    chinese: '推断 / 推理计算',
    plain: '使用模型已经学会的能力来回答你。',
    definition: '使用训练好的模型，根据当前 Context 进行计算和生成。',
    technical:
      '正常聊天通常不更新模型参数。不同任务可以投入不同程度的 inference compute；现代推理模型可以进行多步分析、检查和调整，同时仍建立在逐步生成之上。',
  },
]
