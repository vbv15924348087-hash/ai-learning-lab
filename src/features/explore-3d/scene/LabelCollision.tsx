import { useEffect, useMemo, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import type { ExploreNode } from '../types'
import { labelPriority } from './labelPriority'
import { nodeVisualGrammar } from './visualGrammar'

export type LabelElements = Map<string, HTMLButtonElement>
type LabelBox = { left: number; right: number; top: number; bottom: number }
const SHIFT_OPTIONS = [
  [0, 0],
  [0, -42],
  [0, 42],
  [-70, 0],
  [70, 0],
  [0, -80],
  [0, 80],
  [-110, 0],
  [110, 0],
  [-70, -42],
  [70, -42],
  [-70, 42],
  [70, 42],
] as const
const NO_SHIFT = [[0, 0]] as const

/** Project label anchors on rendered frames and resolve overlap without React state updates. */
export function LabelCollision({
  nodes,
  selectedId,
  relatedIds,
  frameNodeIds,
  pathNodeIds,
  elements,
  immersive = false,
}: {
  nodes: ExploreNode[]
  selectedId: string | null
  relatedIds: string[]
  frameNodeIds?: string[]
  pathNodeIds?: string[]
  elements: MutableRefObject<LabelElements>
  immersive?: boolean
}) {
  const projection = useMemo(() => new Vector3(), [])
  const related = useMemo(() => new Set(relatedIds), [relatedIds])
  const framed = useMemo(() => (frameNodeIds ? new Set(frameNodeIds) : undefined), [frameNodeIds])
  const participating = useMemo(
    () => (pathNodeIds ? new Set(pathNodeIds) : undefined),
    [pathNodeIds],
  )
  const ordered = useMemo(
    () =>
      [...nodes].sort((a, b) => {
        return (
          labelPriority(a, selectedId, related, framed, participating) -
          labelPriority(b, selectedId, related, framed, participating)
        )
      }),
    [nodes, selectedId, related, framed, participating],
  )
  const boxes = useMemo(
    () => nodes.map((): LabelBox => ({ left: 0, right: 0, top: 0, bottom: 0 })),
    [nodes],
  )
  const measurements = useMemo(
    () => new Map<string, { element: HTMLButtonElement; width: number; height: number }>(),
    [],
  )
  useEffect(() => {
    for (const id of measurements.keys()) if (!elements.current.has(id)) measurements.delete(id)
  }, [nodes, elements, measurements])

  useFrame(({ camera, size }) => {
    let occupiedCount = 0
    for (const node of ordered) {
      const button = elements.current.get(node.id)
      if (!button) continue
      const heightAbove =
        (node.level === 0 ? (node.kind === 'model' ? 2.1 : 1.7) : 1.24) *
        (immersive ? nodeVisualGrammar(node).scale : 1)
      projection
        .set(node.position[0], node.position[1] + heightAbove, node.position[2])
        .project(camera)
      const x = (projection.x * 0.5 + 0.5) * size.width
      const y = (-projection.y * 0.5 + 0.5) * size.height
      let measure = measurements.get(node.id)
      if (!measure || measure.element !== button) {
        measure = {
          element: button,
          width: button.offsetWidth || 110,
          height: button.offsetHeight || 43,
        }
        measurements.set(node.id, measure)
      }
      const { width, height } = measure
      const shifts =
        node.level === 0 || node.id === selectedId || related.has(node.id) || framed?.has(node.id)
          ? SHIFT_OPTIONS
          : NO_SHIFT
      let chosen: readonly [number, number] | undefined
      if (projection.z < 1 && projection.z > -1) {
        for (const shift of shifts) {
          const box = boxes[occupiedCount]
          box.left = x + shift[0] - width / 2 - 4
          box.right = x + shift[0] + width / 2 + 4
          box.top = y + shift[1] - height / 2 - 4
          box.bottom = y + shift[1] + height / 2 + 4
          if (
            box.left < 4 ||
            box.right > size.width - 4 ||
            box.top < 4 ||
            box.bottom > size.height - 4
          )
            continue
          let collides = false
          for (let index = 0; index < occupiedCount; index += 1) {
            const other = boxes[index]
            if (
              box.left < other.right &&
              box.right > other.left &&
              box.top < other.bottom &&
              box.bottom > other.top
            ) {
              collides = true
              break
            }
          }
          if (collides) continue
          chosen = shift
          occupiedCount += 1
          break
        }
      }
      const visibility = chosen === undefined ? 'hidden' : 'visible'
      if (button.style.visibility !== visibility) button.style.visibility = visibility
      const transform = `translate(${chosen?.[0] ?? 0}px, ${chosen?.[1] ?? 0}px)`
      if (button.style.transform !== transform) button.style.transform = transform
    }
  })
  return null
}
