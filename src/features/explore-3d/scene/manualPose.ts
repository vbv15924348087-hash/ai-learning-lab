import type { CameraPose, Point3 } from '../types'

/** A pointer down/up click is not a camera edit and must not compete with node selection. */
export function manualPoseChanged(start: CameraPose | null, end: CameraPose): boolean {
  if (!start) return false
  const moved = (from: Point3, to: Point3) =>
    (from[0] - to[0]) ** 2 + (from[1] - to[1]) ** 2 + (from[2] - to[2]) ** 2 > 0.001 ** 2
  return moved(start.position, end.position) || moved(start.target, end.target)
}
