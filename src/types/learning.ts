import type { OverviewProgress } from '../features/system-overview/types'
import type { ContextProgress } from '../features/context-lesson/types'
import type { ModelInsideProgress } from '../features/model-inside/types'
import type { ToolsProgress } from '../features/tools-lesson/types'
import type { ChapterProgress } from '../features/curriculum/types'

export type LessonStatus = 'locked' | 'unlocked' | 'available' | 'in-progress' | 'completed'

export type LearningMode = 'guided' | 'explore' | 'challenge'

export type SystemNodeId = 'user' | 'model' | 'answer'

export type LessonCategory = 'foundation' | 'action' | 'context' | 'reliability'

export type Lesson = {
  id: string
  order: number
  title: string
  subtitle: string
  minutes: number
  category: LessonCategory
  published: boolean
  learningGoal: string
  beginnerHeading?: string
  beginnerExplanation: string
  analogy?: string
  technicalExplanation?: string
  misconceptions: { wrong: string; correct: string }[]
  relatedConcepts: string[]
  visualization:
    'system-overview' | 'context-workspace' | 'model-inside' | 'tools-lesson' | 'curriculum' | 'placeholder'
  visualizationNote?: string
  completion?: {
    promptTitle: string
    promptDescription: string
    completedTitle: string
  }
}

export type LearningState = OverviewProgress & {
  contextProgress: ContextProgress
  modelInsideProgress: ModelInsideProgress
  toolsProgress: ToolsProgress
  chapterProgress: Record<string, ChapterProgress>
  challengeResults: Record<string, boolean>
  lessonProgress: Record<string, number>
  unlockedLessonIds: string[]
  currentLessonId: string | null
  completedLessonIds: string[]
  startedLessonIds: string[]
  currentMode: LearningMode
  selectedNode: SystemNodeId | null
  lessonCompleted: boolean
}

/** Reserved for later phases; these fields are not part of the active store. */
export type FutureLearningState = {
  challengeScores: Record<string, number>
  unlockedConcepts: string[]
  guidedTourStep: number
}
