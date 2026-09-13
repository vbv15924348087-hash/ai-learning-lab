import type { ModelInsideMode, ModelInsideStep } from '../types'

export const modelInsideExamples: Partial<
  Record<ModelInsideMode, { label: string; text: string }>
> = {
  embedding: {
    label: '先借一个熟悉的词，看清模型怎样拿到数字',
    text: '跟着「苹果」这个文字小块，找到它的起始数字卡。',
  },
  transformer: {
    label: '接着用同一个词，看前文怎样改变这次计算',
    text: '我刚吃了一口苹果。 / 我用的手机来自苹果。',
  },
  attention: {
    label: '换一个简单句子，看清上下文关系',
    text: '小明把苹果给了小红，因为她很饿。',
  },
}

export const modelInsideSteps: ModelInsideStep[] = [
  {
    id: 'intro',
    mode: 'intro',
    kicker: '从 Context 继续',
    title: 'Context 已经准备好了。然后呢？',
    beginnerExplanation:
      '上一章，我们把提问、规则与相关资料放到了模型当前的工作台。现在跟随同一个问题，看看这些信息进入 Model 之后发生了什么。',
    whyItMatters: '你将亲手把文字拆开、穿过计算层，再看见一个回答如何一步一步形成。',
    nextLabel: '进入模型内部',
  },
  {
    id: 'tokenization',
    mode: 'tokenization',
    kicker: '01 / 把文字拆开',
    title: '一句话，先变成可以处理的小块',
    beginnerExplanation:
      '模型不会把一整句话当成一个整体直接处理。先点击拆分，看看“帮我查 NVIDIA 最新的 AI GPU”怎样变成一组文字片段。',
    whyItMatters:
      '这里的切分只是教学示意。实际切分由 tokenizer 决定，一个小块不固定等于一个汉字或一个英文单词。',
    nextLabel: '看看小块怎样变成数字',
    unlockedTerm: 'token',
  },
  {
    id: 'embedding',
    mode: 'embedding',
    kicker: '02 / 变成数字表示',
    title: '编号负责查找，数字卡交给计算',
    beginnerExplanation:
      '把编号当作取件码：它帮模型找到表里的一行，再取出这一行的一整组数字。这组数字就是后面用来计算的起始表示。',
    whyItMatters:
      '先找到编号 → 按编号取出数字卡 → 把整张卡交给后面的计算。你不用记住或猜出每个数字的含义。',
    nextLabel: '跟随信息进入计算层',
    unlockedTerm: 'embedding',
  },
  {
    id: 'transformer',
    mode: 'transformer',
    kicker: '03 / 穿过多层结构',
    title: '上一层算出的结果，交给下一层继续',
    beginnerExplanation:
      '“吃了一口苹果”与“手机来自苹果”中的文字相同，意思却不同。模型需要让数字表示包含这次的前文关系；每一层接过上一层的表示，继续结合上下文计算。',
    whyItMatters:
      '文字仍是“苹果”，变的是这一次计算中它的表示。把更新后的数字交给下一层，反复处理后，才用来给下一个 Token 打分。',
    nextLabel: '放大看看层内的关系计算',
    unlockedTerm: 'transformer',
  },
  {
    id: 'attention',
    mode: 'attention',
    kicker: '04 / 放大 Transformer 层内',
    title: '现在应该重点参考哪些信息？',
    beginnerExplanation:
      '读到“小明把苹果给了小红，因为她很饿”中的“她”时，需要联系前文。点击“她”，观察不同上下文位置与当前词的关系。',
    whyItMatters:
      '这是 Transformer 层内部的机制，不是所有层之后又多出的一道工序。关系强弱仅为教学示意，也不代表模型像人一样集中注意力。',
    nextLabel: '看看下一步的候选分数',
    unlockedTerm: 'attention',
  },
  {
    id: 'scores',
    mode: 'scores',
    kicker: '05 / 给下一步打分',
    title: '模型为可能接上的小块打分',
    beginnerExplanation:
      '多层处理之后，模型会给下一步可能出现的 Token 打分，再通过选择过程决定输出哪一个。条形的长短帮助我们比较候选。',
    whyItMatters:
      '候选与分数是教学模拟，不是真实模型概率，也不提供 NVIDIA 产品的实时信息。分数最高的候选不保证事实正确。',
    nextLabel: '亲手生成下一个 Token',
  },
  {
    id: 'generation',
    mode: 'generation',
    kicker: '06 / 生成、加入、再计算',
    title: '回答是一步一步形成的',
    beginnerExplanation:
      '生成一个 Token，把它加入当前上下文，再继续计算下一个 Token。点击逐步生成，亲眼看见已有内容怎样影响接下来的输出。',
    whyItMatters:
      '模型不是先把完整回答写好，再一次吐出来。逐步生成也不意味着没有推理能力；复杂任务可以投入更多计算。',
    nextLabel: '现在是在训练模型吗？',
  },
  {
    id: 'inference',
    mode: 'inference',
    kicker: '07 / 使用已经学会的能力',
    title: '你正在使用模型已有的能力',
    beginnerExplanation:
      '训练让模型的参数发生变化；正常聊天时，模型根据当前 Context 进行计算和生成，通常不会因为这一轮对话更新模型参数。',
    whyItMatters:
      '这就是 Inference。现代推理模型可以投入更多 inference compute，进行多步分析、检查和调整，再形成输出或下一步动作。',
    nextLabel: '把整个过程连起来',
    unlockedTerm: 'inference',
  },
  {
    id: 'summary',
    mode: 'summary',
    kicker: '08 / 连成一个完整理解',
    title: '你已经第一次真正“进入模型内部”',
    beginnerExplanation:
      '文字先变成 Token，再变成数字表示，经过包含 Attention 的多层 Transformer。模型给候选打分，生成一个 Token，加入上下文后继续重复。',
    whyItMatters:
      '正常使用时主要发生的是 Inference。完成下面的小挑战，用流程理解检验自己，而不只是记住五个术语。',
    nextLabel: '完成理解挑战',
  },
]
