import { NVIDIA_QUESTION } from '../../system-overview/data/systemOverviewSteps'
import type { ContextInformationCard } from '../types'

export const contextInformationCards: ContextInformationCard[] = [
  {
    id: 'question',
    title: '用户问题',
    detail: NVIDIA_QUESTION,
    verdict: 'relevant',
    feedback: '保留。问题告诉模型当前要查什么，以及回答要简单到什么程度。',
  },
  {
    id: 'official-page',
    title: 'NVIDIA 官方 GPU 页面',
    detail: '产品名称、发布时间和用途等原始资料，可用于核对“最新”。',
    verdict: 'relevant',
    feedback:
      '保留相关内容。这是用于核对事实和日期的原始来源；只加入与当前问题有关的页面片段，不必搬入整站。',
  },
  {
    id: 'old-chat',
    title: '三年前一段无关聊天',
    detail: '讨论过周末聚餐，和 GPU 没有关系。',
    verdict: 'irrelevant',
    feedback: '不需要。保存过或聊过，不代表这次就有用；无关聊天只会占用当前工作台。',
  },
  {
    id: 'tool-definition',
    title: 'Web Search Tool Definition',
    detail: '搜索工具的使用说明：可以搜索网页，以及发起请求需要提供什么。',
    verdict: 'relevant',
    feedback:
      '本轮保留。现在还需要继续搜索并核对最新信息，模型需要知道有哪些工具、如何提出请求。工具说明本身不是搜索结果；如果本轮已不需要工具，可重新判断是否保留。',
  },
  {
    id: 'previous-project',
    title: '用户昨天关于另一个项目的要求',
    detail: '昨天的项目记录，尚不确定是否和这次 GPU 查询相关。',
    verdict: 'depends',
    feedback:
      '视情况。如果包含本次也适用的 GPU 采购条件或表达偏好，可以保留相关部分；如果只属于另一个项目，就不需要。先确认关联，不能因为它来自昨天就全部放进来。',
  },
  {
    id: 'travel',
    title: '一篇香港旅游文章',
    detail: '介绍景点、酒店与交通，和 NVIDIA GPU 无关。',
    verdict: 'irrelevant',
    feedback: '不需要。它不能帮助回答 GPU 问题；资料写得再好，无关时也不值得占用当前 Context。',
  },
  {
    id: 'retrieved-summary',
    title: '刚才搜索返回的 NVIDIA 官方资料摘要',
    detail: '本轮已找到的相关要点与来源线索，帮助定位下一步还要核对的内容。',
    verdict: 'relevant',
    feedback:
      '保留。摘要让模型接着已有搜索进展工作，原始页面用于核对细节，两者在本例中互相补充。如果摘要与页面完全重复，就应合并，避免重复堆放。',
  },
  {
    id: 'duplicate-page',
    title: '重复出现的同一篇网页',
    detail: '同一个页面、同样的内容，已经有一份在候选资料中。',
    verdict: 'irrelevant',
    feedback: '去掉重复。相同内容再放一份不会提供新证据，却会多占容量。',
  },
]

export const contextVerdictLabels = {
  relevant: 'Relevant · 相关',
  depends: 'Depends · 视情况',
  irrelevant: 'Irrelevant / Redundant · 无关或重复',
} as const

export function isContextSelectionValid(selected: readonly string[]) {
  return contextInformationCards.every((card) =>
    card.verdict === 'depends'
      ? true
      : selected.includes(card.id) === (card.verdict === 'relevant'),
  )
}
