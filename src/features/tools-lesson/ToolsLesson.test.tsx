import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../app/App'
import { LEARNING_STORAGE_KEY, useLearningStore } from '../../stores/learningStore'

vi.mock('../../components/three/SystemMapCanvas', () => ({ SystemMapCanvas: () => <div /> }))

beforeEach(() => {
  localStorage.clear()
  useLearningStore.getState().resetProgress()
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})
afterEach(() => vi.restoreAllMocks())

const openLesson = () =>
  render(
    <MemoryRouter initialEntries={['/lesson/tools']}>
      <App />
    </MemoryRouter>,
  )

describe('Tools learning journey', () => {
  it('teaches the complete request/execution boundary, restores progress and awards completion after four correct answers', async () => {
    const user = userEvent.setup()
    let view = openLesson()
    const next = async () => user.click(screen.getByRole('button', { name: /^下一步：/ }))
    expect(screen.getByText('已认识 0 / 5')).toBeVisible()
    expect(screen.getByRole('button', { name: /^下一步：/ })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: /A\s*直接回答/ }))
    expect(screen.getByRole('status')).toHaveTextContent('无法保证是今天最新的信息')
    await user.click(screen.getByRole('button', { name: /B\s*使用 Tool/ }))
    const shelf = screen.getByRole('region', { name: '工具架' })
    await user.click(within(shelf).getByRole('button', { name: /Read File/ }))
    expect(screen.getByRole('button', { name: /^下一步：/ })).toBeDisabled()
    await user.click(within(shelf).getByRole('button', { name: /Web Search/ }))
    expect(screen.getByText('已认识 1 / 5')).toBeVisible()
    await next()
    const matching = screen.getByRole('region', { name: '工具匹配练习' })
    for (const [tool, action] of [
      ['Web Search', '下一题'],
      ['Run Code', '下一题'],
      ['Read File', '完成工具匹配'],
    ]) {
      await user.click(within(matching).getByRole('button', { name: new RegExp(tool) }))
      await user.click(within(matching).getByRole('button', { name: action }))
    }
    await next()
    await user.click(screen.getByRole('button', { name: '转换成 Tool Call' }))
    await user.click(screen.getByRole('button', { name: '查看 tool 字段含义' }))
    expect(screen.getByRole('button', { name: /^下一步：/ })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: '查看 query 字段含义' }))
    expect(screen.getByText('已认识 3 / 5')).toBeVisible()
    await next()
    await user.click(screen.getByRole('button', { name: /深入一点：为什么模型知道/ }))
    await user.click(screen.getByRole('button', { name: '我明白了：说明书与本次请求不同' }))
    await next()

    const saved = localStorage.getItem(LEARNING_STORAGE_KEY)!
    view.unmount()
    useLearningStore.getState().resetProgress()
    localStorage.setItem(LEARNING_STORAGE_KEY, saved)
    await act(async () => useLearningStore.persist.rehydrate())
    view = openLesson()
    expect(screen.getByRole('progressbar', { name: '本章教学步骤' })).toHaveAttribute(
      'aria-valuenow',
      '6',
    )
    expect(screen.getByText('已认识 4 / 5')).toBeVisible()
    const builder = screen.getByRole('region', { name: 'Function Call Builder' })
    await user.click(within(builder).getByRole('button', { name: /Web Search/ }))
    await user.click(within(builder).getByRole('button', { name: '生成 Tool Call' }))
    expect(within(builder).getByRole('alert')).toHaveTextContent('请填写')
    expect(screen.getByRole('button', { name: /^下一步：/ })).toBeDisabled()
    await user.click(within(builder).getByRole('button', { name: '填入示例' }))
    await user.click(within(builder).getByRole('button', { name: '生成 Tool Call' }))
    await next()
    await user.click(screen.getByRole('button', { name: /A\s*已经发生/ }))
    expect(screen.getByRole('button', { name: /^下一步：/ })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: /B\s*还没有/ }))
    await next()
    const flow = screen.getByRole('region', { name: '工具执行流程教学模拟' })
    for (let index = 0; index < 6; index++)
      await user.click(within(flow).getByRole('button', { name: /^下一步/ }))
    await next()
    const result = screen.getByRole('region', { name: 'Tool Result 进入 Context 教学模拟' })
    expect(within(result).queryByText('MODEL · 教学模拟回答')).not.toBeInTheDocument()
    await user.click(within(result).getByRole('button', { name: /把 Tool Result 加入 Context/ }))
    expect(within(result).getByRole('status')).toHaveTextContent('Model 读取结果')
    await next()
    expect(screen.getByText('已认识 5 / 5')).toBeVisible()
    expect(useLearningStore.getState().completedLessonIds).not.toContain('tools')
    await user.click(screen.getByRole('button', { name: '检查答案' }))
    expect(screen.getAllByRole('alert')).toHaveLength(4)
    expect(screen.getByRole('radio', { name: '直接假装读过' })).toHaveFocus()
    for (const answer of [
      '调用 Read File Tool',
      'Harness',
      '加入 Context，让 Model 继续处理',
      'Tool Schema',
    ])
      await user.click(screen.getByRole('radio', { name: new RegExp(`^${answer}$`) }))
    await user.click(screen.getByRole('button', { name: '检查答案' }))
    expect(screen.getByRole('status', { name: '章节学习完成' })).toBeVisible()
    expect(useLearningStore.getState().completedLessonIds).toContain('tools')
    expect(useLearningStore.getState().unlockedLessonIds).toContain('agent-loop')
    await user.click(screen.getByRole('button', { name: '重温本章' }))
    expect(screen.getByRole('progressbar', { name: '本章教学步骤' })).toHaveAttribute(
      'aria-valuenow',
      '1',
    )
    expect(useLearningStore.getState().lessonProgress.tools).toBe(100)
    expect(screen.getByText('已认识 5 / 5')).toBeVisible()
    view.unmount()
  })
})
