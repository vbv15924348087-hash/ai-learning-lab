import { CircleCheck, Copy, FileText, ListFilter } from 'lucide-react'
import type { ContextSourceId } from '../types'
import { ContextWorkbench } from './ContextWorkbench'

const noise = [
  { title: '20 篇无关文章', detail: '主题与 GPU 无关' },
  { title: '三年前的旧聊天', detail: '无法帮助当前回答' },
  { title: '重复网页', detail: '同一内容再放一次' },
  { title: '香港旅游攻略', detail: '与这次任务无关' },
  { title: '其他项目的要求', detail: '本次不需要' },
  { title: '重复工具结果', detail: '没有带来新信息' },
]

export function ContextComparison({
  noisy,
  onSetNoisy,
  selectedSource,
  onSelectSource,
}: {
  noisy: boolean
  onSetNoisy: (value: boolean) => void
  selectedSource: ContextSourceId | null
  onSelectSource: (id: ContextSourceId) => void
}) {
  return (
    <div className={`ctx-comparison${noisy ? ' is-noisy' : ''}`}>
      <div className="ctx-comparison-toggle" role="group" aria-label="比较两种 Context">
        <button type="button" aria-pressed={!noisy} onClick={() => onSetNoisy(false)}>
          <ListFilter size={15} aria-hidden="true" />
          精简相关
        </button>
        <button type="button" aria-pressed={noisy} onClick={() => onSetNoisy(true)}>
          <Copy size={15} aria-hidden="true" />
          加入无关信息
        </button>
      </div>
      <ContextWorkbench
        items={['prompt', 'rag', 'result']}
        selectedSource={selectedSource}
        onSelectSource={onSelectSource}
        additionalItems={noisy ? noise.length : 0}
        compact
      >
        {noisy &&
          noise.map((item) => (
            <div className="ctx-noise-card" key={item.title}>
              <span>
                <FileText size={13} aria-hidden="true" />
                <strong>{item.title}</strong>
              </span>
              <small>{item.detail}</small>
            </div>
          ))}
      </ContextWorkbench>
      <div className="ctx-comparison-feedback" aria-live="polite" aria-atomic="true">
        <strong>
          <CircleCheck size={16} aria-hidden="true" />
          {noisy ? '信息增加了，有用的信息没有增加。' : '相关 · 清晰 · 有用'}
        </strong>
        <p>
          {noisy
            ? '额外的资料占用容量，还可能让重点变得不清楚。先问：它能帮助回答 NVIDIA GPU 的问题吗？'
            : '用户问题、相关的 NVIDIA 资料、必要的搜索结果，围绕同一个任务排列。'}
        </p>
      </div>
    </div>
  )
}
