import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Visual from './Visual'

describe('Workflow comparison', () => {
  it('requires observing an exception and choosing an action that can supply evidence', async () => {
    const user = userEvent.setup()
    const done = vi.fn()
    render(<Visual step={1} completed={false} onComplete={done} />)
    expect(screen.getByRole('button', { name: '读取已有官方 PDF' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: /制造异常/ }))
    expect(done).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: '运行代码' }))
    expect(done).not.toHaveBeenCalled()
    expect(screen.getByRole('status')).toHaveTextContent('缺的是可靠资料')
    await user.click(screen.getByRole('button', { name: '读取已有官方 PDF' }))
    expect(done).toHaveBeenCalledOnce()
    expect(screen.getByRole('status')).toHaveTextContent('读官方 PDF')
  })
  it('demonstrates that a predefined exception branch remains a workflow', async () => {
    const user = userEvent.setup()
    const done = vi.fn()
    render(<Visual step={2} completed={false} onComplete={done} />)
    await user.click(screen.getByRole('button', { name: '加入预定义异常分支' }))
    expect(screen.getByRole('status')).toHaveTextContent('仍然是 Workflow')
    const route = screen.getAllByRole('listitem')
    expect(route).toHaveLength(5)
    expect(route[0]).toHaveTextContent('搜索资料')
    expect(route[1]).toHaveTextContent('读取本地 PDF')
    expect(route[2]).toHaveTextContent('提取参数')
    expect(route[4]).toHaveTextContent('写入报告')
    expect(done).toHaveBeenCalledOnce()
  })
})
