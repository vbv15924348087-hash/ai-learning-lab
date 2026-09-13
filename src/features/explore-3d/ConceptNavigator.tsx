import { useState } from 'react'
import { Check, ChevronDown, Circle, LockKeyhole, Search, X } from 'lucide-react'
import { categoryLabels, exploreNodes } from './data'
import { searchNodes } from './graph'
import type { ExploreCategory, ExploreNode } from './types'
import { categoryColorStyle } from './categoryColors'

export function ConceptNavigator({
  selectedId,
  completedLessons,
  unlockedLessons,
  onSelect,
}: {
  selectedId: string | null
  completedLessons: string[]
  unlockedLessons: string[]
  onSelect: (id: string) => void
}) {
  const [query, setQuery] = useState('')
  const results = query.trim() ? searchNodes(query) : []
  const renderNode = (node: ExploreNode) => {
    const learned = completedLessons.includes(node.lessonId)
    const available = unlockedLessons.includes(node.lessonId)
    const status = learned ? '已学' : available ? '可学习' : '课程未解锁，可在此探索'
    return (
      <button
        key={node.id}
        className={`ex3-concept ${selectedId === node.id ? 'is-selected' : ''}`}
        style={categoryColorStyle(node.category)}
        aria-label={`探索 ${node.label}，${status}`}
        aria-pressed={selectedId === node.id}
        onClick={() => onSelect(node.id)}
      >
        <span>
          <strong>{node.label}</strong>
          <small>{node.chineseLabel}</small>
        </span>
        {learned ? (
          <Check size={13} className="ex3-learned" />
        ) : available ? (
          <Circle size={9} />
        ) : (
          <LockKeyhole size={12} />
        )}
      </button>
    )
  }
  return (
    <aside className="ex3-nav" aria-label="概念导航">
      <div className="ex3-nav-heading">
        <span>AI SYSTEM</span>
        <span>概念索引</span>
      </div>
      <div className="ex3-search">
        <Search size={15} />
        <input
          aria-label="搜索概念"
          placeholder="搜索 RAG、记忆…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button aria-label="清空搜索" onClick={() => setQuery('')}>
            <X size={13} />
          </button>
        )}
      </div>
      <div className="ex3-concept-list">
        {query.trim() ? (
          <>
            <p className="ex3-nav-caption" role="status">
              {results.length
                ? `找到 ${results.length} 个概念，点选后聚焦`
                : '没有找到相关概念，试试 RAG 或中文名称。'}
            </p>
            {results.map(renderNode)}
          </>
        ) : (
          (Object.keys(categoryLabels) as ExploreCategory[]).map((category, index) => (
            <details key={category} className="ex3-category" style={categoryColorStyle(category)}>
              <summary>
                <span className="ex3-category-number">0{index + 1}</span>
                {categoryLabels[category]}
                <ChevronDown size={13} />
              </summary>
              {exploreNodes.filter((node) => node.category === category).map(renderNode)}
            </details>
          ))
        )}
      </div>
      <p className="ex3-nav-note">
        <Check size={12} /> 已学 <Circle size={8} /> 可学 <LockKeyhole size={11} /> 课程待解锁
        <br />
        <span>这里的每个概念都可以探索。</span>
      </p>
    </aside>
  )
}
