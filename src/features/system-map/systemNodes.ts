import type { SystemNodeId } from '../../types/learning'

export const systemNodes: ReadonlyArray<{
  id: SystemNodeId
  label: string
  name: string
  explanation: string
}> = [
  {
    id: 'user',
    label: '你的提问',
    name: '输入',
    explanation: '你用一句话告诉系统：你希望它帮你做什么。',
  },
  {
    id: 'model',
    label: 'AI 模型',
    name: '处理',
    explanation: '模型结合它收到的内容，一小段一小段地生成回答。',
  },
  {
    id: 'answer',
    label: '生成的回答',
    name: '输出',
    explanation: '你看到的是生成的文字。表达流畅，并不代表每个细节都正确。',
  },
]
