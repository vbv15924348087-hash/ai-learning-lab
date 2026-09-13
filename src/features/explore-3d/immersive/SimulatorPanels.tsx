import { ArrowRight, GitCompareArrows, Route, X } from 'lucide-react'
import type { ExploreNode } from '../types'
import type { ExplanationLevel } from './types'
import { taskScenarios, whyNotThisNode, explainTaskStep, type TaskScenario } from './scenarios'

export function ComplexityMeter({ scenario }: { scenario: TaskScenario }) {
  const metrics = [
    ['reasoning', '推理步骤'],
    ['tools', '工具数量'],
    ['loops', '循环次数'],
    ['externalInfo', '外部信息'],
    ['risk', '风险等级'],
    ['verification', '验证要求'],
  ] as const
  return (
    <section className="sim-complexity" aria-label="任务复杂度">
      <div className="sim-section-title">
        <strong>Task Complexity</strong>
        <span>教学示意</span>
      </div>
      {metrics.map(([key, label]) => (
        <div key={key} className="sim-metric">
          <span>{label}</span>
          <meter min={0} max={5} value={scenario.complexity[key]} aria-label={label} />
          <small>{scenario.complexity[key]} / 5</small>
        </div>
      ))}
      <p>复杂度取决于步骤、工具、循环与验证要求，并非 Prompt 的长度。数值用于比较教学示例。</p>
    </section>
  )
}

export function TaskInspector({
  scenario,
  level,
  nodes,
  index,
  complexityLevel,
  onComplexity,
  onStep,
  onClose,
}: {
  scenario: TaskScenario
  level: ExplanationLevel
  nodes: ExploreNode[]
  index: number
  complexityLevel: number
  onComplexity: (level: number) => void
  onStep: (index: number) => void
  onClose: () => void
}) {
  return (
    <aside className="im3-detail im3-panel sim-inspector" aria-label="任务路径解释">
      <div className="im3-panel-heading">
        <span>沿着任务理解系统</span>
        <button onClick={onClose} aria-label="收起任务解释">
          <X size={16} />
        </button>
      </div>
      <span className="im3-eyebrow">WHY THIS PATH?</span>
      <h2>为什么走这条路径？</h2>
      <p className="im3-plain">{scenario.explanation}</p>
      <ComplexityMeter scenario={scenario} />
      <section className="sim-ladder" aria-label="GPU 复杂度阶梯">
        <div className="sim-section-title">
          <strong>同一主题，逐级加深</strong>
          <span>GPU · Level {complexityLevel}</span>
        </div>
        <label htmlFor="sim-ladder">从概念问答，到持续一个月的研究</label>
        <input
          id="sim-ladder"
          aria-label="GPU 任务复杂度"
          type="range"
          min={1}
          max={5}
          step={1}
          value={complexityLevel}
          onChange={(e) => onComplexity(Number(e.target.value))}
        />
        <div className="sim-ladder-labels">
          <span>简单</span>
          <span>复杂</span>
        </div>
        <p>拖动后，同一张系统地图会显示对应任务的路径。</p>
      </section>
      <h3 className="sim-path-heading">
        <Route size={14} /> 逐步看原因 · {scenario.steps.length} 步
      </h3>
      <ol className="sim-path-list">
        {scenario.steps.map((step, i) => (
          <li key={step.id}>
            <button onClick={() => onStep(i)} aria-current={index === i ? 'step' : undefined}>
              <span className="sim-path-number">
                {i < index ? '✓' : String(i + 1).padStart(2, '0')}
              </span>
              <span>
                <strong>
                  {nodes.find((node) => node.id === step.nodeId)?.label ?? step.title}
                </strong>
                <small>{explainTaskStep(step, level)}</small>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </aside>
  )
}

export function NodePathReason({
  scenario,
  node,
  level,
}: {
  scenario: TaskScenario
  node: ExploreNode
  level: ExplanationLevel
}) {
  const visits = scenario.steps.filter((step) => step.nodeId === node.id)
  return (
    <section
      className="im3-why sim-node-reason"
      aria-label={visits.length ? '为什么走这里' : '为什么没走这里'}
    >
      <span className="im3-eyebrow">{visits.length ? 'WHY THIS NODE?' : 'WHY NOT THIS NODE?'}</span>
      <h2>{visits.length ? '为什么走这里？' : '为什么没走这里？'}</h2>
      <p>{visits.length ? explainTaskStep(visits[0], level) : whyNotThisNode(scenario, node.id)}</p>
      {visits.length > 1 && (
        <p>这个任务会经过这里 {visits.length} 次。每次带入新的信息，继续判断下一步。</p>
      )}
    </section>
  )
}

export type CompareFilter = 'all' | 'common' | 'added' | 'differences'
export function CompareControls({
  taskIds,
  filter,
  onTasks,
  onFilter,
}: {
  taskIds: [string, string]
  filter: CompareFilter
  onTasks: (ids: [string, string]) => void
  onFilter: (filter: CompareFilter) => void
}) {
  return (
    <section className="sim-compare" aria-label="对比两个任务">
      <div className="sim-compare-selects">
        <GitCompareArrows size={16} />
        <label>
          <span className="sim-path-a">A</span>
          <select
            aria-label="对比任务 A"
            value={taskIds[0]}
            onChange={(e) => onTasks([e.target.value, taskIds[1]])}
          >
            {taskScenarios.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        </label>
        <ArrowRight size={14} />
        <label>
          <span className="sim-path-b">B</span>
          <select
            aria-label="对比任务 B"
            value={taskIds[1]}
            onChange={(e) => onTasks([taskIds[0], e.target.value])}
          >
            {taskScenarios.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="im3-segment" aria-label="路径对比筛选">
        {(
          [
            ['all', '完整路径'],
            ['common', '显示共同步骤'],
            ['added', '显示新增步骤'],
            ['differences', '只看差异'],
          ] as const
        ).map(([value, label]) => (
          <button key={value} onClick={() => onFilter(value)} aria-pressed={filter === value}>
            {label}
          </button>
        ))}
      </div>
      <p>
        <span className="sim-path-a">A 独有</span>
        <span className="sim-path-b">+B 新增</span>
        <span>A+B 共同路径 · 同一地图，同一节点位置</span>
      </p>
    </section>
  )
}
