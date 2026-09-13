import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ChapterVisual from './Visual'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})
describe('Agent Loop learning interaction', () => {
  it('requires noticing the missing reliable source', () => {
    const onComplete = vi.fn()
    render(<ChapterVisual step={0} onComplete={onComplete} completed={false} />)
    fireEvent.click(screen.getByRole('button', { name: '有结果，应该够了' }))
    expect(onComplete).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: '还缺可靠来源 →' }))
    expect(onComplete).toHaveBeenCalledOnce()
  })
  it('returns from a failed check and requires the second round before completion', () => {
    const onComplete = vi.fn()
    render(<ChapterVisual step={1} onComplete={onComplete} completed={false} />)
    for (let index = 0; index < 5; index++)
      fireEvent.click(screen.getByRole('button', { name: '推进循环 →' }))
    expect(screen.getByRole('status')).toHaveTextContent('检查 · 未完成')
    expect(onComplete).not.toHaveBeenCalled()
    for (let index = 0; index < 6; index++)
      fireEvent.click(screen.getByRole('button', { name: '推进循环 →' }))
    expect(screen.getByRole('status')).toHaveTextContent('检查 · 通过')
    fireEvent.click(screen.getByRole('button', { name: '确认查证通过 →' }))
    expect(onComplete).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByRole('button', { name: '重播两轮' }))
    expect(screen.getByRole('status')).toHaveTextContent('01 / 12')
  })
  it('pauses autoplay when hidden and removes timers on unmount', () => {
    vi.useFakeTimers()
    const { unmount } = render(<ChapterVisual step={1} onComplete={vi.fn()} completed={false} />)
    fireEvent.click(screen.getByRole('button', { name: '自动播放' }))
    act(() => vi.advanceTimersByTime(2400))
    expect(screen.getByRole('status')).toHaveTextContent('02 / 12')
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
    fireEvent(document, new Event('visibilitychange'))
    act(() => vi.advanceTimersByTime(10000))
    expect(screen.getByRole('status')).toHaveTextContent('02 / 12')
    expect(screen.getByRole('button', { name: '自动播放' })).toBeVisible()
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false)
    fireEvent.click(screen.getByRole('button', { name: '自动播放' }))
    expect(vi.getTimerCount()).toBe(1)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
  it('keeps a complete manual path with reduced motion enabled', () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    const onComplete = vi.fn()
    render(<ChapterVisual step={1} onComplete={onComplete} completed={false} />)
    expect(screen.queryByRole('button', { name: '自动播放' })).not.toBeInTheDocument()
    for (let index = 0; index < 11; index++)
      fireEvent.click(screen.getByRole('button', { name: '推进循环 →' }))
    fireEvent.click(screen.getByRole('button', { name: '确认查证通过 →' }))
    expect(onComplete).toHaveBeenCalledOnce()
  })
})
