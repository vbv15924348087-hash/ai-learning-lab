import { describe, expect, it } from 'vitest'
import type { StateStorage } from 'zustand/middleware'
import { getLessonById } from '../content/lessons'
import {
  TOOLS_INTERACTION_MODES,
  TOOL_TERM_IDS,
  type ToolsProgress,
} from '../features/tools-lesson/types'
import { createLearningStore, getLessonStatus, LEARNING_STORAGE_KEY } from './learningStore'

function memoryStorage(): StateStorage {
  const entries = new Map<string, string>()
  return {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => {
      entries.set(key, value)
    },
    removeItem: (key) => {
      entries.delete(key)
    },
  }
}

const completedTools: ToolsProgress = {
  currentStep: 9,
  furthestStep: 9,
  completedInteractions: [...TOOLS_INTERACTION_MODES],
  unlockedTerms: [...TOOL_TERM_IDS],
  summaryReached: true,
  challengePassed: true,
}

describe('Tools persistent progress', () => {
  it('publishes Tools independently and restores its activity without altering earlier chapters', () => {
    const storage = memoryStorage()
    const store = createLearningStore(storage)
    expect(getLessonStatus(getLessonById('tools')!, store.getState())).toBe('available')
    store.getState().updateOverviewProgress({ currentStep: 7, unlockedTerms: ['context'] })
    store.getState().updateContextProgress({ currentStep: 4, unlockedTerms: ['prompt'] })
    store.getState().updateModelInsideProgress({ currentStep: 1 })
    store.getState().startLesson('tools')
    store.getState().updateToolsProgress({
      currentStep: 4,
      completedInteractions: ['boundary', 'shelf', 'matching', 'call'],
    })
    const restored = createLearningStore(storage).getState()
    expect(restored.toolsProgress).toMatchObject({
      currentStep: 4,
      furthestStep: 4,
      unlockedTerms: ['tool', 'function-calling', 'tool-call'],
      summaryReached: false,
      challengePassed: false,
    })
    expect(restored.currentLessonId).toBe('tools')
    expect(restored.currentStep).toBe(7)
    expect(restored.contextProgress.currentStep).toBe(4)
    expect(restored.modelInsideProgress.currentStep).toBe(1)
    expect(restored.lessonProgress.tools).toBe(40)
    expect(restored.completedLessonIds).toEqual([])
  })

  it.each(TOOLS_INTERACTION_MODES)('cannot award completion when %s is missing', (missing) => {
    const store = createLearningStore(memoryStorage())
    store.getState().updateToolsProgress({
      ...completedTools,
      completedInteractions: TOOLS_INTERACTION_MODES.filter((mode) => mode !== missing),
    })
    store.getState().completeLesson('tools')
    expect(store.getState().toolsProgress.challengePassed).toBe(false)
    expect(store.getState().completedLessonIds).not.toContain('tools')
    expect(store.getState().unlockedLessonIds).not.toContain('agent-loop')
  })

  it('requires summary and challenge after activities, then preserves achievements during replay', () => {
    const storage = memoryStorage()
    const store = createLearningStore(storage)
    store.getState().updateToolsProgress({
      ...completedTools,
      currentStep: 8,
      furthestStep: 8,
      summaryReached: false,
    })
    store.getState().completeLesson('tools')
    expect(store.getState().completedLessonIds).toEqual([])
    store.getState().updateToolsProgress({ currentStep: 9, challengePassed: false })
    store.getState().completeLesson('tools')
    expect(store.getState().completedLessonIds).toEqual([])
    store.getState().updateToolsProgress({ challengePassed: true })
    store.getState().completeLesson('tools')
    store.getState().restartTools()
    const restored = createLearningStore(storage).getState()
    expect(restored.toolsProgress).toEqual({ ...completedTools, currentStep: 0, furthestStep: 0 })
    expect(restored.lessonProgress.tools).toBe(100)
    expect(getLessonStatus(getLessonById('tools')!, restored)).toBe('completed')
    expect(getLessonStatus(getLessonById('agent-loop')!, restored)).toBe('available')
    expect(restored.currentLessonId).toBe('tools')
    restored.startLesson('agent-loop')
    expect(createLearningStore(storage).getState().currentLessonId).toBe('agent-loop')
    restored.resetProgress()
    const reset = createLearningStore(storage).getState()
    expect(reset.toolsProgress.completedInteractions).toEqual([])
    expect(reset.toolsProgress.unlockedTerms).toEqual([])
    expect(reset.toolsProgress.challengePassed).toBe(false)
    expect(reset.lessonProgress.tools).toBe(0)
    expect(getLessonStatus(getLessonById('agent-loop')!, reset)).toBe('locked')
  })

  it.each([0, 1, 2, 3, 4])('does not award Phase 5 achievements from version %s', (version) => {
    const storage = memoryStorage()
    storage.setItem(
      LEARNING_STORAGE_KEY,
      JSON.stringify({
        version,
        state: {
          currentLessonId: 'tools',
          completedLessonIds: ['system-overview', 'tools'],
          currentStep: 6,
          toolsProgress: completedTools,
        },
      }),
    )
    const state = createLearningStore(storage).getState()
    expect(state.currentLessonId).toBeNull()
    expect(state.toolsProgress.completedInteractions).toEqual([])
    expect(state.toolsProgress.unlockedTerms).toEqual([])
    expect(state.toolsProgress.challengePassed).toBe(false)
    expect(state.completedLessonIds).toEqual(['system-overview'])
    expect(state.currentStep).toBe(version >= 2 ? 6 : 0)
    expect(state.unlockedLessonIds).not.toContain('agent-loop')
  })

  it('repairs corrupt position, duplicate activities, unearned terms and injected methods', () => {
    const storage = memoryStorage()
    storage.setItem(
      LEARNING_STORAGE_KEY,
      JSON.stringify({
        version: 5,
        state: {
          completedLessonIds: ['tools'],
          toolsProgress: {
            currentStep: 900,
            furthestStep: -1,
            completedInteractions: ['boundary', 'boundary', '__proto__', null, 3],
            unlockedTerms: [...TOOL_TERM_IDS],
            summaryReached: true,
            challengePassed: true,
          },
          updateToolsProgress: 'replacement',
          restartTools: 'replacement',
        },
      }),
    )
    const restored = createLearningStore(storage).getState()
    expect(restored.toolsProgress).toEqual({
      currentStep: 1,
      furthestStep: 1,
      completedInteractions: ['boundary'],
      unlockedTerms: [],
      summaryReached: false,
      challengePassed: false,
    })
    expect(restored.updateToolsProgress).toBeTypeOf('function')
    expect(restored.restartTools).toBeTypeOf('function')
    expect(restored.completedLessonIds).toEqual([])
  })

  it('recovers completion saved immediately after the final challenge without opening the next lesson', () => {
    const storage = memoryStorage()
    storage.setItem(
      LEARNING_STORAGE_KEY,
      JSON.stringify({
        version: 5,
        state: { currentLessonId: 'tools', toolsProgress: completedTools, completedLessonIds: [] },
      }),
    )
    const state = createLearningStore(storage).getState()
    expect(state.completedLessonIds).toEqual(['tools'])
    expect(state.lessonProgress.tools).toBe(100)
    expect(state.currentLessonId).toBe('tools')
    expect(state.unlockedLessonIds).toContain('agent-loop')
  })
})
