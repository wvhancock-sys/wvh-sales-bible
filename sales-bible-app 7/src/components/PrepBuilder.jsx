import { useState } from 'react'
import bible from '../data/bible.json'

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  function copy() { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copy}>{copied ? '✓ copied' : 'copy'}</button>
}

const CALL_TYPES = ['Inbound Discovery', 'Outbound Discovery', 'Validation', 'Exec Alignment', 'Re-engagement']

export default function PrepBuilder({ navigate, initData }) {
  const [form, setForm] = useState({ product: '', account: '', industry: '', callType: 'Outbound Discovery', knowSoFar: '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeQ, setActiveQ] = useState(null)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function build() {
    if (!form.product || !form.account) { setError('Product and account are required.'); return }
    setError(null); setLoading(true); setResult(null)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'prep', ...form }),
      })
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setError('Something went wrong. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  // Group questions by SPICED stage
  const grouped = result?.killerQuestions?.reduce((acc, q) => {
    if (!acc[q.stage]) acc[q.stage] = []
    acc[q.stage].push(q.question)
    return acc
  }, {}) || {}

  const spicedOrder = ['Situation', 'Pain', 'Impact', 'Critical Event', 'Decision']

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <span className="label">AI Call Prep</span>
        <h1>Build your call plan</h1>
        <p className="muted" style={{ marginTop: 4 }}>Fill in what you know. Get a custom hypothesis, provocation, and question set for this specific account.</p>
      </div>

      <div className="card">
        <div className="form-row">
          <div className="form-group">
            <span className="label">Account name *</span>
            <input placeholder="e.g. Caterpillar Inc." value={form.account} onChange={e => set('account', e.target.value)} />
          </div>
          <div className="form-group">
            <span className="label">Industry</span>
            <input placeholder="e.g. Industrial manufacturing" value={form.industry} onChange={e => set('industry', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <span className="label">Product *</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {bible.products.map(p => (
              <button
                key={p.id}
                className={`chip p-${p.id} ${form.product === p.id ? 'selected' : ''}`}
                onClick={() => set('product', p.id)}
              >
                {p.id === 'bob' ? 'IBM Bob' : p.id === 'orchestrate' ? 'Orchestrate' : 'governance'}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <span className="label">Call type</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CALL_TYPES.map(t => (
              <button key={t} className={`chip ${form.callType === t ? 'selected' : ''}`} onClick={() => set('callType', t)}>{t}</button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <span className="label">What you already know (optional)</span>
          <textarea
            placeholder="E.g. They posted 3 COBOL developer jobs last month. Had a mainframe outage in Q1. CIO is new as of January..."
            value={form.knowSoFar}
            onChange={e => set('knowSoFar', e.target.value)}
          />
        </div>

        {error && <p style={{ color: 'var(--coral)', fontFamily: 'Courier New', fontSize: 12, marginBottom: 10 }}>{error}</p>}
        <button className="btn btn-primary btn-full" onClick={build} disabled={loading}>
          {loading ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> building...</> : <><div className="glow-dot" /> Build call plan</>}
        </button>
      </div>

      {loading && (
        <div className="loading-block">
          <div className="spinner" />
          <span>Generating your plan for {form.account}...</span>
        </div>
      )}

      {result && (
        <div>
          {/* Hypothesis */}
          <div className="ai-block">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div className="glow-dot" />
              <h3>Your hypothesis</h3>
            </div>
            <span className="label">Two-sentence (for cold outreach)</span>
            <div className="copy-wrap">
              <div className="script-box clay-border">{result.twoSentenceHypothesis}</div>
              <CopyBtn text={result.twoSentenceHypothesis} />
            </div>
            {result.fourPartHypothesis && (
              <>
                <span className="label" style={{ marginTop: 14 }}>Four-part (for outbound calls)</span>
                <div className="card-inset" style={{ marginTop: 0 }}>
                  {['pattern', 'gap', 'proof', 'question'].map(k => (
                    <div key={k} style={{ marginBottom: 10 }}>
                      <span className="label">{k}</span>
                      <p style={{ fontSize: 13, marginBottom: 0 }}>{result.fourPartHypothesis[k]}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Provocation */}
          {result.provocation && (
            <div className="ai-block">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div className="glow-dot" />
                <h3>Your provocation</h3>
              </div>
              <div className="callout" style={{ marginBottom: 12 }}>
                <div className="callout-label">Opening line</div>
                <p style={{ margin: 0, fontSize: 14, fontStyle: 'italic' }}>{result.provocation.openingLine}</p>
              </div>
              {['pattern', 'tension', 'implication'].map(k => (
                <div key={k} style={{ marginBottom: 10 }}>
                  <span className="label">{k}</span>
                  <p style={{ fontSize: 13, marginBottom: 0 }}>{result.provocation[k]}</p>
                </div>
              ))}
              <div className="copy-wrap" style={{ marginTop: 10 }}>
                <div className="script-box">
                  {result.provocation.pattern + '\n\n' + result.provocation.tension + '\n\n' + result.provocation.implication}
                </div>
                <CopyBtn text={result.provocation.pattern + '\n\n' + result.provocation.tension + '\n\n' + result.provocation.implication} />
              </div>
            </div>
          )}

          {/* Killer Questions */}
          {result.killerQuestions?.length > 0 && (
            <div className="ai-block">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div className="glow-dot" />
                <h3>Discovery questions for {form.account}</h3>
              </div>
              {spicedOrder.filter(stage => grouped[stage]?.length).map(stage => (
                <div key={stage} className="spiced-stage">
                  <div className="spiced-stage-label">{stage}</div>
                  {grouped[stage].map((q, i) => (
                    <div key={i} className="question-item">{q}</div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Objections */}
          {result.potentialObjections?.length > 0 && (
            <div className="ai-block">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div className="glow-dot" />
                <h3>Likely objections at {form.account}</h3>
              </div>
              {result.potentialObjections.map((obj, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <button
                    className="chip"
                    style={{ marginBottom: 8, width: '100%', justifyContent: 'flex-start' }}
                    onClick={() => setActiveQ(activeQ === i ? null : i)}
                  >
                    {obj.objection}
                  </button>
                  {activeQ === i && (
                    <div className="copy-wrap">
                      <div className="script-box clay-border">{obj.response}</div>
                      <CopyBtn text={obj.response} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Compelling Events */}
          {result.compellingEventIdeas?.length > 0 && (
            <div className="ai-block">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div className="glow-dot" />
                <h3>Compelling event angles</h3>
              </div>
              {result.compellingEventIdeas.map((ce, i) => (
                <div key={i} className="question-item">{ce}</div>
              ))}
            </div>
          )}

          {/* Coaching Note */}
          {result.coachingNote && (
            <div className="callout slate">
              <div className="callout-label">Coaching note</div>
              <p style={{ margin: 0, fontSize: 13 }}>{result.coachingNote}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button className="btn btn-sm" onClick={() => navigate('email', { account: form.account, product: form.product })}>Write email →</button>
            <button className="btn btn-sm" onClick={() => { setResult(null); window.scrollTo(0,0) }}>Start over</button>
          </div>
        </div>
      )}
    </div>
  )
}
