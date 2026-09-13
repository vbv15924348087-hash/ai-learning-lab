import { Layers3 } from 'lucide-react'
import type { ReactNode } from 'react'
import { contextSources } from '../data/contextLessonSteps'
import type { ContextSourceId } from '../types'
import { ContextCard } from './ContextCard'

export function ContextWorkbench({
  items,
  activeSource,
  selectedSource,
  onSelectSource,
  assembly = false,
  subset = false,
  compact = false,
  additionalItems = 0,
  children,
}: {
  items: ContextSourceId[]
  activeSource?: ContextSourceId
  selectedSource: ContextSourceId | null
  onSelectSource: (id: ContextSourceId) => void
  assembly?: boolean
  subset?: boolean
  compact?: boolean
  additionalItems?: number
  children?: ReactNode
}) {
  return (
    <div
      className={`ctx-workbench${assembly ? ' is-assembling' : ''}${subset ? ' is-subset' : ''}${compact ? ' is-compact' : ''}`}
      aria-label="Context：模型本次能看到的信息"
    >
      <div className="ctx-workbench-heading">
        <div>
          <span className="ctx-workbench-icon">
            <Layers3 size={17} strokeWidth={1.6} aria-hidden="true" />
          </span>
          <span>
            <strong>当前工作台</strong>
            <small>{assembly ? '这一次，模型能看到的资料' : 'CONTEXT'}</small>
          </span>
        </div>
        <span className="ctx-workbench-count">
          {String(items.length + additionalItems).padStart(2, '0')} <small>组资料</small>
        </span>
      </div>
      <div className="ctx-workbench-cards">
        {items.map((id) => {
          const source = contextSources.find((item) => item.id === id)
          if (!source) return null
          return (
            <ContextCard
              key={id}
              source={source}
              active={subset ? id === 'prompt' : id === activeSource}
              entering={assembly && id === activeSource}
              selected={id === selectedSource}
              onSelect={onSelectSource}
            />
          )
        })}
        {children}
      </div>
      {assembly && items.length < 7 && (
        <p className="ctx-workbench-space">还有哪些信息，会被放到这里？</p>
      )}
      {subset && (
        <p className="ctx-subset-note">
          <span aria-hidden="true">↳</span> 你的 Prompt 只是这张工作台上的一部分。
        </p>
      )}
      <div className="ctx-workbench-edge" aria-hidden="true" />
    </div>
  )
}
