import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { Html, Line } from '@react-three/drei'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { CatmullRomCurve3, Group, Quaternion, Vector3 } from 'three'
import type {
  ExploreConnection,
  ExploreNode,
  ExploreSceneProps,
  ExploreEdgeState,
  ExplorePacketType,
} from '../types'
import { connectionIsDisabled } from './connectionState'
import {
  boundedPacketEdges,
  comparisonIncludes,
  comparisonRole,
  isResultConnection,
  packetLabel,
} from './pathVisualState'
import { nodeVisualGrammar } from './visualGrammar'

const EDGE_COLORS = {
  data: '#7292b9',
  control: '#6b958c',
  retrieval: '#5988ad',
  tool: '#648f87',
  loop: '#aa805d',
}
const UP = new Vector3(0, 1, 0)
type ComparisonRole = ReturnType<typeof comparisonRole>

function buildCurve(
  from: ExploreNode,
  to: ExploreNode,
  type: ExploreConnection['type'],
  immersive: boolean,
) {
  const a = new Vector3(...from.position)
  const b = new Vector3(...to.position)
  const distance = a.distanceTo(b)
  const direction = b.clone().sub(a).normalize()
  // Scaled models get scaled ports; short neighbouring links retain a visible middle.
  const fromRadius =
    (from.level === 0 ? 1.5 : 0.75) * (immersive ? nodeVisualGrammar(from).scale : 1)
  const toRadius = (to.level === 0 ? 1.5 : 0.75) * (immersive ? nodeVisualGrammar(to).scale : 1)
  a.addScaledVector(direction, Math.min(fromRadius, distance * 0.34))
  b.addScaledVector(direction, -Math.min(toRadius, distance * 0.34))
  const center = a.clone().lerp(b, 0.5)
  center.y += type === 'loop' ? 2.15 : 0.48
  if (type === 'loop') center.z += 2.8
  else {
    const lane = type === 'control' ? 0.55 : type === 'retrieval' ? 0.72 : 0.27
    center.addScaledVector(new Vector3(-direction.z, 0, direction.x), lane)
  }
  return new CatmullRomCurve3([
    a,
    a.clone().lerp(center, 0.6),
    center,
    b.clone().lerp(center, 0.6),
    b,
  ])
}

const InformationPacket = memo(function InformationPacket({
  curve,
  animate,
  color,
  label,
  immersive,
  result,
}: {
  curve: CatmullRomCurve3
  animate: boolean
  color: string
  label: ReturnType<typeof packetLabel>
  immersive: boolean
  result: boolean
}) {
  const group = useRef<Group>(null)
  const phase = useRef(0.26)
  const target = useMemo(() => new Vector3(), [])
  const start = useMemo(() => curve.getPoint(0.26), [curve])
  const invalidate = useThree((state) => state.invalidate)
  useEffect(() => {
    if (animate) invalidate()
  }, [animate, invalidate])
  useFrame((state, delta) => {
    if (!animate || !group.current) return
    phase.current = (phase.current + Math.min(delta, 0.05) * 0.26) % 1
    curve.getPoint(phase.current, target)
    group.current.position.copy(target)
    state.invalidate()
  })
  return (
    <group ref={group} position={start}>
      <mesh rotation={[0, 0, result ? Math.PI / 4 : -0.15]}>
        {result ? (
          <octahedronGeometry args={[0.26, 0]} />
        ) : (
          <boxGeometry args={[0.48, 0.31, 0.1]} />
        )}
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {immersive && (
        <Html
          center
          position={[0, 0.38, 0]}
          zIndexRange={[23, 22]}
          className="explore-scene-packet-anchor"
        >
          <span className="explore-scene-packet" data-packet={label}>
            {label}
          </span>
        </Html>
      )}
    </group>
  )
})

const Connection = memo(function Connection({
  edge,
  from,
  to,
  state,
  highlighted,
  dimmed,
  animate,
  selected = false,
  immersive,
  role,
  showPacket,
  packetType,
  onSelect,
}: {
  edge: ExploreConnection
  from: ExploreNode
  to: ExploreNode
  state: ExploreEdgeState
  highlighted: boolean
  dimmed: boolean
  animate: boolean
  selected?: boolean
  immersive: boolean
  role?: ComparisonRole
  showPacket: boolean
  packetType?: ExplorePacketType
  onSelect?: (id: string) => void
}) {
  const [hovered, setHovered] = useState(false)
  const gl = useThree((value) => value.gl)
  const curve = useMemo(
    () => buildCurve(from, to, edge.type, immersive),
    [from, to, edge.type, immersive],
  )
  const points = useMemo(() => curve.getPoints(24), [curve])
  const midpoint = useMemo(() => curve.getPoint(0.5), [curve])
  const comparePoint = useMemo(() => curve.getPoint(0.38), [curve])
  const arrow = useMemo(
    () => ({
      position: curve.getPoint(0.81),
      quaternion: new Quaternion().setFromUnitVectors(UP, curve.getTangent(0.81).normalize()),
    }),
    [curve],
  )
  const disabled = state === 'disabled'
  const active = state === 'active'
  const upcoming = state === 'upcoming'
  const completed = state === 'completed'
  const result = immersive && isResultConnection(edge)
  const color = disabled
    ? '#b09a83'
    : selected || hovered
      ? '#266cca'
      : role === 'first'
        ? '#9365ad'
        : role === 'second'
          ? '#258b77'
          : role === 'common'
            ? '#617a96'
            : active
              ? edge.type === 'loop'
                ? '#ba8552'
                : '#347dd8'
              : completed
                ? '#4c8e7a'
                : EDGE_COLORS[edge.type]
  const opacity =
    selected || hovered
      ? 1
      : disabled
        ? 0.44
        : dimmed
          ? 0.07
          : active
            ? 1
            : role || completed
              ? 0.92
              : upcoming
                ? 0.74
                : highlighted
                  ? 0.96
                  : immersive
                    ? 0.22
                    : 0.82
  const width =
    selected || hovered
      ? 3.8
      : active
        ? 3.2
        : role
          ? 2.8
          : completed
            ? 2.5
            : upcoming
              ? 2.3
              : highlighted
                ? 2
                : immersive
                  ? 1
                  : 1.5
  useEffect(() => {
    if (!hovered || !onSelect) return
    const previous = gl.domElement.style.cursor
    gl.domElement.style.cursor = 'pointer'
    return () => {
      gl.domElement.style.cursor = previous
    }
  }, [hovered, onSelect, gl])
  const choose = (event: ThreeEvent<MouseEvent>) => {
    if (event.delta > 6) return
    event.stopPropagation()
    onSelect?.(edge.id)
  }
  return (
    <group>
      <Line
        points={points}
        color={color}
        lineWidth={width}
        transparent
        opacity={opacity}
        dashed={disabled || result || (!immersive && edge.type === 'loop')}
        dashSize={result ? 0.18 : 0.22}
        gapSize={disabled ? 0.34 : 0.16}
      />
      {onSelect && (
        <Line
          points={points}
          lineWidth={12}
          transparent
          opacity={0}
          depthWrite={false}
          onClick={choose}
          onPointerOver={(event) => {
            event.stopPropagation()
            setHovered(true)
          }}
          onPointerOut={() => setHovered(false)}
        />
      )}
      <mesh position={arrow.position} quaternion={arrow.quaternion}>
        <coneGeometry args={[active ? 0.14 : 0.105, active ? 0.36 : 0.29, 4]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
      </mesh>
      {immersive && completed && !dimmed && (
        <Html
          center
          position={midpoint}
          zIndexRange={[7, 6]}
          className="explore-scene-packet-anchor"
        >
          <span className="explore-scene-completed" aria-label="已完成">
            ✓
          </span>
        </Html>
      )}
      {immersive && role && !dimmed && (
        <Html
          center
          position={comparePoint}
          zIndexRange={[7, 6]}
          className="explore-scene-packet-anchor"
        >
          <span className="explore-scene-comparison-marker" data-path={role}>
            {role === 'common' ? 'A+B' : role === 'first' ? 'A' : '+B'}
          </span>
        </Html>
      )}
      {showPacket && !disabled && !dimmed && (
        <InformationPacket
          curve={curve}
          animate={animate}
          color={color}
          immersive={immersive}
          result={result || packetType === 'result'}
          label={packetLabel(packetType, result)}
        />
      )}
      {onSelect && (hovered || selected || disabled) && (
        <Html center position={midpoint} zIndexRange={[9, 8]} className="explore-scene-edge-anchor">
          <button
            type="button"
            className="explore-scene-edge"
            data-disabled={disabled}
            data-selected={selected}
            data-edge-state={state}
            aria-label={`为什么连接 ${from.label} → ${to.label}：${edge.label}${disabled ? '，已断开' : ''}`}
            aria-pressed={selected}
            onPointerDownCapture={(event) => event.stopPropagation()}
            onPointerUpCapture={(event) => event.stopPropagation()}
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            onClick={(event) => {
              event.stopPropagation()
              onSelect(edge.id)
            }}
          >
            {disabled ? '已断开 · 为什么？' : `${edge.label} · 为什么？`}
          </button>
        </Html>
      )}
    </group>
  )
})

type FlowProps = Pick<
  ExploreSceneProps,
  | 'nodes'
  | 'connections'
  | 'selectedId'
  | 'relatedIds'
  | 'activeEdgeIds'
  | 'onSelectConnection'
  | 'selectedConnectionId'
  | 'disabledNodeIds'
  | 'disabledEdgeIds'
  | 'immersive'
  | 'edgeStates'
  | 'packetType'
  | 'comparison'
  | 'compareFilter'
> & { animate: boolean }

export const FlowConnections = memo(function FlowConnections({
  nodes,
  connections,
  selectedId,
  relatedIds,
  activeEdgeIds,
  animate,
  onSelectConnection,
  selectedConnectionId,
  disabledNodeIds,
  disabledEdgeIds,
  immersive = false,
  edgeStates,
  packetType,
  comparison,
  compareFilter = 'all',
}: FlowProps) {
  const nodeMap = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes])
  const related = useMemo(() => new Set([selectedId, ...relatedIds]), [selectedId, relatedIds])
  const active = useMemo(() => new Set(activeEdgeIds), [activeEdgeIds])
  const disabledNodes = useMemo(() => new Set(disabledNodeIds), [disabledNodeIds])
  const disabledEdges = useMemo(() => {
    const disabled = new Set(disabledEdgeIds)
    for (const edge of connections) {
      if (
        connectionIsDisabled(edge, disabledNodes, disabled) ||
        edgeStates?.[edge.id] === 'disabled'
      )
        disabled.add(edge.id)
    }
    return disabled
  }, [connections, disabledEdgeIds, disabledNodes, edgeStates])
  const packets = useMemo(
    () =>
      boundedPacketEdges(
        edgeStates
          ? Object.keys(edgeStates).filter((id) => edgeStates[id] === 'active')
          : activeEdgeIds,
        edgeStates,
        disabledEdges,
      ),
    [edgeStates, activeEdgeIds, disabledEdges],
  )
  return (
    <group>
      {connections.map((edge) => {
        const from = nodeMap.get(edge.from)
        const to = nodeMap.get(edge.to)
        if (!from || !to || from.id === to.id) return null
        const role = comparisonRole(edge.id, comparison)
        const highlighted =
          selectedId !== null && (edge.from === selectedId || edge.to === selectedId)
        const state = disabledEdges.has(edge.id)
          ? 'disabled'
          : (edgeStates?.[edge.id] ?? (active.has(edge.id) ? 'active' : 'idle'))
        const dimmed = comparison
          ? !comparisonIncludes(role, compareFilter)
          : edgeStates
            ? state === 'idle' && edge.id !== selectedConnectionId
            : selectedId !== null && !(related.has(edge.from) && related.has(edge.to))
        return (
          <Connection
            key={edge.id}
            edge={edge}
            from={from}
            to={to}
            state={state}
            highlighted={highlighted}
            dimmed={dimmed}
            animate={animate}
            immersive={immersive}
            role={role}
            showPacket={packets.has(edge.id)}
            packetType={packetType}
            selected={edge.id === selectedConnectionId}
            onSelect={onSelectConnection}
          />
        )
      })}
    </group>
  )
})
