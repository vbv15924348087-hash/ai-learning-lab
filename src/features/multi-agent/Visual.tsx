import { useState } from 'react'
import type { ChapterVisualProps } from '../curriculum/types'
import './multi-agent.css'

const specialists = [
  {
    name: 'Research Agent',
    task: '核对 GPU 参数的官方来源',
    context: '问题、来源标准、需要核对的参数',
  },
  {
    name: 'Coding Agent',
    task: '生成报告所需的可复现脚本',
    context: '输入格式、输出要求、可运行的环境',
  },
  {
    name: 'Browser Agent',
    task: '打开已指定的公开资料页面',
    context: '页面地址、需要读取的内容、访问权限',
  },
  { name: 'Data Agent', task: '计算功耗与性能的可比指标', context: '已验证数据、单位、比较口径' },
]

function Roles({ onComplete, completed }: ChapterVisualProps) {
  const [selected, setSelected] = useState(completed ? 0 : -1)
  return (
    <>
      <div className="ma-manager">
        Manager Agent <small>明确目标 · 分派任务 · 汇总结果</small>
      </div>
      <div className="ma-tree" role="group" aria-label="选择专长助手">
        {specialists.map((agent, index) => (
          <button
            key={agent.name}
            type="button"
            aria-pressed={selected === index}
            onClick={() => {
              setSelected(index)
              onComplete()
            }}
          >
            {agent.name}
            <small>{agent.task}</small>
          </button>
        ))}
      </div>
      {selected >= 0 && (
        <div role="status" className="cr-result">
          <strong>{specialists[selected].name} 的任务包</strong>
          <p>{specialists[selected].context}。只传完成子任务需要的信息；其他上下文由协调方保管。</p>
        </div>
      )}
    </>
  )
}

function ToolMode({ onComplete, completed }: ChapterVisualProps) {
  const [stage, setStage] = useState(completed ? 2 : 0)
  return (
    <>
      <div className="ma-control">
        整体任务控制者：<strong>Manager Agent</strong>
      </div>
      <div className="ma-exchange">
        <div className={stage !== 1 ? 'ma-agent ma-current' : 'ma-agent'}>
          Manager Agent
          <small>
            {stage === 1 ? '等待子任务返回' : stage === 2 ? '恢复：整合报告' : '准备：委派研究'}
          </small>
        </div>
        <div
          className="ma-direction"
          aria-label={stage === 2 ? '结果返回 Manager' : 'Manager 调用 Research'}
        >
          {stage === 2 ? '← 结果回传' : '子任务调用 →'}
        </div>
        <div className={stage === 1 ? 'ma-agent ma-current' : 'ma-agent'}>
          Research Agent
          <small>
            {stage === 0
              ? '等待明确子任务'
              : stage === 1
                ? '执行：核对官方资料'
                : '本次子任务已结束'}
          </small>
        </div>
      </div>
      <div className="ma-contexts">
        <section>
          <h4>Manager 的 Context</h4>
          <p>完整报告目标、用户格式要求、各子任务状态。</p>
        </section>
        <section>
          <h4>Research 收到的 Context</h4>
          <p>
            {stage > 0
              ? '只核对 GPU 功耗；优先官方资料；返回参数、单位与出处。'
              : '尚未分派。不会自动继承全部对话。'}
          </p>
        </section>
      </div>
      <button
        type="button"
        className="cr-action"
        disabled={stage === 2}
        onClick={() => {
          setStage(stage + 1)
          if (stage === 1) onComplete()
        }}
      >
        {stage === 0 ? '委派研究任务' : stage === 1 ? '返回研究结果' : '调用方已恢复工作'}
      </button>
      <p className="cr-result" role="status">
        {stage === 0
          ? '任务包中要有目标、边界、证据标准和返回格式。'
          : stage === 1
            ? '子 Agent 正在执行自己的任务；整体负责人仍是 Manager。'
            : '来源清单回到 Manager，加入它的 Context。现在由 Manager 决定下一步。'}
      </p>
    </>
  )
}

function HandoffMode({ onComplete, completed }: ChapterVisualProps) {
  const [stage, setStage] = useState(completed ? 2 : 0)
  return (
    <>
      <div className="ma-control">
        后续任务控制者：<strong>{stage === 0 ? 'Research Agent' : 'Data Agent'}</strong>
      </div>
      <div className="ma-exchange">
        <div className={stage === 0 ? 'ma-agent ma-current' : 'ma-agent'}>
          Research Agent<small>{stage === 0 ? '已整理来源，准备交接' : '已交出后续处理权'}</small>
        </div>
        <div className="ma-direction">控制权交接 →</div>
        <div className={stage > 0 ? 'ma-agent ma-current' : 'ma-agent'}>
          Data Agent
          <small>
            {stage === 0 ? '等待交接' : stage === 1 ? '已接手：选择分析动作' : '继续：完成数据比较'}
          </small>
        </div>
      </div>
      <div className="ma-contexts">
        <section>
          <h4>明确传递的交接包</h4>
          <p>目标：完成 GPU 对比；状态：来源已核对；证据：参数与出处；下一项：统一单位再比较。</p>
        </section>
        <section>
          <h4>没有自动复制的内容</h4>
          <p>重复搜索日志、无关对话。完整历史是否共享，由系统策略决定。</p>
        </section>
      </div>
      <button
        type="button"
        className="cr-action"
        disabled={stage === 2}
        onClick={() => {
          setStage(stage + 1)
          if (stage === 1) onComplete()
        }}
      >
        {stage === 0
          ? '交接给数据 Agent'
          : stage === 1
            ? '由数据 Agent 继续分析'
            : '接手者正在推进目标'}
      </button>
      <p className="cr-result" role="status">
        {stage === 0
          ? '下一步：转交控制权，观察上方的当前处理者。'
          : stage === 1
            ? 'Data Agent 已接手。它可以依据交接包决定下一项行动。'
            : '这次没有默认回传给 Research。以后是否再次交接或返回，取决于系统的路由策略。'}
      </p>
    </>
  )
}

function Summary({ onComplete, completed }: ChapterVisualProps) {
  const [mode, setMode] = useState(completed ? 'tool' : '')
  return (
    <>
      <div className="ma-tree ma-two">
        <button type="button" aria-pressed={mode === 'tool'} onClick={() => setMode('tool')}>
          调用并返回<small>适合明确、可独立完成的子任务</small>
        </button>
        <button type="button" aria-pressed={mode === 'handoff'} onClick={() => setMode('handoff')}>
          转交后续任务<small>适合后续由另一位专长 Agent 处理</small>
        </button>
      </div>
      {mode && (
        <div className="cr-result" role="status">
          {mode === 'tool'
            ? 'Manager → 子 Agent → 结果返回 Manager → Manager 继续。'
            : 'Agent A → 交接任务和选定上下文 → Agent B 接手后续处理。'}
          <p>两种模式都需要清晰的任务边界、权限和结果验证。</p>
        </div>
      )}
      <button className="cr-action" type="button" disabled={!mode} onClick={onComplete}>
        我明白了：分工、上下文、控制权都要明确
      </button>
    </>
  )
}

export default function MultiAgentVisual(props: ChapterVisualProps) {
  return (
    <div className="cr-visual ma-visual" aria-label="多 Agent 协作教学示意">
      <p className="cr-caption">教学示意 · 没有调用真实 Agent</p>
      {props.step === 0 ? (
        <Roles {...props} />
      ) : props.step === 1 ? (
        <ToolMode {...props} />
      ) : props.step === 2 ? (
        <HandoffMode {...props} />
      ) : (
        <Summary {...props} />
      )}
    </div>
  )
}
