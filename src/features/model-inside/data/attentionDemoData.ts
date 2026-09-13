export type AttentionWord = '小明' | '把' | '苹果' | '给了' | '小红' | '因为' | '她' | '很饿'

export type AttentionRelation = {
  word: AttentionWord
  strength: '重点关注' | '次要参考' | '较弱关联'
  explanation: string
}

type AttentionObservation = {
  question: string
  explanation: string
  relations: AttentionRelation[]
}

export const attentionWords: AttentionWord[] = [
  '小明',
  '把',
  '苹果',
  '给了',
  '小红',
  '因为',
  '她',
  '很饿',
]

export const attentionDemoData: Record<AttentionWord, AttentionObservation> = {
  她: {
    question: '「她」可能指向前面提到的谁？',
    explanation:
      '在这个句子里，我们把「她」与「小红」的关系画得更强，帮助你观察代词怎样联系前文。这是便于理解的关系示意，不能据此断言真实模型如何判断。',
    relations: [
      { word: '小红', strength: '重点关注', explanation: '可能被指代的人' },
      { word: '小明', strength: '次要参考', explanation: '前文的另一个人' },
      { word: '苹果', strength: '较弱关联', explanation: '与这件事有关的物品' },
    ],
  },
  苹果: {
    question: '「苹果」在这件事里扮演什么角色？',
    explanation:
      '切换到「苹果」，观察的重点也随之改变：附近的「把」把物品和后面的动作连接起来。这里展示如何联系上下文，不是在读取真实模型。',
    relations: [
      { word: '把', strength: '重点关注', explanation: '引出被处理的物品' },
      { word: '小明', strength: '次要参考', explanation: '与物品相关的人' },
      { word: '苹果', strength: '较弱关联', explanation: '保留当前位置的信息' },
    ],
  },
  小红: {
    question: '「小红」与前面的动作有什么关系？',
    explanation:
      '观察「小红」时，「给了」帮助联系动作，「苹果」补充传递的物品。同一句话，当前处理的位置不同，相关信息也会变化。',
    relations: [
      { word: '给了', strength: '重点关注', explanation: '联系收到东西的动作' },
      { word: '苹果', strength: '次要参考', explanation: '被传递的物品' },
      { word: '小明', strength: '较弱关联', explanation: '发起动作的人' },
    ],
  },
  很饿: {
    question: '「很饿」描述谁，又如何解释前面的事情？',
    explanation:
      '观察「很饿」时，重点关系变成了被描述的人「她」以及连接原因的「因为」。模型需要结合这些位置之间的关系来处理当前信息。',
    relations: [
      { word: '她', strength: '重点关注', explanation: '被描述的人' },
      { word: '因为', strength: '次要参考', explanation: '提示这里在解释原因' },
      { word: '苹果', strength: '较弱关联', explanation: '与饥饿有关的物品' },
    ],
  },
  小明: {
    question: '刚来到句子的起点，可以参考什么？',
    explanation:
      '对于本章讨论的自回归文本模型，当前位置通常只能关注自己和前面的位置。「小明」在句首，所以这里还没有更早的词可供参考。',
    relations: [{ word: '小明', strength: '重点关注', explanation: '句首，保留自身信息' }],
  },
  把: {
    question: '「把」接在谁后面？',
    explanation:
      '当前位置可以联系前面的「小明」，也保留自身信息。这里的线表示示意关系，不表示人类的心理注意力。',
    relations: [
      { word: '小明', strength: '重点关注', explanation: '前面出现的人' },
      { word: '把', strength: '次要参考', explanation: '保留当前位置的信息' },
    ],
  },
  给了: {
    question: '「给了」这个动作联系了什么？',
    explanation:
      '处理「给了」时，可以结合前面的物品「苹果」和人物「小明」。画出的强弱只帮助你看懂关系，不是模型实测值。',
    relations: [
      { word: '苹果', strength: '重点关注', explanation: '动作涉及的物品' },
      { word: '小明', strength: '次要参考', explanation: '做出动作的人' },
      { word: '把', strength: '较弱关联', explanation: '联系前面的句子结构' },
    ],
  },
  因为: {
    question: '「因为」接下来要解释哪件事？',
    explanation:
      '「因为」把后续原因与已有事件连接起来。此刻我们画出它与前面动作、人物和物品的关系。',
    relations: [
      { word: '给了', strength: '重点关注', explanation: '要解释的动作' },
      { word: '小红', strength: '次要参考', explanation: '事件中的接收者' },
      { word: '苹果', strength: '较弱关联', explanation: '事件涉及的物品' },
    ],
  },
}
