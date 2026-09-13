import { ArrowDown, RotateCcw } from 'lucide-react'

export function ModelFlowSummary() {
  return (
    <div className="mi-flow-summary" aria-label="从 Context 到逐步生成回答的完整流程">
      <span className="mi-flow-tag">CONTEXT · 当前全部工作资料</span>
      <ArrowDown size={17} />
      <div className="mi-summary-pair">
        <span>
          文字拆分 <small>Tokenization → Tokens</small>
        </span>
        <span>
          数字表示 <small>Embedding</small>
        </span>
      </div>
      <ArrowDown size={17} />
      <div className="mi-summary-transformer">
        <strong>Transformer Layers</strong>
        <span>多层更新内部表示</span>
        <div>
          <b>Attention</b>
          <span>在层内结合上下文关系</span>
        </div>
      </div>
      <ArrowDown size={17} />
      <div className="mi-summary-pair">
        <span>
          候选打分 <small>Candidate Scores</small>
        </span>
        <span>
          选出下一个小块 <small>Next Token</small>
        </span>
      </div>
      <div className="mi-summary-loop">
        <RotateCcw size={19} />
        <span>加入当前输出 → 带上已有内容，再计算下一步</span>
      </div>
      <span className="mi-flow-tag mi-flow-answer">满足停止条件 → ANSWER</span>
    </div>
  )
}
