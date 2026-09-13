import { useRef, useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { toolDefinitions, type TeachingToolId } from '../data/toolDefinitions'
import { toolMatchingTasks } from '../data/toolTasks'
import { ToolCard, ToolFeedback, ToolInteractionHint, ToolWidgetHeader } from './ToolsWidgetUI'
import '../tools-widgets.css'

const matchingTools = toolDefinitions.filter((tool) =>
  ['web_search', 'run_code', 'read_file'].includes(tool.id),
)

export function ToolMatchingChallenge({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<TeachingToolId | null>(null)
  const [finished, setFinished] = useState(false)
  const completed = useRef(false)
  const task = toolMatchingTasks[index]
  const correct = selected === task.correctTool
  const chosen = toolDefinitions.find((tool) => tool.id === selected)

  function nextTask() {
    if (!correct) return
    if (index < toolMatchingTasks.length - 1) {
      setIndex(index + 1)
      setSelected(null)
    } else {
      setFinished(true)
      if (!completed.current) {
        completed.current = true
        onComplete()
      }
    }
  }

  return (
    <section className="tl-widget tl-matching" aria-label="工具匹配练习">
      <ToolWidgetHeader label="QUICK PRACTICE / 工具匹配" title="不同任务，需要不同的外部能力。">
        做三次选择，先看任务缺少什么。
      </ToolWidgetHeader>
      <ol className="tl-match-progress" aria-label="匹配进度">
        {toolMatchingTasks.map((item, itemIndex) => (
          <li
            key={item.id}
            aria-current={!finished && itemIndex === index ? 'step' : undefined}
            className={finished || itemIndex < index ? 'tl-match-done' : ''}
          >
            <span>
              {finished || itemIndex < index ? (
                <Check size={13} aria-hidden="true" />
              ) : (
                itemIndex + 1
              )}
            </span>
            <span>{['最新信息', '精确计算', '文件内容'][itemIndex]}</span>
          </li>
        ))}
      </ol>
      {finished ? (
        <div className="tl-match-finished">
          <span>
            <Check size={26} aria-hidden="true" />
          </span>
          <h3>三种任务，都找到了合适的工具。</h3>
          <p>先判断需要哪种外部能力，再决定调用哪个 Tool。</p>
        </div>
      ) : (
        <>
          <div className="tl-widget-task">
            <span>
              任务 {String.fromCharCode(65 + index)} · {index + 1} / 3
            </span>
            <p>{task.prompt}</p>
          </div>
          <ToolInteractionHint>试试看：为这个任务选择一个 Tool</ToolInteractionHint>
          <div className="tl-tool-grid tl-tool-grid-three">
            {matchingTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                selected={selected === tool.id}
                onSelect={setSelected}
                disabled={correct}
                compact
              />
            ))}
          </div>
          {selected && (
            <ToolFeedback success={correct}>
              {correct
                ? task.explanation
                : `${chosen?.name} 的作用是${chosen?.description}${task.retryHint}`}
            </ToolFeedback>
          )}
          {correct && (
            <button
              type="button"
              className="button button-primary tl-widget-action"
              onClick={nextTask}
            >
              {index === toolMatchingTasks.length - 1 ? '完成工具匹配' : '下一题'}
              <ArrowRight size={15} aria-hidden="true" />
            </button>
          )}
        </>
      )}
    </section>
  )
}
