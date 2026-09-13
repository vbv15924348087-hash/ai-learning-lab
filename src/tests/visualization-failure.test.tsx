import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { VisualizationContainer } from '../components/visualization/VisualizationContainer'

vi.mock('../components/three/SystemMapCanvas', () => ({
  SystemMapCanvas: () => {
    throw new Error('Scene chunk unavailable')
  },
}))

afterEach(() => vi.restoreAllMocks())

it('keeps the learning controls usable if the scene fails to load or render', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const onSelectNode = vi.fn()
  render(<VisualizationContainer selectedNode={null} onSelectNode={onSelectNode} />)
  expect(
    await screen.findByRole('img', { name: '简化流程：你的提问，经过 AI 模型，生成回答' }),
  ).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: 'AI 模型' }))
  expect(onSelectNode).toHaveBeenCalledWith('model')
  expect(screen.getAllByRole('button')).toHaveLength(3)
})
