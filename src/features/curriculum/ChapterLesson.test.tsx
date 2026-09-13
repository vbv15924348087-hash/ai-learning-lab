import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import type { ComponentType } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LEARNING_STORAGE_KEY, useLearningStore } from '../../stores/learningStore'
import { TOOLS_INTERACTION_MODES, TOOL_TERM_IDS, type ToolsProgress } from '../tools-lesson/types'
import AgentLoopVisual from '../agent-loop/Visual'
import { chapter as agentLoop, loopStages } from '../agent-loop/data'
import FinalVisual from '../final-system-map/Visual'
import { chapter as finalChapter } from '../final-system-map/data'
import { taskTrace } from '../final-system-map/concepts'
import { chapters } from './registry'
import { ChapterLesson } from './ChapterLesson'
import type { ChapterDefinition, ChapterVisualProps } from './types'

const completedTools: ToolsProgress = {
  currentStep: 9,
  furthestStep: 9,
  completedInteractions: [...TOOLS_INTERACTION_MODES],
  unlockedTerms: [...TOOL_TERM_IDS],
  summaryReached: true,
  challengePassed: true,
}

beforeEach(() => {
  localStorage.clear()
  useLearningStore.getState().resetProgress()
  // Meet the real prerequisite contract; never inject completed chapter IDs.
  useLearningStore.getState().startLesson('tools')
  useLearningStore.getState().updateToolsProgress(completedTools)
  useLearningStore.getState().completeLesson('tools')
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})

afterEach(() => vi.restoreAllMocks())

function openChapter(chapter: ChapterDefinition, Visual: ComponentType<ChapterVisualProps>) {
  useLearningStore.getState().startLesson(chapter.id)
  return render(
    <MemoryRouter initialEntries={[`/lesson/${chapter.id}`]}>
      <ChapterLesson chapter={chapter} Visual={Visual} />
    </MemoryRouter>,
  )
}

function prepareFinalPrerequisites() {
  for (const chapter of chapters.filter((item) => item.phase < 16)) {
    const store = useLearningStore.getState()
    store.startLesson(chapter.id)
    chapter.steps.forEach((step, index) => {
      store.moveChapterStep(chapter.id, index)
      store.completeChapterStep(chapter.id, step.id)
    })
    chapter.challenge.forEach((question) =>
      store.answerChapter(chapter.id, question.id, question.answer),
    )
  }
}

describe('ChapterLesson integrated learning journey', () => {
  it('requires the real Agent Loop interactions, restores progress and unlocks Harness only after the challenge', async () => {
    const user = userEvent.setup()
    let view = openChapter(agentLoop, AgentLoopVisual)
    const next = () => user.click(screen.getByRole('button', { name: /^下一步：/ }))
    const path = screen.getByRole('list', { name: '本章学习路径' })
    expect(within(path).getByRole('button', { name: /把闭环放回/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /^下一步：/ })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: '有结果，应该够了' }))
    expect(screen.getByRole('status')).toHaveTextContent('还没有解决来源可靠性')
    expect(useLearningStore.getState().chapterProgress['agent-loop'].completedSteps).toEqual([])
    await user.click(screen.getByRole('button', { name: '还缺可靠来源 →' }))
    expect(useLearningStore.getState().chapterProgress['agent-loop'].unlockedTerms).toContain(
      'observation',
    )
    await next()
    for (let index = 0; index < loopStages.length - 1; index++) {
      expect(screen.getByRole('button', { name: /^下一步：/ })).toBeDisabled()
      await user.click(screen.getByRole('button', { name: '推进循环 →' }))
    }
    expect(screen.getByRole('button', { name: /^下一步：/ })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: '确认查证通过 →' }))
    await next()

    const saved = localStorage.getItem(LEARNING_STORAGE_KEY)!
    view.unmount()
    act(() => useLearningStore.getState().resetProgress())
    localStorage.setItem(LEARNING_STORAGE_KEY, saved)
    await act(async () => useLearningStore.persist.rehydrate())
    view = openChapter(agentLoop, AgentLoopVisual)
    expect(useLearningStore.getState().chapterProgress['agent-loop'].currentStep).toBe(2)
    expect(screen.getByRole('progressbar', { name: '本章完成进度' })).toHaveAttribute(
      'aria-valuenow',
      '2',
    )
    expect(screen.getByRole('button', { name: /^下一步：/ })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: '展开现代 Agent 还需要什么 →' }))
    await user.click(screen.getByRole('button', { name: '我理解 ReAct 的边界 →' }))
    await next()
    expect(screen.getByText('下一步：情境挑战')).toHaveAttribute('aria-disabled', 'true')
    await user.click(screen.getByRole('button', { name: '确认：Harness 承载这条循环 →' }))
    expect(useLearningStore.getState().completedLessonIds).not.toContain('agent-loop')
    expect(useLearningStore.getState().unlockedLessonIds).not.toContain('harness')
    expect(useLearningStore.getState().chapterProgress['agent-loop'].unlockedTerms).toHaveLength(6)

    const challenge = screen.getByRole('region', { name: '换个情境，你会怎么做？' })
    await user.click(within(challenge).getByRole('button', { name: /工具成功了，直接完成报告/ }))
    expect(within(challenge).getByRole('status')).toHaveTextContent('再想一步')
    expect(useLearningStore.getState().challengeResults['agent-loop']).toBe(false)
    await user.click(
      within(challenge).getByRole('button', { name: /观察来源缺口，继续寻找官方资料/ }),
    )
    await user.click(within(challenge).getByRole('button', { name: '下一个情境' }))
    await user.click(
      within(challenge).getByRole('button', { name: /不能，继续处理 PDF 并检查剩余要求/ }),
    )
    expect(screen.getByRole('region', { name: '章节学习完成' })).toBeVisible()
    expect(useLearningStore.getState().completedLessonIds).toContain('agent-loop')
    expect(useLearningStore.getState().unlockedLessonIds).toContain('harness')
    expect(useLearningStore.getState().currentLessonId).toBe('agent-loop')
    expect(useLearningStore.getState().lessonProgress['agent-loop']).toBe(100)

    await user.click(screen.getByRole('button', { name: '重新开始' }))
    expect(useLearningStore.getState().chapterProgress['agent-loop'].currentStep).toBe(0)
    expect(useLearningStore.getState().completedLessonIds).toContain('agent-loop')
    expect(useLearningStore.getState().chapterProgress['agent-loop'].unlockedTerms).toHaveLength(6)
    expect(screen.getByRole('region', { name: '章节学习完成' })).toBeVisible()
    view.unmount()
  }, 30000)

  it('connects the full final map, task trace, terminology groups, responsibility matching and graduation challenge', async () => {
    prepareFinalPrerequisites()
    expect(useLearningStore.getState().unlockedLessonIds).toContain('final-system-map')
    const user = userEvent.setup()
    openChapter(finalChapter, FinalVisual)
    const next = () => user.click(screen.getByRole('button', { name: /^下一步：/ }))
    expect(screen.queryByRole('button', { name: 'Harness 节点' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '展开完整 AI 系统 →' }))
    for (const node of ['Context', 'Model', 'Harness']) {
      await user.click(screen.getByRole('button', { name: `${node} 节点` }))
      expect(screen.getByRole('button', { name: /^下一步：/ })).toBeDisabled()
      expect(screen.getByRole('complementary', { name: '节点解释' })).toHaveTextContent(node)
    }
    await user.click(screen.getByRole('button', { name: 'Verification 节点' }))
    expect(screen.getByRole('link', { name: '重新学习这一章' })).toHaveAttribute(
      'href',
      '/lesson/verification',
    )
    await next()
    for (let index = 0; index < taskTrace.length - 1; index++) {
      await user.click(screen.getByRole('button', { name: '下一事件' }))
    }
    expect(screen.getByRole('button', { name: /^下一步：/ })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: '确认：完整任务已复盘' }))
    await next()
    const search = screen.getByRole('textbox', { name: '搜索 AI 术语' })
    await user.type(search, '不存在的术语 xyz')
    expect(screen.getByRole('status')).toHaveTextContent('没有找到相关术语')
    await user.clear(search)
    for (const term of ['RAG', 'Model', 'MCP']) {
      await user.click(screen.getByRole('button', { name: term }))
      expect(screen.getByRole('button', { name: /^下一步：/ })).toBeDisabled()
    }
    await user.click(screen.getByRole('button', { name: 'Guardrails' }))
    await next()
    await user.click(screen.getByRole('button', { name: '检查职责分工 →' }))
    expect(screen.getByRole('status')).toHaveTextContent('再对照')
    expect(
      useLearningStore.getState().chapterProgress['final-system-map'].completedSteps,
    ).toHaveLength(3)
    for (const [label, answer] of [
      ['准备本次相关信息', 'Context Engineering'],
      ['依据当前信息决定下一步', 'Model'],
      ['调度工具、维护循环与权限', 'Harness'],
    ])
      await user.selectOptions(screen.getByRole('combobox', { name: label }), answer)
    await user.click(screen.getByRole('button', { name: '检查职责分工 →' }))
    expect(
      useLearningStore.getState().chapterProgress['final-system-map'].completedSteps,
    ).toHaveLength(4)
    expect(useLearningStore.getState().completedLessonIds).not.toContain('final-system-map')

    const challenge = screen.getByRole('region', { name: '毕业挑战 · 完成一份 AI GPU 研究报告' })
    for (const [index, question] of finalChapter.challenge.entries()) {
      const correct = question.options.find((option) => option.id === question.answer)!
      await user.click(
        within(challenge).getByRole('button', {
          name: new RegExp(correct.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
        }),
      )
      if (index < finalChapter.challenge.length - 1)
        await user.click(within(challenge).getByRole('button', { name: '下一个情境' }))
    }
    expect(screen.getByRole('region', { name: '章节学习完成' })).toBeVisible()
    expect(useLearningStore.getState().challengeResults['final-system-map']).toBe(true)
    expect(useLearningStore.getState().completedLessonIds).toContain('final-system-map')
    expect(useLearningStore.getState().currentLessonId).toBe('final-system-map')
    expect(screen.getByRole('link', { name: '自由探索完整系统' })).toHaveAttribute(
      'href',
      '/explore',
    )
  }, 45000)
})
