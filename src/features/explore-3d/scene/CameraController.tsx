import { useEffect, useMemo, useRef, type ComponentRef } from 'react'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera as ThreePerspectiveCamera, Spherical, Vector3 } from 'three'
import type { CameraPose, ExploreDepth, ExploreSceneProps } from '../types'
import { frameFlow } from './frameFlow'
import { frameNodes } from './frameNodes'
import { manualPoseChanged } from './manualPose'

const OVERVIEW: CameraPose = { position: [12, 16, 22], target: [1.4, 2.3, -0.4] }
const FOCUS_OFFSET = new Vector3(13, 13, 17)
const CAMERA_LIMITS = {
  minDistance: 9,
  maxDistance: 48,
  minPolarAngle: 0.32,
  maxPolarAngle: 1.32,
  minAzimuthAngle: -0.9,
  maxAzimuthAngle: 1.15,
}
const PAN_MIN = new Vector3(-12, -1.5, -8)
const PAN_MAX = new Vector3(12, 5, 9)
type Controls = ComponentRef<typeof OrbitControls>
const poseKey = (pose?: CameraPose) =>
  pose ? [...pose.position, ...pose.target].map((value) => value.toFixed(2)).join(',') : ''

export function CameraController({
  nodes,
  connections,
  activeEdgeIds,
  immersive = false,
  frameNodeIds,
  focusedId,
  resetKey,
  cameraPose,
  reducedMotion,
  enabled,
  onCameraChange,
  onDepthChange,
  onInteraction,
}: ExploreSceneProps & { onInteraction: (active: boolean) => void }) {
  const controls = useRef<Controls>(null)
  const { camera, invalidate, size } = useThree()
  const initial = useRef(cameraPose ?? OVERVIEW)
  const firstMount = useRef(true)
  const lastReset = useRef(resetKey)
  const lastFocus = useRef<string | null>(null)
  const lastPoseKey = useRef(poseKey(cameraPose))
  const lastFlowKey = useRef('')
  const lastFrameKey = useRef('')
  const lastAspect = useRef(0)
  const target = useMemo(() => new Vector3(...initial.current.target), [])
  const goalPosition = useRef(new Vector3(...initial.current.position))
  const goalTarget = useRef(new Vector3(...initial.current.target))
  const panBefore = useMemo(() => new Vector3(), [])
  const panDelta = useMemo(() => new Vector3(), [])
  const tweening = useRef(false)
  const manualStart = useRef<CameraPose | null>(null)
  const latest = useRef({ enabled, reducedMotion, onCameraChange, onDepthChange, onInteraction })
  const focus = nodes.find((node) => node.id === focusedId)
  const focusX = focus?.position[0]
  const focusY = focus?.position[1]
  const focusZ = focus?.position[2]

  useEffect(() => {
    latest.current = { enabled, reducedMotion, onCameraChange, onDepthChange, onInteraction }
  }, [enabled, reducedMotion, onCameraChange, onDepthChange, onInteraction])

  useEffect(() => {
    // SceneCanvas starts with its shared orthographic camera. Wait for this scene's
    // perspective camera to become the R3F default before applying a restored focus.
    if (!(camera instanceof ThreePerspectiveCamera)) return
    // Frame the entire installation across both shallow task stages and taller free-explore stages.
    const aspect = size.width / Math.max(size.height, 1)
    const fit = Math.max(1, 1.5 / aspect)
    const changedAspect = Math.abs(aspect - lastAspect.current) > 0.02
    lastAspect.current = aspect
    const shouldReset = lastReset.current !== resetKey
    if (shouldReset) lastReset.current = resetKey
    const changedFocus = lastFocus.current !== focusedId
    lastFocus.current = focusedId
    const nextPoseKey = poseKey(cameraPose)
    const changedPose = nextPoseKey !== lastPoseKey.current
    lastPoseKey.current = nextPoseKey
    const flowKey = activeEdgeIds.join(',')
    // Simulator playback highlights a step without moving the exhibit under the user.
    const changedFlow = !immersive && flowKey !== lastFlowKey.current
    lastFlowKey.current = flowKey
    const frameKey = frameNodeIds?.join(',') ?? ''
    const changedFrame = frameKey !== lastFrameKey.current
    lastFrameKey.current = frameKey
    if (
      !firstMount.current &&
      !shouldReset &&
      !changedFocus &&
      !changedPose &&
      !changedFlow &&
      !changedAspect &&
      !changedFrame
    )
      return
    const flowPose = immersive
      ? null
      : frameFlow(nodes, connections, activeEdgeIds, focusedId, aspect)
    const groupPose = frameNodes(nodes, frameNodeIds, aspect, immersive && nodes.length > 20)

    if (
      cameraPose &&
      !shouldReset &&
      !changedFrame &&
      (firstMount.current || (changedPose && !changedFocus))
    ) {
      goalPosition.current.set(...cameraPose.position)
      goalTarget.current.set(...cameraPose.target)
    } else if (groupPose && (!shouldReset || immersive)) {
      goalPosition.current.set(...groupPose.position)
      goalTarget.current.set(...groupPose.target)
    } else if (flowPose && !shouldReset) {
      goalPosition.current.set(...flowPose.position)
      goalTarget.current.set(...flowPose.target)
    } else if (focusedId && focusX !== undefined && !shouldReset) {
      goalTarget.current.set(focusX, (focusY ?? 0) + 0.65, focusZ ?? 0)
      // Core focus keeps Context → Model → Harness in the frame. Smaller concepts
      // can move a little closer while retaining their immediate neighbouring modules.
      const focusScale = (focus?.level === 0 ? 1 : 0.84) * Math.max(1, 1.55 / aspect)
      goalPosition.current.copy(FOCUS_OFFSET).multiplyScalar(focusScale).add(goalTarget.current)
    } else {
      goalTarget.current.set(...OVERVIEW.target)
      goalPosition.current
        .set(...OVERVIEW.position)
        .sub(goalTarget.current)
        .multiplyScalar(fit * 1.05)
        .add(goalTarget.current)
    }
    // Clamp the animation's destination too. Otherwise a high satellite outside
    // the pan limit would keep chasing an unreachable target on every frame.
    const offset = goalPosition.current.clone().sub(goalTarget.current)
    goalTarget.current.clamp(PAN_MIN, PAN_MAX)
    const spherical = new Spherical().setFromVector3(offset)
    spherical.radius = Math.max(
      CAMERA_LIMITS.minDistance,
      Math.min(CAMERA_LIMITS.maxDistance, spherical.radius),
    )
    spherical.phi = Math.max(
      CAMERA_LIMITS.minPolarAngle,
      Math.min(CAMERA_LIMITS.maxPolarAngle, spherical.phi),
    )
    spherical.theta = Math.max(
      CAMERA_LIMITS.minAzimuthAngle,
      Math.min(CAMERA_LIMITS.maxAzimuthAngle, spherical.theta),
    )
    goalPosition.current.setFromSpherical(spherical).add(goalTarget.current)
    const immediate = firstMount.current || reducedMotion
    firstMount.current = false
    tweening.current = !immediate
    if (immediate && controls.current) {
      camera.position.copy(goalPosition.current)
      controls.current.target.copy(goalTarget.current)
      controls.current.update()
    }
    onInteraction(!immediate)
    invalidate()
  }, [
    camera,
    cameraPose,
    nodes,
    connections,
    activeEdgeIds,
    immersive,
    frameNodeIds,
    focusedId,
    focusX,
    focusY,
    focusZ,
    focus?.level,
    resetKey,
    reducedMotion,
    invalidate,
    size.width,
    size.height,
    onInteraction,
  ])

  useEffect(() => {
    if (enabled) invalidate()
  }, [enabled, invalidate])

  useFrame((state, delta) => {
    if (!latest.current.enabled || !tweening.current || !controls.current) return
    const factor = latest.current.reducedMotion ? 1 : 1 - Math.exp(-Math.min(delta, 0.05) * 7)
    camera.position.lerp(goalPosition.current, factor)
    controls.current.target.lerp(goalTarget.current, factor)
    controls.current.update()
    if (
      camera.position.distanceToSquared(goalPosition.current) < 0.0008 &&
      controls.current.target.distanceToSquared(goalTarget.current) < 0.0008
    ) {
      camera.position.copy(goalPosition.current)
      controls.current.target.copy(goalTarget.current)
      controls.current.update()
      tweening.current = false
      latest.current.onInteraction(false)
    } else state.invalidate()
  })

  const constrainPan = () => {
    const orbit = controls.current
    if (!orbit) return
    // Keep pan inside the exhibit. Preserve the current view direction when clamping its target.
    panBefore.copy(orbit.target)
    orbit.target.clamp(PAN_MIN, PAN_MAX)
    camera.position.add(panDelta.subVectors(orbit.target, panBefore))
  }

  const finishManual = () => {
    const orbit = controls.current
    if (!orbit) return
    constrainPan()
    orbit.update()
    const pose: CameraPose = {
      position: camera.position.toArray() as CameraPose['position'],
      target: orbit.target.toArray() as CameraPose['target'],
    }
    const changed = manualPoseChanged(manualStart.current, pose)
    manualStart.current = null
    latest.current.onInteraction(false)
    invalidate()
    if (!changed) return
    const distance = camera.position.distanceTo(orbit.target)
    const depth: ExploreDepth = distance < 16 ? 2 : distance < 23 ? 1 : 0
    lastPoseKey.current = poseKey(pose)
    latest.current.onCameraChange(pose, depth)
  }

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={initial.current.position}
        fov={30}
        near={0.1}
        far={150}
      />
      <OrbitControls
        ref={controls}
        target={target}
        enabled={enabled}
        {...CAMERA_LIMITS}
        enableDamping={false}
        enablePan
        panSpeed={0.45}
        rotateSpeed={0.45}
        zoomSpeed={0.6}
        onStart={() => {
          tweening.current = false
          manualStart.current = controls.current
            ? {
                position: camera.position.toArray() as CameraPose['position'],
                target: controls.current.target.toArray() as CameraPose['target'],
              }
            : null
          latest.current.onInteraction(true)
        }}
        onChange={constrainPan}
        onEnd={finishManual}
      />
    </>
  )
}
