import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import App from '../../app/App'
import { LEARNING_STORAGE_KEY, useLearningStore } from '../../stores/learningStore'
import { generationSteps } from './data/predictionDemoData'

vi.mock('./components/TransformerScene', () => ({ default: () => <div>桌面计算层示意</div> }))
vi.mock('../../components/three/SystemMapCanvas', () => ({ SystemMapCanvas: () => <div /> }))

beforeEach(() => {
  localStorage.clear()
  useLearningStore.getState().resetProgress()
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})
afterEach(() => vi.restoreAllMocks())

const openLesson = () =>
  render(
    <MemoryRouter initialEntries={['/lesson/model-inside']}>
      <App />
    </MemoryRouter>,
  )

describe('Model Inside complete learning journey', () => {
  it('requires real interactions, restores progress and completes only after correct process answers', async () => {
    const user = userEvent.setup()
    let view = openLesson()
    expect(screen.getByText('已认识 0 / 5')).toBeVisible()
    await user.click(screen.getByRole('button', { name: '进入模型内部' }))
    expect(screen.getByRole('button', { name: '看看小块怎样变成数字' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: '看看模型真正收到的东西' }))
    expect(screen.getByText('已认识 1 / 5')).toBeVisible()
    await user.click(screen.getByRole('button', { name: '看看小块怎样变成数字' }))
    expect(screen.getByRole('button', { name: '跟随信息进入计算层' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: '1 · 查找「苹果」的编号' }))
    await user.click(screen.getByRole('button', { name: '2 · 按编号取出数字卡' }))
    expect(screen.getByRole('button', { name: '跟随信息进入计算层' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: '取出的整组数字' }))
    await user.click(screen.getByRole('button', { name: '跟随信息进入计算层' }))
    const saved = localStorage.getItem(LEARNING_STORAGE_KEY)!
    view.unmount()
    useLearningStore.getState().resetProgress()
    localStorage.setItem(LEARNING_STORAGE_KEY, saved)
    await act(async () => useLearningStore.persist.rehydrate())
    view = openLesson()
    expect(screen.getByRole('progressbar', { name: '本章教学步骤' })).toHaveAttribute(
      'aria-valuenow',
      '4',
    )
    expect(screen.getByText('已认识 2 / 5')).toBeVisible()
    for (let i = 0; i < 5; i++) {
      await user.click(screen.getByRole('button', { name: '让这一层结合前文' }))
      if (i < 4) await user.click(screen.getByRole('button', { name: '把更新后的结果交给下一层' }))
    }
    expect(screen.getByRole('button', { name: '放大看看层内的关系计算' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: '换一句话，对比结果' }))
    await user.click(screen.getByRole('button', { name: '完成层层计算演示' }))
    await user.click(screen.getByRole('button', { name: '放大看看层内的关系计算' }))
    expect(screen.getByText('试试看：点击「她」')).toBeVisible()
    await user.click(screen.getByRole('button', { name: '观察「苹果」的上下文关系' }))
    expect(screen.getByRole('button', { name: '看看下一步的候选分数' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: '观察「她」的上下文关系' }))
    expect(screen.getByText('已认识 4 / 5')).toBeVisible()
    await user.click(screen.getByRole('button', { name: '看看下一步的候选分数' }))
    await user.click(screen.getByRole('button', { name: '亲手生成下一个 Token' }))
    expect(screen.getByRole('button', { name: '现在是在训练模型吗？' })).toBeDisabled()
    for (let i = 0; i < generationSteps.length; i++)
      await user.click(screen.getByRole('button', { name: '生成下一个 Token' }))
    await user.click(screen.getByRole('button', { name: '现在是在训练模型吗？' }))
    expect(screen.getByText('已认识 5 / 5')).toBeVisible()
    await user.click(screen.getByRole('button', { name: '把整个过程连起来' }))
    expect(useLearningStore.getState().completedLessonIds).not.toContain('model-inside')
    await user.click(screen.getByRole('button', { name: '检查答案' }))
    expect(screen.getAllByRole('alert')).toHaveLength(5)
    expect(screen.getByRole('combobox', { name: /第一个空/ })).toHaveFocus()
    for (const [name, value] of [
      [/第一个空/, 'token'],
      [/第二个空/, 'transformer'],
      [/第三个空/, 'generation'],
    ] as const)
      await user.selectOptions(screen.getByRole('combobox', { name }), value)
    await user.click(screen.getByRole('radio', { name: '不是，通常会逐步生成后续 Token' }))
    await user.click(screen.getByRole('radio', { name: 'Inference · 使用已有能力计算和生成' }))
    await user.click(screen.getByRole('button', { name: '检查答案' }))
    expect(screen.getByRole('status', { name: '章节学习完成' })).toBeVisible()
    expect(useLearningStore.getState().completedLessonIds).toContain('model-inside')
    expect(useLearningStore.getState().unlockedLessonIds).toContain('tools')
    const completion = screen.getByRole('status', { name: '章节学习完成' })
    await user.click(within(completion).getByRole('link', { name: '查看学习地图' }))
    expect(screen.getByRole('link', { name: 'Model Inside，已完成' })).toBeVisible()
    await user.click(screen.getByRole('link', { name: 'Tools，可探索' }))
    expect(screen.getByRole('region', { name: '交互式 Tools 课程' })).toBeVisible()
    view.unmount()
  }, 20000)
})

