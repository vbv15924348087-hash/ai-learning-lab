import { ArrowRight, Cpu, Globe2, HelpCircle, Search } from 'lucide-react'
import { useState } from 'react'
import { InteractionHint } from '../../model-inside/components/InteractionHint'

export function ToolBoundary({ onComplete }: { onComplete: () => void }) {
  const [direct, setDirect] = useState(false)
  return (
    <div className="tl-boundary">
      <div className="tl-lab-label">
        <span>
          <i /> CAPABILITY LAB
        </span>
        <span>01 / 遇到能力边界</span>
      </div>
      <div className="tl-boundary-scene" aria-label="模型需要最新资料，搜索能力在模型之外">
        <div className="tl-model-card">
          <Cpu size={31} strokeWidth={1.3} />
          <span>MODEL</span>
          <strong>我需要最新的信息</strong>
          <small>已有知识，无法保证今天最新</small>
        </div>
        <div className="tl-boundary-gap">
          <span />
          <HelpCircle size={24} strokeWidth={1.4} />
          <span />
          <small>怎样抵达外部世界？</small>
        </div>
        <div className="tl-world-card">
          <Globe2 size={35} strokeWidth={1.2} />
          <span>外部世界</span>
          <small>网页 · 文件 · 数据</small>
          <span className="tl-world-update">持续更新的信息</span>
        </div>
      </div>
      <div className="tl-boundary-question">
        <span>想一想</span>
        <h3>模型自己能直接上网吗？</h3>
        <p>这个问题需要今天的最新资料。你会让模型怎么做？</p>
      </div>
      <InteractionHint>试试看：选择模型的下一步行动</InteractionHint>
      <div className="tl-choice-grid">
        <button className={direct ? 'is-selected' : ''} onClick={() => setDirect(true)}>
          <span className="tl-choice-letter">A</span>
          <span>
            <strong>直接回答</strong>
            <small>用已经学过的知识作答</small>
          </span>
          <ArrowRight size={17} />
        </button>
        <button onClick={onComplete}>
          <span className="tl-choice-letter">B</span>
          <span>
            <strong>使用 Tool</strong>
            <small>借助外部能力获取资料</small>
          </span>
          <Search size={17} />
        </button>
      </div>
      {direct && (
        <p className="tl-feedback" role="status">
          直接回答可能依赖已有知识，但无法保证是今天最新的信息。试试看：选择“使用 Tool” →
        </p>
      )}
      <p className="tl-caption">从上一章的“生成回答”，走向“请求外部能力”。</p>
    </div>
  )
}
