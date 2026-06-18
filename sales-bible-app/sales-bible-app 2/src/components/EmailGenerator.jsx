import { useState } from 'react'
import bible from '../data/bible.json'

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  function copy() { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2500) }
  return (
    <button
      onClick={copy}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: copied ? 'var(--muted-fg)' : 'var(--fg)',
        color: '#fff', border: 'none', fontFamily: 'var(--mono)',
        fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase',
        padding: '6px 14px', cursor: 'pointer', marginTop: 10,
      }}
    >
      {copied ? '✓ Copied' : 'Copy Email'}
    </button>
  )
}

const EMAIL_TYPES = [
  { id: 'cold',       label: 'Cold Outbound' },
  { id: 'recap',      label: 'Discovery Recap' },
  { id: 'nudge',      label: 'Nudge / Re-anchor' },
  { id: 'breakup',    label: 'Diagnostic Breakup' },
  { id: 'escalation', label: 'Exec Escalation' },
]

const templateMap = { cold: 'email1', recap: 'email2', nudge: 'email4', breakup: 'email5', escalation: 'email7' }

export default function EmailGenerator({ session, updateSession, navigate }) {
  const [emailType, setEmailType] = useState('recap')
  const [localForm, setLocalForm] = useState({ pains: '', stalledContext: '', buyerName: session.buyerName || '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showTemplate, setShowTemplate] = useState(false)

  function setL(k, v) { setLocalForm(f => ({ ...f, [k]: v })) }

  const template = bible.emails.find(e => e.id === templateMap[emailType])
  const isStalled = ['nudge','breakup','escalation'].includes(emailType)

  async function generate() {
    setLoading(true); setResult(null)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'email',
          emailType,
          product: session.product,
          account: session.account,
          buyerName: localForm.buyerName || session.buyerName,
          pains: localForm.pains,
          stalledContext: localForm.stalledContext,
        }),
      })
      const data = await res.json()
      setResult(data)
    } catch (e) { /* silent */ }
    finally { setLoading(false) }
  }

  return (
    <div className="app-main">
      <div style={{ borderBottom: '4px solid #000', padding: '40px 32px 32px' }}>
        <span className="section-label">Email Generator</span>
        <div className="display-lg" style={{ marginBottom: 8 }}>Write the email.</div>
        <p className="body-text" style={{ color: 'var(--muted-fg)' }}>
          Personalized drafts from the Sales Bible templates. Under 90 words unless it's an escalation.
        </p>
      </div>

      <hr className="section-rule" />

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: 'calc(100svh - 200px)' }}>
        {/* Left: type selector */}
        <div style={{ borderRight: '2px solid #000' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)' }}>
            <span className="section-label">Email Type</span>
          </div>
          {EMAIL_TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => { setEmailType(t.id); setResult(null) }}
              style={{
                width: '100%', background: emailType === t.id ? '#000' : '#fff',
                color: emailType === t.id ? '#fff' : '#525252',
                border: 'none', borderBottom: '1px solid var(--border-light)',
                padding: '14px 24px', cursor: 'pointer', textAlign: 'left',
                fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em',
                textTransform: 'uppercase', transition: 'all 100ms',
              }}
            >
              {t.label}
              {t.id === 'breakup' && <span style={{ marginLeft: 8, fontSize: 8, opacity: 0.7 }}>★ BEST</span>}
            </button>
          ))}

          <div style={{ padding: '20px 24px', borderTop: '2px solid #000' }}>
            <button className="btn-ghost" onClick={() => setShowTemplate(!showTemplate)}>
              {showTemplate ? '↑ Hide template' : '↓ View Bible template'}
            </button>
          </div>
        </div>

        {/* Right: form + result */}
        <div style={{ padding: '28px 32px' }}>
          {emailType === 'breakup' && (
            <div className="inverted-section" style={{ marginBottom: 24 }}>
              <span className="section-label" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Why the diagnostic breakup works</span>
              <p style={{ fontFamily: 'var(--body)', fontSize: 14, color: '#fff', lineHeight: 1.7 }}>
                Three specific reasons force a reply. Each answer tells you the next play: (1) priority shift = nurture at next trigger, (2) pricing = rescope or re-anchor value, (3) lost to competitor = ask what you missed and why.
              </p>
            </div>
          )}

          {showTemplate && template && (
            <div style={{ marginBottom: 24 }}>
              <span className="section-label">Sales Bible Template</span>
              <div className="email-preview">
                <div className="email-header">
                  <span className="email-subject">Subject: {template.subject}</span>
                  <span className="tag">Template</span>
                </div>
                <div className="email-body">{template.body}</div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gap: 16, marginBottom: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="field-group">
                <span className="field-label">Buyer Name</span>
                <input className="field-input" placeholder="Sarah Chen" value={localForm.buyerName} onChange={e => setL('buyerName', e.target.value)} />
              </div>
              <div className="field-group">
                <span className="field-label">Company</span>
                <input className="field-input" placeholder={session.account || 'Company name'} value={session.account} onChange={e => updateSession({ account: e.target.value })} />
              </div>
            </div>

            {!isStalled && (
              <div className="field-group">
                <span className="field-label">{emailType === 'cold' ? 'Trigger / what you noticed' : 'Pains confirmed on the call'}</span>
                <textarea
                  className="field-textarea"
                  placeholder={emailType === 'cold'
                    ? 'They posted 4 COBOL dev jobs. Had a public outage in Q1. New CIO in January...'
                    : 'They spend 12 hrs/week on cross-system approvals. CE is audit in October...'}
                  value={localForm.pains}
                  onChange={e => setL('pains', e.target.value)}
                />
              </div>
            )}

            {isStalled && (
              <div className="field-group">
                <span className="field-label">Context on the stalled deal</span>
                <textarea
                  className="field-textarea"
                  placeholder="Last spoke March 15. They confirmed pain around governance, CE was EU AI Act deadline. Went quiet after pricing..."
                  value={localForm.stalledContext}
                  onChange={e => setL('stalledContext', e.target.value)}
                />
              </div>
            )}
          </div>

          <button className="btn-primary btn-full" onClick={generate} disabled={loading}>
            {loading
              ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Drafting...</>
              : <><span className="ai-dot" style={{ marginRight: 8 }} /> Generate Email</>
            }
          </button>

          {result && (
            <div style={{ marginTop: 28 }}>
              <hr className="section-rule-md" style={{ marginBottom: 20 }} />
              <span className="section-label">Your draft</span>
              <div className="email-preview">
                {result.subject && (
                  <div className="email-header">
                    <span className="email-subject">{result.subject}</span>
                  </div>
                )}
                {result.body && <div className="email-body">{result.body}</div>}
              </div>
              {result.body && <CopyBtn text={`Subject: ${result.subject || ''}\n\n${result.body}`} />}
              {result.notes && (
                <div className="note-block" style={{ marginTop: 16 }}>
                  <span className="section-label">Notes</span>
                  <p className="body-sm">{result.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
