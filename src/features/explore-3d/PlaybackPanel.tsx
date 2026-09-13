import { ArrowLeft, ArrowRight, Pause, Play, RotateCcw, X } from 'lucide-react'
import { taskSteps, tourStops } from './data'
import type { ExploreMode, ExploreTaskStep, ExploreTourStop } from './types'

type Props = {
  mode: ExploreMode
  taskStep: number
  tourStep: number
  currentTask: ExploreTaskStep
  currentStop: ExploreTourStop
  playing: boolean
  reducedMotion: boolean
  onTask: (index: number) => void
  onTour: (index: number) => void
  onToggle: () => void
  onExit: () => void
}
export function PlaybackPanel(props: Props) {
  if (props.mode === 'free') return null
  const task = props.mode === 'task'
  const index = task ? props.taskStep : props.tourStep
  const steps = task ? taskSteps : tourStops
  const move = task ? props.onTask : props.onTour
  return (
    <section
      className={`ex3-playback ${task && props.currentTask.outcome ? `is-${props.currentTask.outcome}` : ''}`}
      aria-label={task ? '任务模拟' : '系统导览'}
    >
      <div className="ex3-playback-top">
        <span>{task ? 'RUN A TASK · 教学模拟' : 'GUIDED EXPLORE · 系统导览'}</span>
        <button aria-label="退出导览或任务，回到自由探索" onClick={props.onExit}>
          <X size={15} />
        </button>
      </div>
      <div className="ex3-playback-main">
        <span className="ex3-step-number">
          {String(index + 1).padStart(2, '0')}
          <small>/ {steps.length}</small>
        </span>
        <div aria-live={props.playing ? 'off' : 'polite'}>
          <h2>{task ? props.currentTask.title : props.currentStop.title}</h2>
          <p>{task ? props.currentTask.explanation : props.currentStop.explanation}</p>
          {task ? (
            <span className="ex3-payload">{props.currentTask.message}</span>
          ) : (
            <strong className="ex3-tour-question">想一想：{props.currentStop.question}</strong>
          )}
        </div>
      </div>
      <div className="ex3-timeline" role="group" aria-label={task ? '任务时间线' : '导览进度'}>
        {steps.map((step, i) => (
          <button
            key={i}
            className={i === index ? 'is-current' : i < index ? 'is-past' : ''}
            aria-label={`${task ? '任务' : '导览'}第 ${i + 1} 步：${step.title}`}
            aria-current={i === index ? 'step' : undefined}
            title={step.title}
            onClick={() => move(i)}
          >
            <span>{i + 1}</span>
          </button>
        ))}
      </div>
      <div className="ex3-playback-controls">
        <button onClick={() => move(0)} aria-label="重播，从第一步开始">
          <RotateCcw size={14} /> 重播
        </button>
        <div>
          <button onClick={() => move(index - 1)} disabled={index === 0}>
            <ArrowLeft size={15} /> 上一步
          </button>
          {task && !props.reducedMotion && (
            <button className="ex3-primary" onClick={props.onToggle}>
              {props.playing ? <Pause size={14} /> : <Play size={14} />}{' '}
              {props.playing ? '暂停' : index === steps.length - 1 ? '重新播放' : '播放'}
            </button>
          )}
          <button onClick={() => move(index + 1)} disabled={index === steps.length - 1}>
            下一步 <ArrowRight size={15} />
          </button>
        </div>
      </div>
      {props.reducedMotion && task && (
        <p className="ex3-small">已跟随“减少动态效果”设置，使用上一步、下一步查看完整过程。</p>
      )}
      {index === steps.length - 1 && (
        <p className="ex3-finish">
          {task
            ? '检查通过，再交付结果。你已经走过一次完整的信息与行动闭环。'
            : '现在你可以自由旋转系统，或运行一次任务，看看这些部分如何协作。'}
        </p>
      )}
    </section>
  )
}
