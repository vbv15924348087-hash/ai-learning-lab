import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ChapterVisual from './Visual'
afterEach(cleanup)
describe('Memory learning interaction', () => {
  it('keeps saved information separate from Context until retrieval and injection', () => {
    const onComplete = vi.fn()
    render(<ChapterVisual step={1} onComplete={onComplete} completed={false} />)
    fireEvent.click(screen.getByRole('checkbox', { name: /稳定偏好/ }))
    fireEvent.click(screen.getByRole('checkbox', { name: /关键决策/ }))
    fireEvent.click(screen.getByRole('button', { name: '保存 2 条并开始 Task 2 →' }))
    expect(screen.getByText('2 条已保存信息')).toBeVisible()
    expect(screen.getByText('还没有加入上次任务的信息。')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: '检索与新研究任务相关的记忆 →' }))
    expect(screen.getByRole('status')).toHaveTextContent('找到 1 条相关偏好')
    expect(onComplete).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: '把相关偏好加入本轮 Context →' }))
    expect(screen.getByText('来自 Memory 的相关偏好')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: '确认：保存不等于自动可见 →' }))
    expect(onComplete).toHaveBeenCalledOnce()
  })
  it('cannot retrieve an unsaved preference and allows returning to fix the decision', () => {
    const onComplete = vi.fn()
    render(<ChapterVisual step={1} onComplete={onComplete} completed={false} />)
    fireEvent.click(screen.getByRole('button', { name: '不保存，直接开始 Task 2 →' }))
    fireEvent.click(screen.getByRole('button', { name: '检索与新研究任务相关的记忆 →' }))
    expect(screen.getByRole('status')).toHaveTextContent('没有写入的信息，检索也无法凭空恢复')
    expect(onComplete).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: '返回 Task 1，重新选择保存内容 →' }))
    expect(screen.getByRole('checkbox', { name: /稳定偏好/ })).toBeVisible()
  })
})
