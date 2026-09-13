import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ChapterVisual from './Visual'
import { services } from './data'
afterEach(cleanup)
describe('MCP learning interaction', () => {
  it('keeps discovery separate from execution and requires reading all three services', () => {
    const onComplete = vi.fn()
    render(<ChapterVisual step={1} onComplete={onComplete} completed={false} />)
    expect(screen.getByText('已经发现工具，还没有执行调用。')).toBeVisible()
    expect(onComplete).not.toHaveBeenCalled()
    for (const service of services) {
      fireEvent.click(
        screen.getByRole('button', { name: new RegExp(`${service.name} MCP Server`) }),
      )
      expect(screen.getByText(service.tool)).toBeVisible()
      fireEvent.click(screen.getByRole('button', { name: `模拟读取 ${service.name} →` }))
      expect(screen.getByText(service.result)).toBeVisible()
    }
    expect(screen.getByRole('status')).toHaveTextContent('已体验 3 / 3')
    fireEvent.click(screen.getByRole('button', { name: '确认：协议相同，能力不同 →' }))
    expect(onComplete).toHaveBeenCalledOnce()
  })
  it('requires inspecting each capability and comparing transports', () => {
    const onComplete = vi.fn()
    render(<ChapterVisual step={2} onComplete={onComplete} completed={false} />)
    fireEvent.click(screen.getByRole('button', { name: /Tool 可请求执行的能力/ }))
    fireEvent.click(screen.getByRole('button', { name: /Resource 可读取的资料/ }))
    expect(screen.getByRole('status')).toHaveTextContent('资源本身不是一个动作请求')
    fireEvent.click(screen.getByRole('button', { name: /Prompt 可复用的提示模板/ }))
    expect(screen.getByRole('button', { name: '再比较网络 Transport' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '网络 Streamable HTTP' }))
    fireEvent.click(screen.getByRole('button', { name: '确认：能力类型与传输方式各有职责 →' }))
    expect(onComplete).toHaveBeenCalledOnce()
  })
})
