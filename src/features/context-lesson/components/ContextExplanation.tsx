import { ArrowDown, ArrowRight, Check, Lightbulb, X } from 'lucide-react'
import { contextSources } from '../data/contextLessonSteps'
import type { ContextLessonStep, ContextProgress, ContextSourceId } from '../types'

type Props = {
  step: ContextLessonStep
  selectedSource: ContextSourceId | null
  predictionChoice: ContextProgress['predictionChoice']
  onChoose: (choice: NonNullable<ContextProgress['predictionChoice']>) => void
  onClearSource: () => void
  engineeringPassed: boolean
}

export function ContextExplanation({
  step,
  selectedSource,
  predictionChoice,
  onChoose,
  onClearSource,
  engineeringPassed,
}: Props) {
  const source = selectedSource
    ? contextSources.find((item) => item.id === selectedSource)
    : undefined
  return (
    <aside className="so-explanation ctx-explanation" aria-label="这一步的解释" aria-live="polite">
      <p className="so-panel-kicker">{source ? '正在查看信息来源' : step.kicker}</p>
      <h2>
        {source
          ? step.variant === 'assembly'
            ? source.label
            : `${source.english} · ${source.label}`
          : step.title}
      </h2>
      <p className="so-main-explanation">{source?.explanation ?? step.beginnerExplanation}</p>
      {source ? (
        <>
          <ol className="ctx-explanation-flow" aria-label="信息到达模型的过程">
            {source.flow.map((label, index) => (
              <li key={label}>
                {index > 0 && <ArrowDown size={14} aria-hidden="true" />}
                <span>{label}</span>
              </li>
            ))}
          </ol>
          <div className="so-why">
            <span>放到桌上的这一张卡</span>
            <p>{source.content}</p>
          </div>
          <button className="so-control-button ctx-back-explanation" onClick={onClearSource}>
            <X size={14} />
            返回本步讲解
          </button>
        </>
      ) : (
        <div className="so-why">
          <span>
            <Lightbulb size={15} />
            为什么这件事有用
          </span>
          <p>{step.whyItMatters}</p>
        </div>
      )}
      {step.gate === 'prediction' && (
        <div className="ctx-prediction" role="group" aria-label="模型看到什么？">
          <button
            className={predictionChoice === 'only-prompt' ? 'is-selected' : ''}
            aria-pressed={predictionChoice === 'only-prompt'}
            onClick={() => onChoose('only-prompt')}
          >
            <span>A</span>是，模型只看到用户输入
          </button>
          <button
            className={predictionChoice === 'more-information' ? 'is-selected' : ''}
            aria-pressed={predictionChoice === 'more-information'}
            onClick={() => onChoose('more-information')}
          >
            <span>B</span>不是，还可能看到其他信息
          </button>
          {predictionChoice && (
            <p className="ctx-prediction-feedback" role="status">
              {predictionChoice === 'more-information'
                ? '对，输入框只是信息来源之一。'
                : '这是很自然的直觉，但工作台上通常还有其他资料。'}{' '}
              现代 AI
              系统还可能给模型提供系统规则、当前对话、工具说明，以及刚检索到的资料。下一步，一张张看它们进来。
            </p>
          )}
        </div>
      )}
      {step.gate === 'engineering' && !engineeringPassed && (
        <a className="button button-primary ctx-practice-link" href="#context-engineering-practice">
          去选择信息卡
          <ArrowRight size={16} />
        </a>
      )}
      {step.unlocks && (
        <p className="so-unlock-note">
          <Check size={15} />
          下方已解锁本步概念，可展开三层解释。
        </p>
      )}
    </aside>
  )
}
