import { useCallback, useRef } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CircleCheck,
  Clock3,
  Cpu,
  MessageSquare,
  RotateCcw,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Lesson } from '../../types/learning'
import { getProgress, useLearningStore } from '../../stores/learningStore'
import { ProgressIndicator } from '../../components/learning/ProgressIndicator'
import { MisconceptionCard } from '../../components/learning/MisconceptionCard'
import { useModelInsideLesson } from './hooks/useModelInsideLesson'
import { modelInsideExamples, modelInsideSteps } from './data/modelInsideSteps'
import { isModelInteraction } from './types'
import { modelMisconceptions } from './data/modelChallengeData'
import { TokenizationDemo } from './components/TokenizationDemo'
import { EmbeddingDemo } from './components/EmbeddingDemo'
import { TransformerExplorer } from './components/TransformerExplorer'
import { AttentionExplorer } from './components/AttentionExplorer'
import { TokenPredictionDemo } from './components/TokenPredictionDemo'
import { TrainingInferenceCompare } from './components/TrainingInferenceCompare'
import { ModelFlowSummary } from './components/ModelFlowSummary'
import { ModelStepExplanation } from './components/ModelStepExplanation'
import { ModelTerminology } from './components/ModelTerminology'
import { ModelMiniChallenge } from './components/ModelMiniChallenge'
import '../system-overview/system-overview.css'
import '../system-overview/components/assessment.css'
import './model-inside.css'

const sections = [
  { title: '文字变成数字', end: 2 },
  { title: '层层处理信息', end: 4 },
  { title: '一步一步生成', end: 6 },
  { title: '连成完整理解', end: 8 },
]

export function ModelInsideLesson({ lesson }: { lesson: Lesson }) {
  const learning = useModelInsideLesson()
  const completed = useLearningStore((state) => state.completedLessonIds.includes('model-inside'))
  const overallProgress = useLearningStore(getProgress)
  const studioRef = useRef<HTMLElement>(null)
  const { step, completeInteraction } = learning
  const sectionIndex = sections.findIndex((section) => learning.currentStep <= section.end)
  const blocked = isModelInteraction(step.mode) && !learning.interactionDone(step.mode)
  const example = modelInsideExamples[step.mode] ?? {
    label: '继续上一章的同一个问题',
    text: '帮我查 NVIDIA 最新的 AI GPU',
  }
  const learned = Boolean(step.unlockedTerm && learning.unlockedTerms.includes(step.unlockedTerm))
  const finishInteraction = useCallback(
    () => completeInteraction(step.mode),
    [completeInteraction, step.mode],
  )

  function move(action: () => void) {
    action()
    requestAnimationFrame(() => {
      const studio = studioRef.current
      if (studio && studio.getBoundingClientRect().top < 0)
        studio.scrollIntoView?.({ block: 'start', behavior: 'instant' })
    })
  }

  const visuals = {
    intro: (
      <div className="mi-entry">
        <p className="mi-entry-eyebrow">上一章的工作台，已经准备好了</p>
        <div className="mi-entry-sources">
          <span>Prompt</span>
          <span>Memory</span>
          <span>RAG</span>
          <span>Tool Result</span>
        </div>
        <div className="mi-entry-context">
          <span>CONTEXT</span>
          <small>当前全部工作资料</small>
        </div>
        <div className="mi-entry-connector" aria-hidden="true" />
        <div className="mi-model-door">
          <Cpu size={38} strokeWidth={1.25} />
          <strong>Model</strong>
          <span>这里面，发生了什么？</span>
          <i aria-hidden="true" />
        </div>
        <button className="button button-primary" onClick={() => move(learning.next)}>
          进入模型内部 <ArrowRight size={17} />
        </button>
        <p className="mi-entry-note">从一句话开始，跟着信息走一遍。</p>
      </div>
    ),
    tokenization: <TokenizationDemo onComplete={finishInteraction} />,
    embedding: <EmbeddingDemo onComplete={finishInteraction} />,
    transformer: <TransformerExplorer onComplete={finishInteraction} />,
    attention: <AttentionExplorer onComplete={finishInteraction} />,
    scores: <TokenPredictionDemo mode="scores" />,
    generation: <TokenPredictionDemo mode="generation" onComplete={finishInteraction} />,
    inference: <TrainingInferenceCompare />,
    summary: <ModelFlowSummary />,
  }

  return (
    <div className="lesson-page page-width so-lesson mi-lesson">
      <nav className="lesson-breadcrumb" aria-label="面包屑">
        <Link to="/learn">
          <ArrowLeft size={15} />
          学习地图
        </Link>
        <span>/</span>
        <span>03 · Model Inside</span>
      </nav>
      <header className="lesson-heading so-heading mi-heading">
        <div>
          <p className="eyebrow">
            CHAPTER 03 / 15 <span className="so-header-dot">·</span> 从工作台，走进模型
          </p>
          <h1>
            Model Inside<span>一句回答，是怎样长出来的？</span>
          </h1>
          <p>跟着一段文字，穿过计算的层次，看见回答逐步形成。</p>
        </div>
        <div className="so-lesson-meta">
          <span className="reading-time">
            <Clock3 size={15} />约 {lesson.minutes} 分钟
          </span>
          <span>
            <BookOpen size={15} />5 个核心概念
          </span>
          {completed && (
            <span className="completed-badge">
              <Check size={14} />
              已完成
            </span>
          )}
        </div>
      </header>
      <div className="so-goal">
        <span>这一站的目标</span>
        <p>理解信息如何进入模型，以及模型如何根据当前上下文，一步一步产生后续输出。</p>
      </div>
      <section
        className="so-studio mi-studio"
        aria-label="交互式 Model Inside 课程"
        ref={studioRef}
      >
        <div className="so-chapter-strip">
          <ol aria-label="本章学习路径">
            {sections.map((section, index) => (
              <li
                key={section.title}
                aria-current={index === sectionIndex ? 'step' : undefined}
                className={index < sectionIndex ? 'is-done' : ''}
              >
                <span>{index < sectionIndex ? <Check size={12} /> : `0${index + 1}`}</span>
                {section.title}
              </li>
            ))}
          </ol>
          <span className="so-lesson-position">
            {String(learning.currentStep + 1).padStart(2, '0')}
            <span> / {modelInsideSteps.length}</span>
          </span>
        </div>
        <div
          className="so-progress-track"
          role="progressbar"
          aria-label="本章教学步骤"
          aria-valuemin={0}
          aria-valuemax={modelInsideSteps.length}
          aria-valuenow={learning.currentStep + 1}
        >
          <span
            style={{ width: `${((learning.currentStep + 1) / modelInsideSteps.length) * 100}%` }}
          />
        </div>
        <div className="so-case">
          <span className="so-case-icon">
            <MessageSquare size={18} strokeWidth={1.6} />
          </span>
          <div>
            <span>{example.label}</span>
            <p>{example.text}</p>
          </div>
          <span className="so-case-tag">
            {step.mode === 'intro' ? 'Context 已就绪' : '教学示意 · 不是真实模型数据'}
          </span>
        </div>
        <div className={`so-workspace mi-workspace mi-mode-${step.mode}`}>
          <div className="so-visual-column" key={step.id}>
            {visuals[step.mode]}
          </div>
          <ModelStepExplanation key={`explain-${step.id}`} step={step} learned={learned} />
        </div>
        <div className="so-controls mi-controls" aria-label="课程步骤控制">
          <div className="so-controls-left">
            <button className="so-control-button" onClick={() => move(learning.restart)}>
              <RotateCcw size={16} />
              重温本章
            </button>
            <span className="so-control-count">
              {learning.currentStep + 1} / {modelInsideSteps.length}
            </span>
          </div>
          <div className="so-controls-actions">
            <button
              className="so-control-button"
              onClick={() => move(learning.previous)}
              disabled={learning.currentStep === 0}
            >
              <ArrowLeft size={16} />
              上一步
            </button>
            {step.mode === 'summary' ? (
              <a className="button button-primary" href="#mini-challenge">
                开始小挑战 <ArrowRight size={16} />
              </a>
            ) : (
              step.mode !== 'intro' && (
                <button
                  className="button button-primary mi-next"
                  onClick={() => move(learning.next)}
                  disabled={blocked}
                >
                  {step.nextLabel}
                  <ArrowRight size={16} />
                </button>
              )
            )}
          </div>
          <p className="so-control-hint">
            {blocked
              ? '先完成本步互动，再继续。已经认识的概念会自动保存。'
              : step.mode === 'intro'
                ? '点击上方「进入模型内部」，开始这次探索。'
                : '按自己的节奏继续，进度已自动保存。'}
          </p>
        </div>
      </section>
      <ModelTerminology unlockedTerms={learning.unlockedTerms} />
      {learning.furthestStep >= modelInsideSteps.length - 1 && (
        <section
          className="misconceptions mi-misconceptions"
          aria-labelledby="mi-misconceptions-title"
        >
          <div className="subsection-heading">
            <p className="eyebrow">KEEP THE MODEL CLEAR</p>
            <h2 id="mi-misconceptions-title">你可能会误解</h2>
          </div>
          <div className="misconception-grid">
            {modelMisconceptions.map((item) => (
              <MisconceptionCard key={item.wrong} {...item} />
            ))}
          </div>
        </section>
      )}
      <div id="mini-challenge" className="so-challenge-anchor">
        <ModelMiniChallenge
          available={learning.furthestStep >= modelInsideSteps.length - 1}
          passed={learning.challengePassed}
          onPass={learning.passChallenge}
        />
      </div>
      {completed && (
        <section className="so-complete mi-complete" aria-label="章节学习完成" role="status">
          <span className="so-complete-icon">
            <CircleCheck size={28} />
          </span>
          <p className="eyebrow">YOU HAVE BEEN INSIDE THE MODEL</p>
          <h2>你已经第一次真正“进入模型内部”</h2>
          <p>文字、数字、上下文关系与逐步生成，现在连成了一条路径。</p>
          <ModelFlowSummary />
          <ul className="mi-takeaways">
            <li>文字先拆成 Token，再变成数字表示。</li>
            <li>Transformer 逐层处理，Attention 在层内计算上下文关系。</li>
            <li>生成一个 Token → 加入已有内容 → 继续计算下一个。</li>
            <li>正常使用 AI 时，主要发生的是 Inference。</li>
          </ul>
          <div className="so-complete-actions">
            <Link className="button button-primary" to="/learn">
              查看学习地图 <ArrowRight size={17} />
            </Link>
            <Link className="button button-secondary" to="/lesson/tools">
              查看下一站 · Tools <ArrowRight size={17} />
            </Link>
          </div>
          <p className="mi-next-note">04 Tools 已开放。下一站，一起看看模型怎样调用外部能力。</p>
        </section>
      )}
      <div className="lesson-bottom so-bottom">
        <nav className="lesson-pagination" aria-label="章节导航">
          <Link className="text-link" to="/lesson/context">
            <ArrowLeft size={16} />
            上一节 · Context
          </Link>
          {completed ? (
            <Link className="text-link" to="/lesson/tools">
              下一站 · Tools <ArrowRight size={16} />
            </Link>
          ) : (
            <span className="next-lesson-locked">
              下一站 · Tools<span>完成本章后继续探索</span>
            </span>
          )}
        </nav>
        <ProgressIndicator value={overallProgress} compact />
      </div>
    </div>
  )
}

