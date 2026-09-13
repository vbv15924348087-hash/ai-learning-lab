import { describe, expect, it } from 'vitest'
import type { StateStorage } from 'zustand/middleware'
import { getLessonById, lessons } from '../content/lessons'
import { chapters } from '../features/curriculum/registry'
import type { ChapterDefinition, ChapterProgress } from '../features/curriculum/types'
import { TOOLS_INTERACTION_MODES, TOOLS_STEP_COUNT } from '../features/tools-lesson/types'
import {
  createLearningStore, getLessonStatus, getResumeLessonId, LEARNING_STORAGE_KEY,
} from './learningStore'

function memoryStorage(): StateStorage {
  const entries = new Map<string, string>()
  return {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => { entries.set(key, value) },
    removeItem: (key) => { entries.delete(key) },
  }
}

type Store = ReturnType<typeof createLearningStore>
const earnedTools = {
  currentStep: TOOLS_STEP_COUNT - 1,
  furthestStep: TOOLS_STEP_COUNT - 1,
  completedInteractions: [...TOOLS_INTERACTION_MODES],
  summaryReached: true,
  challengePassed: true,
}

function unlockFirstChapter(store: Store) {
  store.getState().updateToolsProgress(earnedTools)
  store.getState().completeLesson('tools')
}

function finishSteps(store: Store, chapter: ChapterDefinition) {
  store.getState().startLesson(chapter.id)
  chapter.steps.forEach((step, index) => {
    store.getState().moveChapterStep(chapter.id, index)
    store.getState().completeChapterStep(chapter.id, step.id)
  })
}

function earnedChapter(chapter: ChapterDefinition): ChapterProgress {
  return {
    currentStep: chapter.steps.length - 1,
    completedSteps: chapter.steps.map((step) => step.id),
    unlockedTerms: chapter.terms.map((term) => term.id),
    answers: Object.fromEntries(chapter.challenge.map((question) => [question.id, question.answer])),
    challengePassed: true,
  }
}

describe('curriculum progress and prerequisites', () => {
  it('blocks locked routes, direct completion, early answers, invalid moves and stale callbacks', () => {
    const store = createLearningStore(memoryStorage())
    const chapter = chapters[0]
    const initial = store.getState()
    store.getState().startLesson(chapter.id)
    store.getState().completeLesson(chapter.id)
    store.getState().completeChapterStep(chapter.id, chapter.steps[0].id)
    expect(store.getState()).toBe(initial)
    unlockFirstChapter(store)
    expect(getLessonStatus(getLessonById(chapter.id)!, store.getState())).toBe('available')
    store.getState().startLesson(chapter.id)
    store.getState().moveChapterStep(chapter.id, 99)
    store.getState().moveChapterStep(chapter.id, Number.NaN)
    store.getState().completeChapterStep(chapter.id, chapter.steps[1].id)
    store.getState().answerChapter(chapter.id, chapter.challenge[0].id, chapter.challenge[0].answer)
    expect(store.getState().chapterProgress[chapter.id]).toMatchObject({
      currentStep: 0, completedSteps: [], answers: {}, challengePassed: false,
    })
    store.getState().startLesson('tools')
    const elsewhere = store.getState()
    store.getState().completeChapterStep(chapter.id, chapter.steps[0].id)
    store.getState().restartChapter(chapter.id)
    expect(store.getState()).toBe(elsewhere)
    expect(getResumeLessonId({ completedLessonIds: ['tools'], currentLessonId: chapters[1].id }))
      .not.toBe(chapters[1].id)
  })

  it('completes every chapter in order, requires every interaction and correct answer, and never navigates', () => {
    const storage = memoryStorage()
    const store = createLearningStore(storage)
    unlockFirstChapter(store)
    for (const [index, chapter] of chapters.entries()) {
      expect(store.getState().unlockedLessonIds).toContain(chapter.id)
      if (chapters[index + 1]) expect(store.getState().unlockedLessonIds).not.toContain(chapters[index + 1].id)
      finishSteps(store, chapter)
      expect(store.getState().chapterProgress[chapter.id].unlockedTerms)
        .toEqual(chapter.terms.map((term) => term.id))
      store.getState().completeLesson(chapter.id)
      expect(store.getState().completedLessonIds).not.toContain(chapter.id)
      const first = chapter.challenge[0]
      const incorrect = first.options.find((option) => option.id !== first.answer)!
      store.getState().answerChapter(chapter.id, first.id, incorrect.id)
      expect(store.getState().challengeResults[chapter.id]).toBe(false)
      for (const question of chapter.challenge)
        store.getState().answerChapter(chapter.id, question.id, question.answer)
      expect(store.getState().completedLessonIds).toContain(chapter.id)
      expect(store.getState().challengeResults[chapter.id]).toBe(true)
      expect(store.getState().lessonProgress[chapter.id]).toBe(100)
      expect(store.getState().currentLessonId).toBe(chapter.id)
      expect(getLessonStatus(getLessonById(chapter.id)!, store.getState())).toBe('completed')
    }
    const last = chapters.at(-1)!
    store.getState().restartChapter(last.id)
    store.getState().updateOverviewProgress({ currentStep: 3 })
    const restored = createLearningStore(storage).getState()
    expect(restored.chapterProgress[last.id]).toMatchObject({ currentStep: 0, challengePassed: true })
    expect(restored.lessonProgress[last.id]).toBe(100)
    expect(restored.completedLessonIds).toHaveLength(chapters.length + 1)
    expect(restored.currentStep).toBe(3)
    const snapshot = JSON.parse(storage.getItem(LEARNING_STORAGE_KEY) as string)
    expect(snapshot.version).toBe(6)
    expect(snapshot.state).not.toHaveProperty('answerChapter')
  })

  it('restores partial progress with earned terms and retains it when an old chapter updates', () => {
    const storage = memoryStorage()
    const store = createLearningStore(storage)
    const chapter = chapters[0]
    unlockFirstChapter(store)
    store.getState().startLesson(chapter.id)
    store.getState().completeChapterStep(chapter.id, chapter.steps[0].id)
    store.getState().moveChapterStep(chapter.id, 1)
    const percent = store.getState().lessonProgress[chapter.id]
    store.getState().updateContextProgress({ currentStep: 2 })
    expect(store.getState().lessonProgress[chapter.id]).toBe(percent)
    const restored = createLearningStore(storage).getState()
    expect(restored.chapterProgress[chapter.id]).toMatchObject({
      currentStep: 1,
      completedSteps: [chapter.steps[0].id],
      unlockedTerms: chapter.terms.filter((term) => chapter.steps[0].terms.includes(term.id)).map((term) => term.id),
      challengePassed: false,
    })
    expect(restored.contextProgress.currentStep).toBe(2)
  })
})

describe('curriculum storage recovery', () => {
  it.each([0, 1, 2, 3, 4, 5])('rejects new chapter records in version %s without losing supported old achievements', (version) => {
    const storage = memoryStorage()
    storage.setItem(LEARNING_STORAGE_KEY, JSON.stringify({ version, state: {
      currentLessonId: chapters[0].id,
      completedLessonIds: ['system-overview', 'tools', ...chapters.map((chapter) => chapter.id)],
      startedLessonIds: chapters.map((chapter) => chapter.id),
      chapterProgress: Object.fromEntries(chapters.map((chapter) => [chapter.id, earnedChapter(chapter)])),
      toolsProgress: earnedTools,
    } }))
    const state = createLearningStore(storage).getState()
    expect(state.completedLessonIds).toEqual(version >= 5 ? ['system-overview', 'tools'] : ['system-overview'])
    expect(state.currentLessonId).toBeNull()
    expect(state.chapterProgress[chapters[0].id].completedSteps).toEqual([])
    expect(state.startedLessonIds).not.toContain(chapters[0].id)
    expect(state.unlockedLessonIds.includes(chapters[0].id)).toBe(version >= 5)
  })

  it('repairs malformed steps, invalid answers and unsupported downstream completion without accepting injected methods', () => {
    const storage = memoryStorage()
    const first = chapters[0]
    const second = chapters[1]
    storage.setItem(LEARNING_STORAGE_KEY, JSON.stringify({ version: 6, state: {
      currentLessonId: second.id,
      completedLessonIds: ['tools', first.id, second.id, 'unknown'],
      toolsProgress: earnedTools,
      chapterProgress: {
        [first.id]: {
          currentStep: 900,
          completedSteps: [first.steps[0].id, first.steps[0].id, first.steps[2].id, '__proto__'],
          unlockedTerms: first.terms.map((term) => term.id),
          answers: { [first.challenge[0].id]: 'invalid', unknown: 'injected' },
          challengePassed: true,
        },
        [second.id]: earnedChapter(second),
        unknown: earnedChapter(first),
      },
      challengeResults: { [second.id]: true },
      lessonProgress: { [second.id]: 100 },
      answerChapter: 'injected',
      completeChapterStep: 'injected',
    } }))
    const state = createLearningStore(storage).getState()
    expect(state.completedLessonIds).toEqual(['tools'])
    expect(state.currentLessonId).toBeNull()
    expect(state.chapterProgress[first.id]).toMatchObject({
      currentStep: 1, completedSteps: [first.steps[0].id], answers: {}, challengePassed: false,
    })
    expect(state.chapterProgress[second.id].completedSteps).toEqual([])
    expect(state.chapterProgress).not.toHaveProperty('unknown')
    expect(state.lessonProgress[second.id]).toBe(0)
    expect(state.challengeResults[second.id]).toBe(false)
    expect(state.answerChapter).toBeTypeOf('function')
    expect(state.completeChapterStep).toBeTypeOf('function')
  })

  it('recovers a passed challenge atomically and clears all chapters with reset', () => {
    const storage = memoryStorage()
    const chapter = chapters[0]
    storage.setItem(LEARNING_STORAGE_KEY, JSON.stringify({ version: 6, state: {
      currentLessonId: chapter.id, toolsProgress: earnedTools, completedLessonIds: [],
      chapterProgress: { [chapter.id]: { ...earnedChapter(chapter), challengePassed: false } },
    } }))
    const store = createLearningStore(storage)
    expect(store.getState().completedLessonIds).toEqual(['tools', chapter.id])
    expect(store.getState().currentLessonId).toBe(chapter.id)
    expect(store.getState().unlockedLessonIds).toContain(chapters[1].id)
    store.getState().resetProgress()
    const reset = createLearningStore(storage).getState()
    expect(reset.completedLessonIds).toEqual([])
    expect(reset.chapterProgress[chapter.id].answers).toEqual({})
    expect(reset.unlockedLessonIds).toEqual(lessons.filter((lesson) => lesson.order <= 4).map((lesson) => lesson.id))
  })
})
