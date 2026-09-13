import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useImmersiveController } from './useImmersiveController'
import { getTaskScenario } from './scenarios'
import type { CameraPose, ExploreSceneProps } from '../types'

const initial = { selectedId: null, depth: 0, mode: 'free', taskStep: 0 } as const
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('simulator controller invariants', () => {
  it('preserves inherited and manually selected disclosure levels across all camera gestures until Reset', () => {
    const { result } = renderHook(() => useImmersiveController({ ...initial, depth: 2 }, false))
    const gestures: CameraPose[] = [
      { position: [25, 18, 12], target: [1, 2, 0] },
      { position: [26, 18, 12], target: [2, 2, 0] },
      { position: [7, 8, 10], target: [0, 1, 0] },
    ]
    const savePose: ExploreSceneProps['onCameraChange'] = result.current.changeCamera
    act(() => savePose(gestures[0], 0))
    expect(result.current.depth).toBe(2)
    for (const depth of [0, 1, 2] as const) {
      act(() => result.current.changeDepth(depth))
      const visibleNodes = result.current.graph.nodes
      for (const [index, pose] of gestures.entries()) {
        // Old renderers passed zoom-derived depth on every gesture. Even that
        // obsolete hint must not replace an explicitly selected level.
        act(() => savePose(pose, index === 2 ? 2 : 0))
        expect(result.current.depth).toBe(depth)
        expect(result.current.graph.nodes).toBe(visibleNodes)
        expect(result.current.cameraPose).toEqual(pose)
      }
    }
    act(() => result.current.reset())
    expect(result.current.depth).toBe(0)
    expect(result.current.cameraPose).toBeUndefined()
    expect(result.current.graph.nodes).toHaveLength(6)
    act(() => savePose(gestures[2], 2))
    expect(result.current.depth).toBe(0)
  })

  it('keeps graph and scene callbacks stable across drawer and explanation changes', () => {
    const { result } = renderHook(() => useImmersiveController(initial, false))
    expect(result.current.graph.nodes).toHaveLength(6)
    act(() => result.current.selectTask('simple'))
    const before = result.current
    act(() => {
      result.current.setNavOpen(true)
      result.current.setDetailOpen(true)
      result.current.setLevel('technical')
    })
    const after = result.current
    expect(after.graph).toBe(before.graph)
    expect(after.relatedIds).toBe(before.relatedIds)
    expect(after.pathNodeIds).toBe(before.pathNodeIds)
    expect(after.edgeStates).toBe(before.edgeStates)
    expect(after.selectEdge).toBe(before.selectEdge)
    expect(after.selectNode).toBe(before.selectNode)
    expect(after.changeCamera).toBe(before.changeCamera)
    expect(after.changeDepth).toBe(before.changeDepth)
    expect(after.frameNodeIds).toEqual(after.graph.nodes.map((node) => node.id))
    act(() => result.current.selectTask('research'))
    expect(result.current.graph).toBe(before.graph)
  })

  it('ignores premature approvals, clears approval on restart and task changes', () => {
    const { result } = renderHook(() => useImmersiveController(initial, false))
    act(() => result.current.selectTask('high-risk'))
    act(() => result.current.decideApproval('approve'))
    expect(result.current.approvalStatus).toBe('pending')
    act(() => result.current.jump(1000))
    expect(result.current.waitingApproval).toBe(true)
    act(() => result.current.decideApproval('approve'))
    expect(result.current.step.nodeId).toBe('database')
    expect(result.current.approvalStatus).toBe('approved')
    act(() => result.current.restartTask())
    expect(result.current.approvalStatus).toBe('pending')
    act(() => result.current.jump(1000))
    act(() => result.current.decideApproval('reject'))
    expect(result.current.step.outcome).toBe('fail')
    expect(result.current.packetType).toBe('fail')
    act(() => {
      result.current.jump(1000)
      result.current.togglePlayback()
    })
    expect(result.current.step.nodeId).toBe('approval')
    expect(result.current.isPlaying).toBe(false)
    act(() => result.current.selectTask('simple'))
    act(() => result.current.selectTask('high-risk'))
    expect(result.current.approvalStatus).toBe('pending')
  })

  it('plays comparison B using the same approval gate as single-task playback', () => {
    const { result } = renderHook(() => useImmersiveController(initial, false))
    act(() => result.current.setCompareTaskIds(['simple', 'high-risk']))
    act(() => result.current.changeView('compare'))
    expect(result.current.taskScenario.id).toBe('high-risk')
    act(() => result.current.jump(1000))
    expect(result.current.step.nodeId).toBe('approval')
    expect(result.current.waitingApproval).toBe(true)
    act(() => result.current.decideApproval('approve'))
    act(() => result.current.changeView('task'))
    expect(result.current.taskScenario.id).toBe('simple')
    act(() => result.current.changeView('compare'))
    expect(result.current.approvalStatus).toBe('pending')
  })

  it('leaves no timers at approval or in reduced motion and emits PASS only after checking', () => {
    vi.useFakeTimers()
    const { result, unmount } = renderHook(() => useImmersiveController(initial, false))
    act(() => result.current.selectTask('high-risk'))
    const gate = getTaskScenario('high-risk').steps.findIndex((step) => step.gate === 'approval')
    act(() => result.current.jump(gate - 1))
    expect(result.current.packetType).toBe('verification')
    act(() => result.current.togglePlayback())
    act(() => vi.advanceTimersByTime(2400))
    expect(result.current.waitingApproval).toBe(true)
    expect(result.current.packetType).toBe('verification')
    expect(vi.getTimerCount()).toBe(0)
    act(() => result.current.decideApproval('approve'))
    act(() =>
      result.current.jump(
        getTaskScenario('high-risk').steps.findIndex((step) => step.outcome === 'pass'),
      ),
    )
    expect(result.current.packetType).toBe('pass')
    unmount()
    const manual = renderHook(() => useImmersiveController(initial, true))
    act(() => manual.result.current.selectTask('research'))
    act(() => manual.result.current.togglePlayback())
    expect(manual.result.current.isPlaying).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
  })
})
