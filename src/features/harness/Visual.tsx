import { useState } from 'react'
import type { ChapterVisualProps } from '../curriculum/types'
import { modules } from './data'
import './harness.css'

function HarnessExplorer({ onComplete }: Pick<ChapterVisualProps, 'onComplete'>) {
  const [open, setOpen] = useState(false)
  const [visited, setVisited] = useState<string[]>([])
  const [active, setActive] = useState<string | null>(null)
  const selected = modules.find((module) => module.id === active)
  return (
    <div className={`ha-case ${open ? 'ha-open' : ''}`}>
      <div className="ha-case-top">
        <div>
          <span className="ha-eyebrow">AGENT RUNTIME</span>
          <h3>HARNESS</h3>
        </div>
        <span className="cr-tag">教学架构示意</span>
      </div>
      {!open ? (
        <div className="ha-cover">
          <div className="ha-chip">
            <span>Model</span>
            <small>生成判断与请求</small>
          </div>
          <p>请求之外，还有一整套负责运行的部件。</p>
          <button className="cr-action" onClick={() => setOpen(true)}>
            打开运行系统 →
          </button>
        </div>
      ) : (
        <>
          <div className="ha-explorer">
            <div className="ha-modules" aria-label="点击探索 Harness 的 11 个模块">
              {modules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => {
                    setActive(module.id)
                    setVisited((current) =>
                      current.includes(module.id) ? current : [...current, module.id],
                    )
                  }}
                  className={`ha-module ${active === module.id ? 'ha-selected' : ''}`}
                  aria-pressed={active === module.id}
                >
                  <span
                    className="ha-module-status"
                    aria-label={visited.includes(module.id) ? '已探索' : '未探索'}
                  >
                    {visited.includes(module.id) ? '✓' : '+'}
                  </span>
                  <strong>{module.name}</strong>
                  <small>{module.label}</small>
                </button>
              ))}
            </div>
            <div className="ha-detail" aria-live="polite">
              {selected ? (
                <>
                  <span className="ha-eyebrow">{selected.name}</span>
                  <h3>{selected.label}</h3>
                  <p>{selected.explanation}</p>
                  <dl>
                    <dt>输入</dt>
                    <dd>{selected.input}</dd>
                    <dt>输出</dt>
                    <dd>{selected.output}</dd>
                  </dl>
                </>
              ) : (
                <>
                  <span className="ha-eyebrow">从任意模块开始</span>
                  <h3>点开一个部件，看看它负责什么。</h3>
                  <p>左侧每张卡片都可以点击，也可以用 Tab 和 Enter 探索。</p>
                </>
              )}
            </div>
          </div>
          <div className="ha-bottom">
            <p role="status">
              已探索 {visited.length} / {modules.length} 个模块
            </p>
            <button
              className="cr-action"
              disabled={visited.length !== modules.length}
              onClick={onComplete}
            >
              {visited.length === modules.length
                ? '全部探索完成 →'
                : `还需探索 ${modules.length - visited.length} 个模块`}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function FailurePaths({ onComplete }: Pick<ChapterVisualProps, 'onComplete'>) {
  const [kind, setKind] = useState<'timeout' | 'denied' | null>(null)
  const [seen, setSeen] = useState<string[]>([])
  const choose = (value: 'timeout' | 'denied') => {
    setKind(value)
    setSeen((current) => (current.includes(value) ? current : [...current, value]))
  }
  const path =
    kind === 'timeout'
      ? [
          'Tool Runtime',
          'Timeout · 超过时限',
          'Retry · 最多再试 1 次',
          'Observation · 回传结果或错误',
        ]
      : ['Tool Router', 'Permission · 拒绝', 'State · 等待授权', 'Observation · 告知权限缺口']
  return (
    <div className="cr-visual">
      <span className="cr-tag">教学模拟 · 不执行真实请求</span>
      <h3>同一个读取资料请求，两种失败。</h3>
      <div className="ha-choices">
        <button
          className="cr-secondary"
          aria-pressed={kind === 'timeout'}
          onClick={() => choose('timeout')}
        >
          注入网络超时
        </button>
        <button
          className="cr-secondary"
          aria-pressed={kind === 'denied'}
          onClick={() => choose('denied')}
        >
          注入权限拒绝
        </button>
      </div>
      {kind && (
        <>
          <div className="ha-path">
            {path.map((label, index) => (
              <div className="ha-path-item" key={label}>
                <span>{index + 1}</span>
                <strong>{label}</strong>
              </div>
            ))}
          </div>
          <p className="cr-result" role="status">
            {kind === 'timeout'
              ? '这是只读操作的暂时失败：确认适合重试后，按次数上限重新读取。继续失败会把错误交回循环。'
              : '没有权限：工具没有执行。保存阻塞状态并解释缺口，不能通过自动重试绕过权限。'}
          </p>
        </>
      )}
      <p className="cr-caption">实际模块顺序因架构而异。这里比较的是错误处理策略。</p>
      <button className="cr-action" disabled={seen.length < 2} onClick={onComplete}>
        {seen.length < 2 ? '请先比较两条失败路径' : '确认：不同错误需要不同处理 →'}
      </button>
    </div>
  )
}

export default function ChapterVisual({ step, onComplete, completed }: ChapterVisualProps) {
  const [feedback, setFeedback] = useState(false)
  if (step === 1) return <HarnessExplorer onComplete={onComplete} />
  if (step === 2) return <FailurePaths onComplete={onComplete} />
  if (step === 0)
    return (
      <div className="cr-visual">
        <div className="ha-request">
          <span>MODEL OUTPUT · 教学示意</span>
          <code>read_page(url: "官方产品资料")</code>
          <strong>一个请求已经生成。</strong>
          <p>接下来还要连接服务、执行读取、等待返回。</p>
        </div>
        <h3>谁来把请求变成实际执行？</h3>
        <div className="ha-choices">
          <button className="cr-secondary" onClick={() => setFeedback(true)}>
            模型输出后会自动发生
          </button>
          <button className="cr-action" onClick={onComplete}>
            需要运行系统执行 →
          </button>
        </div>
        {feedback && (
          <p className="cr-result" role="status">
            结构化文字本身不会连接网络。需要宿主程序接收并执行这个请求。
          </p>
        )}
      </div>
    )
  return (
    <div className="cr-visual">
      <div className="ha-equation">
        <div className="ha-model">
          <strong>MODEL</strong>
          <span>智能核心</span>
        </div>
        <span>+</span>
        <div className="ha-parts">
          {[
            'Context · 当前资料',
            'Tools · 外部能力',
            'Loop · 持续工作',
            'State · 当前进度',
            'Runtime · 执行环境',
          ].map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <span>≈</span>
        <div className="ha-agent">
          <strong>AGENT</strong>
          <span>能够持续行动的系统</span>
        </div>
      </div>
      <p className="cr-caption">组成关系示意，能力并不是数值相加。</p>
      <p>下一步：运行系统应该怎样从大量资料中，只挑出这一轮真正需要的部分？</p>
      <button className="cr-action" onClick={onComplete}>
        {completed ? '已确认系统关系' : '我能区分 Model 与 Harness →'}
      </button>
    </div>
  )
}
