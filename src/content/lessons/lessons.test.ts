import { describe, expect, it } from 'vitest'
import { getLessonById, lessons } from './index'

describe('lesson registry', () => {
  it('provides the 15 ordered chapters with unique stable route identifiers', () => {
    expect(lessons.map((lesson) => lesson.id)).toEqual([
      'system-overview',
      'context',
      'model-inside',
      'tools',
      'agent-loop',
      'harness',
      'rag',
      'memory',
      'mcp',
      'workflow-vs-agent',
      'multi-agent',
      'verification',
      'guardrail',
      'compaction',
      'final-system-map',
    ])
    expect(lessons.map((lesson) => lesson.order)).toEqual(
      Array.from({ length: 15 }, (_, i) => i + 1),
    )
    expect(new Set(lessons.map((lesson) => lesson.id)).size).toBe(lessons.length)
    expect(getLessonById('missing-chapter')).toBeUndefined()
  })

  it('publishes all lessons while preserving the foundation content', () => {
    const published = lessons.filter((lesson) => lesson.published)
    expect(published.slice(0, 4).map((lesson) => lesson.id)).toEqual([
      'system-overview',
      'context',
      'model-inside',
      'tools',
    ])
    const overview = published[0]
    expect(overview.learningGoal.length).toBeGreaterThan(0)
    expect(overview.beginnerExplanation.length).toBeGreaterThan(0)
    expect(overview.analogy).toBeTruthy()
    expect(overview.technicalExplanation).toBeTruthy()
    expect(overview.misconceptions.length).toBeGreaterThan(0)
    expect(overview.misconceptions.every(({ wrong, correct }) => wrong && correct)).toBe(true)
    expect(overview.visualization).toBe('system-overview')
    const context = published[1]
    expect(context.visualization).toBe('context-workspace')
    expect(context.minutes).toBe(12)
    expect(context.misconceptions).toHaveLength(4)
    expect(context.relatedConcepts).toEqual([
      'Prompt',
      'Context',
      'Context Window',
      'Context Engineering',
    ])
    const modelInside = published[2]
    expect(modelInside.visualization).toBe('model-inside')
    expect(modelInside.misconceptions).toHaveLength(5)
    expect(modelInside.relatedConcepts).toEqual([
      'Token',
      'Embedding',
      'Transformer',
      'Attention',
      'Inference',
    ])
    expect(modelInside.technicalExplanation).toContain('包含 Attention 的多层 Transformer')
    expect(modelInside.visualizationNote).toContain('教学示意')
    const tools = published[3]
    expect(tools.id).toBe('tools')
    expect(tools.visualization).toBe('tools-lesson')
    expect(tools.visualizationNote).toContain('教学模拟')
    expect(tools.misconceptions).toHaveLength(5)
    expect(tools.relatedConcepts).toEqual([
      'Tool',
      'Function Calling',
      'Tool Call',
      'Tool Schema',
      'Tool Result',
    ])
    expect(published).toHaveLength(15)
    expect(getLessonById('agent-loop')?.published).toBe(true)
    expect(
      lessons
        .filter((lesson) => lesson.order >= 5)
        .every(
          (lesson) => lesson.visualization === 'curriculum' && lesson.misconceptions.length >= 2,
        ),
    ).toBe(true)
  })
})
