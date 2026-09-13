import { useCallback } from 'react'
import { useLearningStore } from '../../../stores/learningStore'
import { modelInsideSteps } from '../data/modelInsideSteps'
import {
  hasModelInteractions,
  isModelInteraction,
  MODEL_INSIDE_LESSON_ID,
  type ModelInsideMode,
} from '../types'

export function useModelInsideLesson() {
  const progress = useLearningStore((state) => state.modelInsideProgress)
  const step = modelInsideSteps[progress.currentStep]

  const goToStep = useCallback((index: number) => {
    const state = useLearningStore.getState()
    const current = state.modelInsideProgress
    const bounded = Math.max(0, Math.min(index, modelInsideSteps.length - 1))
    if (bounded === current.currentStep) return
    const nextStep = modelInsideSteps[bounded]
    state.updateModelInsideProgress({
      currentStep: bounded,
      furthestStep: Math.max(current.furthestStep, bounded),
      summaryReached: current.summaryReached || nextStep.mode === 'summary',
      unlockedTerms: [
        ...new Set([
          ...current.unlockedTerms,
          ...(nextStep.mode === 'inference' ? ['inference' as const] : []),
        ]),
      ],
    })
    state.completeLesson(MODEL_INSIDE_LESSON_ID)
  }, [])

  const next = useCallback(() => {
    const current = useLearningStore.getState().modelInsideProgress
    const active = modelInsideSteps[current.currentStep]
    if (isModelInteraction(active.mode) && !current.completedInteractions.includes(active.mode)) {
      return
    }
    goToStep(current.currentStep + 1)
  }, [goToStep])

  const completeInteraction = useCallback((mode: ModelInsideMode) => {
    const state = useLearningStore.getState()
    const current = state.modelInsideProgress
    const active = modelInsideSteps[current.currentStep]
    // A delayed animation callback cannot award a different or unvisited step.
    if (!isModelInteraction(mode) || active.mode !== mode) return
    if (current.completedInteractions.includes(mode)) return
    state.updateModelInsideProgress({
      completedInteractions: [...new Set([...current.completedInteractions, mode])],
      unlockedTerms: [
        ...new Set([
          ...current.unlockedTerms,
          ...(active.unlockedTerm ? [active.unlockedTerm] : []),
        ]),
      ],
    })
  }, [])

  const passChallenge = useCallback(() => {
    const state = useLearningStore.getState()
    const current = state.modelInsideProgress
    if (!current.summaryReached || !hasModelInteractions(current)) return
    if (!current.challengePassed) state.updateModelInsideProgress({ challengePassed: true })
    state.completeLesson(MODEL_INSIDE_LESSON_ID)
  }, [])

  const previous = useCallback(
    () => goToStep(useLearningStore.getState().modelInsideProgress.currentStep - 1),
    [goToStep],
  )
  const restart = useCallback(() => useLearningStore.getState().restartModelInside(), [])

  return {
    step,
    currentStep: progress.currentStep,
    furthestStep: progress.furthestStep,
    unlockedTerms: progress.unlockedTerms,
    challengePassed: progress.challengePassed,
    next,
    previous,
    restart,
    completeInteraction,
    interactionDone: (mode: ModelInsideMode) =>
      isModelInteraction(mode) && progress.completedInteractions.includes(mode),
    passChallenge,
  }
}
