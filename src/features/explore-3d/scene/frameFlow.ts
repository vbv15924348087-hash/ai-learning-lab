import { Vector3 } from 'three'
import type { CameraPose, ExploreConnection, ExploreNode } from '../types'

/** Frame the endpoints of the current teaching step, including room for their labels and curved return lane. */
export function frameFlow(nodes: ExploreNode[], connections: ExploreConnection[], edgeIds: string[], selectedId: string | null, aspect: number): CameraPose | null {
  const edges = connections.filter((edge) => edgeIds.includes(edge.id))
  if (!edges.length) return null
  const ids = new Set(edges.flatMap((edge) => [edge.from, edge.to]))
  if (selectedId) ids.add(selectedId)
  const participants = nodes.filter((node) => ids.has(node.id))
  if (participants.length < 2) return null
  const points = participants.flatMap((node) => [
    new Vector3(node.position[0] - 1.6, node.position[1] - 1.1, node.position[2] - 1.6),
    new Vector3(node.position[0] + 1.6, node.position[1] + 2.8, node.position[2] + 1.6),
  ])
  if (edges.some((edge) => edge.type === 'loop')) {
    const average = participants.reduce((sum, node) => sum.add(new Vector3(...node.position)), new Vector3()).divideScalar(participants.length)
    points.push(average.add(new Vector3(0, 2.6, 3.2)))
  }
  const min = points.reduce((bound, point) => bound.min(point), new Vector3(Infinity, Infinity, Infinity))
  const max = points.reduce((bound, point) => bound.max(point), new Vector3(-Infinity, -Infinity, -Infinity))
  const target = min.clone().add(max).multiplyScalar(0.5)
  const direction = new Vector3(13, 13, 17).normalize()
  const right = new Vector3(0, 1, 0).cross(direction).normalize()
  const up = direction.clone().cross(right).normalize()
  const halfFovTangent = Math.tan(Math.PI / 12) // 30° vertical field of view.
  let distance = 18
  for (const x of [min.x, max.x]) for (const y of [min.y, max.y]) for (const z of [min.z, max.z]) {
    const relative = new Vector3(x, y, z).sub(target)
    const depth = relative.dot(direction)
    distance = Math.max(distance,
      Math.abs(relative.dot(right)) / (halfFovTangent * Math.max(aspect, 0.8) * 0.82) + depth,
      Math.abs(relative.dot(up)) / (halfFovTangent * 0.82) + depth)
  }
  const position = target.clone().addScaledVector(direction, Math.min(distance, 47))
  return { position: position.toArray() as CameraPose['position'], target: target.toArray() as CameraPose['target'] }
}
