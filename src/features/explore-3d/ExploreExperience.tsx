import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  ArrowLeft,
  Box,
  Compass,
  Home,
  Layers3,
  Maximize,
  MousePointer2,
  Play,
  Rotate3D,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLearningStore } from '../../stores/learningStore'
import { exploreNodes } from './data'
import { getDisplayedConnections, getRelations, getVisibleNodes } from './graph'
import { ConceptNavigator } from './ConceptNavigator'
import { CategoryLegend } from './CategoryLegend'
import { NodeDetail } from './NodeDetail'
import { PlaybackPanel } from './PlaybackPanel'
import { StaticSystem } from './StaticSystem'
import { useExploreController } from './useExploreController'
import type { ExploreDepth } from './types'
import './explore.css'

const ExploreScene = lazy(() => import('./scene/ExploreScene'))
const ImmersiveLab = lazy(() => import('./immersive/ImmersiveLab'))
class SceneBoundary extends Component<
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

export function ExploreExperience() {
  const [immersive, setImmersive] = useState(false)
  const c = useExploreController(immersive)
  const [failed, setFailed] = useState(false)
  const performanceRef = useRef<HTMLOutputElement>(null)
  const completedLessons = useLearningStore((state) => state.completedLessonIds)
  const unlockedLessons = useLearningStore((state) => state.unlockedLessonIds)
  const selected = exploreNodes.find((node) => node.id === c.selectedId)
  const visibleNodes = useMemo(
    () => getVisibleNodes(c.depth, c.selectedId),
    [c.depth, c.selectedId],
  )
  const connections = useMemo(() => getDisplayedConnections(visibleNodes), [visibleNodes])
  const relatedIds = useMemo(() => {
    if (!c.selectedId) return []
    const relations = getRelations(c.selectedId)
    return [...relations.upstream, ...relations.downstream, ...relations.related].map(
      (node) => node.id,
    )
  }, [c.selectedId])
  const learnedNodeIds = useMemo(
    () =>
      exploreNodes
        .filter((node) => completedLessons.includes(node.lessonId))
        .map((node) => node.id),
    [completedLessons],
  )
  const onFailure = useCallback(() => setFailed(true), [])
  const unlockedNodeIds = useMemo(
    () =>
      exploreNodes.filter((node) => unlockedLessons.includes(node.lessonId)).map((node) => node.id),
    [unlockedLessons],
  )
  const recordPerformance = useCallback(
    (sample: { fps: number; drawCalls: number; triangles: number }) => {
      const output = performanceRef.current
      if (output) {
        output.dataset.fps = String(sample.fps)
        output.dataset.drawCalls = String(sample.drawCalls)
        output.dataset.triangles = String(sample.triangles)
      }
    },
    [],
  )
  const fallback = <StaticSystem failed onSelect={c.selectNode} />

  return (
    <div className="ex3-page" data-mode={c.mode}>
      <header className="ex3-header">
        <div>
          <Link className="ex3-back" to="/learn">
            <ArrowLeft size={13} /> 学习地图
          </Link>
          <p className="ex3-kicker">3D SYSTEM EXPLORER</p>
          <h1>走进 AI 的工作现场。</h1>
          <p>转一转，点一点。看清一份信息，怎样变成可靠的行动。</p>
        </div>
        <div className="ex3-header-note">
          <Box size={20} />
          <span>
            一个系统 · 六个区域
            <br />
            <small>从全景开始，逐层深入</small>
          </span>
        </div>
      </header>
      <div className="ex3-topbar">
        <nav className="ex3-modes" aria-label="探索模式">
          {(
            [
              { id: 'free', label: '自由探索', Icon: Rotate3D },
              { id: 'guided', label: '带我看一遍', Icon: Compass },
              { id: 'task', label: '运行一个任务', Icon: Play },
            ] as const
          ).map(({ id, label, Icon }) => (
            <button
              key={id}
              aria-pressed={c.mode === id}
              className={c.mode === id ? 'is-active' : ''}
              onClick={() => c.changeMode(id)}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>
        <p>
          <span className="ex3-status-dot" /> 教学示意 · 所有执行均为模拟
        </p>
      </div>
      <div className="ex3-workspace">
        <ConceptNavigator
          selectedId={c.selectedId}
          completedLessons={completedLessons}
          unlockedLessons={unlockedLessons}
          onSelect={c.selectNode}
        />
        <div className="ex3-center">
          <section className="ex3-world" aria-label="3D AI 系统探索空间">
            <div className="ex3-world-toolbar">
              <span>
                <Layers3 size={14} /> 展开层级
              </span>
              <div role="group" aria-label="场景展开层级">
                {['全景', '模块', '细节'].map((label, index) => (
                  <button
                    key={label}
                    aria-pressed={c.depth === index}
                    className={c.depth === index ? 'is-active' : ''}
                    onClick={() => c.changeDepth(index as ExploreDepth)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button className="ex3-reset" onClick={c.reset}>
                <Home size={14} /> 回到全景
              </button>
              <button
                className="ex3-fullscreen"
                onClick={() => {
                  c.pause()
                  setImmersive(true)
                }}
              >
                <Maximize size={14} /> 全屏探索
              </button>
            </div>
            <div
              className="ex3-scene"
              ref={c.surfaceRef}
              data-scene-status={failed ? 'fallback' : '3d'}
            >
              <div className="ex3-scene-hint">
                <MousePointer2 size={13} />
                {selected ? `正在探索 · ${selected.chineseLabel}` : '点击任意节点开始探索'}
              </div>
              <SceneBoundary fallback={fallback}>
                <Suspense fallback={<StaticSystem onSelect={c.selectNode} />}>
                  {failed ? (
                    fallback
                  ) : (
                    <ExploreScene
                      nodes={visibleNodes}
                      connections={connections}
                      selectedId={c.selectedId}
                      focusedId={c.selectedId}
                      relatedIds={relatedIds}
                      activeEdgeIds={c.mode === 'task' ? c.currentTask.edgeIds : []}
                      playing={c.isPlaying}
                      reducedMotion={c.reducedMotion}
                      enabled={c.enabled}
                      resetKey={c.resetKey}
                      cameraPose={c.cameraPose}
                      learnedNodeIds={learnedNodeIds}
                      unlockedNodeIds={unlockedNodeIds}
                      onSelect={c.selectNode}
                      onDepthChange={c.changeDepth}
                      onCameraChange={c.changeCamera}
                      onFailure={onFailure}
                      onPerformance={recordPerformance}
                    />
                  )}
                </Suspense>
              </SceneBoundary>
              <p className="ex3-sr-only">
                Context 收集本次相关信息，Model 处理信息并决定下一步。Harness 调度工具，外部结果进入
                Context 供模型继续判断。Verification 检查失败时返回 Agent Loop，通过后才能
                Final。左侧概念导航与右侧详情可替代三维操作。
              </p>
            </div>
            <CategoryLegend />
            <div className="ex3-world-footer">
              <span>
                <i className="ex3-line-data" /> 信息 <i className="ex3-line-tool" /> 行动{' '}
                <i className="ex3-line-loop" /> 反馈循环
              </span>
              <span>拖动旋转 · 滚轮缩放 · R 回全景</span>
            </div>
          </section>
          <PlaybackPanel
            mode={c.mode}
            taskStep={c.taskStep}
            tourStep={c.tourStep}
            currentTask={c.currentTask}
            currentStop={c.currentStop}
            playing={c.isPlaying}
            reducedMotion={c.reducedMotion}
            onTask={c.jumpTask}
            onTour={c.jumpTour}
            onToggle={c.togglePlayback}
            onExit={() => c.changeMode('free')}
          />
        </div>
        <NodeDetail
          key={selected?.id ?? 'intro'}
          node={selected}
          unlockedLessons={unlockedLessons}
          completedLessons={completedLessons}
          onSelect={c.selectNode}
          onTour={() => c.changeMode('guided')}
        />
      </div>
      <footer className="ex3-page-note">
        <p>
          模型决定下一步，运行系统让行动发生。
          <span>图中是职责关系的教学抽象，实际产品的模块边界会有所不同。</span>
        </p>
        <span>Esc 退出聚焦 · ← → 切换任务步骤</span>
      </footer>
      <output
        hidden
        ref={performanceRef}
        aria-label="开发性能采样"
        data-explore-performance="true"
      />
      {immersive && (
        <Suspense
          fallback={
            <div role="status" className="ex3-immersive-loading">
              正在打开沉浸探索…
            </div>
          }
        >
          <ImmersiveLab
            initial={{
              selectedId: c.selectedId,
              depth: c.depth,
              mode: c.mode,
              taskStep: c.taskStep,
              cameraPose: c.cameraPose,
            }}
            reducedMotion={c.reducedMotion}
            onClose={() => setImmersive(false)}
          />
        </Suspense>
      )}
    </div>
  )
}
