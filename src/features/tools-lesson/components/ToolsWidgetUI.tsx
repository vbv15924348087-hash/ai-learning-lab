import {
  ArrowRight,
  Check,
  Code2,
  Database,
  FileText,
  Globe2,
  Info,
  Monitor,
  MousePointer2,
  Plug,
} from 'lucide-react'
import type { ReactNode } from 'react'
import type { TeachingTool, TeachingToolId } from '../data/toolDefinitions'

const toolIcons = {
  web_search: Globe2,
  read_file: FileText,
  run_code: Code2,
  database: Database,
  browser: Monitor,
  api: Plug,
}

export function ToolCard({
  tool,
  selected,
  onSelect,
  pulse = false,
  compact = false,
  disabled = false,
}: {
  tool: TeachingTool
  selected: boolean
  onSelect: (id: TeachingToolId) => void
  pulse?: boolean
  compact?: boolean
  disabled?: boolean
}) {
  const Icon = toolIcons[tool.id]
  return (
    <button
      type="button"
      className={`tl-tool-card${pulse ? ' tl-tool-card-pulse' : ''}${compact ? ' tl-tool-card-compact' : ''}`}
      aria-pressed={selected}
      aria-label={`选择 ${tool.name}`}
      onClick={() => onSelect(tool.id)}
      disabled={disabled}
    >
      <span className="tl-tool-card-top">
        <span className="tl-tool-icon">
          <Icon size={20} aria-hidden="true" />
        </span>
        <span className="tl-tool-radio" aria-hidden="true">
          {selected && <Check size={11} />}
        </span>
      </span>
      <strong>{tool.name}</strong>
      <span className="tl-tool-description">{tool.description}</span>
      <span className="tl-tool-cta">
        {selected ? '已选择' : '点击选择'} <ArrowRight size={12} aria-hidden="true" />
      </span>
    </button>
  )
}

export function ToolWidgetHeader({
  label,
  title,
  children,
}: {
  label: string
  title: string
  children?: ReactNode
}) {
  return (
    <div className="tl-widget-header">
      <div className="tl-widget-label">
        <span>{label}</span>
        <span>教学模拟</span>
      </div>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
    </div>
  )
}

export function ToolInteractionHint({ children }: { children: ReactNode }) {
  return (
    <p className="tl-widget-hint">
      <MousePointer2 size={14} aria-hidden="true" />
      {children}
    </p>
  )
}

export function ToolFeedback({ success, children }: { success: boolean; children: ReactNode }) {
  const Icon = success ? Check : Info
  return (
    <div
      className={`tl-widget-feedback${success ? ' tl-widget-feedback-success' : ''}`}
      role="status"
    >
      <Icon size={17} aria-hidden="true" />
      <p>{children}</p>
    </div>
  )
}
