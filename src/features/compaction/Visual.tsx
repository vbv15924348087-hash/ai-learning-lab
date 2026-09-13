import { useState } from 'react'
import type { ChapterVisualProps } from '../curriculum/types'
import { checkpointItems } from './data'
import './compaction.css'

function Capacity({ amount }: { amount: number }) {
  return (
    <div className="cp-capacity">
      <div className="cp-meter-label">
        <strong>当前 Context Window</strong>
        <span>
          {amount}%{amount === 90 ? ' · Almost Full' : ''}
        </span>
      </div>
      <div
        className="cp-meter"
        role="progressbar"
        aria-label="Context 占用教学示意"
        aria-valuenow={amount}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={amount >= 90 ? 'cp-near-full' : ''} style={{ width: `${amount}%` }} />
      </div>
      <p>当前一次推理可见的工作资料 · 百分比仅作教学示意</p>
    </div>
  )
}

function MemoryShelf() {
  return (
    <aside className="cp-memory">
      <strong>长期 Memory · 独立保存</strong>
      <span>用户偏好：报告需要出处</span>
      <span>已存项目背景：研究 AI GPU</span>
      <small>压缩当前 Context 不会删除这里的信息。</small>
    </aside>
  )
}

function Grow({ onComplete, completed }: ChapterVisualProps) {
  const [stage, setStage] = useState(completed ? 4 : 0)
  const amount = [40, 70, 90, 35, 35][stage]
  return (
    <>
      <Capacity amount={amount} />
      <div className="cp-workspace">
        <section>
          <h3>{stage < 3 ? '不断增长的工作历史' : '整理后的接续摘要'}</h3>
          {stage < 3 ? (
            <div className="cp-history">
              <div>任务目标、用户要求、关键证据</div>
              <div>搜索记录、网页全文、对话历史</div>
              {stage >= 1 && <div className="cp-noise">重复搜索 + 工具输出 + 旧版报告</div>}
              {stage >= 2 && <div className="cp-noise">更多重复页面 + 报错 + 修复记录</div>}
            </div>
          ) : (
            <div className="cp-kept">
              {checkpointItems
                .filter((item) => item.keep)
                .map((item) => (
                  <div key={item.id}>
                    <strong>{item.title}</strong>
                    <span>{item.text}</span>
                  </div>
                ))}
            </div>
          )}
        </section>
        <MemoryShelf />
      </div>
      {stage >= 3 && (
        <p className="cp-removed">
          已合并 / 移出当前
          Context：重复日志、已提取关键信息的旧输出、重复页面、冗余消息。关键失败与证据保留。
        </p>
      )}
      <button
        type="button"
        className="cr-action"
        disabled={stage === 4}
        onClick={() => {
          setStage(stage + 1)
          if (stage === 3) onComplete()
        }}
      >
        {stage === 0
          ? '继续读取资料：40% → 70%'
          : stage === 1
            ? '再推进一轮：70% → 90%'
            : stage === 2
              ? '压缩历史 Context'
              : stage === 3
                ? '读取摘要，恢复继续工作'
                : '已从关键状态接续任务'}
      </button>
      <p className="cr-result" role="status">
        {stage === 0
          ? 'Context 还有空间。推进几轮，观察历史如何累积。'
          : stage === 1
            ? 'Context 已占用 70%。新工具结果还会继续加入。'
            : stage === 2
              ? 'Context 已占用 90%，接近上限。需要为下一轮工作预留空间。'
              : stage === 3
                ? 'Compaction：90% → 35%。目标与关键状态保留，Memory 不变。压缩比例仅为示意。'
                : '已读取待办与证据：下一项是核对功耗单位，而不是把整项研究当作完成。'}
      </p>
    </>
  )
}

function SelectState({ onComplete, completed }: ChapterVisualProps) {
  const required = checkpointItems.filter((item) => item.keep).map((item) => item.id)
  const [selected, setSelected] = useState<string[]>(completed ? required : [])
  const [feedback, setFeedback] = useState('')
  const check = () => {
    const correct =
      selected.length === required.length && required.every((id) => selected.includes(id))
    setFeedback(
      correct
        ? '接续记录完整：目标、状态、决定、失败、待办和证据都保留。重复历史可以归纳或移出当前 Context。'
        : '还需要调整：保留 6 项与继续工作直接相关的信息；重复日志和已归纳的旧全文可以移出，但证据与失败教训不能丢。',
    )
    if (correct) onComplete()
  }
  return (
    <>
      <div className="cp-select" role="group" aria-label="选择需要保存的接续信息">
        {checkpointItems.map((item) => (
          <button
            type="button"
            key={item.id}
            aria-pressed={selected.includes(item.id)}
            onClick={() => {
              setSelected(
                selected.includes(item.id)
                  ? selected.filter((id) => id !== item.id)
                  : [...selected, item.id],
              )
              setFeedback('')
            }}
          >
            <strong>{item.title}</strong>
            <span>{item.text}</span>
            <small>{selected.includes(item.id) ? '✓ 保留' : '点击选择保留'}</small>
          </button>
        ))}
      </div>
      <button type="button" className="cr-action" onClick={check}>
        检查接续记录（已选 {selected.length} 项）
      </button>
      {feedback && (
        <p className="cr-result" role="status">
          {feedback}
        </p>
      )}
    </>
  )
}

function Resume({ onComplete, completed }: ChapterVisualProps) {
  const [stage, setStage] = useState(completed ? 2 : 0)
  return (
    <>
      <div className="cp-resume-flow">
        <div className="cr-node">Checkpoint</div>
        <span aria-hidden="true">→</span>
        <div className={stage > 0 ? 'cr-node cr-active' : 'cr-node'}>新的 Context</div>
        <span aria-hidden="true">→</span>
        <div className={stage > 1 ? 'cr-node cr-active' : 'cr-node'}>下一项行动</div>
      </div>
      <div className="cp-checkpoint">
        <h3>已保存的接续记录</h3>
        <p>目标：完成有来源的 GPU 报告</p>
        <p>当前状态：官方参数已找到，单位待核对</p>
        <p>证据：示例参数表第 2 页，400 W</p>
        <p>TODO：完成单位检查，再补齐来源并审核报告</p>
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
          ? '从 Checkpoint 恢复'
          : stage === 1
            ? '继续待办：核对功耗单位'
            : '已恢复并推进下一项工作'}
      </button>
      <p className="cr-result" role="status">
        {stage === 0
          ? '摘要已经保存，但恢复后仍需要读取它并继续行动。'
          : stage === 1
            ? '目标、状态、证据与待办已装入新的 Context。现在执行明确的下一项检查。'
            : '教学检查：400 W ÷ 1000 = 0.4 kW，单位已核对。下一项仍是补齐来源并审核报告；长任务继续推进。'}
      </p>
    </>
  )
}

export default function CompactionVisual(props: ChapterVisualProps) {
  return (
    <div className="cr-visual cp-visual" aria-label="Compaction 教学示意">
      <p className="cr-caption">教学示意 · 不对应真实模型容量 · 不修改真实 Memory</p>
      {props.step === 0 ? (
        <>
          <Capacity amount={40} />
          <div className="cp-workspace">
            <section className="cp-checkpoint">
              <h3>当前工作桌面</h3>
              <p>本次任务指令 + 对话历史 + 当前工具结果。</p>
              <p>新资料持续进入，空间逐渐被占满。</p>
            </section>
            <MemoryShelf />
          </div>
          <button type="button" className="cr-action" onClick={props.onComplete}>
            开始长任务：观察 Context 增长
          </button>
        </>
      ) : props.step === 1 ? (
        <Grow {...props} />
      ) : props.step === 2 ? (
        <SelectState {...props} />
      ) : (
        <Resume {...props} />
      )}
    </div>
  )
}
