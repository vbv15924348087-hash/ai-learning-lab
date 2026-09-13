import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowRight, Check, Pause, Play, Plus, RotateCcw } from 'lucide-react'
import {
  candidatesForStep,
  generationSteps,
  predictionPrompt,
  scoreCandidates,
  type SimulatedCandidate,
} from '../data/predictionDemoData'
import '../model-interactions.css'

export type TokenPredictionDemoProps = {
  mode: 'scores' | 'generation'
  onComplete?: () => void
}

function CandidateBars({ candidates }: { candidates: SimulatedCandidate[] }) {
  return (
    <ul className="mi-candidate-bars" aria-label="候选 Token 的教学模拟分数，高低不代表真实模型">
      {candidates.map((candidate, index) => (
        <li key={candidate.label}>
          <span className="mi-candidate-label">
            {candidate.label}
            {candidate.token && <strong>{candidate.token.trim()}</strong>}
          </span>
          <span className="mi-candidate-track" aria-hidden="true">
            <span style={{ width: `${candidate.score * 10}%` }} />
          </span>
          <span className="mi-candidate-rank">{['较高', '中等', '较低', '较低'][index]}</span>
        </li>
      ))}
    </ul>
  )
}

export function TokenPredictionDemo({ mode, onComplete }: TokenPredictionDemoProps) {
  const [count, setCount] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const notified = useRef(false)
  const complete = count === generationSteps.length
  const generatedTokens = generationSteps.slice(0, count)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      setReducedMotion(media.matches)
      if (media.matches) setPlaying(false)
    }
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.hidden) setPlaying(false)
    }
    document.addEventListener('visibilitychange', pauseWhenHidden)
    return () => document.removeEventListener('visibilitychange', pauseWhenHidden)
  }, [])

  useEffect(() => {
    if (mode !== 'generation' || !playing || reducedMotion || complete || document.hidden) return
    const timer = window.setTimeout(
      () => setCount((current) => Math.min(current + 1, generationSteps.length)),
      1400,
    )
    return () => window.clearTimeout(timer)
  }, [mode, playing, reducedMotion, complete, count])

  useEffect(() => {
    if (complete && !notified.current) {
      notified.current = true
      onComplete?.()
    }
  }, [complete, onComplete])

  if (mode === 'scores') {
    return (
      <div className="mi-prediction-demo">
        <p className="mi-simulation-label">教学模拟 · 候选与分数均为示意，不来自真实模型</p>
        <div className="mi-interaction-intro">
          <span className="eyebrow">先给下一步打分</span>
          <h3>接下来，可能出现什么？</h3>
          <p>多层计算之后，模型会给下一步可能出现的 Token 打分。</p>
        </div>
        <div className="mi-prediction-context">
          <span>主案例的已有输出 · 教学示意</span>
          <p>
            NVIDIA 的最新 AI GPU <span className="mi-next-slot">？</span>
          </p>
        </div>
        <div className="mi-candidate-panel">
          <p className="mi-observation-label">下一 Token 的候选分数</p>
          <CandidateBars candidates={scoreCandidates} />
          <p className="mi-chart-caption">条越长，表示本图中分数越高；分数不等于事实正确率。</p>
        </div>
        <p className="mi-interaction-takeaway">
          这些分数描述的是<strong>“下一步可能接什么”</strong>。接下来，看看选出的 Token
          怎样加入回答。
        </p>
      </div>
    )
  }

  return (
    <div className="mi-prediction-demo">
      <p className="mi-simulation-label">
        教学模拟 · Token 切分、候选和分数均为示意；本演示按预设路径生成
      </p>
      <div className="mi-interaction-intro">
        <span className="eyebrow">一次，加入一个 Token</span>
        <h3>回答是怎样一点点长出来的？</h3>
        <p>点击按钮，观察输出增加一小块，下一轮的候选也随之变化。</p>
      </div>
      <div className="mi-generation-grid">
        <div className="mi-generation-main">
          <div className="mi-prediction-context">
            <span>已有 Context · 用户问题</span>
            <p>{predictionPrompt}</p>
          </div>
          <div className="mi-generated-output">
            <div className="mi-output-heading">
              <span>累积输出</span>
              <span>
                {count} / {generationSteps.length} Token
              </span>
            </div>
            <p aria-label="当前生成的回答" aria-live="polite" aria-atomic="true">
              {count === 0 ? (
                <span className="mi-output-placeholder">等待生成第一个 Token…</span>
              ) : (
                generatedTokens.map((step, index) => (
                  <span key={index} className={index === count - 1 ? 'mi-new-token' : undefined}>
                    {step.token}
                  </span>
                ))
              )}
            </p>
            <span className="mi-output-caption">
              {complete
                ? '本次教学示例已结束。'
                : count > 0
                  ? '刚加入的蓝色 Token，会一起进入下一轮计算。'
                  : '当前还没有输出，模型先根据已有 Context 计算。'}
            </span>
          </div>
          <div className="mi-candidate-panel">
            <p className="mi-observation-label">
              {complete ? '本轮生成完成' : `第 ${count + 1} 轮 · 下一 Token 候选`}
            </p>
            {complete ? (
              <div className="mi-generation-done">
                <Check size={23} aria-hidden="true" />
                <strong>你刚刚看见了 {generationSteps.length} 次“生成 → 加入 → 再计算”</strong>
                <p>真实生成会根据上下文和生成规则继续，直到结束条件满足。</p>
              </div>
            ) : (
              <>
                <CandidateBars candidates={candidatesForStep(count)} />
                <p className="mi-chart-caption">
                  此演示下一步加入候选 A；真实生成还取决于采样等规则。
                </p>
              </>
            )}
          </div>
        </div>
        <div className="mi-generation-loop" aria-label="逐 Token 生成循环">
          <span className="mi-loop-heading">每一步，都重新经过这个循环</span>
          <div className="mi-loop-node">
            <span>01</span>
            <strong>
              已有 Context
              <br />＋ 已生成内容
            </strong>
          </div>
          <ArrowDown size={17} aria-hidden="true" />
          <div className="mi-loop-node">
            <span>02</span>
            <strong>Model 计算</strong>
          </div>
          <ArrowDown size={17} aria-hidden="true" />
          <div className="mi-loop-node">
            <span>03</span>
            <strong>预测下一个 Token</strong>
          </div>
          <ArrowDown size={17} aria-hidden="true" />
          <div className={`mi-loop-node ${count > 0 ? 'is-active' : ''}`}>
            <span>04</span>
            <strong>加入当前输出</strong>
          </div>
          <div className="mi-loop-repeat">
            <RotateCcw size={14} aria-hidden="true" />
            <span>带着新内容，再来一轮</span>
          </div>
        </div>
      </div>
      <div className="mi-demo-controls">
        <button
          type="button"
          className="button button-primary"
          disabled={complete}
          onClick={() => {
            setPlaying(false)
            setCount((current) => Math.min(current + 1, generationSteps.length))
          }}
        >
          <Plus size={16} aria-hidden="true" />
          生成下一个 Token
        </button>
        {!reducedMotion && (
          <button
            type="button"
            className="button button-secondary"
            disabled={complete}
            onClick={() => setPlaying((value) => !value)}
          >
            {playing && !complete ? (
              <Pause size={15} aria-hidden="true" />
            ) : (
              <Play size={15} aria-hidden="true" />
            )}
            {playing && !complete ? '暂停' : '自动演示'}
          </button>
        )}
        <button
          type="button"
          className="mi-demo-reset"
          onClick={() => {
            setPlaying(false)
            setCount(0)
          }}
        >
          <RotateCcw size={14} aria-hidden="true" />
          重新开始
        </button>
      </div>
      {reducedMotion && (
        <p className="mi-chart-caption">
          已遵循减少动态效果设置：点击“生成下一个 Token”，逐步观察完整过程。
        </p>
      )}
      <p className="mi-interaction-takeaway">
        <strong>模型不是先把完整回答写好，再一次吐出来。</strong>
        <br />
        <span>
          生成一个 Token <ArrowRight size={12} aria-hidden="true" /> 加入当前上下文{' '}
          <ArrowRight size={12} aria-hidden="true" /> 再计算下一个。
        </span>
      </p>
    </div>
  )
}
