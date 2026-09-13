/** Arbitrary teaching values, not output from a real tokenizer or model. */
export const APPLE_INITIAL_VECTOR: readonly number[] = [0.2, -0.7, 0.5, 0.9]

export const embeddingSamples: ReadonlyArray<{
  text: string
  id: number
  values: readonly number[]
}> = [
  { text: '苹果', id: 314, values: APPLE_INITIAL_VECTOR },
  { text: '手机', id: 728, values: [0.8, 0.3, -0.2, 0.7] },
  { text: 'GPU', id: 156, values: [0.3, -0.4, 0.8, 0.5] },
]
