import { describe, expect, it } from 'vitest'
import { exploreConnections, exploreNodes } from '../data'
import {
  approvalIndex,
  clampTaskIndex,
  comparePaths,
  getContextUsage,
  getEdgeStates,
  resolvedTaskSteps,
} from './scenarioEngine'
import {
  allTaskScenarios,
  getTaskScenario,
  gpuComplexityLadder,
  immersiveScenarioConnections,
  simulatorGraph,
  taskScenarios,
  whyNotThisNode,
  whyThisNode,
} from './scenarios'

describe('scenario data and path engine', () => {
  it('keeps all scenarios on one graph with literal incoming edges and unique steps', () => {
    expect(taskScenarios.map((task) => task.category)).toEqual([
      'simple',
      'fresh-info',
      'file',
      'research',
      'high-risk',
      'long-running',
    ])
    expect(new Set(allTaskScenarios.map((task) => task.id)).size).toBe(allTaskScenarios.length)
    const nodes = new Map(simulatorGraph.nodes.map((node) => [node.id, node]))
    const edges = new Map(simulatorGraph.connections.map((edge) => [edge.id, edge]))
    expect(edges.size).toBe(simulatorGraph.connections.length)
    for (const task of allTaskScenarios) {
      expect(new Set(task.steps.map((step) => step.id)).size).toBe(task.steps.length)
      for (const value of Object.values(task.complexity)) expect(value).toBeGreaterThanOrEqual(0)
      for (const value of Object.values(task.complexity)) expect(value).toBeLessThanOrEqual(5)
      task.steps.forEach((step, index) => {
        expect(nodes.has(step.nodeId)).toBe(true)
        expect(step.explanationBeginner).toBeTruthy()
        expect(step.explanationStandard).toBeTruthy()
        expect(step.explanationExpert).toBeTruthy()
        expect(step.activeConnections).toEqual(step.edgeIds)
        expect(step.edgeIds).toHaveLength(index === 0 ? 0 : 1)
        step.edgeIds.forEach((id) => {
          expect(edges.get(id)?.from).toBe(task.steps[index - 1].nodeId)
          expect(edges.get(id)?.to).toBe(step.nodeId)
        })
      })
    }
    // The existing Explore catalog and its direct-answer policy stay unchanged.
    expect(exploreConnections.some((edge) => edge.id === 'model-final')).toBe(false)
    expect(exploreNodes.some((node) => node.id === 'risk-check')).toBe(false)
    expect(immersiveScenarioConnections.some((edge) => edge.id === 'model-final')).toBe(true)
  })

  it('distinguishes direct answers, Web and File paths, and actual repeated research visits', () => {
    const visits = (id: string, node: string) =>
      getTaskScenario(id).steps.filter((step) => step.nodeId === node)
    expect(getTaskScenario('simple').steps.map((step) => step.nodeId)).toEqual([
      'user',
      'context',
      'model',
      'final',
    ])
    expect(visits('fresh-info', 'web')).toHaveLength(1)
    expect(visits('fresh-info', 'files')).toHaveLength(0)
    expect(visits('file', 'files')).toHaveLength(1)
    expect(visits('file', 'web')).toHaveLength(0)
    expect(visits('research', 'loop')).toHaveLength(4)
    expect(visits('research', 'harness')).toHaveLength(4)
    expect(visits('research', 'observation')).toHaveLength(4)
    expect(visits('research', 'model')).toHaveLength(5)
    const research = getTaskScenario('research')
    expect(research.steps.findIndex((step) => step.nodeId === 'verifier')).toBeGreaterThan(
      research.steps.map((step) => step.nodeId).lastIndexOf('loop'),
    )
    expect(gpuComplexityLadder.map((task) => task.level)).toEqual([1, 2, 3, 4, 5])
    expect(visits('gpu-4', 'harness')).toHaveLength(10)
    expect(getTaskScenario('gpu-5').steps.map((step) => step.nodeId)).toEqual(
      expect.arrayContaining(['memory', 'state', 'compaction']),
    )
  })

  it('denies every seek beyond pending or rejected approval and never fabricates successful rejection', () => {
    const task = getTaskScenario('high-risk')
    const gate = approvalIndex(task.steps)
    for (const status of ['pending', 'rejected', 'not-required'] as const) {
      for (let index = gate; index < task.steps.length + 10; index += 1)
        expect(clampTaskIndex(task.steps, index, status)).toBe(gate)
    }
    expect(clampTaskIndex(task.steps, 1000, 'approved')).toBe(task.steps.length - 1)
    expect(clampTaskIndex(task.steps, Number.NaN, 'pending')).toBe(0)
    expect(clampTaskIndex(task.steps, -10, 'approved')).toBe(0)
    const stopped = resolvedTaskSteps(task, 'rejected')
    expect(stopped.at(-1)?.outcome).toBe('fail')
    expect(stopped.at(-1)?.message).toContain('STOP')
    expect(stopped.some((step) => step.nodeId === 'database')).toBe(false)
    expect(resolvedTaskSteps(task, 'approved')).toBe(task.steps)
  })

  it('reactivates a repeated edge without lighting an entire path and distinguishes requests from results', () => {
    const task = getTaskScenario('research')
    const first = task.steps.findIndex((step) => step.edgeIds.includes('call-harness'))
    const second = task.steps.findIndex(
      (step, index) => index > first && step.edgeIds.includes('call-harness'),
    )
    expect(getEdgeStates(task.steps, first)['call-harness']).toBe('active')
    expect(getEdgeStates(task.steps, first + 1)['call-harness']).toBe('completed')
    expect(getEdgeStates(task.steps, second)['call-harness']).toBe('active')
    expect(
      Object.values(getEdgeStates(task.steps, second)).filter((state) => state === 'active'),
    ).toHaveLength(1)
    expect(getEdgeStates(task.steps, second, ['call-harness'])['call-harness']).toBe('disabled')
    expect(task.steps[first].packetType).toBe('tool-call')
    expect(task.steps.find((step) => step.nodeId === 'observation')?.packetType).toBe('result')
  })

  it('preserves the 38 → 72 → 91 → compaction → 34 budget sequence across seeking', () => {
    const task = getTaskScenario('long-running')
    const values = task.steps.flatMap((step) =>
      step.contextUsage === undefined ? [] : [step.contextUsage],
    )
    expect(values).toEqual([38, 72, 91, 34])
    const compact = task.steps.findIndex((step) => step.nodeId === 'compaction')
    expect(getContextUsage(task.steps, compact)).toBe(91)
    expect(getContextUsage(task.steps, compact + 1)).toBe(34)
    expect(getContextUsage(task.steps, task.steps.length - 1)).toBe(34)
    expect(getContextUsage(task.steps, 0)).toBeUndefined()
  })

  it('compares literal edge membership with differences still attached to visible endpoints', () => {
    const simple = getTaskScenario('simple')
    const research = getTaskScenario('research')
    const common = comparePaths(simple, research, 'common')
    expect(common.commonEdgeIds).toEqual(['user-context', 'context-model'])
    expect(common.visibleEdgeIds).toEqual(common.commonEdgeIds)
    const added = comparePaths(simple, research, 'added')
    expect(added.secondOnlyNodeIds).toEqual(
      expect.arrayContaining(['planning', 'web', 'loop', 'verifier']),
    )
    expect(added.visibleEdgeIds).not.toContain('model-final')
    const differences = comparePaths(simple, research, 'differences')
    expect(differences.visibleEdgeIds).toContain('model-final')
    expect(differences.visibleEdgeIds).not.toContain('user-context')
    for (const id of differences.visibleEdgeIds) {
      const edge = immersiveScenarioConnections.find((entry) => entry.id === id)!
      expect(differences.visibleNodeIds).toEqual(expect.arrayContaining([edge.from, edge.to]))
    }
    expect(comparePaths(simple, simple, 'differences').visibleEdgeIds).toEqual([])
  })

  it('offers reasons tied to the task and the selected responsibility', () => {
    const task = getTaskScenario('simple')
    expect(whyThisNode(task, 'model')[0]).toContain('已有知识')
    expect(whyThisNode(task, 'web')).toEqual([])
    expect(whyNotThisNode(task, 'web')).toContain('不依赖实时信息')
    expect(whyNotThisNode(task, 'memory')).toContain('跨任务')
    expect(whyNotThisNode(task, 'guardrail')).toContain('高风险')
    expect(whyNotThisNode(getTaskScenario('file'), 'web')).toContain('PDF')
  })
})
