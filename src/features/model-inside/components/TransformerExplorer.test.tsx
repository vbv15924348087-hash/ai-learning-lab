import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TransformerExplorer } from './TransformerExplorer'
import { formatTransformerVector, transformerExamples } from '../data/transformerDemoData'

vi.mock('./TransformerScene', () => ({
  default: ({
    onFailure,
    animationEnabled,
    processed,
  }: {
    onFailure: () => void
    animationEnabled: boolean
    processed: number
  }) => (
    <button
      type="button"
      onClick={onFailure}
      data-animation-enabled={String(animationEnabled)}
      data-processed={processed}
    >
      模拟渲染器失败
    </button>
  ),
}))

let reducedMotion = true
beforeEach(() => {
  reducedMotion = true
  vi.stubGlobal('matchMedia', () => ({
    matches: reducedMotion,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function processAllLayers() {
  for (let layer = 0; layer < 5; layer++) {
    fireEvent.click(screen.getByRole('button', { name: '让这一层结合前文' }))
    if (layer < 4) fireEvent.click(screen.getByRole('button', { name: '把更新后的结果交给下一层' }))
  }
}

describe('Transformer context and layer continuity', () => {
  it('keeps the same initial vector for the same token and reveals different results for different context', () => {
    const complete = vi.fn()
    render(<TransformerExplorer onComplete={complete} />)
    const initial = formatTransformerVector(transformerExamples[0].vectors[0])
    expect(
      within(screen.getByTestId('transformer-input')).getByLabelText(initial),
    ).toBeInTheDocument()
    expect(
      within(screen.getByTestId('transformer-output')).getByLabelText('尚未计算'),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /句子 2/ }))
    expect(
      within(screen.getByTestId('transformer-input')).getByLabelText(initial),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '让这一层结合前文' }))
    expect(
      within(screen.getByTestId('transformer-output')).getByLabelText(
        formatTransformerVector(transformerExamples[1].vectors[1]),
      ),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /句子 1/ }))
    expect(
      within(screen.getByTestId('transformer-output')).getByLabelText(
        formatTransformerVector(transformerExamples[0].vectors[1]),
      ),
    ).toBeInTheDocument()
    expect(complete).not.toHaveBeenCalled()
  })

  it('carries the exact output of each layer into the next layer input', () => {
    render(<TransformerExplorer onComplete={vi.fn()} />)
    for (let layer = 0; layer < 5; layer++) {
      const input = screen.getByTestId('transformer-input')
      expect(
        within(input).getByLabelText(
          formatTransformerVector(transformerExamples[0].vectors[layer]),
        ),
      ).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: '让这一层结合前文' }))
      expect(
        within(screen.getByTestId('transformer-output')).getByLabelText(
          formatTransformerVector(transformerExamples[0].vectors[layer + 1]),
        ),
      ).toBeInTheDocument()
      if (layer < 4)
        fireEvent.click(screen.getByRole('button', { name: '把更新后的结果交给下一层' }))
    }
    expect(screen.getByText('五轮处理完成，更新后的表示交给后续的预测计算。')).toBeInTheDocument()
  })

  it('does not count inspecting future layers as calculation or allow skipping prerequisites', () => {
    const complete = vi.fn()
    render(<TransformerExplorer onComplete={complete} />)
    fireEvent.click(screen.getByRole('button', { name: /第 5 层/ }))
    expect(screen.getByText('等待前一层交来数字')).toBeInTheDocument()
    expect(screen.getByText('已计算 0 / 5 层 · 等待对比前文')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '回到第 1 层继续' }))
    expect(screen.getByRole('button', { name: /第 1 层/ })).toHaveAttribute('aria-pressed', 'true')
    expect(complete).not.toHaveBeenCalled()
  })

  it('requires five calculations and comparison before confirming completion once', () => {
    const complete = vi.fn()
    render(<TransformerExplorer onComplete={complete} />)
    processAllLayers()
    expect(complete).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: '换一句话，对比结果' }))
    expect(
      screen.getByText('初始数字相同，前文不同，经过计算后的表示不同。改变的是本次计算中的表示。'),
    ).toBeInTheDocument()
    expect(complete).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: '完成层层计算演示' }))
    expect(complete).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: '已看懂数字怎样接力' })).toBeDisabled()
  })

  it('revisits processed layers without changing their input or output', () => {
    render(<TransformerExplorer onComplete={vi.fn()} />)
    processAllLayers()
    fireEvent.click(screen.getByRole('button', { name: /第 2 层/ }))
    expect(
      within(screen.getByTestId('transformer-input')).getByLabelText(
        formatTransformerVector(transformerExamples[0].vectors[1]),
      ),
    ).toBeInTheDocument()
    expect(
      within(screen.getByTestId('transformer-output')).getByLabelText(
        formatTransformerVector(transformerExamples[0].vectors[2]),
      ),
    ).toBeInTheDocument()
  })

  it('offers the entire manual path with reduced motion and no WebGL scene', () => {
    const complete = vi.fn()
    const { container } = render(<TransformerExplorer onComplete={complete} />)
    expect(container.querySelector('[data-renderer="fallback"]')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '自动演示' })).toBeDisabled()
    processAllLayers()
    fireEvent.click(screen.getByRole('button', { name: '换一句话，对比结果' }))
    fireEvent.click(screen.getByRole('button', { name: '完成层层计算演示' }))
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('preserves the stage and computed data after renderer failure', async () => {
    reducedMotion = false
    const { container } = render(<TransformerExplorer onComplete={vi.fn()} />)
    const fail = await screen.findByRole('button', { name: '模拟渲染器失败' })
    fireEvent.click(screen.getByRole('button', { name: '让这一层结合前文' }))
    fireEvent.click(fail)
    expect(container.querySelector('[data-renderer="fallback"]')).toBeInTheDocument()
    expect(
      within(screen.getByTestId('transformer-output')).getByLabelText(
        formatTransformerVector(transformerExamples[0].vectors[1]),
      ),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '把更新后的结果交给下一层' }))
    expect(screen.getByRole('button', { name: /第 2 层/ })).toHaveAttribute('aria-pressed', 'true')
  })

  it('autoplays calculation and transfer separately, then stops for comparison', async () => {
    reducedMotion = false
    const complete = vi.fn()
    render(<TransformerExplorer onComplete={complete} />)
    await screen.findByRole('button', { name: '模拟渲染器失败' })
    vi.useFakeTimers()
    fireEvent.click(screen.getByRole('button', { name: '自动演示' }))
    act(() => vi.advanceTimersByTime(2400))
    expect(screen.getByRole('button', { name: /第 1 层/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('已计算 1 / 5 层 · 等待对比前文')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '暂停' }))
    act(() => vi.advanceTimersByTime(10000))
    expect(vi.getTimerCount()).toBe(0)
    fireEvent.click(screen.getByRole('button', { name: '自动演示' }))
    for (let step = 0; step < 8; step++) act(() => vi.advanceTimersByTime(2400))
    expect(screen.getByRole('button', { name: '换一句话，对比结果' })).toBeInTheDocument()
    expect(complete).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
    fireEvent.click(screen.getByRole('button', { name: '重新开始' }))
    expect(screen.getByText('已计算 0 / 5 层 · 等待对比前文')).toBeInTheDocument()
  })

  it('suspends rendering and calculations while hidden and cancels timers on exit', async () => {
    reducedMotion = false
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
    const view = render(<TransformerExplorer onComplete={vi.fn()} />)
    const scene = await screen.findByRole('button', { name: '模拟渲染器失败' })
    vi.useFakeTimers()
    fireEvent.click(screen.getByRole('button', { name: '自动演示' }))
    visibility.mockReturnValue('hidden')
    fireEvent(document, new Event('visibilitychange'))
    expect(vi.getTimerCount()).toBe(0)
    expect(scene).toHaveAttribute('data-animation-enabled', 'false')
    act(() => vi.advanceTimersByTime(12000))
    expect(screen.getByText('已计算 0 / 5 层 · 等待对比前文')).toBeInTheDocument()
    visibility.mockReturnValue('visible')
    fireEvent(document, new Event('visibilitychange'))
    expect(scene).toHaveAttribute('data-animation-enabled', 'true')
    act(() => vi.advanceTimersByTime(2400))
    expect(screen.getByText('已计算 1 / 5 层 · 等待对比前文')).toBeInTheDocument()
    view.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('suspends offscreen work and disconnects the visibility observer on exit', async () => {
    reducedMotion = false
    let notify: (entries: Partial<IntersectionObserverEntry>[]) => void = () => undefined
    const disconnect = vi.fn()
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = vi.fn()
        disconnect = disconnect
        constructor(callback: IntersectionObserverCallback) {
          notify = (entries) =>
            callback(
              entries as IntersectionObserverEntry[],
              this as unknown as IntersectionObserver,
            )
        }
      },
    )
    const view = render(<TransformerExplorer onComplete={vi.fn()} />)
    const scene = await screen.findByRole('button', { name: '模拟渲染器失败' })
    const section = screen.getByRole('region', { name: 'Transformer 多层计算互动' })
    const visual = screen.getByRole('group', { name: /信息从上往下经过五层计算/ })
    vi.useFakeTimers()
    fireEvent.click(screen.getByRole('button', { name: '自动演示' }))
    act(() =>
      notify([
        { target: visual, isIntersecting: false },
        { target: section, isIntersecting: false },
      ]),
    )
    expect(scene).toHaveAttribute('data-animation-enabled', 'false')
    expect(vi.getTimerCount()).toBe(0)
    act(() =>
      notify([
        { target: visual, isIntersecting: true },
        { target: section, isIntersecting: true },
      ]),
    )
    expect(scene).toHaveAttribute('data-animation-enabled', 'true')
    expect(vi.getTimerCount()).toBe(1)
    view.unmount()
    expect(disconnect).toHaveBeenCalledTimes(1)
    expect(vi.getTimerCount()).toBe(0)
  })
})
