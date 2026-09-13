import { useState } from 'react'
import { Search, X } from 'lucide-react'
import type { ExploreNode } from '../types'

export function ImmersiveSearch({
  nodes,
  onSelect,
}: {
  nodes: ExploreNode[]
  onSelect: (id: string) => void
}) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const search = query.trim().toLowerCase()
  const matches = search
    ? nodes
        .filter((n) =>
          `${n.label} ${n.chineseLabel} ${n.description}`.toLowerCase().includes(search),
        )
        .sort(
          (a, b) =>
            Number(b.label.toLowerCase() === search) - Number(a.label.toLowerCase() === search),
        )
        .slice(0, 7)
    : []
  const choose = (id: string) => {
    onSelect(id)
    setQuery('')
    setActive(0)
  }
  return (
    <div className="im3-search">
      <Search size={15} />
      <input
        role="combobox"
        aria-label="沉浸搜索概念"
        aria-controls="im3-search-results"
        aria-expanded={Boolean(search)}
        aria-activedescendant={matches[active] ? `im3-result-${matches[active].id}` : undefined}
        placeholder="搜索概念或内部结构…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setActive(0)
        }}
        onKeyDown={(e) => {
          if (!search) return
          if (e.key === 'Escape') {
            e.stopPropagation()
            e.preventDefault()
            setQuery('')
          }
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault()
            setActive((i) =>
              Math.max(0, Math.min(matches.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1))),
            )
          }
          if (e.key === 'Enter' && matches[active]) {
            e.preventDefault()
            choose(matches[active].id)
          }
        }}
      />
      {query && (
        <button aria-label="清空沉浸搜索" onClick={() => setQuery('')}>
          <X size={13} />
        </button>
      )}
      {search && (
        <div
          className="im3-search-results"
          id="im3-search-results"
          role="listbox"
          aria-label="概念搜索结果"
        >
          {matches.length ? (
            matches.map((n, i) => (
              <button
                id={`im3-result-${n.id}`}
                role="option"
                aria-selected={i === active}
                key={n.id}
                onClick={() => choose(n.id)}
              >
                <strong>{n.label}</strong>
                <span>{n.chineseLabel}</span>
              </button>
            ))
          ) : (
            <p role="status">没有找到相关概念，试试“模型”或 RAG。</p>
          )}
        </div>
      )}
    </div>
  )
}
