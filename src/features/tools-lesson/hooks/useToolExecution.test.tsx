import { act, renderHook } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TOOL_EXECUTION_INTERVAL, toolExecutionSteps } from '../data/toolExecutionSteps'
import { useToolExecution } from './useToolExecution'

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('Tool execution playback', () => {
  it('bounds manual navigation and reports completion only once across revisits and restart', () => {
    const onComplete = vi.fn()
    const { result, rerender } = renderHook(() => useToolExecution(onComplete), {
      wrapper: StrictMode,
    })
    act(() => result.current.previous())
    expect(result.current.currentStep).toBe(0)
    for (let index = 1; index < toolExecutionSteps.length - 1; index += 1) {
      act(() => result.current.next())
      expect(onComplete).not.toHaveBeenCalled()
    }
    act(() => result.current.next())
    expect(result.current.step.id).toBe('model-answer')
    expect(onComplete).toHaveBeenCalledTimes(1)
    rerender()
    act(() => result.current.next())
    expect(result.current.currentStep).toBe(6)
    act(() => result.current.previous())
    act(() => result.current.next())
    expect(onComplete).toHaveBeenCalledTimes(1)
    act(() => result.current.restart())
    expect(result.current.currentStep).toBe(0)
    expect(result.current.isPlaying).toBe(false)
    for (let index = 1; index < toolExecutionSteps.length; index += 1)
      act(() => result.current.next())
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('pauses autoplay, resumes from the same step, and stops at the final model', () => {
    vi.useFakeTimers()
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false)
    const onComplete = vi.fn()
    const { result } = renderHook(() => useToolExecution(onComplete))
    act(() => result.current.togglePlayback())
    act(() => vi.advanceTimersByTime(TOOL_EXECUTION_INTERVAL))
    expect(result.current.step.id).toBe('tool-call')
    act(() => result.current.togglePlayback())
    act(() => vi.advanceTimersByTime(TOOL_EXECUTION_INTERVAL * 3))
    expect(result.current.step.id).toBe('tool-call')
    act(() => result.current.togglePlayback())
    for (let index = 2; index < toolExecutionSteps.length; index += 1) {
      act(() => vi.advanceTimersByTime(TOOL_EXECUTION_INTERVAL))
      expect(result.current.currentStep).toBe(index)
    }
    expect(result.current.isPlaying).toBe(false)
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(vi.getTimerCount()).toBe(0)
    act(() => vi.advanceTimersByTime(TOOL_EXECUTION_INTERVAL * 20))
    expect(result.current.currentStep).toBe(6)
  })

  it('pauses on manual navigation and visibility loss, and cancels pending work when unmounted', () => {
    vi.useFakeTimers()
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(false)
    const onComplete = vi.fn()
    const { result, unmount } = renderHook(() => useToolExecution(onComplete))
    act(() => result.current.togglePlayback())
    act(() => result.current.next())
    expect(result.current.isPlaying).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
    act(() => result.current.togglePlayback())
    hidden.mockReturnValue(true)
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(result.current.isPlaying).toBe(false)
    act(() => vi.advanceTimersByTime(TOOL_EXECUTION_INTERVAL * 10))
    expect(result.current.currentStep).toBe(1)
    hidden.mockReturnValue(false)
    act(() => result.current.togglePlayback())
    expect(vi.getTimerCount()).toBe(1)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
    expect(onComplete).not.toHaveBeenCalled()
  })
})
