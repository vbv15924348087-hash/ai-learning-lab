import { useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, Check, CheckCircle2, Layers3, LockKeyhole, Plus } from 'lucide-react'
import { NVIDIA_QUESTION } from '../../system-overview/data/systemOverviewSteps'
import {
  contextInformationCards,
  contextVerdictLabels,
  isContextSelectionValid,
} from '../data/contextInformationCards'
import '../../system-overview/components/assessment.css'
import './context-assessment.css'

type ContextEngineeringChallengeProps = {
  available: boolean
  passed: boolean
  onPass: () => void
}

function AnswerReview() {
  return (
    <details className="so-answer-review">
      <summary>回顾八张信息卡的判断</summary>
      <div>
        {contextInformationCards.map((card) => (
          <p key={card.id}>
            <strong>
              {card.title} · {contextVerdictLabels[card.verdict]}
            </strong>
            <br />
            {card.feedback}
          </p>
        ))}
      </div>
    </details>
  )
}

export function ContextEngineeringChallenge({
  available,
  passed,
  onPass,
}: ContextEngineeringChallengeProps) {
  const id = useId()
  const [selected, setSelected] = useState<string[]>([])
  const [attempted, setAttempted] = useState(false)
  const [checked, setChecked] = useState(false)
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const valid = isContextSelectionValid(selected)

  function toggleCard(cardId: string) {
    setSelected((current) =>
      current.includes(cardId) ? current.filter((item) => item !== cardId) : [...current, cardId],
    )
    setChecked(false)
  }

  function checkSelection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!available || passed) return
    setAttempted(true)
    setChecked(true)
    if (valid) {
      onPass()
      return
    }
    const firstError = contextInformationCards.find(
      (card) =>
        card.verdict !== 'depends' && selected.includes(card.id) !== (card.verdict === 'relevant'),
    )
    if (firstError) cardRefs.current[firstError.id]?.focus()
  }

  return (
    <section className="so-challenge ctx-engineering" aria-labelledby={`${id}-title`}>
      <div className="so-assessment-heading">
        <div>
          <p className="so-assessment-eyebrow">亲手决定这一次该看什么</p>
          <h2 id={`${id}-title`}>亲手整理工作台</h2>
        </div>
        <Layers3 className="so-challenge-heading-icon" size={24} aria-hidden="true" />
      </div>
      {passed ? (
        <div>
          <div className="so-challenge-status" role="status">
            <CheckCircle2 size={22} aria-hidden="true" />
            <div>
              <h3>你刚刚亲自做了一次 Context Engineering。</h3>
              <p>留下相关资料，去掉无关与重复；有条件的信息，先判断它与当前任务的关系。</p>
            </div>
          </div>
          <AnswerReview />
        </div>
      ) : !available ? (
        <div className="so-challenge-locked">
          <LockKeyhole size={21} aria-hidden="true" />
          <p>跟随上面的步骤，看到信息筛选后，就可以亲手整理一次工作台。</p>
        </div>
      ) : (
        <form onSubmit={checkSelection} noValidate>
          <p className="so-challenge-intro">
            当前任务：「{NVIDIA_QUESTION}」<br />
            现在已找到一部分资料，还要继续搜索并核对最新信息。哪些信息值得进入这一轮
            Context？点击卡片选择，再检查判断。
          </p>
          <div className="ctx-selection-summary" aria-live="polite">
            <span>当前工作台</span>
            <strong>已选 {selected.length} / 8 张</strong>
            <span>相关、清楚、够用</span>
          </div>
          <ul className="ctx-information-grid" aria-label="可选的八张信息卡">
            {contextInformationCards.map((card, index) => {
              const included = selected.includes(card.id)
              const wrong = card.verdict !== 'depends' && included !== (card.verdict === 'relevant')
              return (
                <li className="ctx-information-item" key={card.id}>
                  <button
                    ref={(element) => {
                      cardRefs.current[card.id] = element
                    }}
                    type="button"
                    className="ctx-information-card"
                    aria-pressed={included}
                    aria-label={`${index + 1}. ${card.title}`}
                    aria-describedby={`${id}-${card.id}-detail${attempted ? ` ${id}-${card.id}-feedback` : ''}`}
                    aria-invalid={checked && wrong}
                    onClick={() => toggleCard(card.id)}
                  >
                    <span className="ctx-information-top">
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <span className="ctx-card-choice">
                        {included ? (
                          <Check size={16} aria-hidden="true" />
                        ) : (
                          <Plus size={16} aria-hidden="true" />
                        )}
                        {included ? '已放入' : '放入工作台'}
                      </span>
                    </span>
                    <strong>{card.title}</strong>
                    <span id={`${id}-${card.id}-detail`} className="ctx-information-detail">
                      {card.detail}
                    </span>
                  </button>
                  {attempted && (
                    <div
                      id={`${id}-${card.id}-feedback`}
                      className={`ctx-card-feedback ctx-verdict-${card.verdict}`}
                    >
                      <strong>{contextVerdictLabels[card.verdict]}</strong>
                      <p>{card.feedback}</p>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
          {attempted && (
            <p className="so-answer-feedback" role="status">
              {checked
                ? valid
                  ? '这组选择可以支持当前任务。'
                  : '还有值得调整的卡片。请参考每张卡片的解释，再次检查。'
                : '已修改选择。看完逐卡解释后，再检查一次。'}{' '}
              昨天的项目要求属于「视情况」，本题允许选或不选，关键是先确认关联。
            </p>
          )}
          <div className="so-challenge-actions ctx-engineering-actions">
            <button type="submit" className="so-check-button">
              {attempted ? '再次检查选择' : '检查我的选择'}
              <ArrowRight size={17} aria-hidden="true" />
            </button>
            <p>信息的价值来自相关性，不取决于选了多少张。</p>
          </div>
        </form>
      )}
    </section>
  )
}
