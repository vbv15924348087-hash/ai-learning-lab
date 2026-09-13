export type Point3 = [number, number, number]
export type ExploreCategory =
  'input' | 'context' | 'model' | 'harness' | 'external' | 'verification'
export type ExploreDepth = 0 | 1 | 2
export type ExploreMode = 'free' | 'guided' | 'task'
export type NodeKind =
  | 'input'
  | 'context'
  | 'model'
  | 'harness'
  | 'external'
  | 'final'
  | 'memory'
  | 'rag'
  | 'tool'
  | 'gate'
  | 'check'
  | 'loop'
  | 'satellite'

export type ExploreNode = {
  id: string
  label: string
  chineseLabel: string
  category: ExploreCategory
  level: ExploreDepth
  position: Point3
  kind: NodeKind
  parentId?: string
  description: string
  technicalDefinition: string
  responsibility: string
  confused: string
  upstream: string[]
  downstream: string[]
  related: string[]
  lessonId: string
}

export type ExploreConnection = {
  id: string
  from: string
  to: string
  type: 'data' | 'control' | 'retrieval' | 'tool' | 'loop'
  label: string
}

export type ExploreTaskStep = {
  id: string
  title: string
  explanation: string
  nodeId: string
  edgeIds: string[]
  message: string
  outcome?: 'fail' | 'pass'
}

export type ExploreTourStop = {
  nodeId: string
  title: string
  question: string
  explanation: string
}
export type CameraPose = { position: Point3; target: Point3 }

export type ExploreEdgeState = 'idle' | 'upcoming' | 'active' | 'completed' | 'disabled'
export type ExplorePacketType =
  'task' | 'context' | 'tool-call' | 'result' | 'verification' | 'pass' | 'fail'
export type ExplorePathComparison = {
  commonNodeIds: string[]
  firstOnlyNodeIds: string[]
  secondOnlyNodeIds: string[]
  commonEdgeIds: string[]
  firstOnlyEdgeIds: string[]
  secondOnlyEdgeIds: string[]
  visibleNodeIds: string[]
  visibleEdgeIds: string[]
}
export type ExploreCompareFilter = 'all' | 'common' | 'added' | 'differences'

export type ExploreSceneProps = {
  nodes: ExploreNode[]
  connections: ExploreConnection[]
  selectedId: string | null
  focusedId: string | null
  relatedIds: string[]
  activeEdgeIds: string[]
  playing: boolean
  reducedMotion: boolean
  enabled: boolean
  resetKey: number
  cameraPose?: CameraPose
  learnedNodeIds: string[]
  unlockedNodeIds?: string[]
  onSelectConnection?: (id: string) => void
  selectedConnectionId?: string | null
  xrayNodeId?: string | null
  frameNodeIds?: string[]
  disabledNodeIds?: string[]
  disabledEdgeIds?: string[]
  immersive?: boolean
  pathNodeIds?: string[]
  edgeStates?: Record<string, ExploreEdgeState>
  packetType?: ExplorePacketType
  comparison?: ExplorePathComparison
  compareFilter?: ExploreCompareFilter
  onSelect: (id: string) => void
  onDepthChange: (depth: ExploreDepth) => void
  onCameraChange: (pose: CameraPose, depth?: ExploreDepth) => void
  onFailure: () => void
  onPerformance?: (sample: { fps: number; drawCalls: number; triangles: number }) => void
}
