import { BookOpen, Code2, Lightbulb } from 'lucide-react'
import type { Lesson } from '../../types/learning'

export function ConceptTag({ children }: { children: string }) {
  return <span className="concept-tag">{children}</span>
}

export function ExplanationPanel({ lesson }: { lesson: Lesson }) {
  return (
    <section className="explanation-panel" aria-labelledby="explanation-title">
      <div className="section-label">
        <BookOpen size={17} />
        <span>先建立直觉</span>
      </div>
      <h2 id="explanation-title">{lesson.beginnerHeading ?? '先理解它在系统中的作用。'}</h2>
      <p>{lesson.beginnerExplanation}</p>
      {lesson.analogy && (
        <div className="analogy">
          <Lightbulb size={19} />
          <div>
            <h3>换个熟悉的角度</h3>
            <p>{lesson.analogy}</p>
          </div>
        </div>
      )}
      {lesson.technicalExplanation && (
        <details className="technical-explanation">
          <summary>
            <Code2 size={17} />
            <span>查看技术解释 →</span>
            <span className="details-plus" aria-hidden="true">
              +
            </span>
          </summary>
          <div>
            <p>{lesson.technicalExplanation}</p>
          </div>
        </details>
      )}
      <div className="related-concepts">
        <span>本节概念</span>
        <div>
          {lesson.relatedConcepts.map((concept) => (
            <ConceptTag key={concept}>{concept}</ConceptTag>
          ))}
        </div>
      </div>
    </section>
  )
}
