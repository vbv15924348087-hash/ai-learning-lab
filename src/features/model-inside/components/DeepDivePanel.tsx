import type { ReactNode } from 'react'

export function DeepDivePanel({
  title,
  technical = false,
  children,
}: {
  title: string
  technical?: boolean
  children: ReactNode
}) {
  return (
    <details className="mi-deep-dive">
      <summary>
        <span>
          {technical ? '查看技术解释' : '深入一点'} <span aria-hidden="true">→</span>
        </span>
        <small>{title}</small>
      </summary>
      <div className="mi-deep-content">{children}</div>
    </details>
  )
}
