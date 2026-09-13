import { useId } from 'react'
import { BookOpen, CircleDashed } from 'lucide-react'
import { contextTerms } from '../data/contextTerms'
import type { ContextTermId } from '../types'
import '../../system-overview/components/assessment.css'
import './context-assessment.css'

export function ContextTerminology({ unlockedTerms }: { unlockedTerms: ContextTermId[] }) {
  const id = useId()
  const count = contextTerms.filter((term) => unlockedTerms.includes(term.id)).length

  return (
    <section className="so-terminology ctx-terminology" aria-labelledby={`${id}-title`}>
      <div className="so-assessment-heading">
        <div>
          <p className="so-assessment-eyebrow">沿途认识的概念</p>
          <h2 id={`${id}-title`}>先理解工作台，再记住名字。</h2>
        </div>
        <p className="so-terminology-count" aria-live="polite">
          已认识 {count} / {contextTerms.length}
        </p>
      </div>
      <ul className="so-term-grid ctx-term-grid">
        {contextTerms.map((term, index) => {
          const unlocked = unlockedTerms.includes(term.id)
          return (
            <li key={term.id} className={`so-term-card${unlocked ? ' so-term-card-unlocked' : ''}`}>
              {unlocked ? (
                <>
                  <BookOpen className="so-term-icon" size={19} aria-hidden="true" />
                  <h3>
                    <span lang="en">{term.english}</span>
                    <span className="so-term-chinese">{term.chinese}</span>
                  </h3>
                  <p className="ctx-term-plain">{term.plain}</p>
                  <p>
                    <span className="ctx-term-label">准确定义</span>
                    {term.definition}
                  </p>
                  <details className="ctx-term-details">
                    <summary>查看技术解释 →</summary>
                    <p>{term.technical}</p>
                  </details>
                </>
              ) : (
                <>
                  <CircleDashed className="so-term-icon" size={19} aria-hidden="true" />
                  <h3>概念 {String(index + 1).padStart(2, '0')}</h3>
                  <p>走到这个发现时，再认识它的名字。</p>
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
