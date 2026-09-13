import { describe, expect, it } from 'vitest'
import type { StateStorage } from 'zustand/middleware'
import { getLessonById, lessons } from '../content/lessons'
import { OVERVIEW_STEP_COUNT, type OverviewProgress } from '../features/system-overview/types'
import {
  CONTEXT_STEP_COUNT,
  CONTEXT_TERM_IDS,
  type ContextProgress,
} from '../features/context-lesson/types'
import type { SystemNodeId } from '../types/learning'
import {
  createLearningStore,
  getLessonStatus,
  getProgress,
  getResumeLessonId,
  LEARNING_STORAGE_KEY,
} from './learningStore'

function memoryStorage(): StateStorage {
  const values = new Map<string, string>()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value)
    },
    removeItem: (key) => {
      values.delete(key)
    },
  }
}

const firstLesson = getLessonById('system-overview')!
const contextLesson = getLessonById('context')!
const modelInsideLesson = getLessonById('model-inside')!
const toolsLesson = getLessonById('tools')!
const lockedLesson = getLessonById('agent-loop')!

describe('learning progress', () => {
  it('starts with the first four chapters available and later chapters locked', () => {
    const state = createLearningStore(memoryStorage()).getState()
    expect(getLessonStatus(firstLesson, state)).toBe('available')
    expect(getLessonStatus(contextLesson, state)).toBe('available')
    expect(getLessonStatus(modelInsideLesson, state)).toBe('available')
    expect(getLessonStatus(toolsLesson, state)).toBe('available')
    expect(getLessonStatus(lockedLesson, state)).toBe('locked')
    expect(getProgress(state)).toBe(0)
    expect(getResumeLessonId(state)).toBe(firstLesson.id)
    expect(state.currentMode).toBe('guided')
    expect(state.currentStep).toBe(0)
    expect(state.furthestStep).toBe(0)
    expect(state.unlockedTerms).toEqual([])
    expect(state.lessonCompleted).toBe(false)
  })

  it('moves a published chapter through the learning lifecycle without duplicates', () => {
    const store = createLearningStore(memoryStorage())
    store.getState().startLesson(firstLesson.id)
    const startedState = store.getState()
    expect(startedState.currentLessonId).toBe(firstLesson.id)
    expect(getLessonStatus(firstLesson, startedState)).toBe('in-progress')
    expect(getProgress(startedState)).toBe(0)

    store.getState().startLesson(firstLesson.id)
    expect(store.getState()).toBe(startedState)
    store.getState().completeLesson(firstLesson.id)
    const completedState = store.getState()
    store.getState().completeLesson(firstLesson.id)
    expect(store.getState()).toBe(completedState)
    expect(completedState.completedLessonIds).toEqual([firstLesson.id])
    expect(completedState.lessonCompleted).toBe(true)
    expect(completedState.startedLessonIds).toEqual([firstLesson.id])
    expect(getLessonStatus(firstLesson, completedState)).toBe('completed')
    expect(getProgress(completedState)).toBe(Math.round(100 / lessons.length))
    expect(getResumeLessonId(completedState)).toBe(contextLesson.id)

    store.getState().startLesson(firstLesson.id)
    expect(getLessonStatus(firstLesson, store.getState())).toBe('completed')
  })

  it('cannot start or complete unpublished and unknown chapter IDs', () => {
    const store = createLearningStore(memoryStorage())
    const initial = store.getState()
    for (const id of ['agent-loop', 'missing-lesson', '', '__proto__']) {
      store.getState().startLesson(id)
      store.getState().completeLesson(id)
    }
    expect(store.getState()).toBe(initial)
    expect(getProgress(store.getState())).toBe(0)
  })

  it('supports completion directly and keeps completion separate from node selection', () => {
    const store = createLearningStore(memoryStorage())
    store.getState().setSelectedNode('model')
    expect(getProgress(store.getState())).toBe(0)
    store.getState().completeLesson(firstLesson.id)
    expect(store.getState().startedLessonIds).toEqual([firstLesson.id])
    expect(store.getState().selectedNode).toBe('model')
    store.getState().setSelectedNode('invalid' as SystemNodeId)
    expect(store.getState().selectedNode).toBe('model')
    store.getState().setSelectedNode(null)
    expect(store.getState().selectedNode).toBeNull()
  })

  it('derives progress from unique published IDs even when given inconsistent input', () => {
    const state = {
      startedLessonIds: ['agent-loop'],
      completedLessonIds: [firstLesson.id, firstLesson.id, 'agent-loop', 'unknown'],
    }
    expect(getProgress(state)).toBe(Math.round(100 / lessons.length))
    expect(getLessonStatus(lockedLesson, state)).toBe('locked')
  })
})

describe('learning persistence', () => {
  it('restores progress and selection in a new store instance', () => {
    const storage = memoryStorage()
    const first = createLearningStore(storage)
    first.getState().startLesson(firstLesson.id)
    first.getState().setSelectedNode('answer')
    first.getState().completeLesson(firstLesson.id)

    const restored = createLearningStore(storage).getState()
    expect(restored.currentLessonId).toBe(firstLesson.id)
    expect(restored.startedLessonIds).toEqual([firstLesson.id])
    expect(restored.completedLessonIds).toEqual([firstLesson.id])
    expect(restored.selectedNode).toBe('answer')
    expect(getProgress(restored)).toBe(Math.round(100 / lessons.length))
  })

  it.each([0, 1, 2])(
    'sanitizes persisted data from version %s and preserves action functions',
    (version) => {
      const storage = memoryStorage()
      storage.setItem(
        LEARNING_STORAGE_KEY,
        JSON.stringify({
          version,
          state: {
            currentLessonId: 'context',
            startedLessonIds: [null, 'context', 'missing'],
            completedLessonIds: [firstLesson.id, firstLesson.id, 'context', 3, false],
            currentMode: 'challenge',
            selectedNode: '<invalid-node>',
            startLesson: 'replaced action',
            progress: 100,
          },
        }),
      )

      const state = createLearningStore(storage).getState()
      expect(state.currentLessonId).toBeNull()
      expect(state.startedLessonIds).toEqual([firstLesson.id])
      expect(state.completedLessonIds).toEqual([firstLesson.id])
      expect(state.currentMode).toBe('guided')
      expect(state.selectedNode).toBeNull()
      expect(state.startLesson).toBeTypeOf('function')
      expect(state).not.toHaveProperty('progress')
      expect(getProgress(state)).toBe(Math.round(100 / lessons.length))
    },
  )

  it('recovers the started state from a valid persisted current lesson', () => {
    const storage = memoryStorage()
    storage.setItem(
      LEARNING_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        state: { currentLessonId: firstLesson.id, completedLessonIds: {}, startedLessonIds: null },
      }),
    )
    const state = createLearningStore(storage).getState()
    expect(state.startedLessonIds).toEqual([firstLesson.id])
    expect(state.completedLessonIds).toEqual([])
    expect(getLessonStatus(firstLesson, state)).toBe('in-progress')
  })

  it.each(['not valid JSON', '{', '{"state":null,"version":1}', '{"state":42,"version":1}'])(
    'recovers from malformed or invalid storage: %s',
    (snapshot) => {
      const storage = memoryStorage()
      storage.setItem(LEARNING_STORAGE_KEY, snapshot)
      const store = createLearningStore(storage)
      expect(getProgress(store.getState())).toBe(0)
      expect(store.getState().currentLessonId).toBeNull()
      store.getState().startLesson(firstLesson.id)
      expect(getLessonStatus(firstLesson, store.getState())).toBe('in-progress')
    },
  )

  it('keeps learning usable when browser storage cannot be read or written', () => {
    const unavailableStorage: StateStorage = {
      getItem: () => {
        throw new Error('Storage access denied')
      },
      setItem: () => {
        throw new Error('Storage quota exceeded')
      },
      removeItem: () => {
        throw new Error('Storage access denied')
      },
    }
    const store = createLearningStore(unavailableStorage)
    expect(() => store.getState().startLesson(firstLesson.id)).not.toThrow()
    expect(() => store.getState().completeLesson(firstLesson.id)).not.toThrow()
    expect(getLessonStatus(firstLesson, store.getState())).toBe('completed')
    expect(() => store.getState().resetProgress()).not.toThrow()
    expect(getProgress(store.getState())).toBe(0)
  })

  it('resets persisted learning state while preserving unrelated local storage', () => {
    const storage = memoryStorage()
    storage.setItem('unrelated-preference', 'keep')
    const store = createLearningStore(storage)
    store.getState().startLesson(firstLesson.id)
    store.getState().completeLesson(firstLesson.id)
    store.getState().setSelectedNode('answer')
    store.getState().resetProgress()

    const restored = createLearningStore(storage).getState()
    expect(restored.currentLessonId).toBeNull()
    expect(restored.startedLessonIds).toEqual([])
    expect(restored.completedLessonIds).toEqual([])
    expect(restored.selectedNode).toBeNull()
    expect(restored.currentStep).toBe(0)
    expect(restored.unlockedTerms).toEqual([])
    expect(restored.lessonCompleted).toBe(false)
    expect(getLessonStatus(firstLesson, restored)).toBe('available')
    expect(storage.getItem('unrelated-preference')).toBe('keep')
  })
})

describe('system overview learning progress', () => {
  it('restores lesson position, decisions, discovered terms, and challenge completion', () => {
    const storage = memoryStorage()
    const first = createLearningStore(storage)
    first.getState().startLesson(firstLesson.id)
    first.getState().updateOverviewProgress({
      currentStep: 13,
      furthestStep: 17,
      unlockedTerms: ['context', 'model', 'tool', 'harness'],
      predictionChoice: 'needs-search',
      harnessRevealed: true,
      challengePassed: true,
    })
    first.getState().completeLesson(firstLesson.id)

    const restored = createLearningStore(storage).getState()
    expect(restored).toMatchObject({
      currentLessonId: firstLesson.id,
      currentStep: 13,
      furthestStep: 17,
      unlockedTerms: ['context', 'model', 'tool', 'harness'],
      predictionChoice: 'needs-search',
      harnessRevealed: true,
      challengePassed: true,
      lessonCompleted: true,
      completedLessonIds: [firstLesson.id],
    })
    const snapshot = JSON.parse(storage.getItem(LEARNING_STORAGE_KEY) as string)
    expect(snapshot.version).toBe(6)
    expect(snapshot.state).not.toHaveProperty('updateOverviewProgress')
    expect(snapshot.state).not.toHaveProperty('restartOverview')
  })

  it.each([0, 1])(
    'migrates version %s completion without awarding Phase 2 achievements',
    (version) => {
      const storage = memoryStorage()
      storage.setItem(
        LEARNING_STORAGE_KEY,
        JSON.stringify({
          version,
          state: {
            currentLessonId: firstLesson.id,
            completedLessonIds: [firstLesson.id],
            selectedNode: 'model',
          },
        }),
      )

      const state = createLearningStore(storage).getState()
      expect(getLessonStatus(firstLesson, state)).toBe('completed')
      expect(state.lessonCompleted).toBe(true)
      expect(state.currentStep).toBe(0)
      expect(state.furthestStep).toBe(0)
      expect(state.unlockedTerms).toEqual([])
      expect(state.predictionChoice).toBeNull()
      expect(state.harnessRevealed).toBe(false)
      expect(state.challengePassed).toBe(false)
      expect(state.selectedNode).toBe('model')
    },
  )

  it('restarts the guided experience while preserving earned progress across a reload', () => {
    const storage = memoryStorage()
    const store = createLearningStore(storage)
    store.getState().updateOverviewProgress({
      currentStep: OVERVIEW_STEP_COUNT - 1,
      unlockedTerms: ['context', 'model', 'tool', 'harness', 'ai-system'],
      predictionChoice: 'always',
      harnessRevealed: true,
      challengePassed: true,
    })
    store.getState().completeLesson(firstLesson.id)
    store.getState().restartOverview()

    const state = createLearningStore(storage).getState()
    expect(state).toMatchObject({
      currentStep: 0,
      furthestStep: 0,
      predictionChoice: null,
      harnessRevealed: false,
      unlockedTerms: ['context', 'model', 'tool', 'harness', 'ai-system'],
      challengePassed: true,
      lessonCompleted: true,
      completedLessonIds: [firstLesson.id],
    })
    state.resetProgress()
    expect(store.getState().lessonCompleted).toBe(true)
    expect(createLearningStore(storage).getState()).toMatchObject({
      currentStep: 0,
      furthestStep: 0,
      unlockedTerms: [],
      challengePassed: false,
      lessonCompleted: false,
      completedLessonIds: [],
    })
  })

  it.each([
    {
      currentStep: -12,
      furthestStep: 1000,
      expectedStep: 0,
      expectedFurthest: OVERVIEW_STEP_COUNT - 1,
    },
    {
      currentStep: 1000,
      furthestStep: -1,
      expectedStep: OVERVIEW_STEP_COUNT - 1,
      expectedFurthest: OVERVIEW_STEP_COUNT - 1,
    },
    { currentStep: 6.9, furthestStep: 4, expectedStep: 6, expectedFurthest: 6 },
    { currentStep: '8', furthestStep: null, expectedStep: 0, expectedFurthest: 0 },
  ])('sanitizes stored step bounds and malformed discoveries: $currentStep', (example) => {
    const storage = memoryStorage()
    storage.setItem(
      LEARNING_STORAGE_KEY,
      JSON.stringify({
        version: 2,
        state: {
          currentStep: example.currentStep,
          furthestStep: example.furthestStep,
          unlockedTerms: ['model', 'missing', null, 'model', 'context', 2, '__proto__'],
          predictionChoice: 'invalid',
          harnessRevealed: 'true',
          challengePassed: 1,
          lessonCompleted: 'true',
          updateOverviewProgress: 'replaced action',
          restartOverview: 'replaced action',
        },
      }),
    )
    const state = createLearningStore(storage).getState()
    expect(state).toMatchObject({
      currentStep: example.expectedStep,
      furthestStep: example.expectedFurthest,
      unlockedTerms: ['model', 'context'],
      predictionChoice: null,
      harnessRevealed: false,
      challengePassed: false,
      lessonCompleted: false,
    })
    expect(state.updateOverviewProgress).toBeTypeOf('function')
    expect(state.restartOverview).toBeTypeOf('function')
  })

  it('sanitizes runtime patches without replacing store methods or completing a lesson', () => {
    const store = createLearningStore(memoryStorage())
    store.getState().updateOverviewProgress({ currentStep: 9, predictionChoice: 'always' })
    expect(store.getState().furthestStep).toBe(9)
    store.getState().updateOverviewProgress({
      currentStep: Infinity,
      furthestStep: NaN,
      unlockedTerms: ['tool', 'tool', 'unknown'],
      predictionChoice: {},
      challengePassed: 'true',
      lessonCompleted: true,
      completeLesson: 'replaced action',
    } as unknown as Partial<OverviewProgress>)
    expect(store.getState()).toMatchObject({
      currentStep: 0,
      furthestStep: 0,
      unlockedTerms: ['tool'],
      predictionChoice: null,
      challengePassed: false,
      lessonCompleted: false,
    })
    expect(store.getState().completeLesson).toBeTypeOf('function')
  })

  it.each([
    { lessonCompleted: true, completedLessonIds: [] },
    { lessonCompleted: false, completedLessonIds: [firstLesson.id] },
  ])('repairs inconsistent completion flags in current-version storage', (completion) => {
    const storage = memoryStorage()
    storage.setItem(LEARNING_STORAGE_KEY, JSON.stringify({ version: 2, state: completion }))
    const state = createLearningStore(storage).getState()
    expect(state.lessonCompleted).toBe(true)
    expect(state.completedLessonIds).toEqual([firstLesson.id])
    expect(state.startedLessonIds).toEqual([firstLesson.id])
    expect(state.challengePassed).toBe(false)
    expect(state.unlockedTerms).toEqual([])
  })
})

describe('Context learning progress', () => {
  it('resumes the active unfinished chapter and advances to Context after Overview completion', () => {
    const store = createLearningStore(memoryStorage())
    store.getState().startLesson('context')
    expect(getResumeLessonId(store.getState())).toBe('context')
    store.getState().startLesson('system-overview')
    expect(getResumeLessonId(store.getState())).toBe('system-overview')
    store.getState().completeLesson('system-overview')
    expect(getResumeLessonId(store.getState())).toBe('context')
  })

  it('keeps chapter positions, predictions, and achievements independent across reload', () => {
    const storage = memoryStorage()
    const store = createLearningStore(storage)
    store.getState().updateOverviewProgress({
      currentStep: 7,
      predictionChoice: 'needs-search',
      unlockedTerms: ['context'],
    })
    store.getState().startLesson('context')
    store.getState().updateContextProgress({
      currentStep: 11,
      predictionChoice: 'more-information',
      unlockedTerms: ['prompt', 'context'],
    })
    const restored = createLearningStore(storage).getState()
    expect(restored).toMatchObject({
      currentStep: 7,
      predictionChoice: 'needs-search',
      unlockedTerms: ['context'],
    })
    expect(restored.contextProgress).toMatchObject({
      currentStep: 11,
      furthestStep: 11,
      predictionChoice: 'more-information',
      unlockedTerms: ['prompt', 'context'],
    })
    expect(restored.lessonProgress.context).toBeGreaterThan(0)
    expect(restored.lessonProgress.context).toBeLessThan(100)
    expect(restored.lessonProgress['system-overview']).not.toBe(restored.lessonProgress.context)
    expect(restored.unlockedLessonIds).toEqual([
      'system-overview',
      'context',
      'model-inside',
      'tools',
    ])
  })

  it('requires the final step and both Context activities, then allows continuing to Model Inside', () => {
    const store = createLearningStore(memoryStorage())
    store.getState().completeLesson('context')
    expect(store.getState().completedLessonIds).toEqual([])
    store.getState().updateContextProgress({ engineeringPassed: true, challengePassed: true })
    store.getState().completeLesson('context')
    expect(store.getState().completedLessonIds).toEqual([])
    store
      .getState()
      .updateContextProgress({ currentStep: CONTEXT_STEP_COUNT - 1, challengePassed: false })
    store.getState().completeLesson('context')
    expect(store.getState().completedLessonIds).toEqual([])
    store.getState().updateContextProgress({ challengePassed: true, engineeringPassed: false })
    store.getState().completeLesson('context')
    expect(store.getState().completedLessonIds).toEqual([])
    store.getState().updateContextProgress({ engineeringPassed: true })
    store.getState().completeLesson('context')
    expect(store.getState().completedLessonIds).toEqual(['context'])
    expect(store.getState().lessonCompleted).toBe(false)
    expect(store.getState().lessonProgress.context).toBe(100)
    expect(store.getState().unlockedLessonIds).toContain('model-inside')
    expect(getLessonStatus(modelInsideLesson, store.getState())).toBe('available')
    expect(getLessonStatus(lockedLesson, store.getState())).toBe('locked')
    expect(getLessonStatus(contextLesson, store.getState())).toBe('completed')
    expect(getProgress(store.getState())).toBe(Math.round(100 / lessons.length))
    store.getState().completeLesson('system-overview')
    expect(getProgress(store.getState())).toBe(Math.round(200 / lessons.length))
    store.getState().startLesson('model-inside')
    store.getState().completeLesson('model-inside')
    expect(store.getState().currentLessonId).toBe('model-inside')
    expect(store.getState().completedLessonIds).not.toContain('model-inside')
  })

  it('restarts Context while preserving achievements, map completion, and Phase 2 progress', () => {
    const storage = memoryStorage()
    const store = createLearningStore(storage)
    store.getState().updateOverviewProgress({ currentStep: 9, unlockedTerms: ['context', 'model'] })
    store.getState().updateContextProgress({
      currentStep: CONTEXT_STEP_COUNT - 1,
      predictionChoice: 'more-information',
      unlockedTerms: [...CONTEXT_TERM_IDS],
      engineeringPassed: true,
      challengePassed: true,
    })
    store.getState().completeLesson('context')
    store.getState().restartContext()
    const restored = createLearningStore(storage).getState()
    expect(restored.contextProgress).toEqual({
      currentStep: 0,
      furthestStep: 0,
      predictionChoice: null,
      unlockedTerms: [...CONTEXT_TERM_IDS],
      engineeringPassed: true,
      challengePassed: true,
    })
    expect(restored.currentStep).toBe(9)
    expect(restored.completedLessonIds).toEqual(['context'])
    expect(restored.lessonProgress.context).toBe(100)
    expect(restored.unlockedLessonIds).toContain('model-inside')
    restored.resetProgress()
    const reset = createLearningStore(storage).getState()
    expect(reset.contextProgress.currentStep).toBe(0)
    expect(reset.contextProgress.unlockedTerms).toEqual([])
    expect(reset.contextProgress.engineeringPassed).toBe(false)
    expect(reset.contextProgress.challengePassed).toBe(false)
    expect(reset.lessonProgress.context).toBe(0)
    expect(reset.unlockedLessonIds).toContain('model-inside')
    expect(reset.unlockedLessonIds).toContain('tools')
    expect(reset.unlockedLessonIds).not.toContain('agent-loop')
  })

  it('preserves a Phase 2 snapshot and initializes Phase 3 with no unearned progress', () => {
    const storage = memoryStorage()
    storage.setItem(
      LEARNING_STORAGE_KEY,
      JSON.stringify({
        version: 2,
        state: {
          currentLessonId: 'system-overview',
          currentStep: 15,
          furthestStep: 20,
          unlockedTerms: ['context', 'tool'],
          predictionChoice: 'needs-search',
          harnessRevealed: true,
          completedLessonIds: ['system-overview', 'context'],
          contextProgress: { currentStep: 18, engineeringPassed: true, challengePassed: true },
          unlockedLessonIds: ['model-inside'],
        },
      }),
    )
    const state = createLearningStore(storage).getState()
    expect(state.currentStep).toBe(15)
    expect(state.furthestStep).toBe(20)
    expect(state.harnessRevealed).toBe(true)
    expect(state.completedLessonIds).toEqual(['system-overview'])
    expect(state.contextProgress).toEqual({
      currentStep: 0,
      furthestStep: 0,
      unlockedTerms: [],
      predictionChoice: null,
      engineeringPassed: false,
      challengePassed: false,
    })
    expect(state.unlockedLessonIds).toContain('model-inside')
    expect(state.unlockedLessonIds).toContain('tools')
    expect(state.unlockedLessonIds).not.toContain('agent-loop')
  })

  it('sanitizes Context patches and restores only derived availability and progress', () => {
    const storage = memoryStorage()
    const store = createLearningStore(storage)
    store.getState().updateContextProgress({
      currentStep: 500,
      furthestStep: -1,
      unlockedTerms: ['prompt', 'prompt', 'unknown'],
      predictionChoice: 'invalid',
      engineeringPassed: 'true',
      challengePassed: 1,
    } as unknown as Partial<ContextProgress>)
    expect(store.getState().contextProgress).toEqual({
      currentStep: CONTEXT_STEP_COUNT - 1,
      furthestStep: CONTEXT_STEP_COUNT - 1,
      unlockedTerms: ['prompt'],
      predictionChoice: null,
      engineeringPassed: false,
      challengePassed: false,
    })
    storage.setItem(
      LEARNING_STORAGE_KEY,
      JSON.stringify({
        version: 3,
        state: {
          contextProgress: null,
          unlockedLessonIds: ['model-inside', 'tools'],
          lessonProgress: { context: 100 },
          updateContextProgress: 'bad',
        },
      }),
    )
    const restored = createLearningStore(storage).getState()
    expect(restored.contextProgress.currentStep).toBe(0)
    expect(restored.unlockedLessonIds).toEqual([
      'system-overview',
      'context',
      'model-inside',
      'tools',
    ])
    expect(restored.lessonProgress.context).toBe(0)
    expect(restored.updateContextProgress).toBeTypeOf('function')
  })
})
