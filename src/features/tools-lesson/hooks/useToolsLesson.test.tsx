import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useLearningStore } from '../../../stores/learningStore'
import { toolsLessonSteps } from '../data/toolsLessonSteps'
import { TOOLS_INTERACTION_MODES, TOOL_TERM_IDS, type ToolsMode } from '../types'
import { useToolsLesson } from './useToolsLesson'

beforeEach(() => {
  localStorage.clear()
  useLearningStore.getState().resetProgress()
})
afterEach(cleanup)

function startAt(mode: ToolsMode) {
  useLearningStore.getState().updateToolsProgress({
    currentStep: toolsLessonSteps.findIndex((step) => step.mode === mode),
  })
  return renderHook(useToolsLesson)
}

describe('Tools learning interactions', () => {
  it.each(TOOLS_INTERACTION_MODES)('requires the %s activity before advancing', (mode) => {
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
  })

  it('unlocks Function Calling and Tool Call together only after inspecting the structured request', () => {
    const { result } = startAt('call')
    expect(result.current.unlockedTerms).toEqual([])
    act(() => result.current.completeInteraction('call'))
    expect(result.current.unlockedTerms).toEqual(['function-calling', 'tool-call'])
  })

  it('ignores callbacks from a previous activity and keeps callbacks stable across changes', () => {
    const { result, rerender } = startAt('boundary')
    const complete = result.current.completeInteraction
    rerender()
    expect(result.current.completeInteraction).toBe(complete)
    act(() => result.current.completeInteraction('execution'))
    expect(result.current.interactionDone('execution')).toBe(false)
    act(() => result.current.completeInteraction('boundary'))
    const completedState = useLearningStore.getState()
    act(() => result.current.completeInteraction('boundary'))
    expect(useLearningStore.getState()).toBe(completedState)
    act(() => result.current.next())
    act(() => result.current.completeInteraction('boundary'))
    expect(result.current.interactionDone('shelf')).toBe(false)
    expect(result.current.completeInteraction).toBe(complete)
  })

  it('requires every activity and challenge, unlocks Agent Loop preview, and preserves replay achievements', () => {
    useLearningStore.getState().updateOverviewProgress({ currentStep: 7 })
    useLearningStore.getState().updateContextProgress({ currentStep: 5 })
    const { result } = renderHook(useToolsLesson)
    act(() => result.current.passChallenge())
    expect(result.current.challengePassed).toBe(false)
    for (const mode of TOOLS_INTERACTION_MODES) {
      expect(result.current.step.mode).toBe(mode)
      act(() => result.current.completeInteraction(mode))
      act(() => result.current.next())
    }
    expect(result.current.step.mode).toBe('summary')
    expect(result.current.unlockedTerms).toEqual(TOOL_TERM_IDS)
    expect(useLearningStore.getState().completedLessonIds).toEqual([])
    act(() => result.current.passChallenge())
    expect(useLearningStore.getState().completedLessonIds).toEqual(['tools'])
    expect(useLearningStore.getState().lessonProgress.tools).toBe(100)
    expect(useLearningStore.getState().unlockedLessonIds).toContain('agent-loop')
    expect(useLearningStore.getState().currentLessonId).toBe('tools')
    act(() => result.current.restart())
    expect(result.current.currentStep).toBe(0)
    expect(result.current.challengePassed).toBe(true)
    expect(result.current.unlockedTerms).toEqual(TOOL_TERM_IDS)
    expect(useLearningStore.getState().lessonProgress.tools).toBe(100)
    expect(useLearningStore.getState().currentStep).toBe(7)
    expect(useLearningStore.getState().contextProgress.currentStep).toBe(5)
  })

  it('cannot bypass result returning to Context or award challenge on an incomplete summary', () => {
    const { result } = startAt('result')
    act(() => result.current.next())
    expect(result.current.step.mode).toBe('result')
    act(() => result.current.completeInteraction('result'))
    act(() => result.current.next())
    expect(result.current.step.mode).toBe('summary')
    act(() => result.current.passChallenge())
    expect(result.current.challengePassed).toBe(false)
    expect(useLearningStore.getState().completedLessonIds).toEqual([])
  })

  it('bounds previous navigation and retains discovered terms after moving backward', () => {
    const { result } = startAt('boundary')
    act(() => result.current.previous())
    expect(result.current.currentStep).toBe(0)
    act(() => result.current.completeInteraction('boundary'))
    act(() => result.current.next())
    act(() => result.current.completeInteraction('shelf'))
    act(() => result.current.next())
    act(() => result.current.previous())
    expect(result.current.step.mode).toBe('shelf')
    expect(result.current.furthestStep).toBe(2)
    expect(result.current.unlockedTerms).toEqual(['tool'])
  })
})
