import { chapters, getChapter } from './registry'
import type { ChapterDefinition, ChapterProgress } from './types'

export const initialChapterProgress = (): ChapterProgress => ({
  currentStep: 0,
  completedSteps: [],
  unlockedTerms: [],
  answers: {},
  challengePassed: false,
})

function object(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

/** Availability follows the entire prerequisite chain, including when handed damaged IDs. */
export function availableChapterIds(completed: readonly string[]): string[] {
  const available: string[] = []
  let predecessorComplete = completed.includes('tools')
  for (const chapter of chapters) {
    if (!predecessorComplete) break
    available.push(chapter.id)
    predecessorComplete = completed.includes(chapter.id)
  }
  return available
}

export function sanitizeChapterProgress(
  chapter: ChapterDefinition,
  value: unknown,
): ChapterProgress {
  const source = object(value)
  const claimedSteps = Array.isArray(source.completedSteps) ? source.completedSteps : []
  const firstMissing = chapter.steps.findIndex((step) => !claimedSteps.includes(step.id))
  const completedCount = firstMissing === -1 ? chapter.steps.length : firstMissing
  const completedSteps = chapter.steps.slice(0, completedCount).map((step) => step.id)
  const position =
    typeof source.currentStep === 'number' && Number.isFinite(source.currentStep)
      ? Math.floor(source.currentStep)
      : 0
  const currentStep = Math.max(0, Math.min(position, completedCount, chapter.steps.length - 1))
  const sourceAnswers = object(source.answers)
  const answers: Record<string, string> = {}
  const allStepsComplete = chapter.steps.length > 0 && completedCount === chapter.steps.length
  if (allStepsComplete) {
    for (const question of chapter.challenge) {
      const answer = sourceAnswers[question.id]
      if (typeof answer === 'string' && question.options.some((option) => option.id === answer))
        answers[question.id] = answer
    }
  }
  return {
    currentStep,
    completedSteps,
    unlockedTerms: chapter.terms
      .filter((term) =>
        chapter.steps.some(
          (step) => completedSteps.includes(step.id) && step.terms.includes(term.id),
        ),
      )
      .map((term) => term.id),
    answers,
    // Completion is evidence-derived; a persisted boolean cannot award an achievement.
    challengePassed:
      allStepsComplete &&
      chapter.challenge.length > 0 &&
      chapter.challenge.every((question) => answers[question.id] === question.answer),
  }
}

/** Restore in teaching order so unsupported completion can never unlock downstream chapters. */
export function restoreCurriculum(
  value: unknown,
  existingCompleted: readonly string[],
  includeProgress = true,
) {
  const source = includeProgress ? object(value) : {}
  const completedLessonIds = existingCompleted.filter((id) => !getChapter(id))
  const chapterProgress: Record<string, ChapterProgress> = {}
  const challengeResults: Record<string, boolean> = {}
  const lessonProgress: Record<string, number> = {}
  let predecessorComplete = completedLessonIds.includes('tools')
  for (const chapter of chapters) {
    const progress = predecessorComplete
      ? sanitizeChapterProgress(chapter, source[chapter.id])
      : initialChapterProgress()
    chapterProgress[chapter.id] = progress
    challengeResults[chapter.id] = progress.challengePassed
    lessonProgress[chapter.id] = progress.challengePassed
      ? 100
      : Math.round((progress.completedSteps.length / (chapter.steps.length + 1)) * 100)
    if (progress.challengePassed) completedLessonIds.push(chapter.id)
    predecessorComplete = predecessorComplete && progress.challengePassed
  }
  return { chapterProgress, challengeResults, lessonProgress, completedLessonIds }
}

export type ChapterAction =
  | { type: 'complete'; stepId: string }
  | { type: 'move'; index: number }
  | { type: 'answer'; questionId: string; answerId: string }
  | { type: 'restart' }

/** Pure chapter transitions; route ownership is checked by the store before calling. */
export function reduceChapterProgress(
  chapter: ChapterDefinition,
  progress: ChapterProgress,
  action: ChapterAction,
): ChapterProgress {
  switch (action.type) {
    case 'complete':
      if (
        chapter.steps[progress.currentStep]?.id !== action.stepId ||
        progress.completedSteps.includes(action.stepId)
      )
        return progress
      return sanitizeChapterProgress(chapter, {
        ...progress,
        completedSteps: [...progress.completedSteps, action.stepId],
      })
    case 'move': {
      if (!Number.isFinite(action.index)) return progress
      const next = sanitizeChapterProgress(chapter, { ...progress, currentStep: action.index })
      return next.currentStep === progress.currentStep ? progress : next
    }
    case 'answer': {
      if (progress.challengePassed || progress.completedSteps.length !== chapter.steps.length)
        return progress
      const question = chapter.challenge.find((item) => item.id === action.questionId)
      if (
        !question?.options.some((option) => option.id === action.answerId) ||
        progress.answers[action.questionId] === action.answerId
      )
        return progress
      return sanitizeChapterProgress(chapter, {
        ...progress,
        answers: { ...progress.answers, [action.questionId]: action.answerId },
      })
    }
    case 'restart':
      return progress.currentStep === 0 ? progress : { ...progress, currentStep: 0 }
  }
}
