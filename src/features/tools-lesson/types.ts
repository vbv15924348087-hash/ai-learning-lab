export const TOOLS_LESSON_ID = 'tools'
export const TOOLS_STEP_COUNT = 10
export const TOOL_TERM_IDS = [
  'tool',
  'function-calling',
  'tool-call',
  'tool-schema',
  'tool-result',
] as const
export type ToolTermId = (typeof TOOL_TERM_IDS)[number]

export const TOOLS_INTERACTION_MODES = [
  'boundary',
  'shelf',
  'matching',
  'call',
  'schema',
  'builder',
  'checkpoint',
  'execution',
  'result',
] as const
export type ToolsInteractionMode = (typeof TOOLS_INTERACTION_MODES)[number]
export type ToolsMode = ToolsInteractionMode | 'summary'

export type ToolsLessonStep = {
  id: ToolsMode
  mode: ToolsMode
  title: string
  kicker: string
  beginnerExplanation: string
  whyItMatters: string
  nextLabel: string
  interactionHint: string
  unlockedTerm?: ToolTermId
}

export type ToolTerm = {
  id: ToolTermId
  label: string
  chinese: string
  levels: [string, string, string]
}

export type ToolsProgress = {
  currentStep: number
  furthestStep: number
  unlockedTerms: ToolTermId[]
  completedInteractions: ToolsInteractionMode[]
  summaryReached: boolean
  challengePassed: boolean
}

export function isToolsInteraction(mode: ToolsMode): mode is ToolsInteractionMode {
  return TOOLS_INTERACTION_MODES.some((interaction) => interaction === mode)
}

export function hasToolsInteractions(progress: Pick<ToolsProgress, 'completedInteractions'>) {
  return TOOLS_INTERACTION_MODES.every((mode) => progress.completedInteractions.includes(mode))
}
