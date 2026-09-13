import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useLearningStore } from '../../../stores/learningStore'
import { modelInsideSteps } from '../data/modelInsideSteps'
import { MODEL_INTERACTION_MODES, MODEL_TERM_IDS, type ModelInsideMode } from '../types'
import { useModelInsideLesson } from './useModelInsideLesson'

beforeEach(() => {
  localStorage.clear()
  useLearningStore.getState().resetProgress()
})
afterEach(cleanup)

function startAt(mode: ModelInsideMode) {
  useLearningStore.getState().updateModelInsideProgress({
    currentStep: modelInsideSteps.findIndex((step) => step.mode === mode),
  })
  return renderHook(useModelInsideLesson)
}

describe('Model Inside learning interactions', () => {
  it.each(MODEL_INTERACTION_MODES)(
    'requires the %s interaction before advancing or unlocking its term',
    (mode) => {
      const { result } = startAt(mode)
      const before = result.current.currentStep
      const term = result.current.step.unlockedTerm
      expect(result.current.interactionDone(mode)).toBe(false)
      if (term) expect(result.current.unlockedTerms).not.toContain(term)
      act(() => result.current.next())
      expect(result.current.currentStep).toBe(before)
      act(() => result.current.completeInteraction(mode))
      expect(result.current.interactionDone(mode)).toBe(true)
      if (term) expect(result.current.unlockedTerms).toContain(term)
      act(() => result.current.next())
      expect(result.current.currentStep).toBe(before + 1)
    },
  )

  it('ignores out-of-step and delayed animation completion callbacks', () => {
    const { result } = startAt('tokenization')
    act(() => result.current.completeInteraction('transformer'))
    expect(result.current.unlockedTerms).toEqual([])
    act(() => result.current.completeInteraction('tokenization'))
    act(() => result.current.next())
    act(() => result.current.completeInteraction('tokenization'))
    expect(result.current.interactionDone('embedding')).toBe(false)
    expect(result.current.unlockedTerms).toEqual(['token'])
  })

  it('keeps animation callbacks stable and duplicate completions do not notify subscribers again', () => {
    const { result, rerender } = startAt('transformer')
    const complete = result.current.completeInteraction
    const next = result.current.next
    rerender()
    expect(result.current.completeInteraction).toBe(complete)
    act(() => result.current.completeInteraction('transformer'))
    expect(result.current.completeInteraction).toBe(complete)
    expect(result.current.next).toBe(next)
    const completedState = useLearningStore.getState()
    act(() => result.current.completeInteraction('transformer'))
    expect(useLearningStore.getState()).toBe(completedState)
    act(() => result.current.next())
    expect(result.current.completeInteraction).toBe(complete)
  })

  it('requires all actual interactions, summary, and challenge before completing; a replay keeps achievements', () => {
    useLearningStore.getState().updateOverviewProgress({ currentStep: 7 })
    useLearningStore.getState().updateContextProgress({ currentStep: 5 })
    const { result } = renderHook(useModelInsideLesson)
    act(() => result.current.passChallenge())
    expect(result.current.challengePassed).toBe(false)
    for (let index = 0; index < modelInsideSteps.length - 1; index += 1) {
      const mode = result.current.step.mode
      if (MODEL_INTERACTION_MODES.some((item) => item === mode)) {
        act(() => result.current.completeInteraction(mode))
      }
      act(() => result.current.next())
    }
    expect(result.current.step.mode).toBe('summary')
    expect(result.current.unlockedTerms).toEqual(MODEL_TERM_IDS)
    expect(useLearningStore.getState().modelInsideProgress.summaryReached).toBe(true)
    expect(useLearningStore.getState().completedLessonIds).toEqual([])
    expect(useLearningStore.getState().unlockedLessonIds).not.toContain('agent-loop')
    act(() => result.current.passChallenge())
    expect(useLearningStore.getState().completedLessonIds).toEqual(['model-inside'])
    expect(useLearningStore.getState().lessonProgress['model-inside']).toBe(100)
    expect(useLearningStore.getState().unlockedLessonIds).toContain('tools')
    expect(useLearningStore.getState().currentLessonId).toBe('model-inside')
    act(() => result.current.restart())
    expect(result.current.currentStep).toBe(0)
    expect(result.current.furthestStep).toBe(0)
    expect(result.current.challengePassed).toBe(true)
    expect(result.current.unlockedTerms).toEqual(MODEL_TERM_IDS)
    expect(useLearningStore.getState().lessonProgress['model-inside']).toBe(100)
    expect(useLearningStore.getState().currentStep).toBe(7)
    expect(useLearningStore.getState().contextProgress.currentStep).toBe(5)
  })

  it('does not accept a challenge on a final step with missing interactions', () => {
    const { result } = startAt('summary')
    act(() => result.current.passChallenge())
    expect(result.current.challengePassed).toBe(false)
    expect(useLearningStore.getState().completedLessonIds).toEqual([])
  })

  it('bounds navigation and keeps discovered terms when moving back', () => {
    const { result } = renderHook(useModelInsideLesson)
    act(() => result.current.previous())
    expect(result.current.currentStep).toBe(0)
    act(() => result.current.next())
    act(() => result.current.completeInteraction('tokenization'))
    act(() => result.current.next())
    act(() => result.current.previous())
    expect(result.current.step.mode).toBe('tokenization')
    expect(result.current.furthestStep).toBe(2)
    expect(result.current.unlockedTerms).toEqual(['token'])
    act(() => useLearningStore.getState().updateModelInsideProgress({ currentStep: 8 }))
    act(() => result.current.next())
    expect(result.current.currentStep).toBe(8)
  })
})
