import { useState, useEffect } from 'react'
import bible from '../data/bible.json'
import usecases from '../data/usecases.json'

const STORAGE_KEY = 'wvh_dispatch_deals_v1'
const STAGES = ['Problem', 'Solution', 'Power', 'Commercial', 'Vendor Approval']
const STATUS = { G: 'Green', Y: 'Yellow', R: 'Red', '': 'Unknown' }
const STATUS_COLORS = { G: 'var(--text-success)', Y: '#B8860B', R: 'var(--text-danger)', '': 'var(--muted-fg)' }
const STATUS_BG = { G: 'var(--bg-success)', Y: '#FFFACD', R: 'var(--bg-danger)', '': 'var(--muted)' }

function loadDeals() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveDeals(deals) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(deals)) } catch {}
}
function dealHealth(deal) {
  const scores = STAGES.map(s => deal.stages?.[s] || '')
  if (scores.includes('R')) return 'R'
  if (scores.includes('Y') || scores.some(s => s === '')) return 'Y'
  return 'G'
}
function newDeal(overrides = {}) {
  return {
    id: Date.now().toString(),
    account: '',
    product: '',
    useCase: '',
    buyerName: '',
    buyerTitle: '',
    industry: '',
    stages: { Problem: '', Solution: '', Power: '', Commercial: '', 'Vendor Approval': '' },
    pains: '',
    ce: '',
    nextAction: '',
    nextNext: '',
    notes: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  }
}

// Stage scoring modal
function StageScorer({ deal, onSave, onClose }) {
  const [stages, setStages] = useState({ ...deal.stages })
  const [nextAction, setNextAction] = useState(deal.nextAction || '')
  const [nextNext, setNextNext] = useState(deal.nextNext || '')
  const [pains, setPains] = useState(deal.pains || '')
  const [ce, setCe] = useState(deal.ce || '')

  const STAGE_QUESTIONS = {
    Problem: [
      'Named stakeholder confirmed the problem in their own words',
      'Problem connected to a business consequence (cost, risk, revenue)',
      'Stakeholder committed to a next step that requires their effort',
    ],
    Solution: [
      'Customer explicitly said IBM can solve their confirmed problem',
      'Technical path is viable — integration, data, deployment understood',
      'Evaluation criteria identified — what they will measure IBM against',
    ],
    Power: [
      'Economic buyer has participated directly in at least one conversation',
      'EB confirmed the problem and considers it a current priority',
      'EB has taken a visible action (assigned resources, intro to procurement)',
    ],
    Commercial: [
      'Scope confirmed in writing — what\'s in and what\'s out',
      'Pricing shared with EB and not rejected',
      'Budget source confirmed and allocated (not just expected)',
    ],
    'Vendor Approval': [
      'Security questionnaire started',
      'Legal/contract review initiated',
      'Procurement route identified and initiated',
    ],
  }

  function setScore(stage, score) {
    setStages(prev => ({ ...prev, [stage]: score }))
  }

  function save() {
    onSave({ stages, nextAction, nextNext, pains, ce, updatedAt: Date.now() })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px', overflowY: 'auto' }}>
      <div style={{ background: '#fff', border: '2px solid #000', maxWidth: 680, width: '100%' }}>
        <div style={{ borderBottom: '2px solid #000', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="section-label" style={{ marginBottom: 2 }}>Deal health check</span>
            <div style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 700 }}>{deal.account}</div>
          </div>
          <button className="btn-ghost" onClick={onClose} style={{ padding: 0 }}>✕ Close</button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {STAGES.map(stage => (
            <div key={stage} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h4 style={{ fontFamily: 'var(--display)', fontSize: 15, fontWeight: 700 }}>{stage} Agreement</h4>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['G', 'Y', 'R'].map(s => (
                    <button key={s} onClick={() => setScore(stage, s)} style={{
                      width: 32, height: 32, border: `2px solid ${stages[stage] === s ? '#000' : 'var(--border-light)'}`,
                      background: stages[stage] === s ? (s === 'G' ? 'var(--bg-success)' : s === 'Y' ? '#FFFACD' : 'var(--bg-danger)') : '#fff',
                      cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
                      color: s === 'G' ? 'var(--text-success)' : s === 'Y' ? '#8B6914' : 'var(--text-danger)',
                      transition: 'all 100ms',
                    }}>{s}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {STAGE_QUESTIONS[stage].map((q, i) => (
                  <div key={i} style={{ fontFamily: 'var(--body)', fontSize: 12, color: 'var(--muted-fg)', display: 'flex', gap: 8 }}>
                    <span style={{ color: stages[stage] === 'G' ? 'var(--text-success)' : 'var(--border-light)', flexShrink: 0 }}>→</span>
                    {q}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <hr className="section-rule-sm" style={{ margin: '20px 0' }} />

          <div style={{ display: 'grid', gap: 12, marginBottom: 12 }}>
            <div className="field-group">
              <span className="field-label">Confirmed pains (in their words)</span>
              <textarea className="field-textarea" rows={2} value={pains} onChange={e => setPains(e.target.value)} placeholder="Pain 1 in their words · Pain 2 · Quantified impact..." />
            </div>
            <div className="field-group">
              <span className="field-label">Compelling event + date</span>
              <input className="field-input" value={ce} onChange={e => setCe(e.target.value)} placeholder="e.g. Board AI risk review in October" />
            </div>
            <div className="field-group">
              <span className="field-label">Next customer action (not IBM action)</span>
              <input className="field-input" value={nextAction} onChange={e => setNextAction(e.target.value)} placeholder="e.g. Champion schedules EB meeting by Friday" />
            </div>
            <div className="field-group">
              <span className="field-label" style={{ color: 'var(--clay)' }}>Next-next (what happens after that?)</span>
              <input className="field-input" value={nextNext} onChange={e => setNextNext(e.target.value)} placeholder="e.g. EB approves validation scope" />
            </div>
          </div>

          <button className="btn-primary btn-full" onClick={save}>Save deal health</button>
        </div>
      </div>
    </div>
  )
}

// New / edit deal form
function DealForm({ deal, onSave, onClose }) {
  const [form, setForm] = useState(deal || newDeal())
  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }
  const productUCs = usecases.useCases.filter(u => u.productId === form.product)

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px', overflowY: 'auto' }}>
      <div style={{ background: '#fff', border: '2px solid #000', maxWidth: 560, width: '100%' }}>
        <div style={{ borderBottom: '2px solid #000', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 700 }}>{deal ? 'Edit deal' : 'New deal'}</div>
          <button className="btn-ghost" onClick={onClose} style={{ padding: 0 }}>✕</button>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'grid', gap: 14 }}>
            <div className="field-group">
              <span className="field-label">Account *</span>
              <input className="field-input" placeholder="Company name" value={form.account} onChange={e => set('account', e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field-group">
                <span className="field-label">Buyer name</span>
                <input className="field-input" placeholder="Sarah Chen" value={form.buyerName} onChange={e => set('buyerName', e.target.value)} />
              </div>
              <div className="field-group">
                <span className="field-label">Buyer title</span>
                <input className="field-input" placeholder="CFO" value={form.buyerTitle} onChange={e => set('buyerTitle', e.target.value)} />
              </div>
            </div>
            <div className="field-group">
              <span className="field-label">Industry</span>
              <input className="field-input" placeholder="e.g. Manufacturing" value={form.industry} onChange={e => set('industry', e.target.value)} />
            </div>
            <div className="field-group">
              <span className="field-label">Product</span>
              <div style={{ display: 'flex', gap: 0, border: '1px solid #000' }}>
                {bible.products.map(p => (
                  <button key={p.id} onClick={() => { set('product', p.id); set('useCase', '') }} style={{
                    flex: 1, background: form.product === p.id ? '#000' : '#fff', color: form.product === p.id ? '#fff' : 'var(--muted-fg)',
                    border: 'none', borderRight: '1px solid var(--border-light)', padding: '10px 8px', cursor: 'pointer',
                    fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'all 100ms',
                  }}>
                    {p.id === 'bob' ? 'Bob' : p.id === 'orchestrate' ? 'Orchestrate' : 'governance'}
                  </button>
                ))}
              </div>
            </div>
            {form.product && productUCs.length > 0 && (
              <div className="field-group">
                <span className="field-label">Use Case</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, border: '1px solid var(--border-light)' }}>
                  {productUCs.map(uc => (
                    <button key={uc.id} onClick={() => set('useCase', uc.id)} style={{
                      background: form.useCase === uc.id ? '#000' : '#fff', color: form.useCase === uc.id ? '#fff' : 'var(--muted-fg)',
                      border: 'none', borderRight: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)',
                      padding: '8px 12px', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'all 100ms',
                    }}>
                      {uc.shortName}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button className="btn-primary" onClick={() => form.account && onSave(form)} disabled={!form.account}>
              {deal ? 'Save changes' : 'Create deal'}
            </button>
            <button className="btn-outline" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DealDashboard({ navigate, session, updateSession }) {
  const [deals, setDeals] = useState(loadDeals)
  const [scoringDeal, setScoringDeal] = useState(null)
  const [editingDeal, setEditingDeal] = useState(null)
  const [showNewDeal, setShowNewDeal] = useState(false)

  function updateDeal(id, updates) {
    const updated = deals.map(d => d.id === id ? { ...d, ...updates } : d)
    setDeals(updated)
    saveDeals(updated)
  }
  function deleteDeal(id) {
    if (!confirm('Delete this deal?')) return
    const updated = deals.filter(d => d.id !== id)
    setDeals(updated)
    saveDeals(updated)
  }
  function saveDeal(form) {
    const existing = deals.find(d => d.id === form.id)
    let updated
    if (existing) {
      updated = deals.map(d => d.id === form.id ? { ...d, ...form, updatedAt: Date.now() } : d)
    } else {
      updated = [{ ...form, id: Date.now().toString(), stages: { Problem: '', Solution: '', Power: '', Commercial: '', 'Vendor Approval': '' }, createdAt: Date.now(), updatedAt: Date.now() }, ...deals]
    }
    setDeals(updated)
    saveDeals(updated)
    setShowNewDeal(false)
    setEditingDeal(null)
  }

  const sorted = [...deals].sort((a, b) => {
    const hp = { R: 0, Y: 1, G: 2, '': 1 }
    return hp[dealHealth(a)] - hp[dealHealth(b)]
  })

  const PRODUCT_SHORT = { orchestrate: 'Orchestrate', bob: 'IBM Bob', governance: 'governance' }
  const UC_SHORT = id => usecases.useCases.find(u => u.id === id)?.shortName || ''

  return (
    <div className="app-main">
      <div style={{ borderBottom: '4px solid #000', padding: '40px 32px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span className="section-label">Deal Tracker</span>
          <div className="display-lg" style={{ marginBottom: 6 }}>Your deals.</div>
          <p className="body-text" style={{ color: 'var(--muted-fg)' }}>Scored by the Five Agreement Stages. Red surfaces first.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowNewDeal(true)}>+ New deal</button>
      </div>

      {/* Legend */}
      <div style={{ borderBottom: '1px solid var(--border-light)', padding: '12px 32px', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {[['G', 'All stages Green'], ['Y', 'Yellow or unknown stages'], ['R', 'At least one Red stage']].map(([s, label]) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, border: `2px solid ${STATUS_COLORS[s]}`, background: STATUS_BG[s] }} />
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', color: 'var(--muted-fg)' }}>{label}</span>
          </div>
        ))}
      </div>

      {deals.length === 0 ? (
        <div style={{ padding: '60px 32px', textAlign: 'center' }}>
          <p className="body-text" style={{ color: 'var(--muted-fg)', marginBottom: 20 }}>No deals yet. Create your first one.</p>
          <button className="btn-primary" onClick={() => setShowNewDeal(true)}>+ New deal</button>
        </div>
      ) : (
        <div>
          {sorted.map(deal => {
            const health = dealHealth(deal)
            const ucName = UC_SHORT(deal.useCase)
            const redStages = STAGES.filter(s => deal.stages?.[s] === 'R')
            const unknownStages = STAGES.filter(s => !deal.stages?.[s])
            return (
              <div key={deal.id} style={{ borderBottom: '1px solid var(--border-light)', padding: '20px 32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <div style={{ width: 12, height: 12, border: `2px solid ${STATUS_COLORS[health]}`, background: STATUS_BG[health], flexShrink: 0 }} />
                      <div style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>{deal.account}</div>
                      {deal.buyerName && <span className="tag" style={{ fontFamily: 'var(--mono)', fontSize: 9 }}>{deal.buyerName} · {deal.buyerTitle}</span>}
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                      {deal.product && <span className="tag tag-inverted" style={{ fontSize: 9 }}>{PRODUCT_SHORT[deal.product]}</span>}
                      {ucName && <span className="tag" style={{ fontSize: 9 }}>{ucName}</span>}
                    </div>

                    {/* Stage dots */}
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                      {STAGES.map(s => {
                        const score = deal.stages?.[s] || ''
                        return (
                          <div key={s} title={`${s}: ${STATUS[score] || 'Unknown'}`} style={{
                            padding: '3px 8px', background: STATUS_BG[score], border: `1px solid ${STATUS_COLORS[score]}`,
                            fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.06em', color: STATUS_COLORS[score],
                          }}>
                            {s.replace(' Approval', '')} {score || '?'}
                          </div>
                        )
                      })}
                    </div>

                    {/* Risk callout */}
                    {redStages.length > 0 && (
                      <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-danger)', letterSpacing: '0.06em' }}>
                        ↑ Red: {redStages.join(', ')}
                      </p>
                    )}

                    {deal.nextAction && (
                      <div style={{ marginTop: 8 }}>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted-fg)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Next action: </span>
                        <span style={{ fontFamily: 'var(--body)', fontSize: 13, color: 'var(--ink)' }}>{deal.nextAction}</span>
                      </div>
                    )}
                    {deal.nextNext && (
                      <div style={{ marginTop: 2 }}>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted-fg)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Next-next: </span>
                        <span style={{ fontFamily: 'var(--body)', fontSize: 13, color: 'var(--muted-fg)' }}>{deal.nextNext}</span>
                      </div>
                    )}
                    {deal.ce && (
                      <div style={{ marginTop: 2 }}>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted-fg)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>CE: </span>
                        <span style={{ fontFamily: 'var(--body)', fontSize: 13, color: 'var(--muted-fg)' }}>{deal.ce}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                    <button className="btn-outline" style={{ padding: '7px 14px', fontSize: 10 }}
                      onClick={() => setScoringDeal(deal)}>
                      Score deal
                    </button>
                    <button className="btn-outline" style={{ padding: '7px 14px', fontSize: 10 }}
                      onClick={() => { updateSession({ product: deal.product, useCase: deal.useCase, account: deal.account, industry: deal.industry, buyerName: deal.buyerName, buyerTitle: deal.buyerTitle }); navigate('mission') }}>
                      AI Prep
                    </button>
                    <button className="btn-outline" style={{ padding: '7px 14px', fontSize: 10 }}
                      onClick={() => setEditingDeal(deal)}>
                      Edit
                    </button>
                    <button className="btn-ghost" style={{ padding: '7px 14px', fontSize: 10, color: 'var(--text-danger)' }}
                      onClick={() => deleteDeal(deal.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      {(showNewDeal || editingDeal) && (
        <DealForm
          deal={editingDeal}
          onSave={saveDeal}
          onClose={() => { setShowNewDeal(false); setEditingDeal(null) }}
        />
      )}
      {scoringDeal && (
        <StageScorer
          deal={scoringDeal}
          onSave={updates => { updateDeal(scoringDeal.id, updates); setScoringDeal(null) }}
          onClose={() => setScoringDeal(null)}
        />
      )}
    </div>
  )
}
