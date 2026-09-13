import { useState, type CSSProperties } from 'react'
import { ArrowDown, ArrowRight, Check, Scissors } from 'lucide-react'
import { InteractionHint } from './InteractionHint'

const teachingTokens = ['帮我', '查', 'NVIDIA', '最新', '的', 'AI', 'GPU']

export function TokenizationDemo({ onComplete }: { onComplete: () => void }) {
  const [split, setSplit] = useState(false)
  return (
    <div className="mi-token-demo">
      <div className="mi-demo-label">
        <span>01 / 文字的入口</span>
        <span>教学示意</span>
      </div>
      <div className="mi-source-text">
        <span>你看到的一句话</span>
        <p>帮我查 NVIDIA 最新的 AI GPU</p>
      </div>
      <div className="mi-transform-arrow">
        <ArrowDown size={22} />
        <span>{split ? '拆成更小的处理单位' : '模型会怎样读这句话？'}</span>
      </div>
      <div className={`mi-token-tray ${split ? 'is-split' : ''}`} aria-live="polite">
        {split ? (
          teachingTokens.map((token, i) => (
            <span
              className="mi-token-chip"
              key={token}
              style={{ '--token-delay': `${i * 65}ms` } as CSSProperties}
            >
              <small>{String(i + 1).padStart(2, '0')}</small>
              {token}
            </span>
          ))
        ) : (
          <span className="mi-token-placeholder">点击下方按钮，打开这句话</span>
        )}
      </div>
      {!split ? (
        <>
          <InteractionHint>先看一句完整的话，再亲手把它展开。</InteractionHint>
          <button
            className="button button-primary"
            onClick={() => {
              setSplit(true)
              onComplete()
            }}
          >
            <Scissors size={16} />
            看看模型真正收到的东西 <ArrowRight size={16} />
          </button>
        </>
      ) : (
        <p className="mi-success" role="status">
          <Check size={16} />
          这些小块叫 Token；它不一定等于一个字或一个词。
        </p>
      )}
      <p className="mi-simulation-note">
        实际 Token 切分由 tokenizer 决定。这里的 7 个小块是教学示意，不是真实 tokenizer 输出。
      </p>
    </div>
  )
}
