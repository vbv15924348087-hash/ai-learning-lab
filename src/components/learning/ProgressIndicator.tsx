export function ProgressIndicator({
  value,
  compact = false,
}: {
  value: number
  compact?: boolean
}) {
  const normalized = Math.max(0, Math.min(100, value))
  return (
    <div className={`progress-indicator${compact ? ' is-compact' : ''}`}>
      <div className="progress-label">
        <span>学习进度</span>
        <span className="mono">{Math.round(normalized)}%</span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="全部章节学习进度"
        aria-valuenow={Math.round(normalized)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${normalized}%` }} />
      </div>
    </div>
  )
}
