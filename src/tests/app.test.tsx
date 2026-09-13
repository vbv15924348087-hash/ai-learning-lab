import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../app/App'
import { LEARNING_STORAGE_KEY, useLearningStore } from '../stores/learningStore'

// The real, accessible node controls and explanations remain under test.
// Rendering the WebGL scene itself belongs to browser verification.
vi.mock('../components/three/SystemMapCanvas', () => ({
  SystemMapCanvas: () => <div aria-hidden="true">输入 → 模型 → 回答</div>,
}))

function openApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

async function nextSteps(user: ReturnType<typeof userEvent.setup>, count: number) {
  for (let index = 0; index < count; index += 1) {
    await user.click(screen.getByRole('button', { name: '下一步' }))
  }
}

function expectLessonStep(position: number) {
  expect(screen.getByRole('progressbar', { name: '本章教学步骤' })).toHaveAttribute(
    'aria-valuenow',
    String(position),
  )
}

function expectOverallProgress(value: number) {
  expect(screen.getByRole('progressbar', { name: '全部章节学习进度' })).toHaveAttribute(
    'aria-valuenow',
    String(value),
  )
}

beforeEach(() => {
  localStorage.clear()
  useLearningStore.getState().resetProgress()
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('learning journey', () => {
  it('guides a new learner through both interactions and completes the map only after a correct challenge', async () => {
    const user = userEvent.setup()
    openApp()

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('发生了什么？')
    await user.click(screen.getByRole('link', { name: '进入 AI 内部' }))

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('一张地图，读懂 AI。')
    expectOverallProgress(0)
    expect(screen.getByText(/已完成 0 \/ 15 个章节/)).toBeVisible()
    expect(screen.getByRole('link', { name: 'AI 系统全景，可探索' })).toBeVisible()
    expect(screen.getAllByRole('article', { name: /未解锁，完成上一章后解锁$/ })).toHaveLength(11)
    expect(screen.getByRole('link', { name: /自由探索/ })).toHaveAttribute('href', '/explore')
    expect(screen.getByRole('link', { name: /实践挑战/ })).toHaveAttribute(
      'href',
      '/lesson/final-system-map#chapter-challenge',
    )

    await user.click(screen.getByRole('link', { name: '开始第一站' }))
    expect(screen.getByRole('heading', { level: 1, name: 'AI 系统全景' })).toBeVisible()
    expect(screen.getByRole('heading', { name: '你问一句，AI 回一句。' })).toBeVisible()
    expectLessonStep(1)
    const studio = screen.getByRole('region', { name: '交互式 AI 系统课程' })
    expect(within(studio).queryByText(/Context|Tool|Harness|AI System/i)).not.toBeInTheDocument()
    expect(screen.getAllByText('待解锁')).toHaveLength(5)
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '完成本节' })).not.toBeInTheDocument()

    await nextSteps(user, 1)
    expectLessonStep(2)
    expect(screen.getByRole('button', { name: '下一步' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '自动播放' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: /模型什么都知道，可以直接回答/ }))
    expect(within(studio).getByRole('status')).toHaveTextContent('这里有一个容易忽略的地方')
    expect(within(studio).getByRole('status')).toHaveTextContent('系统可能需要去外部获取资料')
    expect(screen.getByRole('button', { name: '下一步' })).toBeEnabled()

    await nextSteps(user, 5)
    expectLessonStep(7)
    expect(screen.getByText('已认识 1 / 5')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Context 上下文' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Harness 运行系统' })).not.toBeInTheDocument()

    await nextSteps(user, 3)
    expectLessonStep(10)
    expect(screen.getByRole('heading', { name: '等一下，谁真的去搜索？' })).toBeVisible()
    expect(screen.getByRole('button', { name: '下一步' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '自动播放' })).toBeDisabled()
    expect(within(studio).queryByText(/Harness/)).not.toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '继续看' }))
    expectLessonStep(11)
    expect(screen.getByRole('heading', { name: '有一个系统，替它执行。' })).toBeVisible()
    await nextSteps(user, 1)
    expect(screen.getByText('已认识 4 / 5')).toBeVisible()
    expect(screen.getByRole('heading', { level: 3, name: 'Harness 运行系统' })).toBeVisible()

    await nextSteps(user, 10)
    expectLessonStep(22)
    expect(screen.getByText('已认识 5 / 5')).toBeVisible()
    expect(screen.getByRole('button', { name: '自动播放' })).toBeDisabled()
    expect(screen.getByRole('link', { name: '开始小挑战' })).toBeVisible()
    const desktopScene = screen.getAllByLabelText('AI 系统信息流示意图')[0]
    await user.click(within(desktopScene).getByRole('button', { name: '运行系统，查看解释' }))
    expect(
      within(desktopScene).getByRole('button', { name: '运行系统，查看解释' }),
    ).toHaveAttribute('aria-pressed', 'true')
    const nodeDetails = screen.getByRole('complementary', { name: '节点解释' })
    expect(within(nodeDetails).getByRole('heading')).toHaveTextContent('把决定变成真正的动作')
    expect(nodeDetails).toHaveTextContent('Harness 才真正调用 Web Search')
    await user.click(within(desktopScene).getByRole('button', { name: '搜到的资料，查看解释' }))
    expect(
      within(desktopScene).getByRole('button', { name: '运行系统，查看解释' }),
    ).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('complementary', { name: '节点解释' })).toHaveTextContent(
      '还不是最终回答',
    )
    expectOverallProgress(0)

    await user.selectOptions(screen.getByRole('combobox', { name: /第一个空/ }), 'tool')
    await user.selectOptions(screen.getByRole('combobox', { name: /第二个空/ }), 'model')
    await user.click(screen.getByRole('radio', { name: /^是 / }))
    await user.click(screen.getByRole('button', { name: '检查答案' }))
    expect(screen.getAllByRole('alert')).toHaveLength(3)
    expect(screen.getByRole('combobox', { name: /第一个空/ })).toHaveFocus()
    expect(useLearningStore.getState().completedLessonIds).toEqual([])
    expectOverallProgress(0)

    await user.selectOptions(screen.getByRole('combobox', { name: /第一个空/ }), 'context')
    await user.selectOptions(screen.getByRole('combobox', { name: /第二个空/ }), 'harness')
    await user.click(screen.getByRole('radio', { name: /^不是/ }))
    await user.click(screen.getByRole('button', { name: '检查答案' }))
    expect(screen.getByRole('heading', { name: '本节挑战已通过' })).toBeVisible()
    expect(screen.getByRole('status', { name: '章节学习完成' })).toBeVisible()
    expectOverallProgress(7)
    expect(useLearningStore.getState().lessonCompleted).toBe(true)

    await user.click(screen.getByRole('link', { name: '返回学习地图' }))
    expect(screen.getByRole('link', { name: 'AI 系统全景，已完成' })).toBeVisible()
    expect(screen.getByText(/已完成 1 \/ 15 个章节/)).toBeVisible()
    expectOverallProgress(7)
    expect(screen.getAllByRole('link', { name: '继续学习' })).toEqual(
      expect.arrayContaining([expect.objectContaining({ pathname: '/lesson/context' })]),
    )
    expect(screen.getAllByRole('article', { name: /未解锁，完成上一章后解锁$/ })).toHaveLength(11)
  }, 20000)

  it('resumes an unfinished step and learned terms after navigation and persisted rehydration', async () => {
    const user = userEvent.setup()
    const initialView = openApp('/lesson/system-overview')
    await nextSteps(user, 1)
    await user.click(screen.getByRole('button', { name: /不一定，它可能需要获得最新资料/ }))
    await nextSteps(user, 5)
    expectLessonStep(7)
    await user.click(screen.getByRole('link', { name: '返回学习地图' }))

    expect(screen.getByRole('link', { name: 'AI 系统全景，当前学习' })).toBeVisible()
    expectOverallProgress(0)
    expect(screen.getByText('从上次停下的地方继续')).toBeVisible()

    const mainNavigation = screen.getByRole('navigation', { name: '主导航' })
    await user.click(within(mainNavigation).getByRole('link', { name: '首页' }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('发生了什么？')
    await user.click(screen.getByRole('link', { name: '继续学习' }))

    expect(screen.getByRole('heading', { level: 1, name: 'AI 系统全景' })).toBeVisible()
    expectLessonStep(7)
    expect(screen.getByRole('heading', { name: '这张工作台，就叫上下文。' })).toBeVisible()
    expect(screen.getByText('已认识 1 / 5')).toBeVisible()
    expectOverallProgress(0)

    const savedSnapshot = localStorage.getItem(LEARNING_STORAGE_KEY)!
    initialView.unmount()
    useLearningStore.getState().resetProgress()
    localStorage.setItem(LEARNING_STORAGE_KEY, savedSnapshot)
    await act(async () => {
      await useLearningStore.persist.rehydrate()
    })
    const restoredView = openApp('/lesson/system-overview')
    expectLessonStep(7)
    expect(screen.getByRole('heading', { name: '这张工作台，就叫上下文。' })).toBeVisible()
    expect(screen.getByText('已认识 1 / 5')).toBeVisible()
    expect(useLearningStore.getState().predictionChoice).toBe('needs-search')
    expect(screen.getByRole('button', { name: '自动播放' })).toBeEnabled()
    expect(screen.queryByRole('button', { name: '暂停' })).not.toBeInTheDocument()
    expectOverallProgress(0)

    await nextSteps(user, 3)
    expectLessonStep(10)
    const gateSnapshot = localStorage.getItem(LEARNING_STORAGE_KEY)!
    restoredView.unmount()
    useLearningStore.getState().resetProgress()
    localStorage.setItem(LEARNING_STORAGE_KEY, gateSnapshot)
    await act(async () => {
      await useLearningStore.persist.rehydrate()
    })
    openApp('/lesson/system-overview')
    expectLessonStep(10)
    expect(screen.getByRole('button', { name: '下一步' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '自动播放' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '继续看' })).toBeEnabled()
    expect(useLearningStore.getState().harnessRevealed).toBe(false)
  })

  it('keeps a locked direct URL unavailable without changing the learner’s progress', async () => {
    const user = userEvent.setup()
    useLearningStore.getState().completeLesson('system-overview')
    useLearningStore.getState().setSelectedNode('answer')
    const progressBeforeVisit = useLearningStore.getState()
    openApp('/lesson/agent-loop')

    expect(screen.getByRole('heading', { level: 1, name: 'Agent Loop' })).toBeVisible()
    expect(screen.getByText(/请先完成上一章「Tools」/)).toBeVisible()
    expect(screen.queryByRole('button', { name: /完成本节/ })).not.toBeInTheDocument()
    expect(useLearningStore.getState()).toBe(progressBeforeVisit)

    await user.click(screen.getByRole('link', { name: '返回学习地图' }))
    expect(screen.getByRole('link', { name: 'AI 系统全景，已完成' })).toBeVisible()
    expect(
      screen.getByRole('article', { name: 'Agent Loop，未解锁，完成上一章后解锁' }),
    ).toBeVisible()
    expect(screen.getByText(/已完成 1 \/ 15 个章节/)).toBeVisible()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '7')
  })

  it.each(['/page-that-does-not-exist', '/lesson/lesson-that-does-not-exist'])(
    'shows a recoverable 404 for %s',
    async (path) => {
      const user = userEvent.setup()
      openApp(path)

      expect(screen.getByText('404 / 路径暂时走偏了')).toBeVisible()
      expect(screen.getByRole('heading', { level: 1, name: '这里还没有内容。' })).toBeVisible()
      expect(screen.queryByRole('button', { name: /完成本节/ })).not.toBeInTheDocument()

      await user.click(screen.getByRole('link', { name: '返回学习地图' }))
      expect(screen.getByRole('link', { name: 'AI 系统全景，可探索' })).toBeVisible()
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
    },
  )
})
