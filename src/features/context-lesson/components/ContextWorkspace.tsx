import { ArrowDown, ArrowRight, Check, Layers3, ListFilter } from 'lucide-react'
import { contextSources } from '../data/contextLessonSteps'
import type { ContextLessonStep, ContextSourceId } from '../types'
import { ContextComparison } from './ContextComparison'
import { ContextFlow, ContextModel } from './ContextFlow'
import { ContextSourceIcon, ContextSourceNode } from './ContextSourceNode'
import { ContextWindowMeter } from './ContextWindowMeter'
import { ContextWorkbench } from './ContextWorkbench'
import '../workspace.css'

export type ContextWorkspaceProps = {
  step: ContextLessonStep
  selectedSource: ContextSourceId | null
  onSelectSource: (id: ContextSourceId) => void
  noisy: boolean
  onSetNoisy: (value: boolean) => void
}

function ContextSourceFlow({
  sourceId,
  onSelectSource,
}: {
  sourceId: ContextSourceId
  onSelectSource: (id: ContextSourceId) => void
}) {
  const source = contextSources.find((item) => item.id === sourceId)
  if (!source) return null
  const memory = sourceId === 'memory'
  const rag = sourceId === 'rag'
  return (
    <div className={`ctx-source-journey ctx-source--${source.id}`}>
      <div className="ctx-origin">
        <span className="ctx-origin-icon">
          <ContextSourceIcon id={source.id} size={24} />
        </span>
        <div>
          <strong>{source.origin}</strong>
          <span>{memory ? 'MEMORY · 长期保存' : rag ? '外部知识 · 临时查找' : source.label}</span>
        </div>
      </div>
      <ContextFlow
        key={`${source.id}-flow`}
        animated
        label={
          memory
            ? '取出与当前任务有关的信息'
            : rag
              ? 'RAG：搜索 / 检索相关内容'
              : '提供与这一次回答有关的信息'
        }
      />
      <div className="ctx-extracted" key={`${source.id}-extracted`}>
        <span>
          <Check size={13} aria-hidden="true" />
          {memory ? '取出的信息' : rag ? '找到的资料' : '准备加入的信息'}
        </span>
        <p>{source.content}</p>
      </div>
      <ContextFlow label="加入本次 Context" />
      <div className="ctx-source-destination">
        <Layers3 size={22} strokeWidth={1.6} aria-hidden="true" />
        <div>
          <strong>Context · 当前工作台</strong>
          <span>模型能使用的，是已经放到这里的相关内容。</span>
        </div>
      </div>
      <p className="ctx-source-distinction">
        {memory
          ? '仓库不会整个搬上工作台，只有取出的相关信息会进入。'
          : rag
            ? 'RAG 是找资料的方法；找到的资料，才是进入 Context 的内容。'
            : '信息来自不同地方，汇集后才成为模型这一次的工作资料。'}
      </p>
      <div className="ctx-source-selector" role="group" aria-label="探索 Context 的信息来源">
        {contextSources.map((item) => (
          <ContextSourceNode
            key={item.id}
            source={item}
            selected={item.id === sourceId}
            onSelect={onSelectSource}
          />
        ))}
      </div>
      <p className="ctx-selector-hint">点击一个来源，看看什么进入了工作台。</p>
    </div>
  )
}

function ContextEngineeringPipeline({
  selectedSource,
  onSelectSource,
}: Pick<ContextWorkspaceProps, 'selectedSource' | 'onSelectSource'>) {
  return (
    <div className="ctx-engineering-pipeline">
      <div className="ctx-information-pool">
        <span>很多可用信息</span>
        <div>
          <span>用户问题</span>
          <span>官方资料</span>
          <span>旧聊天</span>
          <span>工具说明</span>
          <span>旅游攻略</span>
          <span>重复网页</span>
        </div>
      </div>
      <ContextFlow label="先看当前任务需要什么" />
      <div className="ctx-filter-stage">
        <ListFilter size={20} aria-hidden="true" />
        <span>选择相关信息</span>
        <ArrowRight size={14} aria-hidden="true" />
        <span>组织和排序</span>
        <ArrowRight size={14} aria-hidden="true" />
        <span>去掉重复</span>
      </div>
      <ContextFlow label="留下这一轮真正要用的资料" />
      <ContextWorkbench
        items={['prompt', 'tools', 'rag', 'result']}
        selectedSource={selectedSource}
        onSelectSource={onSelectSource}
        compact
      />
      <ContextFlow label="让模型看到它需要的内容" />
      <ContextModel />
    </div>
  )
}

function ContextSummary({
  selectedSource,
  onSelectSource,
}: Pick<ContextWorkspaceProps, 'selectedSource' | 'onSelectSource'>) {
  const ids: ContextSourceId[] = ['prompt', 'memory', 'rag', 'result']
  return (
    <div className="ctx-summary-diagram">
      <div className="ctx-summary-inputs">
        {ids.map((id) => {
          const source = contextSources.find((item) => item.id === id)
          if (!source) return null
          return (
            <div className={`ctx-summary-branch ctx-source--${id}`} key={id}>
              <ContextSourceNode
                source={source}
                selected={selectedSource === id}
                onSelect={onSelectSource}
              />
              <small>
                {id === 'memory'
                  ? '取出相关信息'
                  : id === 'rag'
                    ? '找回相关资料'
                    : id === 'prompt'
                      ? '本次问题'
                      : '执行后的结果'}
              </small>
              <ArrowDown size={16} aria-hidden="true" />
            </div>
          )
        })}
      </div>
      <div className="ctx-summary-merge">
        <ArrowDown size={21} aria-hidden="true" />
      </div>
      <div className="ctx-summary-center">
        <Layers3 size={31} strokeWidth={1.4} aria-hidden="true" />
        <span>CONTEXT</span>
        <strong>模型这一刻能看到的全部信息</strong>
        <p>当前工作台 · 有容量边界 · 为本次任务准备</p>
      </div>
      <ContextFlow label="这些资料一起提供给模型" />
      <ContextModel />
      <p className="ctx-summary-caption">不同来源 → 当前 Context → Model</p>
    </div>
  )
}

export function ContextWorkspace({
  step,
  selectedSource,
  onSelectSource,
  noisy,
  onSetNoisy,
}: ContextWorkspaceProps) {
  const activeSource = contextSources.find((source) => source.id === step.activeSource)
  const basicWorkspace = ['assembly', 'subset', 'capacity'].includes(step.variant)
  return (
    <div className={`ctx-visualization ctx-visualization--${step.variant}`}>
      <div className="ctx-visual-topline">
        <span>
          <i aria-hidden="true" />
          {step.variant === 'question' ? '回答之前' : '当前工作台'}
        </span>
        <span>教学模拟</span>
      </div>
      <div className="ctx-visual-stage">
        {step.variant === 'question' && (
          <div className="ctx-question-diagram">
            <div className="ctx-question-prompt">
              <span>
                <ContextSourceIcon id="prompt" />
                你提出的问题
              </span>
              <p>{contextSources.find((source) => source.id === 'prompt')?.content}</p>
            </div>
            <div className="ctx-question-gap">
              <span aria-hidden="true">?</span>
              <p>只有这一句话吗？</p>
              <ArrowDown size={21} aria-hidden="true" />
            </div>
            <ContextModel question />
          </div>
        )}
        {basicWorkspace && (
          <>
            {step.variant === 'assembly' && activeSource && (
              <div className={`ctx-assembly-source ctx-source--${activeSource.id}`}>
                <span>
                  <ContextSourceIcon id={activeSource.id} size={16} />
                  {activeSource.origin}
                </span>
                <ArrowRight size={16} aria-hidden="true" />
                <small>加入这一次的工作资料</small>
              </div>
            )}
            {step.variant === 'subset' && (
              <p className="ctx-visual-takeaway">一个问题，是工作资料的起点。</p>
            )}
            <ContextWorkbench
              items={step.items}
              activeSource={step.activeSource}
              selectedSource={selectedSource}
              onSelectSource={onSelectSource}
              assembly={step.variant === 'assembly'}
              subset={step.variant === 'subset'}
            />
            {step.variant === 'capacity' && <ContextWindowMeter load={step.contextLoad ?? 30} />}
            <ContextFlow label="作为这一次回答的依据" />
            <ContextModel />
          </>
        )}
        {step.variant === 'sources' && (
          <ContextSourceFlow
            sourceId={selectedSource ?? step.activeSource ?? 'memory'}
            onSelectSource={onSelectSource}
          />
        )}
        {step.variant === 'comparison' && (
          <ContextComparison
            noisy={noisy}
            onSetNoisy={onSetNoisy}
            selectedSource={selectedSource}
            onSelectSource={onSelectSource}
          />
        )}
        {step.variant === 'engineering' && (
          <ContextEngineeringPipeline
            selectedSource={selectedSource}
            onSelectSource={onSelectSource}
          />
        )}
        {step.variant === 'summary' && (
          <ContextSummary selectedSource={selectedSource} onSelectSource={onSelectSource} />
        )}
      </div>
      <div className="ctx-visual-flowtext" aria-live="polite" aria-atomic="true">
        <span>信息怎么走</span>
        <p>
          {step.variant === 'sources'
            ? (contextSources
                .find((source) => source.id === (selectedSource ?? step.activeSource))
                ?.flow.join(' → ') ?? step.flowText)
            : step.flowText}
        </p>
      </div>
    </div>
  )
}
