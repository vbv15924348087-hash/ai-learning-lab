import { describe, expect, it } from 'vitest'
import type { CameraPose } from '../types'
import { manualPoseChanged } from './manualPose'

const overview: CameraPose = { position: [12.53, 16.68, 23.12], target: [1.4, 2.3, -0.4] }

describe('manual camera edits', () => {
  it('does not persist a node click or an end event without a started gesture', () => {
    const clickEnd: CameraPose = { position: [...overview.position], target: [...overview.target] }
    expect(manualPoseChanged(overview, clickEnd)).toBe(false)
    expect(manualPoseChanged(null, clickEnd)).toBe(false)
  })

  it('ignores tiny floating point adjustments from OrbitControls.update()', () => {
    expect(manualPoseChanged(overview, {
      position: [12.5300001, 16.6799999, 23.12],
      target: [1.4000001, 2.3, -0.4],
    })).toBe(false)
  })

  it('persists orbit, zoom and pan changes, including a target-only change', () => {
    expect(manualPoseChanged(overview, { ...overview, position: [13, 16.68, 23.12] })).toBe(true)
    expect(manualPoseChanged(overview, { ...overview, position: [12, 16, 22] })).toBe(true)
    expect(manualPoseChanged(overview, { ...overview, target: [1.5, 2.3, -0.4] })).toBe(true)
  })
})
