import type { ExploreConnection } from '../types'

/** A removed module blocks both incoming and outgoing traffic, even if a task selects that edge. */
export function connectionIsDisabled(
  edge: ExploreConnection,
  disabledNodes: ReadonlySet<string>,
  disabledEdges: ReadonlySet<string>,
): boolean {
  return disabledEdges.has(edge.id) || disabledNodes.has(edge.from) || disabledNodes.has(edge.to)
}
