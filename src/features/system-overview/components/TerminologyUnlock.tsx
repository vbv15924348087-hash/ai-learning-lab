import { BookOpen, CircleDashed } from 'lucide-react'
import type { TermDefinition, TermId } from '../types'
import './assessment.css'

const terms: TermDefinition[] = [
  {
    id: 'context',
    english: 'Context',
    chinese: '上下文',
    explanation: '模型此刻的工作台，放着这一次回答可以使用的信息。',
  },
  {
    id: 'model',
    english: 'Model',
    chinese: '模型',
    explanation: '根据已有信息，判断下一步是回答还是请求外部帮助。',
  },
  {
    id: 'tool',
    english: 'Tool',
    chinese: '工具',
    explanation: '可被请求使用的外部能力，例如搜索网页。',
  },
  {
    id: 'harness',
    english: 'Harness',
    chinese: '运行系统',
    explanation: '接住模型的请求，调用工具执行，再把结果送回模型。',
  },
  {
    id: 'ai-system',
    english: 'AI System',
    chinese: 'AI 系统',
    explanation: '把准备信息、模型判断、执行动作与生成回答连接起来的整体。',
  },
]

type TerminologyUnlockProps = {
  unlockedTerms: TermId[]
}

export function TerminologyUnlock({ unlockedTerms }: TerminologyUnlockProps) {
  const unlockedCount = terms.filter((term) => unlockedTerms.includes(term.id)).length

  return (
    <section className="so-terminology" aria-labelledby="so-terminology-title">
      <div className="so-assessment-heading">
        <div>
          <p className="so-assessment-eyebrow">沿途认识的概念</p>
          <h2 id="so-terminology-title">先理解，再记住名字。</h2>
        </div>
        <p className="so-terminology-count" aria-live="polite">
          已认识 {unlockedCount} / {terms.length}
        </p>
      </div>
      <ul className="so-term-grid">
        {terms.map((term, index) => {
          const unlocked = unlockedTerms.includes(term.id)

          return (
            <li key={term.id} className={`so-term-card${unlocked ? ' so-term-card-unlocked' : ''}`}>
              {unlocked ? (
                <>
                  <BookOpen className="so-term-icon" size={19} aria-hidden="true" />
                  <h3>
                    <span lang="en">{term.english}</span>{' '}
                    <span className="so-term-chinese">{term.chinese}</span>
                  </h3>
                  <p>{term.explanation}</p>
                </>
              ) : (
                <>
                  <CircleDashed className="so-term-icon" size={19} aria-hidden="true" />
                  <h3>概念 {String(index + 1).padStart(2, '0')}</h3>
                  <p>继续探索，走到这里时再认识它。</p>
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
