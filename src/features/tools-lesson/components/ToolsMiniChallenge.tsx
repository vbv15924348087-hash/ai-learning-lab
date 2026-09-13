import { useId, useRef, useState, type FormEvent } from 'react'
import { ArrowRight, CheckCircle2, Lightbulb, LockKeyhole } from 'lucide-react'

const questions = [
  {
    id: 'file',
    title: 'A. 用户说：帮我读这个 PDF。',
    options: ['直接假装读过', '调用 Read File Tool'],
    answer: 1,
    explanation: 'Read File 提供读取文件的外部能力。模型需要先得到文件内容，才能总结。',
  },
  {
    id: 'execute',
    title: 'B. 模型已经生成 Tool Call，谁真正执行 Tool？',
    options: ['Transformer', 'Harness'],
    answer: 1,
    explanation: 'Model 生成请求；Harness 验证并执行请求，才会调用真正的 Tool。',
  },
  {
    id: 'context',
    title: 'C. Tool Result 通常下一步去哪？',
    options: ['直接当最终回答', '加入 Context，让 Model 继续处理'],
    answer: 1,
    explanation: '结果先进入 Context，模型读取这些资料后，继续分析并组织回答。',
  },
  {
    id: 'schema',
    title: 'D. 工具说明 web_search(query) 属于什么？',
    options: ['Tool', 'Tool Schema', 'Tool Result'],
    answer: 1,
    explanation:
      '这里的 web_search(query) 是工具说明的简写：名称与所需参数。具体 Tool Call 还要填入这次搜索的内容。',
  },
]

export function ToolsMiniChallenge({
  available,
  passed,
  onPass,
}: {
  available: boolean
  passed: boolean
  onPass: () => void
}) {
  const id = useId()
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [checked, setChecked] = useState(false)
  const refs = useRef<Record<string, HTMLInputElement | null>>({})
  function submit(event: FormEvent) {
    event.preventDefault()
    if (!available || passed) return
    setChecked(true)
    const missed = questions.find((q) => answers[q.id] !== q.answer)
    if (missed) refs.current[missed.id]?.focus()
    else onPass()
  }
  return (
    <section className="so-challenge tl-challenge" aria-labelledby={`${id}-title`}>
      <div className="so-assessment-heading">
        <div>
          <p className="so-assessment-eyebrow">MINI CHALLENGE / 把理解放进真实情境</p>
          <h2 id={`${id}-title`}>谁决定，谁执行，结果去哪？</h2>
        </div>
        <Lightbulb size={25} className="so-challenge-heading-icon" />
      </div>
      {passed ? (
        <>
          <div className="so-challenge-status" role="status">
            <CheckCircle2 size={24} />
            <div>
              <h3>本章小挑战已通过</h3>
              <p>你已分清能力、说明书、请求，以及返回的结果。</p>
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
          <p>完成上方互动并走到完整流程后，解锁四道情境小挑战。</p>
        </div>
      ) : (
        <form noValidate onSubmit={submit} className="so-challenge-form">
          <div className="tl-question-grid">
            {questions.map((q) => (
              <fieldset className="so-challenge-question" key={q.id}>
                <legend>{q.title}</legend>
                <div className="so-judgment-options">
                  {q.options.map((option, index) => (
                    <label key={option} className="so-judgment-option">
                      <input
                        type="radio"
                        name={`${id}-${q.id}`}
                        checked={answers[q.id] === index}
                        onChange={() => {
                          setAnswers({ ...answers, [q.id]: index })
                          setChecked(false)
                        }}
                        ref={
                          index === 0
                            ? (element) => {
                                refs.current[q.id] = element
                              }
                            : undefined
                        }
                        aria-invalid={checked && answers[q.id] !== q.answer}
                        aria-describedby={checked ? `${id}-${q.id}-feedback` : undefined}
                      />
                      <span>
                        <strong>{option}</strong>
                      </span>
                    </label>
                  ))}
                </div>
                {checked && (
                  <p
                    id={`${id}-${q.id}-feedback`}
                    className="tl-quiz-feedback"
                    role={answers[q.id] === q.answer ? 'status' : 'alert'}
                  >
                    {answers[q.id] === q.answer ? '✓ ' : '再想一想：'}
                    {q.explanation}
                  </p>
                )}
              </fieldset>
            ))}
          </div>
          <button type="submit" className="button button-primary">
            检查答案 <ArrowRight size={16} />
          </button>
        </form>
      )}
    </section>
  )
}
