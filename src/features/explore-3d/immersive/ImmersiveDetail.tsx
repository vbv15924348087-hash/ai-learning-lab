import { ArrowRight, BookOpen, ChevronRight, Microscope, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getLessonById } from '../../../content/lessons'
import type { ExploreConnection, ExploreNode } from '../types'
import { explainConnection } from './connections'
import type { ExplanationLevel, ModuleId } from './types'
import type { ReactNode } from 'react'

export function ImmersiveDetail({
  node,
  edge,
  nodes,
  connections,
  level,
  unlockedLessons,
  onSelect,
  onEdge,
  onEnter,
  onClose,
  onLeave,
  pathExplanation,
}: {
  node?: ExploreNode
  edge?: ExploreConnection
  nodes: ExploreNode[]
  connections: ExploreConnection[]
  level: ExplanationLevel
  unlockedLessons: string[]
  onSelect: (id: string) => void
  onEdge: (id: string) => void
  onEnter: (id: ModuleId) => void
  onClose: () => void
  onLeave: () => void
  pathExplanation?: ReactNode
}) {
  const explanation = edge ? explainConnection(edge, nodes) : null
  const relatedEdges = node ? connections.filter((e) => e.from === node.id || e.to === node.id) : []
  const label = (id: string) => nodes.find((n) => n.id === id)?.label ?? id
  const canEnter = node && ['context', 'model', 'harness'].includes(node.id)
  const available = node && unlockedLessons.includes(node.lessonId)
  const lesson = node ? getLessonById(node.lessonId) : undefined
  return (
    <aside className="im3-detail im3-panel" aria-label="沉浸详情">
      <div className="im3-panel-heading">
        <span>{edge ? '这条连接为什么存在' : '理解这个部分'}</span>
        <button aria-label="收起节点详情" onClick={onClose}>
          <X size={16} />
        </button>
      </div>
      {explanation && (
        <section className="im3-why" aria-live="polite">
          <span className="im3-eyebrow">WHY THIS CONNECTION</span>
          <h2>{explanation.title}</h2>
          <p>{explanation[level]}</p>
          <div className="im3-edge-endpoints">
            <button onClick={() => onSelect(edge!.from)}>{label(edge!.from)}</button>
            <ArrowRight size={14} />
            <button onClick={() => onSelect(edge!.to)}>{label(edge!.to)}</button>
          </div>
        </section>
      )}
      {node ? (
        <>
          {pathExplanation}
          <span className="im3-eyebrow">{node.label}</span>
          <h2>{node.chineseLabel}</h2>
          <p className="im3-plain">{node.description}</p>
          <h3>它负责什么</h3>
          <p>{node.responsibility}</p>
          {level !== 'beginner' && (
            <>
              <h3>准确定义</h3>
              <p>{node.technicalDefinition}</p>
            </>
          )}
          {level === 'technical' && (
            <>
              <h3>边界与易混淆点</h3>
              <p>{node.confused}</p>
              <p className="im3-technical-note">
                图中的结构是职责与计算过程的教学抽象，不代表某个产品的实际部署或真实模型权重。
              </p>
            </>
          )}
          {canEnter && (
            <button className="im3-primary im3-enter" onClick={() => onEnter(node.id as ModuleId)}>
              <Microscope size={16} />
              进入 {node.label} 内部
              <ChevronRight size={15} />
            </button>
          )}
          <h3>它和谁连接？</h3>
          <div className="im3-connection-list">
            {relatedEdges.length ? (
              relatedEdges.map((e) => (
                <button
                  key={e.id}
                  aria-label={`为什么 ${label(e.from)} → ${label(e.to)}？`}
                  aria-pressed={edge?.id === e.id}
                  onClick={() => onEdge(e.id)}
                >
                  <span>
                    {label(e.from)} <ArrowRight size={11} /> {label(e.to)}
                  </span>
                  <small>{e.label} · 为什么？</small>
                </button>
              ))
            ) : (
              <p>在概念导航中选择其他节点，或回到系统全景查看关系。</p>
            )}
          </div>
          <Link
            onClick={onLeave}
            className="im3-course"
            to={available ? `/lesson/${node.lessonId}` : '/learn'}
          >
            <BookOpen size={15} />
            <span>
              {available ? '深入学习' : '查看课程解锁条件'}
              <small>{lesson?.title ?? node.label}</small>
            </span>
            <ArrowRight size={14} />
          </Link>
        </>
      ) : (
        !edge && (
          <div className="im3-detail-empty">
            <Microscope size={28} />
            <h2>先选一个节点</h2>
            <p>点击模型、工作台或运行底座，看看它和谁连接，又为什么需要这些连接。</p>
          </div>
        )
      )}
    </aside>
  )
}
