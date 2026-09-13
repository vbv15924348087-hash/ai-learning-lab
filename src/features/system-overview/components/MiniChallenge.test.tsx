import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MiniChallenge } from './MiniChallenge'
import { TerminologyUnlock } from './TerminologyUnlock'

function startChallenge(available = true, passed = false) {
  const onPass = vi.fn()
  const view = render(<MiniChallenge available={available} passed={passed} onPass={onPass} />)
  return { ...view, onPass, user: userEvent.setup() }
}

describe('MiniChallenge', () => {
  it('keeps the questions unavailable until the lesson interaction is complete', () => {
    const { onPass } = startChallenge(false)

    expect(screen.getByText(/走完上面的流程/)).toBeVisible()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '检查答案' })).not.toBeInTheDocument()
    expect(onPass).not.toHaveBeenCalled()
  })

  it('does not allow an empty submission to complete the lesson', async () => {
    const { user, onPass } = startChallenge()

    await user.click(screen.getByRole('button', { name: '检查答案' }))

    expect(onPass).not.toHaveBeenCalled()
    expect(screen.getAllByRole('alert')).toHaveLength(3)
    expect(screen.getByRole('combobox', { name: /第一个空/ })).toHaveFocus()
  })

  it('explains an incorrect flow and clears outdated feedback when an answer changes', async () => {
    const { user, onPass } = startChallenge()
    const information = screen.getByRole('combobox', { name: /第一个空/ })
    const execution = screen.getByRole('combobox', { name: /第二个空/ })

    await user.selectOptions(information, 'tool')
    await user.selectOptions(execution, 'model')
    await user.click(screen.getByRole('radio', { name: /^不是/ }))
    await user.click(screen.getByRole('button', { name: '检查答案' }))

    expect(onPass).not.toHaveBeenCalled()
    expect(screen.getByText(/模型只发起搜索请求，Harness/)).toBeVisible()
    expect(information).toHaveAttribute('aria-invalid', 'true')
    expect(execution).toHaveAttribute('aria-invalid', 'true')

    await user.selectOptions(information, 'context')

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(information).toHaveAttribute('aria-invalid', 'false')
    expect(onPass).not.toHaveBeenCalled()
  })

  it('requires the judgment question to be correct even when both flow slots are correct', async () => {
    const { user, onPass } = startChallenge()

    await user.selectOptions(screen.getByRole('combobox', { name: /第一个空/ }), 'context')
    await user.selectOptions(screen.getByRole('combobox', { name: /第二个空/ }), 'harness')
    await user.click(screen.getByRole('radio', { name: /^是 / }))
    await user.click(screen.getByRole('button', { name: '检查答案' }))

    expect(onPass).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('发起请求和执行搜索是两件事')

    await user.click(screen.getByRole('radio', { name: /^不是/ }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(onPass).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: '检查答案' }))
    expect(onPass).toHaveBeenCalledTimes(1)
  })

  it('supports a keyboard focus path, native selects, arrow-key judgment, and Enter submission', async () => {
    const { user, onPass } = startChallenge()
    const information = screen.getByRole('combobox', { name: /第一个空/ })
    const execution = screen.getByRole('combobox', { name: /第二个空/ })

    await user.tab()
    expect(information).toHaveFocus()
    // Native selects keep browser keyboard behavior; selectOptions simulates their change in jsdom.
    await user.selectOptions(information, 'context')
    await user.tab()
    expect(execution).toHaveFocus()
    await user.selectOptions(execution, 'harness')
    await user.tab()
    expect(screen.getByRole('radio', { name: /^是 / })).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('radio', { name: /^不是/ })).toBeChecked()
    await user.tab()
    expect(screen.getByRole('button', { name: '检查答案' })).toHaveFocus()
    expect(onPass).not.toHaveBeenCalled()
    await user.keyboard('{Enter}')

    expect(onPass).toHaveBeenCalledTimes(1)
  })

  it('cannot submit a prepared answer after the challenge becomes unavailable', async () => {
    const { user, onPass, rerender } = startChallenge()

    await user.selectOptions(screen.getByRole('combobox', { name: /第一个空/ }), 'context')
    await user.selectOptions(screen.getByRole('combobox', { name: /第二个空/ }), 'harness')
    await user.click(screen.getByRole('radio', { name: /^不是/ }))
    rerender(<MiniChallenge available={false} passed={false} onPass={onPass} />)
    await user.keyboard('{Enter}')

    expect(screen.queryByRole('button', { name: '检查答案' })).not.toBeInTheDocument()
    expect(onPass).not.toHaveBeenCalled()
  })

  it('preserves historical completion while replaying and provides an accessible answer review', async () => {
    const { user, onPass } = startChallenge(false, true)

    expect(screen.getByRole('status')).toHaveTextContent('本节挑战已通过')
    expect(screen.getByText(/之前的通过记录已保留/)).toBeVisible()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(screen.getByText(/判断题答案是「不是」/)).not.toBeVisible()
    await user.click(screen.getByText('回顾答案与解释'))
    expect(screen.getByText(/判断题答案是「不是」/)).toBeVisible()
    expect(onPass).not.toHaveBeenCalled()
  })
})

describe('TerminologyUnlock', () => {
  it('does not expose names or definitions before their moment in the lesson', () => {
    render(<TerminologyUnlock unlockedTerms={[]} />)

    expect(screen.getAllByText('待解锁')).toHaveLength(5)
    expect(screen.queryByText('Context')).not.toBeInTheDocument()
    expect(screen.queryByText('Harness')).not.toBeInTheDocument()
    expect(screen.queryByText('AI System')).not.toBeInTheDocument()
    expect(screen.queryByText(/接住模型的请求/)).not.toBeInTheDocument()
  })

  it('reveals only the concepts that have been encountered', () => {
    render(<TerminologyUnlock unlockedTerms={['context', 'model']} />)

    expect(screen.getByText('已认识 2 / 5')).toBeVisible()
    expect(screen.getByRole('heading', { name: /Context 上下文/ })).toBeVisible()
    expect(screen.getByText(/模型此刻的工作台/)).toBeVisible()
    expect(screen.getByRole('heading', { name: /Model 模型/ })).toBeVisible()
    expect(screen.queryByText('Tool')).not.toBeInTheDocument()
    expect(screen.getAllByText('待解锁')).toHaveLength(3)
  })
})
