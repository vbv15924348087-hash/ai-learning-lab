import { ArrowRight, MoveUpRight, Network, Scan, Waypoints } from 'lucide-react'
import { Link } from 'react-router-dom'
import { VisualizationContainer } from '../../components/visualization/VisualizationContainer'
import { useLearningStore } from '../../stores/learningStore'
import { usePageTitle } from '../../hooks/usePageTitle'

export function HomePage() {
  usePageTitle('从直觉开始，理解 AI')
  const selectedNode = useLearningStore((state) => state.selectedNode)
  const setSelectedNode = useLearningStore((state) => state.setSelectedNode)
  return (
    <div className="home-page page-width">
      <section className="home-hero">
        <div className="hero-copy">
          <div className="eyebrow hero-eyebrow">
            <span className="short-line" />
            不止于使用，更进一步理解
          </div>
          <h1>
            你问了一句话。
            <br />
            AI 内部，
            <br />
            <span className="hero-heading-soft">发生了什么？</span>
          </h1>
          <p className="hero-description">
            从一次熟悉的对话出发，走进 AI 系统。
            <br className="desktop-break" />
            用交互建立直觉，让复杂的概念慢慢清晰。
          </p>
          <Link to="/learn" className="button button-primary hero-button">
            进入 AI 内部
            <ArrowRight size={19} />
          </Link>
          <p className="hero-footnote">
            <span className="tiny-cube" />
            无需技术背景<span className="footnote-separator">/</span>按你的节奏探索
          </p>
        </div>
        <div className="hero-visual">
          <VisualizationContainer
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
            compact
          />
          <p className="hero-visual-note">
            <span className="mono">FIG. 01</span>你看到的是一问一答，背后是一个协同工作的系统。
          </p>
        </div>
      </section>
      <section className="home-journey" aria-labelledby="journey-heading">
        <div className="journey-heading">
          <div>
            <p className="eyebrow">A PATH TO UNDERSTANDING</p>
            <h2 id="journey-heading">先看到全景，再理解细节。</h2>
          </div>
          <Link to="/learn" className="text-link">
            查看学习地图
            <MoveUpRight size={17} />
          </Link>
        </div>
        <div className="journey-steps">
          <JourneyStep
            number="01"
            Icon={Scan}
            title="看见系统"
            description="从输入到回答，认识一次对话里的关键角色。"
          />
          <JourneyStep
            number="02"
            Icon={Network}
            title="连接概念"
            description="把模型、工具和记忆，放回同一张地图。"
          />
          <JourneyStep
            number="03"
            Icon={Waypoints}
            title="理解协作"
            description="逐步理解 AI 如何行动，以及为什么需要检查。"
          />
        </div>
      </section>
    </div>
  )
}

function JourneyStep({
  number,
  Icon,
  title,
  description,
}: {
  number: string
  Icon: typeof Scan
  title: string
  description: string
}) {
  return (
    <article className="journey-step">
      <div className="journey-step-top">
        <Icon size={23} strokeWidth={1.5} />
        <span className="mono">{number}</span>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  )
}
