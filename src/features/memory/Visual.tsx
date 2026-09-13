import { useState } from 'react'
import type { ChapterVisualProps } from '../curriculum/types'
import { memoryCandidates, memoryTypes } from './data'
import './memory.css'

function MemoryLifecycle({ onComplete }: Pick<ChapterVisualProps, 'onComplete'>) {
  const [phase, setPhase] = useState(0)
  const [picked, setPicked] = useState<string[]>([])
  const [saved, setSaved] = useState<string[]>([])
  const relevant = memoryCandidates.filter((item) => saved.includes(item.id) && item.usefulNextTask)
  const toggle = (id: string) =>
    setPicked((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  return (
    <div className="mm-lifecycle">
      <div className="mm-task-label">
        <span className="cr-tag">教学模拟 · 本次演示内保存，重播清空</span>
        <strong>{phase === 0 ? 'TASK 1 / 研究结束' : 'TASK 2 / 新任务开始'}</strong>
      </div>
      <div className="mm-columns">
        <section className="mm-work">
          <span className="mm-eyebrow">{phase === 0 ? '哪些信息值得留下？' : '当前 Context'}</span>
          {phase === 0 ? (
            <>
              <h3>你可以选择写入 Memory 的内容。</h3>
              {memoryCandidates.map((item) => (
                <label
                  className={`mm-pick ${picked.includes(item.id) ? 'mm-picked' : ''}`}
                  key={item.id}
                >
                  <input
                    type="checkbox"
                    checked={picked.includes(item.id)}
                    onChange={() => toggle(item.id)}
                  />
                  <span>
                    <small>{item.label}</small>
                    {item.text}
                  </span>
                </label>
              ))}
            </>
          ) : (
            <>
              <h3>“再研究一款适合我们集群的 GPU。”</h3>
              <div className="mm-context-line">本次用户请求</div>
              {phase < 3 ? (
                <div className="mm-empty">还没有加入上次任务的信息。</div>
              ) : (
                <div className="mm-context-memory">
                  <span>来自 Memory 的相关偏好</span>
                  <strong>{relevant[0]?.text}</strong>
                </div>
              )}
            </>
          )}
        </section>
        <section className="mm-vault">
          <span className="mm-eyebrow">MEMORY / 跨任务仓库</span>
          <h3>{saved.length} 条已保存信息</h3>
          {saved.length === 0 ? (
            <p className="mm-empty">仓库为空。写入后，开始新任务也能在这里保留。</p>
          ) : (
            memoryCandidates
              .filter((item) => saved.includes(item.id))
              .map((item) => (
                <article
                  key={item.id}
                  className={`mm-stored ${phase >= 2 && item.usefulNextTask ? 'mm-found' : ''}`}
                >
                  <small>{phase >= 2 && item.usefulNextTask ? '✓ 与新任务相关' : item.label}</small>
                  <p>{item.text}</p>
                </article>
              ))
          )}
          <p className="cr-caption">存储区与当前 Context 是两个不同位置。</p>
        </section>
      </div>
      {phase === 0 && (
        <div className="mm-actions">
          <button
            className="cr-action"
            onClick={() => {
              setSaved(picked)
              setPhase(1)
            }}
          >
            {picked.length > 0
              ? `保存 ${picked.length} 条并开始 Task 2 →`
              : '不保存，直接开始 Task 2 →'}
          </button>
        </div>
      )}
      {phase === 1 && (
        <>
          <p className="cr-result" role="status">
            新任务开始了。仓库中的内容还没有自动进入这次输入。
          </p>
          <button className="cr-action" onClick={() => setPhase(2)}>
            检索与新研究任务相关的记忆 →
          </button>
        </>
      )}
      {phase === 2 && (
        <>
          <p className="cr-result" role="status">
            {relevant.length > 0
              ? '找到 1 条相关偏好。上次方案被排除的经历没有直接决定新产品的结论，暂不加入。'
              : '没有找到保存的报告偏好。没有写入的信息，检索也无法凭空恢复。'}
          </p>
          {relevant.length > 0 ? (
            <button className="cr-action" onClick={() => setPhase(3)}>
              把相关偏好加入本轮 Context →
            </button>
          ) : (
            <button className="cr-action" onClick={() => setPhase(0)}>
              返回 Task 1，重新选择保存内容 →
            </button>
          )}
        </>
      )}
      {phase === 3 && (
        <>
          <p className="cr-result" role="status">
            现在模型这一轮可以看见中文与来源偏好。Memory → Retrieval → Context 的路径已经走完。
          </p>
          <button className="cr-action" onClick={onComplete}>
            确认：保存不等于自动可见 →
          </button>
        </>
      )}
    </div>
  )
}

const comparisons = [
  { id: 'context', text: '模型此刻收到的用户问题、系统指令和选中资料。', answer: 'Context' },
  { id: 'memory', text: '把“报告用中文”存下来，下一次研究时还能找回。', answer: 'Memory' },
  { id: 'rag', text: '为这次采购问题，从内部 PDF 中检索相关机房约束。', answer: 'RAG' },
]

function BoundaryCompare({ onComplete }: Pick<ChapterVisualProps, 'onComplete'>) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const allCorrect = comparisons.every((item) => answers[item.id] === item.answer)
  return (
    <div className="cr-visual">
      <div className="mm-boundary">
        {comparisons.map((item, index) => (
          <section key={item.id}>
            <span>情境 {index + 1}</span>
            <h3>{item.text}</h3>
            <div className="mm-actions">
              {['Context', 'Memory', 'RAG'].map((answer) => (
                <button
                  className="cr-secondary"
                  key={answer}
                  aria-pressed={answers[item.id] === answer}
                  aria-label={`情境 ${index + 1}：${answer}`}
                  onClick={() => setAnswers((current) => ({ ...current, [item.id]: answer }))}
                >
                  {answer}
                </button>
              ))}
            </div>
            {answers[item.id] && (
              <p role="status" className="cr-caption">
                {answers[item.id] === item.answer
                  ? '判断正确。关注这个情境在系统中承担的职责。'
                  : '再想一想：它强调的是当前可见、跨任务保存，还是检索外部证据？'}
              </p>
            )}
          </section>
        ))}
      </div>
      <button className="cr-action" disabled={!allCorrect} onClick={onComplete}>
        {allCorrect ? '三个边界都分清了 →' : '完成三个情境判断'}
      </button>
    </div>
  )
}

export default function ChapterVisual({ step, onComplete }: ChapterVisualProps) {
  const [cleared, setCleared] = useState(false)
  const [visited, setVisited] = useState<string[]>([])
  const [active, setActive] = useState<string | null>(null)
  if (step === 1) return <MemoryLifecycle onComplete={onComplete} />
  if (step === 2) return <BoundaryCompare onComplete={onComplete} />
  if (step === 0)
    return (
      <div className="cr-visual">
        <div className="mm-before-after">
          <section>
            <span className="mm-eyebrow">
              {cleared ? '上次任务的输入已结束' : 'TASK 1 / 当前输入'}
            </span>
            <h3>“报告请用中文，并附来源。”</h3>
            <p className={cleared ? 'mm-faded' : ''}>
              {cleared
                ? '没有持久保存，也没有加入下一次 Context。'
                : '这一次模型可以看到这条偏好。'}
            </p>
          </section>
          <span aria-hidden="true">→</span>
          <section className={cleared ? 'mm-new-task' : ''}>
            <span className="mm-eyebrow">TASK 2 / 新输入</span>
            <h3>“再研究一款 GPU。”</h3>
            <p>新输入本身没有提到语言和引用偏好。</p>
          </section>
        </div>
        {!cleared ? (
          <button className="cr-action" onClick={() => setCleared(true)}>
            结束上次输入，开始新任务 →
          </button>
        ) : (
          <>
            <p className="cr-result" role="status">
              偏好没有自动穿过两个任务之间的空隙。需要一个能保存和取回信息的机制。
            </p>
            <button className="cr-action" onClick={onComplete}>
              下一步：建立一份可取回的记忆 →
            </button>
          </>
        )}
      </div>
    )
  const selected = memoryTypes.find((item) => item.id === active)
  return (
    <div className="cr-visual">
      <div className="mm-types">
        {memoryTypes.map((item, index) => (
          <button
            className={`mm-type ${active === item.id ? 'mm-selected' : ''}`}
            key={item.id}
            aria-pressed={active === item.id}
            onClick={() => {
              setActive(item.id)
              setVisited((current) => (current.includes(item.id) ? current : [...current, item.id]))
            }}
          >
            <small>{index < 2 ? '按保留范围' : '按内容组织'}</small>
            <strong>{item.name}</strong>
            <span>{item.label}</span>
            <b aria-label={visited.includes(item.id) ? '已探索' : '点击探索'}>
              {visited.includes(item.id) ? '✓' : '+'}
            </b>
          </button>
        ))}
      </div>
      {selected && (
        <div className="cr-result" role="status">
          <strong>{selected.example}</strong>
          <p>{selected.explanation}</p>
        </div>
      )}
      <p>经历可以长期保存，稳定知识也可以临时使用。两组分类能够交叉。</p>
      <button className="cr-action" disabled={visited.length < 4} onClick={onComplete}>
        {visited.length < 4
          ? `已探索 ${visited.length} / 4 个视角`
          : '确认：时间范围与内容类型可以交叉 →'}
      </button>
    </div>
  )
}
