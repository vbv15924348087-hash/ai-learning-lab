import { exploreNodes } from '../data'
import type { ExploreConnection, ExploreNode, Point3 } from '../types'
import type { ModuleId, ModuleInterior } from './types'

type InteriorPart = {
  key: string
  source: string
  label: string
  chineseLabel: string
  offset: Point3
  kind?: ExploreNode['kind']
  description: string
  technicalDefinition: string
  responsibility: string
  confused: string
}

const sourceNodes = new Map(exploreNodes.map((node) => [node.id, node]))
const inside = (module: ModuleId, key: string) => `inside-${module}-${key}`

function makeInterior(
  id: ModuleId,
  label: string,
  description: string,
  parts: InteriorPart[],
  paths: [string, string, ExploreConnection['type'], string][],
): ModuleInterior {
  const root = sourceNodes.get(id)!
  const resolve = (key: string) => (key === '$root' ? id : inside(id, key))
  const connections = paths.map(([from, to, type, edgeLabel]) => ({
    id: `${resolve(from)}--${resolve(to)}`,
    from: resolve(from),
    to: resolve(to),
    type,
    label: edgeLabel,
  }))
  const nodes: ExploreNode[] = parts.map(({ key, source, offset, ...part }) => {
    const nodeId = inside(id, key)
    return {
      ...sourceNodes.get(source)!,
      ...part,
      id: nodeId,
      category: root.category,
      level: 2,
      parentId: id,
      position: root.position.map((value, axis) => value + offset[axis]) as Point3,
      upstream: connections.filter((edge) => edge.to === nodeId).map((edge) => edge.from),
      downstream: connections.filter((edge) => edge.from === nodeId).map((edge) => edge.to),
      related: [id],
    }
  })
  return { id, label, description, nodes, connections }
}

export const moduleInteriors: Record<ModuleId, ModuleInterior> = {
  context: makeInterior(
    'context',
    'Context · 本次信息如何组装',
    '这些是可能选入本次 Context 的信息组成，不是先后执行的七道工序；系统按任务、权限和容量选择内容。',
    [
      {
        key: 'system',
        source: 'prompt',
        label: 'System Prompt',
        chineseLabel: '系统要求',
        offset: [-3.3, 1.5, -2.6],
        kind: 'input',
        description: '应用给模型的角色、规则和工作要求。',
        technicalDefinition:
          '由应用配置并加入本次输入的系统级指令，帮助约束模型的角色、行为和回答方式。',
        responsibility: '说明当前应用希望模型遵守的任务边界与行为规则。',
        confused:
          'Prompt 中的要求不能代替运行时权限；写着禁止某动作，并不等于外部工具已被技术限制。',
      },
      {
        key: 'user',
        source: 'prompt',
        label: 'User Prompt',
        chineseLabel: '用户要求',
        offset: [-4, -0.4, 0.4],
        kind: 'input',
        description: '你这次想做什么，以及怎样才算完成。',
        technicalDefinition:
          '本次用户消息中表达的任务目标、约束、问题与验收要求，是模型输入的一部分。',
        responsibility: '把本次问题和完成条件带入当前上下文。',
        confused: '用户提出一个操作，不代表模型已经执行，也不代表系统拥有相应权限。',
      },
      {
        key: 'history',
        source: 'history',
        label: 'History',
        chineseLabel: '保留的对话',
        offset: [-2.6, 2.9, 1.8],
        kind: 'satellite',
        description: '这轮还需要参考的前文和工具记录。',
        technicalDefinition:
          '经保留或压缩后实际放入本次输入的历史消息，可包含前几轮回答与工具结果。',
        responsibility: '延续当前对话中仍有用的目标、决定和反馈。',
        confused: '保存过的聊天记录不一定全部进入本次输入；History 也不自动等于跨任务 Memory。',
      },
      {
        key: 'memory',
        source: 'memory',
        label: 'Memory Retrieval',
        chineseLabel: '取回的记忆',
        offset: [0.2, 3.8, -2.3],
        kind: 'memory',
        description: '从以前保存的信息里，只取这次有用的部分。',
        technicalDefinition:
          '根据当前任务从持久化记忆中选择并取回的相关信息，加入本次上下文后才成为当前模型可见内容。',
        responsibility: '补充与当前任务相关的历史偏好、事实或经验。',
        confused: '这里展示取回的内容，不是整个 Memory 仓库；记忆内容仍需判断是否适用和可靠。',
      },
      {
        key: 'rag',
        source: 'retrieved-context',
        label: 'RAG Result',
        chineseLabel: '检索到的资料',
        offset: [2.6, 2, -2.9],
        kind: 'rag',
        description: '资料库里被找出、筛选并带来的相关片段。',
        technicalDefinition:
          '检索增强流程选出的资料片段及来源信息；它们作为输入依据参与后续生成，并不修改模型参数。',
        responsibility: '为当前回答提供可追溯的外部资料。',
        confused: 'RAG 不必使用向量数据库；网页搜索也能直接作为工具使用，不必经过 RAG。',
      },
      {
        key: 'schema',
        source: 'schema',
        label: 'Tool Schema',
        chineseLabel: '工具说明书',
        offset: [3.1, 0.5, 1.4],
        kind: 'tool',
        description: '告诉模型能请求哪些工具，参数该怎么写。',
        technicalDefinition:
          '本次调用提供的工具名称、用途与参数结构约定，帮助模型生成符合格式的 Tool Call。',
        responsibility: '让模型知道当前可用工具的用途和调用格式。',
        confused: '工具说明不是工具执行器，也不等于对任何参数都自动授予权限。',
      },
      {
        key: 'result',
        source: 'observation',
        label: 'Tool Result',
        chineseLabel: '工具返回结果',
        offset: [0.4, -1.2, 3.3],
        kind: 'satellite',
        description: '工具做完以后，送回来的内容、状态或报错。',
        technicalDefinition:
          '由运行系统接收、关联到相应调用并整理为模型输入的工具执行结果，可能包含内容、状态、错误和来源。',
        responsibility: '让模型根据真实执行反馈决定如何回答或继续行动。',
        confused: '工具已经成功执行，不代表模型已经看到结果；结果还必须回到下一轮 Context。',
      },
    ],
    [
      ['system', '$root', 'data', '加入应用要求'],
      ['user', '$root', 'data', '加入本次目标'],
      ['history', '$root', 'data', '保留相关前文'],
      ['memory', '$root', 'retrieval', '加入选中的记忆'],
      ['rag', '$root', 'retrieval', '加入相关资料与来源'],
      ['schema', '$root', 'data', '提供本次工具约定'],
      ['result', '$root', 'data', '加入执行反馈'],
    ],
  ),
  model: makeInterior(
    'model',
    'Model · 一次生成如何继续',
    '这是自回归语言模型的教学抽象，不是真实权重或内部思维的可视化。Attention 在 Transformer 层内参与计算；生成的新 Token 可回到序列中继续下一步。',
    [
      {
        key: 'token',
        source: 'token',
        label: 'Token',
        chineseLabel: '输入与输出片段',
        offset: [-3.2, 1, -1.7],
        kind: 'input',
        description: '文字按模型的词表拆成可处理的小片段。',
        technicalDefinition:
          'Tokenizer 将输入划分为离散 Token ID；生成时每步也产生一个词表中的 Token，具体切分由模型词表决定。',
        responsibility: '表示模型输入序列，以及逐步追加的生成片段。',
        confused: '一个 Token 不固定等于一个字或单词；图中的少量片段只是教学示意。',
      },
      {
        key: 'embedding',
        source: 'embedding',
        label: 'Token Embedding',
        chineseLabel: '片段的数字表示',
        offset: [-1.7, 3.5, -2.1],
        kind: 'satellite',
        description: '把每个 Token 换成模型能计算的一组数字。',
        technicalDefinition:
          '生成模型将 Token ID 映射为向量表示，再结合位置信息等进入后续网络计算；具体位置编码方式依架构而异。',
        responsibility: '为语言模型内部计算提供输入表示。',
        confused:
          '这里是生成模型的 Token Embedding；RAG 的检索 Embedding 可以由另一个编码器产生，两者不是同一个必经模块。',
      },
      {
        key: 'transformer',
        source: 'transformer',
        label: 'Transformer',
        chineseLabel: '多层表示计算',
        offset: [1.7, 2.7, 1.2],
        kind: 'model',
        description: '一层层结合上下文，更新这些数字表示。',
        technicalDefinition:
          '由 Attention、前馈网络、残差连接和归一化等组成的多层网络；此处以常见自回归语言模型说明，省略具体架构细节。',
        responsibility: '在当前可见的序列上计算带有上下文信息的表示。',
        confused:
          'Attention 是层内机制，不是 Transformer 完成后才执行的另一台机器；各层也不对应固定业务职责。',
      },
      {
        key: 'attention',
        source: 'attention',
        label: 'Attention',
        chineseLabel: '层内关联计算',
        offset: [3.5, 4.7, -1.1],
        kind: 'satellite',
        description: '在一层里，计算当前片段该怎样参考已有内容。',
        technicalDefinition:
          'Transformer 层内根据 Query、Key、Value 等表示计算关联权重并聚合信息；自回归模型的因果约束禁止当前位置读取未来 Token。',
        responsibility: '把允许参考的位置的信息聚合到当前表示中。',
        confused:
          'Attention 不是人的注意力；图中的连线不是真实注意力权重，也不是模型推理过程的可靠因果解释。',
      },
      {
        key: 'prediction',
        source: 'token',
        label: 'Next Token',
        chineseLabel: '预测下一个片段',
        offset: [-0.8, 1, 3.4],
        kind: 'final',
        description: '给下一个片段打分，选出一个，再决定是否继续。',
        technicalDefinition:
          '输出头从隐藏表示产生词表分数并形成下一 Token 分布；解码策略选择 Token，将其追加到序列，直到停止标记、长度限制或运行时停止条件。',
        responsibility: '逐步生成回答或结构化请求的输出序列。',
        confused: '高概率不等于事实正确；生成工具调用文本也不等于工具已经执行。',
      },
    ],
    [
      ['$root', 'token', 'data', '以 Token 序列处理本次输入'],
      ['token', 'embedding', 'data', 'Token ID 转为数字表示'],
      ['embedding', 'transformer', 'data', '输入表示进入多层网络'],
      ['transformer', 'attention', 'control', '每层内部使用 Attention'],
      ['attention', 'transformer', 'data', '聚合结果回到该层计算'],
      ['transformer', 'prediction', 'data', '隐藏表示用于下一 Token 预测'],
      ['prediction', 'token', 'loop', '未停止时：新 Token 追加到序列'],
    ],
  ),
  harness: makeInterior(
    'harness',
    'Harness · 让请求真正运行',
    '这是运行系统的职责拆解。权限与边界约束工具执行，状态和轨迹在过程中更新；遇到可恢复错误才按策略重试。',
    [
      {
        key: 'loop',
        source: 'loop',
        label: 'Agent Loop',
        chineseLabel: '继续或停止',
        offset: [-3.2, 1.7, -1.7],
        kind: 'loop',
        description: '接收当前结果，安排下一轮或结束任务。',
        technicalDefinition:
          '运行系统调度模型调用、工具反馈和停止检查的循环；模型可在循环中动态选择动作，运行系统落实执行与预算约束。',
        responsibility: '带着新反馈继续任务，并在满足条件或达到限制时停止。',
        confused: 'Loop 不意味着无限重试；完成、预算耗尽、拒绝或需要人工决定都可能停止推进。',
      },
      {
        key: 'runtime',
        source: 'tools',
        label: 'Tool Runtime',
        chineseLabel: '实际执行工具',
        offset: [3.1, 0.4, -1.7],
        kind: 'tool',
        description: '通过检查以后，真正调用工具并收回结果。',
        technicalDefinition:
          '解析并调度已获授权的工具请求、传递参数、执行调用并收集结果或错误的运行组件，可使用直接接口或 MCP 等连接方式。',
        responsibility: '让结构化请求变成真实执行，记录调用与返回状态。',
        confused: '模型输出 Tool Call 和 Tool Runtime 实际执行是两件事；工具并非必须通过 MCP。',
      },
      {
        key: 'state',
        source: 'state',
        label: 'State',
        chineseLabel: '当前进度',
        offset: [-0.3, -1.6, 3.4],
        kind: 'memory',
        description: '记住任务现在到哪一步，还有什么没完成。',
        technicalDefinition:
          '运行中维护的当前步骤、结果、错误、待办与决策等结构化状态，支持后续调度和按设计恢复任务。',
        responsibility: '为下一步决策提供当前任务状态。',
        confused: 'State 是当前状态；Trace 是事件记录。二者都不自动等于长期 Memory。',
      },
      {
        key: 'retry',
        source: 'retry',
        label: 'Retry',
        chineseLabel: '有条件再试',
        offset: [3, -1.9, 1.4],
        kind: 'loop',
        description: '遇到暂时错误时，按规则判断能不能再试。',
        technicalDefinition:
          '对可恢复错误按次数限制、退避与幂等条件再次尝试的策略；重试仍须满足当前权限和边界检查。',
        responsibility: '处理适合重试的临时故障，避免重复副作用。',
        confused: '权限拒绝不能靠重试绕过；超时也不一定代表外部动作没有执行。',
      },
      {
        key: 'permission',
        source: 'guardrail',
        label: 'Permission',
        chineseLabel: '执行权限',
        offset: [-0.8, 3.6, -3],
        kind: 'gate',
        description: '先检查这次调用是否允许访问这个资源。',
        technicalDefinition:
          '依据身份、授权范围、资源和具体操作判断是否允许执行的运行时控制，不能仅依赖模型自觉遵守文字指令。',
        responsibility: '把操作限制在已授权的资源与动作范围内。',
        confused: '拥有工具说明不代表拥有访问权限；人工批准也不会自动赋予底层系统缺少的凭据。',
      },
      {
        key: 'guardrail',
        source: 'guardrail',
        label: 'Guardrail',
        chineseLabel: '动作边界',
        offset: [2.3, 3.1, 0.8],
        kind: 'gate',
        description: '判断动作是否越界，必要时停下等待人工决定。',
        technicalDefinition:
          '在权限检查之外，按动作风险、参数和系统策略施加限制、拒绝或请求人工审批；这里示意执行前的边界检查。',
        responsibility: '让高风险或不合规动作被限制、阻止或交给人决定。',
        confused: 'Guardrail 不等于核验答案是否正确；需要人工审批时，等待和超时都不是批准。',
      },
      {
        key: 'trace',
        source: 'trace',
        label: 'Trace',
        chineseLabel: '过程记录',
        offset: [-3.1, 0.3, 2.6],
        kind: 'satellite',
        description: '留下什么时候调用了什么、结果如何的记录。',
        technicalDefinition:
          '运行事件、调用参数、结果状态、检查与时序的记录，用于调试、审计和评估；记录范围和敏感字段处理由系统设计决定。',
        responsibility: '为定位失败原因和复盘系统行为保留证据。',
        confused: 'Trace 不是模型隐藏思维的录音，也不必全部加入 Context 或写成长期记忆。',
      },
    ],
    [
      ['$root', 'loop', 'control', '管理循环与停止条件'],
      ['loop', 'permission', 'control', '动作执行前检查权限'],
      ['permission', 'guardrail', 'control', '权限满足后检查动作边界'],
      ['guardrail', 'runtime', 'tool', '策略允许且所需审批满足后执行'],
      ['guardrail', 'loop', 'control', '拒绝或待审批状态返回调度'],
      ['runtime', 'state', 'data', '写入本轮结果或错误'],
      ['state', 'loop', 'data', '当前状态供下一轮决策'],
      ['runtime', 'retry', 'control', '发生可恢复错误时评估重试'],
      ['retry', 'permission', 'loop', '满足重试条件仍须重新检查'],
      ['runtime', 'trace', 'data', '记录调用和返回事件'],
      ['guardrail', 'trace', 'data', '记录检查与审批状态'],
      ['loop', 'state', 'data', '持续更新步骤与待办'],
    ],
  ),
}
