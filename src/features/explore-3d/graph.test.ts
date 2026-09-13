import { describe, expect, it } from 'vitest'
import { concepts } from '../final-system-map/concepts'
import { chapters } from '../curriculum/registry'
import { exploreConnections, exploreNodes, taskSteps, tourStops } from './data'
import {
  getDisplayedConnections,
  getRelations,
  getVisibleConnections,
  getVisibleNodes,
  searchNodes,
} from './graph'

const ids = exploreNodes.map((node) => node.id)
const nodeIds = new Set(ids)

describe('3D explorer content and graph', () => {
  it('keeps complete concept definitions, valid courses and distinct spatial ownership', () => {
    const lessons = [
      'system-overview',
      'context',
      'model-inside',
      'tools',
      ...chapters.map((chapter) => chapter.id),
    ]
    expect(new Set(ids).size).toBe(ids.length)
    for (const node of exploreNodes) {
      expect(lessons).toContain(node.lessonId)
      expect(node.description.length).toBeGreaterThan(5)
      expect(node.technicalDefinition.length).toBeGreaterThan(10)
      expect(node.confused.length).toBeGreaterThan(10)
      expect(node.responsibility.length).toBeGreaterThan(10)
      expect(node.position.every(Number.isFinite)).toBe(true)
      for (const id of [
        ...node.upstream,
        ...node.downstream,
        ...node.related,
        ...(node.parentId ? [node.parentId] : []),
      ])
        expect(nodeIds.has(id), `${node.id} refers to missing ${id}`).toBe(true)
      const ancestors = new Set([node.id])
      let parentId = node.parentId
      while (parentId) {
        expect(ancestors.has(parentId), `${node.id} has circular ownership`).toBe(false)
        ancestors.add(parentId)
        parentId = exploreNodes.find((item) => item.id === parentId)?.parentId
      }
    }
    // Same positions would be inseparable by clicking in the scene.
    expect(new Set(exploreNodes.map((node) => node.position.join(','))).size).toBe(ids.length)
    for (const id of [
      'context',
      'prompt',
      'memory',
      'rag',
      'model',
      'harness',
      'mcp',
      'compaction',
    ]) {
      expect(exploreNodes.find((node) => node.id === id)?.technicalDefinition).toBe(
        concepts.find((concept) => concept.id === id)?.definition,
      )
    }
  })

  it('has no dangling or duplicate connection and derives detail relations from actual edges', () => {
    expect(new Set(exploreConnections.map((edge) => edge.id)).size).toBe(exploreConnections.length)
    for (const edge of exploreConnections) {
      expect(nodeIds.has(edge.from)).toBe(true)
      expect(nodeIds.has(edge.to)).toBe(true)
      expect(edge.from).not.toBe(edge.to)
      expect(getRelations(edge.from).downstream.map((node) => node.id)).toContain(edge.to)
      expect(getRelations(edge.to).upstream.map((node) => node.id)).toContain(edge.from)
    }
    expect(getRelations('missing')).toEqual({ upstream: [], downstream: [], related: [] })
  })

  it('separates the tool request from execution and returns observations through Context', () => {
    const has = (from: string, to: string) =>
      exploreConnections.some((edge) => edge.from === from && edge.to === to)
    for (const [from, to] of [
      ['prompt', 'context'],
      ['rag', 'context'],
      ['model', 'call'],
      ['call', 'harness'],
      ['harness', 'tools'],
      ['tools', 'external'],
      ['external', 'observation'],
      ['observation', 'context'],
      ['context', 'model'],
    ])
      expect(has(from, to)).toBe(true)
    expect(has('model', 'external')).toBe(false)
    expect(has('observation', 'model')).toBe(false)
    expect(has('harness', 'tools')).toBe(true) // MCP remains an optional path.
    expect(has('harness', 'state')).toBe(true)
    expect(has('harness', 'trace')).toBe(true)
    expect(exploreNodes.find((node) => node.id === 'state')?.label).toBe('State')
    expect(exploreNodes.find((node) => node.id === 'trace')?.label).toBe('Trace')
  })

  it('routes failed verification back to Loop and only PASS to Final', () => {
    expect(exploreConnections.find((edge) => edge.id === 'verifier-loop')).toMatchObject({
      from: 'verifier',
      to: 'loop',
      type: 'loop',
      label: expect.stringContaining('FAIL'),
    })
    expect(exploreConnections.find((edge) => edge.id === 'loop-context')).toMatchObject({
      from: 'loop',
      to: 'context',
      type: 'loop',
    })
    expect(exploreConnections.filter((edge) => edge.to === 'final')).toEqual([
      expect.objectContaining({ from: 'verifier', label: expect.stringContaining('PASS') }),
    ])
    expect(exploreConnections.some((edge) => edge.type === 'loop' && edge.to === 'final')).toBe(
      false,
    )
  })

  it('starts with six cores and reveals a searched deep concept with its direct relations', () => {
    expect(getVisibleNodes(0).map((node) => node.id)).toEqual([
      'user',
      'context',
      'model',
      'harness',
      'external',
      'final',
    ])
    expect(getVisibleNodes(1)).toHaveLength(12)
    expect(getVisibleNodes(2)).toHaveLength(exploreNodes.length)
    for (const id of ['mcp', 'workflow', 'multi-agent', 'compaction']) {
      const shown = getVisibleNodes(0, id).map((node) => node.id)
      const selected = exploreNodes.find((node) => node.id === id)!
      for (const related of [id, ...selected.upstream, ...selected.downstream, ...selected.related])
        expect(shown).toContain(related)
      if (selected.parentId) expect(shown).toContain(selected.parentId)
    }
    expect(getVisibleNodes(0, 'missing')).toEqual(getVisibleNodes(0))
    expect(getVisibleNodes(0, 'context').map((node) => node.id)).toEqual(
      expect.arrayContaining([
        'prompt',
        'memory',
        'rag',
        'history',
        'schema',
        'observation',
        'model',
      ]),
    )
  })

  it('keeps simplified overview connections on screen without turning FAIL into Final', () => {
    for (const depth of [0, 1, 2] as const) {
      const nodes = getVisibleNodes(depth)
      const visible = new Set(nodes.map((node) => node.id))
      for (const edge of [...getVisibleConnections(nodes), ...getDisplayedConnections(nodes)]) {
        expect(visible.has(edge.from)).toBe(true)
        expect(visible.has(edge.to)).toBe(true)
        expect(edge.from).not.toBe(edge.to)
      }
    }
    const overview = getDisplayedConnections(getVisibleNodes(0))
    expect(overview).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ from: 'user', to: 'context' }),
        expect.objectContaining({ from: 'context', to: 'model' }),
        expect.objectContaining({ from: 'model', to: 'harness' }),
        expect.objectContaining({ from: 'harness', to: 'external' }),
        expect.objectContaining({ from: 'external', to: 'context' }),
        expect.objectContaining({
          from: 'harness',
          to: 'final',
          label: expect.stringContaining('PASS'),
        }),
      ]),
    )
    expect(
      overview.some(
        (edge) => edge.type === 'loop' && (edge.from === 'final' || edge.to === 'final'),
      ),
    ).toBe(false)
    expect(overview.some((edge) => edge.from === 'model' && edge.to === 'context')).toBe(false)
    expect(
      overview.some(
        (edge) => edge.from === 'harness' && edge.to === 'context' && edge.type === 'data',
      ),
    ).toBe(false)
    expect(getDisplayedConnections(getVisibleNodes(2))).toHaveLength(exploreConnections.length)
  })

  it('finds English and Chinese terms, prioritizes exact concept names and handles no match', () => {
    for (const [query, id] of [
      [' RAG ', 'rag'],
      ['mCp', 'mcp'],
      ['Workflow', 'workflow'],
      ['Multi-Agent', 'multi-agent'],
      ['Compaction', 'compaction'],
      ['工具请求单', 'call'],
      ['长期记忆', 'memory'],
    ])
      expect(searchNodes(query)[0]?.id).toBe(id)
    expect(searchNodes('zz-no-such-concept')).toEqual([])
    expect(searchNodes('')).toEqual(exploreNodes)
    expect(searchNodes('PDF 文件').map((node) => node.id)).toContain('files')
  })

  it('runs a complete teaching task with valid edges, explicit failure, repair, and eventual PASS', () => {
    expect(taskSteps.length).toBeGreaterThanOrEqual(15)
    expect(taskSteps.length).toBeLessThanOrEqual(20)
    expect(new Set(taskSteps.map((step) => step.id)).size).toBe(taskSteps.length)
    for (const step of taskSteps) {
      expect(nodeIds.has(step.nodeId)).toBe(true)
      expect(step.edgeIds.length).toBeGreaterThan(0)
      for (const id of step.edgeIds)
        expect(
          exploreConnections.some((edge) => edge.id === id),
          `${step.id}: missing ${id}`,
        ).toBe(true)
    }
    const failure = taskSteps.findIndex((step) => step.outcome === 'fail')
    const pass = taskSteps.findIndex((step) => step.outcome === 'pass')
    expect(failure).toBeGreaterThan(0)
    expect(pass).toBeGreaterThan(failure + 1)
    expect(taskSteps[failure].edgeIds).toContain('verifier-loop')
    expect(
      taskSteps.slice(failure, pass).some((step) => step.edgeIds.includes('loop-context')),
    ).toBe(true)
    expect(
      taskSteps.slice(failure, pass).some((step) => step.edgeIds.includes('browser-observation')),
    ).toBe(true)
    expect(taskSteps.slice(0, pass).every((step) => !step.edgeIds.includes('verifier-final'))).toBe(
      true,
    )
    expect(taskSteps[pass].edgeIds).toContain('verifier-final')
    expect(taskSteps.at(-1)?.nodeId).toBe('final')
    expect(taskSteps[0].explanation).toContain('教学模拟')
    for (const stop of tourStops) {
      expect(nodeIds.has(stop.nodeId)).toBe(true)
      expect(stop.question.length).toBeGreaterThan(8)
      expect(stop.explanation.length).toBeGreaterThan(20)
    }
  })

  it('keeps every task step flow visible when its focused concept is shown at overview depth', () => {
    const missing: string[] = []
    for (const step of taskSteps) {
      const shown = getDisplayedConnections(getVisibleNodes(0, step.nodeId))
      for (const edgeId of step.edgeIds) {
        if (!shown.some((edge) => edge.id === edgeId)) missing.push(`${step.id}: ${edgeId}`)
        else {
          const original = exploreConnections.find((edge) => edge.id === edgeId)!
          expect(shown.find((edge) => edge.id === edgeId)).toMatchObject({
            from: original.from,
            to: original.to,
          })
        }
      }
    }
    expect(missing).toEqual([])
  })
})
