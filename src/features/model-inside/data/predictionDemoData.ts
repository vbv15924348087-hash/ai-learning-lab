export type SimulatedCandidate = {
  label: string
  token?: string
  score: number
}

export const predictionPrompt = '帮我查 NVIDIA 最新的 AI GPU'

// All tokens and scores are authored teaching data, never tokenizer or model output.
export const generationSteps = [
  { token: 'NVIDIA', alternatives: ['相关', '关于'] },
  { token: ' 的', alternatives: [' 提供', ' 相关'] },
  { token: '最新', alternatives: ['相关', '当前'] },
  { token: ' AI', alternatives: [' 产品', ' 计算'] },
  { token: ' GPU', alternatives: [' 芯片', ' 产品'] },
  { token: ' 信息', alternatives: [' 资料', ' 动态'] },
  { token: '需要', alternatives: ['可以', '应当'] },
  { token: '结合', alternatives: ['参考', '查询'] },
  { token: '官方', alternatives: ['可靠', '近期'] },
  { token: '资料', alternatives: ['公告', '说明'] },
  { token: '核对', alternatives: ['确认', '查证'] },
  { token: '。', alternatives: ['；', '，'] },
] as const

export const scoreCandidates: SimulatedCandidate[] = [
  { label: '候选 A', score: 8.4 },
  { label: '候选 B', score: 5.6 },
  { label: '候选 C', score: 2.9 },
  { label: '其他', score: 1.3 },
]

export function candidatesForStep(index: number): SimulatedCandidate[] {
  const step = generationSteps[Math.min(Math.max(0, index), generationSteps.length - 1)]
  return [
    { label: '候选 A', token: step.token, score: 7.7 + (index % 3) * 0.5 },
    { label: '候选 B', token: step.alternatives[0], score: 4.3 + (index % 4) * 0.6 },
    { label: '候选 C', token: step.alternatives[1], score: 2.2 + (index % 2) * 0.9 },
    { label: '其他', token: '…', score: 0.8 + (index % 3) * 0.2 },
  ]
}

export function temperatureDistribution(temperature: number): number[] {
  const safeTemperature = Math.max(0.25, Math.min(2, temperature))
  const logits = [2.8, 1.8, 0.7, 0.1]
  const weights = logits.map((score) => Math.exp((score - logits[0]) / safeTemperature))
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  return weights.map((weight) => weight / total)
}
