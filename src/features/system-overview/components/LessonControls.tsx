import { ArrowLeft, ArrowRight, Pause, Play, RotateCcw } from 'lucide-react'
import { DEMO_START_STEP, OVERVIEW_STEP_COUNT } from '../types'

type Props = {
  currentStep: number
  playing: boolean
  blocked: boolean
  lastStep: boolean
  onPrevious: () => void
  onNext: () => void
  onToggle: () => void
  onRestart: () => void
  totalSteps?: number
  demoStartStep?: number | null
}

export function LessonControls({
  currentStep,
  playing,
  blocked,
  lastStep,
  onPrevious,
  onNext,
  onToggle,
  onRestart,
  totalSteps = OVERVIEW_STEP_COUNT,
  demoStartStep = DEMO_START_STEP,
}: Props) {
  const inDemo = demoStartStep !== null && currentStep >= demoStartStep && !lastStep
  return (
    <div className="so-controls" aria-label="课程播放控制">
      <div className="so-controls-left">
        <button className="so-control-button" onClick={onRestart} aria-label="重新开始">
          <RotateCcw size={16} />
          <span>重新开始</span>
        </button>
        <span className="so-controls-divider" />
        <span className="so-control-count">
          {inDemo
            ? `流程 ${currentStep - demoStartStep! + 1} / 9`
            : `${String(currentStep + 1).padStart(2, '0')} / ${totalSteps}`}
        </span>
      </div>
      <div className="so-controls-actions">
        <button
          className="so-control-button so-previous"
          onClick={onPrevious}
          disabled={currentStep === 0}
        >
          <ArrowLeft size={16} />
          <span>上一步</span>
        </button>
        <button
          className={`so-control-button so-play ${playing ? 'is-playing' : ''}`}
          onClick={onToggle}
          disabled={blocked || lastStep}
          aria-label={playing ? '暂停' : '自动播放'}
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
          <span>{playing ? '暂停' : '自动播放'}</span>
        </button>
        {lastStep ? (
          <a href="#mini-challenge" className="button button-primary so-next">
            开始小挑战 <ArrowRight size={16} />
          </a>
        ) : (
          <button className="button button-primary so-next" onClick={onNext} disabled={blocked}>
            下一步 <ArrowRight size={16} />
          </button>
        )}
      </div>
      <p className="so-control-hint">
        {blocked
          ? '先完成本步互动，再一起向下探索。'
          : playing
            ? '每 7.5 秒前进一步 · 可随时暂停'
            : '按自己的节奏，慢慢看懂每一步。'}
      </p>
    </div>
  )
}
