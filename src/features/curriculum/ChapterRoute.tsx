import { lazy, Suspense, type ComponentType } from 'react'
import { getChapter } from './registry'
import { ChapterLesson } from './ChapterLesson'
import type { ChapterVisualProps } from './types'

const sources = import.meta.glob<{ default: ComponentType<ChapterVisualProps> }>('../*/Visual.tsx')
const visuals = Object.fromEntries(
  Object.entries(sources).map(([path, load]) => [path.split('/')[1], lazy(load)]),
)
export function ChapterRoute({ id }: { id: string }) {
  const chapter = getChapter(id)
  const Visual = visuals[id === 'workflow-vs-agent' ? 'workflow-agent' : id]
  if (!chapter || !Visual) return null
  return (
    <Suspense
      fallback={
        <p className="page-width" role="status">
          正在打开本章互动…
        </p>
      }
    >
      <ChapterLesson key={id} chapter={chapter} Visual={Visual} />
    </Suspense>
  )
}
