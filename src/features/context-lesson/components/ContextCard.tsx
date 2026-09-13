import type { ContextSource, ContextSourceId } from '../types'
import { ContextSourceIcon } from './ContextSourceNode'

export function ContextCard({
  source,
  active = false,
  entering = false,
  selected = false,
  onSelect,
}: {
  source: ContextSource
  active?: boolean
  entering?: boolean
  selected?: boolean
  onSelect: (id: ContextSourceId) => void
}) {
  return (
    <button
      type="button"
      className={[
        'ctx-info-card',
        `ctx-source--${source.id}`,
        active && 'is-active',
        entering && 'is-entering',
        selected && 'is-selected',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={`${source.label}：${source.content}。查看来源解释`}
      aria-pressed={selected}
      onClick={() => onSelect(source.id)}
      data-context-source={source.id}
    >
      <span className="ctx-card-heading">
        <ContextSourceIcon id={source.id} size={15} />
        <strong>{source.label}</strong>
        {entering && <span className="ctx-card-added">新加入</span>}
      </span>
      <span className="ctx-card-content">{source.content}</span>
    </button>
  )
}
