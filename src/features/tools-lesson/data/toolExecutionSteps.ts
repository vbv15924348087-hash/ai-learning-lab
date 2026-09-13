export type ToolExecutionNode =
  'model-decision' | 'tool-call' | 'harness' | 'tool' | 'tool-result' | 'context' | 'model-answer'

export interface ToolExecutionStep {
  id: ToolExecutionNode
  label: string
  caption: string
  title: string
  explanation: string
  responsibility: string
  nextLabel: string
  packetLabel: string
}

export const toolExecutionSteps: readonly ToolExecutionStep[] = [
  {
    id: 'model-decision',
    label: 'Model',
    caption: '决定使用工具',
    title: '模型发现：需要最新信息',
    explanation: '“最新”不能只依赖已有知识。模型决定请求 Web Search，获取这次回答需要的资料。',
    responsibility: 'Model 负责判断需要什么能力。',
    nextLabel: '下一步：模型生成 Tool Call',
    packetLabel: '决定',
  },
  {
    id: 'tool-call',
    label: 'Tool Call',
    caption: '本次结构化请求',
    title: '模型把决定写成 Tool Call',
    explanation:
      '请求写明工具名称 web_search，以及参数 query: “NVIDIA latest AI GPU”。生成这个请求，就是 Function Calling。',
    responsibility: '此时只是生成请求，搜索尚未执行。',
    nextLabel: '下一步：把请求交给 Harness',
    packetLabel: '请求',
  },
  {
    id: 'harness',
    label: 'Harness',
    caption: '接收与验证',
    title: 'Harness 接收并检查请求',
    explanation: 'Harness 读取 Tool Call，确认请求的工具可用、参数符合说明书，再准备执行。',
    responsibility: 'Harness 负责把模型的请求接到实际工具。',
    nextLabel: '下一步：Harness 执行 Web Search',
    packetLabel: '请求',
  },
  {
    id: 'tool',
    label: 'Web Search',
    caption: '外部工具执行',
    title: 'Harness 调用 Web Search',
    explanation:
      '在真实系统中，Harness 会带着 query 调用搜索工具，工具才开始访问外部信息。这里用教学模拟展示这个动作。',
    responsibility: '真正发起执行的是 Harness；Model 没有自己上网。',
    nextLabel: '下一步：查看工具返回的结果',
    packetLabel: '参数',
  },
  {
    id: 'tool-result',
    label: 'Tool Result',
    caption: '工具返回资料',
    title: 'Web Search 返回 Tool Result',
    explanation:
      '搜索工具返回来源、标题与相关内容。Harness 接收这些资料，它们还需要交给模型继续处理。',
    responsibility: 'Tool Result 是工具输出，还不是最终回答。',
    nextLabel: '下一步：将 Tool Result 加入 Context',
    packetLabel: '结果',
  },
  {
    id: 'context',
    label: 'Context',
    caption: '加入本轮资料',
    title: 'Tool Result 进入 Context',
    explanation:
      '系统把工具结果加入模型这一次可见的资料中。还记得上一章吗？模型只能结合当前 Context 里的信息继续处理。',
    responsibility: '资料进入 Context，模型下一次处理时才能看到。',
    nextLabel: '下一步：Model 读取结果并回答',
    packetLabel: '资料',
  },
  {
    id: 'model-answer',
    label: 'Model',
    caption: '读取并组织回答',
    title: '模型带着新资料继续处理',
    explanation:
      '现在 Model 同时看见用户的问题与工具结果，理解这些资料，再组织成用户能读懂的回答。',
    responsibility: '模型负责理解与生成；Harness 负责工具执行。',
    nextLabel: '已看完：结果回到模型',
    packetLabel: '资料',
  },
]

export const TOOL_EXECUTION_INTERVAL = 2800
