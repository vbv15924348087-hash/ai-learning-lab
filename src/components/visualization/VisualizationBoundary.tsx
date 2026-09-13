import { Component, type ReactNode } from 'react'

export class VisualizationBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed)
      return (
        <div
          className="scene-loading"
          role="img"
          aria-label="简化流程：你的提问，经过 AI 模型，生成回答"
        >
          <div className="scene-text-fallback">
            <span>你的提问</span>
            <span aria-hidden="true">→</span>
            <strong>AI 模型</strong>
            <span aria-hidden="true">→</span>
            <span>生成回答</span>
          </div>
          <p>当前使用简化视图，下方仍可选择各个环节。</p>
        </div>
      )
    return this.props.children
  }
}
