import { useState } from 'react'
import type { ChapterVisualProps } from '../curriculum/types'
import { candidates } from './data'
import './rag.css'

function RetrievalPipeline({ onComplete }: Pick<ChapterVisualProps, 'onComplete'>) {
  const [phase, setPhase] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const ranked = [...candidates].sort((a, b) => Number(b.useful) - Number(a.useful))
  const visible =
    phase < 2 ? candidates : phase === 2 ? ranked : ranked.filter((item) => item.useful)
  const detail = candidates.find((item) => item.id === selected)
  const labels = [
    '从知识库检索 →',
    '按任务相关性重排 →',
    '把前 5 段放入 Context →',
    '交给模型生成有依据的回答 →',
    '确认：回答使用了本轮检索证据 →',
  ]
  return (
    <div className="rg-pipeline">
      <div className="rg-query">
        <span>QUESTION → QUERY</span>
        <strong>训练集群 GPU：产品规格 + 显存需求 + 互联 + 部署与预算</strong>
        <small>教学示意 · 所有资料与数量均为课程示例</small>
      </div>
      <div className="rg-counts">
        <div className={phase === 0 ? 'rg-current' : ''}>
          <strong>1,000</strong>
          <span>知识库文档</span>
        </div>
        <span>→</span>
        <div className={phase === 1 || phase === 2 ? 'rg-current' : ''}>
          <strong>{phase >= 1 ? '20' : '—'}</strong>
          <span>候选片段</span>
        </div>
        <span>→</span>
        <div className={phase >= 3 ? 'rg-current' : ''}>
          <strong>{phase >= 3 ? '5' : '—'}</strong>
          <span>相关片段进入 Context</span>
        </div>
      </div>
      {phase === 0 ? (
        <div className="rg-library">
          <div className="rg-doc-field" aria-hidden="true">
            {Array.from({ length: 100 }, (_, index) => (
              <span key={index} />
            ))}
          </div>
          <p>100 个小方块，每个代表 10 份文档。文档预先分块、建立索引。</p>
        </div>
      ) : (
        <>
          <div className="rg-list-header">
            <strong>
              {phase === 1
                ? 'Retrieval · 初次召回'
                : phase === 2
                  ? 'Rerank · 按当前问题重新排序'
                  : 'Retrieved Context · 精选证据'}
            </strong>
            <span>{visible.length} 段</span>
          </div>
          <div
            className={`rg-candidates ${phase >= 3 ? 'rg-final' : ''} ${phase === 2 ? 'rg-reranked' : ''}`}
            aria-label={phase >= 3 ? '放入 Context 的五段证据' : '候选片段列表'}
          >
            {visible.map((item, index) => (
              <button
                key={item.id}
                className={`rg-candidate ${phase >= 2 && item.useful ? 'rg-relevant' : ''} ${selected === item.id ? 'rg-selected' : ''}`}
                onClick={() => setSelected(item.id)}
                aria-pressed={selected === item.id}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{item.title}</strong>
                {phase >= 3 && <small>{item.source}</small>}
              </button>
            ))}
          </div>
          {detail && (
            <div className="cr-result" role="status">
              <strong>
                {detail.title} · {detail.source}
              </strong>
              <p>{detail.excerpt}</p>
              <small>
                {detail.useful
                  ? '对当前训练集群采购问题有直接帮助。'
                  : '相关词可能相近，但不直接回答当前采购问题。'}
              </small>
            </div>
          )}
          <p className="cr-caption">
            {phase === 1
              ? '第一次检索里，提到很多次 GPU 的新闻也可能排在前面。'
              : phase === 2
                ? '规格、内部需求和部署条件排到前面；相同候选被重新排序，没有凭空增加证据。'
                : '每段保留出处。模型基于这些片段生成回答，重要结论仍需核对。'}
          </p>
        </>
      )}
      {phase === 4 && (
        <div className="rg-answer" aria-label="基于检索证据的示意回答">
          <div className="rg-answer-flow">
            <span>5 段证据 / Context</span>
            <span>→</span>
            <strong>Model</strong>
            <span>→</span>
            <span>Answer</span>
          </div>
          <h3>模型阶段 · 根据本轮资料生成示意回答</h3>
          <p>
            先核对候选 GPU 的显存、带宽与计算精度，再检查是否能容纳训练任务。
            <small>［产品资料 P. 8；内部需求 PDF P. 4］</small>
          </p>
          <p>
            比较集群互联适配、供货、功耗和散热条件，并按包含服务器与运维的完整成本口径判断。
            <small>［架构说明 P. 6；项目计划 P. 12；预算说明 P. 2］</small>
          </p>
          <p className="cr-caption">
            这是基于示例片段写成的教学回答。真实选型还需要具体规格与约束数值，不能凭这些片段直接决定采购。
          </p>
        </div>
      )}
      <button
        className="cr-action"
        onClick={() => (phase < 4 ? setPhase((value) => value + 1) : onComplete())}
      >
        {labels[phase]}
      </button>
      <p className="rg-route">
        Question → Query → Knowledge Base → Retrieval → Candidates → Rerank → Chunks → Context →
        Model
      </p>
    </div>
  )
}

function SemanticCompare({ onComplete }: Pick<ChapterVisualProps, 'onComplete'>) {
  const [mode, setMode] = useState<'keyword' | 'semantic'>('keyword')
  const [seenSemantic, setSeenSemantic] = useState(false)
  return (
    <div className="cr-visual">
      <span className="cr-tag">教学示意 · 非真实相似度计算</span>
      <h3>查询：“显存够不够装下训练任务？”</h3>
      <div className="rg-mode" role="group" aria-label="检索方式">
        <button
          className="cr-secondary"
          aria-pressed={mode === 'keyword'}
          onClick={() => setMode('keyword')}
        >
          关键词：匹配“显存”
        </button>
        <button
          className="cr-secondary"
          aria-pressed={mode === 'semantic'}
          onClick={() => {
            setMode('semantic')
            setSeenSemantic(true)
          }}
        >
          语义：寻找相近含义
        </button>
      </div>
      <div className="rg-semantic">
        <div className="rg-hit">
          <span>共同候选</span>
          <strong>“显存容量影响可容纳的模型大小。”</strong>
          <p>既包含相同词语，也与当前问题相关。</p>
        </div>
        <div className={`rg-hit ${mode === 'semantic' ? 'rg-hit-found' : 'rg-hit-muted'}`}>
          <span>{mode === 'semantic' ? '找回了不同措辞' : '这个字面规则没有匹配到'}</span>
          <strong>“设备内存须容纳模型参数和训练中间状态。”</strong>
          <p>
            {mode === 'semantic'
              ? 'Embedding 帮助把意思接近的文本放到相近的向量位置。'
              : '没有出现“显存”二字，但内容可能正是需要的。'}
          </p>
        </div>
      </div>
      <p className="cr-caption">
        这是最简单的字面匹配对比。实际关键词搜索可以扩展同义词，也可以与向量检索组合。
      </p>
      <p>
        <a className="rg-review-link" href="/lesson/model-inside">
          回到 Model Inside，复习 Embedding →
        </a>
      </p>
      <button className="cr-action" disabled={!seenSemantic} onClick={onComplete}>
        {seenSemantic ? '我看到了“按含义找”的价值 →' : '先切换到语义检索观察结果'}
      </button>
    </div>
  )
}

export default function ChapterVisual({ step, onComplete, completed }: ChapterVisualProps) {
  const [feedback, setFeedback] = useState(false)
  if (step === 1) return <RetrievalPipeline onComplete={onComplete} />
  if (step === 2) return <SemanticCompare onComplete={onComplete} />
  if (step === 0)
    return (
      <div className="cr-visual">
        <div className="rg-question">
          <span>当前任务</span>
          <h3>研究适合公司训练集群的新 GPU。</h3>
          <p>外部产品资料 + 内部需求 PDF + 机房约束 + 项目预算</p>
        </div>
        <h3>先查什么，最有利于完成任务？</h3>
        <div className="rg-options">
          <button className="cr-secondary" onClick={() => setFeedback(true)}>
            只搜索“GPU”
          </button>
          <button className="cr-action" onClick={onComplete}>
            查 GPU 规格，并关联公司的训练与部署约束 →
          </button>
        </div>
        {feedback && (
          <p className="cr-result" role="status">
            这个词太宽泛，可能召回游戏评测或行业新闻。加入任务约束更容易找到可用证据。
          </p>
        )}
      </div>
    )
  return (
    <div className="cr-visual">
      <div className="cr-flow">
        <div className="cr-node">
          外部知识源
          <br />
          <small>按需检索</small>
        </div>
        <span>→</span>
        <div className="cr-node cr-active">
          Context
          <br />
          <small>新增 5 段证据</small>
        </div>
        <span>→</span>
        <div className="cr-node">
          Model
          <br />
          <small>参数保持不变</small>
        </div>
        <span>→</span>
        <div className="cr-node">
          Answer
          <br />
          <small>带依据的回答</small>
        </div>
      </div>
      <h3>这次检索改变了什么？</h3>
      <div className="rg-options">
        <button className="cr-secondary" onClick={() => setFeedback(true)}>
          把资料永久训练进模型
        </button>
        <button className="cr-action" onClick={onComplete}>
          {completed ? '已确认：补充了本轮 Context' : '补充了这一轮的 Context →'}
        </button>
      </div>
      {feedback && (
        <p className="cr-result" role="status">
          这里没有训练步骤。只是把挑出的资料加进当前输入，供这次回答使用。
        </p>
      )}
    </div>
  )
}
