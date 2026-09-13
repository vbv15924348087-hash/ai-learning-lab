import { ArrowLeft, ArrowRight, Check, Pause, Play, RotateCcw } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import { toolExecutionSteps } from '../data/toolExecutionSteps'
import { useToolExecution } from '../hooks/useToolExecution'
import '../tools-flow.css'

const positions = [
  [85, 94],
  [255, 94],
  [425, 94],
  [595, 94],
  [595, 276],
  [425, 276],
  [255, 276],
] as const

const connections = [
  { path: 'M 147 94 L 188 94', end: [178, 94] },
  { path: 'M 317 94 L 358 94', end: [348, 94] },
  { path: 'M 487 94 L 528 94', end: [518, 94] },
  { path: 'M 595 136 L 595 228', end: [595, 208] },
  { path: 'M 533 276 L 492 276', end: [503, 276] },
  { path: 'M 363 276 L 322 276', end: [333, 276] },
] as const

export function ToolExecutionFlow({ onComplete }: { onComplete: () => void }) {
  const flow = useToolExecution(onComplete)
  const markerId = useId().replace(/:/g, '')
  const connection = connections[flow.currentStep - 1]
  const packetMotion = useRef<SVGAnimateMotionElement>(null)

  useEffect(() => {
    if (!flow.reducedMotion) packetMotion.current?.beginElement?.()
  }, [flow.currentStep, flow.reducedMotion])

  return (
    <section className="tl-execution" aria-label="工具执行流程教学模拟">
      <div className="tl-flow-heading">
        <div>
          <span className="tl-flow-eyebrow">FOLLOW THE REQUEST</span>
          <h3>一次请求，怎样变成一次行动？</h3>
        </div>
        <span className="tl-simulation-tag">教学模拟 · 未联网</span>
      </div>
      <div className="tl-execution-visual">
        <svg
          viewBox="0 0 680 350"
          role="img"
          aria-label={`第 ${flow.currentStep + 1} 步：${flow.step.title}。完整顺序：Model → Tool Call → Harness → Web Search → Tool Result → Context → Model。`}
        >
          <defs>
            <marker
              id={`${markerId}-arrow`}
              markerWidth="6"
              markerHeight="6"
              refX="4"
              refY="3"
              orient="auto"
            >
              <path d="M 0 0 L 5 3 L 0 6" fill="none" stroke="context-stroke" strokeWidth="1.3" />
            </marker>
          </defs>
          <text x="23" y="24" className="tl-flow-lane-label">
            发出请求 → 交给系统执行
          </text>
          <text x="657" y="345" textAnchor="end" className="tl-flow-lane-label">
            读取新资料 ← 返回结果
          </text>
          {connections.map((edge, index) => (
            <path
              key={edge.path}
              d={edge.path}
              className={`tl-flow-edge${flow.currentStep === index + 1 ? ' tl-flow-edge-active' : ''}${flow.currentStep > index + 1 ? ' tl-flow-edge-past' : ''}`}
              markerEnd={`url(#${markerId}-arrow)`}
            />
          ))}
          {toolExecutionSteps.map((step, index) => {
            const [x, y] = positions[index]
            const active = flow.currentStep === index
            return (
              <g
                key={step.id}
                transform={`translate(${x}, ${y})`}
                className={`tl-flow-node${active ? ' tl-flow-node-active' : ''}${flow.currentStep > index ? ' tl-flow-node-past' : ''}`}
                data-node={step.id}
                data-active={active}
              >
                <rect x="-62" y="-42" width="124" height="84" rx="11" />
                <text y="-19" textAnchor="middle" className="tl-flow-node-index">
                  {String(index + 1).padStart(2, '0')}
                </text>
                <text y="4" textAnchor="middle" className="tl-flow-node-name">
                  {step.label}
                </text>
                <text y="26" textAnchor="middle" className="tl-flow-node-caption">
                  {step.caption}
                </text>
              </g>
            )
          })}
          <g className="tl-flow-responsibility-label" transform="translate(22, 247)">
            <text y="0">模型决定</text>
            <text y="22">Harness 执行</text>
            <text y="44">结果回到模型</text>
          </g>
          {connection && (
            <g
              key={flow.currentStep}
              className="tl-flow-packet"
              aria-hidden="true"
              transform={
                flow.reducedMotion
                  ? `translate(${connection.end[0]}, ${connection.end[1]})`
                  : undefined
              }
            >
              {!flow.reducedMotion && (
                <animateMotion
                  ref={packetMotion}
                  begin="indefinite"
                  path={connection.path}
                  dur="0.9s"
                  fill="freeze"
                />
              )}
              <rect x="-23" y="-10" width="46" height="20" rx="6" />
              <text y="4" textAnchor="middle">
                {flow.step.packetLabel}
              </text>
            </g>
          )}
        </svg>
      </div>
      <div className="tl-flow-explanation" aria-live="polite" aria-atomic="true">
        <span className="tl-flow-step-count">
          {String(flow.currentStep + 1).padStart(2, '0')}
          <small> / 07</small>
        </span>
        <div>
          <h4>{flow.step.title}</h4>
          <p>{flow.step.explanation}</p>
          <strong>{flow.step.responsibility}</strong>
        </div>
      </div>
      <div className="tl-flow-controls">
        <div className="tl-flow-secondary-controls">
          <button
            type="button"
            className="tl-flow-control"
            onClick={flow.previous}
            disabled={flow.currentStep === 0}
            aria-label="流程上一步"
          >
            <ArrowLeft size={15} />
            上一步
          </button>
          {!flow.reducedMotion && (
            <button
              type="button"
              className="tl-flow-control"
              onClick={flow.togglePlayback}
              disabled={flow.isFinished}
            >
              {flow.isPlaying ? <Pause size={15} /> : <Play size={15} />}
              {flow.isPlaying ? '暂停' : '自动播放'}
            </button>
          )}
          <button
            type="button"
            className="tl-flow-control"
            onClick={flow.restart}
            aria-label="重新播放工具执行流程"
          >
            <RotateCcw size={15} />
            重播
          </button>
        </div>
        <button
          type="button"
          className="tl-flow-next"
          onClick={flow.next}
          disabled={flow.isFinished}
        >
          {flow.isFinished ? <Check size={16} /> : null}
          {flow.step.nextLabel}
          {!flow.isFinished && <ArrowRight size={16} />}
        </button>
      </div>
      {flow.reducedMotion && (
        <p className="tl-reduced-note">已启用减少动态效果：逐步点击，用静态高亮查看信息流。</p>
      )}
    </section>
  )
}
