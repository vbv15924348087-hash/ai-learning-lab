import { describe, expect, it } from 'vitest'
import { chapters } from './registry'
import { concepts, edges, systemRows } from '../final-system-map/concepts'

describe('complete curriculum contract', () => {
  it('registers Phase 6–16 in order with attainable terms and valid scenario assessments', () => {
    expect(chapters.map((chapter) => chapter.phase)).toEqual(
      Array.from({ length: 11 }, (_, i) => i + 6),
    )
    for (const chapter of chapters) {
      expect(chapter.steps.length).toBeGreaterThanOrEqual(3)
      expect(chapter.misconceptions.length).toBeGreaterThanOrEqual(2)
      expect(new Set(chapter.steps.map((step) => step.id)).size).toBe(chapter.steps.length)
      for (const term of chapter.terms) {
        expect(
          chapter.steps.some((step) => step.terms.includes(term.id)),
          `${chapter.id}: unreachable ${term.id}`,
        ).toBe(true)
        expect(term.definition.length).toBeGreaterThan(8)
      }
      for (const step of chapter.steps)
        for (const term of step.terms)
          expect(chapter.terms.some((item) => item.id === term)).toBe(true)
      expect(chapter.challenge.length).toBeGreaterThanOrEqual(2)
      for (const question of chapter.challenge) {
        expect(question.options.some((option) => option.id === question.answer)).toBe(true)
        expect(question.options.every((option) => option.explanation.length > 8)).toBe(true)
      }
    }
  })
  it('has no dangling map edges, dependencies or chapter links', () => {
    const ids = concepts.map((concept) => concept.id)
    expect(new Set(ids).size).toBe(ids.length)
    const lessonIds = [
      'system-overview',
      'context',
      'model-inside',
      'tools',
      ...chapters.map((c) => c.id),
    ]
    for (const concept of concepts) {
      expect(lessonIds).toContain(concept.lesson)
      for (const id of concept.dependencies) expect(ids).toContain(id)
    }
    for (const id of [...edges.flat(), ...systemRows.flat()]) expect(ids).toContain(id)
  })
})
