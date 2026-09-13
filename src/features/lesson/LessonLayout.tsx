import { ArrowLeft, ArrowRight, Check, CircleCheck, Clock3, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Lesson, SystemNodeId } from '../../types/learning'
import { lessons } from '../../content/lessons'
import { ExplanationPanel } from '../../components/learning/ExplanationPanel'
import { MisconceptionCard } from '../../components/learning/MisconceptionCard'
import { ProgressIndicator } from '../../components/learning/ProgressIndicator'
import { VisualizationContainer } from '../../components/visualization/VisualizationContainer'

type LessonLayoutProps = {
  lesson: Lesson
  completed: boolean
  progress: number
  selectedNode: SystemNodeId | null
  onSelectNode: (id: SystemNodeId) => void
  onComplete: () => void
}

export function LessonLayout({
  lesson,
  completed,
  progress,
  selectedNode,
  onSelectNode,
  onComplete,
}: LessonLayoutProps) {
  const previous = lessons.find((item) => item.order === lesson.order - 1)
  const next = lessons.find((item) => item.order === lesson.order + 1)
  return (
    <div className="lesson-page page-width">
      <nav className="lesson-breadcrumb" aria-label="面包屑">
        <Link to="/learn">
          <ArrowLeft size={15} />
          学习地图
        </Link>
        <span>/</span>
        <span>
          {String(lesson.order).padStart(2, '0')} · {lesson.title}
        </span>
      </nav>
      <header className="lesson-heading">
        <div>
          <p className="eyebrow">
            CHAPTER {String(lesson.order).padStart(2, '0')} / {lessons.length}
          </p>
          <h1>{lesson.title}</h1>
          <p>{lesson.subtitle}</p>
        </div>
        <span className="reading-time">
          <Clock3 size={16} />约 {lesson.minutes} 分钟
          {completed && (
            <span className="completed-badge">
              <Check size={14} />
              已完成
            </span>
          )}
        </span>
      </header>
      <div className="learning-goal">
        <Target size={21} />
        <div>
          <span>这一站，你将学会</span>
          <p>{lesson.learningGoal}</p>
        </div>
      </div>
      <div className="lesson-workspace">
        <div className="lesson-visual-column">
          {lesson.visualization === 'system-overview' ? (
            <VisualizationContainer selectedNode={selectedNode} onSelectNode={onSelectNode} />
          ) : (
            <div className="visualization-placeholder">本节可视化正在准备中。</div>
          )}
          {lesson.visualizationNote && (
            <p className="lesson-visual-note">{lesson.visualizationNote}</p>
          )}
        </div>
        <ExplanationPanel lesson={lesson} />
      </div>
      {lesson.misconceptions.length > 0 && (
        <section className="misconceptions" aria-labelledby="misconception-title">
          <div className="subsection-heading">
            <p className="eyebrow">A CLEARER PICTURE</p>
            <h2 id="misconception-title">避开几个常见误解</h2>
          </div>
          <div className="misconception-grid">
            {lesson.misconceptions.map((item) => (
              <MisconceptionCard key={item.wrong} {...item} />
            ))}
          </div>
        </section>
      )}
      <section
        className={`lesson-completion${completed ? ' is-completed' : ''}`}
        aria-label="完成本节学习"
      >
        <div className="completion-copy">
          <CircleCheck size={25} />
          <div>
            <h2>
              {completed
                ? (lesson.completion?.completedTitle ?? `已完成「${lesson.title}」`)
                : (lesson.completion?.promptTitle ?? '准备好完成这一站了吗？')}
            </h2>
            <p aria-live="polite">
              {completed
                ? '本节已完成，进度已更新。你可以随时回来重温。'
                : (lesson.completion?.promptDescription ?? '回顾本节学习目标，准备好后记录进度。')}
            </p>
          </div>
        </div>
        <button
          className={`button ${completed ? 'button-completed' : 'button-primary'}`}
          onClick={onComplete}
          disabled={completed}
        >
          {completed ? (
            <>
              <Check size={17} />
              已完成本节
            </>
          ) : (
            <>
              完成本节
              <ArrowRight size={17} />
            </>
          )}
        </button>
      </section>
      <div className="lesson-bottom">
        <nav className="lesson-pagination" aria-label="章节导航">
          {previous?.published ? (
            <Link className="text-link" to={`/lesson/${previous.id}`}>
              <ArrowLeft size={16} />
              上一节 · {previous.title}
            </Link>
          ) : (
            <Link className="text-link" to="/learn">
              <ArrowLeft size={16} />
              返回学习地图
            </Link>
          )}
          {next &&
            (next.published ? (
              <Link className="text-link" to={`/lesson/${next.id}`}>
                下一节 · {next.title}
                <ArrowRight size={16} />
              </Link>
            ) : (
              <span className="next-lesson-locked">
                下一节 · {next.title}
                <span>即将开放</span>
              </span>
            ))}
        </nav>
        <ProgressIndicator value={progress} compact />
      </div>
    </div>
  )
}
