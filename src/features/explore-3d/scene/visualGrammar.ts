import type { ExploreNode } from '../types'

export type NodeVisualTier = 'S' | 'A' | 'B' | 'C'
export type NodeVisualType =
  | 'core-model'
  | 'runtime-platform'
  | 'container'
  | 'loop'
  | 'funnel'
  | 'storage'
  | 'scanner'
  | 'gate'
  | 'connector'
  | 'tool'

/** One shared scale contract for geometry, labels, and edge endpoints. */
export function nodeVisualGrammar(node: Pick<ExploreNode, 'kind' | 'id' | 'level'>) {
  let type: NodeVisualType = 'tool'
  let tier: NodeVisualTier = 'C'
  let scale = 0.8
  if (node.kind === 'model') {
    type = 'core-model'
    tier = 'S'
    scale = 1.38
  } else if (node.kind === 'harness') {
    type = 'runtime-platform'
    tier = 'S'
    scale = 1.23
  } else if (node.kind === 'context') {
    type = 'container'
    tier = 'A'
    scale = 1.12
  } else if (node.id === 'loop') {
    type = 'loop'
    tier = 'A'
    scale = 1.2
  } else if (node.kind === 'rag') {
    type = 'funnel'
    tier = 'B'
    scale = 1
  } else if (node.kind === 'memory' || node.id === 'state' || node.id === 'database') {
    type = 'storage'
    tier = node.id === 'database' ? 'C' : 'B'
    scale = node.id === 'database' ? 0.8 : 0.95
  } else if (node.kind === 'check') {
    type = 'scanner'
    tier = 'B'
    scale = 1
  } else if (node.kind === 'gate') {
    type = 'gate'
    tier = 'B'
    scale = 0.98
  } else if (node.id === 'mcp') {
    type = 'connector'
    tier = 'B'
    scale = 1
  } else if (node.level === 0) scale = 1
  return { type, tier, scale }
}
