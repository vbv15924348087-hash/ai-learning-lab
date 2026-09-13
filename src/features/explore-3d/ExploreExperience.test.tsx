import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useLearningStore } from '../../stores/learningStore'
import { ExploreExperience } from './ExploreExperience'
import { exploreNodes, taskSteps } from './data'
import type { ExploreSceneProps } from './types'

// These tests exercise the real UI, URL controller, data, and learning store.
// WebGL rendering is replaced by a scene contract; browser visual review is separate.
vi.mock('./scene/ExploreScene', () => ({
  default: (props: ExploreSceneProps) => (
    <section
      aria-label="测试场景"
      data-selected={props.selectedId ?? ''}
      data-playing={String(props.playing)}
      data-node-count={props.nodes.length}
      data-reset-key={props.resetKey}
    >
      {props.nodes.map((node) => (
        <button key={node.id} onClick={() => props.onSelect(node.id)}>
          场景选择 {node.id}
        </button>
      ))}
      <button
        onClick={() => {
          props.onCameraChange({ position: [7, 8, 10], target: [0, 1, 0] }, 2)
        }}
      >
        模拟缩放并保存视角
      </button>
      <button
        onClick={() => props.onCameraChange({ position: [25, 18, 12], target: [1, 2, 0] }, 0)}
      >
        模拟旋转并保存视角
      </button>
      <button
        onClick={() => props.onCameraChange({ position: [26, 18, 12], target: [2, 2, 0] }, 0)}
      >
        模拟平移并保存视角
      </button>
      <button
        onClick={() => {
          props.onSelect('model')
          props.onCameraChange({ position: [21, 22, 29], target: [0, 0.2, 0] }, 0)
        }}
      >
        模拟选中模型并同时结束相机操作
      </button>
      <button onClick={props.onFailure}>模拟 WebGL 失效</button>
    </section>
  ),
}))

let reducedMotion = false
const motionListeners = new Set<() => void>()

function LocationReadout() {
  const location = useLocation()
  return <output data-testid="location">{location.pathname + location.search}</output>
}

async function openExplore(url = '/explore') {
  render(
    <MemoryRouter initialEntries={[url]}>
      <ExploreExperience />
      <LocationReadout />
    </MemoryRouter>,
  )
  return screen.findByRole('region', { name: '测试场景' })
}

const currentTaskTitle = () =>
  within(screen.getByRole('region', { name: '任务模拟' })).getByRole('heading', { level: 2 })

beforeEach(() => {
  reducedMotion = false
  motionListeners.clear()
  vi.stubGlobal('matchMedia', () => ({
    matches: reducedMotion,
    addEventListener: (_event: string, callback: () => void) => motionListeners.add(callback),
    removeEventListener: (_event: string, callback: () => void) => motionListeners.delete(callback),
  }))
  useLearningStore.setState(useLearningStore.getInitialState(), true)
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('3D explorer UI and controller', () => {
  it('explores a locked concept through search while keeping its full course behind the learning map', async () => {
    await openExplore()
    const before = useLearningStore.getState()
    const writes = vi.spyOn(Storage.prototype, 'setItem')
    fireEvent.change(screen.getByRole('textbox', { name: '搜索概念' }), {
      target: { value: 'MCP' },
    })
    fireEvent.click(screen.getByRole('button', { name: '探索 MCP，课程未解锁，可在此探索' }))
    const detail = screen.getByRole('complementary', { name: '节点详情' })
    expect(within(detail).getByRole('heading', { level: 2 })).toHaveTextContent('连接能力的协议')
    expect(within(detail).getByRole('link', { name: '查看课程解锁条件' })).toHaveAttribute(
      'href',
      '/learn',
    )
    expect(screen.getByRole('region', { name: '测试场景' })).toHaveAttribute('data-selected', 'mcp')
    expect(useLearningStore.getState()).toBe(before)
    expect(writes).not.toHaveBeenCalled()
  })

  it('allows an available course link and follows real relation buttons without changing progress', async () => {
    await openExplore('/explore?node=model')
    const before = useLearningStore.getState()
    const detail = screen.getByRole('complementary', { name: '节点详情' })
    expect(within(detail).getByRole('link', { name: '重新学习这一章' })).toHaveAttribute(
      'href',
      '/lesson/model-inside',
    )
    fireEvent.click(within(detail).getByRole('button', { name: 'Context' }))
    expect(screen.getByRole('region', { name: '测试场景' })).toHaveAttribute(
      'data-selected',
      'context',
    )
    expect(useLearningStore.getState()).toBe(before)
  })

  it('plays, pauses, steps, replays, and stops when switching mode', async () => {
    const scene = await openExplore('/explore?mode=task')
    const before = useLearningStore.getState()
    vi.useFakeTimers()
    fireEvent.click(screen.getByRole('button', { name: '播放' }))
    expect(scene).toHaveAttribute('data-playing', 'true')
    act(() => vi.advanceTimersByTime(3200))
    expect(currentTaskTitle()).toHaveTextContent(taskSteps[1].title)
    fireEvent.click(screen.getByRole('button', { name: '暂停' }))
    act(() => vi.advanceTimersByTime(6400))
    expect(currentTaskTitle()).toHaveTextContent(taskSteps[1].title)
    expect(scene).toHaveAttribute('data-playing', 'false')
    fireEvent.click(screen.getByRole('button', { name: '下一步' }))
    expect(currentTaskTitle()).toHaveTextContent(taskSteps[2].title)
    fireEvent.click(screen.getByRole('button', { name: '重播，从第一步开始' }))
    expect(currentTaskTitle()).toHaveTextContent(taskSteps[0].title)
    fireEvent.click(screen.getByRole('button', { name: '播放' }))
    fireEvent.click(
      within(screen.getByRole('navigation', { name: '探索模式' })).getByRole('button', {
        name: '带我看一遍',
      }),
    )
    act(() => vi.advanceTimersByTime(6400))
    expect(screen.queryByRole('region', { name: '任务模拟' })).not.toBeInTheDocument()
    expect(scene).toHaveAttribute('data-playing', 'false')
    expect(useLearningStore.getState()).toBe(before)
  })

  it('stops playback when inspecting another node and restores the step focus when advancing', async () => {
    const scene = await openExplore('/explore?mode=task')
    vi.useFakeTimers()
    fireEvent.click(screen.getByRole('button', { name: '播放' }))
    fireEvent.click(screen.getByRole('button', { name: '场景选择 model' }))
    expect(scene).toHaveAttribute('data-selected', 'model')
    expect(scene).toHaveAttribute('data-playing', 'false')
    act(() => vi.advanceTimersByTime(6400))
    expect(currentTaskTitle()).toHaveTextContent(taskSteps[0].title)
    fireEvent.click(screen.getByRole('button', { name: '下一步' }))
    expect(scene).toHaveAttribute('data-selected', taskSteps[1].nodeId)
  })

  it('keeps the complete manual task available with reduced motion and does not award course progress', async () => {
    reducedMotion = true
    const scene = await openExplore('/explore?mode=task')
    const before = useLearningStore.getState()
    expect(screen.queryByRole('button', { name: '播放' })).not.toBeInTheDocument()
    expect(screen.getByText(/已跟随“减少动态效果”设置/)).toBeInTheDocument()
    for (let index = 1; index < taskSteps.length; index += 1) {
      fireEvent.click(screen.getByRole('button', { name: '下一步' }))
      expect(currentTaskTitle()).toHaveTextContent(taskSteps[index].title)
      expect(scene).toHaveAttribute('data-playing', 'false')
    }
    expect(screen.getByRole('button', { name: '下一步' })).toBeDisabled()
    expect(screen.getByText(/你已经走过一次完整的信息与行动闭环/)).toBeInTheDocument()
    expect(useLearningStore.getState()).toBe(before)
  })

  it('uses task arrow keys but leaves search typing alone, and Reset restores six core nodes', async () => {
    const scene = await openExplore('/explore?mode=task&depth=2&step=2')
    const input = screen.getByRole('textbox', { name: '搜索概念' })
    fireEvent.keyDown(input, { key: 'ArrowRight' })
    fireEvent.keyDown(input, { key: 'r' })
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(currentTaskTitle()).toHaveTextContent(taskSteps[2].title)
    fireEvent.keyDown(document.body, { key: 'ArrowRight' })
    expect(currentTaskTitle()).toHaveTextContent(taskSteps[3].title)
    fireEvent.keyDown(document.body, { key: 'ArrowLeft' })
    expect(currentTaskTitle()).toHaveTextContent(taskSteps[2].title)
    fireEvent.keyDown(document.body, { key: 'r' })
    expect(scene).toHaveAttribute('data-node-count', '6')
    expect(scene).toHaveAttribute('data-selected', '')
    expect(scene).toHaveAttribute('data-reset-key', '1')
    expect(screen.queryByRole('region', { name: '任务模拟' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '场景选择 model' }))
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(scene).toHaveAttribute('data-selected', '')
  })

  it('restores valid URL state and clamps malformed indices without inaccessible concepts', async () => {
    const scene = await openExplore('/explore?mode=task&depth=99&step=999&node=missing&view=bad')
    expect(currentTaskTitle()).toHaveTextContent(taskSteps.at(-1)!.title)
    expect(scene).toHaveAttribute('data-selected', 'final')
    expect(scene).toHaveAttribute('data-node-count', String(exploreNodes.length))
    expect(screen.getByRole('button', { name: '下一步' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '回到全景' }))
    expect(screen.getByTestId('location').textContent).not.toMatch(/node=|depth=|mode=|view=/)
  })

  it('preserves every explicit disclosure level through orbit, pan and zoom until Reset', async () => {
    const scene = await openExplore()
    const levels = within(screen.getByRole('group', { name: '场景展开层级' }))
    for (const [index, label] of ['全景', '模块', '细节'].entries()) {
      fireEvent.click(levels.getByRole('button', { name: label }))
      const nodeCount = scene.dataset.nodeCount
      for (const [gesture, pose] of [
        ['旋转', '25.00,18.00,12.00,1.00,2.00,0.00'],
        ['平移', '26.00,18.00,12.00,2.00,2.00,0.00'],
        ['缩放', '7.00,8.00,10.00,0.00,1.00,0.00'],
      ]) {
        fireEvent.click(screen.getByRole('button', { name: `模拟${gesture}并保存视角` }))
        expect(levels.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'true')
        expect(scene).toHaveAttribute('data-node-count', nodeCount)
        const params = new URLSearchParams(
          screen.getByTestId('location').textContent!.split('?')[1],
        )
        expect(params.get('depth')).toBe(index === 0 ? null : String(index))
        expect(params.get('view')).toBe(pose)
      }
    }
    fireEvent.click(screen.getByRole('button', { name: '回到全景' }))
    expect(levels.getByRole('button', { name: '全景' })).toHaveAttribute('aria-pressed', 'true')
    expect(scene).toHaveAttribute('data-node-count', '6')
    expect(screen.getByTestId('location').textContent).not.toMatch(/depth=|view=/)
    fireEvent.click(screen.getByRole('button', { name: '模拟缩放并保存视角' }))
    expect(scene).toHaveAttribute('data-node-count', '6')
  })

  it('retains a restored URL disclosure level when saving a distant camera pose', async () => {
    const scene = await openExplore('/explore?depth=2')
    fireEvent.click(screen.getByRole('button', { name: '模拟旋转并保存视角' }))
    expect(scene).toHaveAttribute('data-node-count', String(exploreNodes.length))
    const params = new URLSearchParams(screen.getByTestId('location').textContent!.split('?')[1])
    expect(params.get('depth')).toBe('2')
    expect(params.get('view')).toBe('25.00,18.00,12.00,1.00,2.00,0.00')
  })

  it('retains a clicked concept when the same event also saves the camera pose', async () => {
    const scene = await openExplore()
    fireEvent.click(screen.getByRole('button', { name: '模拟选中模型并同时结束相机操作' }))
    const params = new URLSearchParams(screen.getByTestId('location').textContent!.split('?')[1])
    expect(params.get('node')).toBe('model')
    expect(params.get('view')).toBe('21.00,22.00,29.00,0.00,0.20,0.00')
    expect(scene).toHaveAttribute('data-selected', 'model')
    expect(screen.queryByRole('complementary', { name: '探索提示' })).not.toBeInTheDocument()
    expect(
      within(screen.getByRole('complementary', { name: '节点详情' })).getByRole('heading', {
        level: 2,
      }),
    ).toHaveTextContent('模型')
  })

  it('stops playback in a hidden tab and cleans its timers on unmount', async () => {
    const scene = await openExplore('/explore?mode=task')
    vi.useFakeTimers()
    fireEvent.click(screen.getByRole('button', { name: '播放' }))
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    fireEvent(document, new Event('visibilitychange'))
    expect(scene).toHaveAttribute('data-playing', 'false')
    act(() => vi.advanceTimersByTime(6400))
    expect(currentTaskTitle()).toHaveTextContent(taskSteps[0].title)
    expect(vi.getTimerCount()).toBe(0)
    visibility.mockReturnValue('visible')
    fireEvent(document, new Event('visibilitychange'))
    fireEvent.click(screen.getByRole('button', { name: '播放' }))
    expect(vi.getTimerCount()).toBe(1)
    cleanup()
    expect(vi.getTimerCount()).toBe(0)
    expect(motionListeners.size).toBe(0)
  })

  it('retains search, details, and manual task controls if WebGL becomes unavailable', async () => {
    await openExplore('/explore?mode=task')
    fireEvent.click(screen.getByRole('button', { name: '模拟 WebGL 失效' }))
    expect(screen.getByText(/当前浏览器未能启用 3D/)).toBeInTheDocument()
    fireEvent.change(screen.getByRole('textbox', { name: '搜索概念' }), {
      target: { value: 'Compaction' },
    })
    fireEvent.click(screen.getByRole('button', { name: '探索 Compaction，课程未解锁，可在此探索' }))
    expect(
      within(screen.getByRole('complementary', { name: '节点详情' })).getByRole('heading', {
        level: 2,
      }),
    ).toHaveTextContent('压缩工作记录')
    fireEvent.click(screen.getByRole('button', { name: '下一步' }))
    expect(currentTaskTitle()).toHaveTextContent(taskSteps[1].title)
  })
})
