import type { ChapterDefinition } from '../curriculum/types'

export const candidates = [
  {
    id: 'news',
    title: 'GPU 新闻汇总',
    source: '行业动态 / P. 2',
    excerpt: '含多个 GPU 产品名称，但主要讨论市场新闻。',
    useful: false,
  },
  {
    id: 'spec',
    title: '官方规格摘录',
    source: '产品资料 / P. 8',
    excerpt: '核对候选产品的显存、带宽与支持的计算精度。',
    useful: true,
  },
  {
    id: 'game',
    title: '游戏显卡选购',
    source: '消费产品 / P. 3',
    excerpt: '面向游戏体验的选购建议。',
    useful: false,
  },
  {
    id: 'need',
    title: '训练任务需求',
    source: '内部需求 PDF / P. 4',
    excerpt: '训练任务需要多卡互联，并要求模型与中间状态能放入显存。',
    useful: true,
  },
  {
    id: 'interconnect',
    title: '集群互联约束',
    source: '架构说明 / P. 6',
    excerpt: '现有集群的互联方式与节点扩展限制，是方案适配的必要条件。',
    useful: true,
  },
  {
    id: 'supply',
    title: '部署与供货条件',
    source: '项目计划 / P. 12',
    excerpt: '比较供货时间、机房功耗与散热条件，避免只看单卡指标。',
    useful: true,
  },
  {
    id: 'budget',
    title: '预算与成本口径',
    source: '预算说明 / P. 2',
    excerpt: '预算需包含 GPU、服务器、互联与运维成本，不能只比较采购单价。',
    useful: true,
  },
  {
    id: 'old',
    title: '五年前的采购清单',
    source: '归档 / P. 1',
    excerpt: '过期硬件清单。',
    useful: false,
  },
  ...[
    '季度新闻',
    '品牌介绍',
    '员工培训',
    '游戏评测',
    '显示器清单',
    '营销术语',
    '办公电脑',
    '机房照片',
    '旧项目简介',
    '会议安排',
    '活动日历',
    '入门词汇',
  ].map((title, index) => ({
    id: `other-${index}`,
    title,
    source: '其他资料',
    excerpt: '与当前采购判断没有直接关系。',
    useful: false,
  })),
]

export const chapter: ChapterDefinition = {
  id: 'rag',
  phase: 8,
  title: 'RAG',
  heading: '一千份资料，只带上相关的五段。',
  subtitle: '先检索，再精选，让当前回答有据可依。',
  minutes: 10,
  connection: 'Harness 会管理 Context。RAG 为这一轮 Context 找到有用的外部资料。',
  goal: '能解释检索、重排、片段进入 Context 的过程，并区分补充资料与训练模型。',
  steps: [
    {
      id: 'question-query',
      title: '公司有一千份文档，模型该看哪份？',
      beginnerExplanation:
        '任务是研究适合公司训练集群的新 GPU。把全部文档塞进去，既拥挤又容易被无关内容干扰。先把问题变成清楚的检索需求。',
      whyItMatters: '检索的目标是找到当前问题需要的证据，而不是尽量多拿资料。',
      technicalExplanation:
        'Query 可以是原始问题，也可以经过改写、分解或添加过滤条件。知识库通常预先解析、分块并建立索引；真正检索的是文档或片段的索引。',
      interactionHint: '选择能同时覆盖产品信息与公司约束的检索需求。',
      terms: [],
    },
    {
      id: 'retrieval-pipeline',
      title: '从找得到，到真正用得上。',
      beginnerExplanation:
        '先从知识库找出 20 个候选片段，再重新比较它们对问题的帮助，挑出 5 段放进 Context。观察每一轮留下了什么。',
      whyItMatters: '初次检索追求不错过线索；重排进一步提高放入 Context 的相关性。',
      technicalExplanation:
        'Retrieval 可采用关键词、向量或混合检索。Rerank 使用第二阶段相关性判断重新排序候选。图中 1000、20、5 是教学配置，不是 RAG 的固定参数；引用和来源必须与原文核对。',
      interactionHint: '依次执行检索、重排、加入 Context；点击片段可以检查来源。',
      terms: ['rag', 'retrieval', 'chunk', 'recall', 'rerank', 'retrieved-context'],
    },
    {
      id: 'semantic-search',
      title: '措辞不同，也可能在说同一件事。',
      beginnerExplanation:
        '问题里写“显存够不够”，文档里写“设备内存容量”。语义检索能把意思相关的内容找出来，不只依靠字面上出现同一个词。',
      whyItMatters: '复习 Model Inside 的 Embedding：它也常用于外部检索，不只存在于模型内部。',
      technicalExplanation:
        'Embedding 把文本映射为向量。向量索引根据相似度查找候选，可配合关键词与过滤条件。向量接近不是事实正确的保证，专业术语、数字和专有名词仍需谨慎匹配。',
      interactionHint: '比较关键词检索与语义检索的结果，观察相同问题如何找回不同表述。',
      terms: ['embedding', 'vector', 'vector-database', 'semantic-search'],
    },
    {
      id: 'rag-system',
      title: '资料进入这一轮输入，模型权重没有改变。',
      beginnerExplanation:
        'RAG 把相关证据临时补到 Context。模型据此生成回答。下一轮需要什么资料，仍要重新选择与组织。',
      whyItMatters: '下一章的 Memory 会保存跨任务信息；它与 RAG 有不同侧重点。',
      technicalExplanation:
        'RAG（Retrieval-Augmented Generation）把检索与生成组合起来。通常不改变生成模型的参数。Retrieved Context 只影响能看到它的当前推理；持续保存检索结果是另一个状态或存储设计问题。',
      interactionHint: '判断这一次检索究竟改变了哪里。',
      terms: [],
    },
  ],
  terms: [
    {
      id: 'rag',
      name: 'RAG',
      label: '查资料辅助生成',
      definition: '从外部知识源检索与当前任务相关的信息，并把相关结果加入 Context 的方法。',
    },
    {
      id: 'retrieval',
      name: 'Retrieval',
      label: '查找候选资料',
      definition: '依据查询从知识源中找出可能相关的文档或片段的过程。',
    },
    {
      id: 'chunk',
      name: 'Chunk',
      label: '可检索的一段内容',
      definition: '为检索和使用而划分的内容片段，通常保留所属文档和位置等来源信息。',
    },
    {
      id: 'embedding',
      name: 'Embedding',
      label: '把内容映射成数值表示',
      definition: '将文字等内容编码为向量的表示方法，常用于度量语义相关性。',
    },
    {
      id: 'vector',
      name: 'Vector',
      label: '一组有序数值',
      definition: '由多个数值组成的表示；在语义检索中常承载内容的 Embedding。',
    },
    {
      id: 'vector-database',
      name: 'Vector Database',
      label: '支持向量检索的存储',
      definition:
        '存储向量及元数据并支持相似度检索的数据库或服务；不是所有 RAG 都必须使用独立向量数据库。',
    },
    {
      id: 'semantic-search',
      name: 'Semantic Search',
      label: '按含义查找',
      definition: '依据含义相关性寻找内容的检索方式，不只依赖完全相同的字词。',
    },
    {
      id: 'recall',
      name: 'Recall',
      label: '召回 / 不漏掉相关结果',
      definition: '检索环节常称为召回；作为指标时，Recall 是被找回的相关结果占全部相关结果的比例。',
    },
    {
      id: 'rerank',
      name: 'Rerank',
      label: '对候选再排一次',
      definition: '对初次检索得到的候选进行更细致的相关性判断并重新排序。',
    },
    {
      id: 'retrieved-context',
      name: 'Retrieved Context',
      label: '本轮带入的检索资料',
      definition: '检索后选中、整理并加入当前 Context 的资料，常包含出处与引用信息。',
    },
  ],
  misconceptions: [
    {
      wrong: 'RAG 让模型训练出了新知识。',
      correct: '通常只是把外部信息补入当前 Context，并未更新模型权重。',
    },
    {
      wrong: '检索到的资料一定正确。',
      correct: '检索只说明相关程度；时效、来源质量与原文事实仍需要核对。',
    },
    {
      wrong: 'RAG 就是 Memory。',
      correct:
        'RAG 关注为当前问题检索外部证据；Memory 关注跨轮次或任务保存和找回信息，两者可以共享检索技术。',
    },
    { wrong: 'RAG 必须只用向量数据库。', correct: '关键词、向量和混合检索都可以用于 RAG。' },
  ],
  challenge: [
    {
      id: 'internal-pdf',
      prompt: '回答采购问题时，需要查公司内部 PDF 的机房约束。最合适的处理？',
      answer: 'retrieve',
      options: [
        {
          id: 'remember',
          label: '默认模型已经长期记住 PDF 的全部内容',
          explanation: '文件放在知识库不代表内容自动进入模型当前输入。',
        },
        {
          id: 'retrieve',
          label: '检索相关片段，带出处加入 Context',
          explanation: '这让生成阶段可以使用当前问题所需的外部证据。',
        },
      ],
    },
    {
      id: 'rerank',
      prompt: '初次检索第一名是提到很多次 GPU 的营销新闻，真正有用的规格表排第五。怎么办？',
      answer: 'rank',
      options: [
        {
          id: 'first',
          label: '第一名一定最可靠，直接使用',
          explanation: '初次相似度排名不等于证据质量或对任务的帮助。',
        },
        {
          id: 'rank',
          label: '结合问题重排候选，并检查来源',
          explanation: '重排提高相关性，来源检查进一步确认可用性。',
        },
      ],
    },
  ],
  takeaway: 'RAG 是为当前回答挑选证据：检索候选、重排精选、带来源加入 Context。',
}
