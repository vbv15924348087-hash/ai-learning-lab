import { act, cleanup, renderHook } from '@testing-library/react'
import { StrictMode, type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useLearningStore } from '../../../stores/learningStore'
import { contextLessonSteps } from '../data/contextLessonSteps'
import { CONTEXT_TERM_IDS } from '../types'
import { CONTEXT_AUTOPLAY_INTERVAL, useContextLesson } from './useContextLesson'

const engineeringIndex = contextLessonSteps.findIndex((step) => step.gate === 'engineering')
const finalIndex = contextLessonSteps.length - 1

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  localStorage.clear()
  useLearningStore.getState().resetProgress()
})

afterEach(() => {
  cleanup()
  vi.clearAllTimers()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

function elapse(milliseconds = CONTEXT_AUTOPLAY_INTERVAL) {
  act(() => vi.advanceTimersByTime(milliseconds))
}

function beginAt(currentStep: number) {
  useLearningStore
    .getState()
    .updateContextProgress({ currentStep, predictionChoice: 'more-information' })
  return renderHook(useContextLesson)
}

describe('Context playback and required interactions', () => {
  it('requires a first prediction and accepts either choice as a learning attempt', () => {
    const { result } = renderHook(useContextLesson)
    expect(result.current.currentStep).toBe(0)
    expect(result.current.gateBlocked).toBe(true)
    expect(result.current.playing).toBe(false)
    act(() => result.current.next())
    act(() => result.current.togglePlayback())
    elapse(CONTEXT_AUTOPLAY_INTERVAL * 2)
    expect(result.current.currentStep).toBe(0)
    act(() => result.current.choosePrediction('only-prompt'))
    expect(result.current.gateBlocked).toBe(false)
    expect(result.current.playing).toBe(false)
    act(() => result.current.togglePlayback())
    elapse(CONTEXT_AUTOPLAY_INTERVAL - 1)
    expect(result.current.currentStep).toBe(0)
    elapse(1)
    expect(result.current.currentStep).toBe(1)
    expect(result.current.playing).toBe(true)
    expect(useLearningStore.getState().completedLessonIds).toEqual([])
  })

  it('pauses at the engineering activity until it is passed', () => {
    const { result } = beginAt(engineeringIndex - 1)
    act(() => result.current.togglePlayback())
    elapse()
    expect(result.current.currentStep).toBe(engineeringIndex)
    expect(result.current.playing).toBe(false)
    expect(result.current.gateBlocked).toBe(true)
    act(() => result.current.next())
    act(() => result.current.togglePlayback())
    elapse(CONTEXT_AUTOPLAY_INTERVAL * 2)
    expect(result.current.currentStep).toBe(engineeringIndex)
    act(() => result.current.passEngineering())
    expect(result.current.engineeringPassed).toBe(true)
    expect(result.current.unlockedTerms).toContain('context-engineering')
    expect(result.current.gateBlocked).toBe(false)
    expect(result.current.playing).toBe(false)
    act(() => result.current.next())
    expect(result.current.currentStep).toBe(engineeringIndex + 1)
    expect(useLearningStore.getState().completedLessonIds).toEqual([])
  })

  it.each(['pause', 'previous', 'next', 'selectSource', 'setNoisy'] as const)(
    'cancels pending playback after manual %s',
    (action) => {
      const { result } = beginAt(3)
      act(() => result.current.togglePlayback())
      elapse(2000)
      act(() => {
        if (action === 'pause') result.current.togglePlayback()
        else if (action === 'selectSource') result.current.selectSource('memory')
        else if (action === 'setNoisy') result.current.setNoisy(true)
        else result.current[action]()
      })
      const afterInteraction = result.current.currentStep
      expect(result.current.playing).toBe(false)
      elapse(CONTEXT_AUTOPLAY_INTERVAL * 3)
      expect(result.current.currentStep).toBe(afterInteraction)
    },
  )

  it('selects a source step default, supports clearing, and chooses the next default on advance', () => {
    const memoryIndex = contextLessonSteps.findIndex(
      (step) => step.variant === 'sources' && step.activeSource === 'memory',
    )
    const { result } = beginAt(memoryIndex)
    expect(result.current.selectedSource).toBe('memory')
    act(() => result.current.selectSource('prompt'))
    expect(result.current.selectedSource).toBe('prompt')
    act(() => result.current.selectSource(null))
    expect(result.current.selectedSource).toBeNull()
    act(() => result.current.next())
    expect(result.current.selectedSource).toBe('rag')
  })

  it('keeps one advancing timer through Strict Mode and cleans up when unmounted', () => {
    useLearningStore
      .getState()
      .updateContextProgress({ currentStep: 2, predictionChoice: 'more-information' })
    const removeListener = vi.spyOn(document, 'removeEventListener')
    const { result, rerender, unmount } = renderHook(useContextLesson, {
      wrapper: ({ children }: { children: ReactNode }) => <StrictMode>{children}</StrictMode>,
    })
    act(() => result.current.togglePlayback())
    elapse(5000)
    rerender()
    rerender()
    elapse(2500)
    expect(result.current.currentStep).toBe(3)
    elapse()
    expect(result.current.currentStep).toBe(4)
    unmount()
    const before = useLearningStore.getState()
    elapse(CONTEXT_AUTOPLAY_INTERVAL * 3)
    expect(useLearningStore.getState()).toBe(before)
    expect(removeListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
  })

  it('pauses in a hidden tab and stops at the final step', () => {
    const { result } = beginAt(finalIndex - 1)
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
    act(() => result.current.togglePlayback())
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(result.current.playing).toBe(false)
    hidden.mockReturnValue(false)
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    elapse()
    expect(result.current.currentStep).toBe(finalIndex - 1)
    act(() => result.current.togglePlayback())
    elapse()
    expect(result.current.currentStep).toBe(finalIndex)
    expect(result.current.lastStep).toBe(true)
    expect(result.current.playing).toBe(false)
    act(() => result.current.togglePlayback())
    act(() => result.current.next())
    elapse(CONTEXT_AUTOPLAY_INTERVAL * 2)
    expect(result.current.currentStep).toBe(finalIndex)
    expect(result.current.playing).toBe(false)
  })
})

describe('Context completion and replay', () => {
  it('unlocks terms at their introduction and retains them while moving back', () => {
    const introductionIndex = contextLessonSteps.findIndex((step) =>
      step.unlocks?.includes('prompt'),
    )
    const { result } = beginAt(introductionIndex - 1)
    expect(result.current.unlockedTerms).toEqual([])
    act(() => result.current.next())
    expect(result.current.unlockedTerms).toEqual(['prompt', 'context'])
    act(() => result.current.previous())
    expect(result.current.unlockedTerms).toEqual(['prompt', 'context'])
    expect(result.current.furthestStep).toBe(introductionIndex)
    expect(useLearningStore.getState().unlockedTerms).toEqual([])
  })

  it('rejects achievements before their activity and completion before both gates', () => {
    const { result } = beginAt(3)
    act(() => result.current.passEngineering())
    act(() => result.current.passChallenge())
    expect(result.current.engineeringPassed).toBe(false)
    expect(result.current.challengePassed).toBe(false)
    act(() => useLearningStore.getState().updateContextProgress({ currentStep: finalIndex }))
    act(() => result.current.passChallenge())
    expect(result.current.challengePassed).toBe(false)
    expect(useLearningStore.getState().completedLessonIds).toEqual([])
    act(() => result.current.passEngineering())
    expect(useLearningStore.getState().completedLessonIds).toEqual([])
    act(() => result.current.passChallenge())
    expect(useLearningStore.getState().completedLessonIds).toEqual(['context'])
    expect(useLearningStore.getState().unlockedLessonIds).toContain('model-inside')
    expect(useLearningStore.getState().lessonCompleted).toBe(false)
  })

  it('restarts paused, preserves earned achievements, and never changes Overview position', () => {
    useLearningStore.getState().updateOverviewProgress({ currentStep: 7 })
    useLearningStore.getState().updateContextProgress({
      currentStep: finalIndex,
      predictionChoice: 'more-information',
      engineeringPassed: true,
      unlockedTerms: [...CONTEXT_TERM_IDS],
    })
    const { result } = renderHook(useContextLesson)
    act(() => result.current.passChallenge())
    act(() => result.current.selectSource('memory'))
    act(() => result.current.setNoisy(true))
    act(() => result.current.restart())
    expect(result.current.currentStep).toBe(0)
    expect(result.current.furthestStep).toBe(0)
    expect(result.current.predictionChoice).toBeNull()
    expect(result.current.selectedSource).toBeNull()
    expect(result.current.noisy).toBe(false)
    expect(result.current.playing).toBe(false)
    expect(result.current.engineeringPassed).toBe(true)
    expect(result.current.challengePassed).toBe(true)
    expect(result.current.unlockedTerms).toEqual(CONTEXT_TERM_IDS)
    expect(useLearningStore.getState().currentStep).toBe(7)
    expect(useLearningStore.getState().completedLessonIds).toEqual(['context'])
    expect(useLearningStore.getState().unlockedLessonIds).toContain('model-inside')
    elapse(CONTEXT_AUTOPLAY_INTERVAL * 2)
    expect(result.current.currentStep).toBe(0)
  })
})
