import { memo, useEffect, useState } from 'react'
import { Check, Circle, LockKeyhole } from 'lucide-react'
import { Html } from '@react-three/drei'
import { useThree, type ThreeEvent } from '@react-three/fiber'
import { NodeGeometry } from './NodeGeometry'
import type { ExploreNode } from '../types'
import { nodeVisualGrammar } from './visualGrammar'
import { categoryColors, categoryColorStyle } from '../categoryColors'

export const SceneNode = memo(function SceneNode({
  node,
  selected,
  related,
  dimmed,
  learned,
  unlocked,
  showLabel,
  xray = false,
  disabled = false,
  immersive = false,
  comparisonRole,
  onSelect,
  registerLabel,
}: {
  node: ExploreNode
  selected: boolean
  related: boolean
  dimmed: boolean
  learned: boolean
  unlocked: boolean
  showLabel: boolean
  xray?: boolean
  disabled?: boolean
  immersive?: boolean
  comparisonRole?: 'common' | 'first' | 'second'
  onSelect: (id: string) => void
  registerLabel: (id: string, element: HTMLButtonElement | null) => void
}) {
  const [hovered, setHovered] = useState(false)
  const gl = useThree((state) => state.gl)
  const highlighted = selected || hovered
  const core = node.level === 0
  const grammar = nodeVisualGrammar(node)
  const palette = categoryColors[node.category]
  const baseScale = immersive ? grammar.scale : core ? 1 : 0.84
  const scale = baseScale * (hovered || (immersive && selected) ? 1.05 : 1)
  const learningStatus = learned ? '已学' : unlocked ? '可学习' : '课程未解锁，可在此探索'

  useEffect(() => {
    if (!hovered) return
    const previous = gl.domElement.style.cursor
    gl.domElement.style.cursor = 'pointer'
    return () => {
      gl.domElement.style.cursor = previous
    }
  }, [hovered, gl])

  const click = (event: ThreeEvent<MouseEvent>) => {
    if (event.delta > 6) return
    event.stopPropagation()
    onSelect(node.id)
  }

  return (
    <group position={node.position}>
      <group
        scale={scale}
        onClick={click}
        onPointerOver={(event) => {
          event.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
      >
        <NodeGeometry
          kind={node.kind}
          category={node.category}
          nodeId={node.id}
          immersive={immersive}
          opacity={disabled ? 0.24 : xray ? 0.2 : dimmed && !hovered ? 0.32 : 1}
        />
        <mesh position={[0, -0.85, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry
            args={[core ? 1.66 : 1.05, (core ? 1.66 : 1.05) + (highlighted ? 0.075 : 0.035), 48]}
          />
          <meshBasicMaterial
            color={
              disabled
                ? '#b3987e'
                : highlighted
                  ? palette.dark
                  : comparisonRole === 'first'
                    ? '#9967b4'
                    : comparisonRole === 'second'
                      ? '#278c78'
                      : related
                        ? palette.accent
                        : palette.body
            }
            transparent
            opacity={dimmed ? 0.3 : 0.8}
            depthWrite={false}
          />
        </mesh>
        {disabled && (
          <mesh position={[0, 0, 0.82]} rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[1.5, 0.075, 0.075]} />
            <meshBasicMaterial color="#af8f72" transparent opacity={0.8} />
          </mesh>
        )}
      </group>
      {showLabel && (
        <Html
          center
          position={[
            0,
            (core ? (node.kind === 'model' ? 2.1 : 1.7) : 1.24) * (immersive ? baseScale : 1),
            0,
          ]}
          zIndexRange={selected ? [30, 25] : core ? [20, 15] : [14, 10]}
          className="explore-scene-label-anchor"
        >
          <button
            ref={(element) => registerLabel(node.id, element)}
            type="button"
            className="explore-scene-label"
            style={categoryColorStyle(node.category)}
            data-category={node.category}
            data-selected={selected}
            data-dimmed={dimmed}
            data-core={core}
            data-disabled={disabled || undefined}
            data-xray={xray || undefined}
            data-tier={immersive ? grammar.tier : undefined}
            data-visual-type={immersive ? grammar.type : undefined}
            data-comparison={comparisonRole}
            data-learning-state={learned ? 'learned' : unlocked ? 'available' : 'locked'}
            aria-label={`探索 ${node.label}：${node.chineseLabel}，${learningStatus}${disabled ? '，实验中已关闭' : xray ? '，正在透视内部' : ''}`}
            aria-pressed={selected}
            onPointerDownCapture={(event) => event.stopPropagation()}
            onPointerUpCapture={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              onSelect(node.id)
            }}
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
          >
            <span className="explore-scene-label__title">
              <span aria-hidden="true">
                {learned ? (
                  <Check size={12} />
                ) : unlocked ? (
                  <Circle size={9} />
                ) : (
                  <LockKeyhole size={11} />
                )}
              </span>
              {node.label}
            </span>
            <span className="explore-scene-label__caption">
              {node.chineseLabel}
              {disabled ? ' · 已关闭' : xray ? ' · 透视中' : ''}
              {comparisonRole === 'common'
                ? ' · 共同'
                : comparisonRole === 'first'
                  ? ' · A 独有'
                  : comparisonRole === 'second'
                    ? ' · B 新增'
                    : ''}
            </span>
          </button>
        </Html>
      )}
    </group>
  )
})
