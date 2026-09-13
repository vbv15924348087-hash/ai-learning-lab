export const CONTEXT_LESSON_ID = 'context'
export const CONTEXT_TERM_IDS = [
  'prompt',
  'context',
  'context-window',
  'context-engineering',
] as const
export type ContextTermId = (typeof CONTEXT_TERM_IDS)[number]
export type ContextSourceId = 'prompt' | 'rules' | 'history' | 'tools' | 'memory' | 'rag' | 'result'
export type ContextVariant =
  | 'question'
  | 'assembly'
  | 'subset'
  | 'sources'
  | 'capacity'
  | 'comparison'
  | 'engineering'
  | 'summary'
export type ContextLessonStep = {
  id: string
  section: 'discover' | 'sources' | 'capacity' | 'practice'
  kicker: string
  title: string
  beginnerExplanation: string
  whyItMatters: string
  flowText: string
  variant: ContextVariant
  items: ContextSourceId[]
  activeSource?: ContextSourceId
  contextLoad?: number
  unlocks?: ContextTermId[]
  gate?: 'prediction' | 'engineering'
}
export type ContextSource = {
  id: ContextSourceId
  label: string
  english: string
  origin: string
  content: string
  explanation: string
  flow: string[]
}
export type ContextProgress = {
  currentStep: number
  furthestStep: number
  unlockedTerms: ContextTermId[]
  predictionChoice: 'only-prompt' | 'more-information' | null
  engineeringPassed: boolean
  challengePassed: boolean
}
export const CONTEXT_STEP_COUNT = 19
export type ContextInformationCard = {
  id: string
  title: string
  detail: string
  verdict: 'relevant' | 'depends' | 'irrelevant'
  feedback: string
}
