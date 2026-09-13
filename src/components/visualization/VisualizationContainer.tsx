import { lazy, Suspense } from 'react'
import { ArrowRight, Box, MessageSquare, UserRound } from 'lucide-react'
import type { SystemNodeId } from '../../types/learning'
import { VisualizationBoundary } from './VisualizationBoundary'
import { systemNodes } from '../../features/system-map/systemNodes'

const SystemMapCanvas = lazy(() =>
  import('../three/SystemMapCanvas').then((module) => ({ default: module.SystemMapCanvas })),
)
const nodeIcons = { user: UserRound, model: Box, answer: MessageSquare }

export function VisualizationContainer({
  selectedNode,
  onSelectNode,
  compact = false,
}: {
  selectedNode: SystemNodeId | null
  onSelectNode: (id: SystemNodeId) => void
  compact?: boolean
}) {
  const selected = systemNodes.find((node) => node.id === selectedNode)
  return (
    <section
      className={`visualization${compact ? ' visualization-home' : ''}`}
      aria-label="一次 AI 对话的简化示意"
    >
      <div className="visualization-topline">
        <span className="eyebrow">SYSTEM / 01</span>
        <span className="visualization-caption">一次对话的开始</span>
      </div>
      <div className="scene-frame">
        <VisualizationBoundary>
          <Suspense
            fallback={
              <div className="scene-loading">
                <Box size={30} />
                <span>正在准备系统示意…</span>
              </div>
            }
          >
            <SystemMapCanvas selectedNode={selectedNode} onSelectNode={onSelectNode} />
          </Suspense>
        </VisualizationBoundary>
      </div>
      <div className="node-controls" role="group" aria-label="选择一个环节，了解它的作用">
        {systemNodes.map((node, index) => {
          const Icon = nodeIcons[node.id]
          return (
            <div className="node-control-wrap" key={node.id}>
              {index > 0 && <ArrowRight size={14} className="node-arrow" aria-hidden="true" />}
              <button
                className={`node-control${selectedNode === node.id ? ' is-selected' : ''}`}
                aria-pressed={selectedNode === node.id}
                onClick={() => onSelectNode(node.id)}
              >
                <Icon size={16} aria-hidden="true" />
                <span>{node.label}</span>
              </button>
            </div>
          )
        })}
      </div>
      <div className="visualization-description" aria-live="polite">
        {selected ? (
          <p>
            <span className="selection-label">{selected.name}</span>
            {selected.explanation}
          </p>
        ) : (
          <p>选择一个环节，从你熟悉的对话开始。</p>
        )}
      </div>
    </section>
  )
}
