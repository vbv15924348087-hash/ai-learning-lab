import { describe, expect, it } from 'vitest'
import { exploreConnections, exploreNodes } from '../data'
import { getDisplayedConnections } from '../graph'
import { explainConnection } from './connections'
import { getInteriorGraph, getRelationGraph } from './graph'
import { moduleInteriors } from './interiors'
import type { ModuleId } from './types'

const modules: ModuleId[] = ['context', 'model', 'harness']
const originalIds = new Set(exploreNodes.map((node) => node.id))
const edge = (id: string) => exploreConnections.find((connection) => connection.id === id)!

describe('immersive relation graphs', () => {
  it('distinguishes direct inputs from indirect ancestors and conceptual relations', () => {
    const upstream = getRelationGraph('context', 'upstream')
    expect(upstream.nodes.map((node) => node.id)).toContain('rag')
    expect(upstream.nodes.map((node) => node.id)).toContain('observation')
    expect(upstream.nodes.map((node) => node.id)).not.toContain('user')
    expect(upstream.nodes.map((node) => node.id)).not.toContain('model')
    expect(upstream.connections.every((connection) => connection.to === 'context')).toBe(true)

    const downstream = getRelationGraph('model', 'downstream')
    expect(downstream.nodes.map((node) => node.id)).toContain('call')
    expect(downstream.nodes.map((node) => node.id)).not.toContain('external')
    expect(downstream.connections.every((connection) => connection.from === 'model')).toBe(true)
  })

  it('can show related concepts without inventing direct execution arrows', () => {
    const graph = getRelationGraph('harness', 'all')
    expect(graph.nodes.map((node) => node.id)).toContain('model')
    expect(graph.nodes.map((node) => node.id)).toContain('call')
    expect(graph.connections).toContain(edge('call-harness'))
    expect(graph.connections).toContain(edge('model-call'))
    expect(
      graph.connections.some(
        (connection) => connection.from === 'model' && connection.to === 'harness',
      ),
    ).toBe(false)
    for (const connection of graph.connections) expect(exploreConnections).toContain(connection)
  })

  it('handles unknown selections without misleading placeholder relationships', () => {
    for (const direction of ['upstream', 'downstream', 'all'] as const)
      expect(getRelationGraph('missing-node', direction)).toEqual({ nodes: [], connections: [] })
  })
})

describe('module interiors', () => {
  it('provides navigable concepts with valid lessons and self-contained edges', () => {
    const lessonIds = new Set(exploreNodes.map((node) => node.lessonId))
    const allInternalIds = new Set<string>()
    for (const id of modules) {
      const interior = moduleInteriors[id]
      const graph = getInteriorGraph(id, false)
      const shown = new Set(graph.nodes.map((node) => node.id))
      const owner = exploreNodes.find((node) => node.id === id)!
      expect(interior.nodes.length).toBeGreaterThanOrEqual(5)
      expect(interior.nodes.length).toBeLessThanOrEqual(7)
      expect(graph.nodes.filter((node) => originalIds.has(node.id))).toEqual([owner])
      for (const node of interior.nodes) {
        expect(node.id.startsWith(`inside-${id}-`)).toBe(true)
        expect(originalIds.has(node.id)).toBe(false)
        expect(allInternalIds.has(node.id)).toBe(false)
        allInternalIds.add(node.id)
        expect(lessonIds.has(node.lessonId)).toBe(true)
        expect(node.parentId).toBe(id)
        expect(node.position.every(Number.isFinite)).toBe(true)
        expect(node.position).not.toEqual(owner.position)
        expect(
          Math.hypot(...node.position.map((value, axis) => value - owner.position[axis])),
        ).toBeLessThan(7)
        for (const relatedId of [...node.upstream, ...node.downstream, ...node.related])
          expect(shown.has(relatedId), `${node.id} references ${relatedId}`).toBe(true)
      }
      for (const connection of graph.connections) {
        expect(shown.has(connection.from)).toBe(true)
        expect(shown.has(connection.to)).toBe(true)
        expect(connection.from).not.toBe(connection.to)
      }
    }
    expect(allInternalIds.size).toBe(19)
    expect(
      new Set(
        modules.flatMap((id) => moduleInteriors[id].nodes).map((node) => node.position.join(',')),
      ).size,
    ).toBe(19)
  })

  it('expands one module at a time while keeping the six original cores and their positions', () => {
    const cores = exploreNodes.filter((node) => node.level === 0)
    const before = JSON.stringify(exploreNodes)
    for (const id of modules) {
      const graph = getInteriorGraph(id, true)
      expect(graph.nodes.filter((node) => originalIds.has(node.id))).toEqual(cores)
      expect(graph.nodes.filter((node) => !originalIds.has(node.id))).toEqual(
        moduleInteriors[id].nodes,
      )
      for (const connection of getDisplayedConnections(cores))
        expect(graph.connections).toContainEqual(connection)
      expect(
        graph.nodes.some(
          (node) => node.id.startsWith('inside-') && !node.id.startsWith(`inside-${id}-`),
        ),
      ).toBe(false)
    }
    expect(JSON.stringify(exploreNodes)).toBe(before)
  })

  it('represents Context as selected input components rather than a sequential pipeline', () => {
    const { connections, description, nodes } = moduleInteriors.context
    expect(connections).toHaveLength(7)
    expect(connections.every((connection) => connection.to === 'context')).toBe(true)
    expect(description).toContain('不是先后执行')
    expect(nodes.find((node) => node.id === 'inside-context-rag')?.confused).toContain(
      '网页搜索也能直接作为工具',
    )
    expect(nodes.find((node) => node.id === 'inside-context-memory')?.confused).toContain(
      '不是整个 Memory 仓库',
    )
  })

  it('shows Attention within Transformer and a conditional autoregressive continuation', () => {
    const { connections, description, nodes } = moduleInteriors.model
    const has = (from: string, to: string, type?: string) =>
      connections.some(
        (connection) =>
          connection.from === `inside-model-${from}` &&
          connection.to === `inside-model-${to}` &&
          (!type || connection.type === type),
      )
    expect(has('transformer', 'attention')).toBe(true)
    expect(has('attention', 'transformer')).toBe(true)
    expect(has('transformer', 'prediction')).toBe(true)
    expect(has('attention', 'prediction')).toBe(false)
    expect(has('prediction', 'token', 'loop')).toBe(true)
    expect(description).toContain('自回归')
    expect(description).toContain('不是真实权重')
    expect(nodes.every((node) => node.lessonId === 'model-inside')).toBe(true)
    expect(nodes.find((node) => node.id === 'inside-model-embedding')?.confused).toContain(
      '另一个编码器',
    )
    expect(
      nodes.find((node) => node.id === 'inside-model-prediction')?.technicalDefinition,
    ).toContain('停止')
  })

  it('keeps runtime execution behind permission and guardrail checks, including retry', () => {
    const { connections, nodes } = moduleInteriors.harness
    expect(connections.filter((connection) => connection.to === 'inside-harness-runtime')).toEqual([
      expect.objectContaining({ from: 'inside-harness-guardrail' }),
    ])
    expect(connections).toContainEqual(
      expect.objectContaining({
        from: 'inside-harness-retry',
        to: 'inside-harness-permission',
        type: 'loop',
      }),
    )
    expect(connections).toContainEqual(
      expect.objectContaining({
        from: 'inside-harness-state',
        to: 'inside-harness-loop',
      }),
    )
    expect(connections).toContainEqual(
      expect.objectContaining({
        from: 'inside-harness-runtime',
        to: 'inside-harness-trace',
      }),
    )
    expect(nodes.find((node) => node.id === 'inside-harness-guardrail')?.confused).toContain(
      '等待和超时都不是批准',
    )
    expect(nodes.find((node) => node.id === 'inside-harness-state')?.confused).toContain(
      '不自动等于长期 Memory',
    )
  })
})

describe('connection explanations', () => {
  it('explains the information and execution boundaries in three distinct levels', () => {
    for (const id of [
      'rag-context',
      'model-call',
      'call-harness',
      'harness-tools',
      'external-observation',
      'observation-context',
      'verifier-loop',
      'verifier-final',
    ]) {
      const explanation = explainConnection(edge(id), exploreNodes)
      expect(
        new Set([explanation.beginner, explanation.standard, explanation.technical]).size,
      ).toBe(3)
      expect(explanation.beginner.length).toBeGreaterThan(15)
      expect(explanation.standard.length).toBeGreaterThan(25)
      expect(explanation.technical.length).toBeGreaterThan(35)
    }
    expect(explainConnection(edge('rag-context'), exploreNodes).technical).toContain(
      '网页搜索工具也可直接',
    )
    expect(explainConnection(edge('model-call'), exploreNodes).beginner).toContain('还没有执行')
    expect(explainConnection(edge('observation-context'), exploreNodes).standard).toContain(
      '断开这条线',
    )
    expect(explainConnection(edge('verifier-loop'), exploreNodes).standard).toContain('FAIL')
    expect(explainConnection(edge('verifier-final'), exploreNodes).standard).toContain('PASS')
  })

  it('retains the true Tool Call relationship when the overview folds it into Model → Harness', () => {
    const overview = getInteriorGraph('context', true)
    const collapsed = overview.connections.find(
      (connection) => connection.from === 'model' && connection.to === 'harness',
    )!
    const explanation = explainConnection(collapsed, overview.nodes)
    expect(explanation.title).toContain('Model → Harness')
    expect(explanation.technical).toContain('Tool Call → Harness')
    expect(explanation.standard).toContain('检查参数、权限')
  })

  it('keeps unspecialized explanations grounded in both real node responsibilities', () => {
    const connection = edge('tools-files')
    const explanation = explainConnection(connection, exploreNodes)
    expect(explanation.standard).toContain(
      exploreNodes.find((node) => node.id === 'tools')!.responsibility,
    )
    expect(explanation.standard).toContain(
      exploreNodes.find((node) => node.id === 'files')!.responsibility,
    )
    expect(explanation.beginner).toContain(connection.label)
    for (const moduleId of modules) {
      const graph = getInteriorGraph(moduleId, false)
      for (const item of graph.connections) {
        const text = explainConnection(item, graph.nodes)
        expect(text.title).not.toContain('inside-')
        expect(text.technical).not.toContain('undefined')
      }
    }
  })
})
