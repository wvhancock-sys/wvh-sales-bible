import { useState } from 'react'
import bible from '../data/bible.json'

const NAMES = { orchestrate: 'watsonx Orchestrate', bob: 'IBM Bob', governance: 'watsonx.governance' }
const SPICED = ['Situation', 'Pain', 'Impact', 'Critical Event', 'Decision']

export default function ProductRef({ session, navigate }) {
  const [activeId, setActiveId] = useState(session.product || bible.products[0].id)
  const [qStage, setQStage] = useState('Situation')
  const p = bible.products.find(pr => pr.id === activeId)

  return (
    <div className="app-main">
      <div style={{ borderBottom: '4px solid #000', padding: '40px 32px 32px' }}>
        <span className="section-label">Reference</span>
        <div className="display-lg">Product POVs.</div>
        <p className="body-text" style={{ color: 'var(--muted-fg)', marginTop: 8 }}>
          Open before any first call. Know the pattern, the gap, and the killer question cold.
        </p>
      </div>

      <hr className="section-rule" />

      {/* Product switcher */}
      <div className="product-grid" style={{ margin: 0, border: 'none', borderBottom: '2px solid #000' }}>
        {bible.products.map(pr => (
          <button
            key={pr.id}
            className={`product-btn ${activeId === pr.id ? 'active' : ''}`}
            style={{ borderBottom: 'none' }}
            onClick={() => { setActiveId(pr.id); setQStage('Situation') }}
          >
            <span className="product-btn-name">{NAMES[pr.id]}</span>
            <span className="product-btn-sub">{pr.buyers.slice(0,2).join(' · ')}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--border-light)' }}>
        {/* Left col */}
        <div style={{ borderRight: '1px solid var(--border-light)', padding: '32px' }}>
          <span className="section-label">Tagline</span>
          <div className="display-md" style={{ fontSize: '1.3rem', marginBottom: 20 }}>{p.tagline}</div>

          <div style={{ marginBottom: 20 }}>
            <span className="section-label">Pattern</span>
            <p className="body-text">{p.pattern}</p>
          </div>
          <div style={{ marginBottom: 20 }}>
            <span className="section-label">Gap</span>
            <p className="body-text">{p.gap}</p>
          </div>
          <div style={{ marginBottom: 20 }}>
            <span className="section-label">Proof</span>
            <p className="body-text">{p.proof}</p>
          </div>
          <div style={{ marginBottom: 20 }}>
            <span className="section-label">Validation</span>
            <p className="body-text">{p.validation}</p>
          </div>

          <div className="inverted-section" style={{ marginTop: 24 }}>
            <span className="section-label" style={{ color: 'rgba(255,255,255,0.5)' }}>The killer question</span>
            <p style={{ fontFamily: 'var(--display)', fontStyle: 'italic', fontSize: 18, color: '#fff', lineHeight: 1.5, marginTop: 8 }}>
              "{p.killerQuestion}"
            </p>
          </div>
        </div>

        {/* Right col */}
        <div style={{ padding: '32px' }}>
          <div style={{ marginBottom: 24 }}>
            <span className="section-label" style={{ marginBottom: 10 }}>Buyers</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {p.buyers.map(b => <span key={b} className="tag">{b}</span>)}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <span className="section-label" style={{ marginBottom: 10 }}>Compelling events</span>
            {p.compellingEvents.map((ce, i) => (
              <div key={i} className="q-item"><span className="q-arrow">→</span><span>{ce}</span></div>
            ))}
          </div>

          <div>
            <span className="section-label" style={{ marginBottom: 8 }}>Top objection</span>
            <div style={{ border: '1px solid var(--border-light)', marginBottom: 12 }}>
              <div style={{ borderBottom: '1px solid #000', padding: '10px 14px', background: 'var(--muted)' }}>
                <span style={{ fontFamily: 'var(--body)', fontStyle: 'italic', fontSize: 14 }}>"{p.topObjection}"</span>
              </div>
              <div style={{ padding: '12px 14px' }}>
                <p className="body-sm" style={{ color: 'var(--fg)' }}>{p.objectionResponse}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Discovery questions */}
      <div style={{ borderBottom: '4px solid #000', padding: '32px' }}>
        <span className="section-label">SPICED Discovery Questions</span>
        <div className="spiced-tabs" style={{ marginTop: 12 }}>
          {SPICED.map(stage => (
            <button key={stage} className={`spiced-tab ${qStage === stage ? 'active' : ''}`} onClick={() => setQStage(stage)}>{stage}</button>
          ))}
        </div>
        {(p.killerQuestions[qStage] || []).map((q, i) => (
          <div key={i} className="q-item"><span className="q-arrow">→</span><span>{q}</span></div>
        ))}
        <div style={{ marginTop: 20, borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
          <span className="section-label">Universal follow-ups</span>
          {p.universalFollowUps.map((fu, i) => (
            <div key={i} className="q-item" style={{ fontStyle: 'italic' }}>
              <span className="q-arrow">—</span>
              <span style={{ color: 'var(--muted-fg)' }}>"{fu}"</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px 32px', display: 'flex', gap: 12 }}>
        <button className="btn-primary" onClick={() => navigate('mission', { product: p.id })}>
          Open Mission Control →
        </button>
        <button className="btn-outline" onClick={() => navigate('email')}>Write Email</button>
      </div>
    </div>
  )
}
