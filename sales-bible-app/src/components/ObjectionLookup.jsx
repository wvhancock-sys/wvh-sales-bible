import { useState } from 'react'
import bible from '../data/bible.json'

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  function copy() { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copy}>{copied ? '✓' : 'copy'}</button>
}

export default function ObjectionLookup({ navigate }) {
  const [search, setSearch] = useState('')
  const [active, setActive] = useState(null)
  const [aiObj, setAiObj] = useState('')
  const [aiCtx, setAiCtx] = useState('')
  const [aiResult, setAiResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState('')
  const [mode, setMode] = useState('browse') // browse | ai

  const filtered = bible.objections.filter(o =>
    o.objection.toLowerCase().includes(search.toLowerCase()) ||
    o.stage.toLowerCase().includes(search.toLowerCase())
  )

  async function askAI() {
    if (!aiObj) return
    setLoading(true); setAiResult(null)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'objection', objection: aiObj, context: aiCtx, product }),
      })
      const data = await res.json()
      setAiResult(data)
    } catch (e) { /* silent */ }
    finally { setLoading(false) }
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <span className="label">Objection Handling</span>
        <h1>Objection scripts</h1>
        <p className="muted" style={{ marginTop: 4 }}>Browse saved responses or get AI coaching on any objection you're hearing.</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button className={`chip ${mode === 'browse' ? 'selected' : ''}`} onClick={() => setMode('browse')}>Browse scripts</button>
        <button className={`chip ${mode === 'ai' ? 'selected' : ''}`} onClick={() => setMode('ai')}>
          <div className="glow-dot" style={{ width: 6, height: 6 }} />
          AI coaching
        </button>
      </div>

      {mode === 'browse' && (
        <>
          <div className="form-group">
            <input
              placeholder="Search objections..."
              value={search}
              onChange={e => { setSearch(e.target.value); setActive(null) }}
            />
          </div>

          <div className="callout slate" style={{ marginBottom: 18 }}>
            <div className="callout-label">The pattern</div>
            <p style={{ margin: 0, fontSize: 13 }}>Acknowledge the concern. Ask what's really driving it. Isolate it ("if we solved that, is there anything else?"). Then answer only the real version.</p>
          </div>

          {filtered.map(obj => (
            <div key={obj.id} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="label">{obj.stage}</span>
                  <h3 style={{ marginBottom: 0 }}>"{obj.objection}"</h3>
                </div>
                <button
                  className="btn btn-sm"
                  onClick={() => setActive(active === obj.id ? null : obj.id)}
                  style={{ flexShrink: 0, marginLeft: 10, marginTop: 2 }}
                >
                  {active === obj.id ? 'close' : 'response'}
                </button>
              </div>

              {active === obj.id && (
                <div style={{ marginTop: 14 }}>
                  {obj.pattern && (
                    <div style={{ marginBottom: 8 }}>
                      <span className="label">Pattern</span>
                      <span style={{ fontFamily: 'Courier New', fontSize: 11, color: 'var(--coral)' }}>{obj.pattern}</span>
                    </div>
                  )}
                  <div className="copy-wrap">
                    <div className="script-box">{obj.response}</div>
                    <CopyBtn text={obj.response} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {mode === 'ai' && (
        <div>
          <div className="card">
            <span className="label">What did they say?</span>
            <div className="form-group">
              <textarea
                placeholder="Paste the exact objection. E.g. 'We already have Microsoft Copilot for this, I'm not sure what you add...'"
                value={aiObj}
                onChange={e => setAiObj(e.target.value)}
                style={{ minHeight: 100 }}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <span className="label">Product context</span>
                <select value={product} onChange={e => setProduct(e.target.value)}>
                  <option value="">Any</option>
                  {bible.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <span className="label">Context</span>
                <input placeholder="E.g. Mid-discovery, after impact stage" value={aiCtx} onChange={e => setAiCtx(e.target.value)} />
              </div>
            </div>
            <button className="btn btn-primary btn-full" onClick={askAI} disabled={loading || !aiObj}>
              {loading ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> coaching...</> : <><div className="glow-dot" /> Get coaching</>}
            </button>
          </div>

          {aiResult && (
            <div className="ai-block">
              {[
                { key: 'acknowledge', label: '1. Acknowledge' },
                { key: 'askToIsolate', label: '2. Ask to isolate' },
                { key: 'answer', label: '3. Answer' },
                { key: 'followUp', label: '4. Follow-up question' },
              ].map(({ key, label }) => aiResult[key] && (
                <div key={key} className="objection-step">
                  <div className="objection-step-label">{label}</div>
                  <div className="copy-wrap">
                    <div className="script-box" style={{ marginTop: 0 }}>{aiResult[key]}</div>
                    <CopyBtn text={aiResult[key]} />
                  </div>
                </div>
              ))}
              {aiResult.coachingNote && (
                <div className="callout slate" style={{ marginTop: 10 }}>
                  <div className="callout-label">Coaching note</div>
                  <p style={{ margin: 0, fontSize: 13 }}>{aiResult.coachingNote}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
