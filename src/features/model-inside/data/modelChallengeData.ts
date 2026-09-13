export const flowQuestions = [
  {
    id: 'tokens',
    label: '第一个空：文字拆分后得到',
    answer: 'token',
    explanation: '文字先拆成 Token，再转换成 Embedding。',
  },
  {
    id: 'layers',
    label: '第二个空：数字表示进入',
    answer: 'transformer',
    explanation: 'Embedding 进入多层 Transformer；Attention 在这些层内计算上下文关系。',
  },
  {
    id: 'next',
    label: '第三个空：候选打分后进行',
    answer: 'generation',
    explanation: '选择并生成下一个 Token，把它加入已有内容，再继续计算。',
  },
]
export const flowOptions = [
  { value: 'token', label: 'Token · 文字小块' },
  { value: 'transformer', label: 'Transformer · 多层计算' },
  { value: 'generation', label: 'Next Token Generation · 生成下一个小块' },
]
export const judgmentQuestions = [
  {
    id: 'whole',
    title: 'B. 模型通常会先在内部写完整句话，再一次性显示出来吗？',
    answer: 'no',
    options: [
      { value: 'yes', label: '是，完整回答早已写好' },
      { value: 'no', label: '不是，通常会逐步生成后续 Token' },
    ],
    explanation:
      '模型逐步生成 Token，并带上已生成内容继续计算。界面的显示速度不等于模型一次生成了完整回答。',
  },
  {
    id: 'usage',
    title: 'C. 你现在正常与 AI 聊天，主要发生的是什么？',
    answer: 'inference',
    options: [
      { value: 'training', label: 'Training · 重新训练模型' },
      { value: 'inference', label: 'Inference · 使用已有能力计算和生成' },
    ],
    explanation: '正常聊天主要使用训练好的参数进行 Inference；改变输入上下文不等于重新训练参数。',
  },
]
export const modelMisconceptions = [
  {
    wrong: '模型先想好完整回答，再一次输出。',
    correct: '模型通常一步一步生成后续 Token，再把已生成内容用于下一步计算。',
  },
  {
    wrong: 'Token 就是一个汉字或一个单词。',
    correct: '具体切分由 tokenizer 决定；一个词可能拆成多个 Token，也可能整个词对应一个 Token。',
  },
  {
    wrong: 'Attention 就是像人一样集中注意力。',
    correct: '它是计算上下文关系的机制。“关注”只是帮助理解的类比。',
  },
  {
    wrong: '每次聊天，模型都在重新训练自己。',
    correct: '正常聊天主要是 Inference：使用已经训练好的模型，根据当前信息计算。',
  },
  {
    wrong: '逐 Token 生成，说明模型完全没有推理能力。',
    correct:
      '逐步生成与复杂推理可以同时成立。现代推理模型能投入更多计算，进行多步分析、检查和调整。',
  },
]
