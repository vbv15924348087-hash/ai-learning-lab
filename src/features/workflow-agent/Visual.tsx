import { Fragment, useState } from 'react'
import type { ChapterVisualProps } from '../curriculum/types'
import './workflow.css'

const fixed = ['搜索资料', '提取参数', '生成对比', '写入报告']

function Route({ failed = false, branch = false }: { failed?: boolean; branch?: boolean }) {
  return (
    <ol className="wf-route" aria-label="预定义路线">
      {fixed.map((label, i) => (
        <Fragment key={label}>
          <li className={failed && i === 0 ? 'wf-failed' : ''}>
            <span>{String.fromCharCode(65 + i)}</span>
            {label}
            {failed && i === 0 && <small>来源无法访问</small>}
          </li>
          {branch && i === 0 && (
            <li className="wf-success">
              <span>↳</span>按预设规则：读取本地 PDF<small>补齐来源后，继续步骤 B</small>
            </li>
          )}
        </Fragment>
      ))}
    </ol>
  )
}

function Detour({ onComplete, completed }: ChapterVisualProps) {
  const [failed, setFailed] = useState(completed)
  const [choice, setChoice] = useState(completed ? 'file' : '')
  return (
    <>
      <div className="wf-compare">
        <section>
          <h3>
            Workflow <small>程序预先安排</small>
          </h3>
          <Route failed={failed} />
          <p>
            {failed
              ? '本例未设置备用来源：继续固定步骤会因缺少输入而停止，无法凭空改路线。'
              : 'A → B → C → D，按事先写好的步骤运行。'}
          </p>
        </section>
        <section>
          <h3>
            Agent <small>根据观察重新判断</small>
          </h3>
          <div className="wf-goal">目标：完成有可靠来源的 GPU 报告</div>
          <div className="wf-options">
            {[
              ['search', '再次搜索'],
              ['file', '读取已有官方 PDF'],
              ['code', '运行代码'],
              ['ask', '咨询研究 Agent'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                disabled={!failed}
                aria-pressed={choice === id}
                onClick={() => {
                  setChoice(id)
                  if (id === 'file' || id === 'ask' || id === 'search') onComplete()
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <p>
            {failed
              ? '观察：网页失效 → 调整计划 → 选择下一项行动。'
              : '先检查结果，再判断目标还缺什么。'}
          </p>
        </section>
      </div>
      <button className="cr-action" type="button" disabled={failed} onClick={() => setFailed(true)}>
        制造异常：资料无法访问
      </button>
      {failed && <p className="cr-hint">下一步：选择右侧的一项行动，继续寻找可靠来源。</p>}
      {choice && (
        <div className="cr-result" role="status">
          {choice === 'code'
            ? '运行代码可以处理已有数据，但此时缺的是可靠资料。请选择能补充来源的行动。'
            : `已调整路线：${choice === 'file' ? '读官方 PDF，提取原始参数' : choice === 'search' ? '换用其他检索词，寻找可访问的官方资料' : '委派研究 Agent 寻找可靠来源'}。下一步再根据结果判断。`}
        </div>
      )}
    </>
  )
}

function Branch({ onComplete, completed }: ChapterVisualProps) {
  const [enabled, setEnabled] = useState(completed)
  return (
    <>
      <Route failed branch={enabled} />
      <button
        type="button"
        className="cr-action"
        onClick={() => {
          setEnabled(true)
          onComplete()
        }}
        disabled={enabled}
      >
        加入预定义异常分支
      </button>
      <div className="cr-result" role="status">
        {enabled
          ? '网站失败 → 读取本地 PDF：这条应急路线由程序提前定义，仍然是 Workflow。'
          : '给流程加一条规则：如果网站无法访问，就读取本地 PDF。'}
      </div>
      <p className="cr-caption">DAG 可以画出没有回环的依赖关系；包含循环的工作流不属于 DAG。</p>
    </>
  )
}

function System({ onComplete, completed }: ChapterVisualProps) {
  const [selected, setSelected] = useState(completed)
  return (
    <>
      <div className="wf-hybrid">
        <div className="cr-node">固定：输入检查</div>
        <span aria-hidden="true">→</span>
        <button type="button" aria-pressed={selected} onClick={() => setSelected(true)}>
          动态：Agent 选择研究路径
        </button>
        <span aria-hidden="true">→</span>
        <div className="cr-node">固定：审核报告</div>
      </div>
      {selected && (
        <p className="cr-result" role="status">
          只有中间的研究路径交给模型判断；外层编排仍负责边界、状态与验证。这可以组成 Agentic
          Workflow。
        </p>
      )}
      <button className="cr-action" type="button" disabled={!selected} onClick={onComplete}>
        我能区分：预定义路径与动态决策
      </button>
    </>
  )
}

export default function WorkflowVisual(props: ChapterVisualProps) {
  return (
    <div className="cr-visual wf-visual" aria-label="Workflow 与 Agent 教学示意">
      <p className="cr-caption">教学示意 · 不访问外部服务</p>
      {props.step === 0 ? (
        <>
          <div className="wf-compare">
            <section>
              <h3>事先排好每一步</h3>
              <Route />
            </section>
            <section>
              <h3>给定目标，边看边决定</h3>
              <div className="wf-goal">目标：研究 GPU 并写报告</div>
              <p>搜索？读文件？计算？请其他 Agent 协助？</p>
              <p>行动取决于现在缺少什么。</p>
            </section>
          </div>
          <button className="cr-action" type="button" onClick={props.onComplete}>
            查看两条路线：开始比较
          </button>
        </>
      ) : props.step === 1 ? (
        <Detour {...props} />
      ) : props.step === 2 ? (
        <Branch {...props} />
      ) : (
        <System {...props} />
      )}
    </div>
  )
}
