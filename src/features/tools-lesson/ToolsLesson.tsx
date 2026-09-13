import { useCallback, useRef } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CircleCheck,
  Clock3,
  MessageSquare,
  RotateCcw,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Lesson } from '../../types/learning'
import { getProgress, useLearningStore } from '../../stores/learningStore'
import { ProgressIndicator } from '../../components/learning/ProgressIndicator'
import { MisconceptionCard } from '../../components/learning/MisconceptionCard'
import { useToolsLesson } from './hooks/useToolsLesson'
import { toolsLessonSteps } from './data/toolsLessonSteps'
import { toolsMisconceptions } from './data/toolsMisconceptions'
import { ToolBoundary } from './components/ToolBoundary'
import { ToolShelf } from './components/ToolShelf'
import { ToolMatchingChallenge } from './components/ToolMatchingChallenge'
import { ToolCallInspector } from './components/ToolCallInspector'
import { ToolSchemaPanel } from './components/ToolSchemaPanel'
import { ToolCallBuilder } from './components/ToolCallBuilder'
import { ToolExecutionCheckpoint } from './components/ToolExecutionCheckpoint'
import { ToolExecutionFlow } from './components/ToolExecutionFlow'
import { ToolResultCard } from './components/ToolResultCard'
import { ToolsFlowSummary } from './components/ToolsFlowSummary'
import { ToolsStepExplanation } from './components/ToolsStepExplanation'
import { ToolsTerminology } from './components/ToolsTerminology'
import { ToolsMiniChallenge } from './components/ToolsMiniChallenge'
import '../system-overview/system-overview.css'
import '../system-overview/components/assessment.css'
import '../model-inside/model-inside.css'
import './tools-lesson.css'

const sections = [
  { title: '借助外部能力', end: 2 },
  { title: '构建一次请求', end: 5 },
  { title: '让动作发生', end: 7 },
  { title: '带着结果回来', end: 9 },
]

export function ToolsLesson({ lesson }: { lesson: Lesson }) {
  const learning = useToolsLesson()
  const completed = useLearningStore((state) => state.completedLessonIds.includes('tools'))
  const overallProgress = useLearningStore(getProgress)
  const studioRef = useRef<HTMLElement>(null)
  const { step, completeInteraction } = learning
  const sectionIndex = sections.findIndex((section) => learning.currentStep <= section.end)
  const blocked = step.mode !== 'summary' && !learning.interactionDone(step.mode)
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
    boundary: (
      <ToolBoundary
        onComplete={() => {
          finishInteraction()
          move(learning.next)
        }}
      />
    ),
    shelf: <ToolShelf onComplete={finishInteraction} />,
    matching: <ToolMatchingChallenge onComplete={finishInteraction} />,
    call: <ToolCallInspector onComplete={finishInteraction} />,
    schema: <ToolSchemaPanel onComplete={finishInteraction} />,
    builder: <ToolCallBuilder onComplete={finishInteraction} />,
    checkpoint: <ToolExecutionCheckpoint onComplete={finishInteraction} />,
    execution: <ToolExecutionFlow onComplete={finishInteraction} />,
    result: <ToolResultCard onComplete={finishInteraction} />,
    summary: <ToolsFlowSummary />,
  }

  return (
    <div className="lesson-page page-width so-lesson tl-lesson">
      <nav className="lesson-breadcrumb" aria-label="面包屑">
        <Link to="/learn">
          <ArrowLeft size={15} />
          学习地图
        </Link>
        <span>/</span>
        <span>04 · Tools</span>
      </nav>
      <header className="lesson-heading so-heading mi-heading tl-heading">
        <div>
          <p className="eyebrow">
            CHAPTER 04 / 15 <span className="so-header-dot">·</span> 从生成内容，到调用能力
          </p>
          <h1>
            Tools <span className="tl-title-slash">/</span> Function Calling
            <span>模型，怎样从“会说”走向“会做”？</span>
          </h1>
          <p>选一个工具，构建一次请求，跟着结果走回模型。</p>
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
        <p>看清谁决定、谁执行，以及工具返回的信息怎样成为回答。</p>
      </div>
      <section className="so-studio tl-studio" aria-label="交互式 Tools 课程" ref={studioRef}>
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
            <span> / {toolsLessonSteps.length}</span>
          </span>
        </div>
        <div
          className="so-progress-track"
          role="progressbar"
          aria-label="本章教学步骤"
          aria-valuemin={0}
          aria-valuemax={toolsLessonSteps.length}
          aria-valuenow={learning.currentStep + 1}
        >
          <span
            style={{ width: `${((learning.currentStep + 1) / toolsLessonSteps.length) * 100}%` }}
          />
        </div>
        <div className="so-case">
          <span className="so-case-icon">
            <MessageSquare size={18} strokeWidth={1.5} />
          </span>
          <div>
            <span>继续同一个问题</span>
            <p>帮我查 NVIDIA 最新的 AI GPU，并简单告诉我它是什么。</p>
          </div>
          <span className="so-case-tag tl-simulation-badge">
            <i />
            教学模拟 · 不会联网
          </span>
        </div>
        <div className={`so-workspace tl-workspace tl-mode-${step.mode}`}>
          <div className="so-visual-column" key={step.id}>
            {visuals[step.mode]}
          </div>
          {step.mode !== 'execution' && (
            <ToolsStepExplanation
              key={`explain-${step.id}`}
              step={step}
              unlockedTerms={learning.unlockedTerms}
              interacted={learning.interactionDone(step.mode)}
            />
          )}
        </div>
        <div className="so-controls tl-controls" aria-label="课程步骤控制">
          <div className="so-controls-left">
            <button className="so-control-button" onClick={() => move(learning.restart)}>
              <RotateCcw size={16} />
              重温本章
            </button>
            <span className="so-control-count">
              {learning.currentStep + 1} / {toolsLessonSteps.length}
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
              <button
                className="button button-primary tl-next"
                onClick={() => move(learning.next)}
                disabled={blocked}
              >
                下一步：{step.nextLabel}
                <ArrowRight size={16} />
              </button>
            )}
          </div>
          <p className="so-control-hint">
            {blocked
              ? step.mode === 'boundary'
                ? '先选择一个行动，开始这次探索。'
                : '先完成本步互动，再继续。已认识的概念会自动保存。'
              : '按自己的节奏继续，进度已自动保存。'}
          </p>
        </div>
      </section>
      <ToolsTerminology unlockedTerms={learning.unlockedTerms} />
      {learning.furthestStep >= toolsLessonSteps.length - 1 && (
        <section
          className="misconceptions tl-misconceptions"
          aria-labelledby="tl-misconceptions-title"
        >
          <div className="subsection-heading">
            <p className="eyebrow">KEEP THE BOUNDARY CLEAR</p>
            <h2 id="tl-misconceptions-title">你可能会误解</h2>
          </div>
          <div className="misconception-grid">
            {toolsMisconceptions.map((item) => (
              <MisconceptionCard key={item.wrong} {...item} />
            ))}
          </div>
        </section>
      )}
      <div id="mini-challenge" className="so-challenge-anchor">
        <ToolsMiniChallenge
          available={learning.furthestStep >= toolsLessonSteps.length - 1}
          passed={learning.challengePassed}
          onPass={learning.passChallenge}
        />
      </div>
      {completed && (
        <section className="so-complete tl-complete" aria-label="章节学习完成" role="status">
          <span className="so-complete-icon">
            <CircleCheck size={28} />
          </span>
          <p className="eyebrow">FROM WORDS TO ACTIONS</p>
          <h2>你已经理解模型是怎么“调用外部能力”的</h2>
          <p>模型决定要做什么，Harness 让这个动作真正发生。</p>
          <ToolsFlowSummary />
          <ul className="tl-takeaways">
            <li>Tool 是外部能力，Tool Schema 是使用说明书。</li>
            <li>Tool Call 是本次请求；Function Calling 是生成请求的机制。</li>
            <li>Harness 验证并执行请求，调用真正的 Tool。</li>
            <li>Tool Result 重新进入 Context，Model 才能继续处理。</li>
          </ul>
          <div className="so-complete-actions">
            <Link className="button button-primary" to="/learn">
              查看学习地图 <ArrowRight size={17} />
            </Link>
            <Link className="button button-secondary" to="/lesson/agent-loop">
              查看下一站 · Agent Loop <ArrowRight size={17} />
            </Link>
          </div>
          <p className="tl-caption">05 Agent Loop 已解锁。由你决定何时继续。</p>
        </section>
      )}
      <div className="lesson-bottom so-bottom">
        <nav className="lesson-pagination" aria-label="章节导航">
          <Link className="text-link" to="/lesson/model-inside">
            <ArrowLeft size={16} />
            上一节 · Model Inside
          </Link>
          {completed ? (
            <Link className="text-link" to="/lesson/agent-loop">
              下一站 · Agent Loop <ArrowRight size={16} />
            </Link>
          ) : (
            <span className="next-lesson-locked">
              下一站 · Agent Loop<span>完成本章后解锁</span>
            </span>
          )}
        </nav>
        <ProgressIndicator value={overallProgress} compact />
      </div>
    </div>
  )
}

