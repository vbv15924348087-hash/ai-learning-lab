import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import ChapterVisual from './Visual'
afterEach(cleanup)
describe('RAG learning interaction', () => {
  it('retrieves twenty chunks, reranks the same candidates, then puts five relevant chunks into Context', () => {
    const onComplete = vi.fn()
    render(<ChapterVisual step={1} onComplete={onComplete} completed={false} />)
    fireEvent.click(screen.getByRole('button', { name: '从知识库检索 →' }))
    const list = screen.getByLabelText('候选片段列表')
    expect(within(list).getAllByRole('button')).toHaveLength(20)
    expect(within(list).getAllByRole('button')[0]).toHaveTextContent('GPU 新闻汇总')
    fireEvent.click(screen.getByRole('button', { name: '按任务相关性重排 →' }))
    expect(within(list).getAllByRole('button')[0]).toHaveTextContent('官方规格摘录')
    expect(within(list).getAllByRole('button')).toHaveLength(20)
    expect(onComplete).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: '把前 5 段放入 Context →' }))
    expect(
      within(screen.getByLabelText('放入 Context 的五段证据')).getAllByRole('button'),
    ).toHaveLength(5)
    fireEvent.click(screen.getByRole('button', { name: '交给模型生成有依据的回答 →' }))
    expect(screen.getByLabelText('基于检索证据的示意回答')).toHaveTextContent('产品资料 P. 8')
    expect(onComplete).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: '确认：回答使用了本轮检索证据 →' }))
    expect(onComplete).toHaveBeenCalledOnce()
  })
  it('requires comparing meaning-based retrieval before completion', () => {
    const onComplete = vi.fn()
    render(
      <MemoryRouter>
        <ChapterVisual step={2} onComplete={onComplete} completed={false} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('button', { name: '先切换到语义检索观察结果' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '语义：寻找相近含义' }))
    expect(screen.getByText('找回了不同措辞')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: '我看到了“按含义找”的价值 →' }))
    expect(onComplete).toHaveBeenCalledOnce()
  })
})
