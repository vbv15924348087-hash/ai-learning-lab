import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { EmbeddingDemo } from './EmbeddingDemo'
import { APPLE_INITIAL_VECTOR } from '../data/embeddingDemoData'

function retrieveApple() {
  fireEvent.click(screen.getByRole('button', { name: '1 · 查找「苹果」的编号' }))
  fireEvent.click(screen.getByRole('button', { name: '2 · 按编号取出数字卡' }))
}

describe('EmbeddingDemo', () => {
  it('looks up one word, copies the exact row, and completes only when the vector is handed off', () => {
    const onComplete = vi.fn()
    render(<EmbeddingDemo onComplete={onComplete} />)
    expect(screen.getByRole('button', { name: '改看「苹果」' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.queryByRole('button', { name: '取出的整组数字' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '1 · 查找「苹果」的编号' }))
    const row = screen.getByRole('row', { name: '已找到「苹果」对应的行' })
    expect(within(row).getByText('314')).toBeInTheDocument()
    expect(onComplete).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: '2 · 按编号取出数字卡' }))
    const card = screen.getByLabelText('取出的「苹果」数字卡')
    APPLE_INITIAL_VECTOR.forEach((value) => {
      expect(within(row).getByText(value.toFixed(1))).toBeInTheDocument()
      expect(within(card).getByText(value.toFixed(1))).toBeInTheDocument()
    })
    expect(onComplete).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: '编号 314' }))
    expect(screen.getByRole('status')).toHaveTextContent('314 只是查表用的编号')
    expect(onComplete).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: '取出的整组数字' }))
    expect(screen.getByRole('status')).toHaveTextContent('结合前文继续更新它')
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: '取出的整组数字' })).toBeDisabled()
  })

  it('resets lookup when switching words and retrieves the selected word’s row', () => {
    const onComplete = vi.fn()
    render(<EmbeddingDemo onComplete={onComplete} />)
    retrieveApple()
    fireEvent.click(screen.getByRole('button', { name: '编号 314' }))
    fireEvent.click(screen.getByRole('button', { name: '改看「手机」' }))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('取出的「苹果」数字卡')).not.toBeInTheDocument()
    expect(screen.queryByRole('row', { name: '已找到「苹果」对应的行' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '1 · 查找「手机」的编号' }))
    expect(screen.getByRole('row', { name: '已找到「手机」对应的行' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '2 · 按编号取出数字卡' }))
    expect(
      within(screen.getByLabelText('取出的「手机」数字卡')).getByText('0.8'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '编号 728' })).toBeInTheDocument()
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('supports replay without awarding completion twice', () => {
    const onComplete = vi.fn()
    render(<EmbeddingDemo onComplete={onComplete} />)
    retrieveApple()
    fireEvent.click(screen.getByRole('button', { name: '取出的整组数字' }))
    fireEvent.click(screen.getByRole('button', { name: '重看查表过程' }))
    retrieveApple()
    fireEvent.click(screen.getByRole('button', { name: '取出的整组数字' }))
    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})
