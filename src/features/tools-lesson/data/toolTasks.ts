import type { TeachingToolId } from './toolDefinitions'

export type ToolMatchingTask = {
  id: string
  prompt: string
  correctTool: TeachingToolId
  explanation: string
  retryHint: string
}

export const toolMatchingTasks: ToolMatchingTask[] = [
  {
    id: 'latest',
    prompt: '今天 NVIDIA 最新 GPU 是什么？',
    correctTool: 'web_search',
    explanation:
      '「今天最新」需要当前互联网信息。Web Search 帮模型获取资料，随后模型才能结合结果回答。',
    retryHint: '想一想：哪个工具能获取当前互联网信息？',
  },
  {
    id: 'calculation',
    prompt: '计算 18923 × 78122',
    correctTool: 'run_code',
    explanation: '这是一道精确计算题。Run Code 可以执行计算，模型再使用它返回的结果。',
    retryHint: '想一想：哪个工具能执行计算？',
  },
  {
    id: 'document',
    prompt: '总结这个 PDF',
    correctTool: 'read_file',
    explanation: '需要先读取用户提供的 PDF。Read File 把文件内容交回来，模型才能基于原文总结。',
    retryHint: '想一想：模型需要先取得什么，才能总结这个文件？',
  },
]
