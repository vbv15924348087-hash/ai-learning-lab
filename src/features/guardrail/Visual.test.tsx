import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Visual from './Visual'

describe('Human approval teaching simulation', () => {
  it.each(['Approve', 'Reject'])(
    'accepts an explicit %s decision only after risk inspection',
    async (decision) => {
      const user = userEvent.setup()
      const done = vi.fn()
      const fetchSpy = vi.spyOn(globalThis, 'fetch')
      render(<Visual step={1} completed={false} onComplete={done} />)
      expect(screen.queryByRole('button', { name: new RegExp(decision) })).not.toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: '运行风险检查' }))
      expect(screen.getByText('HIGH RISK · 需要人工判断')).toBeVisible()
      expect(done).not.toHaveBeenCalled()
      await user.click(screen.getByRole('button', { name: new RegExp(decision) }))
      expect(done).toHaveBeenCalledOnce()
      expect(screen.getByRole('status')).toHaveTextContent('安全模拟已完成')
      expect(screen.queryByText('等待风险检查')).not.toBeInTheDocument()
      expect(screen.queryByText('等待批准；没有执行')).not.toBeInTheDocument()
      expect(screen.getByText('人工决策已记录')).toBeVisible()
      expect(screen.getByRole('button', { name: /Approve/ })).toBeDisabled()
      expect(screen.getByRole('button', { name: /Reject/ })).toBeDisabled()
      expect(fetchSpy).not.toHaveBeenCalled()
      fetchSpy.mockRestore()
    },
  )
  it('does not reward bypassing a rejected action', async () => {
    const user = userEvent.setup()
    const done = vi.fn()
    render(<Visual step={3} completed={false} onComplete={done} />)
    await user.click(screen.getByRole('button', { name: '换一个工具继续删除' }))
    expect(done).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: '改用已授权的只读分析' }))
    expect(done).toHaveBeenCalledOnce()
  })
})
