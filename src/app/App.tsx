import { Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { HomePage } from '../pages/Home/HomePage'
import { LearnPage } from '../pages/Learn/LearnPage'
import { LessonPage } from '../pages/Lesson/LessonPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { lazy, Suspense } from 'react'
const ExplorePage = lazy(() =>
  import('../pages/Explore/ExplorePage').then((module) => ({ default: module.ExplorePage })),
)

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="learn" element={<LearnPage />} />
        <Route path="lesson/:lessonId" element={<LessonPage />} />
        <Route
          path="explore"
          element={
            <Suspense
              fallback={
                <p className="page-width" role="status">
                  正在打开系统图…
                </p>
              }
            >
              <ExplorePage />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
