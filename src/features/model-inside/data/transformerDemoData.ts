import { APPLE_INITIAL_VECTOR } from './embeddingDemoData'

/** Authored mechanism sketches, not outputs, parameters or probabilities from a model. */
export const transformerExamples = [
  {
    id: 'fruit',
    prefix: '我刚',
    context: '吃了一口',
    sentence: '我刚吃了一口苹果',
    interpretation: '这里的“苹果”指水果。',
    vectors: [
      APPLE_INITIAL_VECTOR,
      [0.4, -0.5, 0.6, 0.8],
      [0.5, -0.3, 0.8, 0.6],
      [0.6, -0.2, 0.7, 0.4],
      [0.7, -0.1, 0.5, 0.3],
      [0.8, 0.1, 0.6, 0.2],
    ],
  },
  {
    id: 'company',
    prefix: '我用的',
    context: '手机来自',
    sentence: '我用的手机来自苹果',
    interpretation: '这里的“苹果”指公司。',
    vectors: [
      APPLE_INITIAL_VECTOR,
      [0.1, -0.4, 0.3, 0.7],
      [-0.1, -0.2, 0.2, 0.6],
      [-0.3, 0.1, 0.4, 0.7],
      [-0.4, 0.2, 0.3, 0.8],
      [-0.5, 0.3, 0.1, 0.7],
    ],
  },
] as const

export const transformerLayerNumbers = [0, 1, 2, 3, 4] as const

export function formatTransformerVector(values: readonly number[]) {
  return `[${values.map((value) => value.toFixed(1)).join(', ')}]`
}
