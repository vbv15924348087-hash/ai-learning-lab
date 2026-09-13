import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Search } from 'lucide-react'
import { concepts } from './concepts'
import './system-map.css'
import { getLessonById } from '../../content/lessons'

const groups = ['Context', 'Model', 'Tools', 'Runtime']
export function TerminologyGraph({ onInspect }: { onInspect?: (group: string) => void }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState('rag')
  const concept = concepts.find((item) => item.id === selected)!
  const results = concepts.filter(
    (item) =>
      groups.includes(item.group) &&
      `${item.name} ${item.plain} ${item.definition}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  )
  return (
    <div className="kg-explorer">
      <div className="kg-header">
        <div>
          <p className="eyebrow">AI TERMINOLOGY MAP</p>
          <h3>从一个概念，走向它的邻居。</h3>
        </div>
        <label className="kg-search">
          <Search size={17} />
          <input
            aria-label="搜索 AI 术语"
            placeholder="试试 RAG、向量、工具…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>
      <div className="kg-layout">
        <div className="kg-tree">
          <div className="kg-root">
            Agent <span>Context + Model + Tools + Runtime</span>
          </div>
          {results.length === 0 && (
            <p className="cr-hint" role="status">
              没有找到相关术语。试试中文含义或更短的关键词。
            </p>
          )}
          <div className="kg-branches">
            {groups.map((group) => (
              <section key={group}>
                <h4>{group}</h4>
                <div>
                  {results
                    .filter((item) => item.group === group)
                    .map((item) => (
                      <button
                        key={item.id}
                        className={selected === item.id ? 'is-active' : ''}
                        aria-pressed={selected === item.id}
                        onClick={() => {
                          setSelected(item.id)
                          onInspect?.(group)
                        }}
                      >
                        {item.name}
                        <ArrowRight size={12} />
                      </button>
                    ))}
                </div>
              </section>
            ))}
          </div>
        </div>
        <aside className="kg-detail" aria-label="术语关系" aria-live="polite">
          <span className="cr-tag">属于 · {concept.group}</span>
          <h3>{concept.name}</h3>
          <p className="fsm-plain">{concept.plain}</p>
          <p>{concept.definition}</p>
          <dl>
            <dt>学习章节</dt>
            <dd>
              Phase {(getLessonById(concept.lesson)?.order ?? 0) + 1} ·{' '}
              {getLessonById(concept.lesson)?.title}
            </dd>
            <dt>依赖 / 关联</dt>
            <dd className="kg-dependencies">
              {concept.dependencies.length
                ? concept.dependencies.map((id) => {
                    const dep = concepts.find((item) => item.id === id)!
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          setSelected(id)
                          onInspect?.(dep.group)
                        }}
                      >
                        {dep.name}
                        <ArrowRight size={12} />
                      </button>
                    )
                  })
                : '任务、数据或系统配置'}
            </dd>
            <dt>输出</dt>
            <dd>{concept.output}</dd>
            <dt>容易混淆</dt>
            <dd>{concept.confused}</dd>
          </dl>
          <Link className="cr-secondary" to={`/lesson/${concept.lesson}`}>
            重新学习这一章 <ArrowRight size={14} />
          </Link>
        </aside>
      </div>
    </div>
  )
}
