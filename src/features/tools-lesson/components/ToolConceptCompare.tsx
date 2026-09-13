import { BookOpen, Braces, Globe2 } from 'lucide-react'

const concepts = [
  {
    label: 'Tool',
    title: '能力本身',
    Icon: Globe2,
    description: '真正能做事的外部能力。',
    example: 'Web Search',
    detail: '它能搜索互联网。',
  },
  {
    label: 'Tool Schema',
    title: '使用说明书',
    Icon: BookOpen,
    description: '提前说明名称、用途和参数格式。',
    example: 'web_search(query: string)',
    detail: '它告诉模型怎么用。',
  },
  {
    label: 'Tool Call',
    title: '这一次的请求',
    Icon: Braces,
    description: '模型这次选定的工具和具体参数。',
    example: '{ tool: "web_search",\n  query: "NVIDIA latest AI GPU" }',
    detail: '它告诉系统这次要做什么。',
  },
]

export function ToolConceptCompare() {
  return (
    <section className="tl-concept-compare" aria-label="Tool、Tool Schema 与 Tool Call 对比">
      <h4>三件东西，分工不同。</h4>
      <div className="tl-concept-grid">
        {concepts.map(({ label, title, Icon, description, example, detail }) => (
          <article key={label}>
            <div>
              <Icon size={17} aria-hidden="true" />
              <span>{label}</span>
            </div>
            <h5>{title}</h5>
            <p>{description}</p>
            <code>{example}</code>
            <small>{detail}</small>
          </article>
        ))}
      </div>
    </section>
  )
}
