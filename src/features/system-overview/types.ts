export const OVERVIEW_LESSON_ID = 'system-overview'
export const OVERVIEW_STEP_COUNT = 22
export const DEMO_START_STEP = 12
export const OVERVIEW_TERM_IDS = ['context', 'model', 'tool', 'harness', 'ai-system'] as const

export type TermId = (typeof OVERVIEW_TERM_IDS)[number]
export type OverviewNodeId =
  'user' | 'context' | 'model' | 'action' | 'harness' | 'tool' | 'result' | 'answer'
export type PredictionChoice = 'always' | 'needs-search'
export type OverviewProgress = {
  currentStep: number
  furthestStep: number
  unlockedTerms: TermId[]
  predictionChoice: PredictionChoice | null
  harnessRevealed: boolean
  challengePassed: boolean
}
export type LessonStep = {
  id: string
  section: 'intuition' | 'discover' | 'demo' | 'explore'
  title: string
  kicker: string
  beginnerExplanation: string
  whyItMatters: string
  activeNodes: OverviewNodeId[]
  activeConnections: string[]
  flowText: string
  unlocks?: TermId
  gate?: 'prediction' | 'harness'
  scene: {
    variant: 'simple' | 'context' | 'decision' | 'request' | 'system'
    visibleNodes: OverviewNodeId[]
    contextItems?: number
    showContextTerm?: boolean
    showModelTerm?: boolean
    showToolTerm?: boolean
    showHarnessTerm?: boolean
    packet?: string
  }
}

export type NodeExplanation = {
  id: OverviewNodeId
  label: string
  term: string
  explanation: string
  connections: string
  example: string
  followUp?: string
}

export type TermDefinition = {
  id: TermId
  english: string
  chinese: string
  explanation: string
}
