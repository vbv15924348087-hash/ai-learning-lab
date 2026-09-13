import { describe, expect, it } from 'vitest'
import type { ExploreConnection } from '../types'
import { connectionIsDisabled } from './connectionState'

const result: ExploreConnection = {
  id: 'result-context',
  from: 'result',
  to: 'context',
  type: 'data',
  label: '执行结果回到模型输入',
}

describe('experiment traffic boundaries', () => {
  it('preserves an enabled route when no experiment removes it', () => {
    expect(connectionIsDisabled(result, new Set(), new Set())).toBe(false)
    expect(connectionIsDisabled(result, new Set(['memory']), new Set(['rag-context']))).toBe(false)
  })

  it('blocks a explicitly severed result path even when its endpoints remain enabled', () => {
    expect(connectionIsDisabled(result, new Set(), new Set(['result-context']))).toBe(true)
  })

  it('blocks both incoming and outgoing traffic for a removed module', () => {
    expect(connectionIsDisabled(result, new Set(['result']), new Set())).toBe(true)
    expect(connectionIsDisabled(result, new Set(['context']), new Set())).toBe(true)
  })
})
