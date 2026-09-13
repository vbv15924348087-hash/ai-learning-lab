import { memo, useCallback, useMemo, useRef } from 'react'
import { extend, useFrame } from '@react-three/fiber'
import {
  CylinderGeometry,
  OctahedronGeometry,
  SphereGeometry,
  TorusGeometry,
  PerspectiveCamera,
} from 'three'
import { SceneCanvas } from '../../../components/three/SceneCanvas'
import type { ExploreSceneProps } from '../types'
import { CameraController } from './CameraController'
import { FlowConnections } from './FlowConnections'
import { SceneNode } from './SceneNode'
import { SystemEnvironment } from './SystemEnvironment'
import { LabelCollision, type LabelElements } from './LabelCollision'
import { labelPriority } from './labelPriority'
import './scene.css'

extend({ CylinderGeometry, OctahedronGeometry, SphereGeometry, TorusGeometry, PerspectiveCamera })

const SceneContent = memo(function SceneContent(props: ExploreSceneProps) {
  const {
    nodes,
    connections,
    selectedId,
    relatedIds,
    activeEdgeIds,
    learnedNodeIds,
    unlockedNodeIds,
    playing,
    reducedMotion,
    enabled,
    onSelect,
    onPerformance,
    onSelectConnection,
    selectedConnectionId,
    xrayNodeId,
    frameNodeIds,
    disabledNodeIds,
    disabledEdgeIds,
    immersive,
    pathNodeIds,
    edgeStates,
    packetType,
    comparison,
    compareFilter = 'all',
  } = props
  const cameraActive = useRef(false)
  const sample = useRef({ elapsed: 0, frames: 0, sent: false })
  const onInteraction = useCallback((active: boolean) => {
    cameraActive.current = active
  }, [])
  const labels = useRef<LabelElements>(new Map())
  const registerLabel = useCallback((id: string, element: HTMLButtonElement | null) => {
    if (element) labels.current.set(id, element)
    else labels.current.delete(id)
  }, [])
  const related = useMemo(() => new Set(relatedIds), [relatedIds])
  const learned = useMemo(() => new Set(learnedNodeIds), [learnedNodeIds])
  const disabled = useMemo(() => new Set(disabledNodeIds), [disabledNodeIds])
  const pathNodes = useMemo(() => (pathNodeIds ? new Set(pathNodeIds) : null), [pathNodeIds])
  const comparisonNodes = useMemo(
    () =>
      comparison
        ? {
            common: new Set(comparison.commonNodeIds),
            first: new Set(comparison.firstOnlyNodeIds),
            second: new Set(comparison.secondOnlyNodeIds),
            visible: new Set(comparison.visibleNodeIds),
          }
        : null,
    [comparison],
  )
  const framed = useMemo(() => (frameNodeIds ? new Set(frameNodeIds) : undefined), [frameNodeIds])
  const labelPathIds = comparison?.visibleNodeIds ?? pathNodeIds
  const labelPath = useMemo(
    () => (labelPathIds ? new Set(labelPathIds) : undefined),
    [labelPathIds],
  )
  const unlocked = useMemo(
    () => (unlockedNodeIds ? new Set(unlockedNodeIds) : null),
    [unlockedNodeIds],
  )
  const visibleLabels = useMemo(() => {
    // The focused immersive module has priority over unrelated core labels.
    const ordered = [...nodes].sort(
      (a, b) =>
        labelPriority(a, selectedId, related, framed, labelPath) -
        labelPriority(b, selectedId, related, framed, labelPath),
    )
    return new Set(ordered.slice(0, 17).map((node) => node.id))
  }, [nodes, selectedId, related, framed, labelPath])

  useFrame((state, delta) => {
    const active = enabled && (cameraActive.current || (playing && !reducedMotion))
    if (!active || sample.current.sent || !onPerformance) return
    // Ignore the first resumed frame after a demand-rendered pause; it measures idle time, not rendering work.
    if (delta > 0.2) return
    sample.current.elapsed += delta
    sample.current.frames += 1
    if (sample.current.elapsed >= 5) {
      sample.current.sent = true
      onPerformance({
        fps: Math.round(sample.current.frames / sample.current.elapsed),
        drawCalls: state.gl.info.render.calls,
        triangles: state.gl.info.render.triangles,
      })
    }
  })

  return (
    <>
      <CameraController {...props} onInteraction={onInteraction} />
      <SystemEnvironment nodes={nodes} />
      <FlowConnections
        nodes={nodes}
        connections={connections}
        selectedId={selectedId}
        relatedIds={relatedIds}
        activeEdgeIds={activeEdgeIds}
        animate={playing && enabled && !reducedMotion}
        onSelectConnection={onSelectConnection}
        selectedConnectionId={selectedConnectionId}
        disabledNodeIds={disabledNodeIds}
        disabledEdgeIds={disabledEdgeIds}
        immersive={immersive}
        edgeStates={edgeStates}
        packetType={packetType}
        comparison={comparison}
        compareFilter={compareFilter}
      />
      {nodes.map((node) => {
        const comparisonRole = comparisonNodes?.common.has(node.id)
          ? 'common'
          : comparisonNodes?.first.has(node.id)
            ? 'first'
            : comparisonNodes?.second.has(node.id)
              ? 'second'
              : undefined
        const comparisonVisible =
          !comparisonNodes ||
          (compareFilter === 'common'
            ? comparisonRole === 'common'
            : compareFilter === 'added'
              ? comparisonRole === 'second'
              : compareFilter === 'differences'
                ? comparisonRole === 'first' || comparisonRole === 'second'
                : comparisonNodes.visible.has(node.id))
        const dimmed = comparisonNodes
          ? !comparisonVisible
          : pathNodes
            ? !pathNodes.has(node.id) && node.id !== selectedId
            : selectedId !== null && node.id !== selectedId && !related.has(node.id)
        return (
          <SceneNode
            key={node.id}
            node={node}
            selected={node.id === selectedId}
            related={related.has(node.id) || (pathNodes?.has(node.id) ?? false)}
            dimmed={dimmed}
            learned={learned.has(node.id)}
            unlocked={unlocked === null || unlocked.has(node.id)}
            showLabel={visibleLabels.has(node.id)}
            xray={node.id === xrayNodeId}
            disabled={disabled.has(node.id)}
            immersive={immersive}
            comparisonRole={comparisonVisible ? comparisonRole : undefined}
            onSelect={onSelect}
            registerLabel={registerLabel}
          />
        )
      })}
      <LabelCollision
        immersive={immersive}
        pathNodeIds={labelPathIds}
        nodes={nodes}
        selectedId={selectedId}
        relatedIds={relatedIds}
        frameNodeIds={frameNodeIds}
        elements={labels}
      />
    </>
  )
})

const ExploreScene = memo(function ExploreScene(props: ExploreSceneProps) {
  return (
    <div
      className="explore-scene-canvas"
      data-renderer="webgl"
      data-immersive={props.immersive || undefined}
      aria-label="可点击探索的 AI 系统三维空间"
    >
      <SceneCanvas onFailure={props.onFailure}>
        <SceneContent {...props} />
      </SceneCanvas>
    </div>
  )
})

export default ExploreScene
