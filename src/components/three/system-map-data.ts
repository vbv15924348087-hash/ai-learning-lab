import type { SystemNodeId } from '../../types/learning'
export type { SystemNodeId } from '../../types/learning'

export const SCENE_PALETTE = {
  surface: '#f8f9fb',
  surfaceEdge: '#d7dce5',
  model: '#252b36',
  modelEdge: '#5a6474',
  accent: '#3659df',
  connection: '#b8c2d4',
  shadow: '#36435f',
  light: '#ffffff',
  fillLight: '#d9e3ff',
  markOnDark: '#e9edfa',
  markOnLight: '#7e8aa0',
} as const

export const SYSTEM_NODES: {
  id: SystemNodeId
  label: string
  caption: string
  position: [number, number, number]
}[] = [
  { id: 'user', label: '你的输入', caption: 'USER', position: [-2.55, 0, 1.55] },
  { id: 'model', label: 'AI 模型', caption: 'MODEL', position: [0, 0, 0] },
  { id: 'answer', label: '生成回答', caption: 'ANSWER', position: [2.55, 0, -1.55] },
]
