import { MousePointer2 } from 'lucide-react'
import type { ReactNode } from 'react'

export function InteractionHint({ children }: { children: ReactNode }) {
  return (
    <p className="mi-interaction-hint">
      <MousePointer2 size={15} aria-hidden="true" />
      {children}
    </p>
  )
}
