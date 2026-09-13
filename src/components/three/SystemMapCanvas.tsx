import { Component, useCallback, useLayoutEffect, useState, type ReactNode } from 'react'
import { useThree } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import { OrthographicCamera } from 'three'
import { SystemNode } from './SystemNode'
import { SceneCanvas } from './SceneCanvas'
import { SCENE_PALETTE, SYSTEM_NODES, type SystemNodeId } from './system-map-data'
import './system-map-scene.css'

export type { SystemNodeId } from './system-map-data'

export type SystemMapCanvasProps = {
  selectedNode: SystemNodeId | null
  onSelectNode: (id: SystemNodeId) => void
}

type SceneBoundaryProps = {
  children: ReactNode
  fallback: ReactNode
}

class SceneBoundary extends Component<SceneBoundaryProps, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

function SceneEnvironment() {
  const { camera, size, invalidate } = useThree()

  useLayoutEffect(() => {
    if (camera instanceof OrthographicCamera) {
      camera.zoom = Math.min(size.width / 8.8, size.height / 5.8)
      camera.updateProjectionMatrix()
      invalidate()
    }
  }, [camera, size.width, size.height, invalidate])

  return null
}

function SceneConnections() {
  return (
    <group>
      <Line
        points={[
          [-2.55, -0.71, 1.55],
          [2.55, -0.71, -1.55],
        ]}
        color={SCENE_PALETTE.connection}
        lineWidth={1.1}
      />
      {[-1, 1].map((direction) => (
        <group key={direction} position={[direction * 1.275, -0.7, direction * -0.775]}>
          <mesh rotation={[0, 0.546, -Math.PI / 2]}>
            <coneGeometry args={[0.045, 0.13, 3]} />
            <meshBasicMaterial color={SCENE_PALETTE.connection} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function SystemMapFallback({ selectedNode, onSelectNode }: SystemMapCanvasProps) {
  return (
    <div className="system-map-fallback" data-renderer="fallback">
      <div className="system-map-fallback__nodes">
        {SYSTEM_NODES.map(({ id, caption, label }, index) => (
          <div key={id} className="system-map-fallback__item">
            {index > 0 && <span className="system-map-fallback__connector">→</span>}
            <div
              className="system-map-fallback__node"
              data-node={id}
              data-selected={selectedNode === id}
              onClick={() => onSelectNode(id)}
            >
              <span className="system-map-fallback__symbol">
                {id === 'user' ? '↗' : id === 'model' ? '✳' : '≡'}
              </span>
            </div>
            <span className="system-node-label__caption">{caption}</span>
            <span className="system-node-label__title">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SystemMapCanvas({ selectedNode, onSelectNode }: SystemMapCanvasProps) {
  const [webGLAvailable, setWebGLAvailable] = useState(true)
  const showFallback = useCallback(() => setWebGLAvailable(false), [])
  const fallback = <SystemMapFallback selectedNode={selectedNode} onSelectNode={onSelectNode} />

  return (
    <div className="system-map-scene" aria-hidden="true" role="presentation">
      <SceneBoundary fallback={fallback}>
        {webGLAvailable ? (
          <SceneCanvas onFailure={showFallback}>
            <SceneEnvironment />
            <ambientLight intensity={1.7} />
            <directionalLight position={[1, 8, 5]} intensity={3.2} color={SCENE_PALETTE.light} />
            <directionalLight
              position={[-6, 2, -3]}
              intensity={1.4}
              color={SCENE_PALETTE.fillLight}
            />
            <SceneConnections />
            {SYSTEM_NODES.map((node) => (
              <SystemNode
                key={node.id}
                {...node}
                selected={selectedNode === node.id}
                onSelect={onSelectNode}
              />
            ))}
          </SceneCanvas>
        ) : (
          fallback
        )}
      </SceneBoundary>
    </div>
  )
}

export default SystemMapCanvas
