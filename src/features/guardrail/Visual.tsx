import { useState } from 'react'
import type { ChapterVisualProps } from '../curriculum/types'
import './guardrail.css'

function Request({ onComplete, completed }: ChapterVisualProps) {
  const [sent, setSent] = useState(completed)
  return (
    <>
      <div className="gr-call">
        <span>拟提交的 Tool Call</span>
        <pre>{'delete_database({\n  database: "gpu_research_demo"\n})'}</pre>
        <p>状态：尚未执行</p>
      </div>
      <div className="gr-flow">
        <div className="cr-node">Tool Call</div>
        <span aria-hidden="true">→</span>
        <div className={sent ? 'cr-node cr-active' : 'cr-node'}>风险与权限检查</div>
        <span aria-hidden="true">→</span>
        <div className="cr-node">等待处理</div>
      </div>
      <button
        className="cr-action"
        type="button"
        disabled={sent}
        onClick={() => {
          setSent(true)
          onComplete()
        }}
      >
        把请求送去风险检查
      </button>
      {sent && (
        <p className="cr-result" role="status">
          请求停在执行边界之前。下一步检查删除目标和风险，尚未执行任何操作。
        </p>
      )}
    </>
  )
}

function Approval({ onComplete, completed }: ChapterVisualProps) {
  const [checked, setChecked] = useState(completed)
  const [decision, setDecision] = useState('')
  return (
    <>
      <div className="gr-request-line">
        <code>delete_database()</code>
        <span>
          {decision ? '人工决策已记录' : checked ? '风险已识别，等待人工判断' : '等待风险检查'}
        </span>
      </div>
      <button
        className="cr-secondary"
        type="button"
        disabled={checked}
        onClick={() => setChecked(true)}
      >
        运行风险检查
      </button>
      {checked && (
        <section className="gr-approval" aria-label="高风险动作人工审批">
          <div className="gr-risk">
            {decision ? 'HIGH RISK · 人工判断已完成' : 'HIGH RISK · 需要人工判断'}
          </div>
          <h3>删除 gpu_research_demo</h3>
          <dl>
            <div>
              <dt>本次动作</dt>
              <dd>删除整个示例数据库</dd>
            </div>
            <div>
              <dt>预计影响</dt>
              <dd>所有研究记录丢失，可能无法恢复</dd>
            </div>
            <div>
              <dt>可选方案</dt>
              <dd>只读查询或导出副本，保留原数据</dd>
            </div>
            <div>
              <dt>当前状态</dt>
              <dd>
                {decision === 'approved'
                  ? '已批准本次模拟；未执行真实操作'
                  : decision === 'rejected'
                    ? '已拒绝，删除路径终止；未执行'
                    : '等待批准；没有执行'}
              </dd>
            </div>
          </dl>
          <p className="gr-simulation">
            安全教学模拟：两个按钮仅记录你的练习选择，不会连接或删除数据库。
          </p>
          <div className="gr-actions">
            <button
              className="cr-secondary"
              type="button"
              disabled={Boolean(decision)}
              onClick={() => {
                setDecision('rejected')
                onComplete()
              }}
            >
              Reject · 拒绝本次模拟动作
            </button>
            <button
              className="cr-action"
              type="button"
              disabled={Boolean(decision)}
              onClick={() => {
                setDecision('approved')
                onComplete()
              }}
            >
              Approve · 批准本次模拟动作
            </button>
          </div>
        </section>
      )}
      {decision && (
        <p className="cr-result" role="status">
          {decision === 'rejected'
            ? '已拒绝：删除路径终止。Agent 可在已有权限内改用只读分析，不能绕过拒绝。安全模拟已完成。'
            : '已批准本次模拟：真实系统接下来仍需核对权限与参数，由工具运行层执行并验证。本页不执行删除。安全模拟已完成。'}
        </p>
      )}
      {completed && !decision && (
        <p className="cr-hint">该步已完成。可重新选择一个分支，重温批准与拒绝的含义。</p>
      )}
    </>
  )
}

const guardrails = [
  {
    id: 'input',
    title: 'Input Guardrail',
    place: '处理请求之前',
    example: '检查输入是否包含不应处理的内容，或超出任务允许的范围。',
  },
  {
    id: 'tool',
    title: 'Tool Guardrail',
    place: '工具执行之前',
    example: '核对 delete_database 的目标、参数和授权；高风险操作进入审批。',
  },
  {
    id: 'output',
    title: 'Output Guardrail',
    place: '交付结果之前',
    example: '检查报告是否泄露不应公开的内部信息，再决定允许、修改或拦截。',
  },
]

function Layers({ onComplete, completed }: ChapterVisualProps) {
  const [seen, setSeen] = useState<string[]>(completed ? guardrails.map((g) => g.id) : [])
  const [active, setActive] = useState('')
  const selected = guardrails.find((g) => g.id === active)
  return (
    <>
      <div className="gr-layers">
        {guardrails.map((g) => (
          <button
            type="button"
            key={g.id}
            aria-pressed={active === g.id}
            onClick={() => {
              setActive(g.id)
              const next = [...new Set([...seen, g.id])]
              setSeen(next)
              if (next.length === 3) onComplete()
            }}
          >
            <span>{g.place}</span>
            <strong>{g.title}</strong>
            <small>{seen.includes(g.id) ? '已查看 ✓' : '点击查看示例 →'}</small>
          </button>
        ))}
      </div>
      {selected && (
        <p className="cr-result" role="status">
          {selected.example}
        </p>
      )}
      <p className="cr-hint">下一步：查看三个检查位置（{seen.length} / 3），它们不能相互替代。</p>
    </>
  )
}

function Continue({ onComplete, completed }: ChapterVisualProps) {
  const [choice, setChoice] = useState(completed ? 'read' : '')
  return (
    <>
      <div className="gr-flow">
        <div className="cr-node">删除被拒绝</div>
        <span aria-hidden="true">→</span>
        <div className="cr-node cr-active">调整计划</div>
        <span aria-hidden="true">→</span>
        <div className="cr-node">在授权范围内继续</div>
      </div>
      <p>任务是分析研究数据，删除只是被提议的一个动作。接下来怎样做？</p>
      <div className="gr-actions">
        <button className="cr-secondary" type="button" onClick={() => setChoice('bypass')}>
          换一个工具继续删除
        </button>
        <button
          className="cr-action"
          type="button"
          onClick={() => {
            setChoice('read')
            onComplete()
          }}
        >
          改用已授权的只读分析
        </button>
      </div>
      {choice && (
        <p className="cr-result" role="status">
          {choice === 'bypass'
            ? '拒绝针对这个动作与目标，换工具不能绕过决定。请选择权限内的方式。'
            : '只读分析继续推进目标。最后仍要验证分析结果是否正确，允许执行并不等于成果正确。'}
        </p>
      )}
    </>
  )
}

export default function GuardrailVisual(props: ChapterVisualProps) {
  return (
    <div className="cr-visual gr-visual" aria-label="Guardrail 安全教学模拟">
      <p className="cr-caption">教学示意 · 不连接数据库 · 不执行真实删除</p>
      {props.step === 0 ? (
        <Request {...props} />
      ) : props.step === 1 ? (
        <Approval {...props} />
      ) : props.step === 2 ? (
        <Layers {...props} />
      ) : (
        <Continue {...props} />
      )}
    </div>
  )
}
