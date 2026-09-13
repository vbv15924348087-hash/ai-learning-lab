import { Check, LockKeyhole } from 'lucide-react'
import { modelTerms } from '../data/modelTerms'
import type { ModelTermId } from '../types'
import { DeepDivePanel } from './DeepDivePanel'

export function ModelTerminology({ unlockedTerms }: { unlockedTerms: ModelTermId[] }) {
  const conditions = [
    '展开文字小块后解锁',
    '转换数字表示后解锁',
    '走完计算层后解锁',
    '点击「她」探索关系后解锁',
    '阅读训练与使用对比后解锁',
  ]
  return (
    <section className="so-terminology mi-terminology" aria-labelledby="mi-terms-title">
      <div className="so-assessment-heading">
        <div>
          <p className="so-assessment-eyebrow">沿途认识的概念</p>
          <h2 id="mi-terms-title">先看见发生了什么，再认识它的名字。</h2>
        </div>
        <p className="so-terminology-count" aria-live="polite">
          已认识 {unlockedTerms.length} / 5
        </p>
      </div>
      <ul className="so-term-grid">
        {modelTerms.map((term, index) => {
          const unlocked = unlockedTerms.includes(term.id)
          return (
            <li key={term.id} className={`so-term-card ${unlocked ? 'so-term-card-unlocked' : ''}`}>
              {unlocked ? (
                <>
                  <Check size={19} className="so-term-icon" />
                  <h3>
                    {term.english}
                    <span className="so-term-chinese">{term.chinese}</span>
                  </h3>
                  <p>{term.plain}</p>
                  <p>
                    <strong>准确定义</strong>
                    <br />
                    {term.definition}
                  </p>
                  <DeepDivePanel title="技术补充" technical>
                    <p>{term.technical}</p>
                  </DeepDivePanel>
                </>
              ) : (
                <>
                  <LockKeyhole size={19} className="so-term-icon" />
                  <h3>概念 {String(index + 1).padStart(2, '0')}</h3>
                  <p>{conditions[index]}</p>
                  <span className="so-term-pending">待解锁</span>
                </>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
