import bible from '../data/bible.json'

const SCENARIOS = [
  { num: '01', name: 'Inbound Discovery', desc: 'They came to you', callType: 'inbound' },
  { num: '02', name: 'Outbound Discovery', desc: 'You created the meeting', callType: 'outbound' },
  { num: '03', name: 'Validation', desc: 'Running or presenting a POC', callType: 'validation' },
  { num: '04', name: 'Exec Alignment', desc: 'Meeting the economic buyer', callType: 'exec' },
  { num: '05', name: 'Stalled Deal', desc: 'Gone quiet, need to recover', callType: 'stalled' },
  { num: '06', name: 'Re-engagement', desc: 'Rebuilding a cold opportunity', callType: 'reengagement' },
]

export default function HomeScreen({ navigate, session }) {
  function handleScenario(s) {
    navigate('mission', { callType: s.callType })
  }

  return (
    <div className="app-main">
      {/* Hero */}
      <div style={{ borderBottom: '4px solid #000', padding: '48px 32px 40px' }}>
        <span className="section-label" style={{ marginBottom: 16 }}>IBM AI P&amp;P IND — Field Sales</span>
        <div className="display-xl" style={{ maxWidth: 700 }}>Dispatch</div>
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <p className="body-text" style={{ color: 'var(--muted-fg)', maxWidth: 520 }}>
            One place to run a perfect sales cycle. Select your situation and get everything you need — hypothesis, play script, discovery questions, objection handlers, and email — all tailored to the call you have right now.
          </p>
        </div>
        <div style={{ marginTop: 28, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => navigate('mission')}>
            Enter Mission Control →
          </button>
          <button className="btn-outline" onClick={() => navigate('products')}>
            Product POVs
          </button>
        </div>
      </div>

      <hr className="section-rule" />

      {/* Scenario grid */}
      <div style={{ padding: '32px 32px 0' }}>
        <span className="section-label">What's on your calendar?</span>
      </div>
      <div className="scenario-grid" style={{ borderTop: '1px solid var(--border-light)' }}>
        {SCENARIOS.map(s => (
          <button key={s.callType} className="scenario-card" onClick={() => handleScenario(s)}>
            <span className="scenario-num">{s.num}</span>
            <span className="scenario-name">{s.name}</span>
            <span className="scenario-desc">{s.desc}</span>
          </button>
        ))}
      </div>

      <hr className="section-rule" />

      {/* Five things */}
      <div className="inverted-section">
        <div style={{ maxWidth: 700 }}>
          <span className="section-label" style={{ color: 'rgba(255,255,255,0.5)' }}>Non-negotiable</span>
          <div className="display-md" style={{ color: '#fff', marginBottom: 24, marginTop: 8 }}>
            Five things you leave every discovery call with.
          </div>
          {[
            'A quantified pain in the buyer\'s own numbers',
            'A compelling event with a date in the next 90 days',
            'The economic buyer\'s name and a path to meet them',
            'The decision process: who signs, how they buy, who blocks',
            'A specific next step on the calendar — not "I\'ll send you something"',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, paddingBottom: 14, paddingTop: 14, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'rgba(255,255,255,0.3)', flexShrink: 0, marginTop: 2 }}>0{i + 1}</span>
              <span style={{ fontFamily: 'var(--body)', fontSize: 15, color: '#fff', lineHeight: 1.5 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
