import { useCallback, useRef, useState, type ComponentType } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  RotateCcw,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { lessons } from '../../content/lessons'
import { useLearningStore } from '../../stores/learningStore'
import type { ChapterDefinition, ChapterVisualProps } from './types'
import { ChapterChallenge } from './ChapterChallenge'
import './curriculum.css'

export function ChapterLesson({
  chapter,
  Visual,
}: {
  chapter: ChapterDefinition
  Visual: ComponentType<ChapterVisualProps>
}) {
  const progress = useLearningStore((state) => state.chapterProgress[chapter.id])
  const completeStep = useLearningStore((state) => state.completeChapterStep)
  const moveStep = useLearningStore((state) => state.moveChapterStep)
  const answer = useLearningStore((state) => state.answerChapter)
  const restart = useLearningStore((state) => state.restartChapter)
  const completed = useLearningStore((state) => state.completedLessonIds.includes(chapter.id))
  const studio = useRef<HTMLElement>(null)
  const [replay, setReplay] = useState(0)
  const stepIndex = progress?.currentStep ?? 0
  const step = chapter.steps[stepIndex]
  const onComplete = useCallback(
    () => completeStep(chapter.id, step.id),
    [chapter.id, step.id, completeStep],
  )
  if (!progress) return <p className="page-width">正在恢复学习进度…</p>
  const done = progress.completedSteps.includes(step.id)
  const last = stepIndex === chapter.steps.length - 1
  const previous = lessons.find((lesson) => lesson.order === chapter.phase - 2)
  const next = lessons.find((lesson) => lesson.order === chapter.phase)
  function move(index: number) {
    moveStep(chapter.id, index)
    requestAnimationFrame(() =>
      studio.current?.scrollIntoView?.({ block: 'start', behavior: 'instant' }),
    )
  }
  return (
    <div className={`lesson-page page-width cr-lesson cr-phase-${chapter.phase}`}>
      <nav className="lesson-breadcrumb" aria-label="面包屑">
        <Link to="/learn">
          <ArrowLeft size={15} />
          学习地图
        </Link>
        <span>/</span>
        <span>
          {String(chapter.phase - 1).padStart(2, '0')} · {chapter.title}
        </span>
      </nav>
      <header className="cr-heading">
        <div>
          <p className="eyebrow">
            CHAPTER {String(chapter.phase - 1).padStart(2, '0')} / {lessons.length} <span>·</span>{' '}
            {chapter.title}
          </p>
          <h1>{chapter.heading}</h1>
          <p>{chapter.subtitle}</p>
        </div>
        <div className="cr-meta">
          <span>
            <Clock3 size={15} />约 {chapter.minutes} 分钟
          </span>
          <span>
            <BookOpen size={15} />
            {chapter.terms.length} 个概念
          </span>
          {completed && (
            <span className="completed-badge">
              <Check size={14} />
              已完成
            </span>
          )}
        </div>
      </header>
      <div className="cr-goal">
        <span>这一站的目标</span>
        <p>{chapter.goal}</p>
      </div>
      <section className="cr-studio" ref={studio} aria-label={`${chapter.title} 交互课程`}>
        <ol className="cr-stepper" aria-label="本章学习路径">
          {chapter.steps.map((item, index) => (
            <li key={item.id}>
              <button
                disabled={
                  index > 0 && !progress.completedSteps.includes(chapter.steps[index - 1].id)
                }
                aria-current={index === stepIndex ? 'step' : undefined}
                onClick={() => move(index)}
              >
                <span>
                  {progress.completedSteps.includes(item.id) ? (
                    <Check size={13} />
                  ) : (
                    String(index + 1).padStart(2, '0')
                  )}
                </span>
                {item.title}
              </button>
            </li>
          ))}
        </ol>
        <div
          className="cr-progress"
          role="progressbar"
          aria-label="本章完成进度"
          aria-valuemin={0}
          aria-valuemax={chapter.steps.length}
          aria-valuenow={progress.completedSteps.length}
        >
          <span
            style={{ width: `${(progress.completedSteps.length / chapter.steps.length) * 100}%` }}
          />
        </div>
        <div className="cr-scenario">
          <div>
            <span>接着上一站</span>
            <p>{chapter.connection}</p>
          </div>
          <span className="cr-tag">教学示意 · 所有操作均为模拟</span>
        </div>
        <div className={`cr-workspace ${chapter.phase === 16 ? 'cr-workspace-wide' : ''}`}>
          <div className="cr-visual-stage">
            <Visual
              key={`${chapter.id}-${step.id}-${replay}`}
              step={stepIndex}
              onComplete={onComplete}
              completed={done}
            />
          </div>
          <aside className="cr-explanation" key={step.id} aria-label="这一步的解释">
            <p className="eyebrow">
              {String(stepIndex + 1).padStart(2, '0')} /{' '}
              {String(chapter.steps.length).padStart(2, '0')}
            </p>
            <h2>{step.title}</h2>
            <p>{step.beginnerExplanation}</p>
            <div className="cr-why">
              <span>为什么需要这一步</span>
              <p>{step.whyItMatters}</p>
            </div>
            <p className="cr-hint">
              <span aria-hidden="true">↳ </span>
              {step.interactionHint}
            </p>
            {done && (
              <div className="cr-step-terms">
                {chapter.terms
                  .filter((term) => step.terms.includes(term.id))
                  .map((term) => (
                    <div key={term.id}>
                      <strong>{term.name}</strong>
                      <p>{term.definition}</p>
                    </div>
                  ))}
              </div>
            )}
            <details className="cr-deep">
              <summary>深入一点 →</summary>
              <p>{step.technicalExplanation}</p>
            </details>
          </aside>
        </div>
        <div className="cr-controls">
          <button
            className="cr-secondary"
            onClick={() => {
              restart(chapter.id)
              setReplay((value) => value + 1)
            }}
          >
            <RotateCcw size={16} />
            重新开始
          </button>
          <span className="cr-save">
            {done ? '本步已完成 · 进度自动保存' : '完成提示中的互动，再继续'}
          </span>
          <button
            className="cr-secondary"
            disabled={stepIndex === 0}
            onClick={() => move(stepIndex - 1)}
          >
            <ArrowLeft size={16} />
            上一步
          </button>
          {last ? (
            <a
              className={`cr-action ${done ? '' : 'cr-disabled'}`}
              aria-disabled={!done}
              tabIndex={done ? 0 : -1}
              href={done ? '#chapter-challenge' : undefined}
            >
              下一步：{chapter.phase === 16 ? '毕业挑战' : '情境挑战'} <ArrowRight size={16} />
            </a>
          ) : (
            <button className="cr-action" disabled={!done} onClick={() => move(stepIndex + 1)}>
              下一步：{chapter.steps[stepIndex + 1].title}
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </section>
      <section className="cr-terminology" aria-labelledby="terms-heading">
        <div className="cr-section-heading">
          <div>
            <p className="eyebrow">WORDS WITH MEANING</p>
            <h2 id="terms-heading">把刚才的理解，变成你的词汇</h2>
          </div>
          <span className="cr-tag">
            {progress.unlockedTerms.length} / {chapter.terms.length} 已解锁
          </span>
        </div>
        <div className="cr-term-grid">
          {chapter.terms.map((term) => (
            <details
              key={term.id}
              className={progress.unlockedTerms.includes(term.id) ? 'is-unlocked' : 'is-locked'}
            >
              <summary>
                <span>{term.name}</span>
                <small>
                  {progress.unlockedTerms.includes(term.id) ? term.label : '完成相关互动后解锁'}
                </small>
              </summary>
              <p>
                {progress.unlockedTerms.includes(term.id)
                  ? term.definition
                  : '沿着上方的互动继续，先建立直觉，再认识这个概念。'}
              </p>
            </details>
          ))}
        </div>
      </section>
      {chapter.steps.every((item) => progress.completedSteps.includes(item.id)) && (
        <section className="cr-misconceptions">
          <div className="cr-section-heading">
            <div>
              <p className="eyebrow">KEEP THE BOUNDARY CLEAR</p>
              <h2>你可能会误解</h2>
            </div>
          </div>
          <div className="cr-misconception-grid">
            {chapter.misconceptions.map((item) => (
              <article key={item.wrong}>
                <p>
                  <span>误解</span>
                  {item.wrong}
                </p>
                <p>
                  <CheckCircle2 size={17} />
                  {item.correct}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}
      <ChapterChallenge
        chapter={chapter}
        progress={progress}
        onAnswer={(questionId, answerId) => answer(chapter.id, questionId, answerId)}
      />
      {completed && (
        <section className="cr-complete" aria-label="章节学习完成">
          <CheckCircle2 size={34} />
          <p className="eyebrow">
            {chapter.phase === 16 ? 'THE WHOLE PICTURE, CONNECTED' : 'ONE MORE PIECE CONNECTED'}
          </p>
          <h2>
            {chapter.phase === 16
              ? '你已经把整个 AI 系统连起来了。'
              : `你已经理解 ${chapter.title}。`}
          </h2>
          <p>{chapter.takeaway}</p>
          <div>
            <Link className="cr-secondary" to="/learn">
              回到学习地图
            </Link>
            {next ? (
              <Link className="cr-action" to={`/lesson/${next.id}`}>
                下一站 · {next.title}
                <ArrowRight size={16} />
              </Link>
            ) : (
              <Link className="cr-action" to="/explore">
                自由探索完整系统
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </section>
      )}
      <nav className="cr-pagination" aria-label="章节导航">
        {previous && (
          <Link to={`/lesson/${previous.id}`}>
            <ArrowLeft size={15} />
            上一章 · {previous.title}
          </Link>
        )}
        <Link to="/learn">
          查看全部 {lessons.length} 章<ArrowRight size={15} />
        </Link>
      </nav>
    </div>
  )
}
