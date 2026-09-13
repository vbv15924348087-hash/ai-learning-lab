import type {
  ExploreCompareFilter,
  ExploreConnection,
  ExploreEdgeState,
  ExplorePacketType,
  ExplorePathComparison,
} from '../types'

export const MAX_ACTIVE_PACKETS = 3

export function isResultConnection(edge: ExploreConnection) {
  return (
    edge.from === 'observation' ||
    ((edge.to === 'observation' || edge.to === 'context') &&
      ['web', 'files', 'code', 'database', 'browser', 'api', 'rag', 'memory', 'mcp'].includes(
        edge.from,
      )) ||
    /(?:result|return|observation-context)/.test(edge.id)
  )
}

export function packetLabel(type: ExplorePacketType | undefined, result: boolean) {
  if (type === 'fail') return 'FAIL'
  if (type === 'pass') return 'PASS'
  if (type === 'verification') return 'CHECK'
  if (result || type === 'result') return 'RESULT'
  if (type === 'tool-call') return 'CALL'
  return 'TASK'
}

export function comparisonRole(edgeId: string, comparison?: ExplorePathComparison) {
  if (comparison?.commonEdgeIds.includes(edgeId)) return 'common'
  if (comparison?.firstOnlyEdgeIds.includes(edgeId)) return 'first'
  if (comparison?.secondOnlyEdgeIds.includes(edgeId)) return 'second'
  return undefined
}

export function comparisonIncludes(
  role: ReturnType<typeof comparisonRole>,
  filter: ExploreCompareFilter,
) {
  if (filter === 'common') return role === 'common'
  if (filter === 'added') return role === 'second'
  if (filter === 'differences') return role === 'first' || role === 'second'
  return role !== undefined
}

/** Disabled modules win over playback and never receive a moving packet. */
export function boundedPacketEdges(
  edgeIds: string[],
  states: Record<string, ExploreEdgeState> | undefined,
  disabled: Set<string>,
) {
  return new Set(
    edgeIds
      .filter((id) => !disabled.has(id) && (!states || states[id] === 'active'))
      .slice(0, MAX_ACTIVE_PACKETS),
  )
}
