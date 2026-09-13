import { useRef, useState } from 'react'
import { ArrowRight, Check, CreditCard, Hash, RotateCcw } from 'lucide-react'
import { embeddingSamples } from '../data/embeddingDemoData'
import { InteractionHint } from './InteractionHint'
import './embedding-demo.css'

type LookupStage = 0 | 1 | 2
const stageLabels = ['找到编号', '按编号取卡', '把整组数字交给计算']

export function EmbeddingDemo({ onComplete }: { onComplete: () => void }) {
  const [selected, setSelected] = useState(0)
  const [stage, setStage] = useState<LookupStage>(0)
  const [answer, setAnswer] = useState<'id' | 'vector' | null>(null)
  const completed = useRef(false)
  const sample = embeddingSamples[selected]
  const retrieved = stage === 2

  function restart(index = selected) {
    setSelected(index)
    setStage(0)
    setAnswer(null)
  }

  function handOff(choice: 'id' | 'vector') {
    setAnswer(choice)
    if (choice === 'vector' && !completed.current) {
      completed.current = true
      onComplete()
    }
  }

  return (
    <section className="mi-emb-demo" aria-label="文字如何取得数字表示">
      <div className="mi-emb-heading">
        <div>
          <p className="mi-emb-eyebrow">02 / 从文字到数字</p>
          <h3>给「{sample.text}」取一张数字卡</h3>
          <p>编号像取件码；取出的数字卡才交给后面的计算。</p>
        </div>
        <span className="mi-emb-example-badge">教学示意</span>
      </div>
      <ol className="mi-emb-steps" aria-label="取数字卡的三个步骤">
        {stageLabels.map((label, index) => (
          <li
            key={label}
            className={stage === index ? 'is-current' : stage > index ? 'is-done' : ''}
            aria-current={stage === index ? 'step' : undefined}
          >
            <span>{stage > index ? <Check size={13} aria-hidden="true" /> : index + 1}</span>
            {label}
          </li>
        ))}
      </ol>
      <div className="mi-emb-workbench">
        <div className="mi-emb-lookup">
          <div className="mi-emb-picker" aria-label="选择要观察的文字">
            <span>观察这个词</span>
            <div>
              {embeddingSamples.map((item, index) => (
                <button
                  key={item.text}
                  type="button"
                  aria-label={`改看「${item.text}」`}
                  aria-pressed={selected === index}
                  onClick={() => {
                    if (index !== selected) restart(index)
                  }}
                >
                  {item.text}
                </button>
              ))}
            </div>
          </div>
          <div className="mi-emb-word-to-id">
            <div className="mi-emb-word">
              <small>文字小块 · Token</small>
              <strong>{sample.text}</strong>
            </div>
            <ArrowRight size={20} aria-hidden="true" />
            <div className={`mi-emb-id ${stage > 0 ? 'is-found' : ''}`}>
              <small>查表编号 · ID</small>
              <strong>{stage > 0 ? sample.id : '？'}</strong>
            </div>
          </div>
          <div className="mi-emb-narrative" aria-live="polite">
            {stage === 0 && (
              <p>词表为每个 Token 分配了一个编号。先找出「{sample.text}」对应哪一个编号。</p>
            )}
            {stage === 1 && (
              <p>
                找到了：
                <strong>
                  「{sample.text}」的编号是 {sample.id}。
                </strong>
                用它定位右表中的一行，就能取出这一行的整组数字。
              </p>
            )}
            {retrieved && (
              <p>
                已从编号 <strong>{sample.id}</strong> 那一行取出数字卡。
                <strong>下面这组数字和表中完全相同。</strong>
              </p>
            )}
          </div>
          {!retrieved ? (
            <div className="mi-emb-action">
              <InteractionHint>
                {stage === 0 ? '点下面的按钮，找出编号。' : '再点一次，把高亮行的数字取出来。'}
              </InteractionHint>
              <button
                type="button"
                className="button button-primary"
                onClick={() => setStage(stage === 0 ? 1 : 2)}
              >
                {stage === 0 ? `1 · 查找「${sample.text}」的编号` : '2 · 按编号取出数字卡'}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="mi-emb-retrieved" aria-label={`取出的「${sample.text}」数字卡`}>
              <span>
                <CreditCard size={16} aria-hidden="true" />「{sample.text}」的起始数字卡
              </span>
              <div className="mi-emb-numbers">
                {sample.values.map((value, index) => (
                  <b key={index}>{value.toFixed(1)}</b>
                ))}
              </div>
              <p>后面的模型计算只接受数字；这一组是计算材料，还不是答案。</p>
              <p>
                它叫 <strong>Embedding（嵌入向量）</strong>。
              </p>
            </div>
          )}
        </div>
        <div className="mi-emb-table-panel">
          <div className="mi-emb-table-heading">
            <h4>模型里的数字表</h4>
            <span>只展示 3 行</span>
          </div>
          <p>
            编号只用来找行，数字卡提供可计算的表示。真实模型在训练中学到表里的值，后面的计算会利用它们处理文字之间的关系。
          </p>
          <table className="mi-emb-table">
            <caption>用编号查出对应的整组数字，数值均为教学示意</caption>
            <thead>
              <tr>
                <th scope="col">文字</th>
                <th scope="col">查表编号</th>
                <th scope="col">数字卡 · 4 个数</th>
              </tr>
            </thead>
            <tbody>
              {embeddingSamples.map((item, index) => (
                <tr
                  key={item.text}
                  className={stage > 0 && index === selected ? 'is-selected' : ''}
                  aria-label={
                    stage > 0 && index === selected ? `已找到「${item.text}」对应的行` : undefined
                  }
                >
                  <th scope="row">{item.text}</th>
                  <td>
                    <span className="mi-emb-table-id">{item.id}</span>
                  </td>
                  <td>
                    <span className="mi-emb-table-values">
                      {item.values.map((value, valueIndex) => (
                        <span key={valueIndex}>{value.toFixed(1)}</span>
                      ))}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mi-emb-id-note">
            <Hash size={16} aria-hidden="true" />
            编号只负责定位；大小不代表概率或重要性，也不会通过算术变成数字卡。
          </p>
        </div>
      </div>
      {retrieved && (
        <div className="mi-emb-handoff">
          <div>
            <h4>接下来，哪一个交给模型计算？</h4>
            <p>把刚刚取出的结果送到下一站。</p>
          </div>
          <div className="mi-emb-choices">
            <button type="button" onClick={() => handOff('id')} disabled={answer === 'vector'}>
              编号 {sample.id}
            </button>
            <button
              type="button"
              onClick={() => handOff('vector')}
              disabled={answer === 'vector'}
              className={answer === 'vector' ? 'is-correct' : ''}
            >
              {answer === 'vector' && <Check size={16} aria-hidden="true" />}取出的整组数字
              {answer !== 'vector' && <ArrowRight size={16} aria-hidden="true" />}
            </button>
          </div>
          {answer && (
            <p
              className={`mi-emb-feedback ${answer === 'vector' ? 'is-correct' : ''}`}
              role="status"
            >
              {answer === 'id'
                ? `${sample.id} 只是查表用的编号。数字已经取出，再选一下真正参与后面计算的内容。`
                : '对，后面的模型层接收这整组数字，并结合前文继续更新它。'}
            </p>
          )}
        </div>
      )}
      {answer === 'vector' && (
        <p className="mi-emb-bridge">
          <ArrowRight size={18} aria-hidden="true" />
          <span>
            下一步：同一个「苹果」先拿到同一张起始数字卡；放进不同句子后，模型会结合前文更新它。
          </span>
        </p>
      )}
      <div className="mi-emb-footer">
        <p>
          这里暂把每个示例词视为 1 个 Token，编号和 4
          个数字均为任意教学示例。实际切分因模型而异，向量通常长得多，单个数字没有固定的日常含义。
        </p>
        {stage > 0 && (
          <button type="button" className="mi-emb-restart" onClick={() => restart()}>
            <RotateCcw size={14} aria-hidden="true" />
            重看查表过程
          </button>
        )}
      </div>
    </section>
  )
}
