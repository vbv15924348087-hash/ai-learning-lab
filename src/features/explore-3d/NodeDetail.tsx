import {
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Compass,
  LockKeyhole,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getLessonById } from '../../content/lessons'
import { categoryLabels } from './data'
import { getRelations } from './graph'
import type { ExploreNode } from './types'

export function NodeDetail({
  node,
  unlockedLessons,
  completedLessons,
  onSelect,
  onTour,
}: {
  node: ExploreNode | undefined
  unlockedLessons: string[]
  completedLessons: string[]
  onSelect: (id: string) => void
  onTour: () => void
}) {
  if (!node)
    return (
      <aside className="ex3-detail ex3-detail-intro" aria-label="探索提示">
        <span className="ex3-detail-icon">
          <Compass size={24} />
        </span>
        <p className="ex3-kicker">START WITH THE BIG PICTURE</p>
        <h2>
          一套系统，
          <br />
          各有分工。
        </h2>
        <p>先准备信息，再由模型决定下一步。运行系统把请求变成行动，结果回来后，还要检查。</p>
        <div className="ex3-tip">
          <strong>点击任意节点开始探索</strong>
          <p>看看它负责什么，又和谁一起工作。</p>
        </div>
        <button className="ex3-primary" onClick={onTour}>
          带我看一遍 <ChevronRight size={15} />
        </button>
        <p className="ex3-small">约 2 分钟的系统导览，随时可以退出。</p>
      </aside>
    )
  const relationships = getRelations(node.id)
  const lesson = getLessonById(node.lessonId)
  const available = unlockedLessons.includes(node.lessonId)
  const learned = completedLessons.includes(node.lessonId)
  return (
    <aside className="ex3-detail" aria-label="节点详情" aria-live="polite">
      <p className="ex3-kicker">
        {categoryLabels[node.category]} · {node.label}
      </p>
      <h2>{node.chineseLabel}</h2>
      <p className="ex3-detail-plain">{node.description}</p>
      <section className="ex3-responsibility">
        <h3>它负责什么</h3>
        <p>{node.responsibility}</p>
      </section>
      <section className="ex3-relations">
        <h3>
          <ArrowDownLeft size={13} /> 从哪里得到输入
        </h3>
        <div>
          {relationships.upstream.length ? (
            relationships.upstream.map((n) => (
              <button key={n.id} onClick={() => onSelect(n.id)}>
                {n.label} <ChevronRight size={11} />
              </button>
            ))
          ) : (
            <p>用户目标或外部环境</p>
          )}
        </div>
        <h3>
          <ArrowUpRight size={13} /> 把结果交给谁
        </h3>
        <div>
          {relationships.downstream.length ? (
            relationships.downstream.map((n) => (
              <button key={n.id} onClick={() => onSelect(n.id)}>
                {n.label} <ChevronRight size={11} />
              </button>
            ))
          ) : (
            <p>交付用户，或留存所需记录</p>
          )}
        </div>
      </section>
      <details className="ex3-definition">
        <summary>
          准确定义与容易混淆的概念 <ChevronRight size={13} />
        </summary>
        <p>{node.technicalDefinition}</p>
        <div className="ex3-misconception">
          <strong>别混在一起</strong>
          <p>{node.confused}</p>
        </div>
        {relationships.related.length > 0 && (
          <div className="ex3-related">
            <span>相关概念</span>
            {relationships.related.map((n) => (
              <button key={n.id} onClick={() => onSelect(n.id)}>
                {n.label}
              </button>
            ))}
          </div>
        )}
      </details>
      <div className="ex3-course">
        <BookOpen size={16} />
        <div>
          <span>{learned ? '已学课程' : available ? '相关课程' : '相关课程 · 未解锁'}</span>
          <strong>{lesson?.title ?? node.label}</strong>
        </div>
      </div>
      <Link className="ex3-course-link" to={available ? `/lesson/${node.lessonId}` : '/learn'}>
        {available ? (
          '重新学习这一章'
        ) : (
          <>
            <LockKeyhole size={13} /> 查看课程解锁条件
          </>
        )}{' '}
        <ArrowUpRight size={14} />
      </Link>
      {!available && <p className="ex3-small">简要介绍可自由查看。完整课程按学习地图顺序解锁。</p>}
    </aside>
  )
}
