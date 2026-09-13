import { ArrowUpRight, Check, LockKeyhole, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Lesson, LessonStatus } from '../../types/learning'

const statusLabels: Record<LessonStatus, string> = {
  locked: '未解锁',
  unlocked: '可探索',
  available: '可探索',
  'in-progress': '当前学习',
  completed: '已完成',
}

export function LessonCard({ lesson, status }: { lesson: Lesson; status: LessonStatus }) {
  const content = (
    <>
      <div className="lesson-card-top">
        <span className="lesson-number mono">{String(lesson.order).padStart(2, '0')}</span>
        {status === 'locked' ? (
          <LockKeyhole size={15} />
        ) : status === 'completed' ? (
          <Check size={16} />
        ) : (
          <ArrowUpRight size={19} />
        )}
      </div>
      <h3>{lesson.title}</h3>
      <p className="lesson-card-subtitle">{lesson.subtitle}</p>
      <div className={`lesson-status status-${status}`}>
        {status === 'in-progress' && <Play size={12} fill="currentColor" />}
        {statusLabels[status]}
        {status !== 'locked' && status !== 'unlocked' && (
          <span className="lesson-duration">约 {lesson.minutes} 分钟</span>
        )}
      </div>
    </>
  )
  return status === 'locked' ? (
    <article
      className="lesson-card is-locked"
      aria-label={`${lesson.title}，未解锁，完成上一章后解锁`}
    >
      {content}
    </article>
  ) : (
    <Link
      className={`lesson-card status-card-${status}`}
      to={`/lesson/${lesson.id}`}
      aria-label={`${lesson.title}，${statusLabels[status]}`}
    >
      {content}
    </Link>
  )
}
