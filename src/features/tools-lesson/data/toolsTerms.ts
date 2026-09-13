import type { ToolTerm } from '../types'

export const toolsTerms: ToolTerm[] = [
  {
    id: 'tool',
    label: 'Tool',
    chinese: '外部工具',
    levels: [
      '模型可以请求使用的外部能力。',
      '系统向模型提供的可调用能力，帮助完成搜索、计算或读取文件等任务。',
      'Tool 可以连接搜索、代码、数据库、文件、浏览器和 API 等外部系统；模型只能选择系统提供的可用工具。',
    ],
  },
  {
    id: 'function-calling',
    label: 'Function Calling',
    chinese: '生成结构化调用请求',
    levels: [
      '模型用规范格式告诉系统“我要调用这个工具”。',
      '模型生成结构化 Tool Call 的机制，说明工具名称以及本次调用的参数。',
      '实际系统通常会根据 Tool Schema 约束参数结构。Function Calling 本身不等于工具已经执行。',
    ],
  },
  {
    id: 'tool-call',
    label: 'Tool Call',
    chinese: '本次工具调用请求',
    levels: [
      '模型这一次发出的具体工具请求。',
      '包含 Tool 名称和调用参数的结构化数据，例如 web_search 与本次 query。',
      'Tool Call 本身不等于实际执行；Harness 接收并执行它后，工具才开始完成动作。',
    ],
  },
  {
    id: 'tool-schema',
    label: 'Tool Schema',
    chinese: '工具使用说明书',
    levels: [
      'Tool 的使用说明书。',
      '定义 Tool 名称、用途和输入参数，包括每个参数需要什么类型的值。',
      '系统提前提供 Schema；模型根据它构造合法的 Tool Call。同一份 Schema 可以对应许多次具体调用。',
    ],
  },
  {
    id: 'tool-result',
    label: 'Tool Result',
    chinese: '工具返回结果',
    levels: [
      'Tool 做完事情后返回的结果。',
      'Harness 执行 Tool 后得到的输出，例如搜索返回的标题、来源与内容。',
      '结果通常作为新的 Context 再交给 Model 继续处理；工具输出通常还不是最终回答。',
    ],
  },
]
