import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Visual from './Visual'

describe('Multi-Agent control ownership', () => {
  it('returns a delegated result before completing Agent-as-Tool', async () => {
    const user = userEvent.setup()
    const done = vi.fn()
    render(<Visual step={1} completed={false} onComplete={done} />)
    await user.click(screen.getByRole('button', { name: '委派研究任务' }))
    expect(done).not.toHaveBeenCalled()
    expect(screen.getByRole('status')).toHaveTextContent('整体负责人仍是 Manager')
    expect(screen.getByText(/只核对 GPU 功耗/)).toBeVisible()
    await user.click(screen.getByRole('button', { name: '返回研究结果' }))
    expect(screen.getByRole('status')).toHaveTextContent('由 Manager 决定下一步')
    expect(done).toHaveBeenCalledOnce()
  })
  it('transfers the subsequent task to Data rather than automatically returning', async () => {
    const user = userEvent.setup()
    const done = vi.fn()
    render(<Visual step={2} completed={false} onComplete={done} />)
    await user.click(screen.getByRole('button', { name: '交接给数据 Agent' }))
    expect(done).not.toHaveBeenCalled()
    expect(screen.getByRole('status')).toHaveTextContent('Data Agent 已接手')
    await user.click(screen.getByRole('button', { name: '由数据 Agent 继续分析' }))
    expect(screen.getByRole('status')).toHaveTextContent('没有默认回传')
    expect(done).toHaveBeenCalledOnce()
  })
})
