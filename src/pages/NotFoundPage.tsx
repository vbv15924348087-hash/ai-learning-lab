import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

export function NotFoundPage() {
  usePageTitle('页面未找到')
  return (
    <div className="empty-page page-width">
      <p className="eyebrow">404 / 路径暂时走偏了</p>
      <h1>这里还没有内容。</h1>
      <p>回到学习地图，找到下一站。</p>
      <Link className="button button-primary" to="/learn">
        <ArrowLeft size={17} />
        返回学习地图
      </Link>
    </div>
  )
}
