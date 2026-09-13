import { useState } from 'react'
import { ArrowDown, Check, MousePointer2 } from 'lucide-react'
import { attentionDemoData, attentionWords, type AttentionWord } from '../data/attentionDemoData'
import '../model-interactions.css'

export function AttentionExplorer({ onComplete }: { onComplete: () => void }) {
  const [selected, setSelected] = useState<AttentionWord | null>(null)
  const [hasExploredPronoun, setHasExploredPronoun] = useState(false)
  const observation = selected ? attentionDemoData[selected] : null

  function selectWord(word: AttentionWord) {
    setSelected(word)
    if (word === '她' && !hasExploredPronoun) {
      setHasExploredPronoun(true)
      onComplete()
    }
  }

  return (
    <div className="mi-attention-explorer">
      <p className="mi-simulation-label">机制教学示意 · 不代表真实模型的实际 Attention 数值</p>
      <div className="mi-interaction-intro">
        <span className="eyebrow">同一句话，不同的关系</span>
        <h3>现在，应该重点参考哪里？</h3>
        <p>模型处理当前信息时，需要判断上下文里的哪些部分与它更相关。</p>
      </div>
      <p className={`mi-click-hint ${hasExploredPronoun ? 'is-complete' : ''}`}>
        {hasExploredPronoun ? (
          <Check size={15} aria-hidden="true" />
        ) : (
          <MousePointer2 size={15} aria-hidden="true" />
        )}
        {hasExploredPronoun ? '已探索「她」· 继续点击其他词，比较关系变化' : '试试看：点击「她」'}
      </p>
      <div
        className="mi-attention-sentence"
        role="group"
        aria-label="点击句子中的词，探索上下文关系"
      >
        {attentionWords.map((word) => (
          <button
            key={word}
            type="button"
            className={`mi-attention-word ${word === '她' && !hasExploredPronoun ? 'mi-pronoun-hint' : ''}`}
            aria-pressed={selected === word}
            aria-label={`观察「${word}」的上下文关系`}
            onClick={() => selectWord(word)}
          >
            {word}
          </button>
        ))}
        <span aria-hidden="true">。</span>
      </div>
      <div className="mi-attention-observation" aria-live="polite" aria-atomic="true">
        {selected && observation ? (
          <>
            <p className="mi-observation-label">
              当前正在观察：<strong>{selected}</strong>
            </p>
            <h4>{observation.question}</h4>
            <div className="mi-attention-relations">
              <div className="mi-attention-source">{selected}</div>
              <svg
                className="mi-attention-lines"
                viewBox="0 0 600 75"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {observation.relations.map((relation, index) => {
                  const x = ((index + 0.5) / observation.relations.length) * 600
                  return (
                    <path
                      key={`${selected}-${relation.word}`}
                      d={`M 300 0 C 300 38, ${x} 30, ${x} 74`}
                      className={`mi-relation-line mi-relation-line--${index}`}
                      vectorEffect="non-scaling-stroke"
                    />
                  )
                })}
              </svg>
              <div
                className="mi-attention-targets"
                style={{
                  gridTemplateColumns: `repeat(${observation.relations.length}, minmax(0, 1fr))`,
                }}
              >
                {observation.relations.map((relation, index) => (
                  <div
                    className={`mi-attention-target mi-attention-target--${index}`}
                    key={relation.word}
                  >
                    <strong>{relation.word}</strong>
                    <span>{relation.strength}</span>
                    <small>{relation.explanation}</small>
                  </div>
                ))}
              </div>
            </div>
            <p className="mi-observation-explanation">{observation.explanation}</p>
          </>
        ) : (
          <div className="mi-attention-empty">
            <ArrowDown size={21} strokeWidth={1.5} aria-hidden="true" />
            <strong>点击「她」，让上下文关系显现</strong>
            <p>线越粗，表示这张教学图里画出的关联越强。</p>
          </div>
        )}
      </div>
      {hasExploredPronoun && (
        <p className="mi-interaction-takeaway">
          <strong>Attention</strong>
          ：模型动态关注上下文不同位置关系的一种核心机制。它是一种计算机制。
        </p>
      )}
    </div>
  )
}
