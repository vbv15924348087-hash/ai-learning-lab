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
import { useRef } from 'react'
import type { Lesson } from '../../types/learning'
import { ProgressIndicator } from '../../components/learning/ProgressIndicator'
import { getProgress, useLearningStore } from '../../stores/learningStore'
import { useSystemOverviewLesson } from './hooks/useSystemOverviewLesson'
import { NVIDIA_QUESTION } from './data/systemOverviewSteps'
import { DEMO_START_STEP, OVERVIEW_STEP_COUNT } from './types'
import { SystemScene } from './components/SystemScene'
import { ExplanationPanel } from './components/ExplanationPanel'
import { LessonControls } from './components/LessonControls'
import { TerminologyUnlock } from './components/TerminologyUnlock'
import { MiniChallenge } from './components/MiniChallenge'
import './system-overview.css'

const chapters = ['从对话开始', '看见各个角色', '完整走一遍', '自己试试看']
const sectionIndices = { intuition: 0, discover: 1, demo: 2, explore: 3 }

export function SystemOverviewLesson({ lesson }: { lesson: Lesson }) {
  const visualRef = useRef<HTMLDivElement>(null)
  const learning = useSystemOverviewLesson()
  const overallProgress = useLearningStore(getProgress)
  const historicalCompletion = useLearningStore((state) => state.lessonCompleted)
  const sectionIndex = sectionIndices[learning.step.section]
  const finishedFlow = learning.furthestStep === OVERVIEW_STEP_COUNT - 1
  function moveAndShow(action: () => void) {
    action()
    window.requestAnimationFrame(() => {
      const visual = visualRef.current
      if (visual && (visual.getBoundingClientRect().top < 0 || window.innerWidth <= 850)) {
        visual.scrollIntoView?.({ block: 'start', behavior: 'instant' })
      }
    })
  }
  return (
    <div className="lesson-page page-width so-lesson">
      <nav className="lesson-breadcrumb" aria-label="面包屑">
        <Link to="/learn">
          <ArrowLeft size={15} />
          学习地图
        </Link>
        <span>/</span>
        <span>01 · AI 系统全景</span>
      </nav>
      <header className="lesson-heading so-heading">
        <div>
          <p className="eyebrow">
            CHAPTER 01 / 15 <span className="so-header-dot">·</span> 从这里认识 AI
          </p>
          <h1>{lesson.title}</h1>
          <p>一句提问之后，整个系统是怎样配合的？</p>
        </div>
        <div className="so-lesson-meta">
          <span className="reading-time">
            <Clock3 size={15} />约 {lesson.minutes} 分钟
          </span>
          <span>
            <BookOpen size={15} /> 5 个核心概念
          </span>
          {historicalCompletion && (
            <span className="completed-badge">
              <Check size={14} />
              已完成
            </span>
          )}
        </div>
      </header>
      <div className="so-goal">
        <span>这一站的目标</span>
        <p>能用自己的话，讲清 AI 怎样从收到问题，一步步找到资料并给出回答。</p>
      </div>
      <section className="so-studio" aria-label="交互式 AI 系统课程">
        <div className="so-chapter-strip">
          <ol aria-label="本章学习路径">
            {chapters.map((title, index) => (
              <li
                key={title}
                aria-current={sectionIndex === index ? 'step' : undefined}
                className={index < sectionIndex ? 'is-done' : ''}
              >
                <span>{index < sectionIndex ? <Check size={12} /> : `0${index + 1}`}</span>
                {title}
              </li>
            ))}
          </ol>
          <span className="so-lesson-position">
            {String(learning.currentStep + 1).padStart(2, '0')}
            <span> / {OVERVIEW_STEP_COUNT}</span>
          </span>
        </div>
        <div
          className="so-progress-track"
          role="progressbar"
          aria-label="本章教学步骤"
          aria-valuemin={0}
          aria-valuemax={OVERVIEW_STEP_COUNT}
          aria-valuenow={learning.currentStep + 1}
        >
          <span style={{ width: `${((learning.currentStep + 1) / OVERVIEW_STEP_COUNT) * 100}%` }} />
        </div>
        <div className="so-case">
          <span className="so-case-icon">
            <MessageSquare size={18} strokeWidth={1.6} />
          </span>
          <div>
            <span>贯穿本章的一个问题</span>
            <p>{NVIDIA_QUESTION}</p>
          </div>
          <span className="so-case-tag">同一个任务，一起拆开看</span>
        </div>
        <div className="so-workspace">
          <div className="so-visual-column" ref={visualRef}>
            <div className="so-visual-label">
              <span>
                <span className="so-status-dot" />
                {learning.lastStep
                  ? '探索系统全景'
                  : learning.currentStep >= DEMO_START_STEP
                    ? '跟着信息走一遍'
                    : '让过程慢慢展开'}
              </span>
              <span>教学模拟 · 无实时搜索</span>
            </div>
            <SystemScene
              step={learning.step}
              selectedNode={learning.selectedNode}
              onSelectNode={learning.selectNode}
              interactive={learning.lastStep}
            />
          </div>
          <ExplanationPanel
            step={learning.step}
            selectedNode={learning.selectedNode}
            predictionChoice={learning.predictionChoice}
            onChoose={learning.choosePrediction}
            onReveal={() => moveAndShow(learning.revealHarness)}
            onClearSelection={learning.clearSelection}
          />
        </div>
        <LessonControls
          currentStep={learning.currentStep}
          playing={learning.playing}
          blocked={learning.gateBlocked}
          lastStep={learning.lastStep}
          onPrevious={() => moveAndShow(learning.previous)}
          onNext={() => moveAndShow(learning.next)}
          onToggle={() => moveAndShow(learning.togglePlayback)}
          onRestart={() => moveAndShow(learning.restart)}
        />
      </section>
      <TerminologyUnlock unlockedTerms={learning.unlockedTerms} />
      <div id="mini-challenge" className="so-challenge-anchor">
        <MiniChallenge
          available={finishedFlow}
          passed={learning.challengePassed}
          onPass={learning.passChallenge}
        />
      </div>
      {learning.challengePassed && (
        <section className="so-complete" aria-label="章节学习完成" role="status">
          <span className="so-complete-icon">
            <CircleCheck size={28} />
          </span>
          <p className="eyebrow">YOU CAN READ THE SYSTEM NOW</p>
          <h2>你已经能读懂第一张 AI 系统架构图了</h2>
          <p>已掌握 5 个专业术语。现在，你看见的是整条过程。</p>
          <div className="so-completion-path" aria-label="完整流程">
            User → Context → Model → Harness → Tool → Result
            <br />
            <span>Result → Harness → Context → Model → Answer</span>
          </div>
          <p className="so-complete-takeaway">
            Context 是工作台。Model 判断下一步。Harness 让动作真正发生。
          </p>
          <div className="so-complete-actions">
            <Link className="button button-primary" to="/learn">
              查看学习地图 <ArrowRight size={17} />
            </Link>
            <button className="so-control-button" onClick={() => moveAndShow(learning.replayDemo)}>
              <RotateCcw size={16} />
              重看完整流程
            </button>
          </div>
        </section>
      )}
      <div className="lesson-bottom so-bottom">
        <nav className="lesson-pagination" aria-label="章节导航">
          <Link className="text-link" to="/learn">
            <ArrowLeft size={16} />
            返回学习地图
          </Link>
          <Link className="text-link" to="/lesson/context">
            下一节 · Context <ArrowRight size={16} />
          </Link>
        </nav>
        <ProgressIndicator value={overallProgress} compact />
      </div>
    </div>
  )
}

