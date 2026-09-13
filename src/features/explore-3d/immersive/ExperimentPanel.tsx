import { FlaskConical, Play, RotateCcw } from 'lucide-react'
import { experiments } from './experiments'
import type { ExperimentPanelProps } from './types'
import './experiments.css'

export function ExperimentPanel(props: ExperimentPanelProps) {
  const scenario = experiments.find((item) => item.id === props.scenarioId) ?? experiments[0]
  const outcome = props.altered ? scenario.altered : scenario.normal

  return (
    <section className="im3-experiment" aria-label="系统实验">
      <div className="im3-experiment-heading">
        <FlaskConical size={17} aria-hidden="true" />
        <h2>少了它，会怎样？</h2>
      </div>
      <p className="im3-experiment-intro">先运行正常系统，再改变一个条件重跑，比较信息流与结果。</p>
      <label className="im3-experiment-select">
        <span>选择实验</span>
        <select value={scenario.id} onChange={(event) => props.onScenario(event.target.value)}>
          {experiments.map((item, index) => (
            <option key={item.id} value={item.id}>
              {index + 1}. {item.title}
            </option>
          ))}
        </select>
      </label>

      <div className="im3-experiment-question">
        <span>固定任务 · 教学模拟</span>
        <p>{scenario.question}</p>
      </div>

      <button
        type="button"
        className={`im3-experiment-toggle ${props.altered ? 'is-altered' : ''}`}
        role="switch"
        aria-checked={props.altered}
        aria-label={scenario.change}
        onClick={() => props.onAltered(!props.altered)}
      >
        <span>
          <strong>{scenario.change}</strong>
          <small>{props.altered ? '改动已开启 · 运行后观察差异' : '改动未开启 · 正常系统'}</small>
        </span>
        <span className="im3-experiment-switch" aria-hidden="true">
          <i />
        </span>
      </button>

      <div className="im3-experiment-actions">
        <button type="button" className="im3-experiment-run" onClick={props.onRun}>
          <Play size={14} aria-hidden="true" />
          {props.hasRun ? '重新运行' : props.altered ? '运行改动后的系统' : '运行正常系统'}
        </button>
        <button type="button" onClick={props.onRestore}>
          <RotateCcw size={14} aria-hidden="true" /> 恢复默认
        </button>
      </div>

      {props.hasRun ? (
        <div className={`im3-experiment-result ${props.altered ? 'is-altered' : ''}`} role="status">
          <span>{props.altered ? '改动后 · 结果预览' : '正常系统 · 结果预览'}</span>
          <h3>{outcome.title}</h3>
          <p>{outcome.explanation}</p>
          <div className="im3-experiment-takeaway">
            <strong>这说明什么？</strong>
            <p>{outcome.takeaway}</p>
          </div>
          <small>这是固定教学轨迹的结果预览。用底部时间轴逐步查看原因，或切换条件后重新运行。</small>
        </div>
      ) : (
        <p className="im3-experiment-pending" role="status">
          {props.altered
            ? '改动已准备好。点击运行，观察系统在哪一步发生变化。'
            : '正常系统已就绪。点击运行，先建立比较的参照。'}
        </p>
      )}
      <p className="im3-experiment-note">
        所有数据与动作均为教学模拟，不执行真实工具，不修改学习进度。
      </p>
    </section>
  )
}
