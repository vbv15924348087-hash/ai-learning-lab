import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import {
  Box,
  ChevronRight,
  FlaskConical,
  GitCompareArrows,
  Home,
  Info,
  Maximize,
  Microscope,
  Minimize,
  Network,
  PanelLeft,
  PanelRight,
  Play,
  Route,
  X,
} from 'lucide-react'
import { useLearningStore } from '../../../stores/learningStore'
import { ConceptNavigator } from '../ConceptNavigator'
import { StaticSystem } from '../StaticSystem'
import { ExperimentPanel } from './ExperimentPanel'
import { ImmersiveDetail } from './ImmersiveDetail'
import { ImmersiveSearch } from './ImmersiveSearch'
import { ImmersiveTimeline } from './ImmersiveTimeline'
import { moduleInteriors } from './interiors'
import { useImmersiveController, type ImmersiveInitial } from './useImmersiveController'
import type { ExplanationLevel, ImmersiveView, ModuleId, RelationDirection } from './types'
import './immersive.css'
import { taskScenarios, explainTaskStep, type TaskPathStep } from './scenarios'
import { CompareControls, NodePathReason, TaskInspector } from './SimulatorPanels'
import './simulator.css'

const Scene = lazy(() => import('../scene/ExploreScene'))
const EMPTY_IDS: string[] = []
class ImmersiveBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export default function ImmersiveLab({
  initial,
  reducedMotion,
  onClose,
}: {
  initial: ImmersiveInitial
  reducedMotion: boolean
  onClose: () => void
}) {
  const c = useImmersiveController(initial, reducedMotion)
  const { selectNode, selectEdge } = c
  const dialogRef = useRef<HTMLDialogElement>(null)
  const fullscreenRef = useRef<HTMLDivElement>(null)
  const performanceRef = useRef<HTMLOutputElement>(null)
  const [failed, setFailed] = useState(false)
  const [nativeFullscreen, setNativeFullscreen] = useState(false)
  const [fullscreenNotice, setFullscreenNotice] = useState('')
  const [detailMode, setDetailMode] = useState<'node' | 'path'>('node')
  const [experimentOpen, setExperimentOpen] = useState(true)
  const completed = useLearningStore((s) => s.completedLessonIds)
  const unlocked = useLearningStore((s) => s.unlockedLessonIds)
  const selectedEdge = c.graph.connections.find((e) => e.id === c.selectedEdgeId)
  const disabledNodes =
    c.view === 'experiments' && c.altered ? c.experiment.disabledNodeIds : EMPTY_IDS
  const disabledEdges =
    c.view === 'experiments' && c.altered ? c.experiment.disabledEdgeIds : EMPTY_IDS
  const onSelect = useCallback(
    (id: string) => {
      setDetailMode('node')
      selectNode(id)
    },
    [selectNode],
  )
  const onEdge = useCallback(
    (id: string) => {
      setDetailMode('node')
      selectEdge(id)
    },
    [selectEdge],
  )
  const onSearchSelect = useCallback(
    (id: string) => {
      const internal = moduleInteriors.model.nodes.find((node) => node.id === `inside-model-${id}`)
      onSelect(internal?.id ?? id)
    },
    [onSelect],
  )
  const onFailure = useCallback(() => setFailed(true), [])
  const learnedNodeIds = useMemo(
    () => c.catalog.filter((n) => completed.includes(n.lessonId)).map((n) => n.id),
    [c.catalog, completed],
  )
  const unlockedNodeIds = useMemo(
    () => c.catalog.filter((n) => unlocked.includes(n.lessonId)).map((n) => n.id),
    [c.catalog, unlocked],
  )
  const recordPerformance = useCallback(
    (sample: { fps: number; drawCalls: number; triangles: number }) => {
      if (performanceRef.current) {
        performanceRef.current.dataset.fps = String(sample.fps)
        performanceRef.current.dataset.drawCalls = String(sample.drawCalls)
        performanceRef.current.dataset.triangles = String(sample.triangles)
      }
    },
    [],
  )
  const isTask = c.view === 'task' || c.view === 'compare'
  const fallback = <StaticSystem failed onSelect={onSelect} />
  const showPath = () => {
    setDetailMode('path')
    c.setDetailOpen(true)
  }

  useEffect(() => {
    const dialog = dialogRef.current
    const fullscreenRoot = fullscreenRef.current
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (dialog?.showModal && !dialog.open) dialog.showModal()
    else dialog?.setAttribute('open', '')
    const onFullscreen = () => setNativeFullscreen(document.fullscreenElement === fullscreenRoot)
    document.addEventListener('fullscreenchange', onFullscreen)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('fullscreenchange', onFullscreen)
      if (document.fullscreenElement === fullscreenRoot)
        void document.exitFullscreen?.().catch(() => {})
      dialog?.close?.()
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
        previousFocus.focus({ preventScroll: true })
    }
  }, [])

  const toggleNativeFullscreen = async () => {
    try {
      if (document.fullscreenElement === fullscreenRef.current) await document.exitFullscreen()
      else if (fullscreenRef.current?.requestFullscreen)
        await fullscreenRef.current.requestFullscreen()
      else setFullscreenNotice('当前浏览器使用窗口内沉浸模式，所有探索功能仍可使用。')
    } catch {
      setFullscreenNotice('当前浏览器使用窗口内沉浸模式，所有探索功能仍可使用。')
    }
  }
  const onKey = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.defaultPrevented) return
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      onClose()
      return
    }
    if (
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      (event.target as HTMLElement).closest('input, textarea, select, [contenteditable="true"]')
    )
      return
    if (event.key.toLowerCase() === 'r') {
      event.preventDefault()
      event.stopPropagation()
      c.reset()
    }
    if (event.key.toLowerCase() === 'f') {
      event.preventDefault()
      event.stopPropagation()
      void toggleNativeFullscreen()
    }
    if (
      c.timelineVisible &&
      event.code === 'Space' &&
      !(event.target as HTMLElement).closest('button, a')
    ) {
      event.preventDefault()
      event.stopPropagation()
      c.togglePlayback()
    }
    if (c.timelineVisible && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault()
      event.stopPropagation()
      c.jump(c.index + (event.key === 'ArrowRight' ? 1 : -1))
    }
  }

  return createPortal(
    <dialog
      ref={dialogRef}
      className="im3-dialog"
      aria-label="全屏沉浸探索"
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onKeyDown={onKey}
    >
      <div className="im3-shell" ref={fullscreenRef}>
        <header className="im3-header">
          <div className="im3-brand">
            <Box size={22} />
            <span>
              AI SYSTEM<small>SIMULATOR · 任务路径模拟器</small>
            </span>
          </div>
          <label className="sim-task-select">
            <span>任务示例</span>
            <select
              aria-label="选择任务示例"
              value={c.taskScenario.id}
              onChange={(e) => {
                c.selectTask(e.target.value)
                setDetailMode('path')
              }}
            >
              {!taskScenarios.some((task) => task.id === c.taskScenario.id) && (
                <option value={c.taskScenario.id}>{c.taskScenario.title}</option>
              )}
              {taskScenarios.map((task, i) => (
                <option key={task.id} value={task.id}>
                  {String(i + 1).padStart(2, '0')} {task.title}
                </option>
              ))}
            </select>
          </label>
          <ImmersiveSearch nodes={c.catalog} onSelect={onSearchSelect} />
          <label className="im3-level">
            解释深度
            <select
              aria-label="解释深度"
              value={c.level}
              onChange={(e) => c.setLevel(e.target.value as ExplanationLevel)}
            >
              <option value="beginner">小白</option>
              <option value="standard">标准</option>
              <option value="technical">专业</option>
            </select>
          </label>
          <button
            className="im3-native"
            aria-label={nativeFullscreen ? '退出浏览器全屏' : '进入浏览器全屏'}
            onClick={() => void toggleNativeFullscreen()}
          >
            {nativeFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
          </button>
          <button className="im3-exit" onClick={onClose}>
            <X size={16} />
            退出全屏
          </button>
        </header>
        {fullscreenNotice && (
          <p className="im3-fullscreen-notice" role="status">
            {fullscreenNotice}
          </p>
        )}
        <div className="im3-subbar">
          <button
            aria-label={c.navOpen ? '收起概念导航' : '展开概念导航'}
            aria-pressed={c.navOpen}
            onClick={() => c.setNavOpen(!c.navOpen)}
          >
            <PanelLeft size={15} />
            概念导航
          </button>
          <nav aria-label="探索层级路径" className="im3-breadcrumb">
            <button onClick={c.reset}>
              <Home size={13} />
              AI System
            </button>
            {c.scope && (
              <>
                <ChevronRight size={13} />
                <span>
                  {moduleInteriors[c.scope].label}
                  {c.view === 'xray' ? ' · X-Ray' : ' · 内部结构'}
                </span>
              </>
            )}
          </nav>
          {c.scope && <span className="im3-scope-note">一次只拆开一个模块</span>}
          {c.view === 'experiments' && (
            <button
              aria-pressed={experimentOpen && !c.detailOpen}
              onClick={() => {
                setExperimentOpen(!experimentOpen || c.detailOpen)
                c.setDetailOpen(false)
              }}
            >
              <FlaskConical size={14} />
              {experimentOpen && !c.detailOpen ? '收起实验设置' : '实验设置'}
            </button>
          )}
          <button
            aria-label={c.detailOpen ? '收起详情面板' : '展开详情面板'}
            aria-pressed={c.detailOpen}
            onClick={() => {
              setDetailMode('node')
              c.setDetailOpen(!c.detailOpen)
            }}
          >
            <PanelRight size={15} />
            节点详情
          </button>
        </div>
        <div
          className={`im3-workspace${c.navOpen ? ' has-nav' : ''}${c.detailOpen || (c.view === 'experiments' && experimentOpen) ? ' has-detail' : ''}`}
        >
          {c.navOpen && (
            <div className="im3-navigation">
              <ConceptNavigator
                selectedId={c.selectedId}
                completedLessons={completed}
                unlockedLessons={unlocked}
                onSelect={onSelect}
              />
              {c.scope && (
                <div className="im3-internal-nav">
                  <strong>{moduleInteriors[c.scope].label} 内部</strong>
                  {moduleInteriors[c.scope].nodes.map((n) => (
                    <button key={n.id} onClick={() => onSelect(n.id)}>
                      {n.chineseLabel}
                    </button>
                  ))}
                </div>
              )}
              {!c.scope && (
                <div className="im3-internal-nav">
                  <strong>完整概念导航</strong>
                  {c.graph.nodes
                    .filter(
                      (node) =>
                        !['user', 'context', 'model', 'harness', 'external', 'final'].includes(
                          node.id,
                        ),
                    )
                    .map((node) => (
                      <button
                        key={node.id}
                        aria-pressed={node.id === c.selectedId}
                        onClick={() => onSelect(node.id)}
                      >
                        {node.label} · {node.chineseLabel}
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
          <main className="im3-stage" aria-label="沉浸三维系统" ref={c.surfaceRef}>
            <div className="im3-stage-tools">
              {c.view === 'relations' ? (
                <div className="im3-segment" aria-label="关系方向">
                  {(['upstream', 'downstream', 'all'] as RelationDirection[]).map((id, i) => (
                    <button
                      key={id}
                      aria-pressed={c.direction === id}
                      onClick={() => c.setDirection(id)}
                    >
                      {['上游', '下游', '全部相关'][i]}
                    </button>
                  ))}
                </div>
              ) : c.scope ? (
                <div className="im3-segment" aria-label="选择内部模块">
                  {(['context', 'model', 'harness'] as ModuleId[]).map((id) => (
                    <button
                      key={id}
                      aria-pressed={c.scope === id}
                      onClick={() => c.enterModule(id, c.view === 'xray')}
                    >
                      {moduleInteriors[id].label}
                    </button>
                  ))}
                </div>
              ) : isTask ? (
                <div className="sim-task-actions">
                  <span className="sim-live-dot" />
                  <strong>{c.taskScenario.title}</strong>
                  <button
                    className="sim-level-badge"
                    aria-label={`任务复杂度 ${c.taskScenario.level} / 5，查看指标与阶梯`}
                    onClick={showPath}
                  >
                    {'●'.repeat(c.taskScenario.level)}
                    {'○'.repeat(5 - c.taskScenario.level)}
                  </button>
                  <button onClick={showPath}>
                    <Route size={14} /> 为什么走这条路径？
                  </button>
                </div>
              ) : (
                <div className="im3-segment" aria-label="沉浸展开层级">
                  {(['全景', '模块', '细节'] as const).map((name, i) => (
                    <button
                      key={name}
                      aria-pressed={c.depth === i}
                      onClick={() => c.changeDepth(i as 0 | 1 | 2)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
              <button onClick={c.reset}>
                <Home size={14} />
                回到全景
              </button>
            </div>
            <div className="im3-stage-hint">
              {isTask
                ? c.taskScenario.question
                : c.view === 'relations'
                  ? '选择节点，看看谁给它信息、它又把结果交给谁。'
                  : c.scope
                    ? moduleInteriors[c.scope].description
                    : c.view === 'experiments'
                      ? '改变一个条件，再运行任务。所有动作均为教学模拟。'
                      : '点击节点探索 · 点击连线问「为什么」 · 拖动旋转'}
            </div>
            {c.view === 'compare' && (
              <CompareControls
                taskIds={c.compareTaskIds}
                filter={c.compareFilter}
                onTasks={c.setCompareTaskIds}
                onFilter={c.setCompareFilter}
              />
            )}
            {c.view === 'free' && !c.scope && !c.selectedId && (
              <div className="sim-welcome">
                <span className="im3-eyebrow">SAME SYSTEM. DIFFERENT JOURNEYS.</span>
                <h2>一个任务，会怎样穿过 AI？</h2>
                <p>选择顶部任务，观察信息如何经过模型、工具与验证。</p>
                <button className="im3-primary" onClick={() => c.selectTask(taskScenarios[0].id)}>
                  <Play size={14} /> 从简单问答开始
                </button>
              </div>
            )}
            <ImmersiveBoundary fallback={fallback}>
              <Suspense fallback={<StaticSystem onSelect={onSelect} />}>
                {failed ? (
                  fallback
                ) : (
                  <Scene
                    nodes={c.graph.nodes}
                    connections={c.graph.connections}
                    selectedId={c.selectedId}
                    focusedId={
                      isTask && !(c.detailOpen && detailMode === 'node') ? null : c.selectedId
                    }
                    relatedIds={c.relatedIds}
                    activeEdgeIds={c.timelineVisible ? c.step.edgeIds : EMPTY_IDS}
                    playing={c.isPlaying}
                    reducedMotion={reducedMotion}
                    enabled={c.visible}
                    resetKey={c.resetKey}
                    cameraPose={c.cameraPose}
                    learnedNodeIds={learnedNodeIds}
                    unlockedNodeIds={unlockedNodeIds}
                    onSelect={onSelect}
                    onDepthChange={c.changeDepth}
                    onCameraChange={c.changeCamera}
                    onFailure={onFailure}
                    onSelectConnection={onEdge}
                    selectedConnectionId={c.selectedEdgeId}
                    xrayNodeId={c.view === 'xray' ? c.scope : null}
                    frameNodeIds={
                      isTask && c.detailOpen && detailMode === 'node' ? undefined : c.frameNodeIds
                    }
                    disabledNodeIds={disabledNodes}
                    disabledEdgeIds={disabledEdges}
                    onPerformance={recordPerformance}
                    immersive
                    pathNodeIds={isTask ? c.pathNodeIds : undefined}
                    edgeStates={c.timelineVisible ? c.edgeStates : undefined}
                    packetType={c.packetType}
                    comparison={c.view === 'compare' ? c.comparison : undefined}
                    compareFilter={c.compareFilter}
                  />
                )}
              </Suspense>
            </ImmersiveBoundary>
            {isTask && (
              <div className="sim-flow-key" aria-label="路径状态图例">
                <span>─ 默认</span>
                <span>━ 待执行</span>
                <span>●→ 正在执行</span>
                <span>✓ 已完成</span>
                <i />
                <span>→ 请求</span>
                <span>┄◇ 返回</span>
              </div>
            )}
            {c.legendOpen && (
              <section className="im3-legend" aria-label="系统图例">
                <div>
                  <strong>读懂这个空间</strong>
                  <button aria-label="关闭图例" onClick={() => c.setLegendOpen(false)}>
                    <X size={14} />
                  </button>
                </div>
                <p>
                  <i className="data" />
                  蓝色箭头：信息与控制请求
                </p>
                <p>
                  <i className="tool" />
                  绿色箭头：工具执行
                </p>
                <p>
                  <i className="loop" />
                  暖色虚线：反馈与重试
                </p>
                <p>✓ 已学 · ○ 可学 · 锁：完整课程待解锁</p>
                <p>立体区域表示分工；连线表示连接。所有概念都能探索。</p>
                <p>R 回全景 · F 浏览器全屏 · Space 播放 / 暂停 · Esc 退出 · ← → 切换步骤</p>
              </section>
            )}
          </main>
          {c.detailOpen && detailMode === 'path' && isTask ? (
            <TaskInspector
              scenario={c.taskScenario}
              level={c.level}
              nodes={c.catalog}
              index={c.index}
              complexityLevel={c.complexityLevel}
              onComplexity={c.setComplexityLevel}
              onStep={c.jump}
              onClose={() => c.setDetailOpen(false)}
            />
          ) : (
            c.detailOpen && (
              <ImmersiveDetail
                node={c.selected}
                edge={selectedEdge}
                nodes={c.catalog}
                connections={c.graph.connections}
                level={c.level}
                unlockedLessons={unlocked}
                onSelect={onSelect}
                onEdge={onEdge}
                onEnter={c.enterModule}
                onClose={() => c.setDetailOpen(false)}
                onLeave={onClose}
                pathExplanation={
                  isTask && c.selected ? (
                    <NodePathReason scenario={c.taskScenario} node={c.selected} level={c.level} />
                  ) : undefined
                }
              />
            )
          )}
          {c.view === 'experiments' && experimentOpen && !c.detailOpen && (
            <div className="im3-experiment-sidebar">
              <ExperimentPanel
                scenarioId={c.experiment.id}
                altered={c.altered}
                hasRun={c.hasRun}
                onScenario={c.changeExperiment}
                onAltered={c.configureExperiment}
                onRun={c.runExperiment}
                onRestore={() => c.configureExperiment(false)}
              />
            </div>
          )}
        </div>
        <nav className="im3-modes" aria-label="沉浸探索玩法">
          {(
            [
              ['free', '自由探索', Box],
              ['relations', '关系', Network],
              ['task', '运行任务', Play],
              ['compare', '对比', GitCompareArrows],
              ['xray', 'X-Ray', Microscope],
              ['experiments', '实验', FlaskConical],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              aria-pressed={c.view === id}
              onClick={() => c.changeView(id as ImmersiveView)}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
          <span />
          <button aria-pressed={c.legendOpen} onClick={() => c.setLegendOpen(!c.legendOpen)}>
            <Info size={16} />
            图例
          </button>
          <small>所有任务均为教学模拟</small>
        </nav>
        {c.timelineVisible && (
          <ImmersiveTimeline
            steps={c.steps}
            index={c.index}
            playing={c.isPlaying}
            reducedMotion={reducedMotion}
            onStep={c.jump}
            onToggle={c.togglePlayback}
            onRestart={isTask ? c.restartTask : undefined}
            explanation={isTask ? explainTaskStep(c.step as TaskPathStep, c.level) : undefined}
            blocked={isTask && (c.waitingApproval || c.approvalStatus === 'rejected')}
          >
            {isTask && c.contextUsage !== undefined && (
              <div className="sim-context-capacity">
                <span>Context 容量</span>
                <meter aria-label="Context 容量" min={0} max={100} value={c.contextUsage} />
                <strong>{c.contextUsage}%</strong>
                <small>38% → 72% → 91% → 压缩 → 34% · 教学示意</small>
              </div>
            )}
            {isTask && c.waitingApproval && (
              <div className="sim-approval" role="status">
                <div>
                  <strong>等待人工审批 · HUMAN APPROVAL</strong>
                  <span>教学模拟：是否允许清理符合条件的旧数据？</span>
                </div>
                <button className="im3-primary" onClick={() => c.decideApproval('approve')}>
                  Approve · 批准模拟执行
                </button>
                <button onClick={() => c.decideApproval('reject')}>Reject · 拒绝并停止</button>
              </div>
            )}
            {isTask && c.approvalStatus === 'rejected' && (
              <p className="sim-stopped" role="status">
                STOP · 审批已拒绝，未执行数据库操作。重播后可重新决定。
              </p>
            )}
          </ImmersiveTimeline>
        )}
        <output hidden data-immersive-performance="true" ref={performanceRef} />
      </div>
    </dialog>,
    document.body,
  )
}
