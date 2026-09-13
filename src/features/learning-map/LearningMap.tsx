import { lessons } from '../../content/lessons'
import { getLessonStatus, useLearningStore } from '../../stores/learningStore'
import { LessonCard } from './LessonCard'

const stages = [
  { name: '看见系统', detail: '从一问一答，认识 AI 的基本组成。', start: 0, end: 3 },
  { name: '让 AI 行动', detail: '理解模型如何借助工具，完成多步任务。', start: 3, end: 6 },
  { name: '连接信息', detail: '让需要的知识，在合适的时候被找到。', start: 6, end: 10 },
  { name: '建立可靠性', detail: '协作、检查与边界，让系统更值得信任。', start: 10, end: 14 },
  {
    name: '拼回完整系统',
    detail: '自由探索节点、连接术语，用一次完整任务检验理解。',
    start: 14,
    end: 15,
  },
]

export function LearningMap() {
  const state = useLearningStore()
  return (
    <div className="learning-map">
      {stages.map((stage, index) => (
        <section className="map-stage" key={stage.name} aria-labelledby={`stage-${index}`}>
          <div className="stage-heading">
            <span className="stage-marker mono">{String(index + 1).padStart(2, '0')}</span>
            <div>
              <h2 id={`stage-${index}`}>{stage.name}</h2>
              <p>{stage.detail}</p>
            </div>
          </div>
          <div className={`stage-lessons${stage.end - stage.start === 4 ? ' four-lessons' : ''}`}>
            {lessons.slice(stage.start, stage.end).map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} status={getLessonStatus(lesson, state)} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
