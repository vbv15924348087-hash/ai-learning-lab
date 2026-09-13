import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useLearningStore } from '../../../stores/learningStore'
import type { ExploreSceneProps } from '../types'
import ImmersiveLab from './ImmersiveLab'
import { getTaskScenario, taskScenarios } from './scenarios'

// The UI and task controller are real. This renderer double observes the graph
// contract; it intentionally makes no assertions about GPU pixels or frame rate.
vi.mock('../scene/ExploreScene', () => ({
  default: (props: ExploreSceneProps) => (
    <section
      aria-label="模拟器场景契约"
      data-selected={props.selectedId ?? ''}
      data-playing={String(props.playing)}
      data-nodes={JSON.stringify(props.nodes.map((node) => ({ id: node.id, position: node.position })))}
      data-edges={JSON.stringify(props.connections)}
      data-active={JSON.stringify(props.activeEdgeIds)}
      data-states={JSON.stringify(props.edgeStates ?? {})}
      data-path={JSON.stringify(props.pathNodeIds ?? [])}
      data-comparison={JSON.stringify(props.comparison ?? null)}
      data-filter={props.compareFilter ?? ''}
      data-packet={props.packetType ?? ''}
      data-xray={props.xrayNodeId ?? ''}
    >
      {props.nodes.map((node) => <button key={node.id} onClick={() => props.onSelect(node.id)}>查看节点 {node.id}</button>)}
    </section>
  ),
}))

const dialogMethods = {
  showModal: Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal'),
  close: Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close'),
}
const dialog = () => screen.getByRole('dialog', { name: '全屏沉浸探索' })
const lab = () => within(dialog())
const scene = () => lab().getByRole('region', { name: '模拟器场景契约' })
const taskSelect = () => lab().getByRole('combobox', { name: '选择任务示例' })
const selectTask = (id: string) => fireEvent.change(taskSelect(), { target: { value: id } })
const timeline = () => lab().getByRole('region', { name: '沉浸任务时间轴' })
const slider = () => within(timeline()).getByRole('slider', { name: '拖动时间轴选择步骤' })
const seek = (index: number) => fireEvent.change(slider(), { target: { value: index + 1 } })
const mode = (name: string) => fireEvent.click(within(lab().getByRole('navigation', { name: '沉浸探索玩法' })).getByRole('button', { name }))
const pathIds = () => JSON.parse(scene().dataset.path!) as string[]
const graphNodes = () => JSON.parse(scene().dataset.nodes!) as { id: string; position: number[] }[]
const compare = () => JSON.parse(scene().dataset.comparison!) as NonNullable<ExploreSceneProps['comparison']>

async function openLab(reducedMotion = false) {
  const rendered = render(<MemoryRouter><ImmersiveLab initial={{ selectedId: null, depth: 0, mode: 'free', taskStep: 0 }} reducedMotion={reducedMotion} onClose={vi.fn()} /></MemoryRouter>)
  await lab().findByRole('region', { name: '模拟器场景契约' }, { timeout: 5000 })
  return rendered
}

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: { configurable: true, value: function (this: HTMLDialogElement) { this.setAttribute('open', '') } },
    close: { configurable: true, value: function (this: HTMLDialogElement) { this.removeAttribute('open') } },
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

describe('AI System Simulator task interactions', () => {
  it('offers all six task examples on one stable map, with distinct Web and PDF paths and no progress writes', async () => {
    await openLab()
    expect(within(taskSelect()).getAllByRole('option')).toHaveLength(6)
    expect(lab().queryByRole('region', { name: '沉浸任务时间轴' })).not.toBeInTheDocument()
    const before = useLearningStore.getState()
    const writes = vi.spyOn(Storage.prototype, 'setItem')
    selectTask('simple')
    const initialMap = graphNodes()
    expect(pathIds()).toEqual(expect.arrayContaining(['user', 'context', 'model', 'final']))
    expect(pathIds()).not.toContain('web')
    for (const task of taskScenarios) {
      selectTask(task.id)
      expect(graphNodes()).toEqual(initialMap)
      expect(slider()).toHaveAttribute('max', String(task.steps.length))
      expect(slider()).toHaveValue('1')
      expect(pathIds()).toEqual(expect.arrayContaining([...new Set(task.steps.map((step) => step.nodeId))]))
    }
    selectTask('fresh-info')
    expect(pathIds()).toContain('web')
    expect(pathIds()).not.toContain('files')
    selectTask('file')
    expect(pathIds()).toContain('files')
    expect(pathIds()).not.toContain('web')
    expect(useLearningStore.getState()).toBe(before)
    expect(writes).not.toHaveBeenCalled()
  })

  it('explains chosen and omitted nodes through accessible controls and follows explanation depth', async () => {
    await openLab()
    selectTask('simple')
    fireEvent.click(lab().getByRole('button', { name: '为什么走这条路径？' }))
    const explanation = lab().getByRole('complementary', { name: '任务路径解释' })
    expect(explanation).toHaveTextContent('当前模型已有足够知识')
    expect(within(explanation).getByRole('region', { name: '任务复杂度' })).toHaveTextContent('教学示意')
    expect(within(explanation).getAllByRole('meter')).toHaveLength(6)
    fireEvent.change(lab().getByRole('combobox', { name: '解释深度' }), { target: { value: 'technical' } })
    expect(explanation).toHaveTextContent(getTaskScenario('simple').steps[0].explanationExpert)
    fireEvent.click(within(scene()).getByRole('button', { name: '查看节点 web' }))
    expect(lab().getByRole('region', { name: '为什么没走这里' })).toHaveTextContent('不依赖实时信息')
    fireEvent.click(within(scene()).getByRole('button', { name: '查看节点 model' }))
    expect(lab().getByRole('region', { name: '为什么走这里' })).toHaveTextContent('已有知识')
    expect(scene()).toHaveAttribute('data-playing', 'false')
  })

  it('grows the GPU complexity ladder from a direct answer to research loops and persistent state', async () => {
    await openLab(true)
    selectTask('simple')
    fireEvent.click(lab().getByRole('button', { name: '为什么走这条路径？' }))
    const ladder = () => lab().getByRole('slider', { name: 'GPU 任务复杂度' })
    const originalMap = graphNodes()
    // Move away from the initial value first; native ranges emit no change when
    // assigned their current value, so reaching GPU Level 1 requires a real move.
    for (const level of [2, 1, 3, 4, 5]) {
      fireEvent.change(ladder(), { target: { value: level } })
      expect(taskSelect()).toHaveValue(`gpu-${level}`)
      expect(graphNodes()).toEqual(originalMap)
      expect(slider()).toHaveAttribute('max', String(getTaskScenario(`gpu-${level}`).steps.length))
      expect(slider()).toHaveValue('1')
    }
    expect(pathIds()).toEqual(expect.arrayContaining(['loop', 'memory', 'state', 'context-window', 'compaction', 'verifier']))
    expect(lab().queryByRole('button', { name: '播放' })).not.toBeInTheDocument()
    expect(getTaskScenario('gpu-4').steps.length).toBeGreaterThan(getTaskScenario('gpu-3').steps.length)
  })

  it('opens the Model interior when plain Attention search resolves a top-level catalog alias', async () => {
    await openLab()
    const search = lab().getByRole('combobox', { name: '沉浸搜索概念' })
    fireEvent.change(search, { target: { value: 'Attention' } })
    fireEvent.keyDown(search, { key: 'Enter' })
    expect(scene()).toHaveAttribute('data-selected', 'inside-model-attention')
    expect(scene()).toHaveAttribute('data-xray', 'model')
    expect(lab().getByRole('complementary', { name: '沉浸详情' })).toHaveTextContent('Attention')
  })

  it('passes two path memberships and all comparison filters into the same scene', async () => {
    await openLab()
    mode('对比')
    expect(lab().getByRole('combobox', { name: '对比任务 A' })).toHaveValue('simple')
    expect(lab().getByRole('combobox', { name: '对比任务 B' })).toHaveValue('research')
    const originalMap = graphNodes()
    expect(compare().commonNodeIds).toEqual(expect.arrayContaining(['user', 'context', 'model']))
    expect(compare().secondOnlyNodeIds).toEqual(expect.arrayContaining(['planning', 'loop', 'web', 'verifier']))
    for (const [label, filter] of [['显示共同步骤', 'common'], ['显示新增步骤', 'added'], ['只看差异', 'differences'], ['完整路径', 'all']] as const) {
      fireEvent.click(lab().getByRole('button', { name: label }))
      expect(scene()).toHaveAttribute('data-filter', filter)
      expect(graphNodes()).toEqual(originalMap)
      expect(lab().getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'true')
    }
    fireEvent.change(lab().getByRole('combobox', { name: '对比任务 A' }), { target: { value: 'file' } })
    expect(compare().firstOnlyNodeIds).toContain('files')
    expect(compare().secondOnlyNodeIds).toContain('web')
    expect(lab().getByRole('region', { name: '沉浸任务时间轴' })).toBeInTheDocument()
  })

  it('blocks scrubbing and step buttons at approval, makes rejection stop, and only executes after a fresh approval', async () => {
    await openLab()
    selectTask('high-risk')
    const task = getTaskScenario('high-risk')
    const gate = task.steps.findIndex((step) => step.gate === 'approval')
    const finalIndex = task.steps.length - 1
    seek(finalIndex)
    expect(slider()).toHaveValue(String(gate + 1))
    expect(scene()).toHaveAttribute('data-selected', 'approval')
    expect(scene()).toHaveAttribute('data-packet', 'verification')
    expect(lab().getByRole('button', { name: '任务下一步' })).toBeDisabled()
    fireEvent.click(lab().getByRole('button', { name: `第 ${finalIndex + 1} 步：${task.steps[finalIndex].title}` }))
    expect(slider()).toHaveValue(String(gate + 1))
    fireEvent.click(lab().getByRole('button', { name: 'Reject · 拒绝并停止' }))
    expect(lab().getByRole('status')).toHaveTextContent('STOP · 审批已拒绝')
    seek(finalIndex)
    fireEvent.keyDown(dialog(), { key: 'ArrowRight' })
    expect(scene()).not.toHaveAttribute('data-selected', 'database')
    expect(scene()).toHaveAttribute('data-playing', 'false')
    expect(lab().queryByRole('button', { name: 'Approve · 批准模拟执行' })).not.toBeInTheDocument()
    fireEvent.click(lab().getByRole('button', { name: '从第一步重播' }))
    expect(slider()).toHaveValue('1')
    seek(finalIndex)
    expect(lab().getByRole('button', { name: 'Approve · 批准模拟执行' })).toBeInTheDocument()
    fireEvent.click(lab().getByRole('button', { name: 'Approve · 批准模拟执行' }))
    seek(gate + 1)
    expect(scene()).toHaveAttribute('data-selected', 'database')
    seek(finalIndex - 1)
    expect(scene()).toHaveAttribute('data-packet', 'pass')
    seek(finalIndex)
    expect(scene()).toHaveAttribute('data-selected', 'final')
    selectTask('simple')
    selectTask('high-risk')
    seek(finalIndex)
    expect(slider()).toHaveValue(String(gate + 1))
    expect(lab().getByRole('button', { name: 'Approve · 批准模拟执行' })).toBeInTheDocument()
  })

  it('pauses automatic playback at the approval gate without animating database execution', async () => {
    await openLab()
    selectTask('high-risk')
    const task = getTaskScenario('high-risk')
    const gate = task.steps.findIndex((step) => step.gate === 'approval')
    seek(gate - 1)
    vi.useFakeTimers()
    fireEvent.click(lab().getByRole('button', { name: '播放' }))
    act(() => vi.advanceTimersByTime(3200))
    expect(slider()).toHaveValue(String(gate + 1))
    expect(scene()).toHaveAttribute('data-playing', 'false')
    act(() => vi.advanceTimersByTime(16000))
    expect(slider()).toHaveValue(String(gate + 1))
    expect(vi.getTimerCount()).toBe(0)
  })

  it('shows actual context capacity steps and reduced-motion manual access through compaction', async () => {
    await openLab(true)
    selectTask('long-running')
    const task = getTaskScenario('long-running')
    const usage: number[] = []
    for (let i = 0; i < task.steps.length; i += 1) {
      if (task.steps[i].contextUsage === undefined) continue
      seek(i)
      const meter = lab().getByRole('meter', { name: 'Context 容量' })
      expect(meter).toHaveAttribute('value', String(task.steps[i].contextUsage))
      usage.push(task.steps[i].contextUsage!)
    }
    expect(usage).toEqual([38, 72, 91, 34])
    const compressedIndex = task.steps.findIndex((step) => step.nodeId === 'compaction')
    seek(compressedIndex)
    expect(timeline()).toHaveTextContent('保留目标')
    expect(scene()).toHaveAttribute('data-selected', 'compaction')
    expect(scene()).toHaveAttribute('data-playing', 'false')
  })

  it('uses F and Space shortcuts while preserving typing and native button activation', async () => {
    await openLab()
    selectTask('simple')
    const shell = dialog().firstElementChild as HTMLElement
    const requestFullscreen = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(shell, 'requestFullscreen', { configurable: true, value: requestFullscreen })
    const search = lab().getByRole('combobox', { name: '沉浸搜索概念' })
    fireEvent.change(search, { target: { value: 'Files' } })
    fireEvent.keyDown(search, { key: 'f', code: 'KeyF' })
    fireEvent.keyDown(search, { key: ' ', code: 'Space' })
    fireEvent.keyDown(search, { key: 'ArrowRight', code: 'ArrowRight' })
    expect(requestFullscreen).not.toHaveBeenCalled()
    expect(slider()).toHaveValue('1')
    expect(scene()).toHaveAttribute('data-playing', 'false')
    fireEvent.keyDown(dialog(), { key: 'f', code: 'KeyF' })
    expect(requestFullscreen).toHaveBeenCalledOnce()
    vi.useFakeTimers()
    fireEvent.keyDown(dialog(), { key: ' ', code: 'Space' })
    expect(scene()).toHaveAttribute('data-playing', 'true')
    fireEvent.keyDown(dialog(), { key: ' ', code: 'Space' })
    expect(scene()).toHaveAttribute('data-playing', 'false')
    const nextButton = lab().getByRole('button', { name: '任务下一步' })
    fireEvent.keyDown(nextButton, { key: ' ', code: 'Space' })
    expect(scene()).toHaveAttribute('data-playing', 'false')
    expect(vi.getTimerCount()).toBe(0)
  })
})
