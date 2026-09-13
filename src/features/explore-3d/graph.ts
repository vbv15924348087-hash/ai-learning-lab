import { exploreConnections, exploreNodes } from './data'
import type { ExploreConnection, ExploreDepth, ExploreNode } from './types'

const nodesById = new Map(exploreNodes.map((node) => [node.id, node]))

export function getRelations(id: string) {
  const node = nodesById.get(id)
  const resolve = (ids: string[]) =>
    ids.flatMap((relatedId) => {
      const related = nodesById.get(relatedId)
      return related ? [related] : []
    })
  return {
    upstream: resolve(node?.upstream ?? []),
    downstream: resolve(node?.downstream ?? []),
    related: resolve(node?.related ?? []),
  }
}

/** A selected concept is reachable at every depth, including its direct relations. */
export function getVisibleNodes(depth: ExploreDepth, selectedId?: string | null): ExploreNode[] {
  const visible = new Set(exploreNodes.filter((node) => node.level <= depth).map((node) => node.id))
  const selected = selectedId ? nodesById.get(selectedId) : undefined
  if (selected) {
    for (const id of [
      selected.id,
      ...selected.upstream,
      ...selected.downstream,
      ...selected.related,
    ])
      visible.add(id)
    // Keep containers visible when a deeply nested term is reached through search.
    for (const id of [...visible]) {
      let parentId = nodesById.get(id)?.parentId
      const visited = new Set<string>()
      while (parentId && !visited.has(parentId)) {
        visible.add(parentId)
        visited.add(parentId)
        parentId = nodesById.get(parentId)?.parentId
      }
    }
  }
  return exploreNodes.filter((node) => visible.has(node.id))
}

/** Exact edges only; useful for details, full disclosure, and graph validation. */
export function getVisibleConnections(nodes: ExploreNode[]): ExploreConnection[] {
  const visible = new Set(nodes.map((node) => node.id))
  return exploreConnections.filter((edge) => visible.has(edge.from) && visible.has(edge.to))
}

/**
 * Collapse a hidden node into its visible owner. Verification belongs to Harness,
 * never Final, so a failed check cannot be misrepresented as a delivered result.
 * Keep original ids so timeline highlights continue to address real connections.
 */
export function getDisplayedConnections(nodes: ExploreNode[]): ExploreConnection[] {
  const visible = new Set(nodes.map((node) => node.id))
  const representative = (id: string): string | undefined => {
    let cursor: string | undefined = id
    const visited = new Set<string>()
    while (cursor && !visited.has(cursor)) {
      if (visible.has(cursor)) return cursor
      visited.add(cursor)
      cursor = nodesById.get(cursor)?.parentId
    }
    return undefined
  }
  const displayed: ExploreConnection[] = []
  const seen = new Set<string>()
  // Prefer exact edges, so a visible concept's actual relationships remain labelled.
  const ordered = [...exploreConnections].sort(
    (a, b) =>
      Number(visible.has(b.from) && visible.has(b.to)) -
      Number(visible.has(a.from) && visible.has(a.to)),
  )
  for (const edge of ordered) {
    // A relation between two hidden internals is not automatically a relation
    // between their parent modules (e.g. a retrieval encoder is not the LLM).
    if (!visible.has(edge.from) && !visible.has(edge.to)) continue
    const from = representative(edge.from)
    const to = representative(edge.to)
    if (!from || !to || from === to) continue
    const key = `${from}:${to}:${edge.type}`
    if (seen.has(key)) continue
    seen.add(key)
    displayed.push({ ...edge, from, to })
  }
  return displayed
}

const searchable = exploreNodes.map((node) => ({
  node,
  title: `${node.id} ${node.label} ${node.chineseLabel}`.toLocaleLowerCase(),
  text: `${node.description} ${node.technicalDefinition} ${node.responsibility} ${node.confused}`.toLocaleLowerCase(),
}))

/** Names lead the results; explanatory text makes Chinese everyday queries useful. */
export function searchNodes(query: string): ExploreNode[] {
  const normalized = query.trim().toLocaleLowerCase()
  if (!normalized) return exploreNodes
  const terms = normalized.split(/\s+/)
  return searchable
    .filter(({ title, text }) => terms.every((term) => title.includes(term) || text.includes(term)))
    .map((entry) => ({
      ...entry,
      score:
        entry.node.id === normalized || entry.node.label.toLocaleLowerCase() === normalized
          ? 2
          : terms.every((term) => entry.title.includes(term))
            ? 1
            : 0,
    }))
    .sort((a, b) => b.score - a.score)
    .map(({ node }) => node)
}
