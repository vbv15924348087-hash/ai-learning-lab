import { useId } from 'react'
import '../tools-flow.css'

const summaryNodes = [
  { x: 80, y: 134, label: 'Context', note: '用户问题与已有资料', kind: 'context' },
  { x: 330, y: 134, label: 'Model', note: '决定使用哪个工具', kind: 'model' },
  { x: 580, y: 134, label: 'Tool Call', note: '本次请求 + 参数', kind: 'call' },
  { x: 580, y: 269, label: 'Harness', note: '验证并发起执行', kind: 'harness' },
  { x: 330, y: 269, label: 'Tool', note: '外部能力真正做事', kind: 'tool' },
  { x: 80, y: 269, label: 'Tool Result', note: '返回来源与内容', kind: 'result' },
  { x: 80, y: 404, label: 'Context', note: '加入新资料', kind: 'context' },
  { x: 330, y: 404, label: 'Model', note: '再次读取与理解', kind: 'model' },
  { x: 580, y: 404, label: 'Answer', note: '组织成用户的回答', kind: 'answer' },
]

export function ToolsFlowSummary() {
  const arrowId = `tl-summary-${useId().replace(/:/g, '')}`
  return (
    <div className="tl-summary" aria-label="Tools 完整关系总结">
      <div className="tl-flow-heading">
        <div>
          <span className="tl-flow-eyebrow">THE COMPLETE PICTURE</span>
          <h3>现在，系统图连接起来了</h3>
        </div>
        <span className="tl-simulation-tag">教学示意</span>
      </div>
      <svg
        viewBox="0 0 660 452"
        role="img"
        aria-label="Tool Schema 提前提供给 Model；Context → Model → Tool Call → Harness → Tool → Tool Result → Context → Model → Answer。"
      >
        <defs>
          <marker id={arrowId} markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
            <path d="M 0 0 L 5 3 L 0 6" fill="none" stroke="#8796b7" strokeWidth="1.3" />
          </marker>
        </defs>
        {[
          'M 330 55 L 330 91',
          'M 147 134 L 257 134',
          'M 397 134 L 507 134',
          'M 580 176 L 580 222',
          'M 513 269 L 403 269',
          'M 263 269 L 153 269',
          'M 80 311 L 80 357',
          'M 147 404 L 257 404',
          'M 397 404 L 507 404',
        ].map((path) => (
          <path key={path} d={path} className="tl-summary-edge" markerEnd={`url(#${arrowId})`} />
        ))}
        <g className="tl-summary-schema">
          <rect x="236" y="1" width="188" height="54" rx="8" />
          <text x="330" y="23" textAnchor="middle">
            Tool Schema
          </text>
          <text x="330" y="42" textAnchor="middle" className="tl-summary-note">
            提前提供的使用说明书
          </text>
        </g>
        <text x="345" y="80" className="tl-summary-link-caption">
          告诉模型如何调用
        </text>
        <text x="455" y="116" textAnchor="middle" className="tl-summary-link-caption">
          Function Calling
        </text>
        <text x="455" y="287" textAnchor="middle" className="tl-summary-link-caption">
          执行
        </text>
        <text x="205" y="287" textAnchor="middle" className="tl-summary-link-caption">
          返回
        </text>
        {summaryNodes.map((node, index) => (
          <g
            key={`${node.kind}-${index}`}
            transform={`translate(${node.x}, ${node.y})`}
            className={`tl-summary-node tl-summary-${node.kind}`}
          >
            <rect x="-67" y="-41" width="134" height="82" rx="10" />
            <text y="-5" textAnchor="middle" className="tl-summary-node-title">
              {node.label}
            </text>
            <text y="20" textAnchor="middle" className="tl-summary-note">
              {node.note}
            </text>
          </g>
        ))}
      </svg>
      <div className="tl-summary-principles">
        <span>
          <strong>Model</strong> 决定并生成请求
        </span>
        <span>
          <strong>Harness</strong> 让调用实际发生
        </span>
        <span>
          <strong>Context</strong> 带回工具结果
        </span>
      </div>
    </div>
  )
}
