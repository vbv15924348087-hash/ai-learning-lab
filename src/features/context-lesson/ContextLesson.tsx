import { useRef } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CircleCheck,
  Clock3,
  MessageSquare,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Lesson } from '../../types/learning'
import { ProgressIndicator } from '../../components/learning/ProgressIndicator'
import { MisconceptionCard } from '../../components/learning/MisconceptionCard'
import { getProgress, useLearningStore } from '../../stores/learningStore'
import { LessonControls } from '../system-overview/components/LessonControls'
import { NVIDIA_QUESTION } from '../system-overview/data/systemOverviewSteps'
import { useContextLesson } from './hooks/useContextLesson'
import { contextLessonSteps, contextMisconceptions } from './data/contextLessonSteps'
import { ContextWorkspace } from './components/ContextWorkspace'
import { ContextExplanation } from './components/ContextExplanation'
import { ContextTerminology } from './components/ContextTerminology'
import { ContextEngineeringChallenge } from './components/ContextEngineeringChallenge'
import { ContextMiniChallenge } from './components/ContextMiniChallenge'
import '../system-overview/system-overview.css'
import './context-lesson.css'

const sections = ['展开工作台', '追踪信息来源', '理解容量与取舍', '亲手整理资料']
const sectionIndices = { discover: 0, sources: 1, capacity: 2, practice: 3 }
const practiceStep = contextLessonSteps.findIndex((step) => step.gate === 'engineering')

export function ContextLesson({ lesson }: { lesson: Lesson }) {
  const learning = useContextLesson()
  const overallProgress = useLearningStore(getProgress)
  const completed = useLearningStore((state) => state.completedLessonIds.includes('context'))
  const studioRef = useRef<HTMLElement>(null)
  const sectionIndex = sectionIndices[learning.step.section]
  const finishedFlow = learning.furthestStep === contextLessonSteps.length - 1

  function moveAndShow(action: () => void) {
    action()
    window.requestAnimationFrame(() => {
      const studio = studioRef.current
      if (studio && (studio.getBoundingClientRect().top < 0 || window.innerWidth <= 850)) {
        studio.scrollIntoView?.({ block: 'start', behavior: 'instant' })
      }
    })
  }

  return (
    <div className="lesson-page page-width so-lesson ctx-lesson">
      <nav className="lesson-breadcrumb" aria-label="面包屑">
        <Link to="/learn">
          <ArrowLeft size={15} />
          学习地图
        </Link>
        <span>/</span>
        <span>02 · Context</span>
      </nav>
      <header className="lesson-heading so-heading ctx-heading">
        <div>
          <p className="eyebrow">
            CHAPTER 02 / 15 <span className="so-header-dot">·</span> 看见模型的工作台
          </p>
          <h1>
            Context<span>模型这一刻，看见了什么？</span>
          </h1>
          <p>从一句提问，展开回答之前的全部工作资料。</p>
        </div>
        <div className="so-lesson-meta">
          <span className="reading-time">
            <Clock3 size={15} />约 {lesson.minutes} 分钟
          </span>
          <span>
            <BookOpen size={15} />4 个核心概念
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
        <p>能讲清信息从哪里来、为什么要取舍，以及模型这一次真正看到了什么。</p>
      </div>
      <section className="so-studio ctx-studio" aria-label="交互式 Context 课程" ref={studioRef}>
        <div className="so-chapter-strip">
          <ol aria-label="本章学习路径">
            {sections.map((title, index) => (
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
            <span> / {contextLessonSteps.length}</span>
          </span>
        </div>
        <div
          className="so-progress-track"
          role="progressbar"
          aria-label="本章教学步骤"
          aria-valuemin={0}
          aria-valuemax={contextLessonSteps.length}
          aria-valuenow={learning.currentStep + 1}
        >
          <span
            style={{ width: `${((learning.currentStep + 1) / contextLessonSteps.length) * 100}%` }}
          />
        </div>
        <div className="so-case">
          <span className="so-case-icon">
            <MessageSquare size={18} strokeWidth={1.6} />
          </span>
          <div>
            <span>继续上一章的同一个问题</span>
            <p>{NVIDIA_QUESTION}</p>
          </div>
          <span className="so-case-tag">把回答前的那一刻，展开</span>
        </div>
        <div className="so-workspace ctx-workspace-layout">
          <div className="so-visual-column">
            <ContextWorkspace
              step={learning.step}
              selectedSource={learning.selectedSource}
              onSelectSource={learning.selectSource}
              noisy={learning.noisy}
              onSetNoisy={learning.setNoisy}
            />
          </div>
          <ContextExplanation
            step={learning.step}
            selectedSource={learning.selectedSource}
            predictionChoice={learning.predictionChoice}
            onChoose={learning.choosePrediction}
            onClearSource={() => learning.selectSource(null)}
            engineeringPassed={learning.engineeringPassed}
          />
        </div>
        <LessonControls
          currentStep={learning.currentStep}
          totalSteps={contextLessonSteps.length}
          demoStartStep={null}
          playing={learning.playing}
          blocked={learning.gateBlocked}
          lastStep={learning.lastStep}
          onPrevious={() => moveAndShow(learning.previous)}
          onNext={() => moveAndShow(learning.next)}
          onToggle={learning.togglePlayback}
          onRestart={() => moveAndShow(learning.restart)}
        />
      </section>
      <div
        className="ctx-learning-sections"
        onFocusCapture={learning.pause}
        onPointerDownCapture={learning.pause}
      >
        <div className="ctx-terms-slot">
          <ContextTerminology unlockedTerms={learning.unlockedTerms} />
        </div>
        <div id="context-engineering-practice" className="ctx-practice-slot">
          <ContextEngineeringChallenge
            available={learning.furthestStep >= practiceStep}
            passed={learning.engineeringPassed}
            onPass={learning.passEngineering}
          />
          {learning.currentStep === practiceStep && learning.engineeringPassed && (
            <div className="ctx-return-to-flow">
              <p>工作台整理好了。回到课程，为刚才的操作认识一个新名字。</p>
              <button className="button button-primary" onClick={() => moveAndShow(learning.next)}>
                继续看关系总结
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
      {learning.furthestStep >= 14 && (
        <section
          className="misconceptions ctx-misconceptions"
          aria-labelledby="ctx-misconceptions-title"
        >
          <div className="subsection-heading">
            <p className="eyebrow">KEEP THE RELATIONSHIPS CLEAR</p>
            <h2 id="ctx-misconceptions-title">你可能会误解</h2>
          </div>
          <div className="misconception-grid">
            {contextMisconceptions.map((item) => (
              <MisconceptionCard key={item.wrong} {...item} />
            ))}
          </div>
        </section>
      )}
      <div
        id="mini-challenge"
        className="so-challenge-anchor"
        onFocusCapture={learning.pause}
        onPointerDownCapture={learning.pause}
      >
        <ContextMiniChallenge
          available={finishedFlow && learning.engineeringPassed}
          passed={learning.challengePassed}
          onPass={learning.passChallenge}
        />
      </div>
      {completed && (
        <section className="so-complete ctx-complete" aria-label="章节学习完成" role="status">
          <span className="so-complete-icon">
            <CircleCheck size={28} />
          </span>
          <p className="eyebrow">YOU CAN SEE WHAT THE MODEL SEES</p>
          <h2>你已经理解模型“这一刻看见了什么”</h2>
          <p>四个概念，现在成为一张完整的关系图。</p>
          <div
            className="ctx-complete-relationship"
            aria-label="信息来源进入 Context，再交给 Model"
          >
            <div>
              <span>Prompt</span>
              <span>Memory 取出的信息</span>
              <span>RAG 找回的资料</span>
              <span>Tool Result</span>
            </div>
            <span aria-hidden="true">↓</span>
            <strong>Context · 当前工作台</strong>
            <span aria-hidden="true">↓</span>
            <strong>Model · 模型</strong>
          </div>
          <ul className="ctx-takeaways">
            <li>Prompt 是 Context 的一部分</li>
            <li>Memory / RAG 为 Context 提供信息</li>
            <li>Context Window 有容量边界</li>
            <li>Context Engineering 决定模型应该看到什么</li>
          </ul>
          <div className="so-complete-actions">
            <Link className="button button-primary" to="/lesson/model-inside">
              进入模型内部
              <ArrowRight size={17} />
            </Link>
            <Link className="button button-secondary" to="/learn">
              查看学习地图
              <ArrowRight size={17} />
            </Link>
          </div>
          <p className="ctx-next-note">
            下一站 Model Inside 的入口已解锁。按自己的节奏，准备好后再出发。
          </p>
        </section>
      )}
      <div className="lesson-bottom so-bottom">
        <nav className="lesson-pagination" aria-label="章节导航">
          <Link className="text-link" to="/lesson/system-overview">
            <ArrowLeft size={16} />
            上一节 · AI 系统全景
          </Link>
          {completed ? (
            <Link className="text-link" to="/lesson/model-inside">
              下一节 · Model Inside
              <ArrowRight size={16} />
            </Link>
          ) : (
            <span className="next-lesson-locked">
              下一节 · Model Inside<span>完成本章后解锁</span>
            </span>
          )}
        </nav>
        <ProgressIndicator value={overallProgress} compact />
      </div>
    </div>
  )
}

