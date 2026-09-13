export const toolsMisconceptions = [
  {
    wrong: '模型自己会上网。',
    correct: '模型决定要使用搜索 Tool，Harness 才真正执行搜索。',
  },
  {
    wrong: 'Function Calling 就是 Tool 已经执行。',
    correct: 'Function Calling 只是生成结构化请求。请求交给 Harness 之后才会执行。',
  },
  {
    wrong: 'Tool Schema 和 Tool Call 是同一回事。',
    correct: 'Schema 是工具的使用说明书；Call 是模型这一次具体发出的请求。',
  },
  {
    wrong: 'Tool Result 就是最终答案。',
    correct: 'Tool Result 通常重新进入 Context，由 Model 根据这些信息继续生成回答。',
  },
  {
    wrong: '模型想调用什么 Tool 都可以。',
    correct: '模型只能从系统提供给它的可用 Tool 中选择。',
  },
]
