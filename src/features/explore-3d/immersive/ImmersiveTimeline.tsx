import { ArrowLeft, ArrowRight, Pause, Play, RotateCcw } from 'lucide-react'
import type { ExploreTaskStep } from '../types'
import type { ReactNode } from 'react'

export function ImmersiveTimeline({
  steps,
  index,
  playing,
  reducedMotion,
  onStep,
  onToggle,
  onRestart,
  explanation,
  blocked,
  children,
}: {
  steps: ExploreTaskStep[]
  index: number
  playing: boolean
  reducedMotion: boolean
  onStep: (index: number) => void
  onToggle: () => void
  onRestart?: () => void
  explanation?: string
  blocked?: boolean
  children?: ReactNode
}) {
  const step = steps[index]
  return (
    <section className="im3-timeline" aria-label="沉浸任务时间轴">
      <div className="im3-step-copy" aria-live={playing ? 'off' : 'polite'}>
        <span className="im3-step-count">
          {String(index + 1).padStart(2, '0')} <small>/ {steps.length}</small>
        </span>
        <div>
          <strong>{step.title}</strong>
          <p>{explanation ?? step.explanation}</p>
          <span className="im3-payload">{step.message}</span>
        </div>
        <span className={`im3-outcome ${step.outcome ?? ''}`}>
          {step.outcome === 'fail'
            ? '检查未通过'
            : step.outcome === 'pass'
              ? '检查通过'
              : '教学模拟'}
        </span>
      </div>
      {children}
      <div className="im3-timeline-controls">
        <button aria-label="从第一步重播" onClick={() => (onRestart ? onRestart() : onStep(0))}>
          <RotateCcw size={16} />
        </button>
        <button aria-label="任务上一步" disabled={index === 0} onClick={() => onStep(index - 1)}>
          <ArrowLeft size={16} />
        </button>
        {!reducedMotion && (
          <button className="im3-primary" onClick={onToggle} disabled={blocked}>
            {playing ? <Pause size={15} /> : <Play size={15} />}
            {playing ? '暂停' : index === steps.length - 1 ? '重新播放' : '播放'}
          </button>
        )}
        <label className="im3-scrubber">
          <span className="im3-sr">拖动时间轴选择步骤</span>
          <input
            type="range"
            aria-label="拖动时间轴选择步骤"
            min={1}
            max={steps.length}
            value={index + 1}
            aria-valuetext={`第 ${index + 1} 步：${step.title}`}
            onChange={(e) => onStep(Number(e.target.value) - 1)}
          />
        </label>
        <button
          aria-label="任务下一步"
          disabled={index === steps.length - 1 || blocked}
          onClick={() => onStep(index + 1)}
        >
          <ArrowRight size={16} />
        </button>
        <span className="im3-manual-hint">
          {reducedMotion ? '减少动态效果 · 手动切换' : '← → 切换 · 拖动选择'}
        </span>
      </div>
      <div className="im3-step-buttons" aria-label="选择任务步骤">
        {steps.map((entry, i) => (
          <button
            key={entry.id}
            aria-label={`第 ${i + 1} 步：${entry.title}`}
            aria-current={index === i ? 'step' : undefined}
            onClick={() => onStep(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </section>
  )
}
