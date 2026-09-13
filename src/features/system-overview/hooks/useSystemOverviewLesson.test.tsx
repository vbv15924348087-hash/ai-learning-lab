import { act, cleanup, renderHook } from '@testing-library/react'
import { StrictMode, type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest'
import { useLearningStore } from '../../../stores/learningStore'
import { OVERVIEW_STEP_COUNT, OVERVIEW_TERM_IDS } from '../types'
import { AUTOPLAY_INTERVAL, useSystemOverviewLesson } from './useSystemOverviewLesson'

let scheduledTimeouts: MockInstance<typeof window.setTimeout>
let clearedTimeouts: MockInstance<typeof window.clearTimeout>

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  scheduledTimeouts = vi.spyOn(window, 'setTimeout')
  clearedTimeouts = vi.spyOn(window, 'clearTimeout')
  localStorage.clear()
  useLearningStore.getState().resetProgress()
})

afterEach(() => {
  cleanup()
  vi.clearAllTimers()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

function pendingLessonTimerCount() {
  // React and jsdom can schedule their own timeouts; count the lesson's interval only.
  const cancelled = new Set(clearedTimeouts.mock.calls.map(([timer]) => timer))
  return scheduledTimeouts.mock.calls.filter(
    ([, delay], index) =>
      delay === AUTOPLAY_INTERVAL && !cancelled.has(scheduledTimeouts.mock.results[index].value),
  ).length
}

function elapse(milliseconds: number) {
  act(() => {
    vi.advanceTimersByTime(milliseconds)
  })
}

function beginAt(currentStep: number) {
  useLearningStore.getState().updateOverviewProgress({
    currentStep,
    predictionChoice: 'needs-search',
  })
  return renderHook(useSystemOverviewLesson)
}

describe('useSystemOverviewLesson playback', () => {
  it('starts paused, advances only after 7.5 seconds, and stops at the prediction interaction', () => {
    const { result } = renderHook(useSystemOverviewLesson)
    expect(result.current.currentStep).toBe(0)
    expect(result.current.playing).toBe(false)
    expect(pendingLessonTimerCount()).toBe(0)
    elapse(AUTOPLAY_INTERVAL * 2)
    expect(result.current.currentStep).toBe(0)

    act(() => result.current.togglePlayback())
    elapse(AUTOPLAY_INTERVAL - 1)
    expect(result.current.currentStep).toBe(0)
    elapse(1)
    expect(result.current.currentStep).toBe(1)
    expect(result.current.step.gate).toBe('prediction')
    expect(result.current.gateBlocked).toBe(true)
    expect(result.current.playing).toBe(false)
    expect(pendingLessonTimerCount()).toBe(0)

    act(() => result.current.next())
    act(() => result.current.togglePlayback())
    elapse(AUTOPLAY_INTERVAL * 3)
    expect(result.current.currentStep).toBe(1)
    expect(result.current.playing).toBe(false)

    // Both predictions are valid learning attempts, even though one needs correction.
    act(() => result.current.choosePrediction('always'))
    expect(result.current.gateBlocked).toBe(false)
    expect(result.current.playing).toBe(false)
    act(() => result.current.next())
    expect(result.current.currentStep).toBe(2)
    expect(useLearningStore.getState().completedLessonIds).toEqual([])
  })

  it('pauses at the search request until the learner explicitly reveals its executor', () => {
    const { result } = beginAt(8)
    act(() => result.current.togglePlayback())
    elapse(AUTOPLAY_INTERVAL)
    expect(result.current.currentStep).toBe(9)
    expect(result.current.step.gate).toBe('harness')
    expect(result.current.gateBlocked).toBe(true)
    expect(result.current.playing).toBe(false)
    expect(result.current.unlockedTerms).toContain('tool')
    expect(result.current.unlockedTerms).not.toContain('harness')

    act(() => result.current.next())
    act(() => result.current.togglePlayback())
    elapse(AUTOPLAY_INTERVAL * 4)
    expect(result.current.currentStep).toBe(9)
    expect(pendingLessonTimerCount()).toBe(0)
    expect(useLearningStore.getState().harnessRevealed).toBe(false)

    act(() => result.current.revealHarness())
    expect(result.current.currentStep).toBe(10)
    expect(result.current.gateBlocked).toBe(false)
    expect(result.current.playing).toBe(false)
    expect(useLearningStore.getState().harnessRevealed).toBe(true)
    act(() => result.current.next())
    expect(result.current.unlockedTerms).toContain('harness')
  })

  it.each([
    { action: 'pause', expectedStep: 3 },
    { action: 'previous', expectedStep: 2 },
    { action: 'next', expectedStep: 4 },
    { action: 'selectNode', expectedStep: 3 },
  ] as const)('cancels pending autoplay on manual $action', ({ action, expectedStep }) => {
    const { result } = beginAt(3)
    act(() => result.current.togglePlayback())
    elapse(AUTOPLAY_INTERVAL / 2)
    act(() => {
      if (action === 'pause') result.current.togglePlayback()
      else if (action === 'selectNode') result.current.selectNode('model')
      else result.current[action]()
    })
    expect(result.current.currentStep).toBe(expectedStep)
    expect(result.current.playing).toBe(false)
    expect(pendingLessonTimerCount()).toBe(0)
    elapse(AUTOPLAY_INTERVAL * 3)
    expect(result.current.currentStep).toBe(expectedStep)
  })

  it('keeps a single timer through Strict Mode renders and starts a fresh interval after pausing', () => {
    useLearningStore
      .getState()
      .updateOverviewProgress({ currentStep: 2, predictionChoice: 'needs-search' })
    const { result, rerender } = renderHook(useSystemOverviewLesson, {
      wrapper: ({ children }: { children: ReactNode }) => <StrictMode>{children}</StrictMode>,
    })
    act(() => result.current.togglePlayback())
    expect(pendingLessonTimerCount()).toBe(1)
    elapse(5000)
    rerender()
    rerender()
    expect(pendingLessonTimerCount()).toBe(1)
    elapse(2500)
    expect(result.current.currentStep).toBe(3)
    expect(pendingLessonTimerCount()).toBe(1)
    elapse(AUTOPLAY_INTERVAL)
    expect(result.current.currentStep).toBe(4)
    expect(pendingLessonTimerCount()).toBe(1)

    elapse(5000)
    act(() => result.current.togglePlayback())
    expect(pendingLessonTimerCount()).toBe(0)
    act(() => result.current.togglePlayback())
    expect(pendingLessonTimerCount()).toBe(1)
    elapse(2500)
    expect(result.current.currentStep).toBe(4)
    elapse(5000)
    expect(result.current.currentStep).toBe(5)
    expect(pendingLessonTimerCount()).toBe(1)
  })

  it('stops autoplay at the final exploration instead of wrapping around', () => {
    const { result } = beginAt(OVERVIEW_STEP_COUNT - 2)
    act(() => result.current.togglePlayback())
    elapse(AUTOPLAY_INTERVAL)
    expect(result.current.currentStep).toBe(OVERVIEW_STEP_COUNT - 1)
    expect(result.current.lastStep).toBe(true)
    expect(result.current.playing).toBe(false)
    expect(result.current.unlockedTerms).toContain('ai-system')
    act(() => result.current.togglePlayback())
    act(() => result.current.next())
    elapse(AUTOPLAY_INTERVAL * 3)
    expect(result.current.currentStep).toBe(OVERVIEW_STEP_COUNT - 1)
    expect(result.current.playing).toBe(false)
    expect(pendingLessonTimerCount()).toBe(0)
  })

  it('pauses while the page is hidden and does not restart itself when shown', () => {
    const { result } = beginAt(3)
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
    act(() => result.current.togglePlayback())
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(result.current.playing).toBe(false)
    expect(pendingLessonTimerCount()).toBe(0)
    hidden.mockReturnValue(false)
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    elapse(AUTOPLAY_INTERVAL)
    expect(result.current.currentStep).toBe(3)
    expect(result.current.playing).toBe(false)
  })

  it('removes its scheduled advancement and visibility listener when unmounted', () => {
    const removeListener = vi.spyOn(document, 'removeEventListener')
    const { result, unmount } = beginAt(12)
    act(() => result.current.togglePlayback())
    expect(pendingLessonTimerCount()).toBe(1)
    const previousState = useLearningStore.getState()
    unmount()
    expect(pendingLessonTimerCount()).toBe(0)
    expect(removeListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
    elapse(AUTOPLAY_INTERVAL * 3)
    expect(useLearningStore.getState()).toBe(previousState)
  })
})

describe('useSystemOverviewLesson progress', () => {
  it('unlocks a term at its introduction and keeps it when revisiting earlier steps', () => {
    const { result } = beginAt(5)
    expect(result.current.unlockedTerms).toEqual([])
    act(() => result.current.next())
    expect(result.current.currentStep).toBe(6)
    expect(result.current.unlockedTerms).toEqual(['context'])
    act(() => result.current.previous())
    expect(result.current.currentStep).toBe(5)
    expect(result.current.furthestStep).toBe(6)
    expect(result.current.unlockedTerms).toEqual(['context'])
    act(() => result.current.next())
    expect(result.current.unlockedTerms).toEqual(['context'])
  })

  it('rejects completion before reaching the final exploration', () => {
    const { result } = beginAt(12)
    act(() => result.current.passChallenge())
    expect(result.current.challengePassed).toBe(false)
    expect(useLearningStore.getState().lessonCompleted).toBe(false)
    expect(useLearningStore.getState().completedLessonIds).toEqual([])
  })

  it('restarts the experience with earned terms and passing results intact', () => {
    useLearningStore.getState().updateOverviewProgress({
      currentStep: OVERVIEW_STEP_COUNT - 1,
      unlockedTerms: [...OVERVIEW_TERM_IDS],
      predictionChoice: 'needs-search',
      harnessRevealed: true,
    })
    const { result } = renderHook(useSystemOverviewLesson)
    act(() => result.current.passChallenge())
    act(() => result.current.selectNode('harness'))
    expect(result.current.challengePassed).toBe(true)
    expect(useLearningStore.getState().completedLessonIds).toEqual(['system-overview'])

    act(() => result.current.restart())
    expect(result.current.currentStep).toBe(0)
    expect(result.current.furthestStep).toBe(0)
    expect(result.current.predictionChoice).toBeNull()
    expect(result.current.selectedNode).toBeNull()
    expect(result.current.playing).toBe(false)
    expect(result.current.unlockedTerms).toEqual(OVERVIEW_TERM_IDS)
    expect(result.current.challengePassed).toBe(true)
    expect(useLearningStore.getState().lessonCompleted).toBe(true)
    expect(useLearningStore.getState().harnessRevealed).toBe(false)
    expect(useLearningStore.getState().completedLessonIds).toEqual(['system-overview'])
    elapse(AUTOPLAY_INTERVAL * 2)
    expect(result.current.currentStep).toBe(0)
  })
})
