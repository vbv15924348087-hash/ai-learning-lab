import { useCallback, useEffect, useReducer, useRef, useSyncExternalStore } from 'react'
import { TOOL_EXECUTION_INTERVAL, toolExecutionSteps } from '../data/toolExecutionSteps'

type PlaybackState = { currentStep: number; isPlaying: boolean }
type PlaybackAction = 'next' | 'previous' | 'tick' | 'toggle' | 'pause' | 'restart'
const finalStep = toolExecutionSteps.length - 1

function playbackReducer(state: PlaybackState, action: PlaybackAction): PlaybackState {
  switch (action) {
    case 'next':
      return { currentStep: Math.min(finalStep, state.currentStep + 1), isPlaying: false }
    case 'previous':
      return { currentStep: Math.max(0, state.currentStep - 1), isPlaying: false }
    case 'tick': {
      if (!state.isPlaying) return state
      const currentStep = Math.min(finalStep, state.currentStep + 1)
      return { currentStep, isPlaying: currentStep < finalStep }
    }
    case 'toggle':
      return state.currentStep === finalStep ? state : { ...state, isPlaying: !state.isPlaying }
    case 'pause':
      return state.isPlaying ? { ...state, isPlaying: false } : state
    case 'restart':
      return { currentStep: 0, isPlaying: false }
  }
}

const motionQuery = '(prefers-reduced-motion: reduce)'
function subscribeToMotion(onChange: () => void) {
  const media = window.matchMedia?.(motionQuery)
  media?.addEventListener('change', onChange)
  return () => media?.removeEventListener('change', onChange)
}
function getReducedMotion() {
  return window.matchMedia?.(motionQuery).matches ?? false
}

export function useToolExecution(onComplete?: () => void) {
  const [{ currentStep, isPlaying }, dispatch] = useReducer(playbackReducer, {
    currentStep: 0,
    isPlaying: false,
  })
  const reducedMotion = useSyncExternalStore(subscribeToMotion, getReducedMotion, () => false)
  const completionReported = useRef(false)

  useEffect(() => {
    if (currentStep !== finalStep || completionReported.current) return
    completionReported.current = true
    onComplete?.()
  }, [currentStep, onComplete])

  useEffect(() => {
    if (!isPlaying || reducedMotion) return
    const timer = window.setTimeout(() => dispatch('tick'), TOOL_EXECUTION_INTERVAL)
    return () => window.clearTimeout(timer)
  }, [currentStep, isPlaying, reducedMotion])

  useEffect(() => {
    if (reducedMotion) dispatch('pause')
  }, [reducedMotion])

  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.hidden) dispatch('pause')
    }
    document.addEventListener('visibilitychange', pauseWhenHidden)
    return () => document.removeEventListener('visibilitychange', pauseWhenHidden)
  }, [])

  const next = useCallback(() => dispatch('next'), [])
  const previous = useCallback(() => dispatch('previous'), [])
  const restart = useCallback(() => dispatch('restart'), [])
  const togglePlayback = useCallback(() => {
    if (!getReducedMotion() && !document.hidden) dispatch('toggle')
  }, [])

  return {
    currentStep,
    step: toolExecutionSteps[currentStep],
    isPlaying,
    isFinished: currentStep === finalStep,
    reducedMotion,
    next,
    previous,
    restart,
    togglePlayback,
  }
}
