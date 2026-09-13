import type { ExploreTaskStep } from '../types'
import {
  immersiveScenarioConnections,
  type ApprovalStatus,
  type CompareFilter,
  type EdgeState,
  type TaskPathStep,
  type TaskScenario,
} from './scenarios'

export const approvalIndex = (steps: TaskPathStep[]): number =>
  steps.findIndex((step) => step.gate === 'approval')

/** Every navigation entry point uses this guard, including autoplay and seeking. */
export function clampTaskIndex(
  steps: TaskPathStep[],
  requested: number,
  status: ApprovalStatus,
): number {
  const safe = Number.isFinite(requested) ? Math.trunc(requested) : 0
  const gate = approvalIndex(steps)
  const lastAllowed = gate >= 0 && status !== 'approved' ? gate : steps.length - 1
  return Math.max(0, Math.min(safe, lastAllowed))
}

export function resolvedTaskSteps(task: TaskScenario, status: ApprovalStatus): TaskPathStep[] {
  const gate = approvalIndex(task.steps)
  if (status !== 'rejected' || gate < 0) return task.steps
  return task.steps.slice(0, gate + 1).map((step, index) =>
    index === gate
      ? {
          ...step,
          title: 'STOP · 已拒绝本次操作',
          action: 'STOP · 已拒绝本次操作',
          explanation:
            '你已拒绝这次动作。运行系统停止本次任务，数据库工具没有执行。重新开始才会发起一次新的审批。',
          explanationBeginner: '你已拒绝这次动作。运行系统停止本次任务，数据库工具没有执行。',
          explanationStandard:
            '人工决定拒绝，运行系统结束这次动作，不调度数据库工具。当前结果是 STOP，不是执行成功。',
          explanationExpert:
            '拒绝结果绑定本轮请求，执行分支不可达；重新运行会清空旧决定并重新请求批准。',
          message: 'FAIL / STOP · 模拟数据库未执行',
          packetType: 'fail',
          outcome: 'fail',
        }
      : step,
  )
}

export function getEdgeStates(
  steps: ExploreTaskStep[],
  index: number,
  disabledEdgeIds: string[] = [],
): Record<string, EdgeState> {
  const states: Record<string, EdgeState> = Object.fromEntries(
    immersiveScenarioConnections.map((edge) => [edge.id, 'idle']),
  )
  // A repeated edge can become active again after an earlier traversal completed.
  steps.slice(index + 1).forEach((step) =>
    step.edgeIds.forEach((id) => {
      states[id] = 'upcoming'
    }),
  )
  steps.slice(0, index).forEach((step) =>
    step.edgeIds.forEach((id) => {
      states[id] = 'completed'
    }),
  )
  steps[index]?.edgeIds.forEach((id) => {
    states[id] = 'active'
  })
  disabledEdgeIds.forEach((id) => {
    states[id] = 'disabled'
  })
  return states
}

export function getContextUsage(steps: TaskPathStep[], index: number): number | undefined {
  for (let position = Math.min(index, steps.length - 1); position >= 0; position -= 1) {
    if (steps[position].contextUsage !== undefined) return steps[position].contextUsage!
  }
  return undefined
}

export type PathComparison = {
  commonNodeIds: string[]
  firstOnlyNodeIds: string[]
  secondOnlyNodeIds: string[]
  commonEdgeIds: string[]
  firstOnlyEdgeIds: string[]
  secondOnlyEdgeIds: string[]
  visibleNodeIds: string[]
  visibleEdgeIds: string[]
}

export function comparePaths(
  first: TaskScenario,
  second: TaskScenario,
  filter: CompareFilter = 'all',
): PathComparison {
  const nodesA = new Set(first.steps.map((step) => step.nodeId))
  const nodesB = new Set(second.steps.map((step) => step.nodeId))
  const edgesA = new Set(first.steps.flatMap((step) => step.edgeIds))
  const edgesB = new Set(second.steps.flatMap((step) => step.edgeIds))
  const commonNodeIds = [...nodesA].filter((id) => nodesB.has(id))
  const firstOnlyNodeIds = [...nodesA].filter((id) => !nodesB.has(id))
  const secondOnlyNodeIds = [...nodesB].filter((id) => !nodesA.has(id))
  const commonEdgeIds = [...edgesA].filter((id) => edgesB.has(id))
  const firstOnlyEdgeIds = [...edgesA].filter((id) => !edgesB.has(id))
  const secondOnlyEdgeIds = [...edgesB].filter((id) => !edgesA.has(id))
  const visibleEdgeIds =
    filter === 'common'
      ? commonEdgeIds
      : filter === 'added'
        ? secondOnlyEdgeIds
        : filter === 'differences'
          ? [...firstOnlyEdgeIds, ...secondOnlyEdgeIds]
          : [...new Set([...edgesA, ...edgesB])]
  const endpoints = immersiveScenarioConnections
    .filter((edge) => visibleEdgeIds.includes(edge.id))
    .flatMap((edge) => [edge.from, edge.to])
  const selectedNodes =
    filter === 'common'
      ? commonNodeIds
      : filter === 'added'
        ? secondOnlyNodeIds
        : filter === 'differences'
          ? [...firstOnlyNodeIds, ...secondOnlyNodeIds]
          : [...new Set([...nodesA, ...nodesB])]
  return {
    commonNodeIds,
    firstOnlyNodeIds,
    secondOnlyNodeIds,
    commonEdgeIds,
    firstOnlyEdgeIds,
    secondOnlyEdgeIds,
    visibleNodeIds: [...new Set([...selectedNodes, ...endpoints])],
    visibleEdgeIds,
  }
}
