import { Check, X } from 'lucide-react'

export function MisconceptionCard({ wrong, correct }: { wrong: string; correct: string }) {
  return (
    <article className="misconception-card">
      <p className="misconception-wrong">
        <X size={16} aria-hidden="true" />
        <span>
          <span className="sr-only">常见误解：</span>
          {wrong}
        </span>
      </p>
      <p>
        <Check size={16} aria-hidden="true" />
        <span>
          <span className="sr-only">正确理解：</span>
          {correct}
        </span>
      </p>
    </article>
  )
}
