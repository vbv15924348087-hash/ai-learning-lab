import { useState } from 'react'
import type { ChapterVisualProps } from '../curriculum/types'
import { capabilityTypes, services } from './data'
import './mcp.css'

function ServerExplorer({ onComplete }: Pick<ChapterVisualProps, 'onComplete'>) {
  const [selected, setSelected] = useState('github')
  const [called, setCalled] = useState<string[]>([])
  const [resultFor, setResultFor] = useState<string | null>(null)
  const service = services.find((item) => item.id === selected)!
  const hasResult = resultFor === selected
  return (
    <div className="mp-explorer">
      <span className="cr-tag">教学模拟 · 不连接真实服务，不执行真实请求</span>
      <div className="mp-host">
        <strong>同一个 Agent / Harness</strong>
        <span>模型决定需要什么 · 宿主管理连接与权限</span>
        <div className="mp-client">MCP Client 连接层</div>
      </div>
      <div className="mp-protocol">
        <span>↓</span>
        <strong>MCP · 共同的协议约定</strong>
        <span>↓</span>
      </div>
      <div className="mp-servers" role="group" aria-label="切换 MCP Server">
        {services.map((item) => (
          <button
            key={item.id}
            className={`mp-server ${selected === item.id ? 'mp-selected' : ''}`}
            aria-label={`${item.name} MCP Server`}
            aria-pressed={selected === item.id}
            onClick={() => {
              setSelected(item.id)
              setResultFor(null)
            }}
          >
            <span className="mp-symbol">{item.symbol}</span>
            <strong>{item.name}</strong>
            <small>MCP Server</small>
            <span className="mp-server-state">
              {called.includes(item.id) ? '✓ 已体验' : '点击探索 →'}
            </span>
          </button>
        ))}
      </div>
      <div className="mp-service-detail">
        <div>
          <span className="mp-eyebrow">
            {service.name.toUpperCase()} SERVER → {service.external}
          </span>
          <h3>{service.purpose}</h3>
          <p>本示例提供的 Tool：</p>
          <code>{service.tool}</code>
          <pre>{service.args}</pre>
          <button
            className="cr-action"
            onClick={() => {
              setResultFor(selected)
              setCalled((current) =>
                current.includes(selected) ? current : [...current, selected],
              )
            }}
          >
            模拟读取 {service.name} →
          </button>
        </div>
        <div className="mp-result" aria-live="polite">
          {hasResult ? (
            <>
              <span className="mp-eyebrow">模拟返回 · TOOL RESULT</span>
              <h3>{service.result}</h3>
              <p>Server → MCP Client → Harness → Context → Model</p>
              <small>结果补回输入，模型才有材料继续判断。</small>
            </>
          ) : (
            <>
              <span className="mp-eyebrow">等待你的动作</span>
              <h3>已经发现工具，还没有执行调用。</h3>
              <p>点击左侧“模拟读取”，观察结果怎样回到 Context。</p>
            </>
          )}
        </div>
      </div>
      <p className="cr-caption">
        这里是课程自定义的 Server 能力示例，不代表某个真实官方服务的固定工具清单。
      </p>
      <div className="mp-footer">
        <span role="status">已体验 {called.length} / 3 个服务</span>
        <button className="cr-action" disabled={called.length < 3} onClick={onComplete}>
          {called.length < 3 ? '请分别模拟读取三个服务' : '确认：协议相同，能力不同 →'}
        </button>
      </div>
    </div>
  )
}

function ProtocolParts({ onComplete }: Pick<ChapterVisualProps, 'onComplete'>) {
  const [selected, setSelected] = useState<string | null>(null)
  const [seen, setSeen] = useState<string[]>([])
  const [transport, setTransport] = useState<'stdio' | 'http'>('stdio')
  const [seenHttp, setSeenHttp] = useState(false)
  const capability = capabilityTypes.find((item) => item.id === selected)
  return (
    <div className="cr-visual">
      <span className="cr-tag">Server 可以声明以下能力，不必全部实现</span>
      <div className="mp-capabilities">
        {capabilityTypes.map((item) => (
          <button
            className={`mp-capability ${selected === item.id ? 'mp-selected' : ''}`}
            key={item.id}
            aria-label={`${item.name} ${item.label}`}
            aria-pressed={selected === item.id}
            onClick={() => {
              setSelected(item.id)
              setSeen((current) => (current.includes(item.id) ? current : [...current, item.id]))
            }}
          >
            <span>{seen.includes(item.id) ? '✓' : '+'}</span>
            <strong>{item.name}</strong>
            <small>{item.label}</small>
          </button>
        ))}
      </div>
      {capability && (
        <div className="cr-result" role="status">
          <strong>{capability.analogy}</strong>
          <p>{capability.detail}</p>
          <code className="mp-example">{capability.example}</code>
        </div>
      )}
      <div className="mp-transport">
        <div>
          <span className="mp-eyebrow">TRANSPORT / 消息怎么送过去？</span>
          <h3>
            {transport === 'stdio'
              ? '同一台机器：通过进程的标准输入 / 输出。'
              : '通过网络：使用 Streamable HTTP 交换消息。'}
          </h3>
          <div className="mp-transport-line">
            <span>MCP Client</span>
            <strong>{transport === 'stdio' ? '⇄ stdio ⇄' : '⇄ HTTP ⇄'}</strong>
            <span>MCP Server</span>
          </div>
          <p>
            {transport === 'stdio'
              ? '常用于宿主启动的本地 Server 进程。'
              : '可用于通过 HTTP 提供服务的 Server，按部署方案处理认证、会话与访问权限。'}
          </p>
        </div>
        <div className="mp-transport-buttons" role="group" aria-label="比较 Transport">
          <button
            className="cr-secondary"
            aria-pressed={transport === 'stdio'}
            onClick={() => setTransport('stdio')}
          >
            本地 stdio
          </button>
          <button
            className="cr-secondary"
            aria-pressed={transport === 'http'}
            onClick={() => {
              setTransport('http')
              setSeenHttp(true)
            }}
          >
            网络 Streamable HTTP
          </button>
        </div>
      </div>
      <button className="cr-action" disabled={seen.length < 3 || !seenHttp} onClick={onComplete}>
        {seen.length < 3
          ? `请探索三种能力（${seen.length} / 3）`
          : !seenHttp
            ? '再比较网络 Transport'
            : '确认：能力类型与传输方式各有职责 →'}
      </button>
    </div>
  )
}

export default function ChapterVisual({ step, onComplete, completed }: ChapterVisualProps) {
  const [feedback, setFeedback] = useState(false)
  if (step === 1) return <ServerExplorer onComplete={onComplete} />
  if (step === 2) return <ProtocolParts onComplete={onComplete} />
  if (step === 0)
    return (
      <div className="cr-visual">
        <div className="mp-problem">
          <div className="mp-problem-agent">研究助手</div>
          <div className="mp-problem-services">
            {services.map((service) => (
              <div key={service.id}>
                <strong>{service.name}</strong>
                <span>{service.external}</span>
              </div>
            ))}
          </div>
        </div>
        <p>三个服务的业务实现不同，但系统都需要：发现能力 → 了解参数 → 发出请求 → 接收结果。</p>
        <h3>共同协议主要标准化哪件事？</h3>
        <div className="mp-actions">
          <button className="cr-secondary" onClick={() => setFeedback(true)}>
            替助手决定研究目标
          </button>
          <button className="cr-action" onClick={onComplete}>
            连接与能力交互的方式 →
          </button>
        </div>
        {feedback && (
          <p className="cr-result" role="status">
            研究目标与下一步决策仍由 Agent 处理。连接协议负责系统之间怎样交换能力信息与请求。
          </p>
        )}
      </div>
    )
  return (
    <div className="cr-visual">
      <div className="mp-system-flow">
        <div>
          <strong>MODEL</strong>
          <span>判断需要什么</span>
        </div>
        <b>→</b>
        <div className="mp-highlight">
          <strong>HARNESS + MCP CLIENT</strong>
          <span>检查权限，按协议连接</span>
        </div>
        <b>→</b>
        <div>
          <strong>MCP SERVER</strong>
          <span>提供能力，调用服务实现</span>
        </div>
      </div>
      <div className="mp-return">外部服务结果 → Server → Client → Context → Model 的下一次判断</div>
      <div className="mp-boundary-statement">
        <span>MCP</span>
        <strong>位于连接层的协议</strong>
        <p>模型承担推断，运行系统组织执行，服务器提供能力。协议把两端连接起来。</p>
      </div>
      <p>同一种连接方式，既可以用于预设流程，也可以用于 Agent 的动态选择。</p>
      <button className="cr-action" onClick={onComplete}>
        {completed ? '已确认 MCP 的系统位置' : '我能指出 MCP 在系统中的位置 →'}
      </button>
    </div>
  )
}
