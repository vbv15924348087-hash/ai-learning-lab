import { describe, expect, it } from 'vitest'
import type { ExploreNode } from '../types'
import { labelPriority } from './labelPriority'

function label(id: string, level: ExploreNode['level']) {
  return { id, level } as ExploreNode
}
const nodes = [
  label('user', 0),
  label('model', 0),
  label('inside-harness-loop', 2),
  label('inside-harness-trace', 2),
  label('harness', 0),
]
const related = new Set(['model', 'inside-harness-loop'])
const order = (framed?: ReadonlySet<string>) =>
  [...nodes]
    .sort(
      (a, b) =>
        labelPriority(a, 'harness', related, framed) - labelPriority(b, 'harness', related, framed),
    )
    .map((node) => node.id)

describe('immersive label visibility priority', () => {
  it('retains the default selected, related core, core, related detail ordering', () => {
    expect(order()).toEqual([
      'harness',
      'model',
      'user',
      'inside-harness-loop',
      'inside-harness-trace',
    ])
  })

  it('gives the entire open module label space before unrelated core nodes', () => {
    expect(order(new Set(['harness', 'inside-harness-loop', 'inside-harness-trace']))).toEqual([
      'harness',
      'inside-harness-loop',
      'inside-harness-trace',
      'model',
      'user',
    ])
  })

  it('reserves path labels ahead of unused nodes even when the camera frames every node', () => {
    const framed = new Set(nodes.map((node) => node.id))
    const path = new Set(['inside-harness-trace'])
    const ordered = [...nodes]
      .sort(
        (a, b) =>
          labelPriority(a, 'harness', related, framed, path) -
          labelPriority(b, 'harness', related, framed, path),
      )
      .map((node) => node.id)
    expect(ordered.slice(0, 2)).toEqual(['harness', 'inside-harness-trace'])
  })
})
