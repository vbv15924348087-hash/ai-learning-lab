import {
  ArrowUpRight,
  BrainCircuit,
  FileText,
  Layers3,
  MessageSquareText,
  Route,
  Search,
  UserRound,
} from 'lucide-react'
import type { OverviewNodeId } from '../types'

const icons = {
  user: UserRound,
  context: Layers3,
  model: BrainCircuit,
  action: ArrowUpRight,
  harness: Route,
  tool: Search,
  result: FileText,
  answer: MessageSquareText,
}

export type SystemNodeProps = {
  id: OverviewNodeId
  label: string
  term?: string
  detail?: string
  active: boolean
  selected: boolean
  interactive: boolean
  onSelect: (id: OverviewNodeId) => void
}

export function SystemNode({
  id,
  label,
  term,
  detail,
  active,
  selected,
  interactive,
  onSelect,
}: SystemNodeProps) {
  const Icon = icons[id]
  const className = [
    'overview-system-node',
    `overview-system-node--${id}`,
    active && 'is-active',
    selected && 'is-selected',
    interactive && 'is-interactive',
  ]
    .filter(Boolean)
    .join(' ')
  const content = (
    <>
      <span className="overview-node-icon" aria-hidden="true">
        <Icon size={21} strokeWidth={1.6} />
      </span>
      <span className="overview-node-copy">
        <span className="overview-node-label">{label}</span>
        {term && <span className="overview-node-term">{term}</span>}
        {detail && <span className="overview-node-detail">{detail}</span>}
      </span>
      {active && <span className="overview-node-status" aria-label="当前节点" />}
    </>
  )

  if (interactive) {
    return (
      <button
        type="button"
        className={className}
        aria-label={`${label}，查看解释`}
        aria-pressed={selected}
        onClick={() => onSelect(id)}
        data-node-id={id}
      >
        {content}
      </button>
    )
  }

  return (
    <div className={className} data-node-id={id}>
      {content}
    </div>
  )
}
