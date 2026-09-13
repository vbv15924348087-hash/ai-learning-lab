import { ArrowDown, BrainCircuit } from 'lucide-react'

export function ContextFlow({ label, animated = false }: { label: string; animated?: boolean }) {
  return (
    <div className={`ctx-flow${animated ? ' is-animated' : ''}`}>
      <span className="ctx-flow-line" aria-hidden="true">
        <ArrowDown size={19} strokeWidth={1.5} />
      </span>
      <span>{label}</span>
    </div>
  )
}

export function ContextModel({ question = false }: { question?: boolean }) {
  return (
    <div className="ctx-model">
      <span className="ctx-model-icon">
        <BrainCircuit size={23} strokeWidth={1.6} aria-hidden="true" />
      </span>
      <div>
        <strong>模型</strong>
        <span>{question ? '回答之前，它看到了什么？' : '根据这一次的资料理解和回答'}</span>
      </div>
      <span className="ctx-model-term">MODEL</span>
    </div>
  )
}
