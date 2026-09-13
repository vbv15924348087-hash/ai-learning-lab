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

const mount = () =>
  render(
    <MemoryRouter initialEntries={['/lesson/context']}>
      <App />
    </MemoryRouter>,
  )
const step = () => screen.getByRole('progressbar', { name: '本章教学步骤' })

describe('Context lesson integrated journey', () => {
  it('requires both activities, records completion, and continues to Model Inside', async () => {
    const user = userEvent.setup()
    useLearningStore.getState().completeLesson('system-overview')
    mount()
    expect(step()).toHaveAttribute('aria-valuenow', '1')
    expect(screen.getByRole('button', { name: '下一步' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: /A\s*是，模型只看到用户输入/ }))
    expect(screen.getByRole('group', { name: '模型看到什么？' })).toHaveTextContent(
      '系统规则、当前对话、工具说明',
    )
    for (let index = 0; index < 16; index++)
      await user.click(screen.getByRole('button', { name: '下一步' }))
    expect(step()).toHaveAttribute('aria-valuenow', '17')
    expect(screen.getByRole('button', { name: '下一步' })).toBeDisabled()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    const practice = screen.getByRole('region', { name: '亲手整理工作台' })
    await user.click(within(practice).getByRole('button', { name: '检查我的选择' }))
    expect(useLearningStore.getState().contextProgress.engineeringPassed).toBe(false)
    for (const name of [/^1\. 用户问题/, /^2\. NVIDIA 官方/, /^4\. Web Search/, /^7\. 刚才搜索/]) {
      await user.click(within(practice).getByRole('button', { name }))
    }
    await user.click(within(practice).getByRole('button', { name: '再次检查选择' }))
    expect(screen.getByRole('button', { name: '下一步' })).toBeEnabled()
    expect(useLearningStore.getState().completedLessonIds).toEqual(['system-overview'])
    await user.click(screen.getByRole('button', { name: '下一步' }))
    await user.click(screen.getByRole('button', { name: '下一步' }))
    expect(step()).toHaveAttribute('aria-valuenow', '19')
    expect(screen.getByText('已认识 4 / 4')).toBeVisible()
    await user.click(screen.getByRole('radio', { name: 'Memory · 长期仓库' }))
    await user.click(screen.getByRole('button', { name: '检查答案并完成本章' }))
    expect(useLearningStore.getState().completedLessonIds).toEqual(['system-overview'])
    for (const name of [
      'Context · 当前工作台',
      '不是，工作台与仓库不同',
      '不应该，只留下相关信息',
    ]) {
      await user.click(screen.getByRole('radio', { name }))
    }
    await user.click(screen.getByRole('button', { name: '检查答案并完成本章' }))
    expect(screen.getByRole('status', { name: '章节学习完成' })).toBeVisible()
    expect(useLearningStore.getState().completedLessonIds).toEqual(['system-overview', 'context'])
    await user.click(screen.getByRole('link', { name: '查看学习地图' }))
    expect(screen.getByRole('link', { name: 'Context，已完成' })).toBeVisible()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '13')
    await user.click(screen.getByRole('link', { name: 'Model Inside，可探索' }))
    expect(screen.getByRole('button', { name: '进入模型内部' })).toBeVisible()
    expect(screen.queryByRole('button', { name: /完成/ })).not.toBeInTheDocument()
  }, 20000)

  it('rehydrates Context without overwriting the first chapter and preserves earned concepts on restart', async () => {
    const user = userEvent.setup()
    useLearningStore
      .getState()
      .updateOverviewProgress({
        currentStep: 6,
        furthestStep: 6,
        unlockedTerms: ['context'],
        predictionChoice: 'needs-search',
      })
    const view = mount()
    await user.click(screen.getByRole('button', { name: /B\s*不是/ }))
    for (let index = 0; index < 8; index++)
      await user.click(screen.getByRole('button', { name: '下一步' }))
    expect(screen.getByText('已认识 2 / 4')).toBeVisible()
    const saved = localStorage.getItem(LEARNING_STORAGE_KEY)!
    view.unmount()
    useLearningStore.getState().resetProgress()
    localStorage.setItem(LEARNING_STORAGE_KEY, saved)
    await act(async () => {
      await useLearningStore.persist.rehydrate()
    })
    mount()
    expect(step()).toHaveAttribute('aria-valuenow', '9')
    expect(useLearningStore.getState().currentStep).toBe(6)
    expect(useLearningStore.getState().unlockedTerms).toEqual(['context'])
    await user.click(screen.getByRole('button', { name: '重新开始' }))
    expect(step()).toHaveAttribute('aria-valuenow', '1')
    expect(screen.getByRole('button', { name: '下一步' })).toBeDisabled()
    expect(screen.getByText('已认识 2 / 4')).toBeVisible()
    expect(useLearningStore.getState().currentStep).toBe(6)
  })

  it('pauses replay when the learner starts answering an unlocked activity', async () => {
    const user = userEvent.setup()
    useLearningStore
      .getState()
      .updateContextProgress({
        currentStep: 17,
        furthestStep: 18,
        predictionChoice: 'more-information',
        engineeringPassed: true,
      })
    mount()
    await user.click(screen.getByRole('button', { name: '自动播放' }))
    expect(screen.getByRole('button', { name: '暂停' })).toBeVisible()
    await user.click(screen.getByRole('radio', { name: 'Context · 当前工作台' }))
    expect(screen.getByRole('button', { name: '自动播放' })).toBeVisible()
    expect(step()).toHaveAttribute('aria-valuenow', '18')
  })
})


