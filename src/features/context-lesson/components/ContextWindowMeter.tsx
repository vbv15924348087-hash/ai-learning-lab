export function ContextWindowMeter({ load }: { load: number }) {
  const safeLoad = Math.max(0, Math.min(100, load))
  const nearLimit = safeLoad >= 90
  const description = nearLimit
    ? '接近本次容量边界'
    : safeLoad >= 60
      ? '加入更多资料，已用容量增加'
      : '当前还有较多可用空间'

  return (
    <div className={`ctx-window-meter${nearLimit ? ' is-near-limit' : ''}`}>
      <div className="ctx-meter-heading">
        <span>本次信息容量</span>
        <strong>
          {safeLoad}
          <small>%</small>
        </strong>
      </div>
      <div
        className="ctx-meter-track"
        role="progressbar"
        aria-label="当前 Context 已用容量（教学示意）"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safeLoad}
        aria-valuetext={`${safeLoad}%，${description}；教学示意，非真实模型测量`}
      >
        <span style={{ width: `${safeLoad}%` }} />
      </div>
      <div className="ctx-meter-scale" aria-hidden="true">
        <span>0%</span>
        <span>100%</span>
      </div>
      <p>{description}</p>
      <small>比例仅作容量示意，并非真实模型的测量值。</small>
    </div>
  )
}
