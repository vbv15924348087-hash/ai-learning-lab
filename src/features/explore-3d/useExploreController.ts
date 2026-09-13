import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useSearchParams } from 'react-router-dom'
import { exploreNodes, taskSteps, tourStops } from './data'
import type { CameraPose, ExploreDepth, ExploreMode } from './types'

const reducedQuery = '(prefers-reduced-motion: reduce)'
function subscribeMotion(callback: () => void) {
  const query = window.matchMedia?.(reducedQuery)
  query?.addEventListener('change', callback)
  return () => query?.removeEventListener('change', callback)
}
const readMotion = () => window.matchMedia?.(reducedQuery).matches ?? false
const serverMotion = () => true
const clampIndex = (value: string | null, length: number) =>
  Math.max(0, Math.min(length - 1, Number.parseInt(value ?? '0', 10) || 0))

function readPose(value: string | null): CameraPose | undefined {
  if (!value) return undefined
  const coordinates = value.split(',').map(Number)
  if (coordinates.length !== 6 || coordinates.some((n) => !Number.isFinite(n) || Math.abs(n) > 70))
    return undefined
  return {
    position: [coordinates[0], coordinates[1], coordinates[2]],
    target: [coordinates[3], coordinates[4], coordinates[5]],
  }
}

export function useExploreController(suspended = false) {
  const [params, setParams] = useSearchParams()
  const pendingParams = useRef<{ base: URLSearchParams; next: URLSearchParams } | null>(null)
  const reducedMotion = useSyncExternalStore(subscribeMotion, readMotion, serverMotion)
  const [playing, setPlaying] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const [pageVisible, setPageVisible] = useState(() => document.visibilityState !== 'hidden')
  const [inView, setInView] = useState(true)
  const surfaceRef = useRef<HTMLDivElement>(null)
  const rawMode = params.get('mode')
  const mode: ExploreMode = rawMode === 'guided' || rawMode === 'task' ? rawMode : 'free'
  const depth = clampIndex(params.get('depth'), 3) as ExploreDepth
  const taskStep = clampIndex(params.get('step'), taskSteps.length)
  const tourStep = clampIndex(params.get('stop'), tourStops.length)
  const currentTask = taskSteps[taskStep]
  const currentStop = tourStops[tourStep]
  const requestedNode = params.get('node')
  const selectedId = exploreNodes.some((n) => n.id === requestedNode)
    ? requestedNode
    : mode === 'task'
      ? currentTask.nodeId
      : mode === 'guided'
        ? currentStop.nodeId
        : null
  const cameraPose = readPose(params.get('view'))
  const enabled = pageVisible && inView && !suspended
  const isPlaying = playing && enabled && !reducedMotion && mode === 'task'

  const patch = useCallback(
    (values: Record<string, string | null>, replace = false) => {
      // Router search-param updates do not queue like React state. A pointer
      // interaction may select a node and finish camera controls in one tick.
      const previous = pendingParams.current?.base === params ? pendingParams.current.next : params
      const next = new URLSearchParams(previous)
      for (const [key, value] of Object.entries(values)) {
        if (value === null) next.delete(key)
        else next.set(key, value)
      }
      pendingParams.current = { base: params, next }
      setParams(next, { replace, preventScrollReset: true })
    },
    [params, setParams],
  )

  const selectNode = useCallback(
    (id: string) => {
      if (!exploreNodes.some((node) => node.id === id)) return
      setPlaying(false)
      patch({ node: id, view: null })
    },
    [patch],
  )

  const changeMode = useCallback(
    (next: ExploreMode) => {
      setPlaying(false)
      patch({
        mode: next === 'free' ? null : next,
        view: null,
        node: next === 'task' ? currentTask.nodeId : next === 'guided' ? currentStop.nodeId : null,
      })
    },
    [patch, currentTask.nodeId, currentStop.nodeId],
  )

  const reset = useCallback(() => {
    setPlaying(false)
    setResetKey((key) => key + 1)
    patch({ node: null, view: null, depth: null, mode: null })
  }, [patch])

  const changeDepth = useCallback(
    (next: ExploreDepth) => {
      if (next !== depth) patch({ depth: next ? String(next) : null }, true)
    },
    [depth, patch],
  )

  // Disclosure is explicit UI state. Legacy scene callbacks may provide a
  // second depth hint, but saving a camera pose must never change that state.
  const changeCamera = useCallback(
    (pose: CameraPose) => {
      patch(
        {
          view: [...pose.position, ...pose.target].map((v) => v.toFixed(2)).join(','),
        },
        true,
      )
    },
    [patch],
  )

  const jumpTask = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(taskSteps.length - 1, index))
      setPlaying(false)
      patch({ mode: 'task', step: String(next), node: taskSteps[next].nodeId, view: null })
    },
    [patch],
  )

  const jumpTour = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(tourStops.length - 1, index))
      setPlaying(false)
      patch({ mode: 'guided', stop: String(next), node: tourStops[next].nodeId, view: null })
    },
    [patch],
  )

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      setPlaying(false)
      return
    }
    if (reducedMotion) return
    if (taskStep === taskSteps.length - 1)
      patch({ mode: 'task', step: '0', node: taskSteps[0].nodeId, view: null })
    else patch({ mode: 'task', node: currentTask.nodeId, view: null })
    setPlaying(true)
  }, [isPlaying, reducedMotion, taskStep, currentTask.nodeId, patch])

  useEffect(() => {
    const onVisibility = () => {
      const visible = document.visibilityState !== 'hidden'
      setPageVisible(visible)
      if (!visible) setPlaying(false)
    }
    document.addEventListener('visibilitychange', onVisibility)
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            ([entry]) => {
              setInView(entry.isIntersecting)
              if (!entry.isIntersecting) setPlaying(false)
            },
            { threshold: 0.08 },
          )
    if (surfaceRef.current) observer?.observe(surfaceRef.current)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      observer?.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!isPlaying) return
    const timer = window.setTimeout(() => {
      if (taskStep >= taskSteps.length - 1) {
        setPlaying(false)
        return
      }
      const next = taskStep + 1
      patch({ step: String(next), node: taskSteps[next].nodeId, view: null }, true)
      if (next === taskSteps.length - 1) setPlaying(false)
    }, 3200)
    return () => window.clearTimeout(timer)
  }, [isPlaying, taskStep, patch])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (suspended) return
      const target = event.target as HTMLElement | null
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        target?.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]')
      )
        return
      if (event.key === 'Escape' || event.key.toLowerCase() === 'r') {
        event.preventDefault()
        reset()
      } else if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && mode !== 'free') {
        event.preventDefault()
        const delta = event.key === 'ArrowRight' ? 1 : -1
        if (mode === 'task') jumpTask(taskStep + delta)
        else jumpTour(tourStep + delta)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [reset, jumpTask, jumpTour, mode, taskStep, tourStep, suspended])

  useEffect(() => {
    const stop = () => setPlaying(false)
    window.addEventListener('popstate', stop)
    return () => window.removeEventListener('popstate', stop)
  }, [])

  return {
    mode,
    depth,
    taskStep,
    tourStep,
    selectedId,
    cameraPose,
    currentTask,
    currentStop,
    reducedMotion,
    isPlaying,
    enabled,
    resetKey,
    surfaceRef,
    selectNode,
    changeMode,
    reset,
    changeDepth,
    changeCamera,
    jumpTask,
    jumpTour,
    togglePlayback,
    pause: () => setPlaying(false),
  }
}
