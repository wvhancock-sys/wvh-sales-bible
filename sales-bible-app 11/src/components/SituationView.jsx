import { useState } from 'react'
import bible from '../data/bible.json'
import usecases from '../data/usecases.json'
import EmailGenerator from './EmailGenerator'

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  function copy() { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copy}>
      {copied ? '✓ copied' : 'copy'}
    </button>
  )
}

function ScriptBlock({ text, label }) {
  return (
    <div className="copy-wrap" style={{ position: 'relative', marginTop: 8 }}>
      {label && <span className="section-label" style={{ display: 'block', marginBottom: 6 }}>{label}</span>}
      <div className="script-block">{text}</div>
      <CopyBtn text={text} />
    </div>
  )
}

// ── Cold call tree ────────────────────────────────────────────
function ColdCallTree({ situation }) {
  const [phase, setPhase] = useState('opening') // opening | objection | engagement | close
  const [activeBranch, setActiveBranch] = useState(null)
  const [activeSubBranch, setActiveSubBranch] = useState(null)

  function BranchBtn({ label, id, active, onClick }) {
    return (
      <button
        onClick={onClick}
        style={{
          background: active ? '#000' : 'var(--muted)',
          color: active ? '#fff' : 'var(--ink)',
          border: 'none',
          borderBottom: '1px solid var(--border-light)',
          padding: '12px 16px',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'var(--body)',
          fontSize: 14,
          fontStyle: active ? 'normal' : 'italic',
          width: '100%',
          transition: 'all 100ms',
        }}
      >{label}</button>
    )
  }

  const phases = [
    { id: 'opening', label: 'Opening' },
    { id: 'objection', label: 'Objections' },
    { id: 'engagement', label: 'Engagement' },
    { id: 'close', label: 'Close' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <p className="body-sm">Tap where the conversation went. The exact next line appears.</p>
      </div>

      {/* Phase nav */}
      <div className="mc-panel-tabs" style={{ marginBottom: 20 }}>
        {phases.map(p => (
          <button key={p.id} className={`mc-panel-tab ${phase === p.id ? 'active' : ''}`}
            onClick={() => { setPhase(p.id); setActiveBranch(null); setActiveSubBranch(null) }}>
            {p.label}
          </button>
        ))}
      </div>

      {phase === 'opening' && (
        <div>
          <span className="section-label">What happened when they picked up?</span>
          {situation.openingBranches.map(branch => (
            <div key={branch.id} style={{ marginBottom: 4 }}>
              <BranchBtn
                label={branch.label}
                id={branch.id}
                active={activeBranch === branch.id}
                onClick={() => { setActiveBranch(activeBranch === branch.id ? null : branch.id); setActiveSubBranch(null) }}
              />
              {activeBranch === branch.id && (
                <div style={{ background: 'var(--muted)', padding: 16, marginBottom: 4 }}>
                  {branch.script && <ScriptBlock text={branch.script} />}
                  {branch.notes && (
                    <div className="note-block" style={{ marginTop: 12 }}>
                      <span className="section-label">Coaching</span>
                      <p className="body-sm">{branch.notes}</p>
                    </div>
                  )}
                  {branch.followUp && (
                    <div className="note-block" style={{ marginTop: 8 }}>
                      <span className="section-label">Follow-up</span>
                      <p className="body-sm">{branch.followUp}</p>
                    </div>
                  )}
                  {/* Sub-branches (gatekeeper) */}
                  {branch.branches && (
                    <div style={{ marginTop: 12 }}>
                      <span className="section-label">What did they say?</span>
                      {branch.branches.map((sub, i) => (
                        <div key={i} style={{ marginBottom: 4 }}>
                          <BranchBtn
                            label={sub.label}
                            active={activeSubBranch === `${branch.id}-${i}`}
                            onClick={() => setActiveSubBranch(activeSubBranch === `${branch.id}-${i}` ? null : `${branch.id}-${i}`)}
                          />
                          {activeSubBranch === `${branch.id}-${i}` && (
                            <div style={{ background: '#fff', padding: 14, border: '1px solid var(--border-light)' }}>
                              <ScriptBlock text={sub.script} />
                              {sub.notes && <p className="body-sm" style={{ marginTop: 10, color: 'var(--muted-fg)' }}>{sub.notes}</p>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {/* What to do next */}
                  {branch.nextBranches && (
                    <div style={{ marginTop: 12 }}>
                      <p className="body-sm" style={{ color: 'var(--muted-fg)' }}>→ Now tap the <strong>Objections</strong> or <strong>Engagement</strong> tab for what they say next.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {phase === 'objection' && (
        <div>
          <span className="section-label">What objection did you hit?</span>
          {situation.objectionBranches.map(branch => (
            <div key={branch.id} style={{ marginBottom: 4 }}>
              <BranchBtn
                label={branch.label}
                active={activeBranch === branch.id}
                onClick={() => setActiveBranch(activeBranch === branch.id ? null : branch.id)}
              />
              {activeBranch === branch.id && (
                <div style={{ background: 'var(--muted)', padding: 16 }}>
                  <ScriptBlock text={branch.script} />
                  {branch.notes && <div className="note-block" style={{ marginTop: 12 }}><p className="body-sm">{branch.notes}</p></div>}
                  {branch.ifTheyStillSayNo && (
                    <div style={{ marginTop: 12 }}>
                      <span className="section-label">If they still say no</span>
                      <ScriptBlock text={branch.ifTheyStillSayNo} />
                    </div>
                  )}
                  {branch.ifItReallyIsntAPriority && (
                    <div style={{ marginTop: 12 }}>
                      <span className="section-label">If it really isn't a priority</span>
                      <ScriptBlock text={branch.ifItReallyIsntAPriority} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {phase === 'engagement' && (
        <div>
          <span className="section-label">How are they responding?</span>
          {situation.engagementBranches.map(branch => (
            <div key={branch.id} style={{ marginBottom: 4 }}>
              <BranchBtn
                label={branch.label}
                active={activeBranch === branch.id}
                onClick={() => setActiveBranch(activeBranch === branch.id ? null : branch.id)}
              />
              {activeBranch === branch.id && (
                <div style={{ background: 'var(--muted)', padding: 16 }}>
                  <ScriptBlock text={branch.script} />
                  {branch.notes && <div className="note-block" style={{ marginTop: 12 }}><p className="body-sm">{branch.notes}</p></div>}
                  {branch.nextStep && <div className="note-block" style={{ marginTop: 8 }}><span className="section-label">Next</span><p className="body-sm">{branch.nextStep}</p></div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {phase === 'close' && (
        <div>
          <span className="section-label">How do you want to close this call?</span>
          {situation.closeBranches.map(branch => (
            <div key={branch.id} style={{ marginBottom: 4 }}>
              <BranchBtn
                label={branch.label}
                active={activeBranch === branch.id}
                onClick={() => setActiveBranch(activeBranch === branch.id ? null : branch.id)}
              />
              {activeBranch === branch.id && (
                <div style={{ background: 'var(--muted)', padding: 16 }}>
                  <ScriptBlock text={branch.script} />
                  {branch.notes && <div className="note-block" style={{ marginTop: 12 }}><p className="body-sm">{branch.notes}</p></div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Play viewer ───────────────────────────────────────────────
function PlayView({ situation, session, updateSession }) {
  const [step, setStep] = useState(0)
  const [leftSwingOpen, setLeftSwingOpen] = useState(false)
  const steps = situation.steps || []
  if (!steps.length) return <p className="body-sm">No steps found.</p>
  const s = steps[step]

  // Product context for questions
  const product = bible.products.find(p => p.id === session.product)

  return (
    <div>
      {situation.goal && (
        <div className="callout olive" style={{ marginBottom: 20 }}>
          <div className="callout-label">Goal</div>
          <p style={{ margin: 0, fontSize: 14 }}>{situation.goal}</p>
        </div>
      )}
      {situation.prereq && (
        <div className="callout" style={{ marginBottom: 20, borderLeftColor: 'var(--clay)' }}>
          <div className="callout-label" style={{ color: 'var(--clay)' }}>Prerequisite</div>
          <p style={{ margin: 0, fontSize: 13 }}>{situation.prereq}</p>
        </div>
      )}

      {/* Step nav */}
      <div className="step-track" style={{ marginBottom: 20 }}>
        {steps.map((st, i) => (
          <button key={i} className={`step-item ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`} onClick={() => setStep(i)}>
            <span className="step-num">{i + 1}</span>
            <span className="step-name">{st.name.split(' ')[0]}{st.name.split(' ')[1] ? ' ' + st.name.split(' ')[1] : ''}</span>
          </button>
        ))}
      </div>

      <div>
        <span className="section-label">Step {step + 1} of {steps.length} · {s.time || ''}</span>
        <div className="display-md" style={{ fontSize: '1.2rem', marginBottom: 12 }}>{s.name}</div>

        {s.why && (
          <div className="note-block" style={{ marginBottom: 14 }}>
            <span className="section-label">Why this works</span>
            <p className="body-sm" style={{ color: 'var(--ink)', marginTop: 4 }}>{s.why}</p>
          </div>
        )}

        {s.script && <ScriptBlock text={s.script} label="Script" />}

        {/* Sub-branches (exec alignment responses) */}
        {s.branches && (
          <div style={{ marginTop: 16 }}>
            <span className="section-label">What did the EB say?</span>
            {s.branches.map((b, i) => (
              <BranchItem key={i} branch={b} />
            ))}
          </div>
        )}

        {/* Left-swing drop-ins */}
        {s.leftSwing && (
          <div style={{ marginTop: 16 }}>
            <button
              className="btn-ghost"
              onClick={() => setLeftSwingOpen(!leftSwingOpen)}
              style={{ marginBottom: 8 }}
            >
              {leftSwingOpen ? '↑ Hide' : '↓ Show'} left-swing drop-ins
            </button>
            {leftSwingOpen && (
              <div style={{ border: '2px solid #000', borderBottom: '2px solid #000', padding: '12px 16px' }}>
                <span className="section-label" style={{ marginBottom: 12 }}>When energy drops — drop one of these</span>
                {Object.entries(s.leftSwing).map(([stage, line]) => (
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
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-light)' }}>
          <button className="btn-outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← Prev</button>
          {step < steps.length - 1
            ? <button className="btn-primary" onClick={() => setStep(step + 1)}>Next Step →</button>
            : <span className="section-label" style={{ alignSelf: 'center', marginBottom: 0 }}>✓ Play complete</span>
          }
        </div>
      </div>
    </div>
  )
}

function BranchItem({ branch }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ marginBottom: 4 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', background: open ? '#000' : 'var(--muted)', color: open ? '#fff' : 'var(--ink)',
          border: 'none', borderBottom: '1px solid var(--border-light)',
          padding: '11px 14px', cursor: 'pointer', textAlign: 'left',
          fontFamily: 'var(--body)', fontSize: 14, fontStyle: 'italic', transition: 'all 100ms',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <span>{branch.label}</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, opacity: 0.6 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ background: 'var(--muted)', padding: '12px 16px' }}>
          <ScriptBlock text={branch.script} />
        </div>
      )}
    </div>
  )
}

// ── Reference view ────────────────────────────────────────────
function ReferenceView({ situation }) {
  const [activeScript, setActiveScript] = useState(null)
  return (
    <div>
      {situation.principles && (
        <div style={{ marginBottom: 28 }}>
          <span className="section-label">Principles</span>
          {situation.principles.map((p, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000', padding: '10px 0', marginBottom: 10 }}>
                <h4 style={{ fontFamily: 'var(--display)', fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{p.title}</h4>
              </div>
              <p className="body-text">{p.body}</p>
            </div>
          ))}
        </div>
      )}
      {situation.scripts && (
        <div>
          <span className="section-label">Scripts for common situations</span>
          {situation.scripts.map((s, i) => (
            <div key={i} style={{ marginBottom: 4 }}>
              <button
                onClick={() => setActiveScript(activeScript === i ? null : i)}
                style={{
                  width: '100%', background: activeScript === i ? '#000' : 'var(--muted)', color: activeScript === i ? '#fff' : 'var(--ink)',
                  border: 'none', borderBottom: '1px solid var(--border-light)',
                  padding: '12px 16px', cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'var(--body)', fontSize: 14, fontStyle: 'italic', transition: 'all 100ms',
                }}
              >
                {s.situation}
              </button>
              {activeScript === i && (
                <div style={{ background: 'var(--muted)', padding: '12px 16px' }}>
                  <ScriptBlock text={s.script} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Objections view ───────────────────────────────────────────
function ObjectionsView({ situation, session }) {
  const [activeCategory, setActiveCategory] = useState(0)
  const [activeObj, setActiveObj] = useState(null)
  const [search, setSearch] = useState('')

  const allObjs = situation.categories.flatMap(c => c.objections.map(o => ({ ...o, category: c.name })))
  const filtered = search ? allObjs.filter(o => o.objection.toLowerCase().includes(search.toLowerCase())) : null

  const displayObjs = filtered || situation.categories[activeCategory]?.objections || []

  return (
    <div>
      <div className="callout slate" style={{ marginBottom: 20 }}>
        <div className="callout-label">The pattern</div>
        <p style={{ margin: 0, fontSize: 13 }}>{situation.pattern}</p>
      </div>

      <div className="form-group" style={{ marginBottom: 16 }}>
        <input
          className="field-input"
          placeholder="Search objections..."
          value={search}
          onChange={e => { setSearch(e.target.value); setActiveObj(null) }}
        />
      </div>

      {!search && (
        <div className="mc-panel-tabs" style={{ marginBottom: 16 }}>
          {situation.categories.map((cat, i) => (
            <button key={i} className={`mc-panel-tab ${activeCategory === i ? 'active' : ''}`}
              onClick={() => { setActiveCategory(i); setActiveObj(null) }}>
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {displayObjs.map((obj, i) => (
        <div key={i} className="obj-item">
          <button className="obj-trigger" onClick={() => setActiveObj(activeObj === i ? null : i)}>
            <span>"{obj.objection}"</span>
            <span className="obj-chevron">{activeObj === i ? '▲' : '▼'}</span>
          </button>
          {activeObj === i && (
            <div className="obj-response">
              {obj.pattern && <span className="section-label" style={{ marginBottom: 8 }}>{obj.pattern}</span>}
              <div className="copy-wrap" style={{ position: 'relative' }}>
                <div className="script-block-sm">{obj.response}</div>
                <CopyBtn text={obj.response} />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── MAIN SITUATION VIEW ───────────────────────────────────────
export default function SituationView({ situation, navigate, session, updateSession }) {
  const [tab, setTab] = useState('main')
  const [product, setProduct] = useState(session.product || '')
  const [useCase, setUseCase] = useState(session.useCase || '')

  if (!situation) return null

  const productObj = bible.products.find(p => p.id === product)
  const ucObj = usecases.useCases.find(u => u.id === useCase)
  const productUCs = usecases.useCases.filter(u => u.productId === product)

  const TABS = [
    { id: 'main', label: situation.type === 'tree' ? 'Script Tree' : situation.type === 'reference' ? 'Framework' : situation.type === 'objections' ? 'Objections' : situation.type === 'email' ? 'Email' : 'The Play' },
    { id: 'questions', label: 'Killer Questions' },
    { id: 'ai', label: 'AI Prep' },
  ]

  return (
    <div className="mc-layout">
      {/* Sidebar */}
      <aside className="mc-sidebar">
        <div className="mc-sidebar-section">
          <button className="btn-ghost" style={{ padding: 0 }} onClick={() => navigate('home')}>← All situations</button>
        </div>

        <div className="mc-sidebar-section">
          <span className="section-label" style={{ marginBottom: 4 }}>Situation</span>
          <div style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>{situation.name}</div>
          <p className="body-sm" style={{ marginTop: 4 }}>{situation.desc}</p>
        </div>

        {/* Product selector */}
        <div className="mc-sidebar-section">
          <span className="section-label" style={{ marginBottom: 10 }}>Product</span>
          <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid #000' }}>
            {bible.products.map(p => (
              <button key={p.id}
                onClick={() => { setProduct(p.id); setUseCase(''); updateSession({ product: p.id, useCase: '' }) }}
                style={{
                  background: product === p.id ? '#000' : '#fff',
                  color: product === p.id ? '#fff' : 'var(--muted-fg)',
                  border: 'none', borderBottom: '1px solid var(--border-light)',
                  padding: '12px 14px', cursor: 'pointer', textAlign: 'left', transition: 'all 100ms',
                }}>
                <div style={{ fontFamily: 'var(--display)', fontSize: 14, fontWeight: 700, color: 'inherit', marginBottom: 2 }}>
                  {p.id === 'bob' ? 'IBM Bob' : p.id === 'orchestrate' ? 'Orchestrate' : 'governance'}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: product === p.id ? 'rgba(255,255,255,0.55)' : 'var(--muted-fg)' }}>
                  {p.buyers.slice(0, 2).join(' · ')}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Use case */}
        {product && productUCs.length > 0 && (
          <div className="mc-sidebar-section">
            <span className="section-label" style={{ marginBottom: 10 }}>Use Case</span>
            <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border-light)', marginBottom: 8 }}>
              {productUCs.map(uc => (
                <button key={uc.id}
                  onClick={() => { setUseCase(uc.id); updateSession({ useCase: uc.id }) }}
                  style={{
                    background: useCase === uc.id ? '#000' : '#fff',
                    color: useCase === uc.id ? '#fff' : 'var(--muted-fg)',
                    border: 'none', borderBottom: '1px solid var(--border-light)',
                    padding: '9px 14px', cursor: 'pointer', textAlign: 'left',
                    fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'all 100ms',
                  }}>
                  {uc.shortName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Signal */}
        {(ucObj || productObj) && (
          <div className="mc-sidebar-section">
            <span className="section-label" style={{ marginBottom: 8 }}>Killer question</span>
            <p style={{ fontFamily: 'var(--body)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink)', lineHeight: 1.5 }}>
              "{ucObj?.killerQuestion || productObj?.killerQuestion}"
            </p>
          </div>
        )}

        <div className="mc-sidebar-section">
          <button className="btn-outline btn-full" onClick={() => navigate('email')}>Write Email →</button>
        </div>
      </aside>

      {/* Main panel */}
      <div className="mc-panel" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Context bar */}
        <div className="context-bar">
          <span className="context-value" style={{ fontFamily: 'var(--display)', fontWeight: 700 }}>{situation.name}</span>
          {product && <><div className="context-sep" /><span className="context-label">Product</span><span className="context-value">{product === 'bob' ? 'IBM Bob' : product === 'orchestrate' ? 'Orchestrate' : 'governance'}</span></>}
          {useCase && <><div className="context-sep" /><span className="context-value">{ucObj?.shortName}</span></>}
        </div>

        {/* Tabs */}
        <div className="mc-panel-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`mc-panel-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
          {tab === 'main' && (
            <>
              {situation.intro && (
                <div className="note-block" style={{ marginBottom: 20 }}>
                  <p className="body-sm" style={{ color: 'var(--ink)' }}>{situation.intro}</p>
                </div>
              )}
              {situation.type === 'tree'       && <ColdCallTree situation={situation} />}
              {situation.type === 'play'       && <PlayView situation={situation} session={session} updateSession={updateSession} />}
              {situation.type === 'reference'  && <ReferenceView situation={situation} />}
              {situation.type === 'objections' && <ObjectionsView situation={situation} session={session} />}
              {situation.type === 'email'      && <EmailGenerator session={session} updateSession={updateSession} navigate={() => {}} />}
            </>
          )}

          {tab === 'questions' && (
            <div>
              <span className="section-label">Discovery questions</span>
              {(ucObj || productObj) ? (
                <>
                  {ucObj && <div className="display-md" style={{ fontSize: '1.1rem', marginBottom: 16 }}>{ucObj.name}</div>}
                  {['Situation', 'Pain', 'Impact', 'Critical Event', 'Decision'].map(stage => {
                    const qs = ucObj?.killerQuestions?.[stage] || productObj?.killerQuestions?.[stage] || []
                    if (!qs.length) return null
                    return (
                      <div key={stage} className="spiced-stage" style={{ marginBottom: 10 }}>
                        <div className="spiced-stage-label">{stage}</div>
                        {qs.map((q, i) => <div key={i} className="q-item"><span className="q-arrow">→</span><span>{q}</span></div>)}
                      </div>
                    )
                  })}
                  {productObj?.universalFollowUps && (
                    <div style={{ marginTop: 20, borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
                      <span className="section-label">Universal follow-ups</span>
                      {productObj.universalFollowUps.map((fu, i) => (
                        <div key={i} className="q-item" style={{ fontStyle: 'italic' }}>
                          <span className="q-arrow">—</span><span style={{ color: 'var(--muted-fg)' }}>"{fu}"</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ padding: '24px 0' }}>
                  <p className="body-sm">Select a product and use case in the sidebar to see tailored discovery questions.</p>
                  {/* Show generic questions from the situation */}
                  {situation.steps?.filter(s => s.script?.includes('SITUATION') || s.script?.includes('PAIN')).map((s, i) => (
                    <div key={i} style={{ marginBottom: 20 }}>
                      <span className="section-label">{s.name}</span>
                      <div className="script-block-sm" style={{ marginTop: 6 }}>{s.script}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'ai' && (
            <AIPrepQuick situation={situation} session={{ ...session, product, useCase }} />
          )}
        </div>
      </div>
    </div>
  )
}

// ── Inline AI prep (quick version within situation view) ──────
function AIPrepQuick({ situation, session }) {
  const [account, setAccount] = useState(session.account || '')
  const [industry, setIndustry] = useState(session.industry || '')
  const [knowSoFar, setKnowSoFar] = useState(session.knowSoFar || '')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const ucObj = usecases.useCases.find(u => u.id === session.useCase)
  const productObj = bible.products.find(p => p.id === session.product)

  async function build() {
    if (!session.product || !account) { setError('Select a product and enter an account first.'); return }
    setError(null); setLoading(true); setResult(null)

    async function call(mode) {
      const res = await fetch('/.netlify/functions/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          product: session.product,
          account,
          industry,
          callType: situation.id,
          knowSoFar,
          useCaseName: ucObj?.name || '',
        }),
      })
      const text = await res.text()
      try { return JSON.parse(text) } catch (e) { throw new Error('Parse error') }
    }

    try {
      const [hyp, qs] = await Promise.all([call('prep-hypothesis'), call('prep-questions')])
      if (hyp.error) throw new Error(hyp.error)
      if (qs.error) throw new Error(qs.error)
      setResult({ ...hyp, ...qs })
    } catch (e) {
      setError(e.message || 'Error generating plan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <span className="section-label">AI Prep — {situation.name}</span>
      <p className="body-sm" style={{ marginBottom: 16 }}>Get a hypothesis and questions tailored to a specific account for this situation.</p>

      <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
        <div className="field-group">
          <span className="field-label">Account</span>
          <input className="field-input" placeholder="Company name" value={account} onChange={e => setAccount(e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="field-group">
            <span className="field-label">Industry</span>
            <input className="field-input" placeholder="e.g. Manufacturing" value={industry} onChange={e => setIndustry(e.target.value)} />
          </div>
          <div className="field-group">
            <span className="field-label">What you know</span>
            <input className="field-input" placeholder="Triggers, context..." value={knowSoFar} onChange={e => setKnowSoFar(e.target.value)} />
          </div>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}
      <button className="btn-primary btn-full" onClick={build} disabled={loading || !session.product}>
        {loading
          ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Building plan for {account}...</>
          : <><span className="ai-dot" style={{ marginRight: 8 }} /> Build AI Plan</>
        }
      </button>
      {!session.product && <p className="body-sm" style={{ marginTop: 8, textAlign: 'center' }}>Select a product in the sidebar first.</p>}

      {result && (
        <div style={{ marginTop: 24 }}>
          <hr className="section-rule-md" style={{ marginBottom: 20 }} />
          {result.twoSentenceHypothesis && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span className="ai-dot" /><span className="section-label" style={{ marginBottom: 0 }}>Your hypothesis</span>
              </div>
              <div className="copy-wrap" style={{ position: 'relative' }}>
                <div className="script-block">{result.twoSentenceHypothesis}</div>
                <CopyBtn text={result.twoSentenceHypothesis} />
              </div>
            </div>
          )}
          {result.provocation?.openingLine && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span className="ai-dot" /><span className="section-label" style={{ marginBottom: 0 }}>Opening line</span>
              </div>
              <div className="copy-wrap" style={{ position: 'relative' }}>
                <div className="script-block">{result.provocation.openingLine}</div>
                <CopyBtn text={result.provocation.openingLine} />
              </div>
            </div>
          )}
          {result.killerQuestions?.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span className="ai-dot" /><span className="section-label" style={{ marginBottom: 0 }}>Discovery questions for {account}</span>
              </div>
              {['Situation','Pain','Impact','Critical Event','Decision'].map(stage => {
                const qs = result.killerQuestions.filter(q => q.stage === stage)
                if (!qs.length) return null
                return (
                  <div key={stage} className="spiced-stage" style={{ marginBottom: 8 }}>
                    <div className="spiced-stage-label">{stage}</div>
                    {qs.map((q, i) => <div key={i} className="q-item"><span className="q-arrow">→</span><span>{q.question}</span></div>)}
                  </div>
                )
              })}
            </div>
          )}
          {result.coachingNote && (
            <div className="note-block" style={{ marginTop: 16 }}>
              <span className="section-label">Coaching note</span>
              <p className="body-sm" style={{ color: 'var(--ink)', marginTop: 4 }}>{result.coachingNote}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
