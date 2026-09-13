import type { ChapterDefinition } from '../curriculum/types'

export const chapter: ChapterDefinition = {
  id: 'multi-agent',
  phase: 12,
  title: 'Multi-Agent',
  heading: '分工以后，谁来接着工作？',
  subtitle: '用任务分工、结果回传和控制权交接，理解多 Agent 协作。',
  minutes: 8,
  connection: '上一章区分了固定路线和动态决策。这一章把部分工作分配给各有职责的 Agent。',
  goal: '区分 Agent-as-Tool 与 Handoff，并解释职责分工和上下文隔离的作用。',
  steps: [
    {
      id: 'roles',
      title: '一个研究任务，需要几种专长',
      beginnerExplanation:
        '研究 GPU、读取网页、分析参数、生成报告，可以交给不同助手。每个助手只拿到完成自己任务需要的信息，结果再按约定汇合。',
      whyItMatters: '分工可以减少单个上下文中的杂音；协调、传递信息和检查结果也会产生额外成本。',
      technicalExplanation:
        'Multi-Agent 是多个 Agent 实例通过工具调用、消息或路由协作。它们可以使用同一个模型；职责和上下文不同，不要求底层模型不同。',
      interactionHint: '点击一位专长助手，查看它接到的具体任务。',
      terms: [],
    },
    {
      id: 'tool',
      title: '叫来一位助手，拿到结果后继续',
      beginnerExplanation:
        '总负责人请研究助手找官方资料。研究助手完成这个子任务后，把结果交回。接下来仍由总负责人决定怎么写报告。',
      whyItMatters: '总负责人保留整体任务与最终汇总职责，子任务可以在较小的上下文里完成。',
      technicalExplanation:
        'Agent-as-Tool 将一个子 Agent 封装成可调用能力。调用期间子 Agent 执行自己的循环，但外层流程等待结果后恢复。Manager/Supervisor 是常见协调角色，并非每个多 Agent 系统都必须具备。',
      interactionHint: '先点“委派研究任务”，再点“返回研究结果”，观察整体控制者。',
      terms: [
        'multi-agent',
        'manager-agent',
        'supervisor',
        'sub-agent',
        'agent-as-tool',
        'delegation',
      ],
    },
    {
      id: 'handoff',
      title: '把后续工作交给另一位助手',
      beginnerExplanation:
        '研究助手发现任务接下来需要专门的数据分析，于是把继续处理任务的控制权交给数据助手。数据助手现在负责下一步，而不是默认把一次工具结果退回。',
      whyItMatters: '交接改变后续任务由谁处理；传递哪些上下文必须明确。',
      technicalExplanation:
        'Handoff 把当前任务的后续控制权转交给另一个 Agent；后续是否再次交接或返回由系统策略决定，并非绝对不能返回。上下文可以被筛选、总结或显式共享，不会因为“多 Agent”就自动完全隔离。',
      interactionHint: '点击“交接给数据 Agent”，再让接手者完成下一项行动。',
      terms: ['handoff'],
    },
    {
      id: 'system',
      title: '分工不等于越多越好',
      beginnerExplanation:
        '一份简单答案可能用一个 Agent 就够了。复杂任务才可能受益于分工：每位助手知道自己的任务、能看到的信息，以及结果应该交给谁。',
      whyItMatters: '没有明确边界，多位助手也可能重复劳动、相互矛盾，或者遗漏关键证据。',
      technicalExplanation:
        '需要显式设计任务接口、预算、结果格式、上下文选择、取消和失败策略。Manager 负责协调并不意味着子 Agent 的结果可信，仍需要下一章的验证。',
      interactionHint: '选择“调用并返回”或“转交后续任务”，查看它在系统中的连接方式。',
      terms: [],
    },
  ],
  terms: [
    {
      id: 'multi-agent',
      name: 'Multi-Agent',
      label: '多 Agent 协作',
      definition: '多个具有各自职责和执行上下文的 Agent，通过约定的交互方式共同处理任务。',
    },
    {
      id: 'manager-agent',
      name: 'Manager Agent',
      label: '协调任务的 Agent',
      definition: '负责分派子任务、整合结果，并推进整体目标的 Agent 角色。',
    },
    {
      id: 'supervisor',
      name: 'Supervisor',
      label: '监督协调者',
      definition: '负责协调工作、检查执行状态并决定路由或后续行动的角色，可由 Agent 或程序承担。',
    },
    {
      id: 'sub-agent',
      name: 'Sub-agent',
      label: '接受子任务的助手',
      definition: '接收被委派任务、在自己的执行环境与上下文中工作的 Agent。',
    },
    {
      id: 'agent-as-tool',
      name: 'Agent-as-Tool',
      label: '把 Agent 当作可调用能力',
      definition: '调用另一个 Agent 执行子任务，得到结果后由调用方恢复外层任务。',
    },
    {
      id: 'handoff',
      name: 'Handoff',
      label: '控制权交接',
      definition: '将当前任务后续处理的控制权转交给另一个 Agent，并按策略传递所需上下文。',
    },
    {
      id: 'delegation',
      name: 'Delegation',
      label: '任务委派',
      definition: '将明确的子目标、边界及所需信息分配给其他执行者，并约定返回方式。',
    },
  ],
  misconceptions: [
    {
      wrong: 'Multi-Agent 就是同时开很多个模型，数量越多越好。',
      correct:
        '价值来自清晰的职责、上下文与协作设计；多个 Agent 可以用同一个模型，数量还会增加协调成本。',
    },
    {
      wrong: 'Handoff 与 Agent-as-Tool 都只是把工具结果返回原 Agent。',
      correct:
        'Agent-as-Tool 完成后调用方恢复工作；Handoff 则把后续处理权交给接手者，未来是否返回取决于策略。',
    },
    {
      wrong: '多个 Agent 默认能看到彼此的全部历史。',
      correct: '上下文的隔离与共享必须由系统设计。应明确传递任务、关键证据和状态，避免无关信息。',
    },
  ],
  challenge: [
    {
      id: 'return',
      prompt: '总负责人调用研究助手，等助手交回来源清单后，继续整合报告。这是哪种模式？',
      answer: 'tool',
      options: [
        {
          id: 'tool',
          label: 'Agent-as-Tool',
          explanation: '子任务结束后结果返回调用方，由调用方继续整体任务。',
        },
        {
          id: 'handoff',
          label: 'Handoff',
          explanation: '这里没有把后续任务的控制权持续转交给研究助手。',
        },
      ],
    },
    {
      id: 'handoff',
      prompt: '接待 Agent 将后续问题处理权转给数据 Agent。此刻由谁选择后续行动？',
      answer: 'data',
      options: [
        {
          id: 'manager',
          label: '接待 Agent 默认立即恢复处理',
          explanation: '这把控制权交接误当成了等待工具结果返回。',
        },
        {
          id: 'data',
          label: '接手的数据 Agent，依据收到的任务与上下文',
          explanation: 'Handoff 的关键变化是后续任务的处理者；之后是否再转交由策略决定。',
        },
      ],
    },
    {
      id: 'context',
      prompt: '把“核对 GPU 功耗参数”交给研究助手，应该给它什么？',
      answer: 'bounded',
      options: [
        {
          id: 'all',
          label: '默认复制全部聊天历史和所有无关文件',
          explanation: '全量复制会引入杂音，也不等于有效的上下文共享。',
        },
        {
          id: 'bounded',
          label: '明确目标、所需来源、限制与结果格式',
          explanation: '这能让子 Agent 在合适的上下文中独立完成有边界的工作。',
        },
      ],
    },
  ],
  takeaway: 'Agent-as-Tool：调用、执行、返回。Handoff：转交控制权，由接手者继续。',
}
