import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Pause, Play, RotateCcw } from 'lucide-react'
import type { ChapterVisualProps } from '../curriculum/types'
import { SystemDiagram } from './SystemDiagram'
import { TerminologyGraph } from './TerminologyGraph'
import { taskTrace } from './concepts'

export function TaskWalkthrough({ onComplete }: { onComplete?: () => void }) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [reduced, setReduced] = useState(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  )
  const last = index === taskTrace.length - 1
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const change = () => {
      setReduced(Boolean(media?.matches))
      if (media?.matches) setPlaying(false)
    }
    const visibility = () => {
      if (document.hidden) setPlaying(false)
    }
    media?.addEventListener('change', change)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      media?.removeEventListener('change', change)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [])
  useEffect(() => {
    if (!playing || reduced || last) return
    const timer = window.setTimeout(() => setIndex((value) => value + 1), 3200)
    return () => window.clearTimeout(timer)
  }, [playing, index, reduced, last])
  return (
    <div className="fsm-walkthrough">
      <div className="fsm-event" role="status">
        <span>
          {String(index + 1).padStart(2, '0')} / {taskTrace.length}
        </span>
        <div>
          <h3>{taskTrace[index].label}</h3>
          <p>{taskTrace[index].detail}</p>
        </div>
      </div>
      <div className="fsm-event-controls">
        <button
          className="cr-secondary"
          disabled={index === 0}
          onClick={() => {
            setPlaying(false)
            setIndex(index - 1)
          }}
        >
          <ArrowLeft size={15} />
          上一事件
        </button>
        <button
          className="cr-action"
          onClick={() => {
            setPlaying(false)
            if (last) onComplete?.()
            else setIndex(index + 1)
          }}
        >
          {last ? '确认：完整任务已复盘' : '下一事件'}
          <ArrowRight size={15} />
        </button>
        {!reduced && !last && (
          <button className="cr-secondary" onClick={() => setPlaying(!playing)}>
            {playing ? <Pause size={15} /> : <Play size={15} />} {playing ? '暂停' : '自动播放'}
          </button>
        )}
        <button
          className="cr-secondary"
          onClick={() => {
            setPlaying(false)
            setIndex(0)
          }}
        >
          <RotateCcw size={15} />
          重播
        </button>
      </div>
      {reduced && <p className="cr-caption">减少动态效果已启用，使用下一事件查看全部流程。</p>}
      <SystemDiagram key={index} initialExpanded activeNode={taskTrace[index].node} />
    </div>
  )
}

function ResponsibilityMatch({ onComplete }: Pick<ChapterVisualProps, 'onComplete'>) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)
  const roles = [
    { id: 'context', label: '准备本次相关信息', answer: 'Context Engineering' },
    { id: 'model', label: '依据当前信息决定下一步', answer: 'Model' },
    { id: 'harness', label: '调度工具、维护循环与权限', answer: 'Harness' },
  ]
  const correct = roles.every((role) => answers[role.id] === role.answer)
  return (
    <div className="fsm-synthesis">
      <p className="eyebrow">THREE RESPONSIBILITIES, ONE SYSTEM</p>
      <h3>让系统完整运转，需要三类职责。</h3>
      <div className="fsm-role-grid">
        {roles.map((role, index) => (
          <label key={role.id}>
            <span>0{index + 1}</span>
            <strong>{role.label}</strong>
            <select
              aria-label={role.label}
              value={answers[role.id] ?? ''}
              onChange={(event) => {
                setAnswers({ ...answers, [role.id]: event.target.value })
                setChecked(false)
              }}
            >
              <option value="">选择负责的部分</option>
              {['Model', 'Context Engineering', 'Harness'].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <button
        className="cr-action"
        onClick={() => {
          setChecked(true)
          if (correct) onComplete()
        }}
      >
        检查职责分工 →
      </button>
      {checked && (
        <p className="cr-result" role="status">
          {correct
            ? '对应正确。接下来用一份报告任务，检查你是否能自己判断每一处信息与行动。'
            : '再对照：Context Engineering 准备信息，Model 决定，Harness 承载执行和持续运行。'}
        </p>
      )}
    </div>
  )
}

export default function ChapterVisual({ step, onComplete }: ChapterVisualProps) {
  const [inspected, setInspected] = useState<string[]>([])
  const [groups, setGroups] = useState<string[]>([])
  if (step === 0)
    return (
      <>
        <SystemDiagram
          onInspect={(id) => {
            const next = [...new Set([...inspected, id])]
            setInspected(next)
            if (['context', 'model', 'harness', 'verifier'].every((key) => next.includes(key)))
              onComplete()
          }}
        />
        <p className="cr-hint">
          查看四个关键节点：
          {[
            ['context', 'Context'],
            ['model', 'Model'],
            ['harness', 'Harness'],
            ['verifier', 'Verification'],
          ]
            .map(([id, label]) => `${inspected.includes(id) ? '✓' : '○'} ${label}`)
            .join('　')}
        </p>
      </>
    )
  if (step === 1) return <TaskWalkthrough onComplete={onComplete} />
  if (step === 2)
    return (
      <>
        <TerminologyGraph
          onInspect={(group) => {
            const next = [...new Set([...groups, group])]
            setGroups(next)
            if (['Context', 'Model', 'Tools', 'Runtime'].every((key) => next.includes(key)))
              onComplete()
          }}
        />
        <p className="cr-hint">
          分别查看四组中的概念：
          {['Context', 'Model', 'Tools', 'Runtime']
            .map((group) => `${groups.includes(group) ? '✓' : '○'} ${group}`)
            .join('　')}
        </p>
      </>
    )
  return <ResponsibilityMatch onComplete={onComplete} />
}
