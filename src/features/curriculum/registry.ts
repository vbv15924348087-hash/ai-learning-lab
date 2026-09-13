import type { ChapterDefinition } from './types'

// Each feature owns its teaching data; the registry contains no UI or store dependencies.
const modules = import.meta.glob<{ chapter: ChapterDefinition }>('../*/data.ts', { eager: true })
export const chapters: ChapterDefinition[] = Object.values(modules)
  .map((module) => module.chapter)
  .filter(Boolean)
  .sort((a, b) => a.phase - b.phase)
export function getChapter(id: string): ChapterDefinition | undefined {
  return chapters.find((chapter) => chapter.id === id)
}
