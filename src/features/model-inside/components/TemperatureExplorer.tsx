import { useId, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { temperatureDistribution } from '../data/predictionDemoData'
import '../model-interactions.css'

export function TemperatureExplorer() {
  const [temperature, setTemperature] = useState(0.7)
  const sliderId = useId()
  const distribution = temperatureDistribution(temperature)
  const explanation =
    temperature < 0.65
      ? '现在分布更集中：领先候选更容易被选中，输出倾向于更稳定。'
      : temperature > 1.2
        ? '现在分布更平缓：其他候选也有更多机会，输出倾向于更多样。'
        : '现在处于中间状态：保留领先候选的优势，也给其他候选一些机会。'

  return (
    <div className="mi-temperature-explorer">
      <p className="mi-simulation-label">
        教学模拟 · 使用固定示意分数，展示 Temperature 对分布的影响
      </p>
      <label className="mi-temperature-label" htmlFor={sliderId}>
        <SlidersHorizontal size={16} aria-hidden="true" />
        拖动滑块，看看生成分布如何变化
      </label>
      <div className="mi-temperature-scale">
        <span>更稳定</span>
        <output htmlFor={sliderId}>Temperature {temperature.toFixed(2)}</output>
        <span>更多样</span>
      </div>
      <input
        id={sliderId}
        aria-describedby={`${sliderId}-explanation`}
        type="range"
        min="0.25"
        max="2"
        step="0.05"
        value={temperature}
        onChange={(event) => setTemperature(Number(event.target.value))}
      />
      <ul className="mi-temperature-bars" aria-label="教学模拟候选分布">
        {distribution.map((probability, index) => (
          <li key={index}>
            <span>候选 {String.fromCharCode(65 + index)}</span>
            <div aria-hidden="true">
              <span style={{ height: `${probability * 100}%` }} />
            </div>
            <span>
              {Math.round(probability * 100)}%<small>示意</small>
            </span>
          </li>
        ))}
      </ul>
      <p id={`${sliderId}-explanation`} className="mi-temperature-explanation" aria-live="polite">
        {explanation}
      </p>
      <p className="mi-chart-caption">
        <strong>Temperature</strong>{' '}
        是影响生成随机性的参数之一。更稳定不保证更正确；更多样也不代表模型掌握了更多知识。
      </p>
    </div>
  )
}
