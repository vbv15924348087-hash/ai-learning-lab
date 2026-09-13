import { useId, useRef, useState, type FormEvent } from 'react'
import { ArrowRight, Braces, WandSparkles } from 'lucide-react'
import {
  builderToolDefinitions,
  toolDefinitions,
  type TeachingToolId,
} from '../data/toolDefinitions'
import { ToolCard, ToolFeedback, ToolInteractionHint, ToolWidgetHeader } from './ToolsWidgetUI'
import '../tools-widgets.css'

export function ToolCallBuilder({ onComplete }: { onComplete: () => void }) {
  const [selected, setSelected] = useState<TeachingToolId | null>(null)
  const [argument, setArgument] = useState('')
  const [error, setError] = useState('')
  const [generated, setGenerated] = useState<{
    json: string
    success: boolean
    feedback: string
  } | null>(null)
  const completed = useRef(false)
  const parameterInputId = useId()
  const definition = builderToolDefinitions.find((tool) => tool.toolId === selected)

  function selectTool(id: TeachingToolId) {
    setSelected(id)
    setArgument('')
    setError('')
    setGenerated(null)
  }

  function generateCall(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!definition) {
      setError('先选择一个工具，让系统知道你想调用谁。')
      return
    }
    if (!argument.trim()) {
      setError(
        `请填写 ${definition.parameterLabel}（${definition.parameter}），工具需要知道这次要处理什么。`,
      )
      setGenerated(null)
      return
    }
    const success = selected === 'web_search'
    setError('')
    setGenerated({
      json: JSON.stringify({ tool: selected, [definition.parameter]: argument.trim() }, null, 2),
      success,
      feedback: success
        ? '你刚刚亲手完成了一次 Function Calling：用结构化格式生成了一个搜索请求。'
        : definition.mismatch,
    })
    if (success && !completed.current) {
      completed.current = true
      onComplete()
    }
  }

  return (
    <section className="tl-widget tl-builder" aria-label="Function Call Builder">
      <ToolWidgetHeader label="FUNCTION CALL BUILDER / 亲手构建" title="来，写一份模型的工具请求。">
        只需要两件事：选工具，再告诉它这次要处理什么。
      </ToolWidgetHeader>
      <div className="tl-widget-task">
        <span>你的任务</span>
        <p>查 NVIDIA 最新 AI GPU</p>
      </div>
      <form onSubmit={generateCall} noValidate>
        <div className="tl-builder-step">
          <span>A</span>
          <strong>选择 Tool</strong>
        </div>
        <div className="tl-tool-grid tl-tool-grid-three">
          {builderToolDefinitions.map((item) => {
            const tool = toolDefinitions.find((tool) => tool.id === item.toolId)!
            return (
              <ToolCard
                key={tool.id}
                tool={tool}
                selected={selected === tool.id}
                onSelect={selectTool}
                compact
              />
            )
          })}
        </div>
        <div className="tl-builder-step">
          <span>B</span>
          <strong>填写参数</strong>
          {definition && <code>{definition.parameter}: string</code>}
        </div>
        {definition ? (
          <div className="tl-builder-argument">
            <label htmlFor={parameterInputId}>
              {definition.parameterLabel} <code>{definition.parameter}</code>
            </label>
            <div className="tl-builder-input-row">
              <input
                id={parameterInputId}
                value={argument}
                placeholder={definition.placeholder}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${parameterInputId}-error` : `${parameterInputId}-hint`}
                autoComplete="off"
                onChange={(event) => {
                  setArgument(event.target.value)
                  setError('')
                  setGenerated(null)
                }}
              />
              <button
                type="button"
                className="tl-example-button"
                onClick={() => {
                  setArgument(definition.example)
                  setError('')
                  setGenerated(null)
                }}
              >
                <WandSparkles size={13} aria-hidden="true" />
                填入示例
              </button>
            </div>
            <p id={`${parameterInputId}-hint`} className="tl-widget-note">
              {definition.explanation}
            </p>
          </div>
        ) : (
          <div className="tl-builder-argument-empty">先选择上方工具，这里会出现它需要的参数。</div>
        )}
        {error && (
          <p id={`${parameterInputId}-error`} className="tl-builder-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="button button-primary tl-widget-action">
          <Braces size={16} aria-hidden="true" />
          生成 Tool Call
          <ArrowRight size={15} aria-hidden="true" />
        </button>
      </form>
      {generated ? (
        <div className="tl-call-reveal">
          <div className="tl-code-heading">
            <span>生成的请求</span>
            <span>教学模拟 · JSON 示意</span>
          </div>
          <pre className="tl-generated-json" aria-label="生成的 Tool Call">
            <code>{generated.json}</code>
          </pre>
          <ToolFeedback success={generated.success}>{generated.feedback}</ToolFeedback>
        </div>
      ) : (
        <ToolInteractionHint>选好工具、填写参数后，点击「生成 Tool Call」</ToolInteractionHint>
      )}
      <p className="tl-widget-note">
        本练习只生成教学请求，不会联网、读取文件或运行代码。Tool Call 仍需要交给 Harness
        才会被执行。
      </p>
    </section>
  )
}
