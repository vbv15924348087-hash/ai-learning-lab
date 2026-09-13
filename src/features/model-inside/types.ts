export const MODEL_INSIDE_LESSON_ID = 'model-inside'
export const MODEL_INSIDE_STEP_COUNT = 9
export const MODEL_TERM_IDS = [
  'token',
  'embedding',
  'transformer',
  'attention',
  'inference',
] as const
export type ModelTermId = (typeof MODEL_TERM_IDS)[number]

export const MODEL_INTERACTION_MODES = [
  'tokenization',
  'embedding',
  'transformer',
  'attention',
  'generation',
] as const
export type ModelInteractionMode = (typeof MODEL_INTERACTION_MODES)[number]
export type ModelInsideMode = 'intro' | ModelInteractionMode | 'scores' | 'inference' | 'summary'

export type ModelInsideStep = {
  id: ModelInsideMode
  mode: ModelInsideMode
  title: string
  kicker: string
  beginnerExplanation: string
  whyItMatters: string
  nextLabel: string
  unlockedTerm?: ModelTermId
}

export type ModelTerm = {
  id: ModelTermId
  english: string
  chinese: string
  plain: string
  definition: string
  technical: string
}

export type ModelInsideProgress = {
  currentStep: number
  furthestStep: number
  unlockedTerms: ModelTermId[]
  completedInteractions: ModelInteractionMode[]
  summaryReached: boolean
  challengePassed: boolean
}

export function isModelInteraction(mode: ModelInsideMode): mode is ModelInteractionMode {
  return MODEL_INTERACTION_MODES.some((interaction) => interaction === mode)
}

export function hasModelInteractions(progress: Pick<ModelInsideProgress, 'completedInteractions'>) {
  return MODEL_INTERACTION_MODES.every((mode) => progress.completedInteractions.includes(mode))
}
