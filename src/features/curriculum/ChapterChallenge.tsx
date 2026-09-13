import { useState } from 'react'
import { ArrowRight, CheckCircle2, Lightbulb } from 'lucide-react'
import type { ChapterDefinition, ChapterProgress } from './types'

export function ChapterChallenge({
  chapter,
  progress,
  onAnswer,
}: {
  chapter: ChapterDefinition
  progress: ChapterProgress
  onAnswer: (questionId: string, answerId: string) => void
}) {
  const available = chapter.steps.every((step) => progress.completedSteps.includes(step.id))
  const firstUnsolved = chapter.challenge.findIndex((q) => progress.answers[q.id] !== q.answer)
  const [index, setIndex] = useState(Math.max(0, firstUnsolved))
  const question = chapter.challenge[index]
  const choice = progress.answers[question.id]
  const selected = question.options.find((option) => option.id === choice)
  const correct = choice === question.answer
  const passedCount = chapter.challenge.filter((q) => progress.answers[q.id] === q.answer).length

  return (
    <section className="cr-challenge" id="chapter-challenge" aria-labelledby="challenge-title">
      <div className="cr-section-heading">
        <div>
          <p className="eyebrow">PUT IT INTO PRACTICE</p>
          <h2 id="challenge-title">
            {chapter.phase === 16
              ? '毕业挑战 · 完成一份 AI GPU 研究报告'
              : '换个情境，你会怎么做？'}
          </h2>
        </div>
        <span className="cr-tag">
          {passedCount} / {chapter.challenge.length} 已理解
        </span>
      </div>
      {!available ? (
        <p className="cr-hint">先完成上方 {chapter.steps.length} 步互动，再用情境判断检验理解。</p>
      ) : (
        <>
          <nav className="cr-question-nav" aria-label="挑战题目">
            {chapter.challenge.map((q, i) => (
              <button
                key={q.id}
                className={i === index ? 'cr-active' : ''}
                aria-label={`第 ${i + 1} 个情境`}
                aria-current={i === index ? 'step' : undefined}
                onClick={() => setIndex(i)}
              >
                {progress.answers[q.id] === q.answer ? <CheckCircle2 size={16} /> : i + 1}
              </button>
            ))}
          </nav>
          <p className="cr-question">{question.prompt}</p>
          <div className="cr-options">
            {question.options.map((option, i) => (
              <button
                disabled={progress.challengePassed}
                className={`cr-option ${choice === option.id ? (correct ? 'is-correct' : 'is-incorrect') : ''}`}
                key={option.id}
                aria-pressed={choice === option.id}
                onClick={() => onAnswer(question.id, option.id)}
              >
                <span>{String.fromCharCode(65 + i)}</span>
                {option.label}
              </button>
            ))}
          </div>
          {selected && (
            <div className={`cr-feedback ${correct ? 'is-correct' : ''}`} role="status">
              <Lightbulb size={20} />
              <p>
                <strong>{correct ? '判断正确。' : '再想一步。'}</strong>
                {selected.explanation}
              </p>
            </div>
          )}
          {correct && index < chapter.challenge.length - 1 && (
            <button className="cr-action" onClick={() => setIndex(index + 1)}>
              下一个情境 <ArrowRight size={16} />
            </button>
          )}
          {progress.challengePassed && (
            <p className="cr-result" role="status">
              全部情境已通过。你已完成本章，可以自主进入下一站。
            </p>
          )}
        </>
      )}
    </section>
  )
}
