import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { contextLessonSteps } from '../data/contextLessonSteps'
import { ContextWorkspace, type ContextWorkspaceProps } from './ContextWorkspace'

function propsFor(id: string): ContextWorkspaceProps {
  const step = contextLessonSteps.find((item) => item.id === id)
  if (!step) throw new Error(`Missing lesson step: ${id}`)
  return { step, selectedSource: null, onSelectSource: vi.fn(), noisy: false, onSetNoisy: vi.fn() }
}

describe('Context visualization', () => {
  it('keeps existing assembly cards mounted while only the newly added card enters', () => {
    const initial = propsFor('assemble-prompt')
    const { container, rerender } = render(<ContextWorkspace {...initial} />)
    const originalPromptCard = container.querySelector('[data-context-source="prompt"]')
    expect(originalPromptCard).toHaveClass('is-entering')

    rerender(<ContextWorkspace {...initial} step={propsFor('assemble-rules').step} />)
    expect(container.querySelector('[data-context-source="prompt"]')).toBe(originalPromptCard)
    expect(originalPromptCard).not.toHaveClass('is-entering')
    expect(container.querySelectorAll('.ctx-info-card.is-entering')).toHaveLength(1)
    expect(container.querySelector('.ctx-info-card.is-entering')).toHaveAttribute(
      'data-context-source',
      'rules',
    )

    rerender(<ContextWorkspace {...initial} step={propsFor('assemble-history').step} />)
    expect(container.querySelector('[data-context-source="prompt"]')).toBe(originalPromptCard)
    expect(container.querySelectorAll('.ctx-info-card.is-entering')).toHaveLength(1)
    expect(container.querySelector('.ctx-info-card.is-entering')).toHaveAttribute(
      'data-context-source',
      'history',
    )
  })

  it('lets keyboard users choose a source and shows extracted information before Context', async () => {
    const user = userEvent.setup()
    const props = propsFor('memory-source')
    const { rerender } = render(<ContextWorkspace {...props} />)
    expect(screen.getByText('取出与当前任务有关的信息')).toBeVisible()
    const rag = screen.getByRole('button', { name: 'RAG 检索，查看它如何进入 Context' })
    rag.focus()
    await user.keyboard('{Enter}')
    expect(props.onSelectSource).toHaveBeenCalledWith('rag')
    rerender(<ContextWorkspace {...props} selectedSource="rag" />)
    expect(rag).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('RAG：搜索 / 检索相关内容')).toBeVisible()
    expect(screen.getByText('找到的资料')).toBeVisible()
    expect(screen.getByText('加入本次 Context')).toBeVisible()
    expect(screen.getByText('外部知识 → 搜索 / 检索 → 相关资料片段 → 加入 Context')).toBeVisible()
    expect(screen.queryByText('Memory → 取出相关信息 → Context → Model')).not.toBeInTheDocument()
  })

  it('switches a controlled comparison without removing the useful information', async () => {
    const user = userEvent.setup()
    const props = propsFor('signal-and-noise')
    const { container, rerender } = render(<ContextWorkspace {...props} />)
    const usefulCards = Array.from(container.querySelectorAll('.ctx-info-card'))
    await user.click(screen.getByRole('button', { name: '加入无关信息' }))
    expect(props.onSetNoisy).toHaveBeenCalledWith(true)
    rerender(<ContextWorkspace {...props} noisy />)
    expect(screen.getByText('20 篇无关文章')).toBeVisible()
    expect(screen.getByText('香港旅游攻略')).toBeVisible()
    expect(Array.from(container.querySelectorAll('.ctx-info-card'))).toEqual(usefulCards)
    expect(screen.getByText('信息增加了，有用的信息没有增加。')).toBeVisible()
    await user.click(screen.getByRole('button', { name: '精简相关' }))
    expect(props.onSetNoisy).toHaveBeenLastCalledWith(false)
    rerender(<ContextWorkspace {...props} />)
    expect(screen.queryByText('20 篇无关文章')).not.toBeInTheDocument()
  })
})
