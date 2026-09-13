import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ToolExecutionFlow } from './ToolExecutionFlow'
import { ToolResultCard } from './ToolResultCard'
import { ToolsFlowSummary } from './ToolsFlowSummary'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('Tool execution visualization and results', () => {
  it('steps through responsibility boundaries by keyboard and highlights the matching node', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    const { container } = render(<ToolExecutionFlow onComplete={onComplete} />)
    const next = screen.getByRole('button', { name: '下一步：模型生成 Tool Call' })
    next.focus()
    await user.keyboard('{Enter}')
    expect(container.querySelector('[data-node="tool-call"]')).toHaveAttribute(
      'data-active',
      'true',
    )
    expect(screen.getByText('此时只是生成请求，搜索尚未执行。')).toBeVisible()
    expect(container.querySelector('.tl-flow-edge-active')).toBeInTheDocument()
    expect(container.querySelector('animateMotion')).toBeInTheDocument()
    expect(onComplete).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: '下一步：把请求交给 Harness' }))
    expect(container.querySelector('[data-node="harness"]')).toHaveAttribute('data-active', 'true')
    await user.click(screen.getByRole('button', { name: '下一步：Harness 执行 Web Search' }))
    expect(screen.getByText('真正发起执行的是 Harness；Model 没有自己上网。')).toBeVisible()
    await user.click(screen.getByRole('button', { name: '下一步：查看工具返回的结果' }))
    expect(screen.getByText('Tool Result 是工具输出，还不是最终回答。')).toBeVisible()
    await user.click(screen.getByRole('button', { name: '下一步：将 Tool Result 加入 Context' }))
    expect(container.querySelector('[data-node="context"]')).toHaveAttribute('data-active', 'true')
    await user.click(screen.getByRole('button', { name: '下一步：Model 读取结果并回答' }))
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: '已看完：结果回到模型' })).toBeDisabled()
  })

  it('uses static position and stage highlighting with reduced motion while keeping manual completion', () => {
    vi.stubGlobal(
      'matchMedia',
      vi
        .fn()
        .mockReturnValue({
          matches: true,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }),
    )
    const onComplete = vi.fn()
    const { container } = render(<ToolExecutionFlow onComplete={onComplete} />)
    expect(screen.queryByRole('button', { name: '自动播放' })).not.toBeInTheDocument()
    for (let step = 1; step < 7; step += 1)
      fireEvent.click(screen.getByRole('button', { name: /^下一步：/ }))
    expect(container.querySelector('animateMotion')).not.toBeInTheDocument()
    expect(container.querySelector('.tl-flow-packet')).toHaveAttribute(
      'transform',
      'translate(333, 276)',
    )
    expect(container.querySelector('[data-node="model-answer"]')).toHaveAttribute(
      'data-active',
      'true',
    )
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('requires adding the clearly fictional result to Context before showing the model answer', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<ToolResultCard onComplete={onComplete} />)
    expect(screen.getByText('虚构数据 · 教学模拟')).toBeVisible()
    expect(screen.getByText('来源：课程内置模拟资料（无真实网页）')).toBeVisible()
    expect(screen.getByText('型号与内容均为虚构，不代表 NVIDIA 当前或最新产品。')).toBeVisible()
    expect(screen.queryByText('MODEL · 教学模拟回答')).not.toBeInTheDocument()
    expect(onComplete).not.toHaveBeenCalled()
    const add = screen.getByRole('button', { name: '试试看：把 Tool Result 加入 Context' })
    add.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByText('已加入：示例 GPU A 的模拟资料、来源与标题。')).toBeVisible()
    expect(screen.getByText('MODEL · 教学模拟回答')).toBeVisible()
    expect(screen.getByRole('status')).toHaveTextContent('不能据此判断 NVIDIA 最新的真实产品')
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('provides a complete text equivalent of schema, execution, and result return relationships', () => {
    render(<ToolsFlowSummary />)
    expect(screen.getByRole('img')).toHaveAccessibleName(
      'Tool Schema 提前提供给 Model；Context → Model → Tool Call → Harness → Tool → Tool Result → Context → Model → Answer。',
    )
    expect(screen.getByText('Function Calling')).toBeInTheDocument()
  })
})
