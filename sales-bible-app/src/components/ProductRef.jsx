import { useState } from 'react'
import bible from '../data/bible.json'

const PRODUCT_COLORS = { orchestrate: 'olive', bob: 'slate', governance: 'navy' }
const SPICED_ORDER = ['Situation', 'Pain', 'Impact', 'Critical Event', 'Decision']

export default function ProductRef({ navigate }) {
  const [active, setActive] = useState(bible.products[0].id)
  const [qStage, setQStage] = useState('Situation')
  const p = bible.products.find(pr => pr.id === active)
  const color = PRODUCT_COLORS[active]

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <span className="label">Product Reference</span>
        <h1>Product POVs</h1>
        <p className="muted" style={{ marginTop: 4 }}>Open this before any first call. Know the pattern, the gap, and the killer question cold.</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        {bible.products.map(pr => (
          <button
            key={pr.id}
            className={`chip p-${pr.id} ${active === pr.id ? 'selected' : ''}`}
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => { setActive(pr.id); setQStage('Situation') }}
          >
            {pr.id === 'bob' ? 'IBM Bob' : pr.id === 'orchestrate' ? 'Orchestrate' : 'governance'}
          </button>
        ))}
      </div>

      <div className="card">
        <span className="label">{p.id === 'bob' ? 'IBM Bob (watsonx Code Assistant)' : p.id === 'orchestrate' ? 'watsonx Orchestrate' : 'watsonx.governance'}</span>
        <h1 style={{ fontSize: 18, marginBottom: 10 }}>{p.tagline}</h1>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {p.buyers.map(b => (
            <span key={b} className="chip" style={{ cursor: 'default' }}>{b}</span>
          ))}
        </div>

        <div className="callout" style={{ marginBottom: 10, borderLeftColor: `var(--${color})` }}>
          <div className="callout-label" style={{ color: `var(--${color})` }}>Pattern</div>
          <p style={{ margin: 0, fontSize: 13 }}>{p.pattern}</p>
        </div>

        <div className="callout" style={{ marginBottom: 10, borderLeftColor: `var(--${color})` }}>
          <div className="callout-label" style={{ color: `var(--${color})` }}>Gap</div>
          <p style={{ margin: 0, fontSize: 13 }}>{p.gap}</p>
        </div>

        <div className="callout olive" style={{ marginBottom: 10 }}>
          <div className="callout-label">Proof</div>
          <p style={{ margin: 0, fontSize: 13 }}>{p.proof}</p>
        </div>

        <div className="callout" style={{ borderLeftColor: 'var(--clay)' }}>
          <div className="callout-label" style={{ color: 'var(--clay)' }}>The killer question</div>
          <p style={{ margin: 0, fontSize: 14, fontStyle: 'italic' }}>{p.killerQuestion}</p>
        </div>
      </div>

      {/* Killer Questions by SPICED */}
      <div className="card">
        <span className="label">Killer questions by SPICED stage</span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {SPICED_ORDER.map(stage => (
            <button
              key={stage}
              className={`chip ${qStage === stage ? 'selected' : ''}`}
              onClick={() => setQStage(stage)}
            >
              {stage}
            </button>
          ))}
        </div>
        <div className="spiced-stage">
          <div className="spiced-stage-label">{qStage}</div>
          {(p.killerQuestions[qStage] || []).map((q, i) => (
            <div key={i} className="question-item">{q}</div>
          ))}
          <div className="callout slate" style={{ marginTop: 12 }}>
            <div className="callout-label">Universal follow-ups</div>
            {p.universalFollowUps.map((fu, i) => (
              <p key={i} style={{ margin: 0, fontSize: 12, marginBottom: 3 }}>"{fu}"</p>
            ))}
          </div>
        </div>
      </div>

      {/* Top objection */}
      <div className="card">
        <span className="label">Top objection</span>
        <h3 style={{ marginBottom: 10 }}>"{p.topObjection}"</h3>
        <div className="script-box clay-border">{p.objectionResponse}</div>
      </div>

      {/* Compelling events */}
      <div className="card">
        <span className="label">Compelling event triggers</span>
        {p.compellingEvents.map((ce, i) => (
          <div key={i} className="question-item">{ce}</div>
        ))}
      </div>

      {/* Validation */}
      <div className="callout olive">
        <div className="callout-label">The validation we run</div>
        <p style={{ margin: 0, fontSize: 13 }}>{p.validation}</p>
      </div>

      <div style={{ marginTop: 20 }}>
        <button className="btn btn-primary" onClick={() => navigate('prep')}>
          <div className="glow-dot" />
          Build prep for {p.id === 'bob' ? 'Bob' : p.id === 'orchestrate' ? 'Orchestrate' : 'governance'} call
        </button>
      </div>
    </div>
  )
}
