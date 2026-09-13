import { usePageTitle } from '../../hooks/usePageTitle'
import { ExploreExperience } from '../../features/explore-3d/ExploreExperience'

export function ExplorePage() {
  usePageTitle('3D 系统探索')
  return <ExploreExperience />
}
