import { ArrowDown, GraduationCap, MessageSquare } from 'lucide-react'

export function TrainingInferenceCompare() {
  return (
    <div className="mi-compare">
      <div className="mi-demo-label">
        <span>07 / 学习能力与使用能力</span>
        <span>静态对比</span>
      </div>
      <div className="mi-compare-grid">
        <article>
          <GraduationCap size={24} />
          <h3>
            训练 <small>Training</small>
          </h3>
          <p>主要发生在模型构建阶段</p>
          <div className="mi-compare-flow">
            <span>大量训练数据</span>
            <ArrowDown size={18} />
            <span>训练过程</span>
            <ArrowDown size={18} />
            <strong>模型参数发生变化</strong>
          </div>
        </article>
        <article className="is-inference">
          <MessageSquare size={24} />
          <h3>
            使用 <small>Inference</small>
          </h3>
          <p>你现在与 AI 聊天的主要过程</p>
          <div className="mi-compare-flow">
            <span>当前 Context</span>
            <ArrowDown size={18} />
            <span>已经训练好的 Model</span>
            <ArrowDown size={18} />
            <strong>生成答案 / 下一步动作</strong>
          </div>
        </article>
      </div>
      <p className="mi-compare-takeaway">
        这一次聊天改变了模型能看到的上下文，
        <br />
        <strong>正常聊天 ≠ 模型正在重新训练自己。</strong>
      </p>
    </div>
  )
}
