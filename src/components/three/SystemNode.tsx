import { Html, RoundedBox } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { SCENE_PALETTE, SYSTEM_NODES, type SystemNodeId } from './system-map-data'

type SystemNodeProps = (typeof SYSTEM_NODES)[number] & {
  selected: boolean
  onSelect: (id: SystemNodeId) => void
}

function NodeMark({ id }: { id: SystemNodeId }) {
  const color = id === 'model' ? SCENE_PALETTE.markOnDark : SCENE_PALETTE.markOnLight

  if (id === 'model') {
    return (
      <group position={[0, 0.04, 0.605]}>
        {[-0.18, 0, 0.18].map((x) =>
          [-0.18, 0, 0.18].map((y) => (
            <mesh key={`${x}-${y}`} position={[x, y, 0]}>
              <boxGeometry args={[0.075, 0.075, 0.012]} />
              <meshBasicMaterial color={color} />
            </mesh>
          )),
        )}
      </group>
    )
  }

  return (
    <group position={[0, 0.015, 0.605]}>
      {id === 'user' ? (
        <>
          <mesh position={[0, 0.14, 0]}>
            <circleGeometry args={[0.115, 24]} />
            <meshBasicMaterial color={color} />
          </mesh>
          <mesh position={[0, -0.15, 0]}>
            <planeGeometry args={[0.32, 0.19]} />
            <meshBasicMaterial color={color} />
          </mesh>
        </>
      ) : (
        [0.15, 0, -0.15].map((y, index) => (
          <mesh key={y} position={[index === 2 ? -0.075 : 0, y, 0]}>
            <planeGeometry args={[index === 2 ? 0.23 : 0.38, 0.045]} />
            <meshBasicMaterial color={color} />
          </mesh>
        ))
      )}
    </group>
  )
}

export function SystemNode({ id, label, caption, position, selected, onSelect }: SystemNodeProps) {
  const isModel = id === 'model'
  const pickNode = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    onSelect(id)
  }

  return (
    <group position={position}>
      <mesh position={[0, -0.75, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.86, 48]} />
        <meshBasicMaterial
          color={SCENE_PALETTE.shadow}
          transparent
          opacity={0.055}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, -0.745, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.94, selected ? 0.972 : 0.951, 64]} />
        <meshBasicMaterial
          color={selected ? SCENE_PALETTE.accent : SCENE_PALETTE.surfaceEdge}
          transparent
          opacity={selected ? 0.95 : 0.65}
          depthWrite={false}
        />
      </mesh>
      <RoundedBox args={[1.2, 1.18, 1.2]} radius={0.09} smoothness={4} onClick={pickNode}>
        <meshStandardMaterial
          color={isModel ? SCENE_PALETTE.model : SCENE_PALETTE.surface}
          metalness={isModel ? 0.25 : 0.1}
          roughness={0.38}
        />
      </RoundedBox>
      <NodeMark id={id} />
      <RoundedBox args={[0.58, 0.018, 0.58]} radius={0.006} smoothness={2} position={[0, 0.595, 0]}>
        <meshStandardMaterial
          color={isModel ? SCENE_PALETTE.modelEdge : SCENE_PALETTE.surfaceEdge}
          metalness={0.2}
          roughness={0.5}
        />
      </RoundedBox>
      {isModel && (
        <mesh position={[0.29, 0.21, 0.605]}>
          <circleGeometry args={[0.025, 12]} />
          <meshBasicMaterial color={SCENE_PALETTE.accent} />
        </mesh>
      )}
      <Html
        center
        position={[0, -1.35, 0]}
        className="system-node-label"
        style={{ pointerEvents: 'none' }}
      >
        <span className="system-node-label__caption">{caption}</span>
        <span className="system-node-label__title" data-selected={selected}>
          {label}
        </span>
      </Html>
    </group>
  )
}
