import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Visual from './Visual'
import { checkpointItems } from './data'

describe('Compaction preserves continuity', () => {
  it('grows 40 → 70 → 90, compacts, then restores without deleting Memory', async () => {
    const user = userEvent.setup()
    const done = vi.fn()
    render(<Visual step={1} completed={false} onComplete={done} />)
    const meter = screen.getByRole('progressbar')
    expect(meter).toHaveAttribute('aria-valuenow', '40')
    await user.click(screen.getByRole('button', { name: /继续读取资料/ }))
    expect(meter).toHaveAttribute('aria-valuenow', '70')
    await user.click(screen.getByRole('button', { name: /再推进一轮/ }))
    expect(meter).toHaveAttribute('aria-valuenow', '90')
    expect(done).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: '压缩历史 Context' }))
    expect(meter).toHaveAttribute('aria-valuenow', '35')
    expect(screen.getByRole('status')).toHaveTextContent('Memory 不变')
    expect(screen.getByText('Failures · 失败教训')).toBeVisible()
    expect(screen.getByText('Key Evidence · 关键证据')).toBeVisible()
    expect(done).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: '读取摘要，恢复继续工作' }))
    expect(done).toHaveBeenCalledOnce()
    expect(screen.getByRole('status')).toHaveTextContent('下一项是核对功耗单位')
  })
  it('rejects losing essential evidence and only accepts the six continuation fields', async () => {
    const user = userEvent.setup()
    const done = vi.fn()
    render(<Visual step={2} completed={false} onComplete={done} />)
    for (const item of checkpointItems.filter((item) => item.keep && item.id !== 'evidence'))
      await user.click(screen.getByRole('button', { name: new RegExp(item.title) }))
    await user.click(screen.getByRole('button', { name: /检查接续记录/ }))
    expect(done).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: /Key Evidence/ }))
    await user.click(screen.getByRole('button', { name: /检查接续记录/ }))
    expect(done).toHaveBeenCalledOnce()
  })
})
