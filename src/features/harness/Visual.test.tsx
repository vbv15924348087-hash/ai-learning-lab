import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ChapterVisual from './Visual'
import { modules } from './data'
afterEach(cleanup)
describe('Harness learning interaction', () => {
  it('requires opening the cover and inspecting every runtime responsibility', () => {
    const onComplete = vi.fn()
    render(<ChapterVisual step={1} onComplete={onComplete} completed={false} />)
    fireEvent.click(screen.getByRole('button', { name: '打开运行系统 →' }))
    expect(screen.getByRole('button', { name: '还需探索 11 个模块' })).toBeDisabled()
    for (const module of modules)
      fireEvent.click(screen.getByRole('button', { name: new RegExp(module.name) }))
    expect(screen.getByRole('status')).toHaveTextContent('已探索 11 / 11')
    fireEvent.click(screen.getByRole('button', { name: '全部探索完成 →' }))
    expect(onComplete).toHaveBeenCalledOnce()
  })
  it('separates a retryable read timeout from a permission denial', () => {
    const onComplete = vi.fn()
    render(<ChapterVisual step={2} onComplete={onComplete} completed={false} />)
    fireEvent.click(screen.getByRole('button', { name: '注入网络超时' }))
    expect(screen.getByRole('status')).toHaveTextContent('次数上限')
    expect(onComplete).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: '注入权限拒绝' }))
    expect(screen.getByRole('status')).toHaveTextContent('工具没有执行')
    fireEvent.click(screen.getByRole('button', { name: '确认：不同错误需要不同处理 →' }))
    expect(onComplete).toHaveBeenCalledOnce()
  })
})
