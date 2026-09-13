import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Network } from 'lucide-react'
import { concepts, edges, systemRows, type SystemConcept } from './concepts'
import './system-map.css'
import { getLessonById } from '../../content/lessons'

const width = 1000
const rowHeight = 84
const nodeWidth = 165
const nodeHeight = 48
const positions = new Map(
  systemRows.flatMap((row, r) =>
    row.map(
      (id, c) => [id, { x: (width / (row.length + 1)) * (c + 1), y: r * rowHeight + 35 }] as const,
    ),
  ),
)

export function ConceptDetails({ concept }: { concept: SystemConcept }) {
  const upstream = edges
    .filter(([, to]) => to === concept.id)
    .map(([from]) => concepts.find((c) => c.id === from)?.name)
  const downstream = edges
    .filter(([from]) => from === concept.id)
    .map(([, to]) => concepts.find((c) => c.id === to)?.name)
  return (
    <aside className="fsm-detail" aria-label="节点解释" aria-live="polite">
      <span className="cr-tag">{concept.group}</span>
      <h3>{concept.name}</h3>
      <p className="fsm-plain">{concept.plain}</p>
      <p>{concept.definition}</p>
      <dl>
        <dt>学习章节</dt>
        <dd>
          Phase {(getLessonById(concept.lesson)?.order ?? 0) + 1} ·{' '}
          {getLessonById(concept.lesson)?.title}
        </dd>
        <dt>来自哪里</dt>
        <dd>{upstream.join(' · ') || '任务输入或外部知识'}</dd>
        <dt>交给哪里</dt>
        <dd>{downstream.join(' · ') || concept.output}</dd>
        <dt>容易混淆</dt>
        <dd>{concept.confused}</dd>
      </dl>
      <Link className="cr-secondary" to={`/lesson/${concept.lesson}`}>
        重新学习这一章 <ArrowRight size={14} />
      </Link>
    </aside>
  )
}

export function SystemDiagram({
  initialExpanded = false,
  activeNode,
  onInspect,
  onExpand,
}: {
  initialExpanded?: boolean
  activeNode?: string
  onInspect?: (id: string) => void
  onExpand?: () => void
}) {
  const [expanded, setExpanded] = useState(initialExpanded)
  const [selected, setSelected] = useState(activeNode ?? 'context')
  const [showAll, setShowAll] = useState(false)
  const focus = selected
  const selectedConcept = concepts.find((c) => c.id === focus) ?? concepts[0]
  if (!expanded)
    return (
      <div className="fsm-intro">
        <p className="eyebrow">THE PICTURE YOU STARTED WITH</p>
        <div className="fsm-simple">
          <div>
            <span>01</span>
            <strong>USER</strong>
            <small>你提出问题</small>
          </div>
          <ArrowRight />
          <div>
            <span>02</span>
            <strong>MODEL</strong>
            <small>模型生成内容</small>
          </div>
          <ArrowRight />
          <div>
            <span>03</span>
            <strong>ANSWER</strong>
            <small>你收到回答</small>
          </div>
        </div>
        <p>这三个节点之间，还藏着哪些协作？</p>
        <button
          className="cr-action"
          onClick={() => {
            setExpanded(true)
            onExpand?.()
          }}
        >
          <Network size={17} />
          展开完整 AI 系统 →
        </button>
      </div>
    )
  return (
    <div className="fsm-explorer">
      <div className="fsm-map-column">
        <div className="fsm-map-toolbar">
          <span className="cr-caption">点击任一节点，查看信息从哪里来、到哪里去</span>
          <button
            className="cr-secondary"
            aria-pressed={showAll}
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? '聚焦当前连接' : '显示全部连接'}
          </button>
        </div>
        <div
          className="fsm-diagram"
          style={{ aspectRatio: `${width} / ${systemRows.length * rowHeight}` }}
        >
          <svg viewBox={`0 0 ${width} ${systemRows.length * rowHeight}`} aria-hidden="true">
            <defs>
              <marker
                id="fsm-arrow"
                markerWidth="7"
                markerHeight="7"
                refX="6"
                refY="3.5"
                orient="auto"
              >
                <path d="M0 0 L7 3.5 L0 7 Z" fill="#8299d6" />
              </marker>
            </defs>
            {edges.map(([from, to]) => {
              const a = positions.get(from),
                b = positions.get(to)
              if (!a || !b) return null
              const relevant = from === focus || to === focus
              const sameRow = a.y === b.y
              const direction = b.x > a.x ? 1 : -1
              const start = sameRow
                ? { x: a.x + (direction * nodeWidth) / 2, y: a.y }
                : { x: a.x, y: a.y + ((b.y > a.y ? 1 : -1) * nodeHeight) / 2 }
              const end = sameRow
                ? { x: b.x - (direction * nodeWidth) / 2, y: b.y }
                : { x: b.x, y: b.y - ((b.y > a.y ? 1 : -1) * nodeHeight) / 2 }
              const distance = Math.abs(b.y - a.y)
              const curve = sameRow
                ? `M${start.x},${start.y} L${end.x},${end.y}`
                : distance > rowHeight * 1.5
                  ? `M${start.x},${start.y} C${start.x + 55},${start.y + 30} ${end.x + 55},${end.y - 30} ${end.x},${end.y}`
                  : `M${start.x},${start.y} C${start.x},${(start.y + end.y) / 2} ${end.x},${(start.y + end.y) / 2} ${end.x},${end.y}`
              return (
                <path
                  key={`${from}-${to}`}
                  d={curve}
                  className={relevant ? 'is-active' : ''}
                  style={{ opacity: relevant ? 1 : showAll ? 0.25 : 0.07 }}
                  markerEnd={relevant || showAll ? 'url(#fsm-arrow)' : undefined}
                />
              )
            })}
          </svg>
          {systemRows.flat().map((id) => {
            const c = concepts.find((item) => item.id === id)!,
              position = positions.get(id)!
            const connected = edges.some(
              ([from, to]) => (from === focus && to === id) || (to === focus && from === id),
            )
            return (
              <button
                key={id}
                className={`fsm-node ${focus === id ? 'is-active' : ''} ${connected ? 'is-connected' : ''}`}
                aria-pressed={focus === id}
                aria-label={`${c.name} 节点`}
                style={{
                  left: `${(position.x / width) * 100}%`,
                  top: `${(position.y / (systemRows.length * rowHeight)) * 100}%`,
                  width: `${(nodeWidth / width) * 100}%`,
                }}
                onClick={() => {
                  setSelected(id)
                  onInspect?.(id)
                }}
              >
                <span>{c.name}</span>
                <small>{c.group}</small>
              </button>
            )
          })}
        </div>
        <p className="fsm-feedback-loop">
          <span>观察反馈 → Context → Model</span>
          <span>检查未通过 → Loop / 通过 → Final</span>
        </p>
      </div>
      <ConceptDetails concept={selectedConcept} />
    </div>
  )
}
