import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ToolCallBuilder } from './ToolCallBuilder'
import { ToolCallInspector } from './ToolCallInspector'
import { ToolMatchingChallenge } from './ToolMatchingChallenge'
import { ToolSchemaPanel } from './ToolSchemaPanel'
import { ToolShelf } from './ToolShelf'

describe('Tools lesson interactive widgets', () => {
  it('explains tool choices and supports selecting the search tool by keyboard', async () => {
    const user = userEvent.setup()
    const complete = vi.fn()
    render(<ToolShelf onComplete={complete} />)
    expect(screen.getAllByRole('button', { name: /^选择 / })).toHaveLength(6)
    expect(complete).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: '选择 Read File' }))
    expect(screen.getByRole('status')).toHaveTextContent('适合读取已有文档')
    expect(complete).not.toHaveBeenCalled()
    const searchTool = screen.getByRole('button', { name: '选择 Web Search' })
    searchTool.focus()
    await user.keyboard('{Enter}')
    expect(searchTool).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('关键词是「最新」')
    expect(complete).toHaveBeenCalledTimes(1)
    await user.click(searchTool)
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('requires all three matching tasks and shows why each tool is appropriate', async () => {
    const user = userEvent.setup()
    const complete = vi.fn()
    render(<ToolMatchingChallenge onComplete={complete} />)
    await user.click(screen.getByRole('button', { name: '选择 Run Code' }))
    expect(screen.getByRole('status')).toHaveTextContent('哪个工具能获取当前互联网信息')
    expect(screen.queryByRole('button', { name: '下一题' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '选择 Web Search' }))
    expect(screen.getByRole('status')).toHaveTextContent('随后模型才能结合结果回答')
    await user.click(screen.getByRole('button', { name: '下一题' }))
    expect(screen.getByText('计算 18923 × 78122')).toBeVisible()
    await user.click(screen.getByRole('button', { name: '选择 Run Code' }))
    expect(screen.getByRole('status')).toHaveTextContent('精确计算题')
    await user.click(screen.getByRole('button', { name: '下一题' }))
    await user.click(screen.getByRole('button', { name: '选择 Read File' }))
    expect(screen.getByRole('status')).toHaveTextContent('基于原文总结')
    expect(complete).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: '完成工具匹配' }))
    expect(complete).toHaveBeenCalledTimes(1)
    expect(screen.getByText('三种任务，都找到了合适的工具。')).toBeVisible()
  })

  it('converts a decision into JSON and requires inspecting both fields to complete', async () => {
    const user = userEvent.setup()
    const complete = vi.fn()
    render(<ToolCallInspector onComplete={complete} />)
    expect(screen.getByText('“帮我搜索 NVIDIA 最新 AI GPU”')).toBeVisible()
    expect(screen.queryByLabelText('结构化 Tool Call')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '转换成 Tool Call' }))
    expect(screen.getByLabelText('结构化 Tool Call')).toHaveTextContent('NVIDIA latest AI GPU')
    expect(complete).not.toHaveBeenCalled()
    const toolField = screen.getByRole('button', { name: '查看 tool 字段含义' })
    toolField.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByText(/指定这一次要调用哪个 Tool/)).toBeVisible()
    expect(complete).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: '查看 query 字段含义' }))
    expect(screen.getByText(/指定传给 Tool 的参数/)).toBeVisible()
    expect(complete).toHaveBeenCalledTimes(1)
    expect(screen.getByText(/搜索还没有执行/)).toBeVisible()
    await user.click(toolField)
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('validates tool and empty parameters, then builds a real JSON representation of the input', async () => {
    const user = userEvent.setup()
    const complete = vi.fn()
    render(<ToolCallBuilder onComplete={complete} />)
    await user.click(screen.getByRole('button', { name: '生成 Tool Call' }))
    expect(screen.getByRole('alert')).toHaveTextContent('先选择一个工具')
    await user.click(screen.getByRole('button', { name: '选择 Web Search' }))
    const query = screen.getByRole('textbox', { name: '搜索关键词 query' })
    expect(query).toHaveValue('')
    await user.click(screen.getByRole('button', { name: '生成 Tool Call' }))
    expect(screen.getByRole('alert')).toHaveTextContent('请填写 搜索关键词（query）')
    expect(query).toHaveAttribute('aria-invalid', 'true')
    expect(complete).not.toHaveBeenCalled()
    fireEvent.change(query, { target: { value: 'NVIDIA "latest" AI GPU' } })
    await user.click(screen.getByRole('button', { name: '生成 Tool Call' }))
    const request = JSON.parse(screen.getByLabelText('生成的 Tool Call').textContent!)
    expect(request).toEqual({ tool: 'web_search', query: 'NVIDIA "latest" AI GPU' })
    expect(complete).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('status')).toHaveTextContent('亲手完成了一次 Function Calling')
    await user.click(screen.getByRole('button', { name: '生成 Tool Call' }))
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('allows code and file parameters but explains why those tools do not finish the search task', async () => {
    const user = userEvent.setup()
    const complete = vi.fn()
    render(<ToolCallBuilder onComplete={complete} />)
    for (const tool of [
      {
        name: 'Run Code',
        label: '代码内容 code',
        field: 'code',
        id: 'run_code',
        value: 'print(18923 * 78122)',
      },
      {
        name: 'Read File',
        label: '文件标识 file_id',
        field: 'file_id',
        id: 'read_file',
        value: 'uploaded_document.pdf',
      },
    ]) {
      await user.click(screen.getByRole('button', { name: `选择 ${tool.name}` }))
      expect(screen.getByRole('textbox', { name: tool.label })).toHaveValue('')
      await user.click(screen.getByRole('button', { name: '填入示例' }))
      await user.click(screen.getByRole('button', { name: '生成 Tool Call' }))
      expect(JSON.parse(screen.getByLabelText('生成的 Tool Call').textContent!)).toEqual({
        tool: tool.id,
        [tool.field]: tool.value,
      })
      expect(screen.getByRole('status')).toHaveTextContent('请选择 Web Search')
      expect(complete).not.toHaveBeenCalled()
    }
    await user.click(screen.getByRole('button', { name: '选择 Web Search' }))
    await user.click(screen.getByRole('button', { name: '填入示例' }))
    await user.click(screen.getByRole('button', { name: '生成 Tool Call' }))
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('reveals the schema explicitly and only completes after the learner confirms the distinction', async () => {
    const user = userEvent.setup()
    const complete = vi.fn()
    render(<ToolSchemaPanel onComplete={complete} />)
    const reveal = screen.getByRole('button', {
      name: '深入一点：为什么模型知道 Tool 需要哪些参数？ →',
    })
    expect(reveal).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('query: string')).not.toBeInTheDocument()
    await user.click(reveal)
    expect(reveal).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('query: string')).toBeVisible()
    expect(
      screen.getByRole('region', { name: 'Tool、Tool Schema 与 Tool Call 对比' }),
    ).toBeVisible()
    expect(complete).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: '我明白了：说明书与本次请求不同' }))
    expect(complete).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('status')).toHaveTextContent('Schema 说明怎么用')
    await user.click(reveal)
    await user.click(reveal)
    expect(complete).toHaveBeenCalledTimes(1)
  })
})
