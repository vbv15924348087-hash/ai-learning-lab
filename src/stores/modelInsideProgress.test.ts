import { describe, expect, it } from 'vitest'
import type { StateStorage } from 'zustand/middleware'
import { getLessonById } from '../content/lessons'
import {
  MODEL_INTERACTION_MODES,
  MODEL_TERM_IDS,
  type ModelInsideProgress,
} from '../features/model-inside/types'
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

const completedModel: ModelInsideProgress = {
  currentStep: 8,
  furthestStep: 8,
  completedInteractions: [...MODEL_INTERACTION_MODES],
  unlockedTerms: [...MODEL_TERM_IDS],
  summaryReached: true,
  challengePassed: true,
}

describe('Model Inside persistent achievements', () => {
  it('persists in-progress interactions independently from the earlier chapters', () => {
    const storage = memoryStorage()
    const store = createLearningStore(storage)
    store.getState().updateOverviewProgress({ currentStep: 9, unlockedTerms: ['context'] })
    store.getState().updateContextProgress({ currentStep: 7, unlockedTerms: ['prompt'] })
    store.getState().startLesson('model-inside')
    store.getState().updateModelInsideProgress({
      currentStep: 3,
      completedInteractions: ['tokenization', 'embedding'],
      unlockedTerms: ['token', 'embedding'],
    })
    const restored = createLearningStore(storage).getState()
    expect(restored.currentLessonId).toBe('model-inside')
    expect(restored.modelInsideProgress).toMatchObject({
      currentStep: 3,
      furthestStep: 3,
      completedInteractions: ['tokenization', 'embedding'],
      unlockedTerms: ['token', 'embedding'],
      summaryReached: false,
      challengePassed: false,
    })
    expect(restored.currentStep).toBe(9)
    expect(restored.unlockedTerms).toEqual(['context'])
    expect(restored.contextProgress.currentStep).toBe(7)
    expect(restored.contextProgress.unlockedTerms).toEqual(['prompt'])
    expect(restored.completedLessonIds).toEqual([])
  })

  it.each(MODEL_INTERACTION_MODES)(
    'cannot complete with missing %s even when the challenge is patched',
    (missing) => {
      const store = createLearningStore(memoryStorage())
      store.getState().updateModelInsideProgress({
        ...completedModel,
        completedInteractions: MODEL_INTERACTION_MODES.filter((mode) => mode !== missing),
      })
      store.getState().completeLesson('model-inside')
      expect(store.getState().modelInsideProgress.challengePassed).toBe(false)
      expect(store.getState().completedLessonIds).toEqual([])
      expect(store.getState().unlockedLessonIds).not.toContain('agent-loop')
    },
  )

  it('requires summary and passed challenge in addition to interactions', () => {
    const store = createLearningStore(memoryStorage())
    store.getState().updateModelInsideProgress({
      ...completedModel,
      currentStep: 7,
      furthestStep: 7,
      summaryReached: false,
    })
    store.getState().completeLesson('model-inside')
    expect(store.getState().completedLessonIds).toEqual([])
    store.getState().updateModelInsideProgress({ currentStep: 8, challengePassed: false })
    store.getState().completeLesson('model-inside')
    expect(store.getState().completedLessonIds).toEqual([])
    store.getState().updateModelInsideProgress({ challengePassed: true })
    store.getState().completeLesson('model-inside')
    expect(store.getState().completedLessonIds).toEqual(['model-inside'])
  })

  it('keeps earned completion after replay and reload, while published Tools remain available', () => {
    const storage = memoryStorage()
    const store = createLearningStore(storage)
    store.getState().updateModelInsideProgress(completedModel)
    store.getState().completeLesson('model-inside')
    store.getState().restartModelInside()
    const restored = createLearningStore(storage).getState()
    expect(restored.modelInsideProgress).toEqual({
      ...completedModel,
      currentStep: 0,
      furthestStep: 0,
    })
    expect(restored.lessonProgress['model-inside']).toBe(100)
    expect(getLessonStatus(getLessonById('model-inside')!, restored)).toBe('completed')
    expect(getLessonStatus(getLessonById('tools')!, restored)).toBe('available')
    expect(restored.currentLessonId).toBe('model-inside')
    restored.startLesson('tools')
    expect(createLearningStore(storage).getState().currentLessonId).toBe('tools')
    restored.resetProgress()
    const reset = createLearningStore(storage).getState()
    expect(reset.modelInsideProgress.completedInteractions).toEqual([])
    expect(reset.modelInsideProgress.unlockedTerms).toEqual([])
    expect(reset.modelInsideProgress.summaryReached).toBe(false)
    expect(reset.modelInsideProgress.challengePassed).toBe(false)
    expect(reset.lessonProgress['model-inside']).toBe(0)
    expect(getLessonStatus(getLessonById('tools')!, reset)).toBe('available')
  })

  it.each([0, 1, 2, 3])('rejects unearned Phase 4 data in version %s snapshots', (version) => {
    const storage = memoryStorage()
    storage.setItem(
      LEARNING_STORAGE_KEY,
      JSON.stringify({
        version,
        state: {
          currentLessonId: 'model-inside',
          completedLessonIds: ['system-overview', 'context', 'model-inside', 'tools'],
          startedLessonIds: ['model-inside'],
          currentStep: 6,
          unlockedTerms: ['context', 'model'],
          contextProgress: {
            currentStep: 11,
            unlockedTerms: ['prompt'],
            engineeringPassed: true,
            challengePassed: true,
          },
          modelInsideProgress: completedModel,
        },
      }),
    )
    const state = createLearningStore(storage).getState()
    expect(state.currentLessonId).toBeNull()
    expect(state.modelInsideProgress.completedInteractions).toEqual([])
    expect(state.modelInsideProgress.unlockedTerms).toEqual([])
    expect(state.modelInsideProgress.challengePassed).toBe(false)
    expect(state.completedLessonIds).not.toContain('model-inside')
    expect(state.unlockedLessonIds).not.toContain('agent-loop')
    expect(state.completedLessonIds).toContain('system-overview')
    expect(state.currentStep).toBe(version >= 2 ? 6 : 0)
    expect(state.contextProgress.currentStep).toBe(version >= 3 ? 11 : 0)
    if (version >= 3) expect(state.completedLessonIds).toContain('context')
    else expect(state.completedLessonIds).not.toContain('context')
  })

  it('sanitizes malformed progress and rejects unsupported persisted completion', () => {
    const storage = memoryStorage()
    storage.setItem(
      LEARNING_STORAGE_KEY,
      JSON.stringify({
        version: 4,
        state: {
          completedLessonIds: ['model-inside'],
          modelInsideProgress: {
            currentStep: 400,
            furthestStep: -2,
            completedInteractions: ['tokenization', 'tokenization', '__proto__', 7],
            unlockedTerms: ['token', 'token', 'unknown', null],
            challengePassed: true,
          },
          updateModelInsideProgress: 'replacement',
          restartModelInside: 'replacement',
        },
      }),
    )
    const state = createLearningStore(storage).getState()
    expect(state.modelInsideProgress).toEqual({
      currentStep: 2,
      furthestStep: 2,
      summaryReached: false,
      completedInteractions: ['tokenization'],
      unlockedTerms: ['token'],
      challengePassed: false,
    })
    expect(state.completedLessonIds).toEqual([])
    expect(state.updateModelInsideProgress).toBeTypeOf('function')
    expect(state.restartModelInside).toBeTypeOf('function')
    expect(state.lessonProgress['model-inside']).toBeLessThan(100)
  })

  it('repairs unearned terms and resumes at the first missing interaction after corrupt v4 progress', () => {
    const storage = memoryStorage()
    storage.setItem(
      LEARNING_STORAGE_KEY,
      JSON.stringify({
        version: 4,
        state: {
          modelInsideProgress: {
            currentStep: 8,
            furthestStep: 8,
            summaryReached: true,
            challengePassed: true,
            unlockedTerms: [...MODEL_TERM_IDS],
            completedInteractions: ['tokenization'],
          },
        },
      }),
    )
    const state = createLearningStore(storage).getState()
    expect(state.modelInsideProgress.currentStep).toBe(2)
    expect(state.modelInsideProgress.unlockedTerms).toEqual(['token'])
    expect(state.modelInsideProgress.summaryReached).toBe(false)
    expect(state.modelInsideProgress.challengePassed).toBe(false)
    expect(state.completedLessonIds).toEqual([])
  })

  it('restores map completion if the tab closed between passing the challenge and the completion update', () => {
    const storage = memoryStorage()
    storage.setItem(
      LEARNING_STORAGE_KEY,
      JSON.stringify({
        version: 4,
        state: {
          currentLessonId: 'model-inside',
          completedLessonIds: [],
          modelInsideProgress: completedModel,
        },
      }),
    )
    const state = createLearningStore(storage).getState()
    expect(state.modelInsideProgress.challengePassed).toBe(true)
    expect(state.completedLessonIds).toEqual(['model-inside'])
    expect(state.lessonProgress['model-inside']).toBe(100)
    expect(state.unlockedLessonIds).toContain('tools')
  })
})
