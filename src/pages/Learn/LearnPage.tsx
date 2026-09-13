import { ArrowRight, Compass, Flag, Route } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProgressIndicator } from '../../components/learning/ProgressIndicator'
import { LearningMap } from '../../features/learning-map/LearningMap'
import { getProgress, getResumeLessonId, useLearningStore } from '../../stores/learningStore'
import { usePageTitle } from '../../hooks/usePageTitle'
import { lessons } from '../../content/lessons'

export function LearnPage() {
  usePageTitle('学习地图')
  const progress = useLearningStore(getProgress)
  const resumeId = useLearningStore(getResumeLessonId)
  const completedCount = useLearningStore((state) => state.completedLessonIds.length)
  const started = useLearningStore((state) => state.currentLessonId !== null)
  const allPublishedComplete = useLearningStore((state) =>
    lessons.every((lesson) => state.completedLessonIds.includes(lesson.id)),
  )
  return (
    <div className="learn-page page-width">
      <div className="learn-heading">
        <div>
          <p className="eyebrow">YOUR LEARNING JOURNEY</p>
          <h1>
            一张地图，<span className="heading-soft">读懂 AI。</span>
          </h1>
          <p className="page-intro">让零散的概念，连成一个系统。从第一站开始。</p>
        </div>
        <div className="map-progress">
          <ProgressIndicator value={progress} />
          <p>
            已完成 {completedCount} / {lessons.length} 个章节<span>进度自动保存在此浏览器</span>
          </p>
        </div>
      </div>
      <div className="learning-toolbar">
        <div className="mode-options" aria-label="学习模式">
          <span className="mode-option is-active">
            <Route size={17} />
            引导学习
          </span>
          <Link className="mode-option" to="/explore">
            <Compass size={17} />
            自由探索
          </Link>
          <Link className="mode-option" to="/lesson/final-system-map#chapter-challenge">
            <Flag size={17} />
            实践挑战
          </Link>
        </div>
        <span className="mode-description">一条循序渐进的理解路径</span>
      </div>
      <div className="map-start-banner">
        <div>
          <span className="map-start-label">
            {allPublishedComplete
              ? '全景与细节，已经连起来'
              : started
                ? '从上次停下的地方继续'
                : '你的起点'}
          </span>
          <p>
            {allPublishedComplete
              ? '全部章节已完成。你可以自由探索系统图、复盘完整任务，或重温任意章节。'
              : completedCount > 0
                ? '沿着地图继续，把信息、模型、行动和检查连成一个完整系统。'
                : '先用一节短课，看懂提问、模型与回答之间的关系。'}
          </p>
        </div>
        <Link className="button button-primary" to={`/lesson/${resumeId}`}>
          {allPublishedComplete ? '重温第一站' : started ? '继续学习' : '开始第一站'}
          <ArrowRight size={17} />
        </Link>
      </div>
      <LearningMap />
      <p className="map-endnote">
        全部 {lessons.length} 章已就绪。从 Agent Loop
        起，完成上一章的互动与挑战后解锁下一站，由你决定何时继续。
      </p>
    </div>
  )
}
