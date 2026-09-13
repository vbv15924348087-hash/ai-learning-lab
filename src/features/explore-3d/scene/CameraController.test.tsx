import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PerspectiveCamera, Vector3 } from 'three'
import type { ExploreSceneProps } from '../types'
import { CameraController } from './CameraController'

const rig = {
  camera: new PerspectiveCamera(),
  size: { width: 1280, height: 720 },
  invalidate: vi.fn(),
  orbit: { target: new Vector3(), update: vi.fn() },
}

vi.mock('@react-three/fiber', () => ({
  useThree: () => rig,
  useFrame: vi.fn(),
}))
vi.mock('@react-three/drei', async () => {
  const { forwardRef, useImperativeHandle } = await import('react')
  type OrbitProps = { onStart: () => void; onChange: () => void; onEnd: () => void }
  return {
    PerspectiveCamera: () => null,
    OrbitControls: forwardRef(function TestOrbitControls(props: OrbitProps, ref) {
      useImperativeHandle(ref, () => rig.orbit)
      return (
        <button
          onPointerDown={props.onStart}
          onPointerMove={props.onChange}
          onPointerUp={props.onEnd}
        >
          相机手势
        </button>
      )
    }),
  }
})

beforeEach(() => {
  vi.clearAllMocks()
  rig.camera.position.set(12, 16, 22)
  rig.orbit.target.set(1.4, 2.3, -0.4)
})
afterEach(cleanup)

function openCamera() {
  const onCameraChange = vi.fn()
  const onDepthChange = vi.fn()
  const props: ExploreSceneProps = {
    nodes: [],
    connections: [],
    selectedId: null,
    focusedId: null,
    relatedIds: [],
    activeEdgeIds: [],
    playing: false,
    reducedMotion: true,
    enabled: true,
    resetKey: 0,
    learnedNodeIds: [],
    onSelect: vi.fn(),
    onFailure: vi.fn(),
    onCameraChange,
    onDepthChange,
  }
  render(<CameraController {...props} onInteraction={vi.fn()} />)
  return { onCameraChange, onDepthChange }
}

describe('camera gesture disclosure boundary', () => {
  it.each(['orbit', 'pan', 'zoom'] as const)(
    'saves a %s pose without emitting a distance-derived depth',
    (gesture) => {
      const { onCameraChange, onDepthChange } = openCamera()
      const control = screen.getByRole('button', { name: '相机手势' })
      fireEvent.pointerDown(control)
      act(() => {
        if (gesture === 'orbit') rig.camera.position.set(25, 18, 12)
        if (gesture === 'pan') {
          rig.camera.position.x += 1
          rig.orbit.target.x += 1
        }
        if (gesture === 'zoom')
          rig.camera.position.copy(rig.orbit.target).add(new Vector3(0, 0, 12))
      })
      fireEvent.pointerMove(control)
      fireEvent.pointerUp(control)
      expect(onCameraChange).toHaveBeenCalledExactlyOnceWith({
        position: rig.camera.position.toArray(),
        target: rig.orbit.target.toArray(),
      })
      expect(onDepthChange).not.toHaveBeenCalled()
    },
  )

  it('does not save a pose or change disclosure on a node click without movement', () => {
    const { onCameraChange, onDepthChange } = openCamera()
    const control = screen.getByRole('button', { name: '相机手势' })
    fireEvent.pointerDown(control)
    fireEvent.pointerUp(control)
    expect(onCameraChange).not.toHaveBeenCalled()
    expect(onDepthChange).not.toHaveBeenCalled()
  })
})
