import {
  ArrowDown,
  ArrowRight,
  BrainCircuit,
  Check,
  FileText,
  FolderInput,
  Search,
} from 'lucide-react'
import { useRef, useState } from 'react'
import '../tools-flow.css'

export function ToolResultCard({ onComplete }: { onComplete: () => void }) {
  const [addedToContext, setAddedToContext] = useState(false)
  const completionReported = useRef(false)

  function addToContext() {
    setAddedToContext(true)
    if (completionReported.current) return
    completionReported.current = true
    onComplete()
  }

  return (
    <section className="tl-result-demo" aria-label="Tool Result 进入 Context 教学模拟">
      <div className="tl-flow-heading">
        <div>
          <span className="tl-flow-eyebrow">THE RETURN JOURNEY</span>
          <h3>拿到资料，还要再交给模型</h3>
        </div>
      </div>
      <div className="tl-result-source-card">
        <div className="tl-result-card-header">
          <span>
            <Search size={16} />
            Tool Result
          </span>
          <span className="tl-simulation-tag">虚构数据 · 教学模拟</span>
        </div>
        <div className="tl-result-source">
          <FileText size={16} />
          <span>来源：课程内置模拟资料（无真实网页）</span>
        </div>
        <h4>
          NVIDIA「示例 GPU A」产品简介 <small>（虚构型号）</small>
        </h4>
        <p>
          本示例假设 NVIDIA 发布了一款名为「示例 GPU A」的 AI 加速器，主要用于训练与运行 AI 模型。
        </p>
        <span className="tl-result-fiction-note">
          型号与内容均为虚构，不代表 NVIDIA 当前或最新产品。
        </span>
      </div>
      <div className="tl-result-context-arrow" aria-hidden="true">
        <ArrowDown size={21} />
        <span>{addedToContext ? '已加入这一次的工作资料' : 'Tool Result 需要进入 Context'}</span>
      </div>
      <div className={`tl-result-context${addedToContext ? ' tl-result-context-filled' : ''}`}>
        <div className="tl-result-context-title">
          <FolderInput size={19} />
          <strong>Context</strong>
          <span>模型本次能看到的资料</span>
        </div>
        <div className="tl-result-context-item">
          <span>用户问题</span>
          <p>帮我查 NVIDIA 最新的 AI GPU，并简单告诉我它是什么。</p>
        </div>
        <div
          className={`tl-result-context-item${addedToContext ? '' : ' tl-result-context-empty'}`}
        >
          <span>工具结果</span>
          <p>
            {addedToContext
              ? '已加入：示例 GPU A 的模拟资料、来源与标题。'
              : '等待把上方返回的资料加入 Context…'}
          </p>
          {addedToContext && <Check size={16} />}
        </div>
      </div>
      {!addedToContext ? (
        <button type="button" className="tl-flow-next tl-result-add" onClick={addToContext}>
          试试看：把 Tool Result 加入 Context
          <ArrowRight size={16} />
        </button>
      ) : (
        <div className="tl-result-model-answer" role="status">
          <div className="tl-result-context-arrow" aria-hidden="true">
            <ArrowDown size={21} />
            <span>Model 读取结果，再组织回答</span>
          </div>
          <div className="tl-result-answer-body">
            <BrainCircuit size={23} />
            <div>
              <span>MODEL · 教学模拟回答</span>
              <p>
                根据这份虚构资料，「示例 GPU A」是一款用于训练和运行 AI
                模型的加速器。这是课堂示例，不能据此判断 NVIDIA 最新的真实产品。
              </p>
            </div>
          </div>
        </div>
      )}
      <p className="tl-result-principle">
        Tool 返回资料 → 资料进入 Context → Model 继续处理 → 生成回答。
      </p>
    </section>
  )
}
