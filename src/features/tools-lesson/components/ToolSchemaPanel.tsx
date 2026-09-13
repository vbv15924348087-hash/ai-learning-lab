import { useId, useRef, useState } from 'react'
import { ArrowRight, BookOpen, Check, ChevronDown } from 'lucide-react'
import { ToolConceptCompare } from './ToolConceptCompare'
import { ToolWidgetHeader } from './ToolsWidgetUI'
import '../tools-widgets.css'

export function ToolSchemaPanel({ onComplete }: { onComplete: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [understood, setUnderstood] = useState(false)
  const completed = useRef(false)
  const contentId = useId()

  return (
    <section className="tl-widget tl-schema" aria-label="Tool Schema 说明书">
      <ToolWidgetHeader label="TOOL SCHEMA / 工具的说明书" title="模型怎么知道，搜索需要 query？">
        先有系统提供的说明书，模型才知道该怎样填写这份请求。
      </ToolWidgetHeader>
      <button
        type="button"
        className="tl-schema-trigger"
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={() => setExpanded(!expanded)}
      >
        <BookOpen size={20} aria-hidden="true" />
        <span>深入一点：为什么模型知道 Tool 需要哪些参数？ →</span>
        <ChevronDown size={17} aria-hidden="true" />
      </button>
      {expanded && (
        <div id={contentId} className="tl-schema-content">
          <div className="tl-schema-document">
            <div className="tl-code-heading">
              <span>
                <BookOpen size={15} aria-hidden="true" /> TOOL SCHEMA
              </span>
              <span>教学模拟 · 使用说明书</span>
            </div>
            <dl>
              <div>
                <dt>Tool Name</dt>
                <dd>
                  <code>web_search</code>
                </dd>
              </div>
              <div>
                <dt>Description</dt>
                <dd>搜索互联网</dd>
              </div>
              <div>
                <dt>Arguments</dt>
                <dd>
                  <code>query: string</code>
                  <small>需要一个名为 query 的文本参数</small>
                </dd>
              </div>
            </dl>
          </div>
          <p className="tl-schema-explanation">
            系统会提前把这份 <strong>Tool Schema</strong>{' '}
            提供给模型。模型看到工具名称、用途和参数格式，才能构造相应的 Tool Call。
          </p>
          <ToolConceptCompare />
          <details className="tl-technical-details">
            <summary>
              查看技术解释 → <span>参数名称和类型如何约束请求</span>
            </summary>
            <p>
              Arguments / Parameters 指调用工具时需要提供的输入信息。这里 query 的类型是
              string，表示它应该是一段文本。实际系统常用 JSON Schema 描述参数，下面是简化教学示意。
            </p>
            <pre className="tl-generated-json">
              <code>
                {JSON.stringify(
                  {
                    name: 'web_search',
                    description: '搜索互联网',
                    parameters: {
                      type: 'object',
                      properties: { query: { type: 'string' } },
                      required: ['query'],
                    },
                  },
                  null,
                  2,
                )}
              </code>
            </pre>
          </details>
          {!understood ? (
            <button
              type="button"
              className="button button-primary tl-widget-action"
              onClick={() => {
                setUnderstood(true)
                if (!completed.current) {
                  completed.current = true
                  onComplete()
                }
              }}
            >
              我明白了：说明书与本次请求不同
              <ArrowRight size={15} aria-hidden="true" />
            </button>
          ) : (
            <p className="tl-widget-complete" role="status">
              <Check size={16} aria-hidden="true" />
              Schema 说明怎么用；Call 填入这一次的具体内容。
            </p>
          )}
        </div>
      )}
    </section>
  )
}
