import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { attentionDemoData, attentionWords } from '../data/attentionDemoData'
import { generationSteps, temperatureDistribution } from '../data/predictionDemoData'
import { AttentionExplorer } from './AttentionExplorer'
import { TemperatureExplorer } from './TemperatureExplorer'
import { TokenPredictionDemo } from './TokenPredictionDemo'

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('Model Inside relationship and generation interactions', () => {
  it('guides keyboard exploration and changes the observed relationship', async () => {
    const user = userEvent.setup()
    const complete = vi.fn()
    render(<AttentionExplorer onComplete={complete} />)
    expect(screen.getByText('试试看：点击「她」')).toBeVisible()
    const pronoun = screen.getByRole('button', { name: '观察「她」的上下文关系' })
    pronoun.focus()
    await user.keyboard('{Enter}')
    expect(complete).toHaveBeenCalledTimes(1)
    expect(pronoun).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('「她」可能指向前面提到的谁？')).toBeVisible()
    expect(screen.getByText('重点关注')).toBeVisible()
    expect(screen.queryByText('试试看：点击「她」')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '观察「很饿」的上下文关系' }))
    expect(screen.getByText('「很饿」描述谁，又如何解释前面的事情？')).toBeVisible()
    expect(pronoun).toHaveAttribute('aria-pressed', 'false')
    await user.click(pronoun)
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('keeps all teaching relationships causal for the autoregressive example', () => {
    for (const [position, word] of attentionWords.entries()) {
      for (const relation of attentionDemoData[word].relations) {
        expect(attentionWords.indexOf(relation.word)).toBeLessThanOrEqual(position)
      }
    }
  })

  it('adds one token, changes candidates, and completes only after the full sentence', () => {
    const complete = vi.fn()
    render(<TokenPredictionDemo mode="generation" onComplete={complete} />)
    const next = screen.getByRole('button', { name: '生成下一个 Token' })
    expect(screen.getByLabelText('当前生成的回答')).toHaveTextContent('等待生成第一个 Token')
    fireEvent.click(next)
    expect(screen.getByLabelText('当前生成的回答')).toHaveTextContent(/^NVIDIA$/)
    expect(screen.getByText('第 2 轮 · 下一 Token 候选')).toBeVisible()
    expect(complete).not.toHaveBeenCalled()
    for (let index = 1; index < generationSteps.length; index += 1) fireEvent.click(next)
    expect(screen.getByLabelText('当前生成的回答')).toHaveTextContent(
      'NVIDIA 的最新 AI GPU 信息需要结合官方资料核对。',
    )
    expect(complete).toHaveBeenCalledTimes(1)
    expect(next).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '重新开始' }))
    expect(next).not.toBeDisabled()
    expect(screen.getByText('第 1 轮 · 下一 Token 候选')).toBeVisible()
  })

  it('pauses autoplay on visibility loss and cleans the pending timeout on unmount', () => {
    vi.useFakeTimers()
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(false)
    const { unmount } = render(<TokenPredictionDemo mode="generation" />)
    fireEvent.click(screen.getByRole('button', { name: '自动演示' }))
    act(() => vi.advanceTimersByTime(1400))
    expect(screen.getByLabelText('当前生成的回答')).toHaveTextContent(/^NVIDIA$/)
    hidden.mockReturnValue(true)
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    act(() => vi.advanceTimersByTime(5000))
    expect(screen.getByLabelText('当前生成的回答')).toHaveTextContent(/^NVIDIA$/)
    expect(screen.getByRole('button', { name: '自动演示' })).toBeVisible()
    hidden.mockReturnValue(false)
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    fireEvent.click(screen.getByRole('button', { name: '自动演示' }))
    expect(vi.getTimerCount()).toBe(1)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('keeps all generation available through manual steps with reduced motion', () => {
    vi.stubGlobal(
      'matchMedia',
      vi
        .fn()
        .mockReturnValue({
          matches: true,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }),
    )
    const complete = vi.fn()
    render(<TokenPredictionDemo mode="generation" onComplete={complete} />)
    expect(screen.queryByRole('button', { name: '自动演示' })).not.toBeInTheDocument()
    const next = screen.getByRole('button', { name: '生成下一个 Token' })
    for (let index = 0; index < generationSteps.length; index += 1) fireEvent.click(next)
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('makes the optional temperature distribution flatter as temperature rises', () => {
    const stable = temperatureDistribution(0.25)
    const diverse = temperatureDistribution(2)
    expect(stable.reduce((sum, value) => sum + value, 0)).toBeCloseTo(1)
    expect(diverse.reduce((sum, value) => sum + value, 0)).toBeCloseTo(1)
    expect(diverse[0]).toBeLessThan(stable[0])
    expect(diverse[3]).toBeGreaterThan(stable[3])
    render(<TemperatureExplorer />)
    fireEvent.change(screen.getByRole('slider'), { target: { value: '2' } })
    expect(screen.getByText('Temperature 2.00')).toBeVisible()
    expect(
      screen.getByText('现在分布更平缓：其他候选也有更多机会，输出倾向于更多样。'),
    ).toBeVisible()
  })
})
