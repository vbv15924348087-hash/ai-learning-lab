import { categoryLabels } from './data'
import { categoryColorStyle } from './categoryColors'
import type { ExploreCategory } from './types'

export function CategoryLegend() {
  return (
    <div className="ex3-color-key" role="group" aria-label="模块颜色图例">
      <span className="ex3-color-key-heading">模块颜色</span>
      {(Object.keys(categoryLabels) as ExploreCategory[]).map((category) => (
        <span key={category} className="ex3-color-key-item" style={categoryColorStyle(category)}>
          <span className="ex3-color-swatch" aria-hidden="true" />
          {categoryLabels[category]}
        </span>
      ))}
    </div>
  )
}
