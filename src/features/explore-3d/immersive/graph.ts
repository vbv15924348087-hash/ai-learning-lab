import { exploreConnections, exploreNodes } from '../data'
import { getDisplayedConnections } from '../graph'
import type { ExploreConnection, ExploreNode } from '../types'
import { moduleInteriors } from './interiors'
import type { ModuleId, RelationDirection } from './types'

type Graph = { nodes: ExploreNode[]; connections: ExploreConnection[] }

/** Directional views contain literal edges, never collapsed or inferred arrows. */
export function getRelationGraph(nodeId: string, direction: RelationDirection): Graph {
  const selected = exploreNodes.find((node) => node.id === nodeId)
  if (!selected) return { nodes: [], connections: [] }
  const incident = exploreConnections.filter((edge) =>
    direction === 'upstream'
      ? edge.to === nodeId
      : direction === 'downstream'
        ? edge.from === nodeId
        : edge.from === nodeId || edge.to === nodeId,
  )
  const ids = new Set([nodeId, ...incident.flatMap((edge) => [edge.from, edge.to])])
  if (direction === 'all') for (const id of selected.related) ids.add(id)
  return {
    nodes: exploreNodes.filter((node) => ids.has(node.id)),
    // Related concepts may have real links to one another, but "related" alone
    // is not a claim of data flow, control flow, or an execution dependency.
    connections:
      direction === 'all'
        ? exploreConnections.filter((edge) => ids.has(edge.from) && ids.has(edge.to))
        : incident,
  }
}

/** Reuse the established overview in X-Ray; drilling contains only this module. */
export function getInteriorGraph(moduleId: ModuleId, xray: boolean): Graph {
  const interior = moduleInteriors[moduleId]
  const exterior = exploreNodes.filter((node) => (xray ? node.level === 0 : node.id === moduleId))
  const nodes = [...exterior, ...interior.nodes]
  const visible = new Set(nodes.map((node) => node.id))
  return {
    nodes,
    connections: [
      ...(xray ? getDisplayedConnections(exterior) : []),
      ...interior.connections,
    ].filter((edge) => visible.has(edge.from) && visible.has(edge.to)),
  }
}
