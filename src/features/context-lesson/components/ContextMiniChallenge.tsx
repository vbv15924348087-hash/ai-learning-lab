import { useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowDown, ArrowRight, CheckCircle2, Lightbulb, LockKeyhole } from 'lucide-react'
import { NVIDIA_QUESTION } from '../../system-overview/data/systemOverviewSteps'
import '../../system-overview/components/assessment.css'
import './context-assessment.css'

type ContextMiniChallengeProps = { available: boolean; passed: boolean; onPass: () => void }

const questions = [
  {
    id: 'center',
    title: '1. 找中心：这些信息最终要进入哪里，模型才能在这一轮使用？',
    answer: 'context',
    options: [
      { value: 'context', label: 'Context · 当前工作台' },
      { value: 'memory', label: 'Memory · 长期仓库' },
      { value: 'rag', label: 'RAG · 找资料的方法' },
      { value: 'prompt', label: 'Prompt · 用户的输入' },
    ],
    explanation:
      '中心是 Context。Prompt 是其中一部分；从 Memory 取出的相关信息，以及 RAG 找回的资料，都要进入当前工作台，才会在这一轮被模型使用。',
    review: 'Memory 取出的信息 / RAG 找回的资料 / Prompt → Context → Model。',
  },
  {
    id: 'capacity',
    title: '2. Context 快满了，是不是说明模型的长期 Memory 快满了？',
    answer: 'no',
    options: [
      { value: 'yes', label: '是，两个容量是同一回事' },
      { value: 'no', label: '不是，工作台与仓库不同' },
    ],
    explanation:
      '不是。Context 是当前工作台，Memory 是长期仓库。Context Window 限制的是单次处理的信息范围，工作台接近容量边界不能说明长期仓库也快满了。',
    review: '不是。Context Window 与长期 Memory 的容量不是同一个概念。',
  },
  {
    id: 'relevance',
    title: '3. 当前只问 NVIDIA GPU，应该把一篇无关的旅游攻略也放进 Context 吗？',
    answer: 'no',
    options: [
      { value: 'yes', label: '应该，信息越多越好' },
      { value: 'no', label: '不应该，只留下相关信息' },
    ],
    explanation:
      '不应该。这份资料不能帮助回答当前问题。Context Engineering 要留下真正相关的信息；即使容量还有空余，也没有必要加入无关内容。',
    review: '不应该。相关、清楚和有用，比单纯塞入更多信息更重要。',
  },
]

export function ContextMiniChallenge({ available, passed, onPass }: ContextMiniChallengeProps) {
  const id = useId()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)
  const questionRefs = useRef<Record<string, HTMLInputElement | null>>({})

  function checkAnswers(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!available || passed) return
    setChecked(true)
    const firstError = questions.find((question) => answers[question.id] !== question.answer)
    if (firstError) questionRefs.current[firstError.id]?.focus()
    else onPass()
  }

  return (
    <section className="so-challenge ctx-mini-challenge" aria-labelledby={`${id}-title`}>
      <div className="so-assessment-heading">
        <div>
          <p className="so-assessment-eyebrow">用关系检查理解</p>
          <h2 id={`${id}-title`}>模型这一刻看见了什么？</h2>
        </div>
        <Lightbulb size={24} className="so-challenge-heading-icon" aria-hidden="true" />
      </div>
      {passed ? (
        <div>
          <div className="so-challenge-status" role="status">
            <CheckCircle2 size={22} aria-hidden="true" />
            <div>
              <h3>本章小测试已通过</h3>
              <p>你已分清当前工作台、长期仓库和资料来源，也知道为什么要筛选信息。</p>
              {!available && <p>通过记录已保留，可以继续重温课程。</p>}
            </div>
          </div>
          <details className="so-answer-review">
            <summary>回顾三道题的答案与解释</summary>
            <div>
              {questions.map((question) => (
                <div key={question.id}>
                  <strong>{question.review}</strong>
                  <p>{question.explanation}</p>
                </div>
              ))}
            </div>
          </details>
        </div>
      ) : !available ? (
        <div className="so-challenge-locked">
          <LockKeyhole size={21} aria-hidden="true" />
          <p>走完上面的教学，并通过整理工作台的练习后，再用这三道题检查理解。</p>
        </div>
      ) : (
        <form className="so-challenge-form" onSubmit={checkAnswers} noValidate>
          <p className="so-challenge-intro">
            还是同一个问题：「{NVIDIA_QUESTION}」 每次选择后都可以查看解释，三题都理解后再提交。
          </p>
          {questions.map((question) => {
            const answer = answers[question.id]
            const correct = answer === question.answer
            const showFeedback = Boolean(answer) || checked
            return (
              <fieldset className="so-challenge-question" key={question.id}>
                <legend>{question.title}</legend>
                {question.id === 'center' && (
                  <div
                    className="ctx-quiz-diagram"
                    aria-label="Memory 取出的信息、RAG 找回的资料和 Prompt 汇入一个中心，然后交给 Model"
                  >
                    <div>
                      <span>Memory 取出的信息</span>
                      <span>RAG 找回的资料</span>
                      <span>Prompt</span>
                    </div>
                    <ArrowDown size={20} aria-hidden="true" />
                    <strong>?</strong>
                    <ArrowDown size={20} aria-hidden="true" />
                    <span>Model</span>
                  </div>
                )}
                <div className="so-judgment-options">
                  {question.options.map((option, index) => (
                    <label className="so-judgment-option" key={option.value}>
                      <input
                        ref={
                          index === 0
                            ? (element) => {
                                questionRefs.current[question.id] = element
                              }
                            : undefined
                        }
                        type="radio"
                        name={`${id}-${question.id}`}
                        value={option.value}
                        checked={answer === option.value}
                        aria-invalid={checked && !correct}
                        aria-describedby={
                          showFeedback ? `${id}-${question.id}-feedback` : undefined
                        }
                        onChange={() => {
                          setAnswers((current) => ({ ...current, [question.id]: option.value }))
                          setChecked(false)
                        }}
                      />
                      <span>
                        <strong>{option.label}</strong>
                      </span>
                    </label>
                  ))}
                </div>
                {showFeedback && (
                  <p
                    className="so-answer-feedback"
                    id={`${id}-${question.id}-feedback`}
                    role="status"
                  >
                    {!answer ? '请先选择。' : correct ? '理解正确。' : '再想一想。'}{' '}
                    {question.explanation}
                  </p>
                )}
              </fieldset>
            )
          })}
          {checked && questions.some((question) => answers[question.id] !== question.answer) && (
            <p className="ctx-submit-feedback" role="alert">
              还有题目没有答对，请根据解释调整后再提交。
            </p>
          )}
          <div className="so-challenge-actions">
            <button className="so-check-button" type="submit">
              检查答案并完成本章
              <ArrowRight size={17} aria-hidden="true" />
            </button>
            <p>三题全部答对后，才会记录本章完成。</p>
          </div>
        </form>
      )}
    </section>
  )
}
