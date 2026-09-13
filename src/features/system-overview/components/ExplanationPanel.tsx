import { ArrowRight, Check, Lightbulb, MousePointer2, X } from 'lucide-react'
import { nodeExplanations } from '../data/systemOverviewSteps'
import type { LessonStep, OverviewNodeId, PredictionChoice } from '../types'

type Props = {
  step: LessonStep
  selectedNode: OverviewNodeId | null
  predictionChoice: PredictionChoice | null
  onChoose: (choice: PredictionChoice) => void
  onReveal: () => void
  onClearSelection: () => void
}

export function ExplanationPanel({
  step,
  selectedNode,
  predictionChoice,
  onChoose,
  onReveal,
  onClearSelection,
}: Props) {
  const node = selectedNode ? nodeExplanations[selectedNode] : null
  if (node)
    return (
      <aside className="so-explanation so-node-detail" aria-label="节点解释" aria-live="polite">
        <div className="so-panel-kicker">
          <span>
            <MousePointer2 size={14} /> 自由探索
          </span>
          <button type="button" onClick={onClearSelection} aria-label="关闭节点解释">
            <X size={17} />
          </button>
        </div>
        <h2>{node.label}</h2>
        <p className="so-node-term">{node.term}</p>
        <p className="so-main-explanation">{node.explanation}</p>
        <div className="so-why">
          <span>它与谁连接？</span>
          <p>{node.connections}</p>
        </div>
        <div className="so-example">
          <span>在 NVIDIA 案例里</span>
          <p>{node.example}</p>
        </div>
        {node.followUp && <p className="so-follow-up">{node.followUp}</p>}
      </aside>
    )
  return (
    <aside className="so-explanation" aria-label="步骤解释">
      <div className="so-step-copy" key={step.id} aria-live="polite" aria-atomic="true">
        <p className="so-panel-kicker">{step.kicker}</p>
        <h2>{step.title}</h2>
        <span className="so-field-label">现在发生了什么？</span>
        <p className="so-main-explanation">{step.beginnerExplanation}</p>
      </div>
      {step.gate === 'prediction' && (
        <div className="so-prediction" role="group" aria-label="你认为模型能直接回答吗？">
          <button
            type="button"
            className={predictionChoice === 'always' ? 'is-selected' : ''}
            aria-pressed={predictionChoice === 'always'}
            onClick={() => onChoose('always')}
          >
            <span>A</span>模型什么都知道，可以直接回答
          </button>
          <button
            type="button"
            className={predictionChoice === 'needs-search' ? 'is-selected' : ''}
            aria-pressed={predictionChoice === 'needs-search'}
            onClick={() => onChoose('needs-search')}
          >
            <span>B</span>不一定，它可能需要获得最新资料
          </button>
          {predictionChoice && (
            <div
              className={`so-feedback ${predictionChoice === 'needs-search' ? 'is-correct' : ''}`}
              role="status"
            >
              <strong>
                {predictionChoice === 'needs-search' ? (
                  <>
                    <Check size={16} /> 你发现了关键。
                  </>
                ) : (
                  '这里有一个容易忽略的地方。'
                )}
              </strong>
              <p>
                模型有训练得到的知识和推理能力，但“今天最新的信息”可能发生在训练之后，因此系统可能需要去外部获取资料。
              </p>
            </div>
          )}
        </div>
      )}
      {step.gate === 'harness' && (
        <button className="button button-primary so-reveal" type="button" onClick={onReveal}>
          继续看 <ArrowRight size={17} />
        </button>
      )}
      <div className="so-why">
        <span>
          <Lightbulb size={15} /> 为什么需要这一步？
        </span>
        <p>{step.whyItMatters}</p>
      </div>
      {step.unlocks && (
        <p className="so-unlock-note">
          <Check size={14} /> 这个角色，已加入下方的术语笔记
        </p>
      )}
    </aside>
  )
}
