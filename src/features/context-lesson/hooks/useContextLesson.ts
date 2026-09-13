import { useCallback, useEffect, useState } from 'react'
import { useLearningStore } from '../../../stores/learningStore'
import { contextLessonSteps } from '../data/contextLessonSteps'
import { CONTEXT_LESSON_ID, type ContextProgress, type ContextSourceId } from '../types'

export const CONTEXT_AUTOPLAY_INTERVAL = 7500

export function useContextLesson() {
  const progress = useLearningStore((state) => state.contextProgress)
  const {
    currentStep,
    furthestStep,
    unlockedTerms,
    predictionChoice,
    engineeringPassed,
    challengePassed,
  } = progress
  const [playing, setPlaying] = useState(false)
  const [selection, setSelection] = useState<{ step: number; id: ContextSourceId | null } | null>(
    null,
  )
  const [noisy, updateNoisy] = useState(false)
  const step = contextLessonSteps[currentStep]
  const lastStep = currentStep === contextLessonSteps.length - 1
  const selectedSource =
    selection?.step === currentStep
      ? selection.id
      : step.variant === 'sources'
        ? (step.activeSource ?? null)
        : null
  const gateBlocked =
    (step.gate === 'prediction' && !predictionChoice) ||
    (step.gate === 'engineering' && !engineeringPassed)

  const goToStep = useCallback((index: number) => {
    const state = useLearningStore.getState()
    const current = state.contextProgress
    const bounded = Math.max(0, Math.min(index, contextLessonSteps.length - 1))
    const next = contextLessonSteps[bounded]
    state.updateContextProgress({
      currentStep: bounded,
      furthestStep: Math.max(current.furthestStep, bounded),
      unlockedTerms: [
        ...new Set([
          ...current.unlockedTerms,
          ...(next.unlocks ?? []).filter(
            (term) => term !== 'context-engineering' || current.engineeringPassed,
          ),
        ]),
      ],
    })
    setSelection(null)
    if (next.gate || bounded === contextLessonSteps.length - 1) setPlaying(false)
    // A replay can already have earned the challenge achievements.
    state.completeLesson(CONTEXT_LESSON_ID)
  }, [])

  const advance = useCallback(() => {
    const current = useLearningStore.getState().contextProgress
    const active = contextLessonSteps[current.currentStep]
    if (
      (active.gate === 'prediction' && !current.predictionChoice) ||
      (active.gate === 'engineering' && !current.engineeringPassed)
    ) {
      setPlaying(false)
      return
    }
    goToStep(current.currentStep + 1)
  }, [goToStep])

  useEffect(() => {
    if (!playing || gateBlocked || lastStep) return
    const timer = window.setTimeout(advance, CONTEXT_AUTOPLAY_INTERVAL)
    return () => window.clearTimeout(timer)
  }, [advance, currentStep, gateBlocked, lastStep, playing])

  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.hidden) setPlaying(false)
    }
    document.addEventListener('visibilitychange', pauseWhenHidden)
    return () => document.removeEventListener('visibilitychange', pauseWhenHidden)
  }, [])

  function choosePrediction(choice: ContextProgress['predictionChoice']) {
    setPlaying(false)
    useLearningStore.getState().updateContextProgress({ predictionChoice: choice })
  }

  function passEngineering() {
    const state = useLearningStore.getState()
    const gateIndex = contextLessonSteps.findIndex((item) => item.gate === 'engineering')
    if (gateIndex < 0 || state.contextProgress.furthestStep < gateIndex) return
    setPlaying(false)
    state.updateContextProgress({
      engineeringPassed: true,
      unlockedTerms: [
        ...new Set([...state.contextProgress.unlockedTerms, 'context-engineering' as const]),
      ],
    })
    state.completeLesson(CONTEXT_LESSON_ID)
  }

  function passChallenge() {
    const state = useLearningStore.getState()
    if (
      state.contextProgress.furthestStep < contextLessonSteps.length - 1 ||
      !state.contextProgress.engineeringPassed
    )
      return
    setPlaying(false)
    state.updateContextProgress({ challengePassed: true })
    state.completeLesson(CONTEXT_LESSON_ID)
  }

  function restart() {
    setPlaying(false)
    setSelection(null)
    updateNoisy(false)
    useLearningStore.getState().restartContext()
  }

  return {
    step,
    currentStep,
    furthestStep,
    unlockedTerms,
    predictionChoice,
    playing,
    selectedSource,
    noisy,
    lastStep,
    gateBlocked,
    engineeringPassed,
    challengePassed,
    choosePrediction,
    restart,
    passEngineering,
    passChallenge,
    pause: () => setPlaying(false),
    selectSource: (id: ContextSourceId | null) => {
      setPlaying(false)
      setSelection({ step: currentStep, id })
    },
    setNoisy: (value: boolean) => {
      setPlaying(false)
      updateNoisy(value)
    },
    next: () => {
      setPlaying(false)
      advance()
    },
    previous: () => {
      setPlaying(false)
      goToStep(currentStep - 1)
    },
    togglePlayback: () => setPlaying((value) => !value && !gateBlocked && !lastStep),
  }
}
