import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useLearningStore } from '../../../stores/learningStore'
import { ExploreExperience } from '../ExploreExperience'
import { exploreConnections, exploreNodes } from '../data'
import { taskScenarios } from './scenarios'
import type { ExploreSceneProps } from '../types'
import { experiments } from './experiments'
import ImmersiveLab from './ImmersiveLab'
import { moduleInteriors } from './interiors'
import type { ImmersiveInitial } from './useImmersiveController'

// The real controller, dialogs, panels, data, router, and learning store run here.
// Only the WebGL renderer is a contract double; this does not verify rendered pixels.
vi.mock('../scene/ExploreScene', () => ({
  default: (props: ExploreSceneProps) => (
    <section
      aria-label="场景契约"
      data-selected={props.selectedId ?? ''}
      data-playing={String(props.playing)}
      data-enabled={String(props.enabled)}
      data-nodes={JSON.stringify(props.nodes.map((n) => n.id))}
      data-edges={JSON.stringify(props.connections)}
      data-active={JSON.stringify(props.activeEdgeIds)}
      data-related={JSON.stringify(props.relatedIds)}
      data-disabled-nodes={JSON.stringify(props.disabledNodeIds ?? [])}
      data-disabled-edges={JSON.stringify(props.disabledEdgeIds ?? [])}
      data-xray={props.xrayNodeId ?? ''}
      data-reset={props.resetKey}
    >
      {props.nodes.map((node) => (
        <button key={node.id} onClick={() => props.onSelect(node.id)}>
          选择 {node.id}
        </button>
      ))}
      {props.onSelectConnection &&
        props.connections.map((edge) => (
          <button key={edge.id} onClick={() => props.onSelectConnection?.(edge.id)}>
            连接 {edge.id}
          </button>
        ))}
      <button onClick={props.onFailure}>模拟图形失效</button>
    </section>
  ),
}))

const initial: ImmersiveInitial = { selectedId: null, depth: 0, mode: 'free', taskStep: 0 }
const taskSteps = taskScenarios[0].steps
const dialogMethods = {
  showModal: Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal'),
  close: Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close'),
}
function LocationReadout() {
  const location = useLocation()
  return <output data-testid="location">{location.pathname + location.search}</output>
}
async function openLab(
  options: { initial?: Partial<ImmersiveInitial>; reducedMotion?: boolean } = {},
) {
  const onClose = vi.fn()
  const rendered = render(
    <MemoryRouter>
      <ImmersiveLab
        initial={{ ...initial, ...options.initial }}
        reducedMotion={options.reducedMotion ?? false}
        onClose={onClose}
      />
    </MemoryRouter>,
  )
  await within(screen.getByRole('dialog', { name: '全屏沉浸探索' })).findByRole('region', {
    name: '场景契约',
  })
  return { ...rendered, onClose }
}
const lab = () => within(screen.getByRole('dialog', { name: '全屏沉浸探索' }))
const scene = () => lab().getByRole('region', { name: '场景契约' })
const nodes = () => JSON.parse(scene().dataset.nodes!) as string[]
const edges = () => JSON.parse(scene().dataset.edges!) as ExploreSceneProps['connections']
const select = (id: string) =>
  fireEvent.click(within(scene()).getByRole('button', { name: `选择 ${id}` }))
const mode = (name: string) =>
  fireEvent.click(
    within(lab().getByRole('navigation', { name: '沉浸探索玩法' })).getByRole('button', {
      name,
    }),
  )
const timeline = () => lab().getByRole('region', { name: '沉浸任务时间轴' })
const slider = () => within(timeline()).getByRole('slider', { name: '拖动时间轴选择步骤' })
const seek = (index: number) => fireEvent.change(slider(), { target: { value: index + 1 } })
function assertVisibleActiveEdges() {
  const ids = nodes()
  const currentEdges = edges()
  const active = JSON.parse(scene().dataset.active!) as string[]
  for (const edgeId of active) {
    const edge = currentEdges.find((e) => e.id === edgeId)
    expect(edge, `Active edge ${edgeId} must reach the renderer`).toBeDefined()
    expect(ids).toContain(edge!.from)
    expect(ids).toContain(edge!.to)
  }
}

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.setAttribute('open', '')
      },
    },
    close: {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.removeAttribute('open')
      },
    },
  })
  useLearningStore.setState(useLearningStore.getInitialState(), true)
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  for (const [key, descriptor] of Object.entries(dialogMethods)) {
    if (descriptor) Object.defineProperty(HTMLDialogElement.prototype, key, descriptor)
    else Reflect.deleteProperty(HTMLDialogElement.prototype, key)
  }
})

describe('immersive enhancement with real UI and controller', () => {
  it('suspends the original explorer and returns with its URL, focus, camera and progress intact on Escape', async () => {
    const url = '/explore?node=harness&depth=1&view=21,22,29,0,0.2,0'
    document.body.style.overflow = 'auto'
    render(
      <MemoryRouter initialEntries={[url]}>
        <ExploreExperience />
        <LocationReadout />
      </MemoryRouter>,
    )
    const baseScene = await screen.findByRole('region', { name: '场景契约' })
    const before = useLearningStore.getState()
    const writes = vi.spyOn(Storage.prototype, 'setItem')
    const entry = screen.getByRole('button', { name: '全屏探索' })
    entry.focus()
    fireEvent.click(entry)
    // This assertion crosses the real lazy-import boundary; allow the module
    // to load under suite-wide CPU contention without relaxing other waits.
    await screen.findByRole('dialog', { name: '全屏沉浸探索' }, { timeout: 5000 })
    await lab().findByRole('region', { name: '场景契约' })
    expect(baseScene).toHaveAttribute('data-enabled', 'false')
    expect(document.body.style.overflow).toBe('hidden')
    select('model')
    mode('运行任务')
    seek(8)
    const exit = lab().getByRole('button', { name: '退出全屏' })
    exit.focus()
    expect(exit).toHaveFocus()
    fireEvent.keyDown(exit, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(entry).toHaveFocus()
    expect(baseScene).toHaveAttribute('data-enabled', 'true')
    expect(baseScene).toHaveAttribute('data-selected', 'harness')
    expect(baseScene).toHaveAttribute('data-reset', '0')
    expect(screen.getByTestId('location')).toHaveTextContent(url)
    expect(document.body.style.overflow).toBe('auto')
    expect(useLearningStore.getState()).toBe(before)
    expect(writes).not.toHaveBeenCalled()
    document.body.style.overflow = ''
  })

  it('keeps navigation and details initially folded, then drills into one module and returns through breadcrumbs', async () => {
    await openLab()
    expect(lab().queryByRole('complementary', { name: '沉浸详情' })).not.toBeInTheDocument()
    expect(lab().getByRole('button', { name: '展开概念导航' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    select('harness')
    fireEvent.click(lab().getByRole('button', { name: '进入 Harness 内部' }))
    expect(nodes()).toEqual(['harness', ...moduleInteriors.harness.nodes.map((n) => n.id)])
    expect(JSON.parse(scene().dataset.related!)).toEqual(
      expect.arrayContaining(moduleInteriors.harness.nodes.map((n) => n.id)),
    )
    expect(lab().getByRole('navigation', { name: '探索层级路径' })).toHaveTextContent(
      /Harness.*内部结构/,
    )
    fireEvent.click(
      within(lab().getByRole('navigation', { name: '探索层级路径' })).getByRole('button', {
        name: 'AI System',
      }),
    )
    expect(nodes()).toHaveLength(6)
    expect(scene()).toHaveAttribute('data-selected', '')
  })

  it('expands only the chosen X-Ray module and keeps the owner when switching from an internal selection', async () => {
    await openLab({ initial: { selectedId: 'context' } })
    fireEvent.click(lab().getByRole('button', { name: '进入 Context 内部' }))
    select(moduleInteriors.context.nodes[0].id)
    mode('X-Ray')
    expect(scene()).toHaveAttribute('data-xray', 'context')
    expect(nodes()).toContain(moduleInteriors.context.nodes[0].id)
    select('harness')
    expect(scene()).toHaveAttribute('data-xray', 'harness')
    expect(nodes()).toContain(moduleInteriors.harness.nodes[0].id)
    expect(nodes()).not.toContain(moduleInteriors.context.nodes[0].id)
    expect(nodes()).not.toContain(moduleInteriors.model.nodes[0].id)
  })

  it('maps internal nodes back to their real owner for directional relationships', async () => {
    await openLab({ initial: { selectedId: 'harness' } })
    fireEvent.click(lab().getByRole('button', { name: '进入 Harness 内部' }))
    select(moduleInteriors.harness.nodes[0].id)
    mode('关系')
    expect(scene()).toHaveAttribute('data-selected', 'harness')
    fireEvent.click(lab().getByRole('button', { name: '上游' }))
    expect(edges().length).toBeGreaterThan(0)
    expect(edges().every((e) => e.to === 'harness')).toBe(true)
    fireEvent.click(lab().getByRole('button', { name: '下游' }))
    expect(edges().length).toBeGreaterThan(0)
    expect(edges().every((e) => e.from === 'harness')).toBe(true)
    fireEvent.click(lab().getByRole('button', { name: '全部相关' }))
    expect(edges().some((e) => e.to === 'harness')).toBe(true)
    expect(edges().some((e) => e.from === 'harness')).toBe(true)
    expect(nodes()).not.toContain(moduleInteriors.harness.nodes[0].id)
  })

  it('searches internal and external concepts, supports keyboard choice, and reveals three explanation levels', async () => {
    await openLab()
    const search = lab().getByRole('combobox', { name: '沉浸搜索概念' })
    fireEvent.change(search, { target: { value: 'Token Embedding' } })
    fireEvent.keyDown(search, { key: 'Enter' })
    const embedding = moduleInteriors.model.nodes.find((n) => n.label === 'Token Embedding')!
    expect(scene()).toHaveAttribute('data-selected', embedding.id)
    expect(scene()).toHaveAttribute('data-xray', 'model')
    fireEvent.change(search, { target: { value: 'MCP' } })
    fireEvent.click(lab().getByRole('option', { name: /^MCP\s*连接能力的协议$/ }))
    expect(scene()).toHaveAttribute('data-selected', 'mcp')
    expect(scene()).toHaveAttribute('data-xray', '')
    const detail = lab().getByRole('complementary', { name: '沉浸详情' })
    const mcp = exploreNodes.find((n) => n.id === 'mcp')!
    expect(detail).toHaveTextContent(mcp.description)
    expect(within(detail).queryByRole('heading', { name: '准确定义' })).not.toBeInTheDocument()
    const level = lab().getByRole('combobox', { name: '解释深度' })
    fireEvent.change(level, { target: { value: 'standard' } })
    expect(detail).toHaveTextContent(mcp.technicalDefinition)
    expect(
      within(detail).queryByRole('heading', { name: '边界与易混淆点' }),
    ).not.toBeInTheDocument()
    fireEvent.change(level, { target: { value: 'technical' } })
    expect(detail).toHaveTextContent(mcp.confused)
    expect(within(detail).getByRole('link', { name: /查看课程解锁条件/ })).toHaveAttribute(
      'href',
      '/learn',
    )
    fireEvent.change(search, { target: { value: 'nonexistent-concept-zz' } })
    expect(lab().getByRole('status')).toHaveTextContent('没有找到相关概念')
  })

  it('explains a real clicked connection and lets its endpoint return to node detail', async () => {
    await openLab({ initial: { selectedId: 'rag', depth: 2 } })
    const edge = exploreConnections.find((e) => e.from === 'rag' && e.to === 'context')!
    fireEvent.click(within(scene()).getByRole('button', { name: `连接 ${edge.id}` }))
    const detail = lab().getByRole('complementary', { name: '沉浸详情' })
    expect(detail).toHaveTextContent('这条连接为什么存在')
    expect(detail).toHaveTextContent(/资料.*Context|Context.*资料/)
    fireEvent.click(within(detail).getByRole('button', { name: 'Context' }))
    expect(scene()).toHaveAttribute('data-selected', 'context')
    expect(detail).not.toHaveTextContent('WHY THIS CONNECTION')
  })

  it('synchronizes task scrubbing, exact step buttons, playback, pause, replay and active edge visibility', async () => {
    await openLab()
    mode('运行任务')
    vi.useFakeTimers()
    fireEvent.click(lab().getByRole('button', { name: '播放' }))
    expect(scene()).toHaveAttribute('data-playing', 'true')
    act(() => vi.advanceTimersByTime(3200))
    expect(slider()).toHaveValue('2')
    fireEvent.click(lab().getByRole('button', { name: '暂停' }))
    act(() => vi.advanceTimersByTime(6400))
    expect(slider()).toHaveValue('2')
    for (let index = 0; index < taskSteps.length; index += 1) {
      seek(index)
      expect(timeline()).toHaveTextContent(taskSteps[index].title)
      expect(scene()).toHaveAttribute('data-selected', taskSteps[index].nodeId)
      assertVisibleActiveEdges()
    }
    expect(lab().getByRole('button', { name: '任务下一步' })).toBeDisabled()
    fireEvent.click(lab().getByRole('button', { name: `第 4 步：${taskSteps[3].title}` }))
    expect(slider()).toHaveValue('4')
    fireEvent.click(lab().getByRole('button', { name: '从第一步重播' }))
    expect(slider()).toHaveValue('1')
    expect(scene()).toHaveAttribute('data-playing', 'false')
  })

  it('lets users type R or arrow keys in search without navigating the task, and clears search before Escape exits', async () => {
    const { onClose } = await openLab({ initial: { mode: 'task', taskStep: 1 } })
    const search = lab().getByRole('combobox', { name: '沉浸搜索概念' })
    fireEvent.change(search, { target: { value: 'RAG' } })
    fireEvent.keyDown(search, { key: 'r' })
    fireEvent.keyDown(search, { key: 'ArrowRight' })
    expect(slider()).toHaveValue('2')
    fireEvent.keyDown(search, { key: 'Escape' })
    expect(search).toHaveValue('')
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowRight' })
    expect(slider()).toHaveValue('3')
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('runs every experiment with resettable conditions and complete visible normal and altered information flows', async () => {
    await openLab({ reducedMotion: true })
    const before = useLearningStore.getState()
    const writes = vi.spyOn(Storage.prototype, 'setItem')
    mode('实验')
    for (const experiment of experiments) {
      fireEvent.change(lab().getByRole('combobox', { name: '选择实验' }), {
        target: { value: experiment.id },
      })
      expect(lab().getByRole('switch')).toHaveAttribute('aria-checked', 'false')
      expect(lab().queryByRole('region', { name: '沉浸任务时间轴' })).not.toBeInTheDocument()
      fireEvent.click(lab().getByRole('button', { name: '运行正常系统' }))
      expect(lab().getByRole('region', { name: '系统实验' })).toHaveTextContent(
        experiment.normal.title,
      )
      for (let index = 0; index < experiment.normal.steps.length; index += 1) {
        seek(index)
        assertVisibleActiveEdges()
      }
      fireEvent.click(lab().getByRole('switch'))
      expect(lab().queryByRole('region', { name: '沉浸任务时间轴' })).not.toBeInTheDocument()
      expect(JSON.parse(scene().dataset.disabledNodes!)).toEqual(experiment.disabledNodeIds)
      expect(JSON.parse(scene().dataset.disabledEdges!)).toEqual(experiment.disabledEdgeIds)
      fireEvent.click(lab().getByRole('button', { name: '运行改动后的系统' }))
      expect(lab().getByRole('region', { name: '系统实验' })).toHaveTextContent(
        experiment.altered.title,
      )
      for (let index = 0; index < experiment.altered.steps.length; index += 1) {
        seek(index)
        assertVisibleActiveEdges()
      }
      fireEvent.click(lab().getByRole('button', { name: '恢复默认' }))
      expect(lab().getByRole('switch')).toHaveAttribute('aria-checked', 'false')
      expect(lab().queryByRole('region', { name: '沉浸任务时间轴' })).not.toBeInTheDocument()
      expect(JSON.parse(scene().dataset.disabledNodes!)).toEqual([])
      expect(JSON.parse(scene().dataset.disabledEdges!)).toEqual([])
    }
    expect(useLearningStore.getState()).toBe(before)
    expect(writes).not.toHaveBeenCalled()
  })

  it('keeps complete task and experiment manual controls with reduced motion without scheduling playback', async () => {
    await openLab({ reducedMotion: true })
    vi.useFakeTimers()
    mode('运行任务')
    expect(lab().queryByRole('button', { name: '播放' })).not.toBeInTheDocument()
    expect(timeline()).toHaveTextContent('减少动态效果 · 手动切换')
    fireEvent.click(lab().getByRole('button', { name: '任务下一步' }))
    expect(slider()).toHaveValue('2')
    mode('实验')
    fireEvent.click(lab().getByRole('button', { name: '运行正常系统' }))
    expect(scene()).toHaveAttribute('data-playing', 'false')
    expect(vi.getTimerCount()).toBe(0)
    fireEvent.click(lab().getByRole('button', { name: '任务下一步' }))
    expect(slider()).toHaveValue('2')
  })

  it('stops hidden-page playback permanently until requested and clears all timers on unmount', async () => {
    const { unmount } = await openLab({ initial: { mode: 'task' } })
    vi.useFakeTimers()
    fireEvent.click(lab().getByRole('button', { name: '播放' }))
    expect(vi.getTimerCount()).toBe(1)
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    fireEvent(document, new Event('visibilitychange'))
    expect(scene()).toHaveAttribute('data-playing', 'false')
    expect(scene()).toHaveAttribute('data-enabled', 'false')
    act(() => vi.advanceTimersByTime(6400))
    expect(slider()).toHaveValue('1')
    expect(vi.getTimerCount()).toBe(0)
    visibility.mockReturnValue('visible')
    fireEvent(document, new Event('visibilitychange'))
    expect(scene()).toHaveAttribute('data-playing', 'false')
    fireEvent.click(lab().getByRole('button', { name: '播放' }))
    expect(vi.getTimerCount()).toBe(1)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('pauses when the learner inspects a node or changes mode instead of overriding their focus', async () => {
    await openLab({ initial: { mode: 'task' } })
    vi.useFakeTimers()
    fireEvent.click(lab().getByRole('button', { name: '播放' }))
    select('harness')
    expect(scene()).toHaveAttribute('data-playing', 'false')
    act(() => vi.advanceTimersByTime(6400))
    expect(scene()).toHaveAttribute('data-selected', 'harness')
    expect(slider()).toHaveValue('1')
    fireEvent.click(lab().getByRole('button', { name: '播放' }))
    expect(scene()).toHaveAttribute('data-selected', taskSteps[0].nodeId)
    mode('关系')
    expect(vi.getTimerCount()).toBe(0)
    expect(lab().queryByRole('region', { name: '沉浸任务时间轴' })).not.toBeInTheDocument()
  })

  it('keeps the dialog usable when native fullscreen rejects, and cleans up a later native fullscreen session', async () => {
    const { unmount, onClose } = await openLab()
    const shell = screen.getByRole('dialog').firstElementChild as HTMLElement
    const request = vi.fn().mockRejectedValue(new Error('fullscreen denied'))
    Object.defineProperty(shell, 'requestFullscreen', { configurable: true, value: request })
    fireEvent.click(lab().getByRole('button', { name: '进入浏览器全屏' }))
    expect(await lab().findByRole('status')).toHaveTextContent('窗口内沉浸模式')
    expect(onClose).not.toHaveBeenCalled()
    select('model')
    expect(lab().getByRole('complementary', { name: '沉浸详情' })).toHaveTextContent('模型')
    const exit = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => shell })
    Object.defineProperty(document, 'exitFullscreen', { configurable: true, value: exit })
    fireEvent(document, new Event('fullscreenchange'))
    expect(lab().getByRole('button', { name: '退出浏览器全屏' })).toBeInTheDocument()
    unmount()
    expect(exit).toHaveBeenCalledOnce()
    Reflect.deleteProperty(document, 'fullscreenElement')
    Reflect.deleteProperty(document, 'exitFullscreen')
  })

  it('retains search, internal explanations and task controls after a WebGL failure', async () => {
    await openLab({ initial: { mode: 'task' } })
    fireEvent.click(within(scene()).getByRole('button', { name: '模拟图形失效' }))
    expect(lab().getByText(/当前浏览器未能启用 3D/)).toBeInTheDocument()
    const search = lab().getByRole('combobox', { name: '沉浸搜索概念' })
    fireEvent.change(search, { target: { value: 'Token Embedding' } })
    fireEvent.keyDown(search, { key: 'Enter' })
    expect(lab().getByRole('complementary', { name: '沉浸详情' })).toHaveTextContent('Embedding')
    mode('运行任务')
    fireEvent.click(lab().getByRole('button', { name: '任务下一步' }))
    expect(slider()).toHaveValue('2')
  })
})
