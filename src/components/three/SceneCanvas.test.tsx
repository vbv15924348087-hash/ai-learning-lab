import { StrictMode } from 'react'
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRoot, type ReconcilerRoot, type RootStore } from '@react-three/fiber'
import { WebGLRenderer } from 'three'
import { SceneCanvas } from './SceneCanvas'
import { SystemMapCanvas } from './SystemMapCanvas'

vi.mock('@react-three/fiber', () => ({
  createRoot: vi.fn(),
  events: vi.fn(),
  extend: vi.fn(),
  useThree: vi.fn(),
}))
vi.mock('@react-three/drei', () => ({ Line: () => null, Html: () => null, RoundedBox: () => null }))
vi.mock('three', async (importOriginal) => ({
  ...(await importOriginal<typeof import('three')>()),
  WebGLRenderer: vi.fn(),
}))

const roots: ReconcilerRoot<HTMLCanvasElement>[] = []
const renderers: WebGLRenderer[] = []
const observers: { notify: () => void; disconnect: ReturnType<typeof vi.fn> }[] = []
const setSize = vi.fn()
const loseContext = vi.fn()
const getExtension = vi.fn(() => ({ loseContext }))
const context = { getExtension } as unknown as WebGL2RenderingContext
let configuration: Promise<void>
let rect: DOMRect

beforeEach(() => {
  vi.resetAllMocks()
  roots.length = renderers.length = observers.length = 0
  configuration = Promise.resolve()
  rect = new DOMRect(0, 0, 600, 330)
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => rect)
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => context)
  getExtension.mockReturnValue({ loseContext })
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn()
      disconnect = vi.fn()
      unobserve = vi.fn()
      constructor(callback: ResizeObserverCallback) {
        observers.push({ notify: () => callback([], this), disconnect: this.disconnect })
      }
    },
  )
  vi.mocked(WebGLRenderer).mockImplementation(function (options) {
    const renderer = { domElement: options?.canvas, dispose: vi.fn() } as unknown as WebGLRenderer
    renderers.push(renderer)
    return renderer
  })
  vi.mocked(createRoot).mockImplementation(() => {
    const pending = configuration
    const root: ReconcilerRoot<HTMLCanvasElement> = {
      configure: vi.fn(() => pending.then(() => root)),
      render: vi.fn(() => ({ getState: () => ({ setSize }) }) as unknown as RootStore),
      unmount: vi.fn(),
    }
    roots.push(root)
    return root
  })
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function openScene() {
  const onSelectNode = vi.fn()
  return {
    ...render(<SystemMapCanvas selectedNode={null} onSelectNode={onSelectNode} />),
    onSelectNode,
  }
}

describe('scene initialization and fallback', () => {
  it('uses the fallback when WebGL is entirely unavailable', () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null)
    const { container } = openScene()
    expect(container.querySelector('[data-renderer="fallback"]')).toBeInTheDocument()
    expect(WebGLRenderer).not.toHaveBeenCalled()
    expect(createRoot).not.toHaveBeenCalled()
  })

  it('does not accept WebGL 1 as renderer support', () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockImplementation((kind: string) =>
      kind === 'webgl' ? context : null,
    )
    const { container } = openScene()
    expect(container.querySelector('[data-renderer="fallback"]')).toBeInTheDocument()
    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledExactlyOnceWith(
      'webgl2',
      expect.any(Object),
    )
    expect(WebGLRenderer).not.toHaveBeenCalled()
  })

  it('falls back when context creation itself throws', () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockImplementation(() => {
      throw new Error('Context denied')
    })
    const { container } = openScene()
    expect(container.querySelector('[data-renderer="fallback"]')).toBeInTheDocument()
    expect(createRoot).not.toHaveBeenCalled()
  })

  it('catches real renderer creation failure and releases the acquired context', () => {
    vi.mocked(WebGLRenderer).mockImplementation(function () {
      throw new Error('Renderer initialization failed')
    })
    const { container, onSelectNode } = openScene()
    expect(container.querySelector('[data-renderer="fallback"]')).toBeInTheDocument()
    expect(createRoot).not.toHaveBeenCalled()
    expect(loseContext).toHaveBeenCalledOnce()
    fireEvent.click(container.querySelector('[data-node="model"]')!)
    expect(onSelectNode).toHaveBeenCalledExactlyOnceWith('model')
  })

  it('handles an asynchronous configure rejection and disposes the failed renderer', async () => {
    configuration = Promise.reject(new Error('Configuration failed'))
    const { container } = openScene()
    // Fallback DOM commits before React flushes the removed canvas's passive effect cleanup.
    // Wait for resource disposal too; observing the replacement DOM alone is not that barrier.
    await waitFor(() => {
      expect(container.querySelector('[data-renderer="fallback"]')).toBeInTheDocument()
      expect(roots[0].unmount).toHaveBeenCalledOnce()
      expect(renderers[0].dispose).toHaveBeenCalledOnce()
      expect(observers[0].disconnect).toHaveBeenCalledOnce()
    })
    expect(roots[0].render).not.toHaveBeenCalled()
    expect(getExtension).not.toHaveBeenCalled()
  })

  it('passes the actual canvas context and renderer to R3F, preserving scene settings', async () => {
    const { container } = openScene()
    await waitFor(() => expect(roots[0].render).toHaveBeenCalledOnce())
    const canvas = container.querySelector('canvas')
    expect(WebGLRenderer).toHaveBeenCalledExactlyOnceWith({
      canvas,
      context,
      antialias: true,
      alpha: true,
      powerPreference: 'low-power',
    })
    expect(roots[0].configure).toHaveBeenCalledWith(
      expect.objectContaining({
        gl: renderers[0],
        orthographic: true,
        dpr: [1, 1.75],
        frameloop: 'demand',
      }),
    )
    expect(container.querySelector('[data-renderer="fallback"]')).not.toBeInTheDocument()
  })

  it('keeps context loss as a controlled fallback and releases scene resources', async () => {
    const { container } = openScene()
    await waitFor(() => expect(roots[0].render).toHaveBeenCalledOnce())
    const event = new Event('webglcontextlost', { cancelable: true })
    fireEvent(container.querySelector('canvas')!, event)
    expect(event.defaultPrevented).toBe(true)
    expect(container.querySelector('[data-renderer="fallback"]')).toBeInTheDocument()
    expect(roots[0].unmount).toHaveBeenCalledOnce()
    expect(observers[0].disconnect).toHaveBeenCalledOnce()
    expect(getExtension).not.toHaveBeenCalled()
  })

  it('resizes the existing root without recreating the renderer', async () => {
    openScene()
    await waitFor(() => expect(roots[0].render).toHaveBeenCalledOnce())
    rect = new DOMRect(10, 20, 420, 280)
    act(() => observers[0].notify())
    expect(setSize).toHaveBeenLastCalledWith(420, 280, 20, 10)
    expect(WebGLRenderer).toHaveBeenCalledOnce()
    expect(roots[0].configure).toHaveBeenCalledOnce()
  })

  it('waits for a measurable host before configuring the root', async () => {
    rect = new DOMRect()
    openScene()
    expect(createRoot).not.toHaveBeenCalled()
    rect = new DOMRect(0, 0, 420, 280)
    act(() => observers[0].notify())
    await waitFor(() => expect(roots[0].render).toHaveBeenCalledOnce())
  })

  it('gives StrictMode remounts distinct canvases and ignores the disposed initialization', async () => {
    const onFailure = vi.fn()
    const { container, unmount } = render(
      <StrictMode>
        <SceneCanvas onFailure={onFailure}>scene</SceneCanvas>
      </StrictMode>,
    )
    await waitFor(() => expect(roots[1].render).toHaveBeenCalledOnce())
    const [oldCanvas, currentCanvas] = vi.mocked(createRoot).mock.calls.map(([canvas]) => canvas)
    expect(oldCanvas).not.toBe(currentCanvas)
    expect(container.querySelectorAll('canvas')).toHaveLength(1)
    expect(roots[0].render).not.toHaveBeenCalled()
    expect(roots[0].unmount).toHaveBeenCalledOnce()
    expect(renderers[0].dispose).toHaveBeenCalledOnce()
    unmount()
    expect(roots[1].unmount).toHaveBeenCalledOnce()
    expect(renderers[1].dispose).toHaveBeenCalledOnce()
    expect(getExtension).not.toHaveBeenCalled()
    expect(onFailure).not.toHaveBeenCalled()
  })

  it('releases an initialized renderer context itself if no R3F root was created', () => {
    rect = new DOMRect()
    const { unmount } = openScene()
    expect(WebGLRenderer).toHaveBeenCalledOnce()
    expect(createRoot).not.toHaveBeenCalled()
    unmount()
    expect(renderers[0].dispose).toHaveBeenCalledOnce()
    expect(getExtension).toHaveBeenCalledExactlyOnceWith('WEBGL_lose_context')
    expect(loseContext).toHaveBeenCalledOnce()
  })

  it('handles configure rejection after unmount without reporting failure to a stale parent', async () => {
    let reject!: (error: Error) => void
    configuration = new Promise((_resolve, rejectPromise) => {
      reject = rejectPromise
    })
    const onFailure = vi.fn()
    const { unmount } = render(<SceneCanvas onFailure={onFailure}>scene</SceneCanvas>)
    unmount()
    await act(async () => {
      reject(new Error('Late configure failure'))
    })
    expect(onFailure).not.toHaveBeenCalled()
    expect(roots[0].render).not.toHaveBeenCalled()
    expect(roots[0].unmount).toHaveBeenCalledOnce()
  })
})
