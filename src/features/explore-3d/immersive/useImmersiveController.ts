import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { exploreConnections, exploreNodes } from '../data'
import { getDisplayedConnections, getVisibleNodes } from '../graph'
import type { CameraPose, ExploreDepth, ExploreMode } from '../types'
import { experiments } from './experiments'
import { getInteriorGraph, getRelationGraph } from './graph'
import { moduleInteriors } from './interiors'
import {
  approvalIndex,
  clampTaskIndex,
  comparePaths,
  getContextUsage,
  getEdgeStates,
  resolvedTaskSteps,
} from './scenarioEngine'
import {
  allTaskScenarios,
  getTaskScenario,
  gpuComplexityLadder,
  immersiveScenarioNodes,
  simulatorGraph,
  taskScenarios,
  whyNotThisNode,
  whyThisNode,
  type ApprovalStatus,
  type CompareFilter,
  type PacketType,
} from './scenarios'
import type { ExplanationLevel, ImmersiveView, ModuleId, RelationDirection } from './types'

export type ImmersiveInitial = {
  selectedId: string | null
  depth: ExploreDepth
  mode: ExploreMode
  taskStep: number
  cameraPose?: CameraPose
}
const moduleIds: ModuleId[] = ['context', 'model', 'harness']
const isModule = (id: string | null): id is ModuleId => moduleIds.includes(id as ModuleId)

export function useImmersiveController(initial: ImmersiveInitial, reducedMotion: boolean) {
  const [view, setView] = useState<ImmersiveView>(initial.mode === 'task' ? 'task' : 'free')
  const [selectedId, setSelectedId] = useState<string | null>(initial.selectedId)
  const [depth, setDepth] = useState<ExploreDepth>(initial.depth)
  const [cameraPose, setCameraPose] = useState(initial.cameraPose)
  const [resetKey, setResetKey] = useState(0)
  const [scope, setScope] = useState<ModuleId | null>(null)
  const [direction, setDirection] = useState<RelationDirection>('all')
  const [level, setLevel] = useState<ExplanationLevel>('beginner')
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
  const [navOpen, setNavOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(Boolean(initial.selectedId))
  const [legendOpen, setLegendOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState(taskScenarios[0].id)
  const [compareTaskIds, updateCompareTaskIds] = useState<[string, string]>(['simple', 'research'])
  const [compareFilter, setCompareFilter] = useState<CompareFilter>('all')
  const [approvalDecision, setApprovalDecision] = useState<ApprovalStatus>('pending')
  const [taskIndex, setTaskIndex] = useState(
    clampTaskIndex(taskScenarios[0].steps, initial.taskStep, 'not-required'),
  )
  const [experimentId, setExperimentId] = useState(experiments[0].id)
  const [altered, setAltered] = useState(false)
  const [hasRun, setHasRun] = useState(false)
  const [experimentIndex, setExperimentIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [visible, setVisible] = useState(document.visibilityState !== 'hidden')
  const surfaceRef = useRef<HTMLDivElement>(null)
  const catalog = useMemo(
    () => [...immersiveScenarioNodes, ...Object.values(moduleInteriors).flatMap((m) => m.nodes)],
    [],
  )
  const taskScenario = getTaskScenario(view === 'compare' ? compareTaskIds[1] : selectedTaskId)
  const approvalStatus: ApprovalStatus =
    taskScenario.category === 'high-risk' ? approvalDecision : 'not-required'
  const activeTaskSteps = useMemo(
    () => resolvedTaskSteps(taskScenario, approvalStatus),
    [taskScenario, approvalStatus],
  )
  const experiment = experiments.find((e) => e.id === experimentId) ?? experiments[0]
  const outcome = altered ? experiment.altered : experiment.normal
  const steps = view === 'experiments' ? outcome.steps : activeTaskSteps
  const index = Math.min(view === 'experiments' ? experimentIndex : taskIndex, steps.length - 1)
  const step = steps[index]
  const timelineVisible =
    view === 'task' || view === 'compare' || (view === 'experiments' && hasRun)
  const waitingApproval =
    view !== 'experiments' &&
    timelineVisible &&
    approvalStatus === 'pending' &&
    activeTaskSteps[index]?.gate === 'approval'
  const isPlaying =
    playing &&
    visible &&
    !reducedMotion &&
    timelineVisible &&
    !waitingApproval &&
    !(view !== 'experiments' && approvalStatus === 'rejected')
  const pause = useCallback(() => setPlaying(false), [])

  const selectNode = useCallback(
    (id: string) => {
      // Computational L2 concepts have a dedicated Model interior, even when
      // search finds their original catalog entry before the interior alias.
      if (['token', 'embedding', 'transformer', 'attention'].includes(id)) {
        id = `inside-model-${id}`
      }
      setPlaying(false)
      setSelectedId(id)
      setSelectedEdgeId(null)
      setCameraPose(undefined)
      setDetailOpen(true)
      const owner = moduleIds.find((moduleId) =>
        moduleInteriors[moduleId].nodes.some((n) => n.id === id),
      )
      if (owner && scope !== owner) {
        setScope(owner)
        setView('xray')
      } else if (isModule(id) && view === 'xray') setScope(id)
      else if (scope && id !== scope && !owner) {
        setScope(null)
        setView('free')
      }
    },
    [scope, view],
  )

  const selectTask = useCallback((id: string) => {
    if (!allTaskScenarios.some((task) => task.id === id)) return
    setSelectedTaskId(id)
    setTaskIndex(0)
    setApprovalDecision('pending')
    setPlaying(false)
    setScope(null)
    setView('task')
    setSelectedId(getTaskScenario(id).steps[0].nodeId)
    setSelectedEdgeId(null)
    setCameraPose(undefined)
  }, [])
  const setComplexityLevel = useCallback(
    (value: number) => {
      const next = Math.max(1, Math.min(5, Math.round(Number.isFinite(value) ? value : 1)))
      selectTask(gpuComplexityLadder[next - 1].id)
    },
    [selectTask],
  )
  const setCompareTaskIds = useCallback((ids: [string, string]) => {
    if (ids.some((id) => !allTaskScenarios.some((task) => task.id === id))) return
    updateCompareTaskIds(ids)
    setTaskIndex(0)
    setApprovalDecision('pending')
    setPlaying(false)
    setSelectedId(getTaskScenario(ids[1]).steps[0].nodeId)
    setSelectedEdgeId(null)
    setCameraPose(undefined)
  }, [])

  const changeView = useCallback(
    (next: ImmersiveView) => {
      setPlaying(false)
      setView(next)
      setScope(null)
      setSelectedEdgeId(null)
      setCameraPose(undefined)
      const owner = moduleIds.find((id) =>
        moduleInteriors[id].nodes.some((n) => n.id === selectedId),
      )
      if (next === 'free' && owner) setSelectedId(owner)
      if (next === 'relations') setSelectedId(owner ?? selectedId ?? 'context')
      if (next === 'xray') {
        const moduleId = isModule(selectedId) ? selectedId : (owner ?? 'model')
        setScope(moduleId)
        setSelectedId(moduleId)
      }
      if (next === 'task' || next === 'compare') {
        const task = getTaskScenario(next === 'compare' ? compareTaskIds[1] : selectedTaskId)
        // A mode change starts a separate run; approval cannot cross between runs.
        setTaskIndex(0)
        setApprovalDecision('pending')
        setSelectedId(task.steps[0].nodeId)
      }
      if (next === 'experiments') {
        setSelectedId(outcome.steps[hasRun ? experimentIndex : 0].nodeId)
        setDetailOpen(false)
      }
    },
    [selectedId, selectedTaskId, compareTaskIds, outcome.steps, hasRun, experimentIndex],
  )

  const enterModule = useCallback((moduleId: ModuleId, xray = false) => {
    setPlaying(false)
    setView(xray ? 'xray' : 'free')
    setScope(moduleId)
    setSelectedId(moduleId)
    setSelectedEdgeId(null)
    setCameraPose(undefined)
    setDetailOpen(false)
  }, [])
  const reset = useCallback(() => {
    setPlaying(false)
    setView('free')
    setScope(null)
    setDepth(0)
    setSelectedId(null)
    setSelectedEdgeId(null)
    setCameraPose(undefined)
    setDetailOpen(false)
    setResetKey((k) => k + 1)
  }, [])

  const jump = useCallback(
    (next: number) => {
      setPlaying(false)
      const restart = next === 0
      const decision = restart
        ? taskScenario.category === 'high-risk'
          ? 'pending'
          : 'not-required'
        : approvalStatus
      const position =
        view === 'experiments'
          ? Math.max(0, Math.min(steps.length - 1, Math.trunc(Number.isFinite(next) ? next : 0)))
          : clampTaskIndex(taskScenario.steps, next, decision)
      if (view === 'experiments') setExperimentIndex(position)
      else {
        setTaskIndex(position)
        if (restart) setApprovalDecision('pending')
      }
      setSelectedId((view === 'experiments' ? steps : taskScenario.steps)[position].nodeId)
      setSelectedEdgeId(null)
      setCameraPose(undefined)
    },
    [steps, view, taskScenario, approvalStatus],
  )
  const restartTask = useCallback(() => jump(0), [jump])
  const decideApproval = useCallback(
    (decision: 'approve' | 'reject') => {
      // The callback independently guards the run; hidden or stale UI cannot approve early.
      if (!waitingApproval || approvalDecision !== 'pending') return
      setPlaying(false)
      setApprovalDecision(decision === 'approve' ? 'approved' : 'rejected')
      if (decision === 'approve') {
        const next = clampTaskIndex(taskScenario.steps, taskIndex + 1, 'approved')
        setTaskIndex(next)
        setSelectedId(taskScenario.steps[next].nodeId)
        setCameraPose(undefined)
      }
    },
    [waitingApproval, approvalDecision, taskScenario, taskIndex],
  )
  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      setPlaying(false)
      return
    }
    if (
      reducedMotion ||
      waitingApproval ||
      (view !== 'experiments' && approvalStatus === 'rejected')
    )
      return
    if (index === steps.length - 1) jump(0)
    else {
      setSelectedId(step.nodeId)
      setCameraPose(undefined)
    }
    setPlaying(true)
  }, [
    isPlaying,
    reducedMotion,
    waitingApproval,
    view,
    approvalStatus,
    index,
    steps.length,
    step.nodeId,
    jump,
  ])

  const changeExperiment = useCallback((id: string) => {
    const next = experiments.find((e) => e.id === id)
    if (!next) return
    setPlaying(false)
    setExperimentId(id)
    setAltered(false)
    setHasRun(false)
    setExperimentIndex(0)
    setSelectedId(next.normal.steps[0].nodeId)
    setSelectedEdgeId(null)
    setCameraPose(undefined)
  }, [])
  const configureExperiment = useCallback(
    (disabled: boolean) => {
      setPlaying(false)
      setAltered(disabled)
      setHasRun(false)
      setExperimentIndex(0)
      setSelectedId((disabled ? experiment.altered : experiment.normal).steps[0].nodeId)
      setSelectedEdgeId(null)
      setCameraPose(undefined)
    },
    [experiment],
  )
  const runExperiment = useCallback(() => {
    setHasRun(true)
    setExperimentIndex(0)
    setSelectedId(outcome.steps[0].nodeId)
    setSelectedEdgeId(null)
    setCameraPose(undefined)
    setPlaying(!reducedMotion)
  }, [outcome.steps, reducedMotion])

  useEffect(() => {
    const onVisibility = () => {
      setVisible(document.visibilityState !== 'hidden')
      setPlaying(false)
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])
  useEffect(() => {
    if (!isPlaying) return
    const timer = window.setTimeout(() => {
      const next =
        view === 'experiments'
          ? Math.min(index + 1, steps.length - 1)
          : clampTaskIndex(taskScenario.steps, index + 1, approvalStatus)
      if (view === 'experiments') setExperimentIndex(next)
      else setTaskIndex(next)
      setSelectedId(steps[next].nodeId)
      setSelectedEdgeId(null)
      setCameraPose(undefined)
      if (
        next === steps.length - 1 ||
        (view !== 'experiments' &&
          activeTaskSteps[next]?.gate === 'approval' &&
          approvalStatus !== 'approved')
      )
        setPlaying(false)
    }, 2400)
    return () => window.clearTimeout(timer)
  }, [isPlaying, index, steps, view, taskScenario, approvalStatus, activeTaskSteps])

  const graph = useMemo(() => {
    if (scope) return getInteriorGraph(scope, view === 'xray')
    if (view === 'task' || view === 'compare') return simulatorGraph
    if (view === 'relations' && selectedId) {
      if (selectedId === 'risk-check') {
        const connections = simulatorGraph.connections.filter((edge) =>
          direction === 'upstream'
            ? edge.to === selectedId
            : direction === 'downstream'
              ? edge.from === selectedId
              : edge.from === selectedId || edge.to === selectedId,
        )
        const ids = new Set([selectedId, ...connections.flatMap((edge) => [edge.from, edge.to])])
        return { nodes: simulatorGraph.nodes.filter((node) => ids.has(node.id)), connections }
      }
      return getRelationGraph(selectedId, direction)
    }
    let nodes = getVisibleNodes(depth, selectedId)
    if (timelineVisible) {
      const activeEdges = exploreConnections.filter((edge) => step.edgeIds.includes(edge.id))
      const ids = new Set([
        ...nodes.map((node) => node.id),
        ...activeEdges.flatMap((edge) => [edge.from, edge.to]),
      ])
      nodes = exploreNodes.filter((node) => ids.has(node.id))
    }
    if (view === 'experiments') {
      const ids = new Set([...nodes.map((n) => n.id), ...experiment.disabledNodeIds])
      nodes = exploreNodes.filter((n) => ids.has(n.id))
    }
    return { nodes, connections: getDisplayedConnections(nodes) }
  }, [
    scope,
    view,
    selectedId,
    direction,
    depth,
    experiment.disabledNodeIds,
    timelineVisible,
    step.edgeIds,
  ])
  const selected = catalog.find((n) => n.id === selectedId)
  const relatedIds = useMemo(() => {
    const ids = selected ? [...selected.upstream, ...selected.downstream, ...selected.related] : []
    if (scope && selectedId === scope)
      ids.push(...moduleInteriors[scope].nodes.map((node) => node.id))
    return ids
  }, [selected, scope, selectedId])
  const frameNodeIds = useMemo(
    () =>
      scope
        ? [scope, ...moduleInteriors[scope].nodes.map((n) => n.id)]
        : view === 'relations' || view === 'task' || view === 'compare'
          ? graph.nodes.map((n) => n.id)
          : undefined,
    [scope, view, graph.nodes],
  )
  const comparison = useMemo(
    () =>
      comparePaths(
        getTaskScenario(compareTaskIds[0]),
        getTaskScenario(compareTaskIds[1]),
        compareFilter,
      ),
    [compareTaskIds, compareFilter],
  )
  const pathNodeIds = useMemo(
    () =>
      view === 'compare'
        ? comparison.visibleNodeIds
        : [...new Set(steps.map((entry) => entry.nodeId))],
    [view, comparison, steps],
  )
  const edgeStates = useMemo(() => {
    const rejectedEdges =
      approvalStatus === 'rejected' && view !== 'experiments'
        ? taskScenario.steps
            .slice(approvalIndex(taskScenario.steps) + 1)
            .flatMap((entry) => entry.edgeIds)
        : []
    return getEdgeStates(
      steps,
      index,
      view === 'experiments' && altered ? experiment.disabledEdgeIds : rejectedEdges,
    )
  }, [steps, index, altered, experiment.disabledEdgeIds, approvalStatus, view, taskScenario])
  const packetType: PacketType =
    step.outcome === 'pass'
      ? 'pass'
      : step.outcome === 'fail'
        ? 'fail'
        : view === 'experiments'
          ? 'task'
          : activeTaskSteps[index].packetType
  const contextUsage = view === 'experiments' ? undefined : getContextUsage(activeTaskSteps, index)
  const selectEdge = useCallback((id: string) => {
    setPlaying(false)
    setSelectedEdgeId(id)
    setDetailOpen(true)
  }, [])
  const changeDepth = useCallback((next: ExploreDepth) => {
    setDepth(next)
    setCameraPose(undefined)
  }, [])
  // Ignore any legacy depth hint: only the level buttons or Reset change
  // disclosure, so manual camera gestures preserve the chosen modules.
  const changeCamera = useCallback((pose: CameraPose) => {
    setCameraPose(pose)
  }, [])
  const whyThis = useCallback(
    (nodeId: string) => whyThisNode(taskScenario, nodeId, level),
    [taskScenario, level],
  )
  const whyNot = useCallback(
    (nodeId: string) => whyNotThisNode(taskScenario, nodeId),
    [taskScenario],
  )

  return {
    view,
    selectedId,
    selected,
    depth,
    cameraPose,
    resetKey,
    scope,
    direction,
    level,
    selectedEdgeId,
    navOpen,
    detailOpen,
    legendOpen,
    catalog,
    graph,
    relatedIds,
    frameNodeIds,
    experiment,
    altered,
    hasRun,
    outcome,
    steps,
    index,
    step,
    timelineVisible,
    isPlaying,
    visible,
    surfaceRef,
    taskScenario,
    selectedTaskId,
    complexityLevel: taskScenario.level,
    compareTaskIds,
    compareFilter,
    comparison,
    approvalStatus,
    waitingApproval,
    pathNodeIds,
    edgeStates,
    packetType,
    contextUsage,
    selectNode,
    changeView,
    enterModule,
    reset,
    jump,
    togglePlayback,
    pause,
    changeExperiment,
    configureExperiment,
    runExperiment,
    setLevel,
    setDirection,
    setNavOpen,
    setDetailOpen,
    setLegendOpen,
    selectEdge,
    changeDepth,
    changeCamera,
    selectTask,
    setComplexityLevel,
    setCompareTaskIds,
    setCompareFilter,
    decideApproval,
    restartTask,
    whyThis,
    whyNot,
  }
}
