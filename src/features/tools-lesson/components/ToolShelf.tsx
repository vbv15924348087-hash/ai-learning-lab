import { useRef, useState } from 'react'
import { toolDefinitions, type TeachingToolId } from '../data/toolDefinitions'
import { ToolCard, ToolFeedback, ToolInteractionHint, ToolWidgetHeader } from './ToolsWidgetUI'
import '../tools-widgets.css'

export function ToolShelf({ onComplete }: { onComplete: () => void }) {
  const [selected, setSelected] = useState<TeachingToolId | null>(null)
  const completed = useRef(false)
  const selection = toolDefinitions.find((tool) => tool.id === selected)

  function selectTool(id: TeachingToolId) {
    setSelected(id)
    if (id === 'web_search' && !completed.current) {
      completed.current = true
      onComplete()
    }
  }

  return (
    <section className="tl-widget tl-shelf" aria-label="工具架">
      <ToolWidgetHeader label="TOOL SHELF / 外部能力" title="这件事，可以请谁帮忙？">
        Tool 是模型可以请求使用的外部能力。系统提供了这些工具，模型才能从中选择。
      </ToolWidgetHeader>
      <div className="tl-widget-task">
        <span>当前任务</span>
        <p>帮我查 NVIDIA 最新的 AI GPU</p>
      </div>
      <ToolInteractionHint>试试看：选择一个最适合获取「最新信息」的 Tool</ToolInteractionHint>
      <div className="tl-tool-grid">
        {toolDefinitions.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            selected={selected === tool.id}
            onSelect={selectTool}
            pulse={tool.id === 'web_search' && selected === null}
          />
        ))}
      </div>
      {selection ? (
        <ToolFeedback success={selected === 'web_search'}>
          {selection.selectionExplanation}
        </ToolFeedback>
      ) : (
        <p className="tl-widget-note">每张卡片都可以点击，也可以用 Tab 和 Enter 选择。</p>
      )}
      <p className="tl-widget-note">当前只是选择工具；搜索还没有发生。</p>
    </section>
  )
}
