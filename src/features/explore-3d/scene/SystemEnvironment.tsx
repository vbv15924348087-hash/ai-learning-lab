import type { ExploreNode } from '../types'
import { memo } from 'react'

/** Raised islands express module ownership; the thin perimeter separates the runtime from outside tools. */
export const SystemEnvironment = memo(function SystemEnvironment({
  nodes,
}: {
  nodes: ExploreNode[]
}) {
  return (
    <group>
      <ambientLight intensity={1.75} />
      <directionalLight position={[-6, 14, 9]} intensity={2.65} color="#ffffff" />
      <directionalLight position={[10, 6, -12]} intensity={1.35} color="#e1ebfa" />
      {nodes
        .filter((node) => node.level === 0)
        .map((node) => {
          const radius = node.id === 'model' || node.id === 'harness' ? 2.05 : 1.8
          const y = node.position[1] - 1.1
          return (
            <group key={node.id} position={[node.position[0], y, node.position[2]]}>
              <mesh position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[radius + 0.27, 48]} />
                <meshBasicMaterial color="#8c9fb7" transparent opacity={0.065} depthWrite={false} />
              </mesh>
              <mesh>
                <cylinderGeometry args={[radius, radius + 0.07, 0.12, 48]} />
                <meshStandardMaterial
                  color={node.category === 'external' ? '#e4ebf4' : '#f6f9fc'}
                  roughness={0.75}
                />
              </mesh>
              <mesh position={[0, 0.065, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[radius - 0.045, radius, 48]} />
                <meshBasicMaterial color="#ccd9e8" />
              </mesh>
            </group>
          )
        })}
    </group>
  )
})
