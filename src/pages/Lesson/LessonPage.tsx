import { useEffect } from 'react'
import { ArrowLeft, LockKeyhole } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { getLessonById } from '../../content/lessons'
import { LessonLayout } from '../../features/lesson/LessonLayout'
import { getProgress, useLearningStore } from '../../stores/learningStore'
import { usePageTitle } from '../../hooks/usePageTitle'
import { NotFoundPage } from '../NotFoundPage'
import { SystemOverviewLesson } from '../../features/system-overview/SystemOverviewLesson'
import { ContextLesson } from '../../features/context-lesson/ContextLesson'
import { ModelInsideLesson } from '../../features/model-inside/ModelInsideLesson'
import { ToolsLesson } from '../../features/tools-lesson/ToolsLesson'
import { ChapterRoute } from '../../features/curriculum/ChapterRoute'
import { lessons } from '../../content/lessons'

export function LessonPage() {
  const { lessonId } = useParams()
  const lesson = getLessonById(lessonId ?? '')
  const startLesson = useLearningStore((state) => state.startLesson)
  const completeLesson = useLearningStore((state) => state.completeLesson)
  const completed = useLearningStore((state) => state.completedLessonIds.includes(lessonId ?? ''))
  const unlocked = useLearningStore((state) => state.unlockedLessonIds.includes(lessonId ?? ''))
  const progress = useLearningStore(getProgress)
  const selectedNode = useLearningStore((state) => state.selectedNode)
  const setSelectedNode = useLearningStore((state) => state.setSelectedNode)
  usePageTitle(lesson?.title ?? '课程未找到')

  useEffect(() => {
    if (lesson?.published && unlocked) startLesson(lesson.id)
  }, [lesson, startLesson, unlocked])

  if (!lesson) return <NotFoundPage />
  if (!lesson.published || !unlocked)
    return (
      <div className="empty-page page-width">
        <LockKeyhole size={30} />
        <p className="eyebrow">CHAPTER {String(lesson.order).padStart(2, '0')}</p>
        <h1>{lesson.title}</h1>
        <p>
          请先完成上一章「{lessons.find((item) => item.order === lesson.order - 1)?.title}
          」的互动和挑战，再来学习这一站。
        </p>
        <p>{lesson.learningGoal}</p>
        <Link
          className="button button-secondary"
          to={`/lesson/${lessons.find((item) => item.order === lesson.order - 1)?.id ?? 'tools'}`}
        >
          前往上一章
        </Link>
        <Link className="button button-primary" to="/learn">
          <ArrowLeft size={17} />
          返回学习地图
        </Link>
      </div>
    )

  if (lesson.id === 'system-overview') return <SystemOverviewLesson lesson={lesson} />
  if (lesson.id === 'context') return <ContextLesson lesson={lesson} />
  if (lesson.id === 'model-inside') return <ModelInsideLesson lesson={lesson} />
  if (lesson.id === 'tools') return <ToolsLesson lesson={lesson} />
  if (lesson.visualization === 'curriculum') return <ChapterRoute id={lesson.id} />

  return (
    <LessonLayout
      lesson={lesson}
      completed={completed}
      progress={progress}
      selectedNode={selectedNode}
      onSelectNode={setSelectedNode}
      onComplete={() => completeLesson(lesson.id)}
    />
  )
}
