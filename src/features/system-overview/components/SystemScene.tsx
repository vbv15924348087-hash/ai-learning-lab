import { Fragment, useId, type CSSProperties } from 'react'
import { ArrowDown, ArrowRight, CornerDownLeft, Layers3 } from 'lucide-react'
import type { LessonStep, OverviewNodeId } from '../types'
import { FlowConnection } from './FlowConnection'
import { SystemNode } from './SystemNode'
import '../scene.css'

type Point = { x: number; y: number }
type Connection = {
  from: OverviewNodeId
  to: OverviewNodeId
  path: string
  label?: string
  labelX?: number
  labelY?: number
  returning?: boolean
}

const positions: Record<LessonStep['scene']['variant'], Partial<Record<OverviewNodeId, Point>>> = {
  simple: { user: { x: 150, y: 200 }, model: { x: 500, y: 200 }, answer: { x: 850, y: 200 } },
  context: {
    user: { x: 130, y: 90 },
    context: { x: 500, y: 90 },
    model: { x: 870, y: 90 },
    action: { x: 870, y: 255 },
    result: { x: 870, y: 390 },
    answer: { x: 870, y: 390 },
  },
  decision: {
    model: { x: 280, y: 215 },
    answer: { x: 740, y: 105 },
    action: { x: 740, y: 325 },
    tool: { x: 740, y: 325 },
  },
  request: {
    model: { x: 110, y: 205 },
    action: { x: 365, y: 205 },
    harness: { x: 625, y: 205 },
    tool: { x: 885, y: 205 },
  },
  system: {
    user: { x: 90, y: 145 },
    context: { x: 300, y: 145 },
    model: { x: 510, y: 145 },
    harness: { x: 720, y: 145 },
    tool: { x: 900, y: 290 },
    result: { x: 640, y: 350 },
    answer: { x: 350, y: 350 },
  },
}

const connections: Record<LessonStep['scene']['variant'], Connection[]> = {
  simple: [
    { from: 'user', to: 'model', path: 'M 245 200 L 397 200' },
    { from: 'model', to: 'answer', path: 'M 595 200 L 747 200' },
  ],
  context: [
    { from: 'user', to: 'context', path: 'M 240 90 L 382 90' },
    { from: 'context', to: 'model', path: 'M 610 90 L 752 90' },
    { from: 'model', to: 'action', path: 'M 870 141 L 870 196' },
    { from: 'action', to: 'result', path: 'M 870 306 L 870 331' },
    { from: 'model', to: 'answer', path: 'M 870 141 L 870 331' },
    { from: 'action', to: 'answer', path: 'M 870 306 L 870 331' },
  ],
  decision: [
    {
      from: 'model',
      to: 'answer',
      path: 'M 370 195 L 440 195 Q 470 195 470 165 L 470 135 Q 470 105 500 105 L 642 105',
      label: '已有的信息足够',
      labelX: 552,
      labelY: 86,
    },
    {
      from: 'model',
      to: 'action',
      path: 'M 370 235 L 440 235 Q 470 235 470 265 L 470 295 Q 470 325 500 325 L 642 325',
      label: '需要最新资料',
      labelX: 552,
      labelY: 306,
    },
  ],
  request: [
    {
      from: 'model',
      to: 'action',
      path: 'M 200 205 L 267 205',
      label: '提出请求',
      labelX: 235,
      labelY: 132,
    },
    {
      from: 'action',
      to: 'harness',
      path: 'M 455 205 L 527 205',
      label: '交给',
      labelX: 494,
      labelY: 132,
    },
    {
      from: 'harness',
      to: 'tool',
      path: 'M 715 205 L 787 205',
      label: '调用工具',
      labelX: 753,
      labelY: 132,
    },
  ],
  system: [
    { from: 'user', to: 'context', path: 'M 180 145 L 202 145' },
    { from: 'context', to: 'model', path: 'M 390 145 L 412 145' },
    { from: 'model', to: 'harness', path: 'M 600 145 L 622 145' },
    {
      from: 'harness',
      to: 'tool',
      path: 'M 810 145 L 875 145 Q 900 145 900 170 L 900 231',
      label: '执行搜索',
      labelX: 896,
      labelY: 124,
    },
    {
      from: 'tool',
      to: 'result',
      path: 'M 900 341 L 900 350 L 738 350',
      label: '返回资料',
      labelX: 800,
      labelY: 386,
    },
    {
      from: 'result',
      to: 'harness',
      path: 'M 640 299 L 640 257 Q 640 240 660 240 L 700 240 Q 720 240 720 221 L 720 203',
      label: '交回结果',
      labelX: 675,
      labelY: 277,
      returning: true,
    },
    {
      from: 'harness',
      to: 'context',
      path: 'M 720 95 L 720 54 Q 720 35 700 35 L 320 35 Q 300 35 300 55 L 300 87',
      label: '把结果补充到模型能看到的信息里',
      labelX: 510,
      labelY: 19,
      returning: true,
    },
    {
      from: 'model',
      to: 'answer',
      path: 'M 510 196 L 510 232 Q 510 254 488 254 L 372 254 Q 350 254 350 276 L 350 291',
      label: '理解结果，再回答',
      labelX: 425,
      labelY: 236,
    },
  ],
}

const contextItems = [
  { name: '你的问题', detail: '查 NVIDIA 最新 AI GPU' },
  { name: '当前对话', detail: '“我是新手，请讲简单一点”' },
  { name: '系统规则', detail: '核对来源，用简单中文回答' },
  { name: '可用工具', detail: '可以请求使用搜索' },
]

function getNodeCopy(id: OverviewNodeId, step: LessonStep) {
  const { scene } = step
  const copy = {
    user: {
      label: '你',
      term: scene.variant === 'simple' ? 'USER' : undefined,
      detail: '提出问题',
    },
    context: { label: '模型的信息', term: scene.showContextTerm ? 'Context' : undefined },
    model: {
      label: '理解与判断',
      term: scene.showModelTerm ? 'Model' : scene.variant === 'simple' ? 'MODEL' : undefined,
    },
    action: {
      label:
        scene.variant === 'request'
          ? '「我要搜索」'
          : scene.variant === 'decision'
            ? '请求使用搜索'
            : '下一步行动',
      detail: scene.variant === 'request' ? '一条请求' : undefined,
    },
    harness: {
      label: scene.showHarnessTerm ? '运行系统' : '让动作发生',
      term: scene.showHarnessTerm ? 'Harness' : undefined,
    },
    tool: {
      label: scene.variant === 'decision' ? '请求使用搜索' : '搜索工具',
      term: scene.showToolTerm ? 'Tool' : undefined,
    },
    result: {
      label: scene.variant === 'context' ? '行动后的结果' : '搜到的资料',
      detail: scene.variant === 'context' ? undefined : '供模型继续理解',
    },
    answer: {
      label: scene.variant === 'decision' ? '直接回答' : '给你的回答',
      term: scene.variant === 'simple' ? 'ANSWER' : undefined,
    },
  }
  return copy[id]
}

export type SystemSceneProps = {
  step: LessonStep
  selectedNode: OverviewNodeId | null
  onSelectNode: (id: OverviewNodeId) => void
  interactive: boolean
}

function ContextContents({ count }: { count: number }) {
  if (count < 1) return null
  return (
    <div className="overview-context-contents">
      <p className="overview-context-caption">
        <Layers3 size={15} aria-hidden="true" />
        模型这一轮能看到
      </p>
      <div className="overview-context-items">
        {contextItems.slice(0, count).map((item, index) => (
          <div
            className="overview-context-item"
            key={item.name}
            style={{ animationDelay: `${index * 180}ms` }}
          >
            <span className="overview-context-item-number" aria-hidden="true">
              0{index + 1}
            </span>
            <div>
              <strong>{item.name}</strong>
              <span>{item.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SystemScene({ step, selectedNode, onSelectNode, interactive }: SystemSceneProps) {
  const markerId = `overview-arrow-${useId().replace(/:/g, '')}`
  const { scene } = step
  const visible = new Set(scene.visibleNodes)
  const isSystem = scene.variant === 'system'
  const hiddenExecutor = scene.variant === 'request' && !visible.has('harness')
  const node = (id: OverviewNodeId) => (
    <SystemNode
      id={id}
      {...getNodeCopy(id, step)}
      active={step.activeNodes.includes(id)}
      selected={selectedNode === id}
      interactive={interactive}
      onSelect={onSelectNode}
    />
  )
  const mobileOrder: OverviewNodeId[] = isSystem
    ? ['user', 'context', 'model', 'harness', 'tool', 'result', 'answer']
    : scene.variant === 'decision'
      ? ['model', 'answer', 'action']
      : scene.variant === 'request'
        ? ['model', 'action', 'harness', 'tool']
        : scene.variant === 'context'
          ? ['user', 'context', 'model', 'action', 'result', 'answer']
          : ['user', 'model', 'answer']
  const visibleMobileOrder = mobileOrder.filter((id) => visible.has(id))

  return (
    <div
      className={`overview-system-scene overview-system-scene--${scene.variant}${selectedNode ? ' has-selection' : ''}`}
    >
      <div className="overview-scene-desktop" aria-label="AI 系统信息流示意图">
        <svg
          className="overview-scene-connections"
          viewBox="0 0 1000 450"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <marker
              id={`${markerId}-quiet`}
              markerWidth="7"
              markerHeight="7"
              refX="6"
              refY="3.5"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path
                d="M 0 0 L 7 3.5 L 0 7"
                fill="none"
                stroke="var(--color-border)"
                strokeWidth="1.6"
              />
            </marker>
            <marker
              id={`${markerId}-active`}
              markerWidth="7"
              markerHeight="7"
              refX="6"
              refY="3.5"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path
                d="M 0 0 L 7 3.5 L 0 7"
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="1.6"
              />
            </marker>
          </defs>
          {connections[scene.variant]
            .filter((edge) => visible.has(edge.from) && visible.has(edge.to))
            .map((edge) => {
              const id = `${edge.from}-${edge.to}`
              return (
                <FlowConnection
                  key={id}
                  id={id}
                  {...edge}
                  active={step.activeConnections.includes(id)}
                  markerId={markerId}
                  animationKey={step.id}
                />
              )
            })}
        </svg>
        {connections[scene.variant]
          .filter((edge) => edge.label && visible.has(edge.from) && visible.has(edge.to))
          .map((edge) => (
            <span
              key={`label-${edge.from}-${edge.to}`}
              className={`overview-connection-label${step.activeConnections.includes(`${edge.from}-${edge.to}`) ? ' is-active' : ''}`}
              style={{ left: `${(edge.labelX ?? 0) / 10}%`, top: `${(edge.labelY ?? 0) / 4.5}%` }}
            >
              {edge.label}
            </span>
          ))}
        {scene.visibleNodes.map((id, index) => {
          const point = positions[scene.variant][id]
          if (!point) return null
          return (
            <div
              className="overview-node-position"
              key={id}
              style={
                {
                  '--node-x': `${point.x / 10}%`,
                  '--node-y': `${point.y / 4.5}%`,
                  '--node-delay': `${index * 180}ms`,
                } as CSSProperties
              }
            >
              {node(id)}
            </div>
          )
        })}
        {hiddenExecutor && (
          <div className="overview-executor-gap">
            <span aria-hidden="true">?</span>
            <strong>谁来执行？</strong>
            <small>请求还没有被执行</small>
          </div>
        )}
        {scene.variant === 'context' && <ContextContents count={scene.contextItems ?? 0} />}
        {scene.variant === 'simple' && (
          <p className="overview-simple-caption">
            一个问题，一句回答。
            <br />
            <span>先从你熟悉的体验开始。</span>
          </p>
        )}
        {scene.variant === 'request' && (
          <p className="overview-request-caption">
            {hiddenExecutor
              ? '说出“我要搜索”，还不等于已经完成搜索。'
              : '模型提出请求，运行系统让工具真正运行。'}
          </p>
        )}
      </div>

      <div className="overview-scene-mobile" aria-label="AI 系统信息流示意图">
        {scene.variant === 'decision' ? (
          <>
            {visible.has('model') && node('model')}
            <div className="overview-mobile-branches">
              {(['answer', 'action'] as const)
                .filter((id) => visible.has(id))
                .map((id) => (
                  <div
                    key={id}
                    className={step.activeConnections.includes(`model-${id}`) ? 'is-active' : ''}
                  >
                    <ArrowDown size={19} aria-hidden="true" />
                    <span>{id === 'answer' ? '已有信息足够' : '需要最新资料'}</span>
                    {node(id)}
                  </div>
                ))}
            </div>
          </>
        ) : (
          visibleMobileOrder.map((id, index) => {
            const previous = visibleMobileOrder[index - 1]
            const connectionId =
              isSystem && id === 'answer' ? 'model-answer' : previous ? `${previous}-${id}` : ''
            const blocked = hiddenExecutor && previous === 'action' && id === 'tool'
            const showReturn = isSystem && id === 'answer'
            return (
              <Fragment key={`${id}-${index}`}>
                {index > 0 &&
                  (showReturn ? (
                    <div
                      className={`overview-mobile-return${step.activeConnections.some((connection) => ['result-harness', 'harness-context', 'context-model', 'model-answer'].includes(connection)) ? ' is-active' : ''}`}
                    >
                      <CornerDownLeft size={16} aria-hidden="true" />
                      <div>
                        <span>资料送回：运行系统 → 当前信息 → 模型</span>
                        <small>模型结合新资料，再生成回答</small>
                      </div>
                      <ArrowDown size={16} aria-hidden="true" />
                    </div>
                  ) : blocked ? (
                    <div className="overview-mobile-gap">
                      <strong>?</strong>
                      <span>
                        谁来执行？<small>请求还没有被执行</small>
                      </span>
                    </div>
                  ) : (
                    <div
                      className={`overview-mobile-arrow${step.activeConnections.includes(connectionId) ? ' is-active' : ''}`}
                    >
                      <ArrowDown size={19} aria-hidden="true" />
                    </div>
                  ))}
                <div
                  className="overview-mobile-node"
                  style={{ '--node-delay': `${index * 180}ms` } as CSSProperties}
                >
                  {node(id)}
                </div>
                {id === 'context' && scene.variant === 'context' && (
                  <ContextContents count={scene.contextItems ?? 0} />
                )}
              </Fragment>
            )
          })
        )}
      </div>

      {scene.packet && (
        <div className="overview-scene-packet" key={scene.packet}>
          <ArrowRight size={16} aria-hidden="true" />
          <span>{scene.packet}</span>
        </div>
      )}
      <div className="overview-scene-flowtext" aria-live="polite" aria-atomic="true">
        <span className="overview-flowtext-label">信息怎么走</span>
        <p>{step.flowText}</p>
      </div>
    </div>
  )
}
