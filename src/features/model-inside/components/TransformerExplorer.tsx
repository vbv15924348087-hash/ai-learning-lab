import {
  Component,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { ArrowDown, ArrowRight, Check, Layers3, Pause, Play, RotateCcw } from 'lucide-react'
import {
  formatTransformerVector,
  transformerExamples,
  transformerLayerNumbers as layerNumbers,
} from '../data/transformerDemoData'
import './transformer.css'

const TransformerScene = lazy(() => import('./TransformerScene'))

function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (listener: () => void) => {
      const media = window.matchMedia?.(query)
      media?.addEventListener('change', listener)
      return () => media?.removeEventListener('change', listener)
    },
    [query],
  )
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia?.(query).matches ?? false,
    () => false,
  )
}

class TransformerBoundary extends Component<
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

function Vector({ values, muted = false }: { values: readonly number[]; muted?: boolean }) {
  return (
    <div
      className={`mi-tf-vector${muted ? ' is-muted' : ''}`}
      aria-label={formatTransformerVector(values)}
    >
      {values.map((value, index) => (
        <span key={index}>{value.toFixed(1)}</span>
      ))}
    </div>
  )
}

function LayerStack({ activeLayer, processed }: { activeLayer: number; processed: number }) {
  return (
    <div className="mi-transformer-stack" data-renderer="fallback" aria-hidden="true">
      <div className="mi-stack-input">
        <span>苹果</span>
      </div>
      <ArrowDown size={16} />
      <div className="mi-stack-plates">
        {layerNumbers.map((layer) => (
          <div
            key={layer}
            className={`mi-stack-plate${layer === activeLayer ? ' is-active' : ''}${layer < processed ? ' is-processed' : ''}`}
          >
            <span>第 {layer + 1} 层</span>
            <span>
              {layer === activeLayer ? '正在看' : layer < processed ? '已更新' : '待接收'}
            </span>
          </div>
        ))}
      </div>
      <ArrowDown size={16} />
      <span className="mi-stack-output">数字一层层传下去</span>
    </div>
  )
}

export function TransformerExplorer({ onComplete }: { onComplete: () => void }) {
  const sectionRef = useRef<HTMLElement>(null)
  const visualRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [activeLayer, setActiveLayer] = useState(0)
  const [processed, setProcessed] = useState(0)
  const [exampleIndex, setExampleIndex] = useState(0)
  const [seenExamples, setSeenExamples] = useState<number[]>([0])
  const [running, setRunning] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [rendererFailed, setRendererFailed] = useState(false)
  const [simplified, setSimplified] = useState(false)
  const [pageVisible, setPageVisible] = useState(() => document.visibilityState !== 'hidden')
  const [sectionVisible, setSectionVisible] = useState(true)
  const [sceneVisible, setSceneVisible] = useState(true)
  const example = transformerExamples[exampleIndex]
  const inputReady = activeLayer <= processed
  const outputReady = activeLayer < processed
  const allProcessed = processed === layerNumbers.length
  const hasCompared = seenExamples.length === transformerExamples.length
  const usesStack = reducedMotion || rendererFailed || simplified
  const playing = running && !reducedMotion && !allProcessed && pageVisible && sectionVisible
  const fallback = <LayerStack activeLayer={activeLayer} processed={processed} />

  useEffect(() => {
    const onVisibility = () => setPageVisible(document.visibilityState !== 'hidden')
    document.addEventListener('visibilitychange', onVisibility)
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver((entries) => {
            for (const entry of entries) {
              if (entry.target === sectionRef.current) setSectionVisible(entry.isIntersecting)
              if (entry.target === visualRef.current) setSceneVisible(entry.isIntersecting)
            }
          })
    if (sectionRef.current) observer?.observe(sectionRef.current)
    if (visualRef.current) observer?.observe(visualRef.current)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      observer?.disconnect()
    }
  }, [])

  const advance = useCallback(() => {
    if (completed) return
    if (allProcessed) {
      if (!hasCompared) {
        setExampleIndex((current) => 1 - current)
        setSeenExamples([0, 1])
      } else {
        setCompleted(true)
        onComplete()
      }
      setRunning(false)
      return
    }
    if (activeLayer > processed) setActiveLayer(processed)
    else if (activeLayer < processed) setActiveLayer(Math.min(activeLayer + 1, processed))
    else {
      setProcessed((current) => current + 1)
      if (activeLayer === 4) setRunning(false)
    }
  }, [activeLayer, allProcessed, completed, hasCompared, onComplete, processed])

  useEffect(() => {
    if (!playing) return
    const timer = window.setTimeout(advance, 2400)
    return () => window.clearTimeout(timer)
  }, [advance, playing])
  useEffect(() => {
    if (reducedMotion) setRunning(false)
  }, [reducedMotion])

  const selectLayer = (layer: number) => {
    setRunning(false)
    setActiveLayer(layer)
  }
  const selectExample = (index: number) => {
    setRunning(false)
    setExampleIndex(index)
    setSeenExamples((current) => (current.includes(index) ? current : [...current, index]))
  }
  const restart = () => {
    setRunning(false)
    setCompleted(false)
    setActiveLayer(0)
    setProcessed(0)
    setExampleIndex(0)
    setSeenExamples([0])
  }
  const actionLabel = completed
    ? '已看懂数字怎样接力'
    : allProcessed
      ? hasCompared
        ? '完成层层计算演示'
        : '换一句话，对比结果'
      : !inputReady
        ? `回到第 ${processed + 1} 层继续`
        : outputReady
          ? '把更新后的结果交给下一层'
          : '让这一层结合前文'

  return (
    <section ref={sectionRef} className="mi-transformer" aria-label="Transformer 多层计算互动">
      <div className="mi-transformer-header">
        <div>
          <Layers3 size={18} aria-hidden="true" />
          <strong>同一个“苹果”，前文不同，计算后的数字也会不同</strong>
        </div>
        <span className="mi-transformer-badge">机制教学示意 · 5 层</span>
      </div>
      <div className="mi-tf-intro">
        <p>
          <strong>层 = 一轮计算：</strong>拿到上一轮的数字，结合前文，算出一组新数字。
        </p>
        <div className="mi-tf-examples" role="group" aria-label="切换前文，观察同一个苹果">
          {transformerExamples.map((item, index) => (
            <button
              type="button"
              key={item.id}
              className={exampleIndex === index ? 'is-active' : ''}
              aria-pressed={exampleIndex === index}
              onClick={() => selectExample(index)}
            >
              <span>句子 {index + 1}</span>
              <span>
                {item.prefix}
                <mark>{item.context}</mark>
                <strong>苹果</strong>
              </span>
            </button>
          ))}
        </div>
        <p className="mi-tf-look-for">
          先看前文：“吃了一口”说的是水果，“手机来自”说的是公司。同一个词，这次计算需要体现不同的关系。
          切换句子，对比同一轮在不同前文下的结果。
        </p>
      </div>
      <div className="mi-transformer-workspace">
        <div className="mi-transformer-inspector">
          <div className="mi-transformer-layers" aria-label="选择要观察的计算层">
            {layerNumbers.map((layer) => (
              <button
                key={layer}
                type="button"
                aria-pressed={activeLayer === layer}
                className={`mi-transformer-layer${activeLayer === layer ? ' is-active' : ''}`}
                onClick={() => selectLayer(layer)}
              >
                <span>第 {layer + 1} 层</span>
                <span>
                  {layer < processed ? (
                    <>
                      <Check size={12} aria-hidden="true" />
                      已更新
                    </>
                  ) : layer === processed ? (
                    '等你计算'
                  ) : (
                    '等待上层'
                  )}
                </span>
              </button>
            ))}
          </div>
          <div className="mi-tf-stage-title">
            <strong>第 {activeLayer + 1} 层，具体做这一件事</strong>
            <span>{outputReady ? '这一轮的结果已经出现' : '先看输入，再点击计算'}</span>
          </div>
          <div className="mi-tf-calculation" data-example={example.id}>
            <div className="mi-tf-number-card" data-testid="transformer-input">
              <span className="mi-tf-card-label">① 本层收到</span>
              <strong className="mi-tf-word">苹果</strong>
              {inputReady ? (
                <Vector values={example.vectors[activeLayer]} muted />
              ) : (
                <p className="mi-tf-placeholder">等待前一层交来数字</p>
              )}
              <small>
                {activeLayer === 0 ? '查表得到的初始数字' : `直接沿用第 ${activeLayer} 层的输出`}
              </small>
              {activeLayer === 0 && <span className="mi-tf-same">换句子，这组初始数字相同</span>}
            </div>
            <div className={`mi-tf-operation${outputReady ? ' is-processed' : ''}`}>
              <span className="mi-tf-card-label">② 结合前文做计算</span>
              <div className="mi-tf-context-phrase">{example.context}</div>
              <small>这段前文的数字表示</small>
              <ArrowDown size={17} aria-hidden="true" />
              <strong>第 {activeLayer + 1} 层计算</strong>
              <span className="mi-tf-operation-arrow">
                <ArrowRight size={22} aria-hidden="true" />
              </span>
              <small>文字只帮你看懂；模型用数字算</small>
            </div>
            <div
              className={`mi-tf-number-card mi-tf-result${outputReady ? ' is-ready' : ''}`}
              data-testid="transformer-output"
              aria-live="polite"
            >
              <span className="mi-tf-card-label">③ 本层交出</span>
              <strong className="mi-tf-word">苹果</strong>
              {outputReady ? (
                <Vector values={example.vectors[activeLayer + 1]} />
              ) : (
                <div className="mi-tf-hidden-vector" aria-label="尚未计算">
                  <span>?</span>
                  <span>?</span>
                  <span>?</span>
                  <span>?</span>
                </div>
              )}
              <small>{outputReady ? '更新后的数字表示' : '点击下方按钮，看看数字怎样变'}</small>
              {outputReady && <span className="mi-tf-same">文字没换，当前表示更新了</span>}
            </div>
          </div>
          <div className="mi-transformer-explanation" aria-live="polite" aria-atomic="true">
            <strong>
              {!inputReady
                ? '还不能跳过前一轮。'
                : outputReady
                  ? activeLayer === 4
                    ? '五轮处理完成，更新后的表示交给后续的预测计算。'
                    : '接下来，整组新数字原样交给下一层。'
                  : '这一轮要让“苹果”的数字结合前文。'}
            </strong>
            <p>
              {!inputReady
                ? `第 ${activeLayer + 1} 层需要第 ${activeLayer} 层的输出。先回到第 ${processed + 1} 层继续计算。`
                : outputReady
                  ? `用人话理解：${example.interpretation} 这里展示数字会随上下文更新，不是把某个数字翻译成“水果”或“公司”。`
                  : `前面是“${example.context}”。${example.interpretation} 点击计算后，观察整组数字变化；不需要记住数值。`}
            </p>
          </div>
          <p className="mi-transformer-note">
            数值由人为编写，仅说明机制，不是实测结果或概率；4
            个位置没有“水果”“公司”等固定含义。实际模型通常有更多维、更多层，各层没有固定的业务分工。
          </p>
        </div>
        <aside className="mi-tf-map">
          <strong>现在走到哪一层？</strong>
          <div
            ref={visualRef}
            className="mi-transformer-visual"
            role="group"
            aria-label="信息从上往下经过五层计算；当前位置与左侧计算同步"
          >
            {usesStack ? (
              fallback
            ) : (
              <TransformerBoundary fallback={fallback}>
                <Suspense fallback={fallback}>
                  <TransformerScene
                    activeLayer={activeLayer}
                    processed={processed}
                    running={playing}
                    animationEnabled={pageVisible && sceneVisible}
                    onSelectLayer={selectLayer}
                    onFailure={() => setRendererFailed(true)}
                  />
                </Suspense>
              </TransformerBoundary>
            )}
            {!usesStack && (
              <span className="mi-transformer-view-label">
                第 {activeLayer + 1} 层 · {outputReady ? '已更新' : '待计算'}
              </span>
            )}
          </div>
          <p className="mi-tf-map-legend">
            <i />
            蓝色卡片：正在跟踪的“苹果”
            <br />
            <b />
            薄板：一轮计算
          </p>
          {!reducedMotion && !rendererFailed && (
            <button
              className="mi-transformer-view-toggle"
              type="button"
              onClick={() => setSimplified((current) => !current)}
            >
              {simplified ? '查看 3D 位置图' : '查看简化位置图'}
            </button>
          )}
        </aside>
      </div>
      {allProcessed && (
        <div className="mi-tf-conclusion" aria-live="polite">
          <strong>五轮接力完成：每一轮都在接着上一轮算。</strong>
          {hasCompared ? (
            <div className="mi-tf-comparison">
              {transformerExamples.map((item) => (
                <div key={item.id}>
                  <p>
                    {item.prefix}
                    <mark>{item.context}</mark>
                    <strong>苹果</strong>
                  </p>
                  <span>
                    相同初始数字 <code>{formatTransformerVector(item.vectors[0])}</code>
                  </span>
                  <ArrowDown size={16} aria-hidden="true" />
                  <Vector values={item.vectors[5]} />
                  <p>
                    {item.interpretation}
                    <small>人话说明，非数字解码</small>
                  </p>
                </div>
              ))}
              <p>初始数字相同，前文不同，经过计算后的表示不同。改变的是本次计算中的表示。</p>
            </div>
          ) : (
            <p>再换一句前文，看同一个“苹果”如何从相同的初始数字，得到不同的表示。</p>
          )}
          <details className="mi-tf-chain">
            <summary>查看完整接力：上一层输出 = 下一层输入</summary>
            <table>
              <caption>“{example.sentence}”的 5 轮数值示意</caption>
              <thead>
                <tr>
                  <th>轮次</th>
                  <th>本层收到</th>
                  <th>本层交出 → 下一层收到</th>
                </tr>
              </thead>
              <tbody>
                {layerNumbers.map((layer) => (
                  <tr key={layer}>
                    <th>第 {layer + 1} 层</th>
                    <td>{formatTransformerVector(example.vectors[layer])}</td>
                    <td>{formatTransformerVector(example.vectors[layer + 1])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </div>
      )}
      <div className="mi-transformer-controls">
        <button
          type="button"
          className="button button-primary"
          disabled={completed}
          onClick={() => {
            setRunning(false)
            advance()
          }}
        >
          {completed ? (
            <Check size={16} aria-hidden="true" />
          ) : (
            <ArrowRight size={16} aria-hidden="true" />
          )}
          {actionLabel}
        </button>
        <button
          type="button"
          className="button mi-transformer-secondary"
          onClick={() => setRunning((current) => !current)}
          disabled={reducedMotion || allProcessed}
        >
          {playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
          {playing ? '暂停' : '自动演示'}
        </button>
        <button type="button" className="button mi-transformer-secondary" onClick={restart}>
          <RotateCcw size={15} aria-hidden="true" />
          重新开始
        </button>
        <span className="mi-transformer-progress" aria-live="polite">
          {completed
            ? '✓ 演示完成'
            : `已计算 ${processed} / 5 层 · ${hasCompared ? '已对比前文' : '等待对比前文'}`}
        </span>
      </div>
      {reducedMotion && (
        <p className="mi-transformer-accessibility-note">
          已使用静态位置图。点击计算和传递按钮即可完整体验。
        </p>
      )}
    </section>
  )
}
