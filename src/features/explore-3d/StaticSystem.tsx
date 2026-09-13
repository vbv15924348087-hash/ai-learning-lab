import { ArrowRight, Box, Braces, CheckCheck, Layers3, Network, UserRound } from 'lucide-react'
import { exploreNodes } from './data'
import { categoryColorStyle } from './categoryColors'

const icons = [UserRound, Layers3, Box, Braces, Network, CheckCheck]
export function StaticSystem({
  onSelect,
  failed = false,
}: {
  onSelect: (id: string) => void
  failed?: boolean
}) {
  const core = exploreNodes.filter((node) => node.level === 0)
  return (
    <div className="ex3-static" role="region" aria-label="系统结构文字视图">
      <p className="ex3-kicker">THE SYSTEM, CONNECTED</p>
      <h2>准备信息 · 做出决定 · 执行与检查</h2>
      <div className="ex3-static-nodes">
        {core.map((node, index) => {
          const Icon = icons[index % icons.length]
          return (
            <button
              key={node.id}
              style={categoryColorStyle(node.category)}
              onClick={() => onSelect(node.id)}
            >
              <span>0{index + 1}</span>
              <Icon size={24} />
              <strong>{node.label}</strong>
              <small>{node.chineseLabel}</small>
              <ArrowRight size={14} />
            </button>
          )
        })}
      </div>
      <p>
        Context 提供本次信息，Model 决定下一步，Harness 调度外部工具。工具结果回到
        Context；检查失败就继续循环，通过后再交付。
      </p>
      <p className="ex3-small" role="status">
        {failed
          ? '当前浏览器未能启用 3D。概念搜索、详情和完整任务仍可使用。'
          : '正在布置 3D 空间，概念导航已经可以使用。'}
      </p>
    </div>
  )
}
