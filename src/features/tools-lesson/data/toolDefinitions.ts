export type TeachingToolId =
  'web_search' | 'read_file' | 'run_code' | 'database' | 'browser' | 'api'

export type TeachingTool = {
  id: TeachingToolId
  name: string
  description: string
  selectionExplanation: string
}

export const toolDefinitions: TeachingTool[] = [
  {
    id: 'web_search',
    name: 'Web Search',
    description: '获取当前互联网信息。',
    selectionExplanation:
      '任务里的关键词是「最新」。Web Search 可以获取当前公开的信息，供模型继续核对和整理。',
  },
  {
    id: 'read_file',
    name: 'Read File',
    description: '阅读用户提供的文件。',
    selectionExplanation:
      'Read File 适合读取已有文档。现在没有提供文件，需要先用 Web Search 获取最新公开信息。',
  },
  {
    id: 'run_code',
    name: 'Run Code',
    description: '执行代码、计算或处理数据。',
    selectionExplanation:
      'Run Code 擅长计算和处理已有数据。要先找到最新 GPU 信息，这里更适合 Web Search。',
  },
  {
    id: 'database',
    name: 'Database',
    description: '查询结构化业务数据。',
    selectionExplanation:
      'Database 适合查询指定数据库。这个任务需要互联网最新公开资料，可以先选择 Web Search。',
  },
  {
    id: 'browser',
    name: 'Browser',
    description: '在网页界面中执行操作。',
    selectionExplanation:
      'Browser 可以打开和操作网页。这里只需查找公开的最新信息，Web Search 是更直接的选择。',
  },
  {
    id: 'api',
    name: 'API',
    description: '调用外部服务能力。',
    selectionExplanation:
      'API 需要有相应的外部服务。这里没有指定 GPU 查询服务，先用 Web Search 查找公开信息更合适。',
  },
]

export const builderToolDefinitions = [
  {
    toolId: 'web_search',
    parameter: 'query',
    parameterLabel: '搜索关键词',
    placeholder: '输入你想搜索的内容',
    example: 'NVIDIA latest AI GPU',
    explanation: 'query 告诉搜索工具：这次要查什么。',
    mismatch: '',
  },
  {
    toolId: 'run_code',
    parameter: 'code',
    parameterLabel: '代码内容',
    placeholder: '输入代码文本（仅用于生成教学请求）',
    example: 'print(18923 * 78122)',
    explanation: 'code 告诉代码工具：这次要运行什么代码。',
    mismatch: '这份请求让工具执行代码。当前任务是查最新 GPU 信息，请选择 Web Search。',
  },
  {
    toolId: 'read_file',
    parameter: 'file_id',
    parameterLabel: '文件标识',
    placeholder: '输入系统提供的文件标识',
    example: 'uploaded_document.pdf',
    explanation: 'file_id 告诉文件工具：这次要读取哪个文件。',
    mismatch:
      '这份请求让工具读取一个已有文件。当前任务没有提供文件，请选择 Web Search 查找最新资料。',
  },
] as const
