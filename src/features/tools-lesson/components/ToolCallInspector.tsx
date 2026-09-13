import { useRef, useState } from 'react'
import { ArrowDown, ArrowRight, Check, Braces } from 'lucide-react'
import { ToolInteractionHint, ToolWidgetHeader } from './ToolsWidgetUI'
import '../tools-widgets.css'

type CallField = 'tool' | 'query'

const fieldDescriptions = {
  tool: {
    title: 'tool → 这次调用哪个工具',
    text: '指定这一次要调用哪个 Tool。web_search 是系统提供的搜索工具名称。',
  },
  query: {
    title: 'query → 把什么参数交给工具',
    text: '指定传给 Tool 的参数。这里的 query 是搜索词：NVIDIA latest AI GPU。',
  },
}

export function ToolCallInspector({ onComplete }: { onComplete: () => void }) {
  const [converted, setConverted] = useState(false)
  const [activeField, setActiveField] = useState<CallField | null>(null)
  const [seen, setSeen] = useState<CallField[]>([])
  const completed = useRef(false)

  function inspect(field: CallField) {
    setActiveField(field)
    const nextSeen = seen.includes(field) ? seen : [...seen, field]
    setSeen(nextSeen)
    if (nextSeen.length === 2 && !completed.current) {
      completed.current = true
      onComplete()
    }
  }

  return (
    <section className="tl-widget tl-inspector" aria-label="Tool Call 拆解器">
      <ToolWidgetHeader
        label="FUNCTION CALLING / 从决定到请求"
        title="决定搜索之后，模型怎样告诉系统？"
      >
        把「用哪个工具」和「传什么参数」写成结构化请求。
      </ToolWidgetHeader>
      <div className={`tl-natural-language${converted ? ' tl-natural-language-converted' : ''}`}>
        <span>MODEL 的决定 · 自然语言</span>
        <p>“帮我搜索 NVIDIA 最新 AI GPU”</p>
      </div>
      <div className="tl-conversion-arrow">
        <ArrowDown size={22} aria-hidden="true" />
        <span>{converted ? 'Function Calling · 生成结构化请求' : '把这个决定写得明确一些'}</span>
      </div>
      {!converted ? (
        <>
          <div className="tl-call-placeholder">
            <Braces size={30} aria-hidden="true" />
            <p>一个工具名称 + 这次调用的参数</p>
          </div>
          <button
            type="button"
            className="button button-primary tl-widget-action"
            onClick={() => setConverted(true)}
          >
            转换成 Tool Call
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </>
      ) : (
        <div className="tl-call-reveal">
          <div className="tl-code-heading">
            <span>TOOL CALL</span>
            <span>教学模拟 · JSON 示意</span>
          </div>
          <div className="tl-inspect-json" aria-label="结构化 Tool Call">
            <span>{'{'}</span>
            <div>
              <button
                type="button"
                className="tl-code-key"
                aria-label="查看 tool 字段含义"
                aria-pressed={activeField === 'tool'}
                onClick={() => inspect('tool')}
              >
                "tool"
              </button>
              <span>: </span>
              <span className="tl-code-value">"web_search"</span>
              <span>,</span>
              {seen.includes('tool') && (
                <Check className="tl-field-check" size={13} aria-label="已查看" />
              )}
            </div>
            <div>
              <button
                type="button"
                className="tl-code-key"
                aria-label="查看 query 字段含义"
                aria-pressed={activeField === 'query'}
                onClick={() => inspect('query')}
              >
                "query"
              </button>
              <span>: </span>
              <span className="tl-code-value">"NVIDIA latest AI GPU"</span>
              {seen.includes('query') && (
                <Check className="tl-field-check" size={13} aria-label="已查看" />
              )}
            </div>
            <span>{'}'}</span>
          </div>
          <ToolInteractionHint>
            点击字段查看含义：tool 和 query · 已查看 {seen.length} / 2
          </ToolInteractionHint>
          <div className="tl-field-explanation" aria-live="polite">
            {activeField ? (
              <>
                <strong>{fieldDescriptions[activeField].title}</strong>
                <p>{fieldDescriptions[activeField].text}</p>
              </>
            ) : (
              <p>先点击上方带边框的字段，看看这份请求由什么组成。</p>
            )}
          </div>
          <div className="tl-widget-takeaway">
            <strong>Function Calling</strong> 是模型生成结构化工具调用请求的能力。
            <br />
            这份 <strong>Tool Call</strong> 是本次请求；搜索还没有执行。
          </div>
        </div>
      )}
    </section>
  )
}
