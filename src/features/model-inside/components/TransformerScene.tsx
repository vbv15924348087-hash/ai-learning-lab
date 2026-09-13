import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Group, MathUtils, MeshBasicMaterial, PerspectiveCamera } from 'three'
import { SceneCanvas } from '../../../components/three/SceneCanvas'

type TransformerSceneProps = {
  activeLayer: number
  processed: number
  running: boolean
  animationEnabled: boolean
  onSelectLayer: (layer: number) => void
  onFailure: () => void
}

const layerPositions = [1.8, 0.9, 0, -0.9, -1.8]

function ComputationalLayers({
  activeLayer,
  processed,
  running,
  animationEnabled,
  onSelectLayer,
}: Omit<TransformerSceneProps, 'onFailure'>) {
  const { invalidate, size, gl, set, get } = useThree()
  const camera = useMemo(() => {
    const view = new PerspectiveCamera(40, 1, 0.1, 100)
    view.position.set(24, 16.5, 39)
    view.lookAt(0, 0, 0)
    return view
  }, [])
  const stream = useRef<Group>(null)
  const shell = useRef<MeshBasicMaterial>(null)
  const exterior = useRef<MeshBasicMaterial>(null)
  const introTime = useRef(0)
  const travelTime = useRef(0)

  useEffect(() => {
    invalidate()
  }, [activeLayer, processed, running, animationEnabled, invalidate])

  useEffect(() => {
    const previous = get().camera
    set({ camera })
    return () => set({ camera: previous })
  }, [camera, get, set])

  useEffect(() => {
    camera.aspect = size.width / Math.max(size.height, 1)
    // Preserve enough horizontal room for every layer on narrower desktop layouts.
    camera.fov = Math.max(40, MathUtils.radToDeg(2 * Math.atan(0.28 / camera.aspect)))
    camera.updateProjectionMatrix()
    invalidate()
  }, [camera, size.width, size.height, invalidate])

  useEffect(() => {
    travelTime.current = 0
  }, [activeLayer])

  useEffect(
    () => () => {
      gl.domElement.style.cursor = ''
    },
    [gl],
  )

  useFrame((_, delta) => {
    if (!animationEnabled) return
    const introFinished = introTime.current >= 3.2
    if (!introFinished) introTime.current = Math.min(3.2, introTime.current + Math.min(delta, 0.06))
    const progress = introTime.current / 3.2
    const eased = 1 - Math.pow(1 - progress, 3)
    // Start outside the Model envelope, then cross its front wall at z = 8.
    // At the end, [4.8, 3.3, 7.8] is inside the envelope's 12 × 10 × 16 bounds.
    camera.position.set(
      MathUtils.lerp(24, 4.8, eased),
      MathUtils.lerp(16.5, 3.3, eased),
      MathUtils.lerp(39, 7.8, eased),
    )
    camera.lookAt(0, 0, 0)
    const reveal = MathUtils.smoothstep(progress, 0.12, 0.65)
    if (shell.current) shell.current.opacity = MathUtils.lerp(0.5, 0.035, reveal)
    if (exterior.current) exterior.current.opacity = 0.97 * (1 - reveal)
    if (running) travelTime.current += Math.min(delta, 0.06)
    if (stream.current) {
      const updated = activeLayer < processed
      // The card stays above a pending layer and below a processed layer.
      // Motion never implies that an unprocessed layer has already computed.
      const pulse = running ? Math.sin(travelTime.current * 3) * 0.025 : 0
      stream.current.position.y = layerPositions[activeLayer] + (updated ? -0.35 : 0.48) + pulse
    }
    if (!introFinished || running) invalidate()
  })

  return (
    <>
      <ambientLight intensity={1.6} />
      <directionalLight position={[3, 7, 5]} intensity={2} />
      <mesh renderOrder={10} raycast={() => null}>
        <boxGeometry args={[12, 10, 16]} />
        <meshBasicMaterial
          ref={exterior}
          color="#d9e2fb"
          transparent
          opacity={0.97}
          depthWrite={false}
        />
      </mesh>
      <mesh renderOrder={11} raycast={() => null}>
        <boxGeometry args={[12, 10, 16]} />
        <meshBasicMaterial
          ref={shell}
          color="#3659df"
          wireframe
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0, -0.62]}>
        <boxGeometry args={[0.018, 5.7, 0.018]} />
        <meshBasicMaterial color="#b5c3ed" />
      </mesh>
      {layerPositions.map((y, layer) => {
        const active = layer === activeLayer
        return (
          <group key={layer} position={[0, y, 0]}>
            <mesh
              onClick={(event) => {
                event.stopPropagation()
                onSelectLayer(layer)
              }}
              onPointerOver={(event) => {
                event.stopPropagation()
                gl.domElement.style.cursor = 'pointer'
              }}
              onPointerOut={() => {
                gl.domElement.style.cursor = ''
              }}
            >
              <boxGeometry args={[3.65, 0.105, 2.25]} />
              <meshStandardMaterial
                color={active ? '#3659df' : layer < processed ? '#8eaae8' : '#c5cfeb'}
                transparent
                opacity={active ? 0.65 : 0.27}
                roughness={0.8}
                metalness={0}
                depthWrite={false}
              />
            </mesh>
            <mesh raycast={() => null}>
              <boxGeometry args={[3.66, 0.11, 2.26]} />
              <meshBasicMaterial
                color={active ? '#3659df' : '#9fafd8'}
                wireframe
                transparent
                opacity={active ? 0.9 : 0.4}
              />
            </mesh>
          </group>
        )
      })}
      <group
        ref={stream}
        position={[
          0,
          layerPositions[activeLayer] + (activeLayer < processed ? -0.35 : 0.48),
          -0.32,
        ]}
      >
        <mesh raycast={() => null}>
          <boxGeometry args={[0.7, 0.18, 0.5]} />
          <meshStandardMaterial color="#3659df" roughness={0.55} />
        </mesh>
      </group>
    </>
  )
}

/** Controlled rendering only: layer progression and lesson completion stay in the HTML explorer. */
export default function TransformerScene({ onFailure, ...scene }: TransformerSceneProps) {
  return (
    <div className="mi-transformer-canvas" data-renderer="webgl" aria-hidden="true">
      <SceneCanvas onFailure={onFailure}>
        <ComputationalLayers {...scene} />
      </SceneCanvas>
      <span
        className="mi-transformer-entry-label"
        style={{ animationPlayState: scene.animationEnabled ? 'running' : 'paused' }}
      >
        MODEL<small>进入模型内部</small>
      </span>
    </div>
  )
}
