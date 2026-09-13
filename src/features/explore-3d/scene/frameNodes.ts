import { Vector3 } from 'three'
import type { CameraPose, ExploreNode } from '../types'
import { nodeVisualGrammar } from './visualGrammar'

function projectedNodeFit(participants: ExploreNode[], aspect: number): CameraPose {
  const direction = new Vector3(13, 13, 17).normalize()
  const right = new Vector3(0, 1, 0).cross(direction).normalize()
  const up = direction.clone().cross(right).normalize()
  // Only actual node extents constrain the camera. A box around the whole installation
  // invents far-away empty corners and makes sparse, diagonal maps appear too small.
  const points: Vector3[] = []
  const min = new Vector3(Infinity, Infinity, Infinity)
  const max = new Vector3(-Infinity, -Infinity, -Infinity)
  for (const node of participants) {
    const scale = nodeVisualGrammar(node).scale
    const radius = (node.level === 0 ? 1.65 : 1.05) * scale
    const top = (node.level === 0 ? 2.9 : 2.1) * scale
    for (const x of [-radius, radius])
      for (const y of [-1.15 * scale, top])
        for (const z of [-radius, radius]) {
          const point = new Vector3(...node.position).add(new Vector3(x, y, z))
          const projected = new Vector3(point.dot(right), point.dot(up), point.dot(direction))
          min.min(projected)
          max.max(projected)
          points.push(point)
        }
  }
  const center = min.clone().add(max).multiplyScalar(0.5)
  const target = right
    .clone()
    .multiplyScalar(center.x)
    .addScaledVector(up, center.y)
    .addScaledVector(direction, center.z)
  const halfFov = Math.tan(Math.PI / 12)
  let distance = 12
  for (const point of points) {
    const relative = point.clone().sub(target)
    const depth = relative.dot(direction)
    distance = Math.max(
      distance,
      Math.abs(relative.dot(right)) / (halfFov * Math.max(aspect, 0.8) * 0.89) + depth,
      Math.abs(relative.dot(up)) / (halfFov * 0.89) + depth,
    )
  }
  return {
    position: target
      .clone()
      .addScaledVector(direction, Math.min(distance, 47))
      .toArray() as CameraPose['position'],
    target: target.toArray() as CameraPose['target'],
  }
}

/** Fit a requested relation or internal-module group without moving its world coordinates. */
export function frameNodes(
  nodes: ExploreNode[],
  ids: string[] | undefined,
  aspect: number,
  precise = false,
): CameraPose | null {
  if (!ids?.length) return null
  const included = new Set(ids)
  const participants = nodes.filter((node) => included.has(node.id))
  if (!participants.length) return null
  if (precise) return projectedNodeFit(participants, aspect)
  const min = new Vector3(Infinity, Infinity, Infinity)
  const max = new Vector3(-Infinity, -Infinity, -Infinity)
  for (const node of participants) {
    const radius = node.level === 0 ? 1.65 : 1.05
    min.min(
      new Vector3(node.position[0] - radius, node.position[1] - 1.15, node.position[2] - radius),
    )
    max.max(
      new Vector3(
        node.position[0] + radius,
        node.position[1] + (node.level === 0 ? 2.9 : 2.1),
        node.position[2] + radius,
      ),
    )
  }
  const target = min.clone().add(max).multiplyScalar(0.5)
  const direction = new Vector3(13, 13, 17).normalize()
  const right = new Vector3(0, 1, 0).cross(direction).normalize()
  const up = direction.clone().cross(right).normalize()
  const halfFov = Math.tan(Math.PI / 12)
  let distance = 12
  for (const x of [min.x, max.x])
    for (const y of [min.y, max.y])
      for (const z of [min.z, max.z]) {
        const relative = new Vector3(x, y, z).sub(target)
        const depth = relative.dot(direction)
        distance = Math.max(
          distance,
          Math.abs(relative.dot(right)) / (halfFov * Math.max(aspect, 0.8) * 0.89) + depth,
          Math.abs(relative.dot(up)) / (halfFov * 0.89) + depth,
        )
      }
  return {
    position: target
      .clone()
      .addScaledVector(direction, Math.min(distance, 47))
      .toArray() as CameraPose['position'],
    target: target.toArray() as CameraPose['target'],
  }
}
