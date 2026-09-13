import type { ChapterDefinition } from '../curriculum/types'

export const chapter: ChapterDefinition = {
  id: 'verification',
  phase: 13,
  title: 'Verification / Eval',
  heading: '说“完成了”，就真的完成了吗？',
  subtitle: '让可检查的证据决定结束，而不是一句自信的回答。',
  minutes: 8,
  connection: '上一章把任务交给不同 Agent。本章检查它们交回的成果是否真的满足要求。',
  goal: '能区分模型自检、外部可检查条件与系统评估，并在验证失败后继续修复。',
  steps: [
    {
      id: 'problem',
      title: '报告写好了，但单位可能错了',
      beginnerExplanation:
        'Agent 说“GPU 功耗是 4 kW，报告已完成”。原始资料写的是 400 W。听起来完整的回答，也可能把单位换算错了。',
      whyItMatters: '如果直接接受“完成”的声明，错误会进入后续决策。',
      technicalExplanation:
        '自然语言中的完成声明不构成正确性证据。应该事先指定可检查的条件，例如单元测试、来源核验与需求检查。',
      interactionHint: '选择是否直接接受这份结果，再进入验证实验。',
      terms: [],
    },
    {
      id: 'loop',
      title: '失败以后，把错误带回循环',
      beginnerExplanation:
        '先生成代码，再运行检查。看到 FAIL 后读错误、修复、重跑；测试通过以后，还要核对报告是否满足原始需求。',
      whyItMatters: '测试告诉我们某个条件是否满足，错误信息告诉我们应该修改哪里。',
      technicalExplanation:
        '本演示在浏览器中对固定教学样例执行单位换算断言，不运行真实外部测试系统。真实系统应由 Harness 调用测试工具，将输出加入 Context，再由 Agent 修复；测试通过只覆盖被检查的条件。',
      interactionHint: '按右侧按钮推进：生成 → 测试 → 读错误 → 修复 → 再测试 → 检查需求 → 完成。',
      terms: ['verification', 'unit-test', 'completion-criteria'],
    },
    {
      id: 'eval',
      title: '检查一次结果，也评估一批任务',
      beginnerExplanation:
        '这份报告可以逐项检查；如果要比较两个 Agent 系统，最好给它们同样的一组任务，用一致规则评分。一个会提意见的助手，也不等于最终裁判。',
      whyItMatters: '单个成功样例不能说明整体可靠性；主观反馈也需要可检验的依据。',
      technicalExplanation:
        'Eval 可以使用确定性规则、人工评审或模型评分。Evaluator 是执行评估的角色或程序，Critic 提供批评反馈，Benchmark 是用于比较的任务集与规则。模型评审本身存在偏差，需校准或结合外部证据。',
      interactionHint: '依次查看“单项检查”和“任务集评估”，对比它们回答的问题。',
      terms: ['evaluator', 'eval', 'critic', 'benchmark'],
    },
    {
      id: 'system',
      title: '让结束条件守住出口',
      beginnerExplanation:
        '结果先经过验证。失败就带着证据回到 Agent Loop，修复后重查；满足明确的完成条件，才进入最终交付。',
      whyItMatters: '权限审批通过、工具成功执行、模型自信回答，都不能代替对成果的验证。',
      technicalExplanation:
        'Completion Criteria 应覆盖任务真正的交付要求。可组合测试、来源与格式检查、人工验收。严格验证也有覆盖边界，不能把有限测试的 PASS 解释成所有可能情况都正确。',
      interactionHint: '点击 FAIL 和 PASS 两条分支，确认它们各自去往哪里。',
      terms: [],
    },
  ],
  terms: [
    {
      id: 'verification',
      name: 'Verification',
      label: '用条件验证成果',
      definition: '使用可检查条件判断任务是否真正完成，例如测试结果、来源核验与需求检查。',
    },
    {
      id: 'evaluator',
      name: 'Evaluator',
      label: '执行评估的角色',
      definition: '按照给定规则检查或评分的程序、人或模型；其判断质量取决于标准与证据。',
    },
    {
      id: 'eval',
      name: 'Eval',
      label: '系统化评估',
      definition: '使用明确任务、指标和评判方法，评估输出或系统行为质量的过程。',
    },
    {
      id: 'critic',
      name: 'Critic',
      label: '提供批评反馈的角色',
      definition: '指出输出中的问题并给出改进反馈的角色，其意见需要依据而非天然正确。',
    },
    {
      id: 'unit-test',
      name: 'Unit Test',
      label: '针对小单元的测试',
      definition: '对函数等小范围代码单元，在给定输入下检查预期行为的自动化测试。',
    },
    {
      id: 'benchmark',
      name: 'Benchmark',
      label: '统一比较用的任务集',
      definition: '用于按一致规则比较系统表现的任务集合与评估协议，结果受覆盖范围影响。',
    },
    {
      id: 'completion-criteria',
      name: 'Completion Criteria',
      label: '明确的完成条件',
      definition: '任务结束前必须满足的、尽量可检查的要求集合。',
    },
  ],
  misconceptions: [
    {
      wrong: '模型自检后说没问题，就足够了。',
      correct:
        '自检能提供反馈，但更可靠的做法是结合真实可检查的条件，如运行测试、核对来源和人工验收。',
    },
    {
      wrong: '单元测试 PASS 就代表全部需求都完成。',
      correct: '测试只证明覆盖到的行为符合预期，还应检查来源、格式、范围等原始需求。',
    },
    {
      wrong: '换一个模型当裁判，它的结论就一定客观。',
      correct: '模型评审也可能偏差或遗漏，需要清晰规则、校准以及外部证据。',
    },
  ],
  challenge: [
    {
      id: 'finish',
      prompt: 'Agent 已生成报告，并宣称检查过。最合理的下一步是什么？',
      answer: 'check',
      options: [
        {
          id: 'trust',
          label: '接受“完成了”，立刻交付',
          explanation: '完成声明并没有提供可检查的证据。',
        },
        {
          id: 'check',
          label: '按完成条件核对数据、来源和输出要求',
          explanation: '验证应当检查任务真正要求的内容，而不只听结论。',
        },
      ],
    },
    {
      id: 'fail',
      prompt: '功耗单位换算测试 FAIL，应该怎么推进？',
      answer: 'repair',
      options: [
        {
          id: 'skip',
          label: '忽略报错，只把最终文字改成“已通过”',
          explanation: '改写声明无法修复错误，也没有新的验证证据。',
        },
        {
          id: 'repair',
          label: '读错误、定位修复、重新运行测试，再检查需求',
          explanation: '错误进入下一轮工作，直到可检查的完成条件满足。',
        },
      ],
    },
    {
      id: 'benchmark',
      prompt: '想比较两个报告 Agent 哪个更稳定，应该怎样设计？',
      answer: 'set',
      options: [
        {
          id: 'single',
          label: '各挑一份最满意的输出比较文风',
          explanation: '挑选成功样例会遗漏失败情况，文风也不代表任务正确率。',
        },
        {
          id: 'set',
          label: '使用同一任务集、相同规则，统计正确性与失败情况',
          explanation: '统一评估协议使比较更有依据，同时仍需注意任务集的覆盖范围。',
        },
      ],
    },
  ],
  takeaway:
    'Generate → Test → FAIL → Read Error → Fix → Test PASS → Requirement Check PASS → DONE。',
}

export function testPowerConversion(fixed: boolean) {
  const actual = 400 / (fixed ? 1000 : 100)
  return { actual, expected: 0.4, passed: actual === 0.4 }
}
