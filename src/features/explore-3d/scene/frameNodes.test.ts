import { describe, expect, it } from 'vitest'
import { PerspectiveCamera, Vector3 } from 'three'
import type { ExploreNode, Point3 } from '../types'
import { frameNodes } from './frameNodes'
import { simulatorGraph } from '../immersive/scenarios'
import { nodeVisualGrammar } from './visualGrammar'

function node(id: string, position: Point3, level: ExploreNode['level'] = 2): ExploreNode {
  return {
    id,
    position,
    level,
    label: id,
    chineseLabel: id,
    category: 'model',
    kind: 'satellite',
    description: '',
    technicalDefinition: '',
    responsibility: '',
    confused: '',
    upstream: [],
    downstream: [],
    related: [],
    lessonId: 'model',
  }
}

const nodes = [
  node('model', [0, 1.5, 0], 0),
  node('token', [-3.2, 2.5, -1.7]),
  node('attention', [3.5, 6.2, -1.1]),
  node('prediction', [-0.8, 2.5, 3.4]),
  node('unrelated', [90, 0, 0]),
]
const ids = ['model', 'token', 'attention', 'prediction']

describe('immersive module framing', () => {
  it('leaves existing camera behavior to the caller when no valid group was requested', () => {
    expect(frameNodes(nodes, undefined, 1.5)).toBeNull()
    expect(frameNodes(nodes, [], 1.5)).toBeNull()
    expect(frameNodes(nodes, ['missing'], 1.5)).toBeNull()
  })

  it('fits requested geometry and label margins in both desktop aspect ratios without moving the nodes', () => {
    const original = structuredClone(nodes)
    for (const aspect of [1.1, 1.9]) {
      const pose = frameNodes(nodes, ids, aspect)!
      const camera = new PerspectiveCamera(30, aspect, 0.1, 150)
      camera.position.set(...pose.position)
      camera.lookAt(new Vector3(...pose.target))
      camera.updateMatrixWorld()
      for (const participant of nodes.filter((item) => ids.includes(item.id))) {
        const radius = participant.level === 0 ? 1.65 : 1.05
        for (const x of [-radius, radius])
          for (const y of [-1.15, participant.level === 0 ? 2.9 : 2.1])
            for (const z of [-radius, radius]) {
              const projected = new Vector3(...participant.position)
                .add(new Vector3(x, y, z))
                .project(camera)
              expect(Math.abs(projected.x)).toBeLessThan(0.92)
              expect(Math.abs(projected.y)).toBeLessThan(0.92)
              expect(projected.z).toBeGreaterThan(-1)
              expect(projected.z).toBeLessThan(1)
            }
      }
    }
    expect(nodes).toEqual(original)
  })

  it('ignores distant unrelated nodes and repeated or unknown ids', () => {
    expect(frameNodes(nodes, [...ids, 'model', 'missing'], 1.5)).toEqual(
      frameNodes(nodes.slice(0, -1), ids, 1.5),
    )
  })

  it('fits the actual desktop simulator closer while keeping every scaled node and label extent visible', () => {
    const participants = simulatorGraph.nodes
    const allIds = participants.map((item) => item.id)
    const original = structuredClone(participants)
    for (const aspect of [1.6, 2]) {
      const precise = frameNodes(participants, allIds, aspect, true)!
      const legacy = frameNodes(participants, allIds, aspect)!
      const distance = (pose: typeof precise) =>
        new Vector3(...pose.position).distanceTo(new Vector3(...pose.target))
      expect(distance(precise)).toBeLessThan(distance(legacy) * 0.94)
      const camera = new PerspectiveCamera(30, aspect, 0.1, 150)
      camera.position.set(...precise.position)
      camera.lookAt(new Vector3(...precise.target))
      camera.updateMatrixWorld()
      for (const participant of participants) {
        const scale = nodeVisualGrammar(participant).scale
        const radius = (participant.level === 0 ? 1.65 : 1.05) * scale
        for (const x of [-radius, radius])
          for (const y of [-1.15 * scale, (participant.level === 0 ? 2.9 : 2.1) * scale])
            for (const z of [-radius, radius]) {
              const projected = new Vector3(...participant.position)
                .add(new Vector3(x, y, z))
                .project(camera)
              expect(Math.abs(projected.x), `${participant.id} horizontal clip`).toBeLessThan(0.91)
              expect(Math.abs(projected.y), `${participant.id} vertical clip`).toBeLessThan(0.91)
            }
      }
    }
    expect(participants).toEqual(original)
  })
})
