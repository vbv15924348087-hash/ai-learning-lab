import { describe, expect, it } from 'vitest'
import { exploreConnections, exploreNodes } from '../data'
import { experiments } from './experiments'

const nodes = new Set(exploreNodes.map((node) => node.id))
const connections = new Map(exploreConnections.map((edge) => [edge.id, edge]))
const experiment = (id: string) => experiments.find((item) => item.id === id)!
const edgesFor = (id: string, altered: boolean) =>
  experiment(id)[altered ? 'altered' : 'normal'].steps.flatMap((step) => step.edgeIds)

describe('immersive system experiments', () => {
  it('provides six different runnable comparisons with valid shared graph references', () => {
    expect(experiments).toHaveLength(6)
    expect(new Set(experiments.map((item) => item.id)).size).toBe(6)
    for (const scenario of experiments) {
      for (const id of scenario.disabledNodeIds) expect(nodes.has(id)).toBe(true)
      for (const id of scenario.disabledEdgeIds) expect(connections.has(id)).toBe(true)
      expect(scenario.altered.steps).not.toEqual(scenario.normal.steps)
      expect(scenario.altered.title).not.toBe(scenario.normal.title)
      for (const branch of [scenario.normal, scenario.altered]) {
        expect(branch.steps.length).toBeGreaterThanOrEqual(3)
        expect(branch.steps.length).toBeLessThanOrEqual(6)
        expect(new Set(branch.steps.map((step) => step.id)).size).toBe(branch.steps.length)
        expect(branch.steps[0].explanation).toContain('教学模拟')
        for (const step of branch.steps) {
          expect(nodes.has(step.nodeId), `${scenario.id}: ${step.nodeId}`).toBe(true)
          for (const edge of step.edgeIds) {
            expect(connections.has(edge), `${step.id}: ${edge}`).toBe(true)
          }
        }
      }
    }
  })

  it('never animates a disabled edge or a flow through a disabled module in an altered run', () => {
    for (const scenario of experiments) {
      for (const step of scenario.altered.steps) {
        expect(scenario.disabledNodeIds).not.toContain(step.nodeId)
        for (const id of step.edgeIds) {
          expect(scenario.disabledEdgeIds, `${step.id}: ${id}`).not.toContain(id)
          const edge = connections.get(id)!
          expect(scenario.disabledNodeIds, `${step.id}: ${edge.from}`).not.toContain(edge.from)
          expect(scenario.disabledNodeIds, `${step.id}: ${edge.to}`).not.toContain(edge.to)
        }
      }
    }
  })

  it('separates internal RAG from independent public Web Search', () => {
    const scenario = experiment('rag-off')
    expect(scenario.question).toContain('内部')
    expect(edgesFor(scenario.id, false)).toContain('rag-context')
    expect(edgesFor(scenario.id, true)).not.toContain('rag-context')
    expect(edgesFor(scenario.id, true)).toEqual(
      expect.arrayContaining([
        'model-call',
        'call-harness',
        'harness-tools',
        'tools-web',
        'web-observation',
        'observation-context',
      ]),
    )
    expect(scenario.altered.takeaway).toContain('RAG 不等于 Search')
    expect(scenario.altered.steps.at(-1)).toMatchObject({ nodeId: 'verifier', outcome: 'fail' })
    expect(scenario.altered.explanation).toContain('Web Search 仍可用')
  })

  it('keeps Memory retrieval separate from deleting stored or currently visible information', () => {
    const scenario = experiment('memory-off')
    expect(scenario.normal.steps[0].explanation).toContain('History 没有重述偏好')
    expect(edgesFor(scenario.id, false)).toContain('memory-context')
    expect(edgesFor(scenario.id, true)).not.toContain('memory-context')
    expect(scenario.altered.takeaway).toContain('不等于删除记忆')
    expect(scenario.altered.takeaway).toContain('不会删除已经在当前 Context 中的信息')
    expect(scenario.altered.steps.at(-1)?.nodeId).toBe('loop')
  })

  it('cannot verify a latest-GPU answer when Search is unavailable, while preserving other tools and error feedback', () => {
    const scenario = experiment('search-off')
    expect(scenario.question).toContain('今天最新')
    expect(scenario.disabledNodeIds).toEqual(['web'])
    expect(edgesFor(scenario.id, false)).toEqual(
      expect.arrayContaining([
        'model-call',
        'call-harness',
        'harness-tools',
        'tools-web',
        'web-observation',
        'observation-context',
        'verifier-final',
      ]),
    )
    expect(edgesFor(scenario.id, true)).toContain('observation-context')
    expect(edgesFor(scenario.id, true)).not.toContain('tools-web')
    expect(edgesFor(scenario.id, true)).not.toContain('web-observation')
    expect(edgesFor(scenario.id, true)).not.toContain('verifier-final')
    expect(scenario.altered.steps.some((step) => step.nodeId === 'final')).toBe(false)
    expect(scenario.altered.steps.at(-1)).toMatchObject({ nodeId: 'verifier', outcome: 'fail' })
    expect(scenario.normal.steps[0].explanation).toContain('不代表当前真实 GPU 发布情况')
    expect(scenario.altered.title).toContain('缺乏最新外部信息')
    expect(scenario.altered.takeaway).toContain('不会关闭全部 Tools')
  })

  it('repairs the same known defect normally but does not invent a PASS or safe edge when verification is skipped', () => {
    const scenario = experiment('verification-off')
    expect(scenario.normal.steps.some((step) => step.outcome === 'fail')).toBe(true)
    expect(scenario.normal.steps.at(-1)?.outcome).toBe('pass')
    expect(edgesFor(scenario.id, false)).toEqual(
      expect.arrayContaining(['model-verifier', 'verifier-loop', 'loop-context', 'verifier-final']),
    )
    const alteredFinal = scenario.altered.steps.at(-1)!
    expect(alteredFinal.nodeId).toBe('final')
    expect(alteredFinal.edgeIds).toEqual([])
    expect(alteredFinal.message).toContain('未核验交付')
    expect(alteredFinal.message).toContain('4 ms')
    expect(scenario.altered.steps.some((step) => step.outcome === 'pass')).toBe(false)
    expect(edgesFor(scenario.id, true)).not.toContain('verifier-final')
  })

  it('retains successful tool execution while cutting only the observation return in the broken-result experiment', () => {
    const scenario = experiment('result-disconnected')
    expect(scenario.disabledEdgeIds).toEqual(['observation-context'])
    for (const altered of [false, true]) {
      expect(edgesFor(scenario.id, altered)).toEqual(
        expect.arrayContaining(['call-harness', 'harness-tools', 'tools-code', 'code-observation']),
      )
      const execute = scenario[altered ? 'altered' : 'normal'].steps.find(
        (step) => step.nodeId === 'code',
      )!
      expect(execute.title).toContain('执行成功')
    }
    expect(edgesFor(scenario.id, false)).toContain('observation-context')
    expect(edgesFor(scenario.id, true)).not.toContain('observation-context')
    expect(scenario.altered.steps.at(-1)?.outcome).toBe('fail')
  })

  it('waits for approval normally and preserves other guardrails when the single approval condition is removed', () => {
    const scenario = experiment('approval-off')
    expect(scenario.question).toContain('delete_database')
    expect(scenario.normal.steps.at(-1)?.nodeId).toBe('approval')
    expect(edgesFor(scenario.id, false)).not.toContain('approval-tools')
    expect(edgesFor(scenario.id, false)).not.toContain('tools-database')
    expect(scenario.disabledNodeIds).not.toContain('guardrail')
    expect(edgesFor(scenario.id, true)).toEqual(
      expect.arrayContaining([
        'harness-guardrail',
        'harness-tools',
        'tools-database',
        'database-observation',
      ]),
    )
    expect(scenario.altered.takeaway).toContain('不会自动让其他 Guardrail 失效')
    expect(scenario.altered.steps.every((step) => step.outcome !== 'pass')).toBe(true)
  })

  it('represents actions as serializable simulation data, never executable tool functions', () => {
    expect(JSON.parse(JSON.stringify(experiments))).toEqual(experiments)
    for (const scenario of experiments) {
      expect(scenario.normal.steps[0].explanation).toContain('教学模拟')
      expect(scenario.altered.steps[0].explanation).toContain('教学模拟')
    }
    const approval = experiment('approval-off')
    expect(approval.normal.steps[0].explanation).toContain('不会连接、执行或删除任何真实数据库')
    expect(approval.altered.steps[0].explanation).toContain('没有真实数据库连接或执行')
  })
})
