import { useCallback } from 'react'
import { useLearningStore } from '../../../stores/learningStore'
import { toolsLessonSteps } from '../data/toolsLessonSteps'
import { hasToolsInteractions, isToolsInteraction, TOOLS_LESSON_ID, type ToolsMode } from '../types'

export function useToolsLesson() {
  const progress = useLearningStore((state) => state.toolsProgress)
  const step = toolsLessonSteps[progress.currentStep]

  const goToStep = useCallback((index: number) => {
    const state = useLearningStore.getState()
    const current = state.toolsProgress
    const bounded = Math.max(0, Math.min(index, toolsLessonSteps.length - 1))
    if (bounded === current.currentStep) return
    state.updateToolsProgress({
      currentStep: bounded,
      furthestStep: Math.max(current.furthestStep, bounded),
      summaryReached: current.summaryReached || toolsLessonSteps[bounded].mode === 'summary',
    })
    state.completeLesson(TOOLS_LESSON_ID)
  }, [])

  const next = useCallback(() => {
    const current = useLearningStore.getState().toolsProgress
    const active = toolsLessonSteps[current.currentStep]
    if (isToolsInteraction(active.mode) && !current.completedInteractions.includes(active.mode))
      return
    goToStep(current.currentStep + 1)
  }, [goToStep])

  const completeInteraction = useCallback((mode: ToolsMode) => {
    const state = useLearningStore.getState()
    const current = state.toolsProgress
    const active = toolsLessonSteps[current.currentStep]
    // Ignore a delayed callback after navigation or a completion from an unvisited activity.
    if (!isToolsInteraction(mode) || active.mode !== mode) return
    if (current.completedInteractions.includes(mode)) return
    state.updateToolsProgress({
      completedInteractions: [...current.completedInteractions, mode],
    })
  }, [])

  const previous = useCallback(
    () => goToStep(useLearningStore.getState().toolsProgress.currentStep - 1),
    [goToStep],
  )
  const restart = useCallback(() => useLearningStore.getState().restartTools(), [])

  const passChallenge = useCallback(() => {
    const state = useLearningStore.getState()
    const current = state.toolsProgress
    if (!current.summaryReached || !hasToolsInteractions(current)) return
    if (!current.challengePassed) state.updateToolsProgress({ challengePassed: true })
    state.completeLesson(TOOLS_LESSON_ID)
  }, [])

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
    interactionDone: (mode: ToolsMode) =>
      isToolsInteraction(mode) && progress.completedInteractions.includes(mode),
    passChallenge,
  }
}
