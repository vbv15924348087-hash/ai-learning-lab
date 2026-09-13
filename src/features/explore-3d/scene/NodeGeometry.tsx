import { createContext, memo, useContext } from 'react'
import type { ExploreCategory, NodeKind } from '../types'
import { categoryColors, type CategoryPalette } from '../categoryColors'
import { DoubleSide, FrontSide } from 'three'

type MaterialTone = keyof CategoryPalette
type SurfaceProps = { tone?: MaterialTone; opacity?: number; glass?: boolean }
const PaletteContext = createContext<CategoryPalette>(categoryColors.model)

function Surface({ tone = 'body', opacity = 1, glass = false }: SurfaceProps) {
  const palette = useContext(PaletteContext)
  return (
    <meshStandardMaterial
      color={palette[tone]}
      roughness={glass ? 0.3 : 0.55}
      metalness={glass ? 0.03 : 0.05}
      transparent={opacity < 1}
      opacity={opacity}
      depthWrite={!glass && opacity > 0.7}
      side={glass ? DoubleSide : FrontSide}
    />
  )
}

function Plate({
  position = [0, 0, 0],
  size,
  tone,
  opacity = 1,
}: {
  position?: [number, number, number]
  size: [number, number, number]
  tone?: MaterialTone
  opacity?: number
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <Surface tone={tone} opacity={opacity} />
    </mesh>
  )
}

function ModelGeometry({ opacity }: { opacity: number }) {
  return (
    <group>
      <Plate position={[0, -0.6, 0]} size={[2.65, 0.2, 2.3]} tone="light" opacity={opacity} />
      {[-0.3, 0.12, 0.54, 0.96, 1.38].map((y, index) => (
        <mesh key={y} position={[0, y, 0]}>
          <boxGeometry args={[2.35 - index * 0.09, 0.055, 1.96 - index * 0.08]} />
          <Surface tone="light" opacity={opacity * 0.34} glass />
        </mesh>
      ))}
      <mesh position={[0, 0.58, 0]} rotation={[0.2, Math.PI / 4, 0.1]}>
        <octahedronGeometry args={[0.73, 0]} />
        <Surface tone="accent" opacity={opacity} />
      </mesh>
      {[-1, 1].map((x) =>
        [-0.82, 0.82].map((z) => (
          <Plate
            key={`${x}-${z}`}
            position={[x, 0.46, z]}
            size={[0.045, 1.93, 0.045]}
            tone="body"
            opacity={opacity * 0.7}
          />
        )),
      )}
    </group>
  )
}

function ContextGeometry({ opacity }: { opacity: number }) {
  return (
    <group>
      <Plate position={[0, -0.55, 0]} size={[2.4, 0.2, 1.8]} tone="light" opacity={opacity} />
      {[
        [-1.15, 0.35, 0, 0.055, 1.7, 1.8],
        [1.15, 0.35, 0, 0.055, 1.7, 1.8],
        [0, 0.35, -0.875, 2.3, 1.7, 0.055],
      ].map(([x, y, z, w, h, d], index) => (
        <mesh key={index} position={[x, y, z]}>
          <boxGeometry args={[w, h, d]} />
          <Surface tone="light" opacity={opacity * 0.22} glass />
        </mesh>
      ))}
      {[-0.65, -0.22, 0.22, 0.65].map((x, index) => (
        <group key={x} position={[x, 0.14 + index * 0.12, 0]} rotation={[0, 0, -0.12]}>
          <Plate
            size={[0.3, 0.96, 0.85]}
            tone={index === 2 ? 'accent' : 'body'}
            opacity={opacity}
          />
          <Plate
            position={[0, 0.15, 0.435]}
            size={[0.2, 0.065, 0.02]}
            tone="dark"
            opacity={opacity}
          />
        </group>
      ))}
    </group>
  )
}

function HarnessGeometry({ opacity }: { opacity: number }) {
  return (
    <group>
      <mesh position={[0, -0.48, 0]}>
        <cylinderGeometry args={[1.48, 1.6, 0.36, 48]} />
        <Surface tone="light" opacity={opacity} />
      </mesh>
      <mesh position={[0, -0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.21, 0.055, 8, 48]} />
        <Surface tone="accent" opacity={opacity} />
      </mesh>
      <Plate position={[0, -0.05, 0]} size={[1.05, 0.34, 0.95]} tone="body" opacity={opacity} />
      {[-1, 1].map((x) =>
        [-1, 1].map((z) => (
          <Plate
            key={`${x}-${z}`}
            position={[x * 0.77, 0.05, z * 0.7]}
            size={[0.23, 0.6, 0.23]}
            tone="body"
            opacity={opacity}
          />
        )),
      )}
      <mesh position={[0, 0.33, 0]}>
        <octahedronGeometry args={[0.27]} />
        <Surface tone="dark" opacity={opacity} />
      </mesh>
    </group>
  )
}

function MemoryGeometry({ opacity }: { opacity: number }) {
  return (
    <group>
      <Plate position={[0, -0.46, 0]} size={[1.5, 0.14, 1.1]} tone="light" opacity={opacity} />
      {[-0.45, 0, 0.45].map((x, index) => (
        <group key={x}>
          <Plate
            position={[x, 0.04, 0]}
            size={[0.28, 0.95 + index * 0.09, 0.85]}
            tone={index === 1 ? 'accent' : 'body'}
            opacity={opacity}
          />
          <Plate
            position={[x, 0.23, 0.435]}
            size={[0.16, 0.065, 0.025]}
            tone="surface"
            opacity={opacity}
          />
        </group>
      ))}
    </group>
  )
}

function RagGeometry({ opacity }: { opacity: number }) {
  return (
    <group>
      {[-0.5, -0.16, 0.18, 0.52].map((x, index) => (
        <Plate
          key={x}
          position={[x, 0.35, -0.2 + (index % 2) * 0.12]}
          size={[0.2, 0.58, 0.5]}
          tone="body"
          opacity={opacity}
        />
      ))}
      <mesh position={[0, -0.05, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.73, 0.55, 4, 1, true]} />
        <Surface tone="light" opacity={opacity * 0.44} glass />
      </mesh>
      {[-0.18, 0.18].map((x) => (
        <Plate
          key={x}
          position={[x, -0.51, 0]}
          size={[0.18, 0.28, 0.45]}
          tone="accent"
          opacity={opacity}
        />
      ))}
    </group>
  )
}

function GateGeometry({ opacity }: { opacity: number }) {
  return (
    <group>
      {[-0.64, 0.64].map((x) => (
        <Plate
          key={x}
          position={[x, 0.05, 0]}
          size={[0.2, 1.5, 0.36]}
          tone="body"
          opacity={opacity}
        />
      ))}
      <Plate position={[0, 0.74, 0]} size={[1.5, 0.2, 0.36]} tone="body" opacity={opacity} />
      <Plate position={[0, 0.04, 0]} size={[1.07, 0.085, 0.11]} tone="dark" opacity={opacity} />
      <mesh position={[0, 0.35, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.24, 0.24, 0.14]} />
        <Surface tone="accent" opacity={opacity} />
      </mesh>
    </group>
  )
}

function CheckGeometry({ opacity, immersive = false }: { opacity: number; immersive?: boolean }) {
  if (immersive)
    return (
      <group>
        <Plate position={[0, -0.67, 0]} size={[1.6, 0.18, 1.24]} tone="light" opacity={opacity} />
        {[-0.72, 0.72].map((x) => (
          <Plate
            key={x}
            position={[x, 0.05, 0]}
            size={[0.16, 1.4, 0.5]}
            tone="body"
            opacity={opacity}
          />
        ))}
        <Plate position={[0, 0.78, 0]} size={[1.6, 0.18, 0.5]} tone="body" opacity={opacity} />
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[1.2, 0.85, 0.045]} />
          <Surface tone="light" opacity={opacity * 0.24} glass />
        </mesh>
        <Plate
          position={[0, 0.16, 0.04]}
          size={[1.18, 0.035, 0.055]}
          tone="accent"
          opacity={opacity}
        />
        <DocumentGeometry opacity={opacity} />
      </group>
    )
  return (
    <group>
      <mesh>
        <torusGeometry args={[0.72, 0.12, 10, 40]} />
        <Surface tone="body" opacity={opacity} />
      </mesh>
      <group rotation={[0, 0, -Math.PI / 4]} position={[0.05, 0.05, 0.05]}>
        <Plate
          position={[-0.17, -0.09, 0]}
          size={[0.18, 0.45, 0.18]}
          tone="accent"
          opacity={opacity}
        />
        <Plate
          position={[0.09, -0.23, 0]}
          size={[0.69, 0.18, 0.18]}
          tone="accent"
          opacity={opacity}
        />
      </group>
      <Plate position={[0, -0.87, 0]} size={[1.2, 0.13, 0.8]} tone="light" opacity={opacity} />
    </group>
  )
}

function ExternalGeometry({ opacity }: { opacity: number }) {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.84, 20, 12]} />
        <Surface tone="light" opacity={opacity * 0.34} glass />
      </mesh>
      {[0, Math.PI / 2].map((rotation) => (
        <mesh key={rotation} rotation={[0, rotation, 0]}>
          <torusGeometry args={[0.87, 0.035, 6, 40]} />
          <Surface tone="accent" opacity={opacity} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.87, 0.035, 6, 40]} />
        <Surface tone="accent" opacity={opacity} />
      </mesh>
      <mesh position={[0, -1.02, 0]}>
        <cylinderGeometry args={[1.3, 1.38, 0.14, 40]} />
        <Surface tone="light" opacity={opacity} />
      </mesh>
    </group>
  )
}

function DocumentGeometry({ opacity, input = false }: { opacity: number; input?: boolean }) {
  return (
    <group rotation={[-0.12, 0, -0.08]}>
      <Plate size={[1.12, 1.48, 0.16]} tone={input ? 'body' : 'light'} opacity={opacity} />
      {[0.37, 0.1, -0.17].map((y, index) => (
        <Plate
          key={y}
          position={[-0.04, y, 0.095]}
          size={[index === 2 ? 0.43 : 0.72, 0.09, 0.035]}
          tone="dark"
          opacity={opacity}
        />
      ))}
      {!input && (
        <mesh position={[0.37, -0.62, 0.15]}>
          <sphereGeometry args={[0.2, 12, 8]} />
          <Surface tone="accent" opacity={opacity} />
        </mesh>
      )}
    </group>
  )
}

function InternalModelGeometry({ part, opacity }: { part: string; opacity: number }) {
  if (part === 'token')
    return (
      <group>
        {[-0.56, 0, 0.56].map((x, index) => (
          <group key={x} position={[x, index === 1 ? 0.13 : 0, 0]}>
            <Plate
              size={[0.43, 0.68, 0.16]}
              tone={index === 1 ? 'accent' : 'body'}
              opacity={opacity}
            />
            <Plate
              position={[0, 0.08, 0.1]}
              size={[0.23, 0.045, 0.03]}
              tone="surface"
              opacity={opacity}
            />
          </group>
        ))}
      </group>
    )
  if (part === 'embedding')
    return (
      <group>
        {[-0.42, 0, 0.42].map((x, column) =>
          [-0.36, 0, 0.36].map((y, row) => (
            <Plate
              key={`${x}-${y}`}
              position={[x, y, 0]}
              size={[0.27, 0.22, 0.12 + ((column + row) % 3) * 0.15]}
              tone={(column + row) % 2 ? 'body' : 'accent'}
              opacity={opacity}
            />
          )),
        )}
      </group>
    )
  if (part === 'transformer')
    return (
      <group>
        {[-0.45, -0.12, 0.21, 0.54].map((y, index) => (
          <Plate
            key={y}
            position={[0, y, 0]}
            size={[1.2, 0.14, 0.92]}
            tone={index === 2 ? 'accent' : 'body'}
            opacity={opacity}
          />
        ))}
        {[-0.45, 0.45].map((x) => (
          <Plate
            key={x}
            position={[x, 0.04, 0]}
            size={[0.04, 1.2, 0.045]}
            tone="dark"
            opacity={opacity}
          />
        ))}
      </group>
    )
  if (part === 'attention')
    return (
      <group>
        <mesh>
          <sphereGeometry args={[0.2, 12, 8]} />
          <Surface tone="accent" opacity={opacity} />
        </mesh>
        {[0, 1, 2, 3, 4].map((index) => (
          <group key={index} rotation={[0, 0, index * Math.PI * 0.4]}>
            <Plate
              position={[0, 0.29, 0]}
              size={[index === 1 ? 0.09 : 0.035, 0.46, 0.035]}
              tone={index === 1 ? 'accent' : 'light'}
              opacity={opacity}
            />
            <mesh position={[0, 0.65, 0]}>
              <sphereGeometry args={[index === 1 ? 0.18 : 0.12, 12, 8]} />
              <Surface tone={index === 1 ? 'accent' : 'body'} opacity={opacity} />
            </mesh>
          </group>
        ))}
      </group>
    )
  return (
    <group>
      {[-0.38, 0, 0.38].map((y, index) => (
        <Plate
          key={y}
          position={[0, y, index === 2 ? 0.12 : 0]}
          size={[index === 2 ? 1.1 : 0.8 - index * 0.17, 0.22, 0.22]}
          tone={index === 2 ? 'accent' : 'body'}
          opacity={opacity}
        />
      ))}
      <mesh position={[0.73, 0.38, 0.12]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.13, 0.28, 4]} />
        <Surface tone="accent" opacity={opacity} />
      </mesh>
    </group>
  )
}

function ConnectorGeometry({ opacity }: { opacity: number }) {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.49, 0.49, 0.28, 6]} />
        <Surface tone="accent" opacity={opacity} />
      </mesh>
      {[0, 1, 2, 3].map((index) => (
        <group key={index} rotation={[0, 0, (index * Math.PI) / 2]}>
          <Plate position={[0, 0.59, 0]} size={[0.12, 0.4, 0.13]} tone="body" opacity={opacity} />
          <Plate position={[0, 0.86, 0]} size={[0.4, 0.23, 0.28]} tone="accent" opacity={opacity} />
          <Plate
            position={[0, 0.87, 0.15]}
            size={[0.21, 0.08, 0.02]}
            tone="surface"
            opacity={opacity}
          />
        </group>
      ))}
      <mesh position={[0, 0, 0.18]}>
        <sphereGeometry args={[0.16, 12, 8]} />
        <Surface tone="light" opacity={opacity} />
      </mesh>
    </group>
  )
}

function ArchiveGeometry({ opacity }: { opacity: number }) {
  return (
    <group>
      {[-0.48, -0.04, 0.4].map((y, index) => (
        <group key={y}>
          <mesh position={[0, y, 0]}>
            <cylinderGeometry args={[0.74, 0.74, 0.29, 24]} />
            <Surface tone={index === 1 ? 'accent' : 'body'} opacity={opacity} />
          </mesh>
          <Plate
            position={[0, y, 0.735]}
            size={[0.35, 0.055, 0.025]}
            tone="surface"
            opacity={opacity}
          />
        </group>
      ))}
    </group>
  )
}

function AgentLoopGeometry({ opacity }: { opacity: number }) {
  const tones = ['body', 'accent', 'body', 'dark'] as const
  return (
    <group rotation={[Math.PI / 2.8, 0, 0]}>
      {tones.map((tone, index) => (
        <group key={index} rotation={[0, 0, (index * Math.PI) / 2]}>
          <mesh>
            <torusGeometry args={[0.9, 0.16, 8, 14, Math.PI * 0.42]} />
            <Surface tone={tone} opacity={opacity} />
          </mesh>
          <mesh position={[0.24, 0.86, 0]} rotation={[0, 0, Math.PI * 0.42]}>
            <coneGeometry args={[0.23, 0.32, 4]} />
            <Surface tone={tone} opacity={opacity} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function NodeShape({
  kind,
  opacity,
  nodeId,
  immersive = false,
}: {
  kind: NodeKind
  opacity: number
  nodeId?: string
  immersive?: boolean
}) {
  if (immersive && nodeId === 'mcp') return <ConnectorGeometry opacity={opacity} />
  if (immersive && (kind === 'memory' || nodeId === 'database' || nodeId === 'state'))
    return <ArchiveGeometry opacity={opacity} />
  if (immersive && nodeId === 'loop') return <AgentLoopGeometry opacity={opacity} />
  if (nodeId?.startsWith('inside-model-'))
    return <InternalModelGeometry part={nodeId.slice('inside-model-'.length)} opacity={opacity} />
  switch (kind) {
    case 'model':
      return <ModelGeometry opacity={opacity} />
    case 'context':
      return <ContextGeometry opacity={opacity} />
    case 'harness':
      return <HarnessGeometry opacity={opacity} />
    case 'memory':
      return <MemoryGeometry opacity={opacity} />
    case 'rag':
      return <RagGeometry opacity={opacity} />
    case 'gate':
      return <GateGeometry opacity={opacity} />
    case 'check':
      return <CheckGeometry opacity={opacity} immersive={immersive} />
    case 'external':
      return <ExternalGeometry opacity={opacity} />
    case 'input':
      return <DocumentGeometry opacity={opacity} input />
    case 'final':
      return <DocumentGeometry opacity={opacity} />
    case 'loop':
      return (
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <torusGeometry args={[0.7, 0.13, 10, 36, Math.PI * 1.7]} />
            <Surface tone="body" opacity={opacity} />
          </mesh>
          <mesh
            position={[Math.cos(Math.PI * 1.7) * 0.7, Math.sin(Math.PI * 1.7) * 0.7, 0]}
            rotation={[0, 0, Math.PI * 1.7]}
          >
            <coneGeometry args={[0.24, 0.42, 4]} />
            <Surface tone="accent" opacity={opacity} />
          </mesh>
        </group>
      )
    case 'tool':
      return (
        <group>
          <mesh position={[0, -0.48, 0]}>
            <cylinderGeometry args={[0.7, 0.76, 0.17, 6]} />
            <Surface tone="light" opacity={opacity} />
          </mesh>
          <Plate size={[0.9, 0.67, 0.19]} tone="accent" opacity={opacity} />
          <Plate
            position={[0, 0.04, 0.11]}
            size={[0.65, 0.39, 0.025]}
            tone="surface"
            opacity={opacity}
          />
          <Plate position={[0, -0.37, 0]} size={[0.13, 0.3, 0.18]} tone="body" opacity={opacity} />
        </group>
      )
    default:
      return (
        <group>
          <mesh rotation={[0, Math.PI / 4, 0]}>
            <octahedronGeometry args={[0.48, 0]} />
            <Surface tone="body" opacity={opacity} />
          </mesh>
          <mesh position={[0, -0.58, 0]}>
            <cylinderGeometry args={[0.6, 0.65, 0.1, 24]} />
            <Surface tone="light" opacity={opacity} />
          </mesh>
        </group>
      )
  }
}

export const NodeGeometry = memo(function NodeGeometry({
  category,
  ...shape
}: {
  category: ExploreCategory
  kind: NodeKind
  opacity: number
  nodeId?: string
  immersive?: boolean
}) {
  return (
    <PaletteContext.Provider value={categoryColors[category]}>
      <NodeShape {...shape} />
    </PaletteContext.Provider>
  )
})
