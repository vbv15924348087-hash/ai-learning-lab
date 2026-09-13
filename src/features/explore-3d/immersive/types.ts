import type { ExploreConnection, ExploreNode, ExploreTaskStep } from '../types'

export type ImmersiveView = 'free' | 'relations' | 'task' | 'compare' | 'xray' | 'experiments'
export type ExplanationLevel = 'beginner' | 'standard' | 'technical'
export type RelationDirection = 'upstream' | 'downstream' | 'all'
export type ModuleId = 'context' | 'model' | 'harness'

export type ModuleInterior = {
  id: ModuleId
  label: string
  description: string
  nodes: ExploreNode[]
  connections: ExploreConnection[]
}

export type ConnectionExplanation = {
  title: string
  beginner: string
  standard: string
  technical: string
}

export type ExperimentOutcome = {
  title: string
  explanation: string
  takeaway: string
  steps: ExploreTaskStep[]
}

export type ExperimentScenario = {
  id: string
  title: string
  question: string
  change: string
  disabledNodeIds: string[]
  disabledEdgeIds: string[]
  normal: ExperimentOutcome
  altered: ExperimentOutcome
}

export type ExperimentPanelProps = {
  scenarioId: string
  altered: boolean
  hasRun: boolean
  onScenario: (id: string) => void
  onAltered: (altered: boolean) => void
  onRun: () => void
  onRestore: () => void
}
