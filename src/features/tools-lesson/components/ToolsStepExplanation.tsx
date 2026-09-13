import { Check, Lightbulb } from 'lucide-react'
import { toolsTerms } from '../data/toolsTerms'
import { toolsLessonSteps } from '../data/toolsLessonSteps'
import { DeepDivePanel } from '../../model-inside/components/DeepDivePanel'
import type { ToolTermId } from '../types'

export function ToolsStepExplanation({
  step,
  unlockedTerms,
  interacted,
}: {
  step: (typeof toolsLessonSteps)[number]
  unlockedTerms: ToolTermId[]
  interacted: boolean
}) {
  const term = toolsTerms.find(
    (item) => item.id === step.unlockedTerm && unlockedTerms.includes(item.id),
  )
  const discovery = !interacted
    ? {
        call: {
          explanation:
            '工具已经选好了。模型要怎样把“我要搜索”这个决定告诉系统？先把左边这句话变成请求，再点开字段看看。',
          why: '系统需要准确知道使用哪个工具，以及这一次要查什么。',
        },
        checkpoint: {
          explanation:
            '你已经亲手生成了一份写着工具名称和参数的请求。先别急着继续：有了这份请求，外部世界就已经发生变化了吗？',
          why: '把“发出请求”和“动作发生”放在一起比较，想想中间是否还缺少一个角色。',
        },
        schema: {
          explanation:
            '你刚刚看到了请求里的 query。模型是怎么知道这个字段的名字，以及应该填入什么内容的？打开左边的说明来找答案。',
          why: '理解参数从哪里来，就能分清一份通用说明和这一次具体的请求。',
        },
      }[step.mode as 'call' | 'checkpoint' | 'schema']
    : undefined
  return (
    <aside className="so-explanation mi-explanation tl-explanation" aria-label="这一步的解释">
      <p className="so-panel-kicker">{step.kicker}</p>
      <h2>{step.title}</h2>
      <p className="so-main-explanation">{discovery?.explanation ?? step.beginnerExplanation}</p>
      <div className="so-why">
        <span>
          <Lightbulb size={15} /> 为什么这很重要？
        </span>
        <p>{discovery?.why ?? step.whyItMatters}</p>
      </div>
      {term && (
        <div className="mi-term-reveal" aria-live="polite">
          <span>
            <Check size={15} /> 你刚刚认识了
          </span>
          <h3>
            {term.label}
            <small>{term.chinese}</small>
          </h3>
          <p>{term.levels[0]}</p>
          <DeepDivePanel title={`${term.label} 的准确含义`} technical>
            <p>{term.levels[1]}</p>
            <p>{term.levels[2]}</p>
          </DeepDivePanel>
        </div>
      )}
      <div className="tl-step-cue">
        <span>这一刻，留意</span>
        <p>{step.interactionHint}</p>
      </div>
      <p className="tl-explanation-foot">
        <span>LEARN BY DOING</span> 每一次点击，都让理解再往前一步。
      </p>
    </aside>
  )
}
