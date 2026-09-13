import { useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, CheckCircle2, Lightbulb, LockKeyhole } from 'lucide-react'
import './assessment.css'
import { NVIDIA_QUESTION } from '../data/systemOverviewSteps'

type MiniChallengeProps = {
  available: boolean
  passed: boolean
  onPass: () => void
}

const choices = [
  { value: 'context', label: 'Context · 上下文' },
  { value: 'model', label: 'Model · 模型' },
  { value: 'tool', label: 'Tool · 工具' },
  { value: 'harness', label: 'Harness · 运行系统' },
]

export function MiniChallenge({ available, passed, onPass }: MiniChallengeProps) {
  const id = useId()
  const [informationStep, setInformationStep] = useState('')
  const [executionStep, setExecutionStep] = useState('')
  const [directAccess, setDirectAccess] = useState('')
  const [checked, setChecked] = useState(false)
  const informationRef = useRef<HTMLSelectElement>(null)
  const executionRef = useRef<HTMLSelectElement>(null)
  const judgmentRef = useRef<HTMLInputElement>(null)
  const informationCorrect = informationStep === 'context'
  const executionCorrect = executionStep === 'harness'
  const judgmentCorrect = directAccess === 'no'

  function checkAnswers(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!available || passed) return
    setChecked(true)

    if (informationCorrect && executionCorrect && judgmentCorrect) {
      onPass()
    } else if (!informationCorrect) {
      informationRef.current?.focus()
    } else if (!executionCorrect) {
      executionRef.current?.focus()
    } else {
      judgmentRef.current?.focus()
    }
  }

  return (
    <section className="so-challenge" aria-labelledby={`${id}-title`}>
      <div className="so-assessment-heading">
        <div>
          <p className="so-assessment-eyebrow">把刚才的发现连起来</p>
          <h2 id={`${id}-title`}>一个小挑战</h2>
        </div>
        <Lightbulb className="so-challenge-heading-icon" size={24} aria-hidden="true" />
      </div>

      {passed ? (
        <div className="so-challenge-complete">
          <div className="so-challenge-status" role="status">
            <CheckCircle2 size={22} aria-hidden="true" />
            <div>
              <h3>本节挑战已通过</h3>
              <p>你已分清：模型判断下一步，运行系统让动作真正发生。</p>
              {!available && <p>之前的通过记录已保留，你可以继续重温课程。</p>}
            </div>
          </div>
          <details className="so-answer-review">
            <summary>回顾答案与解释</summary>
            <div>
              <p>
                用户问题 → Context（上下文）→ Model（模型）→ Harness（运行系统）→ Web
                Search（搜索工具）
              </p>
              <p>
                Context 是模型当前的工作台。模型判断需要最新信息后，发起搜索请求；Harness
                才负责调用搜索工具。搜索结果回到 Context，模型结合结果生成回答。
              </p>
              <p>
                判断题答案是「不是」。在这个 NVIDIA 案例里，模型没有自己直接访问互联网，搜索由
                Harness 调用工具执行。
              </p>
            </div>
          </details>
        </div>
      ) : !available ? (
        <div className="so-challenge-locked">
          <LockKeyhole size={21} aria-hidden="true" />
          <p>走完上面的流程，亲手确认谁来执行搜索后，就可以开始这个小挑战。</p>
        </div>
      ) : (
        <form className="so-challenge-form" onSubmit={checkAnswers} noValidate>
          <p className="so-challenge-intro">
            还是刚才的问题：「{NVIDIA_QUESTION}」 请沿着这一次搜索，完成两道题。
          </p>

          <fieldset className="so-challenge-question">
            <legend>1. 补上这次搜索中缺少的两个环节</legend>
            <p className="so-question-hint">先把问题交给模型，再把模型的搜索请求变成实际动作。</p>
            <ol className="so-challenge-flow" aria-label="补全 NVIDIA 搜索流程">
              <li className="so-flow-fixed">用户问题</li>
              <li className="so-flow-slot">
                <ArrowRight size={17} className="so-flow-arrow" aria-hidden="true" />
                <div>
                  <label htmlFor={`${id}-information`}>第一个空：模型从哪里获得当前信息？</label>
                  <select
                    id={`${id}-information`}
                    ref={informationRef}
                    value={informationStep}
                    aria-invalid={checked && !informationCorrect}
                    aria-describedby={
                      checked && !informationCorrect ? `${id}-information-error` : undefined
                    }
                    onChange={(event) => {
                      setInformationStep(event.target.value)
                      setChecked(false)
                    }}
                  >
                    <option value="">请选择环节</option>
                    {choices.map((choice) => (
                      <option value={choice.value} key={choice.value}>
                        {choice.label}
                      </option>
                    ))}
                  </select>
                </div>
              </li>
              <li className="so-flow-fixed">
                <ArrowRight size={17} className="so-flow-arrow" aria-hidden="true" />
                <span>
                  Model<span className="so-flow-sublabel">模型发起搜索请求</span>
                </span>
              </li>
              <li className="so-flow-slot">
                <ArrowRight size={17} className="so-flow-arrow" aria-hidden="true" />
                <div>
                  <label htmlFor={`${id}-execution`}>第二个空：谁把请求交给工具执行？</label>
                  <select
                    id={`${id}-execution`}
                    ref={executionRef}
                    value={executionStep}
                    aria-invalid={checked && !executionCorrect}
                    aria-describedby={
                      checked && !executionCorrect ? `${id}-execution-error` : undefined
                    }
                    onChange={(event) => {
                      setExecutionStep(event.target.value)
                      setChecked(false)
                    }}
                  >
                    <option value="">请选择环节</option>
                    {choices.map((choice) => (
                      <option value={choice.value} key={choice.value}>
                        {choice.label}
                      </option>
                    ))}
                  </select>
                </div>
              </li>
              <li className="so-flow-fixed">
                <ArrowRight size={17} className="so-flow-arrow" aria-hidden="true" />
                <span>
                  Web Search<span className="so-flow-sublabel">搜索工具</span>
                </span>
              </li>
            </ol>
            {checked && !informationCorrect && (
              <p className="so-answer-feedback" id={`${id}-information-error`} role="alert">
                {informationStep ? '再想想第一个空：' : '还没有选择第一个环节。'}
                模型要先读到当前问题与已有信息；放这些信息的工作台叫 Context（上下文）。
              </p>
            )}
            {checked && !executionCorrect && (
              <p className="so-answer-feedback" id={`${id}-execution-error`} role="alert">
                {executionStep ? '再想想第二个空：' : '还没有选择第二个环节。'}
                模型只发起搜索请求，Harness（运行系统）接住请求，再调用 Web Search 执行。
              </p>
            )}
          </fieldset>

          <fieldset className="so-challenge-question">
            <legend>2. 模型想搜索 NVIDIA 最新 AI GPU 时，是模型自己直接访问互联网吗？</legend>
            <div className="so-judgment-options">
              {[
                { value: 'yes', label: '是', description: '模型自己直接上网搜索' },
                { value: 'no', label: '不是', description: '运行系统调用工具执行搜索' },
              ].map((choice, index) => (
                <label className="so-judgment-option" key={choice.value}>
                  <input
                    ref={index === 0 ? judgmentRef : undefined}
                    type="radio"
                    name={`${id}-direct-access`}
                    value={choice.value}
                    checked={directAccess === choice.value}
                    aria-invalid={checked && !judgmentCorrect}
                    aria-describedby={
                      checked && !judgmentCorrect ? `${id}-judgment-error` : undefined
                    }
                    onChange={(event) => {
                      setDirectAccess(event.target.value)
                      setChecked(false)
                    }}
                  />
                  <span>
                    <strong>{choice.label}</strong> <span>{choice.description}</span>
                  </span>
                </label>
              ))}
            </div>
            {checked && !judgmentCorrect && (
              <p className="so-answer-feedback" id={`${id}-judgment-error`} role="alert">
                {directAccess ? '发起请求和执行搜索是两件事。' : '请先做出判断。'}
                模型判断需要外部信息并发起请求，Harness 才会调用搜索工具访问互联网，再把结果送回。
              </p>
            )}
          </fieldset>

          <div className="so-challenge-actions">
            <button className="so-check-button" type="submit">
              检查答案 <ArrowRight size={17} aria-hidden="true" />
            </button>
            <p>两题都理解后，这一节才算完成。</p>
          </div>
        </form>
      )}
    </section>
  )
}
