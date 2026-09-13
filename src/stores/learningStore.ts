import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import { getLessonById, lessons } from '../content/lessons'
import { modelInsideSteps } from '../features/model-inside/data/modelInsideSteps'
import { toolsLessonSteps } from '../features/tools-lesson/data/toolsLessonSteps'
import {
  hasToolsInteractions,
  TOOLS_LESSON_ID,
  TOOLS_STEP_COUNT,
  TOOLS_INTERACTION_MODES,
  TOOL_TERM_IDS,
  type ToolsProgress,
  type ToolsInteractionMode,
} from '../features/tools-lesson/types'
import {
  CONTEXT_LESSON_ID,
  CONTEXT_STEP_COUNT,
  CONTEXT_TERM_IDS,
  type ContextProgress,
  type ContextTermId,
} from '../features/context-lesson/types'
import {
  OVERVIEW_LESSON_ID,
  OVERVIEW_STEP_COUNT,
  OVERVIEW_TERM_IDS,
  type OverviewProgress,
  type TermId,
} from '../features/system-overview/types'
import {
  hasModelInteractions,
  MODEL_INSIDE_LESSON_ID,
  MODEL_INSIDE_STEP_COUNT,
  MODEL_INTERACTION_MODES,
  MODEL_TERM_IDS,
  type ModelInsideProgress,
  type ModelInteractionMode,
} from '../features/model-inside/types'
import type { LearningState, Lesson, LessonStatus, SystemNodeId } from '../types/learning'
import { getChapter } from '../features/curriculum/registry'
import {
  availableChapterIds,
  reduceChapterProgress,
  restoreCurriculum,
  type ChapterAction,
} from '../features/curriculum/progress'

export const LEARNING_STORAGE_KEY = 'ai-learning-lab:learning'
const STORAGE_VERSION = 6

export type LearningStore = LearningState & {
  startLesson: (id: string) => void
  completeLesson: (id: string) => void
  setSelectedNode: (id: SystemNodeId | null) => void
  updateOverviewProgress: (patch: Partial<OverviewProgress>) => void
  restartOverview: () => void
  updateContextProgress: (patch: Partial<ContextProgress>) => void
  restartContext: () => void
  updateModelInsideProgress: (patch: Partial<ModelInsideProgress>) => void
  restartModelInside: () => void
  updateToolsProgress: (patch: Partial<ToolsProgress>) => void
  restartTools: () => void
  completeChapterStep: (id: string, stepId: string) => void
  moveChapterStep: (id: string, index: number) => void
  answerChapter: (id: string, questionId: string, answerId: string) => void
  restartChapter: (id: string) => void
  resetProgress: () => void
}

function initialOverviewProgress(): OverviewProgress {
  return {
    currentStep: 0,
    furthestStep: 0,
    unlockedTerms: [],
    predictionChoice: null,
    harnessRevealed: false,
    challengePassed: false,
  }
}

function initialContextProgress(): ContextProgress {
  return {
    currentStep: 0,
    furthestStep: 0,
    unlockedTerms: [],
    predictionChoice: null,
    engineeringPassed: false,
    challengePassed: false,
  }
}

function initialModelInsideProgress(): ModelInsideProgress {
  return {
    currentStep: 0,
    furthestStep: 0,
    unlockedTerms: [],
    completedInteractions: [],
    summaryReached: false,
    challengePassed: false,
  }
}

function chapterAvailability(completedLessonIds: string[]): string[] {
  return [
    ...lessons.filter((lesson) => lesson.published && !getChapter(lesson.id)).map((lesson) => lesson.id),
    ...availableChapterIds(completedLessonIds).filter(isPublishedId),
  ]
}

function canAccessLesson(id: string, completedLessonIds: string[]): boolean {
  return isPublishedId(id) && chapterAvailability(completedLessonIds).includes(id)
}

function applyChapterAction(state: LearningState, id: string, action: ChapterAction) {
  const chapter = getChapter(id)
  if (!chapter || state.currentLessonId !== id || !canAccessLesson(id, state.completedLessonIds))
    return state
  const current = state.chapterProgress[id]
  if (!current) return state
  const progress = reduceChapterProgress(chapter, current, action)
  if (progress === current) return state
  const curriculum = restoreCurriculum(
    { ...state.chapterProgress, [id]: progress },
    state.completedLessonIds,
  )
  return {
    ...curriculum,
    lessonProgress: { ...state.lessonProgress, ...curriculum.lessonProgress },
    startedLessonIds: [...new Set([...state.startedLessonIds, ...curriculum.completedLessonIds])],
    unlockedLessonIds: chapterAvailability(curriculum.completedLessonIds),
  }
}

function initialToolsProgress(): ToolsProgress {
  return {
    currentStep: 0,
    furthestStep: 0,
    unlockedTerms: [],
    completedInteractions: [],
    summaryReached: false,
    challengePassed: false,
  }
}

function chapterProgress(
  overview: OverviewProgress,
  context: ContextProgress,
  completedLessonIds: string[],
  modelInside: ModelInsideProgress,
  tools: ToolsProgress,
  previousProgress: Record<string, number> = {},
): Record<string, number> {
  // Reserve full progress for a passed challenge, including after a learner replays the lesson.
  return {
    ...previousProgress,
    [OVERVIEW_LESSON_ID]: completedLessonIds.includes(OVERVIEW_LESSON_ID)
      ? 100
      : Math.round((overview.furthestStep / OVERVIEW_STEP_COUNT) * 100),
    [CONTEXT_LESSON_ID]: completedLessonIds.includes(CONTEXT_LESSON_ID)
      ? 100
      : Math.round((context.furthestStep / CONTEXT_STEP_COUNT) * 100),
    [MODEL_INSIDE_LESSON_ID]: completedLessonIds.includes(MODEL_INSIDE_LESSON_ID)
      ? 100
      : Math.round((modelInside.furthestStep / MODEL_INSIDE_STEP_COUNT) * 100),
    [TOOLS_LESSON_ID]: completedLessonIds.includes(TOOLS_LESSON_ID)
      ? 100
      : Math.round((tools.furthestStep / TOOLS_STEP_COUNT) * 100),
  }
}

function initialState(): LearningState {
  const curriculum = restoreCurriculum({}, [])
  return {
    ...initialOverviewProgress(),
    contextProgress: initialContextProgress(),
    modelInsideProgress: initialModelInsideProgress(),
    toolsProgress: initialToolsProgress(),
    chapterProgress: curriculum.chapterProgress,
    challengeResults: curriculum.challengeResults,
    lessonProgress: {
      ...curriculum.lessonProgress,
      [OVERVIEW_LESSON_ID]: 0,
      [CONTEXT_LESSON_ID]: 0,
      [MODEL_INSIDE_LESSON_ID]: 0,
      [TOOLS_LESSON_ID]: 0,
    },
    unlockedLessonIds: chapterAvailability([]),
    currentLessonId: null,
    completedLessonIds: [],
    startedLessonIds: [],
    currentMode: 'guided',
    selectedNode: null,
    lessonCompleted: false,
  }
}

function isPublishedId(value: unknown): value is string {
  return typeof value === 'string' && getLessonById(value)?.published === true
}

function isNode(value: unknown): value is SystemNodeId {
  return value === 'user' || value === 'model' || value === 'answer'
}

function validIds(value: unknown): string[] {
  return Array.isArray(value) ? [...new Set(value.filter(isPublishedId))] : []
}

function validStep(value: unknown, count = OVERVIEW_STEP_COUNT): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.min(count - 1, Math.floor(value)))
    : 0
}

function sanitizeContextProgress(value: unknown): ContextProgress {
  const source =
    value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const currentStep = validStep(source.currentStep, CONTEXT_STEP_COUNT)
  return {
    currentStep,
    furthestStep: Math.max(currentStep, validStep(source.furthestStep, CONTEXT_STEP_COUNT)),
    unlockedTerms: Array.isArray(source.unlockedTerms)
      ? [
          ...new Set(
            source.unlockedTerms.filter((id): id is ContextTermId =>
              CONTEXT_TERM_IDS.some((term) => term === id),
            ),
          ),
        ]
      : [],
    predictionChoice:
      source.predictionChoice === 'only-prompt' || source.predictionChoice === 'more-information'
        ? source.predictionChoice
        : null,
    engineeringPassed: source.engineeringPassed === true,
    challengePassed: source.challengePassed === true,
  }
}

function isTermId(value: unknown): value is TermId {
  return OVERVIEW_TERM_IDS.some((id) => id === value)
}

function sanitizeModelInsideProgress(value: unknown, repairPosition = false): ModelInsideProgress {
  const source =
    value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  let currentStep = validStep(source.currentStep, MODEL_INSIDE_STEP_COUNT)
  let furthestStep = Math.max(currentStep, validStep(source.furthestStep, MODEL_INSIDE_STEP_COUNT))
  const completedInteractions = Array.isArray(source.completedInteractions)
    ? [
        ...new Set(
          source.completedInteractions.filter((mode): mode is ModelInteractionMode =>
            MODEL_INTERACTION_MODES.some((interaction) => interaction === mode),
          ),
        ),
      ]
    : []
  if (repairPosition) {
    // A damaged snapshot must resume at a usable interaction, not an impossible challenge.
    const missingMode = MODEL_INTERACTION_MODES.find(
      (mode) => !completedInteractions.includes(mode),
    )
    const firstMissing = modelInsideSteps.findIndex((step) => step.mode === missingMode)
    if (firstMissing >= 0) {
      currentStep = Math.min(currentStep, firstMissing)
      furthestStep = Math.min(furthestStep, firstMissing)
    }
  }
  const interactionsFinished = hasModelInteractions({ completedInteractions })
  const summaryReached =
    interactionsFinished &&
    (source.summaryReached === true || furthestStep === MODEL_INSIDE_STEP_COUNT - 1)
  const inferenceLearned =
    interactionsFinished &&
    (furthestStep >= modelInsideSteps.findIndex((step) => step.mode === 'inference') ||
      summaryReached ||
      (Array.isArray(source.unlockedTerms) && source.unlockedTerms.includes('inference')))
  return {
    currentStep,
    furthestStep,
    completedInteractions,
    summaryReached,
    unlockedTerms: MODEL_TERM_IDS.filter((id) =>
      id === 'inference'
        ? inferenceLearned
        : modelInsideSteps.some(
            (step) =>
              step.unlockedTerm === id && completedInteractions.some((mode) => mode === step.mode),
          ),
    ),
    challengePassed: source.challengePassed === true && summaryReached && interactionsFinished,
  }
}

function sanitizeOverviewProgress(source: Record<string, unknown>): OverviewProgress {
  const currentStep = validStep(source.currentStep)
  return {
    currentStep,
    furthestStep: Math.max(currentStep, validStep(source.furthestStep)),
    unlockedTerms: Array.isArray(source.unlockedTerms)
      ? [...new Set(source.unlockedTerms.filter(isTermId))]
      : [],
    predictionChoice:
      source.predictionChoice === 'always' || source.predictionChoice === 'needs-search'
        ? source.predictionChoice
        : null,
    harnessRevealed: source.harnessRevealed === true,
    challengePassed: source.challengePassed === true,
  }
}

function sanitizeToolsProgress(value: unknown, repairPosition = false): ToolsProgress {
  const source =
    value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  let currentStep = validStep(source.currentStep, TOOLS_STEP_COUNT)
  let furthestStep = Math.max(currentStep, validStep(source.furthestStep, TOOLS_STEP_COUNT))
  const completedInteractions = Array.isArray(source.completedInteractions)
    ? [
        ...new Set(
          source.completedInteractions.filter((mode): mode is ToolsInteractionMode =>
            TOOLS_INTERACTION_MODES.some((interaction) => interaction === mode),
          ),
        ),
      ]
    : []
  if (repairPosition) {
    const missingMode = TOOLS_INTERACTION_MODES.find(
      (mode) => !completedInteractions.includes(mode),
    )
    const firstMissing = toolsLessonSteps.findIndex((step) => step.mode === missingMode)
    if (firstMissing >= 0) {
      currentStep = Math.min(currentStep, firstMissing)
      furthestStep = Math.min(furthestStep, firstMissing)
    }
  }
  const interactionsFinished = hasToolsInteractions({ completedInteractions })
  const summaryReached =
    interactionsFinished &&
    (source.summaryReached === true || furthestStep === TOOLS_STEP_COUNT - 1)
  return {
    currentStep,
    furthestStep,
    completedInteractions,
    summaryReached,
    // Terms are earned through their activity, never by a stale or arbitrary persisted ID.
    unlockedTerms: TOOL_TERM_IDS.filter((id) =>
      id === 'function-calling'
        ? completedInteractions.includes('call')
        : toolsLessonSteps.some(
            (step) =>
              step.unlockedTerm === id && completedInteractions.some((mode) => mode === step.mode),
          ),
    ),
    challengePassed: source.challengePassed === true && summaryReached && interactionsFinished,
  }
}

function sanitizeState(
  value: unknown,
  includeOverview = true,
  includeContext = true,
  includeModelInside = true,
  repairModelPosition = false,
  includeTools = true,
  repairToolsPosition = false,
  includeCurriculum = true,
): LearningState {
  const source =
    value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  // Unpublished chapters in older snapshots cannot award later-phase achievements.
  const availableIds = (value: unknown) =>
    validIds(value).filter(
      (id) =>
        (includeContext || id !== CONTEXT_LESSON_ID) &&
        (includeModelInside || id !== MODEL_INSIDE_LESSON_ID) &&
        (includeTools || id !== TOOLS_LESSON_ID),
    )
  let completedLessonIds = availableIds(source.completedLessonIds).filter((id) => !getChapter(id))
  const lessonCompleted =
    completedLessonIds.includes(OVERVIEW_LESSON_ID) ||
    (includeOverview && source.lessonCompleted === true)
  if (lessonCompleted && !completedLessonIds.includes(OVERVIEW_LESSON_ID)) {
    completedLessonIds.push(OVERVIEW_LESSON_ID)
  }
  const savedCurrentLessonId = availableIds([source.currentLessonId])[0] ?? null
  const overview = includeOverview ? sanitizeOverviewProgress(source) : initialOverviewProgress()
  const contextProgress = includeContext
    ? sanitizeContextProgress(source.contextProgress)
    : initialContextProgress()
  const modelInsideProgress = includeModelInside
    ? sanitizeModelInsideProgress(source.modelInsideProgress, repairModelPosition)
    : initialModelInsideProgress()
  const toolsProgress = includeTools
    ? sanitizeToolsProgress(source.toolsProgress, repairToolsPosition)
    : initialToolsProgress()
  if (!modelInsideProgress.challengePassed) {
    const prematureCompletion = completedLessonIds.indexOf(MODEL_INSIDE_LESSON_ID)
    if (prematureCompletion >= 0) completedLessonIds.splice(prematureCompletion, 1)
  } else if (!completedLessonIds.includes(MODEL_INSIDE_LESSON_ID)) {
    // Restore atomically if the tab closed after saving a passed challenge but before completion.
    completedLessonIds.push(MODEL_INSIDE_LESSON_ID)
  }
  if (!toolsProgress.challengePassed) {
    const prematureCompletion = completedLessonIds.indexOf(TOOLS_LESSON_ID)
    if (prematureCompletion >= 0) completedLessonIds.splice(prematureCompletion, 1)
  } else if (!completedLessonIds.includes(TOOLS_LESSON_ID)) {
    completedLessonIds.push(TOOLS_LESSON_ID)
  }
  const curriculum = restoreCurriculum(source.chapterProgress, completedLessonIds, includeCurriculum)
  completedLessonIds = curriculum.completedLessonIds
  const currentLessonId = savedCurrentLessonId &&
    (includeCurriculum || !getChapter(savedCurrentLessonId)) &&
    canAccessLesson(savedCurrentLessonId, completedLessonIds) ? savedCurrentLessonId : null
  return {
    ...overview,
    contextProgress,
    modelInsideProgress,
    toolsProgress,
    chapterProgress: curriculum.chapterProgress,
    challengeResults: curriculum.challengeResults,
    lessonProgress: chapterProgress(
      overview,
      contextProgress,
      completedLessonIds,
      modelInsideProgress,
      toolsProgress,
      curriculum.lessonProgress,
    ),
    unlockedLessonIds: chapterAvailability(completedLessonIds),
    currentLessonId,
    completedLessonIds,
    startedLessonIds: [
      ...new Set([
        ...availableIds(source.startedLessonIds).filter((id) =>
          (includeCurriculum || !getChapter(id)) && canAccessLesson(id, completedLessonIds),
        ),
        ...completedLessonIds,
        ...(currentLessonId ? [currentLessonId] : []),
      ]),
    ],
    // Explore and Challenge have types and visible previews, but are not enabled yet.
    currentMode: 'guided',
    selectedNode: isNode(source.selectedNode) ? source.selectedNode : null,
    lessonCompleted,
  }
}

function defaultStorage(): StateStorage | undefined {
  try {
    return globalThis.localStorage
  } catch {
    return undefined
  }
}

/** Storage may be unavailable or full; learning must still work in this tab. */
function safeStorage(storage: StateStorage | undefined): StateStorage {
  return {
    getItem(name) {
      try {
        return storage?.getItem(name) ?? null
      } catch {
        return null
      }
    },
    setItem(name, value) {
      try {
        return storage?.setItem(name, value)
      } catch {
        return undefined
      }
    },
    removeItem(name) {
      try {
        return storage?.removeItem(name)
      } catch {
        return undefined
      }
    },
  }
}

/** A separate instance and optional storage make persistence straightforward to test. */
export function createLearningStore(storage: StateStorage | undefined = defaultStorage()) {
  return create<LearningStore>()(
    persist(
      (set) => ({
        ...initialState(),
        startLesson(id) {
          if (!isPublishedId(id)) return
          set((state) => {
            if (!canAccessLesson(id, state.completedLessonIds)) return state
            if (state.currentLessonId === id && state.startedLessonIds.includes(id)) return state
            return {
              currentLessonId: id,
              startedLessonIds: [...new Set([...state.startedLessonIds, id])],
              selectedNode: state.currentLessonId === id ? state.selectedNode : null,
            }
          })
        },
        completeLesson(id) {
          if (!isPublishedId(id)) return
          set((state) => {
            if (!canAccessLesson(id, state.completedLessonIds)) return state
            if (state.completedLessonIds.includes(id)) return state
            if (getChapter(id) &&
                (state.currentLessonId !== id || !state.chapterProgress[id]?.challengePassed))
              return state
            if (
              id === CONTEXT_LESSON_ID &&
              (state.contextProgress.furthestStep < CONTEXT_STEP_COUNT - 1 ||
                !state.contextProgress.engineeringPassed ||
                !state.contextProgress.challengePassed)
            )
              return state
            if (
              id === MODEL_INSIDE_LESSON_ID &&
              (!state.modelInsideProgress.summaryReached ||
                !hasModelInteractions(state.modelInsideProgress) ||
                !state.modelInsideProgress.challengePassed)
            )
              return state
            if (
              id === TOOLS_LESSON_ID &&
              (!state.toolsProgress.summaryReached ||
                !hasToolsInteractions(state.toolsProgress) ||
                !state.toolsProgress.challengePassed)
            )
              return state
            const completedLessonIds = [...state.completedLessonIds, id]
            return {
              currentLessonId: id,
              completedLessonIds,
              startedLessonIds: [...new Set([...state.startedLessonIds, id])],
              lessonCompleted: id === OVERVIEW_LESSON_ID || state.lessonCompleted,
              lessonProgress: chapterProgress(
                state,
                state.contextProgress,
                completedLessonIds,
                state.modelInsideProgress,
                state.toolsProgress,
                state.lessonProgress,
              ),
              unlockedLessonIds: chapterAvailability(completedLessonIds),
            }
          })
        },
        setSelectedNode(id) {
          if (id !== null && !isNode(id)) return
          set((state) => (state.selectedNode === id ? state : { selectedNode: id }))
        },
        updateOverviewProgress(patch) {
          set((state) => {
            const overview = sanitizeOverviewProgress({ ...state, ...patch })
            return {
              ...overview,
              lessonProgress: chapterProgress(
                overview,
                state.contextProgress,
                state.completedLessonIds,
                state.modelInsideProgress,
                state.toolsProgress,
                state.lessonProgress,
              ),
            }
          })
        },
        restartOverview() {
          set((state) => {
            const overview = {
              ...state,
              currentStep: 0,
              furthestStep: 0,
              predictionChoice: null,
              harnessRevealed: false,
            }
            return {
              currentStep: 0,
              furthestStep: 0,
              predictionChoice: null,
              harnessRevealed: false,
              lessonProgress: chapterProgress(
                overview,
                state.contextProgress,
                state.completedLessonIds,
                state.modelInsideProgress,
                state.toolsProgress,
                state.lessonProgress,
              ),
            }
          })
        },
        updateContextProgress(patch) {
          set((state) => {
            const contextProgress = sanitizeContextProgress({ ...state.contextProgress, ...patch })
            return {
              contextProgress,
              lessonProgress: chapterProgress(
                state,
                contextProgress,
                state.completedLessonIds,
                state.modelInsideProgress,
                state.toolsProgress,
                state.lessonProgress,
              ),
            }
          })
        },
        restartContext() {
          set((state) => {
            const contextProgress = {
              ...state.contextProgress,
              currentStep: 0,
              furthestStep: 0,
              predictionChoice: null,
            }
            return {
              contextProgress,
              lessonProgress: chapterProgress(
                state,
                contextProgress,
                state.completedLessonIds,
                state.modelInsideProgress,
                state.toolsProgress,
                state.lessonProgress,
              ),
            }
          })
        },
        updateModelInsideProgress(patch) {
          set((state) => {
            const modelInsideProgress = sanitizeModelInsideProgress({
              ...state.modelInsideProgress,
              ...patch,
            })
            return {
              modelInsideProgress,
              lessonProgress: chapterProgress(
                state,
                state.contextProgress,
                state.completedLessonIds,
                modelInsideProgress,
                state.toolsProgress,
                state.lessonProgress,
              ),
            }
          })
        },
        restartModelInside() {
          set((state) => {
            // Replay changes presentation position; earned interactions and achievements remain.
            const modelInsideProgress = {
              ...state.modelInsideProgress,
              currentStep: 0,
              furthestStep: 0,
            }
            return {
              modelInsideProgress,
              lessonProgress: chapterProgress(
                state,
                state.contextProgress,
                state.completedLessonIds,
                modelInsideProgress,
                state.toolsProgress,
                state.lessonProgress,
              ),
            }
          })
        },
        updateToolsProgress(patch) {
          set((state) => {
            const toolsProgress = sanitizeToolsProgress({ ...state.toolsProgress, ...patch })
            return {
              toolsProgress,
              lessonProgress: chapterProgress(
                state,
                state.contextProgress,
                state.completedLessonIds,
                state.modelInsideProgress,
                toolsProgress,
                state.lessonProgress,
              ),
            }
          })
        },
        restartTools() {
          set((state) => {
            const toolsProgress = {
              ...state.toolsProgress,
              currentStep: 0,
              furthestStep: 0,
            }
            return {
              toolsProgress,
              lessonProgress: chapterProgress(
                state,
                state.contextProgress,
                state.completedLessonIds,
                state.modelInsideProgress,
                toolsProgress,
                state.lessonProgress,
              ),
            }
          })
        },
        completeChapterStep(id, stepId) {
          set((state) => applyChapterAction(state, id, { type: 'complete', stepId }))
        },
        moveChapterStep(id, index) {
          set((state) => applyChapterAction(state, id, { type: 'move', index }))
        },
        answerChapter(id, questionId, answerId) {
          set((state) => applyChapterAction(state, id, { type: 'answer', questionId, answerId }))
        },
        restartChapter(id) {
          set((state) => applyChapterAction(state, id, { type: 'restart' }))
        },
        resetProgress() {
          set(initialState())
        },
      }),
      {
        name: LEARNING_STORAGE_KEY,
        version: STORAGE_VERSION,
        storage: createJSONStorage(() => safeStorage(storage)),
        partialize: (state) => sanitizeState(state),
        migrate: (persistedState, version) =>
          sanitizeState(
            persistedState,
            version >= 2,
            version >= 3,
            version >= 4,
            false,
            version >= 5,
            false,
            version >= 6,
          ),
        merge: (persistedState, currentState) => ({
          ...currentState,
          ...sanitizeState(persistedState, true, true, true, true, true, true),
        }),
      },
    ),
  )
}

export const useLearningStore = createLearningStore()

export function getLessonStatus(
  lesson: Lesson,
  state: Pick<LearningState, 'completedLessonIds' | 'startedLessonIds'>,
): LessonStatus {
  if (!canAccessLesson(lesson.id, state.completedLessonIds)) return 'locked'
  if (state.completedLessonIds.includes(lesson.id)) return 'completed'
  if (state.startedLessonIds.includes(lesson.id)) return 'in-progress'
  return 'available'
}

/** Overall journey progress uses every registered lesson. */
export function getProgress(state: Pick<LearningState, 'completedLessonIds'>): number {
  const completed = validIds(state.completedLessonIds)
    .filter((id) => canAccessLesson(id, state.completedLessonIds))
  return Math.round((completed.length / lessons.length) * 100)
}

export function getResumeLessonId(
  state: Pick<LearningState, 'completedLessonIds'> &
    Partial<Pick<LearningState, 'currentLessonId'>>,
): string | null {
  const published = lessons.filter((lesson) => canAccessLesson(lesson.id, state.completedLessonIds))
  if (
    isPublishedId(state.currentLessonId) &&
    canAccessLesson(state.currentLessonId, state.completedLessonIds) &&
    !state.completedLessonIds.includes(state.currentLessonId)
  ) {
    return state.currentLessonId
  }
  return (
    published.find((lesson) => !state.completedLessonIds.includes(lesson.id))?.id ??
    published[0]?.id ??
    null
  )
}
