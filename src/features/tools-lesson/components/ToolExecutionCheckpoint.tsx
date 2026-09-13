import { ArrowDown, Check, Cpu, Globe2, Settings2 } from 'lucide-react'
import { useState } from 'react'
import { InteractionHint } from '../../model-inside/components/InteractionHint'

export function ToolExecutionCheckpoint({ onComplete }: { onComplete: () => void }) {
  const [answer, setAnswer] = useState<boolean | null>(null)
  function choose(executed: boolean) {
    setAnswer(executed)
    if (!executed) onComplete()
  }
  return (
    <div className="tl-checkpoint">
      <span className="tl-small-label">停一下，检查责任边界</span>
      <div className="tl-pending-call">
        <Check size={20} />
        <div>
          <strong>Tool Call 已经生成。</strong>
          <p>结构化请求已生成 · 教学模拟</p>
        </div>
      </div>
      <h3>网页搜索现在已经发生了吗？</h3>
      <InteractionHint>试试看：请求生成以后，究竟还差哪一步？</InteractionHint>
      <div className="tl-choice-grid">
        <button aria-pressed={answer === true} onClick={() => choose(true)}>
          <span className="tl-choice-letter">A</span>
          <strong>已经发生</strong>
        </button>
        <button aria-pressed={answer === false} onClick={() => choose(false)}>
          <span className="tl-choice-letter">B</span>
          <strong>还没有</strong>
        </button>
      </div>
      {answer !== null && (
        <p className={`tl-feedback ${answer === false ? 'is-success' : ''}`} role="status">
          {answer
            ? '生成请求只是说明“要做什么”。还需要 Harness 接收、验证，并调用工具，搜索才会发生。'
            : '答对了。Function Calling 只生成请求。Harness 才让动作真正发生。'}
        </p>
      )}
      {answer === false && (
        <div className="tl-responsibility-reveal">
          <div>
            <Cpu size={20} />
            <strong>Model</strong>
            <span>决定调用什么</span>
          </div>
          <p>
            <ArrowDown size={16} /> Tool Call · 结构化请求
          </p>
          <div className="is-harness">
            <Settings2 size={20} />
            <strong>Harness</strong>
            <span>验证并执行调用</span>
          </div>
          <p>
            <ArrowDown size={16} /> 调用外部能力
          </p>
          <div>
            <Globe2 size={20} />
            <strong>Web Search</strong>
            <span>执行搜索，返回资料</span>
          </div>
        </div>
      )}
    </div>
  )
}
