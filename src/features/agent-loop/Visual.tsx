import { useEffect, useState } from 'react'
import type { ChapterVisualProps } from '../curriculum/types'
import { loopStages } from './data'
import './agent-loop.css'

const nodes = [
  { id: 'observe', name: 'Observe', label: '观察' },
  { id: 'reason', name: 'Reason', label: '判断' },
  { id: 'plan', name: 'Plan', label: '计划' },
  { id: 'act', name: 'Act', label: '行动' },
  { id: 'verify', name: 'Verify', label: '检查' },
]

function LoopPlayback({ onComplete }: Pick<ChapterVisualProps, 'onComplete'>) {
  const [frame, setFrame] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [reduced, setReduced] = useState(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  )
  const stage = loopStages[frame]
  const done = frame === loopStages.length - 1
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const update = () => {
      setReduced(Boolean(media?.matches))
      if (media?.matches) setPlaying(false)
    }
    media?.addEventListener('change', update)
    return () => media?.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.hidden) setPlaying(false)
    }
    document.addEventListener('visibilitychange', pauseWhenHidden)
    return () => document.removeEventListener('visibilitychange', pauseWhenHidden)
  }, [])
  useEffect(() => {
    if (!playing || done || reduced) return
    const timer = window.setTimeout(() => setFrame((value) => value + 1), 2400)
    return () => window.clearTimeout(timer)
  }, [playing, done, frame, reduced])
  return (
    <div className="al-demo">
      <div className="al-kicker">
        <span>教学示意 · NVIDIA 资料查证</span>
        <strong>第 {stage.round} 轮 / 2</strong>
      </div>
      <div className="al-loop" aria-label="观察、判断、计划、行动、观察、检查，未完成则循环">
        <svg className="al-orbit" viewBox="0 0 600 320" aria-hidden="true">
          <defs>
            <marker
              id="al-flow-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto"
            >
              <polygon points="0,0 10,5 0,10" fill="#7da7f4" />
            </marker>
          </defs>
          <path d="M155 70 H465 Q555 70 555 155 Q555 250 465 250 H145 Q45 250 45 155 Q45 70 145 70" />
          <path
            className="al-return"
            d="M135 250 H95 Q45 250 45 180"
            markerEnd="url(#al-flow-arrow)"
          />
          <path className="al-return" d="M285 70 H325" markerEnd="url(#al-flow-arrow)" />
          <path className="al-return" d="M360 250 H310" markerEnd="url(#al-flow-arrow)" />
          <text x="285" y="165">
            {done ? '条件已满足' : '未完成 → 继续'}
          </text>
        </svg>
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`al-node al-${node.id} ${stage.node === node.id ? 'al-active' : ''}`}
            aria-current={stage.node === node.id ? 'step' : undefined}
          >
            <span>{node.name}</span>
            <strong>{node.label}</strong>
          </div>
        ))}
      </div>
      <p className="al-observe-note">行动之后先收到新观察，再检查是否满足要求。</p>
      <div className="cr-result" role="status" aria-live="polite">
        <strong>
          {String(frame + 1).padStart(2, '0')} / 12 · {stage.label}
        </strong>
        <p>{stage.text}</p>
      </div>
      <div className="al-controls">
        <button
          className="cr-action"
          onClick={() => (done ? onComplete() : setFrame((value) => value + 1))}
        >
          {done ? '确认查证通过 →' : '推进循环 →'}
        </button>
        {!done && !reduced && (
          <button className="cr-secondary" onClick={() => setPlaying((value) => !value)}>
            {playing ? '暂停' : '自动播放'}
          </button>
        )}
        <button
          className="cr-secondary"
          onClick={() => {
            setFrame(0)
            setPlaying(false)
          }}
        >
          重播两轮
        </button>
      </div>
      {reduced && <p className="cr-caption">已按减少动态效果偏好启用手动推进，内容保持完整。</p>}
    </div>
  )
}

export default function ChapterVisual({ step, onComplete, completed }: ChapterVisualProps) {
  const [source, setSource] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  if (step === 1) return <LoopPlayback onComplete={onComplete} />
  if (step === 0)
    return (
      <div className="cr-visual al-source">
        <span className="cr-tag">教学示意 · 第一次 Tool Result</span>
        <h3>“据说新 GPU 的性能提升很大……”</h3>
        <p>来源：论坛转帖 · 未附官方链接 · 未提供可核对的规格表</p>
        <div className="al-criteria">
          <strong>任务要求</strong>
          <span>报告中的产品信息需要一手来源支持。</span>
        </div>
        <div className="al-controls">
          <button className="cr-secondary" onClick={() => setSource('enough')}>
            有结果，应该够了
          </button>
          <button
            className="cr-action"
            onClick={() => {
              setSource('gap')
              onComplete()
            }}
          >
            还缺可靠来源 →
          </button>
        </div>
        {source && (
          <p className="cr-result" role="status">
            {source === 'gap'
              ? '找到了缺口：接下来需要继续行动，寻找可核对的一手资料。'
              : '再对照任务要求：找到文字，还没有解决来源可靠性的问题。试试另一项。'}
          </p>
        )}
      </div>
    )
  if (step === 2)
    return (
      <div className="cr-visual">
        <div className="cr-flow">
          <div className="cr-node">
            Reason
            <br />
            作判断
          </div>
          <span aria-hidden="true">→</span>
          <div className="cr-node">
            Act
            <br />
            采取行动
          </div>
          <span aria-hidden="true">→</span>
          <div className="cr-node">
            Observe
            <br />
            接收反馈
          </div>
        </div>
        <p className="cr-hint">ReAct：让判断与行动在反馈中交替推进。</p>
        <button
          className="cr-secondary"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? '收起配套能力' : '展开现代 Agent 还需要什么 →'}
        </button>
        {expanded && (
          <>
            <div className="al-extras">
              {[
                'Planning · 计划',
                'State · 状态',
                'Verification · 检查',
                'Retry · 重试',
                'Guardrail · 约束',
              ].map((name) => (
                <span className="cr-tag" key={name}>
                  {name}
                </span>
              ))}
            </div>
            <p>这些能力由具体架构组合，不能只靠“循环想一想”获得。</p>
            <button className="cr-action" onClick={onComplete}>
              我理解 ReAct 的边界 →
            </button>
          </>
        )}
      </div>
    )
  return (
    <div className="cr-visual">
      <div className="al-system">
        <div className="cr-node">
          Context
          <br />
          <small>当前可见的信息</small>
        </div>
        <span>→</span>
        <div className="cr-node">
          Model
          <br />
          <small>提出下一步请求</small>
        </div>
        <span>→</span>
        <div className="cr-node cr-active">
          Harness
          <br />
          <small>执行工具与调度循环</small>
        </div>
        <span>→</span>
        <div className="cr-node">
          Observation
          <br />
          <small>新结果补回 Context</small>
        </div>
      </div>
      <div className="al-system-return">← 没有满足完成条件？带着新反馈继续下一轮 ←</div>
      <p>下一步：打开 Harness，看看谁维护这条循环。</p>
      <button className="cr-action" onClick={onComplete}>
        {completed ? '已确认 · Harness 负责运行' : '确认：Harness 承载这条循环 →'}
      </button>
    </div>
  )
}
