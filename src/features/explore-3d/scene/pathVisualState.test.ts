import { describe, expect, it } from 'vitest'
import type { ExploreConnection, ExplorePathComparison } from '../types'
import {
  boundedPacketEdges,
  comparisonIncludes,
  comparisonRole,
  isResultConnection,
  MAX_ACTIVE_PACKETS,
  packetLabel,
} from './pathVisualState'
import { nodeVisualGrammar } from './visualGrammar'

describe('immersive scene path grammar', () => {
  it('caps moving packets and excludes disabled, future, and completed transfers', () => {
    const packets = boundedPacketEdges(
      ['off', 'future', 'done', 'a', 'b', 'c', 'd'],
      {
        off: 'active',
        future: 'upcoming',
        done: 'completed',
        a: 'active',
        b: 'active',
        c: 'active',
        d: 'active',
      },
      new Set(['off']),
    )
    expect([...packets]).toEqual(['a', 'b', 'c'])
    expect(packets.size).toBe(MAX_ACTIVE_PACKETS)
  })
  it('distinguishes tool requests from both legs of results returning to context', () => {
    const edge = (from: string, to: string): ExploreConnection => ({
      id: `${from}-${to}`,
      from,
      to,
      type: 'tool',
      label: '',
    })
    expect(isResultConnection(edge('harness', 'web'))).toBe(false)
    expect(isResultConnection(edge('web', 'observation'))).toBe(true)
    expect(isResultConnection(edge('observation', 'context'))).toBe(true)
    expect(isResultConnection(edge('memory', 'context'))).toBe(true)
    expect(packetLabel('tool-call', false)).toBe('CALL')
    expect(packetLabel('context', true)).toBe('RESULT')
    expect(packetLabel('verification', false)).toBe('CHECK')
    expect(packetLabel('pass', false)).toBe('PASS')
    expect(packetLabel('fail', false)).toBe('FAIL')
  })
  it('shows common, added, and differing paths without changing graph coordinates', () => {
    const comparison: ExplorePathComparison = {
      commonNodeIds: [],
      firstOnlyNodeIds: [],
      secondOnlyNodeIds: [],
      commonEdgeIds: ['shared'],
      firstOnlyEdgeIds: ['a'],
      secondOnlyEdgeIds: ['b'],
      visibleNodeIds: [],
      visibleEdgeIds: ['shared', 'a', 'b'],
    }
    const filter = (mode: 'all' | 'common' | 'added' | 'differences') =>
      ['shared', 'a', 'b', 'unused'].filter((id) =>
        comparisonIncludes(comparisonRole(id, comparison), mode),
      )
    expect(filter('all')).toEqual(['shared', 'a', 'b'])
    expect(filter('common')).toEqual(['shared'])
    expect(filter('added')).toEqual(['b'])
    expect(filter('differences')).toEqual(['a', 'b'])
  })
  it('encodes core, hub, capability, and tool size hierarchy with a connector for MCP', () => {
    const model = nodeVisualGrammar({ id: 'model', kind: 'model', level: 0 })
    const harness = nodeVisualGrammar({ id: 'harness', kind: 'harness', level: 0 })
    const context = nodeVisualGrammar({ id: 'context', kind: 'context', level: 0 })
    const tool = nodeVisualGrammar({ id: 'web', kind: 'tool', level: 2 })
    expect(model.scale).toBeGreaterThan(harness.scale)
    expect(harness.scale).toBeGreaterThan(context.scale)
    expect(context.scale).toBeGreaterThan(tool.scale)
    expect(nodeVisualGrammar({ id: 'mcp', kind: 'satellite', level: 1 }).type).toBe('connector')
  })
})
