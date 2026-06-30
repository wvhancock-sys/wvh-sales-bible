import { useState } from 'react'
import bible from '../data/bible.json'
import usecases from '../data/usecases.json'

// ── helpers ──────────────────────────────────────────────────
function CopyBtn({ text, style = {} }) {
  const [copied, setCopied] = useState(false)
  function copy() { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return <button className={`copy-btn ${copied ? 'copied' : ''}`} style={style} onClick={copy}>{copied ? '✓ copied' : 'copy'}</button>
}

const CALL_TYPES = [
  { id: 'inbound',    label: 'Inbound Discovery' },
  { id: 'outbound',   label: 'Outbound Discovery' },
  { id: 'validation', label: 'Validation' },
  { id: 'exec',       label: 'Exec Alignment' },
  { id: 'stalled',    label: 'Stalled Deal' },
]

const SPICED = ['Situation', 'Pain', 'Impact', 'Critical Event', 'Decision']

const PRODUCT_FULL = {
  orchestrate: 'watsonx Orchestrate',
  bob: 'IBM Bob (Code Assistant)',
  governance: 'watsonx.governance',
}

// Resolves the active use case -- either a pre-built one from usecases.json,
// or the AI-generated custom one stored on the session. Every panel reads
// through this so custom use cases get full parity with pre-built ones.
function getActiveUseCase(session) {
  if (session.customUseCase) return session.customUseCase
  return usecases.useCases.find(u => u.id === session.useCase) || null
}

// ── Diagnostic ───────────────────────────────────────────────
function DiagnosticPanel({ onComplete }) {
  const { questions, routes } = usecases.diagnostic
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)

  function answer(qId, value) {
    const next = { ...answers, [qId]: value }
    setAnswers(next)
    if (Object.keys(next).length === questions.length) {
      const fn = next['q1'], pressure = next['q2'], signal = next['q3']
      const match = routes.find(r =>
        r.function === fn &&
        r.pressure.includes(pressure) &&
        r.signal.includes(signal)
      ) || routes.find(r =>
        r.function === fn &&
        r.pressure.includes(pressure)
      ) || routes.find(r => r.function === fn)
      setResult(match || null)
    }
  }

  if (result) {
    const uc = usecases.useCases.find(u => u.id === result.useCase)
    const persona = usecases.personas.find(p => p.id === result.persona)
    return (
      <div>
        <div style={{ marginBottom: 20 }}>
          <span className="section-label">Diagnostic complete</span>
          <div className="display-md" style={{ fontSize: '1.2rem', marginBottom: 8 }}>Here's your play.</div>
          <div style={{ border: '2px solid #000', padding: 20, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
              <span className="tag tag-inverted">{PRODUCT_FULL[result.product]}</span>
              <span className="tag">{uc?.name}</span>
              <span className="tag">{persona?.title}</span>
            </div>
            <p className="body-text" style={{ marginBottom: 8 }}>{result.reason}</p>
            {uc && <p className="body-sm" style={{ fontStyle: 'italic' }}>{uc.tagline}</p>}
          </div>
          {persona && (
            <div className="note-block" style={{ marginBottom: 16 }}>
              <span className="section-label">How to frame this conversation</span>
              <p className="body-sm" style={{ color: 'var(--fg)', marginTop: 4 }}>{persona.frame}</p>
              <p className="body-sm" style={{ marginTop: 8 }}><strong>Opening angle:</strong> {persona.openingAngle}</p>
              <p className="body-sm" style={{ marginTop: 4 }}><strong>Avoid:</strong> {persona.avoidSaying}</p>
              <p className="body-sm" style={{ marginTop: 4 }}><strong>Say instead:</strong> {persona.sayInstead}</p>
            </div>
          )}
          <button className="btn-primary" onClick={() => onComplete(result.product, result.useCase, result.persona)}>
            Load this play in Mission Control →
          </button>
          <button className="btn-ghost" style={{ marginLeft: 16 }} onClick={() => { setAnswers({}); setResult(null) }}>
            Start over
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <span className="section-label">Don't know what to sell yet?</span>
        <div className="display-md" style={{ fontSize: '1.2rem', marginBottom: 8 }}>Answer 3 questions. Get the right play.</div>
        <p className="body-sm">Based on what you know about the buyer right now.</p>
      </div>
      {questions.map((q, qi) => (
        <div key={q.id} style={{ marginBottom: 24, opacity: qi > 0 && !answers[questions[qi - 1].id] ? 0.3 : 1, pointerEvents: qi > 0 && !answers[questions[qi - 1].id] ? 'none' : 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted-fg)', letterSpacing: '0.1em' }}>0{qi + 1}</span>
            <span style={{ fontFamily: 'var(--body)', fontSize: 15, fontWeight: 'bold', color: 'var(--fg)' }}>{q.question}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, border: '1px solid var(--border-light)' }}>
            {q.options.map(opt => (
              <button
                key={opt.value}
                onClick={() => answer(q.id, opt.value)}
                style={{
                  background: answers[q.id] === opt.value ? '#000' : '#fff',
                  color: answers[q.id] === opt.value ? '#fff' : 'var(--muted-fg)',
                  border: 'none', borderRight: '1px solid var(--border-light)',
                  borderBottom: '1px solid var(--border-light)',
                  padding: '10px 14px', cursor: 'pointer',
                  fontFamily: 'var(--mono)', fontSize: 10,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  transition: 'all 100ms', textAlign: 'left',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Play Panel ───────────────────────────────────────────────
function PlayPanel({ session }) {
  const [step, setStep] = useState(0)
  const playMap = { inbound: 'play1', outbound: 'play2', validation: 'play3', exec: 'play4', stalled: 'play5' }
  const play = bible.plays.find(p => p.id === playMap[session.callType])
  if (!play) return <div style={{ padding: '40px 0', textAlign: 'center' }}><span className="section-label">Select a call type to see the play</span></div>
  const s = play.steps[step]
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <span className="section-label">Play</span>
        <div className="display-md" style={{ fontSize: '1.2rem' }}>{play.name}</div>
        <p className="body-sm" style={{ marginTop: 6 }}>{play.goal}</p>
      </div>
      {play.preCAllPrep && (
        <div style={{ marginBottom: 20 }}>
          <span className="section-label">Pre-call prep</span>
          {play.preCAllPrep.map((item, i) => <div key={i} className="q-item"><span className="q-arrow">→</span><span>{item}</span></div>)}
        </div>
      )}
      <hr className="section-rule-md" style={{ marginBottom: 20 }} />
      <div className="step-track">
        {play.steps.map((st, i) => (
          <button key={i} className={`step-item ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`} onClick={() => setStep(i)}>
            <span className="step-num">{i + 1}</span>
            <span className="step-name">{st.name.replace(/^Step \d+ · /, '').split('(')[0].trim()}</span>
          </button>
        ))}
      </div>
      <div>
        <div style={{ marginBottom: 16 }}>
          <span className="section-label">Step {step + 1} of {play.steps.length}</span>
          <div className="display-md" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.3rem)' }}>{s.name}</div>
          {s.time && <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted-fg)' }}>{s.time}</span>}
        </div>
        {s.why && <div className="note-block" style={{ marginBottom: 16 }}><span className="section-label">Why this works</span><p className="body-sm" style={{ marginTop: 4 }}>{s.why}</p></div>}
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
              <span className="section-label" style={{ marginBottom: 0 }}>Left-swing drop-ins</span>
            </div>
            {Object.entries(s.leftSwingDropIns).map(([stage, line]) => (
              <div key={stage} style={{ marginBottom: 12 }}>
                <span className="section-label">{stage}</span>
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
            : <span className="section-label" style={{ alignSelf: 'center', marginBottom: 0 }}>Play complete</span>}
        </div>
      </div>
    </div>
  )
}

// ── Discovery Panel ──────────────────────────────────────────
function DiscoveryPanel({ session, aiResult }) {
  const [activeStage, setActiveStage] = useState('Situation')
  const uc = getActiveUseCase(session)
  const product = bible.products.find(p => p.id === session.product)

  const aiGrouped = aiResult?.killerQuestions?.reduce((acc, q) => {
    if (!acc[q.stage]) acc[q.stage] = []
    acc[q.stage].push(q.question)
    return acc
  }, {}) || {}

  const getQs = (stage) => {
    if (aiGrouped[stage]?.length) return aiGrouped[stage]
    if (uc?.killerQuestions?.[stage]?.length) return uc.killerQuestions[stage]
    return product?.killerQuestions?.[stage] || []
  }

  const hasAI = aiResult?.killerQuestions?.length > 0
  const hasUC = !!uc

  return (
    <div>
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <span className="section-label">SPICED Discovery Questions</span>
          <div className="display-md" style={{ fontSize: '1.2rem' }}>
            {uc ? uc.name : session.account ? `For ${session.account}` : 'Select a use case'}
          </div>
          {uc && <p className="body-sm" style={{ marginTop: 4, fontStyle: 'italic' }}>{uc.tagline}</p>}
        </div>
        <div style={{ display: 'flex', gap: 6, flexDirection: 'column', alignItems: 'flex-end' }}>
          {hasAI && <span className="tag tag-inverted">AI-tailored</span>}
          {hasUC && !hasAI && <span className="tag">Use case specific</span>}
        </div>
      </div>

      <div className="spiced-tabs">
        {SPICED.map(stage => (
          <button key={stage} className={`spiced-tab ${activeStage === stage ? 'active' : ''}`} onClick={() => setActiveStage(stage)}>{stage}</button>
        ))}
      </div>

      <div style={{ minHeight: 180 }}>
        {getQs(activeStage).length > 0
          ? getQs(activeStage).map((q, i) => <div key={i} className="q-item"><span className="q-arrow">→</span><span>{q}</span></div>)
          : <p className="body-sm" style={{ padding: '20px 0' }}>No questions for this stage. Generate an AI plan or select a use case for tailored questions.</p>
        }
      </div>

      {uc && (
        <div style={{ marginTop: 24, borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
          <span className="section-label">Killer question for {uc.name}</span>
          <div className="script-block-sm" style={{ fontStyle: 'italic', marginTop: 8 }}>"{uc.killerQuestion}"</div>
        </div>
      )}

      {product?.universalFollowUps && (
        <div style={{ marginTop: 20, borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
          <span className="section-label">Universal follow-ups</span>
          {product.universalFollowUps.map((fu, i) => (
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

// ── Objection Panel ──────────────────────────────────────────
function ObjItem({ obj, open, toggle }) {
  return (
    <div className="obj-item">
      <button className="obj-trigger" onClick={toggle}>
        <span>"{obj.objection}"</span>
        <span className="obj-chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="obj-response">
          {obj.stage && !obj.isAI && <span className="section-label" style={{ marginBottom: 8 }}>{obj.stage} · {obj.pattern || ''}</span>}
          <div className="copy-wrap" style={{ position: 'relative' }}>
            <div className="script-block-sm">{obj.response}</div>
            <CopyBtn text={obj.response} />
          </div>
        </div>
      )}
    </div>
  )
}

function ObjectionPanel({ session, aiResult }) {
  const [open, setOpen] = useState(null)
  const uc = getActiveUseCase(session)

  const aiObjs = aiResult?.potentialObjections?.map((o, i) => ({ ...o, id: `ai-${i}`, isAI: true, stage: 'AI-generated' })) || []
  const ucObjs = uc?.objections?.map((o, i) => ({ ...o, id: `uc-${i}`, stage: `${uc.name} specific` })) || []
  const bibleObjs = bible.objections.filter(o => !o.products || o.products.includes(session.product))

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <span className="section-label">Objection Handlers</span>
        <div className="display-md" style={{ fontSize: '1.2rem' }}>Handle anything they throw at you</div>
        <p className="body-sm" style={{ marginTop: 6 }}>Acknowledge → Ask what's driving it → Isolate → Answer the real version.</p>
      </div>

      {aiObjs.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ borderBottom: '2px solid #000', paddingBottom: 8, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="ai-dot" />
            <span className="section-label" style={{ marginBottom: 0 }}>AI-generated for {session.account || 'this scenario'}</span>
          </div>
          {aiObjs.map(obj => <ObjItem key={obj.id} obj={obj} open={open === obj.id} toggle={() => setOpen(open === obj.id ? null : obj.id)} />)}
        </div>
      )}

      {ucObjs.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ borderBottom: '2px solid #000', paddingBottom: 8, marginBottom: 4 }}>
            <span className="section-label" style={{ marginBottom: 0 }}>{uc?.name} — use case objections</span>
          </div>
          {ucObjs.map(obj => <ObjItem key={obj.id} obj={obj} open={open === obj.id} toggle={() => setOpen(open === obj.id ? null : obj.id)} />)}
        </div>
      )}

      <div>
        {(aiObjs.length > 0 || ucObjs.length > 0) && (
          <div style={{ borderBottom: '2px solid #000', paddingBottom: 8, marginBottom: 4 }}>
            <span className="section-label" style={{ marginBottom: 0 }}>General objections from the Sales Bible</span>
          </div>
        )}
        {bibleObjs.map(obj => <ObjItem key={obj.id} obj={obj} open={open === obj.id} toggle={() => setOpen(open === obj.id ? null : obj.id)} />)}
      </div>
    </div>
  )
}

// ── Prep Panel ───────────────────────────────────────────────
function PrepPanel({ session, aiResult, aiLoading, aiError, onBuild, updateSession }) {
  const uc = getActiveUseCase(session)
  const persona = usecases.personas.find(p => p.id === session.persona)
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <span className="section-label">AI Call Prep</span>
        <div className="display-md" style={{ fontSize: '1.2rem' }}>
          {session.account ? `Build plan for ${session.account}` : 'Enter account to build a plan'}
        </div>
        <p className="body-sm" style={{ marginTop: 6 }}>
          {uc ? `Tailored to ${uc.name}.` : 'Select a use case for sharper output.'} {persona ? `Framed for a ${persona.title}.` : ''}
        </p>
      </div>

      {persona && (
        <div className="inverted-section" style={{ marginBottom: 20 }}>
          <span className="section-label" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>How to talk to a {persona.title}</span>
          <p style={{ fontFamily: 'var(--body)', fontSize: 14, color: '#fff', lineHeight: 1.7 }}>{persona.frame}</p>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 10 }}>Say: {persona.sayInstead}</p>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Avoid: {persona.avoidSaying}</p>
        </div>
      )}

      <div style={{ display: 'grid', gap: 16, marginBottom: 20 }}>
        <div className="field-group">
          <span className="field-label">What you already know</span>
          <textarea className="field-textarea" rows={3}
            placeholder="Job postings, recent news, earnings call language, org changes, known projects, what they said in the first 2 minutes..."
            value={session.knowSoFar}
            onChange={e => updateSession({ knowSoFar: e.target.value })}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="field-group">
            <span className="field-label">Buyer name</span>
            <input className="field-input" placeholder="Sarah Chen" value={session.buyerName} onChange={e => updateSession({ buyerName: e.target.value })} />
          </div>
          <div className="field-group">
            <span className="field-label">Buyer title</span>
            <input className="field-input" placeholder="CFO" value={session.buyerTitle} onChange={e => updateSession({ buyerTitle: e.target.value })} />
          </div>
        </div>
      </div>

      {aiError && <div className="error-msg">{aiError}</div>}
      <button className="btn-primary btn-full" onClick={onBuild} disabled={aiLoading || !session.product || !session.account}>
        {aiLoading
          ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Building plan for {session.account}...</>
          : <><span className="ai-dot" style={{ marginRight: 8 }} /> Build AI Call Plan</>}
      </button>
      {(!session.product || !session.account) && <p className="body-sm" style={{ marginTop: 8, textAlign: 'center' }}>Set product and account in the sidebar first.</p>}

      {aiResult && !aiLoading && (
        <div style={{ marginTop: 28 }}>
          <hr className="section-rule-md" style={{ marginBottom: 20 }} />

          {aiResult.twoSentenceHypothesis && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}><span className="ai-dot" /><span className="section-label" style={{ marginBottom: 0 }}>Your hypothesis</span></div>
              <div className="copy-wrap" style={{ position: 'relative' }}>
                <div className="script-block">{aiResult.twoSentenceHypothesis}</div>
                <CopyBtn text={aiResult.twoSentenceHypothesis} />
              </div>
              {aiResult.fourPartHypothesis && (
                <div style={{ marginTop: 12, border: '1px solid var(--border-light)', background: 'var(--muted)' }}>
                  {['pattern','gap','proof','question'].map(k => (
                    <div key={k} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-light)' }}>
                      <span className="section-label" style={{ marginBottom: 4 }}>{k}</span>
                      <p className="body-sm" style={{ color: 'var(--fg)' }}>{aiResult.fourPartHypothesis[k]}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {aiResult.provocation && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}><span className="ai-dot" /><span className="section-label" style={{ marginBottom: 0 }}>Your provocation</span></div>
              {aiResult.provocation.openingLine && (
                <div style={{ border: '1px solid var(--border-light)', padding: '12px 16px', background: 'var(--muted)', marginBottom: 10 }}>
                  <span className="section-label">Opening line</span>
                  <p style={{ fontFamily: 'var(--display)', fontStyle: 'italic', fontSize: 16 }}>{aiResult.provocation.openingLine}</p>
                </div>
              )}
              <div className="copy-wrap" style={{ position: 'relative' }}>
                <div className="script-block">{[aiResult.provocation.pattern, aiResult.provocation.tension, aiResult.provocation.implication].filter(Boolean).join('\n\n')}</div>
                <CopyBtn text={[aiResult.provocation.pattern, aiResult.provocation.tension, aiResult.provocation.implication].filter(Boolean).join('\n\n')} />
              </div>
            </div>
          )}

          {aiResult.compellingEventIdeas?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}><span className="ai-dot" /><span className="section-label" style={{ marginBottom: 0 }}>Compelling event angles</span></div>
              {aiResult.compellingEventIdeas.map((ce, i) => <div key={i} className="q-item"><span className="q-arrow">→</span><span>{ce}</span></div>)}
            </div>
          )}

          {aiResult.coachingNote && (
            <div className="note-block">
              <span className="section-label">Coaching note</span>
              <p className="body-sm" style={{ color: 'var(--fg)', marginTop: 4 }}>{aiResult.coachingNote}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Custom Use Case Builder ──────────────────────────────────
// For any scenario that doesn't match a pre-built use case. Generates
// the same depth (questions, objections, CEs, proof) on demand and
// stores it on the session so every tab picks it up automatically.
function CustomUseCaseBuilder({ session, updateSession, onBack }) {
  const [description, setDescription] = useState(session.knowSoFar || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [preview, setPreview] = useState(null)

  async function generate() {
    if (!session.product || !description.trim()) return
    setError(null); setLoading(true); setPreview(null)
    try {
      const res = await fetch('/.netlify/functions/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'generate-usecase',
          product: session.product,
          account: session.account,
          industry: session.industry,
          situationDescription: description,
        }),
      })
      const text = await res.text()
      let data
      try { data = JSON.parse(text) } catch (e) { throw new Error('Parse error: ' + text.slice(0, 150)) }
      if (data.error) throw new Error(data.error)
      setPreview(data)
    } catch (e) {
      setError(e.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  function useThis() {
    updateSession({ customUseCase: preview, useCase: '', persona: '' })
    onBack()
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <span className="section-label">Outside the standard playbook?</span>
        <div className="display-md" style={{ fontSize: '1.2rem', marginBottom: 8 }}>Describe the situation. We'll build the play.</div>
        <p className="body-sm">For any scenario that doesn't match a pre-built use case. Be as specific as you can -- function, what's broken, what they're trying to do.</p>
      </div>

      <div className="field-group" style={{ marginBottom: 16 }}>
        <span className="field-label">What's the situation?</span>
        <textarea
          className="field-textarea"
          rows={5}
          placeholder="e.g. 'Legal team at an insurance company manually reviews every contract for compliance clauses before it goes to underwriting. Takes 3 days per contract, and they're drowning in volume after an acquisition.'"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn-primary" onClick={generate} disabled={loading || !description.trim() || !session.product}>
          {loading
            ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Building the play...</>
            : <><span className="ai-dot" style={{ marginRight: 8 }} /> Generate Use Case</>}
        </button>
        <button className="btn-outline" onClick={onBack}>← Back</button>
      </div>

      {!session.product && <p className="body-sm" style={{ marginTop: 10 }}>Select a product in the sidebar first.</p>}

      {preview && !loading && (
        <div style={{ marginTop: 32 }}>
          <hr className="section-rule-md" style={{ marginBottom: 20 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span className="ai-dot" />
            <span className="section-label" style={{ marginBottom: 0 }}>Generated use case</span>
          </div>

          <div style={{ border: '2px solid #000', padding: 20, marginBottom: 16 }}>
            <div className="display-md" style={{ fontSize: '1.2rem', marginBottom: 6 }}>{preview.name}</div>
            <p className="body-sm" style={{ fontStyle: 'italic', marginBottom: 14 }}>{preview.tagline}</p>

            <div style={{ marginBottom: 12 }}>
              <span className="section-label">Pattern</span>
              <p className="body-text">{preview.pattern}</p>
            </div>
            <div style={{ marginBottom: 12 }}>
              <span className="section-label">Gap</span>
              <p className="body-text">{preview.gap}</p>
            </div>
            <div style={{ marginBottom: 12 }}>
              <span className="section-label">Killer question</span>
              <p className="body-text" style={{ fontStyle: 'italic' }}>"{preview.killerQuestion}"</p>
            </div>

            {preview.killerQuestions && (
              <div style={{ marginBottom: 12 }}>
                <span className="section-label">Discovery questions generated</span>
                <p className="body-sm">{Object.values(preview.killerQuestions).flat().length} questions across all SPICED stages</p>
              </div>
            )}

            {preview.objections?.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <span className="section-label">Objections handled</span>
                <p className="body-sm">{preview.objections.length} objection responses generated</p>
              </div>
            )}
          </div>

          {preview.coachingNote && (
            <div className="note-block" style={{ marginBottom: 16 }}>
              <span className="section-label">Coaching note on fit</span>
              <p className="body-sm" style={{ color: 'var(--fg)', marginTop: 4 }}>{preview.coachingNote}</p>
            </div>
          )}

          <button className="btn-primary" onClick={useThis}>
            Use this play in Mission Control →
          </button>
          <button className="btn-ghost" style={{ marginLeft: 16 }} onClick={() => setPreview(null)}>
            Try a different description
          </button>
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
  const [subView, setSubView] = useState(null) // null | 'diagnostic' | 'custom'

  const selectedUC = getActiveUseCase(session)
  const selectedPersona = usecases.personas.find(p => p.id === session.persona)
  const productUseCases = usecases.useCases.filter(u => u.productId === session.product)
  const callTypeLabel = CALL_TYPES.find(c => c.id === session.callType)?.label
  const isCustomUC = !!session.customUseCase

  function handleDiagnosticComplete(product, useCase, persona) {
    updateSession({ product, useCase, persona, customUseCase: null })
    setSubView(null)
    setAiResult(null)
  }

  async function buildAIPlan() {
    if (!session.product || !session.account) return
    setAiError(null); setAiLoading(true); setAiResult(null)

    const payload = {
      product: session.product,
      account: session.account,
      industry: session.industry,
      callType: session.callType,
      knowSoFar: session.knowSoFar,
      buyerName: session.buyerName,
      buyerTitle: session.buyerTitle,
      useCaseName: selectedUC?.name || '',
      personaTitle: selectedPersona?.title || '',
      personaFrame: selectedPersona?.frame || '',
    }

    async function callAI(mode) {
      const res = await fetch('/.netlify/functions/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, ...payload }),
      })
      const text = await res.text()
      try { return JSON.parse(text) } catch (e) { throw new Error('Parse error: ' + text.slice(0, 150)) }
    }

    try {
      const [hyp, qs] = await Promise.all([callAI('prep-hypothesis'), callAI('prep-questions')])
      if (hyp.error) throw new Error(hyp.error)
      if (qs.error) throw new Error(qs.error)
      setAiResult({ ...hyp, ...qs })
    } catch (e) {
      setAiError(e.message || 'Unknown error')
    } finally {
      setAiLoading(false)
    }
  }

  const TABS = [
    { id: 'prep', label: 'AI Prep' },
    { id: 'play', label: 'The Play' },
    { id: 'discovery', label: 'Discovery Qs' },
    { id: 'objections', label: 'Objections' },
  ]

  if (subView === 'diagnostic') {
    return (
      <div className="mc-layout">
        <aside className="mc-sidebar">
          <div className="mc-sidebar-section">
            <button className="btn-ghost" onClick={() => setSubView(null)}>← Back to Mission Control</button>
          </div>
        </aside>
        <div className="mc-panel" style={{ padding: '32px' }}>
          <DiagnosticPanel onComplete={handleDiagnosticComplete} />
        </div>
      </div>
    )
  }

  if (subView === 'custom') {
    return (
      <div className="mc-layout">
        <aside className="mc-sidebar">
          <div className="mc-sidebar-section">
            <button className="btn-ghost" onClick={() => setSubView(null)}>← Back to Mission Control</button>
          </div>
          {session.product && (
            <div className="mc-sidebar-section">
              <span className="section-label" style={{ marginBottom: 8 }}>Product</span>
              <span className="tag tag-inverted">{PRODUCT_FULL[session.product]}</span>
            </div>
          )}
        </aside>
        <div className="mc-panel" style={{ padding: '32px' }}>
          <CustomUseCaseBuilder session={session} updateSession={updateSession} onBack={() => setSubView(null)} />
        </div>
      </div>
    )
  }

  return (
    <div className="mc-layout">
      {/* ── SIDEBAR ── */}
      <aside className="mc-sidebar">

        {/* Product */}
        <div className="mc-sidebar-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span className="section-label" style={{ marginBottom: 0 }}>Product</span>
            <button className="btn-ghost" style={{ padding: 0, fontSize: 9 }} onClick={() => setSubView('diagnostic')}>
              Not sure? →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid #000' }}>
            {bible.products.map(p => (
              <button key={p.id}
                onClick={() => { updateSession({ product: p.id, useCase: '', persona: '', customUseCase: null }); setAiResult(null) }}
                style={{
                  background: session.product === p.id ? '#000' : '#fff',
                  color: session.product === p.id ? '#fff' : 'var(--muted-fg)',
                  border: 'none', borderBottom: '1px solid var(--border-light)',
                  padding: '14px', cursor: 'pointer', textAlign: 'left', transition: 'all 100ms',
                }}>
                <div style={{ fontFamily: 'var(--display)', fontSize: 14, fontWeight: 700, color: 'inherit', marginBottom: 2 }}>
                  {p.id === 'bob' ? 'IBM Bob' : p.id === 'orchestrate' ? 'Orchestrate' : 'governance'}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: session.product === p.id ? 'rgba(255,255,255,0.6)' : 'var(--muted-fg)' }}>
                  {p.buyers.slice(0,2).join(' · ')}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Use Case -- appears once product is selected */}
        {session.product && (
          <div className="mc-sidebar-section">
            <span className="section-label" style={{ marginBottom: 10 }}>Use Case</span>

            {isCustomUC ? (
              <div style={{ border: '2px solid #000', padding: '12px 14px', marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div>
                    <span className="tag tag-inverted" style={{ marginBottom: 6 }}>Custom</span>
                    <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 13, marginTop: 6 }}>{session.customUseCase.name}</div>
                  </div>
                </div>
                <button className="btn-ghost" style={{ marginTop: 8, padding: 0, fontSize: 9 }} onClick={() => updateSession({ customUseCase: null })}>
                  Clear and pick standard →
                </button>
              </div>
            ) : (
              productUseCases.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border-light)', marginBottom: 8 }}>
                  {productUseCases.map(uc => (
                    <button key={uc.id}
                      onClick={() => { updateSession({ useCase: uc.id, customUseCase: null }); setAiResult(null) }}
                      style={{
                        background: session.useCase === uc.id ? '#000' : '#fff',
                        color: session.useCase === uc.id ? '#fff' : 'var(--muted-fg)',
                        border: 'none', borderBottom: '1px solid var(--border-light)',
                        padding: '10px 14px', cursor: 'pointer', textAlign: 'left', transition: 'all 100ms',
                        fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
                      }}>
                      {uc.shortName}
                    </button>
                  ))}
                </div>
              )
            )}

            {!isCustomUC && (
              <button className="btn-outline btn-full" style={{ fontSize: 10 }} onClick={() => setSubView('custom')}>
                + Build Custom Use Case
              </button>
            )}
          </div>
        )}

        {/* Persona -- appears once a pre-built use case is selected (custom UCs generate their own framing) */}
        {session.useCase && selectedUC && !isCustomUC && selectedUC.personas && (
          <div className="mc-sidebar-section">
            <span className="section-label" style={{ marginBottom: 10 }}>Who's in the room?</span>
            <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border-light)' }}>
              {selectedUC.personas.map(ptitle => {
                const pid = usecases.personas.find(p => p.title === ptitle)?.id || ptitle.toLowerCase()
                return (
                  <button key={ptitle}
                    onClick={() => updateSession({ persona: pid })}
                    style={{
                      background: session.persona === pid ? '#000' : '#fff',
                      color: session.persona === pid ? '#fff' : 'var(--muted-fg)',
                      border: 'none', borderBottom: '1px solid var(--border-light)',
                      padding: '10px 14px', cursor: 'pointer', textAlign: 'left', transition: 'all 100ms',
                      fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
                    }}>
                    {ptitle}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Call Type */}
        <div className="mc-sidebar-section">
          <span className="section-label" style={{ marginBottom: 10 }}>Call Type</span>
          <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border-light)' }}>
            {CALL_TYPES.map(ct => (
              <button key={ct.id}
                onClick={() => { updateSession({ callType: ct.id }); setAiResult(null) }}
                style={{
                  background: session.callType === ct.id ? '#000' : '#fff',
                  color: session.callType === ct.id ? '#fff' : 'var(--muted-fg)',
                  border: 'none', borderBottom: '1px solid var(--border-light)',
                  padding: '10px 14px', cursor: 'pointer', fontFamily: 'var(--mono)',
                  fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
                  textAlign: 'left', transition: 'all 100ms',
                }}>
                {ct.label}
              </button>
            ))}
          </div>
        </div>

        {/* Account */}
        <div className="mc-sidebar-section">
          <span className="section-label" style={{ marginBottom: 10 }}>Account</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="field-group">
              <span className="field-label">Company name</span>
              <input className="field-input" placeholder="e.g. Caterpillar" value={session.account} onChange={e => { updateSession({ account: e.target.value }); setAiResult(null) }} />
            </div>
            <div className="field-group">
              <span className="field-label">Industry</span>
              <input className="field-input" placeholder="e.g. Manufacturing" value={session.industry} onChange={e => updateSession({ industry: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Use case quick ref */}
        {selectedUC && (
          <div className="mc-sidebar-section">
            <span className="section-label" style={{ marginBottom: 8 }}>Use Case Signal</span>
            <p style={{ fontFamily: 'var(--body)', fontStyle: 'italic', fontSize: 13, color: 'var(--fg)', marginBottom: 10, lineHeight: 1.5 }}>
              "{selectedUC.killerQuestion}"
            </p>
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 10 }}>
              <span className="section-label" style={{ marginBottom: 4 }}>Top compelling events</span>
              {selectedUC.compellingEvents.slice(0,3).map((ce, i) => <p key={i} className="body-sm" style={{ marginBottom: 3 }}>→ {ce}</p>)}
            </div>
          </div>
        )}

        <div className="mc-sidebar-section">
          <button className="btn-outline btn-full" onClick={() => navigate('email')}>Write Email →</button>
        </div>
      </aside>

      {/* ── MAIN PANEL ── */}
      <div className="mc-panel" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Context bar */}
        <div className="context-bar">
          {session.product
            ? <><span className="context-label">Product</span><span className="context-value">{PRODUCT_FULL[session.product]}</span></>
            : <span className="context-label" style={{ color: '#c00' }}>← Select a product</span>}
          {(session.useCase || isCustomUC) && <><div className="context-sep" /><span className="context-label">Use case</span><span className="context-value">{selectedUC?.shortName || selectedUC?.name}</span></>}
          {session.persona && <><div className="context-sep" /><span className="context-label">Persona</span><span className="context-value">{selectedPersona?.title}</span></>}
          {session.callType && <><div className="context-sep" /><span className="context-label">Call</span><span className="context-value">{callTypeLabel}</span></>}
          {session.account && <><div className="context-sep" /><span className="context-label">Account</span><span className="context-value">{session.account}</span></>}
          {aiResult && <><div className="context-sep" /><span className="ai-label"><span className="ai-dot" />AI active</span></>}
        </div>

        {/* Tabs */}
        <div className="mc-panel-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`mc-panel-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
          ))}
        </div>

        {/* Content */}
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
