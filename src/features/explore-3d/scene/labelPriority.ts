import type { ExploreNode } from '../types'

/** Immersive groups get first use of the label budget; default exploration retains core-first ordering. */
export function labelPriority(
  node: ExploreNode,
  selectedId: string | null,
  related: ReadonlySet<string>,
  framed?: ReadonlySet<string>,
  participating?: ReadonlySet<string>,
): number {
  if (node.id === selectedId) return -4
  if (participating?.has(node.id)) return -3.9 + node.level * 0.05
  if (framed?.has(node.id)) return -3.5
  if (node.level === 0 && related.has(node.id)) return -3
  if (node.level === 0) return -2
  return related.has(node.id) ? -1 : node.level
}
