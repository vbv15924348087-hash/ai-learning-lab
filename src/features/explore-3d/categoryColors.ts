import type { CSSProperties } from 'react'
import type { ExploreCategory } from './types'

export type CategoryPalette = {
  accent: string
  body: string
  light: string
  dark: string
  surface: string
}

/** Module ownership has one color across geometry, labels, navigation, and legends. */
export const categoryColors: Record<ExploreCategory, CategoryPalette> = {
  input: {
    accent: '#df674b',
    body: '#ec8b6f',
    light: '#f7c6b5',
    dark: '#9b3825',
    surface: '#fff2ec',
  },
  context: {
    accent: '#1595a3',
    body: '#43b9c2',
    light: '#a4e0e3',
    dark: '#07636e',
    surface: '#ecfafb',
  },
  model: {
    accent: '#5265d8',
    body: '#8090ed',
    light: '#c3ccfa',
    dark: '#3443a0',
    surface: '#f0f2ff',
  },
  harness: {
    accent: '#c88a1e',
    body: '#e9b452',
    light: '#f5d997',
    dark: '#835607',
    surface: '#fff8e8',
  },
  external: {
    accent: '#9853c5',
    body: '#bb8ce0',
    light: '#ddc5f1',
    dark: '#6b3192',
    surface: '#f8f0ff',
  },
  verification: {
    accent: '#4d974a',
    body: '#85c47c',
    light: '#c4e6b9',
    dark: '#326c2d',
    surface: '#f0f9ec',
  },
}

export function categoryColorStyle(category: ExploreCategory): CSSProperties {
  const palette = categoryColors[category]
  return {
    '--module-accent': palette.accent,
    '--module-light': palette.light,
    '--module-dark': palette.dark,
    '--module-surface': palette.surface,
  } as CSSProperties
}
