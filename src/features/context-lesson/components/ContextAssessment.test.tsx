import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ContextEngineeringChallenge } from './ContextEngineeringChallenge'
import { ContextMiniChallenge } from './ContextMiniChallenge'
import { ContextTerminology } from './ContextTerminology'

async function selectRelevantCards(user: ReturnType<typeof userEvent.setup>) {
  for (const name of [
    /^1\. 用户问题/,
    /^2\. NVIDIA 官方 GPU 页面/,
    /^4\. Web Search/,
    /^7\. 刚才搜索/,
  ]) {
    await user.click(screen.getByRole('button', { name }))
  }
}

describe('ContextEngineeringChallenge', () => {
  it('does not expose cards or submit controls before the practice step', () => {
    const onPass = vi.fn()
    render(<ContextEngineeringChallenge available={false} passed={false} onPass={onPass} />)
    expect(screen.getByText(/跟随上面的步骤/)).toBeVisible()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByText(/Context Engineering/)).not.toBeInTheDocument()
    expect(onPass).not.toHaveBeenCalled()
  })

  it('explains all eight cards on an empty submission and focuses the first missing card', async () => {
    const user = userEvent.setup()
    const onPass = vi.fn()
    render(<ContextEngineeringChallenge available passed={false} onPass={onPass} />)
    await user.click(screen.getByRole('button', { name: '检查我的选择' }))
    expect(onPass).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /^1\. 用户问题/ })).toHaveFocus()
    expect(screen.getAllByText('Relevant · 相关')).toHaveLength(4)
    expect(screen.getAllByText('Depends · 视情况')).toHaveLength(1)
    expect(screen.getAllByText('Irrelevant / Redundant · 无关或重复')).toHaveLength(3)
    expect(screen.getByText(/现在还需要继续搜索并核对最新信息/)).toBeVisible()
    expect(screen.getByText(/原始页面用于核对细节/)).toBeVisible()
  })

  it.each([false, true])(
    'accepts the relevant set with optional previous-project selection = %s',
    async (includeProject) => {
      const user = userEvent.setup()
      const onPass = vi.fn()
      render(<ContextEngineeringChallenge available passed={false} onPass={onPass} />)
      await selectRelevantCards(user)
      if (includeProject) await user.click(screen.getByRole('button', { name: /^5\. 用户昨天/ }))
      expect(onPass).not.toHaveBeenCalled()
      await user.click(screen.getByRole('button', { name: '检查我的选择' }))
      expect(onPass).toHaveBeenCalledTimes(1)
      expect(screen.getByText(/先确认关联，不能因为它来自昨天/)).toBeVisible()
    },
  )

  it('rejects irrelevant and repeated material and allows correction by keyboard', async () => {
    const user = userEvent.setup()
    const onPass = vi.fn()
    render(<ContextEngineeringChallenge available passed={false} onPass={onPass} />)
    await selectRelevantCards(user)
    const travel = screen.getByRole('button', { name: /^6\. 一篇香港旅游文章/ })
    const duplicate = screen.getByRole('button', { name: /^8\. 重复出现/ })
    await user.click(travel)
    await user.click(duplicate)
    await user.click(screen.getByRole('button', { name: '检查我的选择' }))
    expect(onPass).not.toHaveBeenCalled()
    expect(travel).toHaveFocus()
    expect(travel).toHaveAttribute('aria-invalid', 'true')
    await user.keyboard(' ')
    expect(travel).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByText(/已修改选择/)).toBeVisible()
    await user.click(duplicate)
    await user.click(screen.getByRole('button', { name: '再次检查选择' }))
    expect(onPass).toHaveBeenCalledTimes(1)
  })

  it('keeps required search context necessary even when no irrelevant cards are selected', async () => {
    const user = userEvent.setup()
    const onPass = vi.fn()
    render(<ContextEngineeringChallenge available passed={false} onPass={onPass} />)
    await selectRelevantCards(user)
    const tool = screen.getByRole('button', { name: /^4\. Web Search/ })
    await user.click(tool)
    await user.click(screen.getByRole('button', { name: '检查我的选择' }))
    expect(onPass).not.toHaveBeenCalled()
    expect(tool).toHaveFocus()
    await user.keyboard('{Enter}')
    await user.click(screen.getByRole('button', { name: '再次检查选择' }))
    expect(onPass).toHaveBeenCalledTimes(1)
  })

  it('offers review of a historical pass without submitting another pass', async () => {
    const onPass = vi.fn()
    const user = userEvent.setup()
    render(<ContextEngineeringChallenge available={false} passed onPass={onPass} />)
    expect(screen.getByRole('status')).toHaveTextContent('亲自做了一次 Context Engineering')
    expect(screen.getByText(/相同内容再放一份/)).not.toBeVisible()
    await user.click(screen.getByText('回顾八张信息卡的判断'))
    expect(screen.getByText(/相同内容再放一份/)).toBeVisible()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(onPass).not.toHaveBeenCalled()
  })
})

describe('ContextMiniChallenge', () => {
  it('locks the questions until teaching and engineering are complete', () => {
    render(<ContextMiniChallenge available={false} passed={false} onPass={vi.fn()} />)
    expect(screen.getByText(/通过整理工作台的练习后/)).toBeVisible()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('does not complete an empty submission and moves focus to the first question', async () => {
    const user = userEvent.setup()
    const onPass = vi.fn()
    render(<ContextMiniChallenge available passed={false} onPass={onPass} />)
    await user.click(screen.getByRole('button', { name: '检查答案并完成本章' }))
    expect(onPass).not.toHaveBeenCalled()
    expect(screen.getByRole('radio', { name: /Context · 当前工作台/ })).toHaveFocus()
    expect(screen.getByRole('alert')).toHaveTextContent('还有题目没有答对')
  })

  it('explains choices immediately, requires all relationships correct, and supports retry', async () => {
    const user = userEvent.setup()
    const onPass = vi.fn()
    render(<ContextMiniChallenge available passed={false} onPass={onPass} />)
    await user.click(screen.getByRole('radio', { name: /Memory · 长期仓库/ }))
    expect(screen.getByText(/再想一想。 中心是 Context/)).toBeVisible()
    expect(onPass).not.toHaveBeenCalled()
    await user.click(screen.getByRole('radio', { name: /Context · 当前工作台/ }))
    const capacity = screen.getByRole('group', { name: /2\. Context 快满了/ })
    await user.click(within(capacity).getByRole('radio', { name: /^是，/ }))
    await user.click(screen.getByRole('radio', { name: /^不应该/ }))
    await user.click(screen.getByRole('button', { name: '检查答案并完成本章' }))
    expect(onPass).not.toHaveBeenCalled()
    expect(within(capacity).getByRole('radio', { name: /^是，/ })).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(within(capacity).getByRole('radio', { name: /^不是，/ })).toBeChecked()
    expect(screen.getByText(/理解正确。 不是。Context 是当前工作台/)).toBeVisible()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(onPass).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: '检查答案并完成本章' }))
    expect(onPass).toHaveBeenCalledTimes(1)
  })

  it('prevents prepared answers from submitting while locked and preserves a recorded pass for review', async () => {
    const user = userEvent.setup()
    const onPass = vi.fn()
    const { rerender } = render(<ContextMiniChallenge available passed={false} onPass={onPass} />)
    await user.click(screen.getByRole('radio', { name: /Context · 当前工作台/ }))
    await user.click(screen.getByRole('radio', { name: /^不是，/ }))
    await user.click(screen.getByRole('radio', { name: /^不应该/ }))
    rerender(<ContextMiniChallenge available={false} passed={false} onPass={onPass} />)
    await user.keyboard('{Enter}')
    expect(onPass).not.toHaveBeenCalled()
    rerender(<ContextMiniChallenge available={false} passed onPass={onPass} />)
    expect(screen.getByRole('status')).toHaveTextContent('本章小测试已通过')
    expect(screen.getByText(/通过记录已保留/)).toBeVisible()
    await user.click(screen.getByText('回顾三道题的答案与解释'))
    expect(screen.getByText(/Context Window 与长期 Memory 的容量/)).toBeVisible()
    expect(onPass).not.toHaveBeenCalled()
  })
})

describe('ContextTerminology', () => {
  it('hides locked names and reveals only encountered terms with technical details folded', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<ContextTerminology unlockedTerms={[]} />)
    expect(screen.getAllByText('待解锁')).toHaveLength(4)
    expect(screen.queryByText('Context')).not.toBeInTheDocument()
    expect(screen.queryByText('Context Window')).not.toBeInTheDocument()
    rerender(<ContextTerminology unlockedTerms={['context']} />)
    expect(screen.getByText('已认识 1 / 4')).toBeVisible()
    expect(screen.getByText('模型这一刻工作台上的全部资料。')).toBeVisible()
    expect(screen.getByText(/模型当前这一次推理能够看到的信息集合/)).toBeVisible()
    expect(screen.getByText(/通常包含系统指令/)).not.toBeVisible()
    expect(screen.queryByText('Context Window')).not.toBeInTheDocument()
    await user.click(screen.getByText('查看技术解释 →'))
    expect(screen.getByText(/通常包含系统指令/)).toBeVisible()
  })
})
