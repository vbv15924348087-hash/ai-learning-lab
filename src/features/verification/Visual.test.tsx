import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Visual from './Visual'
import { testPowerConversion } from './data'
import * as simulation from './data'

afterEach(() => vi.restoreAllMocks())

describe('Evidence-based completion', () => {
  it('requires FAIL, error reading, fix, passing test and requirements before DONE', async () => {
    const user = userEvent.setup()
    const done = vi.fn()
    render(<Visual step={1} completed={false} onComplete={done} />)
    for (const label of ['生成换算代码', '运行测试'])
      await user.click(screen.getByRole('button', { name: label }))
    expect(screen.getByRole('status')).toHaveTextContent('FAIL')
    expect(screen.queryByRole('button', { name: /标记完成/ })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '读取错误信息' }))
    expect(screen.getByRole('status')).toHaveTextContent('Expected 0.4，Received 4')
    await user.click(screen.getByRole('button', { name: '修复换算代码' }))
    expect(screen.getByRole('status')).toHaveTextContent('请重新测试')
    await user.click(screen.getByRole('button', { name: '重新运行测试' }))
    expect(screen.getByRole('status')).toHaveTextContent('TEST PASS')
    expect(done).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: '核对原始需求' }))
    expect(screen.getByRole('status')).toHaveTextContent('REQUIREMENTS PASS')
    expect(done).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: /标记完成/ }))
    expect(screen.getByRole('status')).toHaveTextContent('DONE')
    expect(done).toHaveBeenCalledOnce()
  })
  it('checks the numerical claim rather than merely printing a predetermined PASS', () => {
    expect(testPowerConversion(false)).toEqual({ actual: 4, expected: 0.4, passed: false })
    expect(testPowerConversion(true)).toEqual({ actual: 0.4, expected: 0.4, passed: true })
  })
  it('blocks requirements and DONE when the rerun still fails, and supports another repair', async () => {
    const user = userEvent.setup()
    const done = vi.fn()
    const failedCheck = vi
      .spyOn(simulation, 'testPowerConversion')
      .mockReturnValue({ actual: 4, expected: 0.4, passed: false })
    render(<Visual step={1} completed={false} onComplete={done} />)
    for (const name of [
      '生成换算代码',
      '运行测试',
      '读取错误信息',
      '修复换算代码',
      '重新运行测试',
    ]) {
      await user.click(screen.getByRole('button', { name }))
    }
    expect(screen.getByRole('status')).toHaveTextContent('TEST FAIL')
    expect(screen.queryByRole('button', { name: '核对原始需求' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /标记完成/ })).not.toBeInTheDocument()
    expect(done).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: '测试未通过，返回修复' }))
    expect(screen.getByRole('status')).toHaveTextContent('读取错误')
    failedCheck.mockRestore()
    for (const name of ['修复换算代码', '重新运行测试', '核对原始需求', '全部条件满足，标记完成']) {
      await user.click(screen.getByRole('button', { name }))
    }
    expect(done).toHaveBeenCalledOnce()
  })
})
