import { Check, Lightbulb } from 'lucide-react'
import type { ModelInsideStep } from '../types'
import { DeepDivePanel } from './DeepDivePanel'
import { TemperatureExplorer } from './TemperatureExplorer'
import { modelTerms } from '../data/modelTerms'

export function ModelStepExplanation({
  step,
  learned,
}: {
  step: ModelInsideStep
  learned: boolean
}) {
  const term = modelTerms.find((item) => item.id === step.unlockedTerm)
  return (
    <aside className="so-explanation mi-explanation" aria-label="当前步骤解释">
      <p className="so-panel-kicker">{step.kicker}</p>
      <h2>{step.title}</h2>
      <p className="so-main-explanation">{step.beginnerExplanation}</p>
      <div className="so-why">
        <span>
          <Lightbulb size={15} />
          记住这个关系
        </span>
        <p>{step.whyItMatters}</p>
      </div>
      {term && learned && (
        <div className="mi-term-reveal" role="status">
          <span>
            <Check size={15} />
            现在，认识它的名字
          </span>
          <h3>
            {term.english} <small>{term.chinese}</small>
          </h3>
          <p>{term.definition}</p>
        </div>
      )}
      {step.mode === 'tokenization' && learned && (
        <DeepDivePanel title="Tokenizer 怎样切分文字？">
          <p>
            Tokenizer 是把文字转换成 Token 序列的处理器。不同模型可能使用不同的切分规则；Token
            不固定对应一个汉字或英文单词。
          </p>
        </DeepDivePanel>
      )}
      {step.mode === 'embedding' && learned && (
        <DeepDivePanel technical title="编号与数字表示有何不同？">
          <p>
            Token ID 是查表用的编号。Embedding 表里的数值通过训练学得，正常聊天时按编号取出。
            “向量”在这里指一组有顺序的数字，不需要把每个数都翻译成一个词。
          </p>
          <p>同一个 Token 先取出同一组起始数字，后面再结合位置和当前上下文进行计算。</p>
        </DeepDivePanel>
      )}
      {step.mode === 'transformer' && learned && (
        <DeepDivePanel technical title="每层真的都在做相同的事吗？">
          <p>
            各层都接收并更新表示，但使用各自在训练中学到的参数。Attention
            与其他计算模块一起参与更新；不能把第 1 层固定称作“认字”、第 2 层固定称作“理解语法”。
          </p>
          <p>
            图里的数字只用来标明信息怎样传递和改变，没有模拟真实层的计算。图中只放大一个词，实际会处理更多位置的表示。
          </p>
        </DeepDivePanel>
      )}
      {step.mode === 'attention' && learned && (
        <DeepDivePanel title="Self-Attention">
          <p>
            当同一输入序列的不同位置彼此建立关系时，我们称之为
            Self-Attention。生成式模型中，当前位置通常只能参考它之前和当前位置的信息。图中连线仅用于帮助理解，不是模型真实权重，也不能用来证明模型的推理过程。
          </p>
        </DeepDivePanel>
      )}
      {step.mode === 'scores' && (
        <DeepDivePanel technical title="Logits 与 Sampling">
          <p>
            <strong>Logits</strong> 是模型给候选 Token
            的原始分数，还不是概率。分数可以转换为一个分布，再按生成设置选出下一个 Token。
          </p>
          <p>
            <strong>Sampling</strong> 是从候选分布中选取 Token
            的方法。生成并不总是选择分数最高的候选。
          </p>
        </DeepDivePanel>
      )}
      {step.mode === 'generation' && (
        <>
          <DeepDivePanel title="推理模型为什么“想得更久”？">
            <p>
              基础生成机制仍然是一步一步产生后续输出。现代推理模型在复杂任务上可以投入更多推理计算（inference
              compute），进行多步分析、检查和调整，再形成最终输出或下一步动作。
            </p>
            <p>逐步生成与复杂推理并不冲突，也不意味着内部住着一个先写好完整回答的“小脑袋”。</p>
          </DeepDivePanel>
          <DeepDivePanel title="为什么同一个问题有时回答不一样？">
            <TemperatureExplorer />
          </DeepDivePanel>
        </>
      )}
      {step.mode === 'inference' && (
        <DeepDivePanel technical title="Context 与模型参数">
          <p>
            当前对话会改变提供给模型的
            Context，正常使用并不会因此直接更新模型参数。模型改进所用的后续训练，是另一项独立过程。
          </p>
        </DeepDivePanel>
      )}
    </aside>
  )
}
