import { useState } from 'react'

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copy}>{copied ? '✓ copied' : 'copy'}</button>
}

export default function PlayViewer({ play, navigate }) {
  const [step, setStep] = useState(0)
  if (!play) return null
  const s = play.steps[step]

  return (
    <div>
      <button className="back-btn" onClick={() => navigate('home')}>← back</button>

      <div style={{ marginBottom: 20 }}>
        <span className="label">Play</span>
        <h1>{play.name}</h1>
        <p className="muted" style={{ marginTop: 4 }}>{play.when}</p>
      </div>

      <div className="callout olive">
        <div className="callout-label">Goal</div>
        <p style={{ margin: 0, fontSize: 14 }}>{play.goal}</p>
      </div>

      {play.preCAllPrep && (
        <div className="card" style={{ marginBottom: 18 }}>
          <span className="label">Pre-call prep</span>
          {play.preCAllPrep.map((item, i) => (
            <div key={i} className="question-item" style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 13 }}>{item}</span>
            </div>
          ))}
        </div>
      )}

      <span className="label">Steps</span>
      <div className="step-nav">
        {play.steps.map((st, i) => (
          <button
            key={i}
            className={`step-dot ${i === step ? 'active' : ''}`}
            onClick={() => setStep(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div>
            <span className="label">Step {step + 1} of {play.steps.length}</span>
            <h2 style={{ marginBottom: 2 }}>{s.name}</h2>
            {s.time && <span className="muted" style={{ fontSize: 12 }}>{s.time}</span>}
          </div>
        </div>

        {s.why && (
          <div className="callout slate" style={{ marginBottom: 14 }}>
            <div className="callout-label">Why this works</div>
            <p style={{ margin: 0, fontSize: 13 }}>{s.why}</p>
          </div>
        )}

        {s.script && (
          <>
            <span className="label" style={{ marginTop: 14 }}>Script</span>
            <div className="copy-wrap">
              <div className="script-box">{s.script}</div>
              <CopyBtn text={s.script} />
            </div>
          </>
        )}

        {s.leftSwingDropIns && (
          <div style={{ marginTop: 18 }}>
            <div className="callout" style={{ marginTop: 10 }}>
              <div className="callout-label">Left-swing drop-ins — use when energy drops</div>
              {Object.entries(s.leftSwingDropIns).map(([stage, line]) => (
                <div key={stage} style={{ marginBottom: 10 }}>
                  <span className="label" style={{ marginBottom: 4 }}>{stage}</span>
                  <div className="copy-wrap">
                    <div className="script-box clay-border" style={{ fontStyle: 'italic', marginTop: 0 }}>{line}</div>
                    <CopyBtn text={line} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'space-between' }}>
          <button className="btn btn-sm" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← prev</button>
          {step < play.steps.length - 1
            ? <button className="btn btn-primary btn-sm" onClick={() => setStep(step + 1)}>next step →</button>
            : <button className="btn btn-sm" onClick={() => navigate('email', { type: 'recap' })}>write recap email →</button>
          }
        </div>
      </div>
    </div>
  )
}
