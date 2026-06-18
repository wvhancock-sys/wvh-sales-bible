import { useState, useEffect } from 'react'
import bible from '../data/bible.json'

// ── tiny helpers ─────────────────────────────────────────────
function CopyBtn({ text, style = {} }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button className={`copy-btn ${copied ? 'copied' : ''}`} style={style} onClick={copy}>
      {copied ? '✓ copied' : 'copy'}
    </button>
  )
}

const CALL_TYPES = [
  { id: 'inbound',     label: 'Inbound Discovery' },
  { id: 'outbound',    label: 'Outbound Discovery' },
  { id: 'validation',  label: 'Validation' },
  { id: 'exec',        label: 'Exec Alignment' },
  { id: 'stalled',     label: 'Stalled Deal' },
]

const SPICED = ['Situation', 'Pain', 'Impact', 'Critical Event', 'Decision']

const PRODUCT_NAMES = { orchestrate: 'Orchestrate', bob: 'IBM Bob', governance: 'governance' }
const PRODUCT_FULL  = { orchestrate: 'watsonx Orchestrate', bob: 'IBM Bob (Code Assistant)', governance: 'watsonx.governance' }

// ── sub-panels ───────────────────────────────────────────────

function PlayPanel({ session }) {
  const [step, setStep] = useState(0)
  const playMap = { inbound: 'play1', outbound: 'play2', validation: 'play3', exec: 'play4', stalled: 'play5' }
  const play = bible.plays.find(p => p.id === playMap[session.callType])
  if (!play) return (
    <div style={{ padding: '40px 0', textAlign: 'center' }}>
      <span className="section-label">No play mapped for this call type yet</span>
    </div>
  )
  const s = play.steps[step]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <span className="section-label">Play</span>
        <div className="display-md">{play.name}</div>
        <p className="body-sm" style={{ marginTop: 6 }}>{play.goal}</p>
      </div>

      {/* Pre-call prep */}
      {play.preCAllPrep && (
        <div style={{ marginBottom: 24 }}>
          <span className="section-label">Pre-call prep</span>
          {play.preCAllPrep.map((item, i) => (
            <div key={i} className="q-item">
              <span className="q-arrow">→</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}

      <hr className="section-rule-md" style={{ marginBottom: 20 }} />

      {/* Step navigator */}
      <div className="step-track">
        {play.steps.map((st, i) => (
          <button
            key={i}
            className={`step-item ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
            onClick={() => setStep(i)}
          >
            <span className="step-num">{i + 1}</span>
            <span className="step-name">{st.name.replace(/^Step \d+ · /, '').split('(')[0].trim()}</span>
          </button>
        ))}
      </div>

      {/* Active step */}
      <div key={step}>
        <div style={{ marginBottom: 16 }}>
          <span className="section-label">Step {step + 1} of {play.steps.length}</span>
          <div className="display-md" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.4rem)' }}>{s.name}</div>
          {s.time && <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted-fg)', letterSpacing: '0.08em' }}>{s.time}</span>}
        </div>

        {s.why && (
          <div className="note-block" style={{ marginBottom: 16 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted-fg)' }}>Why this works</span>
            <p className="body-sm" style={{ marginTop: 4 }}>{s.why}</p>
          </div>
        )}

        {s.script && (
          <div style={{ marginBottom: 20 }}>
            <span className="section-label">Script</span>
            <div className="copy-wrap" style={{ position: 'relative' }}>
              <div className="script-block">{s.script}</div>
              <CopyBtn text={s.script} />
            </div>
          </div>
        )}

        {s.leftSwingDropIns && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000', padding: '12px 0', marginBottom: 12 }}>
              <span className="section-label" style={{ marginBottom: 0 }}>Left-swing drop-ins — when energy drops</span>
            </div>
            {Object.entries(s.leftSwingDropIns).map(([stage, line]) => (
              <div key={stage} style={{ marginBottom: 12 }}>
                <span className="section-label">{stage} stage</span>
                <div className="copy-wrap" style={{ position: 'relative' }}>
                  <div className="script-block-sm">{line}</div>
                  <CopyBtn text={line} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, paddingTop: 16, borderTop: '1px solid var(--border-light)' }}>
          <button className="btn-outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← Prev</button>
          {step < play.steps.length - 1
            ? <button className="btn-primary" onClick={() => setStep(step + 1)}>Next Step →</button>
            : <span className="section-label" style={{ alignSelf: 'center', marginBottom: 0 }}>Play complete</span>
          }
        </div>
      </div>
    </div>
  )
}

function DiscoveryPanel({ session, aiResult }) {
  const [activeStage, setActiveStage] = useState('Situation')
  const product = bible.products.find(p => p.id === session.product)

  // Questions: AI-generated if available, else from Bible
  const aiGrouped = aiResult?.killerQuestions?.reduce((acc, q) => {
    if (!acc[q.stage]) acc[q.stage] = []
    acc[q.stage].push(q.question)
    return acc
  }, {}) || {}

  const getQs = (stage) => {
    if (aiGrouped[stage]?.length) return aiGrouped[stage]
    return product?.killerQuestions?.[stage] || []
  }

  const hasAI = aiResult?.killerQuestions?.length > 0
  const qs = getQs(activeStage)

  return (
    <div>
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <span className="section-label">SPICED Discovery Questions</span>
          <div className="display-md" style={{ fontSize: '1.2rem' }}>
            {session.account ? `For ${session.account}` : product ? PRODUCT_FULL[product.id] : 'Select a product'}
          </div>
        </div>
        {hasAI && (
          <span className="tag tag-inverted">
            <span className="ai-dot" style={{ marginRight: 5, background: '#fff' }} />
            AI-tailored
          </span>
        )}
      </div>

      <div className="spiced-tabs">
        {SPICED.map(stage => (
          <button
            key={stage}
            className={`spiced-tab ${activeStage === stage ? 'active' : ''}`}
            onClick={() => setActiveStage(stage)}
          >
            {stage}
          </button>
        ))}
      </div>

      <div style={{ minHeight: 200 }}>
        {qs.length > 0 ? qs.map((q, i) => (
          <div key={i} className="q-item">
            <span className="q-arrow">→</span>
            <span>{q}</span>
          </div>
        )) : (
          <div style={{ padding: '24px 0' }}>
            <p className="body-sm">No questions for this stage. Generate an AI plan to get account-specific questions.</p>
          </div>
        )}
      </div>

      {product && (
        <div style={{ marginTop: 24 }}>
          <hr className="section-rule-sm" style={{ marginBottom: 16 }} />
          <span className="section-label">Universal follow-ups</span>
          {(product.universalFollowUps || []).map((fu, i) => (
            <div key={i} className="q-item" style={{ fontStyle: 'italic' }}>
              <span className="q-arrow">—</span>
              <span style={{ color: 'var(--muted-fg)' }}>"{fu}"</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ObjectionPanel({ session, aiResult }) {
  const [open, setOpen] = useState(null)
  const product = bible.products.find(p => p.id === session.product)

  // Combine AI objections + Bible objections
  const aiObjs = aiResult?.potentialObjections?.map((o, i) => ({
    id: `ai-${i}`, objection: o.objection, response: o.response,
    stage: 'AI-generated', isAI: true,
  })) || []

  const bibleObjs = bible.objections.filter(o =>
    !o.products || o.products.includes(session.product)
  )

  const allObjs = [...aiObjs, ...bibleObjs]

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <span className="section-label">Objection Handlers</span>
        <div className="display-md" style={{ fontSize: '1.2rem' }}>Handle anything they throw at you</div>
        <p className="body-sm" style={{ marginTop: 6 }}>
          Acknowledge → Ask what's driving it → Isolate → Answer the real version.
        </p>
      </div>

      {aiObjs.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, paddingBottom: 8, borderBottom: '2px solid #000' }}>
            <span className="ai-dot" />
            <span className="section-label" style={{ marginBottom: 0 }}>
              {session.account ? `Likely at ${session.account}` : 'AI-generated for this scenario'}
            </span>
          </div>
          {aiObjs.map(obj => (
            <ObjItem key={obj.id} obj={obj} open={open === obj.id} toggle={() => setOpen(open === obj.id ? null : obj.id)} />
          ))}
        </div>
      )}

      <div>
        {aiObjs.length > 0 && (
          <div style={{ paddingBottom: 8, borderBottom: '2px solid #000', marginBottom: 8 }}>
            <span className="section-label" style={{ marginBottom: 0 }}>From the Sales Bible</span>
          </div>
        )}
        {allObjs.filter(o => !o.isAI).map(obj => (
          <ObjItem key={obj.id} obj={obj} open={open === obj.id} toggle={() => setOpen(open === obj.id ? null : obj.id)} />
        ))}
      </div>
    </div>
  )
}

function ObjItem({ obj, open, toggle }) {
  return (
    <div className="obj-item">
      <button className="obj-trigger" onClick={toggle}>
        <span>"{obj.objection}"</span>
        <span className="obj-chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="obj-response">
          {obj.stage && !obj.isAI && (
            <span className="section-label" style={{ marginBottom: 8 }}>{obj.stage} · {obj.pattern || ''}</span>
          )}
          <div className="copy-wrap" style={{ position: 'relative' }}>
            <div className="script-block-sm">{obj.response}</div>
            <CopyBtn text={obj.response} />
          </div>
        </div>
      )}
    </div>
  )
}

function PrepPanel({ session, aiResult, aiLoading, aiError, onBuild, updateSession }) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <span className="section-label">AI Call Prep</span>
        <div className="display-md" style={{ fontSize: '1.2rem' }}>
          {session.account ? `Plan for ${session.account}` : 'Build your call plan'}
        </div>
        <p className="body-sm" style={{ marginTop: 6 }}>
          Add context below. Get a tailored hypothesis, provocation, and question set built for this exact account and call.
        </p>
      </div>

      {/* Quick context inputs */}
      <div style={{ display: 'grid', gap: 16, marginBottom: 20 }}>
        <div className="field-group">
          <span className="field-label">What you already know</span>
          <textarea
            className="field-textarea"
            rows={3}
            placeholder="Job postings, recent news, earnings call language, org changes, known projects..."
            value={session.knowSoFar}
            onChange={e => updateSession({ knowSoFar: e.target.value })}
          />
        </div>
        <div style={{ display: 'grid', grid: 'auto / 1fr 1fr', gap: 12 }}>
          <div className="field-group">
            <span className="field-label">Buyer name</span>
            <input
              className="field-input"
              placeholder="Sarah Chen"
              value={session.buyerName}
              onChange={e => updateSession({ buyerName: e.target.value })}
            />
          </div>
          <div className="field-group">
            <span className="field-label">Buyer title</span>
            <input
              className="field-input"
              placeholder="VP Engineering"
              value={session.buyerTitle}
              onChange={e => updateSession({ buyerTitle: e.target.value })}
            />
          </div>
        </div>
      </div>

      {aiError && <div className="error-msg">{aiError}</div>}

      <button
        className="btn-primary btn-full"
        onClick={onBuild}
        disabled={aiLoading || !session.product || !session.account}
      >
        {aiLoading
          ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Building plan for {session.account}...</>
          : <><span className="ai-dot" style={{ marginRight: 8 }} /> Build AI Call Plan</>
        }
      </button>

      {(!session.product || !session.account) && (
        <p className="body-sm" style={{ marginTop: 8, textAlign: 'center' }}>
          Set product and account in the sidebar first.
        </p>
      )}

      {/* AI Results */}
      {aiResult && !aiLoading && (
        <div style={{ marginTop: 32 }}>
          <hr className="section-rule-md" style={{ marginBottom: 24 }} />

          {/* Hypothesis */}
          {aiResult.twoSentenceHypothesis && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span className="ai-dot" />
                <span className="section-label" style={{ marginBottom: 0 }}>Your hypothesis</span>
              </div>
              <div className="copy-wrap" style={{ position: 'relative' }}>
                <div className="script-block">{aiResult.twoSentenceHypothesis}</div>
                <CopyBtn text={aiResult.twoSentenceHypothesis} />
              </div>
              {aiResult.fourPartHypothesis && (
                <div style={{ marginTop: 16 }}>
                  <span className="section-label">Four-part (for outbound calls)</span>
                  <div style={{ border: '1px solid var(--border-light)', background: 'var(--muted)' }}>
                    {['pattern', 'gap', 'proof', 'question'].map(k => (
                      <div key={k} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-light)' }}>
                        <span className="section-label" style={{ marginBottom: 4 }}>{k}</span>
                        <p className="body-sm" style={{ color: 'var(--fg)' }}>{aiResult.fourPartHypothesis[k]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Provocation */}
          {aiResult.provocation && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span className="ai-dot" />
                <span className="section-label" style={{ marginBottom: 0 }}>Your provocation</span>
              </div>
              <div style={{ border: '1px solid var(--border-light)', marginBottom: 12, padding: '12px 16px', background: 'var(--muted)' }}>
                <span className="section-label">Opening line</span>
                <p style={{ fontFamily: 'var(--display)', fontStyle: 'italic', fontSize: 16 }}>{aiResult.provocation.openingLine}</p>
              </div>
              <div className="copy-wrap" style={{ position: 'relative' }}>
                <div className="script-block">
                  {[aiResult.provocation.pattern, aiResult.provocation.tension, aiResult.provocation.implication].filter(Boolean).join('\n\n')}
                </div>
                <CopyBtn text={[aiResult.provocation.pattern, aiResult.provocation.tension, aiResult.provocation.implication].filter(Boolean).join('\n\n')} />
              </div>
            </div>
          )}

          {/* Compelling events */}
          {aiResult.compellingEventIdeas?.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span className="ai-dot" />
                <span className="section-label" style={{ marginBottom: 0 }}>Compelling event angles</span>
              </div>
              {aiResult.compellingEventIdeas.map((ce, i) => (
                <div key={i} className="q-item"><span className="q-arrow">→</span><span>{ce}</span></div>
              ))}
            </div>
          )}

          {/* Coaching note */}
          {aiResult.coachingNote && (
            <div className="note-block" style={{ marginBottom: 16 }}>
              <span className="section-label">Coaching note</span>
              <p className="body-sm" style={{ color: 'var(--fg)', marginTop: 4 }}>{aiResult.coachingNote}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── MAIN COMPONENT ───────────────────────────────────────────
export default function MissionControl({ session, updateSession, navigate }) {
  const [activeTab, setActiveTab] = useState('prep')
  const [aiResult, setAiResult] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState(null)
  const [contextOpen, setContextOpen] = useState(!session.product || !session.callType)

  async function buildAIPlan() {
    if (!session.product || !session.account) return
    setAiError(null)
    setAiLoading(true)
    setAiResult(null)
    try {
      const res = await fetch('/.netlify/functions/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'prep',
          product: session.product,
          account: session.account,
          industry: session.industry,
          callType: session.callType,
          knowSoFar: session.knowSoFar,
          buyerName: session.buyerName,
          buyerTitle: session.buyerTitle,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error + (data.raw ? ': ' + data.raw.slice(0, 100) : ''))
      setAiResult(data)
    } catch (e) {
      setAiError('Could not reach the AI. Check your connection or API key.')
    } finally {
      setAiLoading(false)
    }
  }

  const TABS = [
    { id: 'prep',      label: 'AI Prep' },
    { id: 'play',      label: 'The Play' },
    { id: 'discovery', label: 'Discovery Qs' },
    { id: 'objections',label: 'Objections' },
  ]

  const product = bible.products.find(p => p.id === session.product)
  const callTypeLabel = CALL_TYPES.find(c => c.id === session.callType)?.label

  return (
    <div className="mc-layout">
      {/* ── SIDEBAR ── */}
      <aside className="mc-sidebar">

        {/* Product selector */}
        <div className="mc-sidebar-section">
          <span className="section-label" style={{ marginBottom: 10 }}>Product</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid #000' }}>
            {bible.products.map(p => (
              <button
                key={p.id}
                className={`product-btn ${session.product === p.id ? 'active' : ''}`}
                style={{ borderBottom: '1px solid var(--border-light)' }}
                onClick={() => { updateSession({ product: p.id }); setAiResult(null) }}
              >
                <span className="product-btn-name">{PRODUCT_NAMES[p.id]}</span>
                <span className="product-btn-sub">{p.buyers.slice(0, 2).join(' · ')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Call type */}
        <div className="mc-sidebar-section">
          <span className="section-label" style={{ marginBottom: 10 }}>Call Type</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid #000' }}>
            {CALL_TYPES.map(ct => (
              <button
                key={ct.id}
                onClick={() => { updateSession({ callType: ct.id }); setAiResult(null) }}
                style={{
                  background: session.callType === ct.id ? '#000' : '#fff',
                  color: session.callType === ct.id ? '#fff' : '#525252',
                  border: 'none',
                  borderBottom: '1px solid var(--border-light)',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  fontFamily: 'var(--mono)',
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  textAlign: 'left',
                  transition: 'all 100ms',
                }}
              >
                {ct.label}
              </button>
            ))}
          </div>
        </div>

        {/* Account context */}
        <div className="mc-sidebar-section">
          <span className="section-label" style={{ marginBottom: 10 }}>Account Context</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="field-group">
              <span className="field-label">Account</span>
              <input
                className="field-input"
                placeholder="Company name"
                value={session.account}
                onChange={e => { updateSession({ account: e.target.value }); setAiResult(null) }}
              />
            </div>
            <div className="field-group">
              <span className="field-label">Industry</span>
              <input
                className="field-input"
                placeholder="e.g. Manufacturing"
                value={session.industry}
                onChange={e => updateSession({ industry: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Product quick ref */}
        {product && (
          <div className="mc-sidebar-section">
            <span className="section-label" style={{ marginBottom: 10 }}>Product Signal</span>
            <div style={{ marginBottom: 10 }}>
              <p className="body-sm" style={{ fontStyle: 'italic', color: 'var(--fg)' }}>"{product.killerQuestion}"</p>
            </div>
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 10 }}>
              <span className="section-label" style={{ marginBottom: 4 }}>Top buyers</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {product.buyers.map(b => <span key={b} className="tag">{b}</span>)}
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 10, marginTop: 10 }}>
              <span className="section-label" style={{ marginBottom: 4 }}>Compelling events</span>
              {product.compellingEvents.slice(0, 3).map((ce, i) => (
                <p key={i} className="body-sm" style={{ marginBottom: 4 }}>→ {ce}</p>
              ))}
            </div>
          </div>
        )}

        {/* Email shortcut */}
        <div className="mc-sidebar-section">
          <button
            className="btn-outline btn-full"
            onClick={() => navigate('email')}
          >
            Write Email →
          </button>
        </div>
      </aside>

      {/* ── MAIN PANEL ── */}
      <div className="mc-panel" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Status bar */}
        <div className="context-bar">
          {session.product
            ? <><span className="context-label">Product</span><span className="context-value">{PRODUCT_FULL[session.product]}</span></>
            : <span className="context-label" style={{ color: '#c00' }}>← Select a product</span>
          }
          {session.product && <div className="context-sep" />}
          {session.callType
            ? <><span className="context-label">Call</span><span className="context-value">{callTypeLabel}</span></>
            : <span className="context-label" style={{ color: '#c00' }}>← Select call type</span>
          }
          {session.account && <><div className="context-sep" /><span className="context-label">Account</span><span className="context-value">{session.account}</span></>}
          {aiResult && <><div className="context-sep" /><span className="ai-label"><span className="ai-dot" />AI plan active</span></>}
        </div>

        {/* Tabs */}
        <div className="mc-panel-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`mc-panel-tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
          {activeTab === 'prep'       && <PrepPanel session={session} aiResult={aiResult} aiLoading={aiLoading} aiError={aiError} onBuild={buildAIPlan} updateSession={updateSession} />}
          {activeTab === 'play'       && <PlayPanel session={session} />}
          {activeTab === 'discovery'  && <DiscoveryPanel session={session} aiResult={aiResult} />}
          {activeTab === 'objections' && <ObjectionPanel session={session} aiResult={aiResult} />}
        </div>
      </div>
    </div>
  )
}
