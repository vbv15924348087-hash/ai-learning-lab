export type FlowConnectionProps = {
  id: string
  path: string
  active: boolean
  markerId: string
  returning?: boolean
  animationKey: string
}

export function FlowConnection({
  id,
  path,
  active,
  markerId,
  returning,
  animationKey,
}: FlowConnectionProps) {
  return (
    <g
      className={`overview-flow-connection${active ? ' is-active' : ''}${returning ? ' is-returning' : ''}`}
      data-connection-id={id}
    >
      <path
        d={path}
        fill="none"
        markerEnd={`url(#${markerId}-${active ? 'active' : 'quiet'})`}
        vectorEffect="non-scaling-stroke"
      />
      {active && (
        <path
          key={animationKey}
          className="overview-flow-travel"
          d={path}
          fill="none"
          pathLength={100}
          vectorEffect="non-scaling-stroke"
        />
      )}
    </g>
  )
}
