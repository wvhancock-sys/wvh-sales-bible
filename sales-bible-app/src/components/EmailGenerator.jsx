import { useState } from 'react'
import bible from '../data/bible.json'

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  function copy() { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2500) }
  return <button className={`copy-btn ${copied ? 'copied' : ''}`} style={{ position: 'static', marginTop: 10, display: 'block' }} onClick={copy}>{copied ? '✓ copied to clipboard' : 'copy email'}</button>
}

const EMAIL_TYPES = [
  { id: 'cold', label: 'Cold outbound', icon: '📤' },
  { id: 'recap', label: 'Discovery recap', icon: '📋' },
  { id: 'nudge', label: 'Nudge / re-anchor', icon: '🔁' },
  { id: 'breakup', label: 'Diagnostic breakup', icon: '⚡' },
  { id: 'escalation', label: 'Exec escalation', icon: '🎯' },
]

export default function EmailGenerator({ navigate, initData }) {
  const [emailType, setEmailType] = useState(initData?.type || 'recap')
  const [form, setForm] = useState({
    account: initData?.account || '',
    product: initData?.product || '',
    buyerName: '',
    pains: '',
    stalledContext: '',
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [useTemplate, setUseTemplate] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  // Find matching template from Bible
  const templateMap = { cold: 'email1', recap: 'email2', nudge: 'email4', breakup: 'email5', escalation: 'email7' }
  const template = bible.emails.find(e => e.id === templateMap[emailType])

  async function generate() {
    setLoading(true); setResult(null)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'email', emailType, ...form }),
      })
      const data = await res.json()
      setResult(data)
    } catch (e) { /* silent */ }
    finally { setLoading(false) }
  }

  const isStalled = emailType === 'nudge' || emailType === 'breakup' || emailType === 'escalation'

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <span className="label">Email Generator</span>
        <h1>Write the email</h1>
        <p className="muted" style={{ marginTop: 4 }}>Personalized drafts from the Bible's templates. Under 90 words unless it's an escalation.</p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {EMAIL_TYPES.map(t => (
          <button
            key={t.id}
            className={`chip ${emailType === t.id ? 'selected' : ''}`}
            onClick={() => { setEmailType(t.id); setResult(null) }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Quick template access */}
      {template && (
        <div style={{ marginBottom: 16 }}>
          <button className="btn btn-sm" onClick={() => setUseTemplate(!useTemplate)}>
            {useTemplate ? 'hide template' : 'view Bible template'}
          </button>
          {useTemplate && (
            <div className="card" style={{ marginTop: 12 }}>
              <span className="label">Bible template</span>
              <div style={{ marginBottom: 6 }}>
                <span className="label" style={{ display: 'inline' }}>Subject: </span>
                <span style={{ fontSize: 13 }}>{template.subject}</span>
              </div>
              <div className="copy-wrap">
                <div className="script-box">{template.body}</div>
                <CopyBtn text={`Subject: ${template.subject}\n\n${template.body}`} />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div className="form-row">
          <div className="form-group">
            <span className="label">Buyer name</span>
            <input placeholder="e.g. Sarah Chen" value={form.buyerName} onChange={e => set('buyerName', e.target.value)} />
          </div>
          <div className="form-group">
            <span className="label">Company</span>
            <input placeholder="e.g. Caterpillar Inc." value={form.account} onChange={e => set('account', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <span className="label">Product</span>
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

        {!isStalled && (
          <div className="form-group">
            <span className="label">{emailType === 'cold' ? 'Trigger / what you noticed' : 'Pains confirmed on the call'}</span>
            <textarea
              placeholder={emailType === 'cold'
                ? 'E.g. They posted 4 COBOL developer jobs. Had a public outage in Q1...'
                : 'E.g. They spend 12 hours/week on cross-system approvals. CE is audit in October...'}
              value={form.pains}
              onChange={e => set('pains', e.target.value)}
            />
          </div>
        )}

        {isStalled && (
          <div className="form-group">
            <span className="label">Context on the stalled deal</span>
            <textarea
              placeholder="E.g. Last spoke March 15. They confirmed pain around governance, CE was EU AI Act deadline. Went quiet after we sent pricing..."
              value={form.stalledContext}
              onChange={e => set('stalledContext', e.target.value)}
            />
          </div>
        )}

        {emailType === 'breakup' && (
          <div className="callout" style={{ marginBottom: 14 }}>
            <div className="callout-label">Why the diagnostic breakup works</div>
            <p style={{ margin: 0, fontSize: 13 }}>Three specific reasons force a yes/no reply. Each answer tells you which play to run: (1) priority shift = nurture, (2) pricing = rescope or re-anchor value, (3) lost to competitor = ask what you missed.</p>
          </div>
        )}

        <button className="btn btn-primary btn-full" onClick={generate} disabled={loading}>
          {loading
            ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> drafting...</>
            : <><div className="glow-dot" /> Generate email</>
          }
        </button>
      </div>

      {result && (
        <div className="ai-block">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div className="glow-dot" />
            <h3>Your draft</h3>
          </div>
          {result.subject && (
            <div style={{ marginBottom: 10 }}>
              <span className="label">Subject line</span>
              <div className="surface" style={{ fontFamily: 'Courier New', fontSize: 13 }}>{result.subject}</div>
            </div>
          )}
          {result.body && (
            <>
              <span className="label">Body</span>
              <div className="script-box clay-border" style={{ whiteSpace: 'pre-wrap' }}>{result.body}</div>
              <CopyBtn text={`Subject: ${result.subject}\n\n${result.body}`} />
            </>
          )}
          {result.notes && (
            <div className="callout slate" style={{ marginTop: 14 }}>
              <div className="callout-label">Notes</div>
              <p style={{ margin: 0, fontSize: 13 }}>{result.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
