import type { ChapterDefinition } from '../curriculum/types'

export const chapter: ChapterDefinition = {
  id: 'guardrail',
  phase: 14,
  title: 'Guardrail / Human in the Loop',
  heading: '能做这件事，就应该直接做吗？',
  subtitle: '在高风险动作执行之前，给系统一个真正有效的停止点。',
  minutes: 7,
  connection: '上一章验证成果是否正确。本章把关动作是否被允许，尤其是执行之前的高风险操作。',
  goal: '能区分工具调用请求、权限检查与人工批准，并识别输入、工具和输出的检查位置。',
  steps: [
    {
      id: 'request',
      title: '出现一个删除数据库的请求',
      beginnerExplanation:
        '为了整理研究数据，Agent 提议调用 delete_database()。这时产生的只是请求，数据库还没有被删除。运行系统必须先判断它能不能做。',
      whyItMatters: '有工具能力，不代表任何场景下都拥有执行权限。',
      technicalExplanation:
        'Tool Call 由模型生成，执行由 Harness 的工具运行层负责。风险分类、参数检查、权限与审批应在执行边界实施，不能只依赖模型自觉遵守。',
      interactionHint: '点击“把请求送去风险检查”，观察执行前的拦截点。',
      terms: [],
    },
    {
      id: 'approval',
      title: '高风险动作，交给人判断',
      beginnerExplanation:
        '系统识别出不可轻易撤回的删除操作，暂停并展示目标、影响和替代方案。由你选择批准或拒绝；两种决定都是有效的人类干预。',
      whyItMatters: '人应该知道自己具体批准了什么，拒绝后系统也应该有明确的下一步。',
      technicalExplanation:
        '审批需要绑定具体动作、目标和参数，并在执行时再次检查权限与有效期。批准不保证操作成功，也不替代结果验证。本页所有批准与拒绝仅改变教学状态，不会连接或删除任何数据库。',
      interactionHint: '先运行风险检查，再手动选择 Approve 或 Reject；本页仅进行安全教学模拟。',
      terms: ['guardrail', 'permission', 'approval', 'human-in-the-loop'],
    },
    {
      id: 'layers',
      title: '三道检查，守在不同位置',
      beginnerExplanation:
        '开始前检查输入；执行前检查工具与参数；交付前检查输出。它们解决不同问题，比如不合适的输入、越权动作、泄露信息的回答。',
      whyItMatters: '只检查最终回答，无法撤销已经发生的危险工具操作。',
      technicalExplanation:
        'Input Guardrail 检查进入系统的请求与内容，Tool Guardrail 检查外部操作，Output Guardrail 检查最终输出。它们通常结合规则、分类器、权限策略和人工流程，并不能保证覆盖所有风险。',
      interactionHint: '依次点开输入、工具、输出三个检查位置。',
      terms: ['input-guardrail', 'tool-guardrail', 'output-guardrail'],
    },
    {
      id: 'system',
      title: '在允许的范围里持续工作',
      beginnerExplanation:
        '低风险、已授权的动作可以继续执行；需要审批的动作暂停等待；被拒绝后可以调整计划或结束这个动作。自主性始终受目标与权限约束。',
      whyItMatters: '安全控制和成果验证相互补充：允许做，不等于已经做对。',
      technicalExplanation:
        '审批结果应写入可追踪的状态，工具执行后仍应记录结果并按任务要求验证。拒绝某个动作不一定等于整个任务失败，可以考虑只读导出等已授权替代方案。',
      interactionHint: '选择拒绝后的合理后续行动，完成这次安全闭环。',
      terms: [],
    },
  ],
  terms: [
    {
      id: 'guardrail',
      name: 'Guardrail',
      label: '检查与限制机制',
      definition: '对输入、动作、工具调用或输出进行限制和检查的控制机制。',
    },
    {
      id: 'permission',
      name: 'Permission',
      label: '可执行范围',
      definition: '系统允许某个身份在给定条件下访问资源或执行操作的授权范围。',
    },
    {
      id: 'approval',
      name: 'Approval',
      label: '对具体动作的批准',
      definition: '在执行前针对明确动作、目标和影响作出的许可决定，不等于授予无限权限。',
    },
    {
      id: 'human-in-the-loop',
      name: 'Human in the Loop',
      label: '关键节点由人参与',
      definition: '在关键或高风险节点引入人工判断、批准或干预。',
    },
    {
      id: 'input-guardrail',
      name: 'Input Guardrail',
      label: '输入检查',
      definition: '在处理输入前检查请求或内容是否符合系统策略与允许范围的机制。',
    },
    {
      id: 'tool-guardrail',
      name: 'Tool Guardrail',
      label: '工具执行前检查',
      definition: '在外部动作发生前检查工具、参数、目标、风险与权限的机制。',
    },
    {
      id: 'output-guardrail',
      name: 'Output Guardrail',
      label: '输出检查',
      definition: '在结果交付前检查回答或产物是否符合内容、隐私与安全规则的机制。',
    },
  ],
  misconceptions: [
    {
      wrong: 'Agent 能自主决定行动，所以可以无限制操作。',
      correct: '自主决策只在给定的目标、预算、权限和安全策略内进行。',
    },
    {
      wrong: '点击 Approve 后，模型就已经把数据库删掉了。',
      correct: '批准是一个许可决定。真实系统还需由运行层执行并检查结果；本页根本不会发起真实删除。',
    },
    {
      wrong: '只要最终输出检查通过，工具动作就一定安全。',
      correct: '高风险工具动作需要执行前检查；事后检查回答不能撤销已发生的删除。',
    },
  ],
  challenge: [
    {
      id: 'pause',
      prompt: 'Agent 生成 delete_database() 请求，但没有明确删除授权。系统下一步应做什么？',
      answer: 'pause',
      options: [
        {
          id: 'run',
          label: '先执行，再问用户是否同意',
          explanation: '不可逆操作发生后再询问，已经失去了有效拦截的机会。',
        },
        {
          id: 'pause',
          label: '在执行前拦截，检查权限、目标与风险，必要时请求人工批准',
          explanation: '审批必须发生在真正的执行边界之前。',
        },
      ],
    },
    {
      id: 'reject',
      prompt: '用户拒绝删除数据库。Agent 应怎样继续？',
      answer: 'respect',
      options: [
        {
          id: 'retry',
          label: '换个工具偷偷实现同样的删除',
          explanation: '更换工具不改变用户拒绝的范围，不能绕过决定。',
        },
        {
          id: 'respect',
          label: '停止删除，考虑权限内的只读分析或说明限制',
          explanation: '尊重拒绝，并在目标与权限范围内重新计划。',
        },
      ],
    },
    {
      id: 'verification',
      prompt: '用户已批准一个文件写入动作，这是否说明产物内容正确？',
      answer: 'verify',
      options: [
        {
          id: 'yes',
          label: '是，批准已经替代了验证',
          explanation: '授权判断能不能做；验证判断成果是否满足要求。',
        },
        {
          id: 'verify',
          label: '否，执行后还要检查产物是否满足完成条件',
          explanation: 'Guardrail 与 Verification 在不同位置解决不同问题。',
        },
      ],
    },
  ],
  takeaway: 'Tool Call 是请求。先检查风险与权限，必要时人工批准，再由运行系统执行并验证。',
}
