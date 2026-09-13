import { useEffect } from 'react'
import { ArrowUpRight, Box } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { getResumeLessonId, useLearningStore } from '../../stores/learningStore'

export function AppLayout() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.getElementById('main-content')?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        跳至主要内容
      </a>
      <TopNavigation />
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer page-width">
        <Link to="/" className="footer-brand">
          Inside AI<span>让理解，发生在交互之间。</span>
        </Link>
        <span className="footer-note">从直觉开始 · 一步一步深入</span>
      </footer>
    </div>
  )
}

function TopNavigation() {
  const resumeId = useLearningStore(getResumeLessonId)
  const hasStarted = useLearningStore((state) => state.currentLessonId !== null)
  return (
    <header className="site-header">
      <div className="header-inner page-width">
        <Link to="/" className="brand" aria-label="Inside AI 首页">
          <span className="brand-mark">
            <Box size={23} strokeWidth={1.5} />
          </span>
          <span>
            Inside <strong>AI</strong>
            <span className="brand-divider" />
            <span className="brand-caption">AI 学习实验室</span>
          </span>
        </Link>
        <nav aria-label="主导航" className="main-nav">
          <NavLink to="/" end>
            首页
          </NavLink>
          <NavLink to="/learn">学习地图</NavLink>
          <NavLink to="/explore">系统探索</NavLink>
        </nav>
        <Link to={`/lesson/${resumeId}`} className="header-cta">
          {hasStarted ? '继续学习' : '开始学习'}
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </header>
  )
}
