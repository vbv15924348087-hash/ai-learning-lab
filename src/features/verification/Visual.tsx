import { useState } from 'react'
import type { ChapterVisualProps } from '../curriculum/types'
import { testPowerConversion } from './data'
import './verification.css'

function Problem({ onComplete, completed }: ChapterVisualProps) {
  const [answer, setAnswer] = useState(completed ? 'check' : '')
  return (
    <>
      <div className="vf-report">
        <span>AGENT 的完成声明</span>
        <h3>“GPU 功耗为 4 kW。报告完成了。”</h3>
        <p>原始资料：400 W · 教学样例</p>
      </div>
      <div className="vf-actions">
        <button className="cr-secondary" type="button" onClick={() => setAnswer('trust')}>
          直接接受它的结论
        </button>
        <button
          className="cr-action"
          type="button"
          onClick={() => {
            setAnswer('check')
            onComplete()
          }}
        >
          先检查单位与来源
        </button>
      </div>
      {answer && (
        <p className="cr-result" role="status">
          {answer === 'trust'
            ? '400 W = 0.4 kW，报告把结果放大了 10 倍。完成声明不能代替检查。'
            : '先定义可检查条件：400 W 应转换为 0.4 kW，而且报告要保留来源。'}
        </p>
      )}
    </>
  )
}

const actions = [
  '生成换算代码',
  '运行测试',
  '读取错误信息',
  '修复换算代码',
  '重新运行测试',
  '核对原始需求',
  '全部条件满足，标记完成',
]
const stages = [
  'Generate',
  'Run Test · FAIL',
  'Read Error',
  'Fix',
  'Run Test · PASS',
  'Requirement Check · PASS',
  'DONE',
]

function VerificationLoop({ onComplete, completed }: ChapterVisualProps) {
  const [stage, setStage] = useState(completed ? 7 : 0)
  const check = testPowerConversion(stage >= 4)
  const needsRepair = stage >= 5 && stage < 7 && !check.passed
  const advance = () => {
    if (needsRepair) {
      setStage(3)
      return
    }
    setStage(stage + 1)
    if (stage === 6 && check.passed) onComplete()
  }
  return (
    <div className="vf-workbench">
      <ol className="vf-timeline" aria-label="验证循环进度">
        {stages.map((label, index) => (
          <li
            key={label}
            className={
              stage > index && !(index >= 4 && needsRepair)
                ? 'vf-complete'
                : stage === index || (index === 4 && needsRepair)
                  ? 'vf-current'
                  : ''
            }
          >
            <span>{stage > index && !(index >= 4 && needsRepair) ? '✓' : index + 1}</span>
            {index === 4 && needsRepair ? 'Run Test · FAIL' : label}
          </li>
        ))}
      </ol>
      <section className="vf-console">
        <div className="vf-source">
          输入：400 W <span>预期：0.4 kW</span>
        </div>
        <pre aria-label="教学换算代码">
          {stage === 0
            ? '// 等待生成教学样例'
            : `function wattsToKW(watts) {\n  return watts / ${stage >= 4 ? '1000' : '100'};\n}`}
        </pre>
        <div className="vf-output" role="status">
          {stage === 0 ? (
            <p>先生成一次结果，再让检查给出证据。</p>
          ) : stage === 1 ? (
            <p>代码已经生成。还没有运行测试，不能判定正确。</p>
          ) : stage === 2 ? (
            <>
              <strong className="vf-fail">FAIL · 换算不符合预期</strong>
              <p>断言：wattsToKW(400) 应为 0.4。</p>
            </>
          ) : stage === 3 ? (
            <>
              <strong className="vf-fail">读取错误：Expected 0.4，Received 4</strong>
              <p>实际结果比预期大 10 倍。1 kW = 1000 W，检查除数。</p>
            </>
          ) : stage === 4 ? (
            <p>修复已应用。代码变化还不是验证结果，请重新测试。</p>
          ) : needsRepair ? (
            <>
              <strong className="vf-fail">
                TEST FAIL · Expected {check.expected}，Received {check.actual}
              </strong>
              <p>检查仍未通过，不能继续核对需求或标记完成。返回修复，再次运行测试。</p>
            </>
          ) : stage === 5 ? (
            <>
              <strong className="vf-pass">
                TEST PASS · {check.actual} = {check.expected}
              </strong>
              <p>单位测试通过。报告是否满足全部要求，还没有检查。</p>
            </>
          ) : stage === 6 ? (
            <>
              <strong className="vf-pass">REQUIREMENTS PASS</strong>
              <p>✓ 单位正确：400 W = 0.4 kW</p>
              <p>✓ 附有来源：内部 GPU 参数表（教学样例），第 2 页</p>
            </>
          ) : (
            <>
              <strong className="vf-pass">DONE · 已满足本例的完成条件</strong>
              <p>
                最终报告：GPU 功耗为 400 W（0.4 kW）。来源：内部 GPU 参数表（教学样例），第 2 页。
              </p>
            </>
          )}
        </div>
        <button className="cr-action" type="button" disabled={stage === 7} onClick={advance}>
          {stage === 7 ? '验证完成' : needsRepair ? '测试未通过，返回修复' : actions[stage]}
        </button>
        <p className="cr-caption">
          固定样例断言在此页执行。只覆盖本例，不是外部测试服务或真实 GPU 数据。
        </p>
      </section>
    </div>
  )
}

function EvalComparison({ onComplete, completed }: ChapterVisualProps) {
  const [seen, setSeen] = useState<string[]>(completed ? ['single', 'set'] : [])
  const [active, setActive] = useState('')
  const select = (id: string) => {
    setActive(id)
    const next = [...new Set([...seen, id])]
    setSeen(next)
    if (next.length === 2) onComplete()
  }
  return (
    <>
      <div className="vf-actions">
        <button
          type="button"
          className="cr-secondary"
          aria-pressed={active === 'single'}
          onClick={() => select('single')}
        >
          单项检查 {seen.includes('single') ? '✓' : ''}
        </button>
        <button
          type="button"
          className="cr-secondary"
          aria-pressed={active === 'set'}
          onClick={() => select('set')}
        >
          任务集评估 {seen.includes('set') ? '✓' : ''}
        </button>
      </div>
      {active && (
        <div className="cr-result" role="status">
          {active === 'single' ? (
            <>
              <h3>这一次交付，满足条件了吗？</h3>
              <p>Unit Test 检查函数；Evaluator 按规则核对来源与需求；Critic 可以提出改进意见。</p>
            </>
          ) : (
            <>
              <h3>在一组任务上，系统表现如何？</h3>
              <p>
                Eval 使用一致规则评估；Benchmark 提供可比较的任务与协议。还应记录失败、成本与时延。
              </p>
            </>
          )}
          <p>模型自检和模型评分都可能出错。应尽可能结合可复核的外部证据。</p>
        </div>
      )}
      <p className="cr-hint">已查看 {seen.length} / 2。下一步：查看另一种检查视角。</p>
    </>
  )
}

function ExitGate({ onComplete, completed }: ChapterVisualProps) {
  const [seen, setSeen] = useState<string[]>(completed ? ['fail', 'pass'] : [])
  const [active, setActive] = useState('')
  return (
    <>
      <div className="vf-gate">
        <div className="cr-node">生成结果</div>
        <span aria-hidden="true">→</span>
        <div className="cr-node">验证完成条件</div>
        <div className="vf-gate-branches">
          {[
            ['fail', 'FAIL → 带错误回到 Loop'],
            ['pass', 'PASS → 最终交付'],
          ].map(([id, label]) => (
            <button
              type="button"
              key={id}
              className="cr-secondary"
              aria-pressed={active === id}
              onClick={() => {
                setActive(id)
                const next = [...new Set([...seen, id])]
                setSeen(next)
                if (next.length === 2) onComplete()
              }}
            >
              {label}
              {seen.includes(id) ? ' ✓' : ''}
            </button>
          ))}
        </div>
      </div>
      {active && (
        <p className="cr-result" role="status">
          {active === 'fail'
            ? '验证失败 → 错误作为 Observation 加入 Context → Agent 修复 → 再次验证。'
            : '满足事先明确的完成条件 → 交付结果与证据。PASS 的可信范围受验证覆盖范围限制。'}
        </p>
      )}
      <p className="cr-hint">下一步：分别点击两条分支（{seen.length} / 2）。</p>
    </>
  )
}

export default function VerificationVisual(props: ChapterVisualProps) {
  return (
    <div className="cr-visual vf-visual" aria-label="Verification 教学示意">
      <p className="cr-caption">教学示意 · 数据与报告均为固定练习样例</p>
      {props.step === 0 ? (
        <Problem {...props} />
      ) : props.step === 1 ? (
        <VerificationLoop {...props} />
      ) : props.step === 2 ? (
        <EvalComparison {...props} />
      ) : (
        <ExitGate {...props} />
      )}
    </div>
  )
}
