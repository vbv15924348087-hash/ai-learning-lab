import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useLearningStore } from '../../../stores/learningStore'
import { ExperimentPanel } from './ExperimentPanel'
import { experiments } from './experiments'
import type { ExperimentPanelProps } from './types'

const props = (): ExperimentPanelProps => ({
  scenarioId: 'rag-off',
  altered: false,
  hasRun: false,
  onScenario: vi.fn(),
  onAltered: vi.fn(),
  onRun: vi.fn(),
  onRestore: vi.fn(),
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('immersive experiment controls', () => {
  it('starts with the normal configuration and waits for explicit run before revealing the outcome', () => {
    const callbacks = props()
    const { rerender } = render(<ExperimentPanel {...callbacks} />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false')
    expect(screen.queryByText(experiments[0].normal.title)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '运行正常系统' }))
    expect(callbacks.onRun).toHaveBeenCalledOnce()
    rerender(<ExperimentPanel {...callbacks} hasRun />)
    expect(screen.getByRole('heading', { name: experiments[0].normal.title })).toBeInTheDocument()
    expect(screen.getByText(experiments[0].normal.takeaway)).toBeInTheDocument()
  })

  it('reports changes to its owner and hides the previous run while an altered configuration awaits execution', () => {
    const callbacks = props()
    const { rerender } = render(<ExperimentPanel {...callbacks} hasRun />)
    fireEvent.click(screen.getByRole('switch'))
    expect(callbacks.onAltered).toHaveBeenCalledWith(true)
    // The owner invalidates hasRun when the configuration changes.
    rerender(<ExperimentPanel {...callbacks} altered hasRun={false} />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
    expect(screen.queryByText(experiments[0].normal.title)).not.toBeInTheDocument()
    expect(screen.queryByText(experiments[0].altered.title)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '运行改动后的系统' }))
    expect(callbacks.onRun).toHaveBeenCalledOnce()
    rerender(<ExperimentPanel {...callbacks} altered hasRun />)
    expect(screen.getByRole('heading', { name: experiments[0].altered.title })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '重新运行' }))
    expect(callbacks.onRun).toHaveBeenCalledTimes(2)
  })

  it('offers every experiment and an explicit restore control without executing tools or writing learning progress', () => {
    const callbacks = props()
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    const writeSpy = vi.spyOn(Storage.prototype, 'setItem')
    const progressBefore = useLearningStore.getState()
    render(<ExperimentPanel {...callbacks} />)
    expect(screen.getAllByRole('option')).toHaveLength(6)
    fireEvent.change(screen.getByRole('combobox', { name: '选择实验' }), {
      target: { value: 'approval-off' },
    })
    expect(callbacks.onScenario).toHaveBeenCalledWith('approval-off')
    fireEvent.click(screen.getByRole('button', { name: '恢复默认' }))
    expect(callbacks.onRestore).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByRole('button', { name: '运行正常系统' }))
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(writeSpy).not.toHaveBeenCalled()
    expect(useLearningStore.getState()).toBe(progressBefore)
  })

  it('calls an unchecked delivery unverified, even after the altered run has been loaded', () => {
    render(<ExperimentPanel {...props()} scenarioId="verification-off" altered hasRun />)
    expect(
      screen.getByRole('heading', { name: '错误候选被直接交付，状态仍是“未核验”' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('实验刻意跳过检查；4 ms 没有被修正。到达 Final 不能当作检查通过。'),
    ).toBeInTheDocument()
  })
})
