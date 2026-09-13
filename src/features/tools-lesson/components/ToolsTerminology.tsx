import { Check, LockKeyhole } from 'lucide-react'
import { DeepDivePanel } from '../../model-inside/components/DeepDivePanel'
import { toolsTerms } from '../data/toolsTerms'
import type { ToolTermId } from '../types'

const conditions = [
  '选对外部工具后解锁',
  '转换并查看调用字段后解锁',
  '检查本次请求后解锁',
  '展开工具说明书后解锁',
  '把结果加入 Context 后解锁',
]

export function ToolsTerminology({ unlockedTerms }: { unlockedTerms: ToolTermId[] }) {
  return (
    <section
      className="so-terminology mi-terminology tl-terminology"
      aria-labelledby="tl-terms-title"
    >
      <div className="so-assessment-heading">
        <div>
          <p className="so-assessment-eyebrow">沿途认识的概念</p>
          <h2 id="tl-terms-title">做过一次，才真正记住它的名字。</h2>
        </div>
        <p className="so-terminology-count" aria-live="polite">
          已认识 {unlockedTerms.length} / 5
        </p>
      </div>
      <ul className="so-term-grid">
        {toolsTerms.map((term, index) => {
          const unlocked = unlockedTerms.includes(term.id)
          return (
            <li key={term.id} className={`so-term-card ${unlocked ? 'so-term-card-unlocked' : ''}`}>
              {unlocked ? (
                <>
                  <Check size={18} className="so-term-icon" />
                  <h3>
                    {term.label}
                    <span className="so-term-chinese">{term.chinese}</span>
                  </h3>
                  <p>{term.levels[0]}</p>
                  <p>
                    <strong>准确定义</strong>
                    <br />
                    {term.levels[1]}
                  </p>
                  <DeepDivePanel title="技术补充" technical>
                    <p>{term.levels[2]}</p>
                  </DeepDivePanel>
                </>
              ) : (
                <>
                  <LockKeyhole size={18} className="so-term-icon" />
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
