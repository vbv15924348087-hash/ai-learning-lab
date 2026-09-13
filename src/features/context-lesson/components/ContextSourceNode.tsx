import {
  FileCheck2,
  Globe2,
  History,
  LibraryBig,
  MessageSquareText,
  ShieldCheck,
  Wrench,
} from 'lucide-react'
import type { ContextSource, ContextSourceId } from '../types'

const icons = {
  prompt: MessageSquareText,
  rules: ShieldCheck,
  history: History,
  tools: Wrench,
  memory: LibraryBig,
  rag: Globe2,
  result: FileCheck2,
}

export function ContextSourceIcon({ id, size = 17 }: { id: ContextSourceId; size?: number }) {
  const Icon = icons[id]
  return <Icon size={size} strokeWidth={1.7} aria-hidden="true" />
}

export function ContextSourceNode({
  source,
  selected,
  onSelect,
}: {
  source: ContextSource
  selected: boolean
  onSelect: (id: ContextSourceId) => void
}) {
  const label =
    source.id === 'memory' ? 'Memory 仓库' : source.id === 'rag' ? 'RAG 检索' : source.label
  return (
    <button
      type="button"
      className={`ctx-source-node ctx-source--${source.id}${selected ? ' is-selected' : ''}`}
      aria-label={`${label}，查看它如何进入 Context`}
      aria-pressed={selected}
      onClick={() => onSelect(source.id)}
    >
      <ContextSourceIcon id={source.id} size={16} />
      <span>{label}</span>
    </button>
  )
}
