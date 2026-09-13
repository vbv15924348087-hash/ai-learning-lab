import { useId, useRef, useState, type FormEvent } from 'react'
import { ArrowRight, CheckCircle2, Lightbulb, LockKeyhole } from 'lucide-react'
import { flowOptions, flowQuestions, judgmentQuestions } from '../data/modelChallengeData'

export function ModelMiniChallenge({
  available,
  passed,
  onPass,
}: {
  available: boolean
  passed: boolean
  onPass: () => void
}) {
  const id = useId()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)
  const refs = useRef<Record<string, HTMLElement | null>>({})
  const questions = [...flowQuestions, ...judgmentQuestions]
  function submit(event: FormEvent) {
    event.preventDefault()
    if (!available || passed) return
    setChecked(true)
    const error = questions.find((q) => answers[q.id] !== q.answer)
    if (error) refs.current[error.id]?.focus()
    else onPass()
  }
  function update(key: string, value: string) {
    setAnswers((previous) => ({ ...previous, [key]: value }))
    setChecked(false)
  }
  return (
    <section className="so-challenge mi-challenge" aria-labelledby={`${id}-title`}>
      <div className="so-assessment-heading">
        <div>
          <p className="so-assessment-eyebrow">MINI CHALLENGE / 用流程检查理解</p>
          <h2 id={`${id}-title`}>把模型内部的过程，亲手连起来。</h2>
        </div>
        <Lightbulb size={25} className="so-challenge-heading-icon" />
      </div>
      {passed ? (
        <>
          <div className="so-challenge-status" role="status">
            <CheckCircle2 size={24} />
            <div>
              <h3>本章小测试已通过</h3>
              <p>你已经把文字、计算、上下文关系与逐步生成连成了一个完整过程。</p>
            </div>
          </div>
          <details className="so-answer-review">
            <summary>查看技术解释 → 回顾答案与解释</summary>
            <div>
              {questions.map((q) => (
                <p key={q.id}>{q.explanation}</p>
              ))}
            </div>
          </details>
        </>
      ) : !available ? (
        <div className="so-challenge-locked">
          <LockKeyhole size={22} />
          <p>完成上方五项互动并走到流程回顾后，解锁三道小挑战。</p>
        </div>
      ) : (
        <form className="so-challenge-form" noValidate onSubmit={submit}>
          <p className="so-challenge-intro">
            不用背定义。想想：信息先变成什么，在哪处理，然后怎样成为回答？
          </p>
          <fieldset className="so-challenge-question">
            <legend>A. 补全从文字到回答的流程</legend>
            <div className="mi-quiz-flow">
              <span>Text</span>
              <ArrowRight size={15} />
              <b>①</b>
              <ArrowRight size={15} />
              <span>Embedding</span>
              <ArrowRight size={15} />
              <b>
                ② <small>层内使用 Attention</small>
              </b>
              <ArrowRight size={15} />
              <span>候选打分</span>
              <ArrowRight size={15} />
              <b>③</b>
              <ArrowRight size={15} />
              <span>重复 → Answer</span>
            </div>
            <div className="mi-quiz-selects">
              {flowQuestions.map((q) => (
                <div key={q.id}>
                  <label htmlFor={`${id}-${q.id}`}>{q.label}</label>
                  <select
                    id={`${id}-${q.id}`}
                    ref={(element) => {
                      refs.current[q.id] = element
                    }}
                    value={answers[q.id] ?? ''}
                    onChange={(event) => update(q.id, event.target.value)}
                    aria-invalid={checked && answers[q.id] !== q.answer}
                    aria-describedby={checked ? `${id}-${q.id}-feedback` : undefined}
                  >
                    <option value="">选择一个环节</option>
                    {flowOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {checked && (
                    <p
                      id={`${id}-${q.id}-feedback`}
                      role={answers[q.id] === q.answer ? 'status' : 'alert'}
                      className="mi-quiz-feedback"
                    >
                      {answers[q.id] === q.answer ? '✓ ' : '再想一想：'}
                      {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </fieldset>
          {judgmentQuestions.map((q) => (
            <fieldset className="so-challenge-question" key={q.id}>
              <legend>{q.title}</legend>
              <div className="so-judgment-options">
                {q.options.map((option, index) => (
                  <label className="so-judgment-option" key={option.value}>
                    <input
                      type="radio"
                      name={`${id}-${q.id}`}
                      value={option.value}
                      checked={answers[q.id] === option.value}
                      ref={
                        index === 0
                          ? (element) => {
                              refs.current[q.id] = element
                            }
                          : undefined
                      }
                      onChange={() => update(q.id, option.value)}
                      aria-invalid={checked && answers[q.id] !== q.answer}
                      aria-describedby={checked ? `${id}-${q.id}-feedback` : undefined}
                    />
                    <span>
                      <strong>{option.label}</strong>
                    </span>
                  </label>
                ))}
              </div>
              {checked && (
                <p
                  id={`${id}-${q.id}-feedback`}
                  className="mi-quiz-feedback"
                  role={answers[q.id] === q.answer ? 'status' : 'alert'}
                >
                  {answers[q.id] === q.answer ? '✓ ' : '再想一想：'}
                  {q.explanation}
                </p>
              )}
            </fieldset>
          ))}
          <button className="button button-primary" type="submit">
            检查答案 <ArrowRight size={16} />
          </button>
        </form>
      )}
    </section>
  )
}
