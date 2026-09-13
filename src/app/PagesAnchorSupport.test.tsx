import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { HashRouter, Link, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import RagVisual from '../features/rag/Visual'
import { PagesAnchorSupport } from './PagesAnchorSupport'

const scrollIntoView = vi.fn()
const initialUrl = window.location.href
const originalScrollIntoView = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  'scrollIntoView',
)

function RouteReadout() {
  const location = useLocation()
  return <output data-testid="route">{location.pathname + location.search + location.hash}</output>
}
function Fixture({ delayed = false }: { delayed?: boolean }) {
  const [ready, setReady] = useState(!delayed)
  return (
    <>
      <RouteReadout />
      <a href="#mini-challenge">
        <span>开始挑战</span>
      </a>
      <Link to="/lesson/tools#mini-challenge">前往课程挑战</Link>
      <button onClick={() => setReady(true)}>完成异步载入</button>
      {ready && <section id="mini-challenge">挑战内容</section>}
    </>
  )
}
function openFixture(delayed = false) {
  return render(
    <HashRouter>
      <PagesAnchorSupport />
      <Fixture delayed={delayed} />
    </HashRouter>,
  )
}

beforeEach(() => {
  window.history.replaceState(null, '', '/ai-learning-lab/#/lesson/tools?step=4')
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: scrollIntoView,
  })
  scrollIntoView.mockClear()
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  window.history.replaceState(null, '', initialUrl)
  if (originalScrollIntoView)
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', originalScrollIntoView)
  else Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView')
})

describe('GitHub Pages hash route anchors', () => {
  it('scrolls and focuses a document anchor without replacing the hash route or its query', () => {
    openFixture()
    const originalHash = window.location.hash
    fireEvent.click(screen.getByText('开始挑战'))
    const target = screen.getByText('挑战内容')
    expect(window.location.hash).toBe(originalHash)
    expect(screen.getByTestId('route')).toHaveTextContent('/lesson/tools?step=4')
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'auto' })
    expect(target).toHaveFocus()
    expect(target).toHaveAttribute('tabindex', '-1')
    screen.getByRole('button', { name: '完成异步载入' }).focus()
    expect(target).not.toHaveAttribute('tabindex')
  })

  it('preserves router Links and follows their nested fragment after route effects', async () => {
    openFixture()
    const link = screen.getByRole('link', { name: '前往课程挑战' })
    expect(link).toHaveAttribute('href', '#/lesson/tools#mini-challenge')
    fireEvent.click(link)
    await waitFor(() => expect(screen.getByText('挑战内容')).toHaveFocus())
    expect(window.location.pathname).toBe('/ai-learning-lab/')
    expect(window.location.hash).toBe('#/lesson/tools#mini-challenge')
    expect(screen.getByTestId('route')).toHaveTextContent('/lesson/tools#mini-challenge')
  })

  it('waits for an asynchronously mounted lesson anchor and removes the listener on unmount', async () => {
    window.history.replaceState(null, '', '/ai-learning-lab/#/lesson/tools#mini-challenge')
    const { unmount } = openFixture(true)
    expect(scrollIntoView).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: '完成异步载入' }))
    await waitFor(() => expect(screen.getByText('挑战内容')).toHaveFocus())
    expect(scrollIntoView).toHaveBeenCalledOnce()
    unmount()
    const detachedMarkup = document.createElement('div')
    detachedMarkup.innerHTML =
      '<a href="#after-unmount">fragment</a><section id="after-unmount"></section>'
    document.body.append(detachedMarkup)
    let preventedByCompatibilityLayer = false
    document.addEventListener(
      'click',
      (clicked) => {
        preventedByCompatibilityLayer = clicked.defaultPrevented
        clicked.preventDefault()
      },
      { once: true },
    )
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    detachedMarkup.querySelector('a')!.dispatchEvent(event)
    expect(preventedByCompatibilityLayer).toBe(false)
    expect(scrollIntoView).toHaveBeenCalledOnce()
    detachedMarkup.remove()
  })

  it('keeps the RAG review link inside the Pages hash route and repository base', () => {
    render(
      <HashRouter>
        <RagVisual step={2} completed={false} onComplete={vi.fn()} />
        <RouteReadout />
      </HashRouter>,
    )
    const link = screen.getByRole('link', { name: '回到 Model Inside，复习 Embedding →' })
    expect(link).toHaveAttribute('href', '#/lesson/model-inside')
    fireEvent.click(link)
    expect(window.location.pathname).toBe('/ai-learning-lab/')
    expect(screen.getByTestId('route')).toHaveTextContent('/lesson/model-inside')
  })
})
