import situations from '../data/situations.json'

export default function FrameworkHome({ navigate }) {
  return (
    <div className="app-main">

      {/* Hero */}
      <div style={{ borderBottom: '4px solid #000', padding: '40px 32px 36px' }}>
        <span className="section-label">IBM AI P&P IND — Field Sales</span>
        <div className="display-xl" style={{ maxWidth: 600, lineHeight: 1 }}>What are you doing right now?</div>
        <p className="body-text" style={{ color: 'var(--muted-fg)', maxWidth: 520, marginTop: 12 }}>
          Pick the situation. Get the exact script, play, or tool you need. No setup required.
        </p>
      </div>

      {/* Situation grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: '4px solid #000' }}>
        {situations.situations.map((s, i) => {
          const isLast = i === situations.situations.length - 1
          const isSecondLast = i === situations.situations.length - 2
          const col = i % 3
          return (
            <button
              key={s.id}
              onClick={() => navigate('situation', s)}
              style={{
                background: '#fff',
                border: 'none',
                borderRight: col < 2 ? '1px solid var(--border-light)' : 'none',
                borderBottom: i < situations.situations.length - 3 ? '1px solid var(--border-light)' : 'none',
                padding: '24px 22px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 100ms',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#000'; e.currentTarget.querySelector('.sn').style.color = '#fff'; e.currentTarget.querySelector('.sd').style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.querySelector('.si').style.color = 'rgba(255,255,255,0.3)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.querySelector('.sn').style.color = '#1C1410'; e.currentTarget.querySelector('.sd').style.color = 'var(--muted-fg)'; e.currentTarget.querySelector('.si').style.color = 'var(--border-light)' }}
            >
              <span className="si" style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--border-light)', transition: 'color 100ms' }}>{s.num}</span>
              <span className="sn" style={{ fontFamily: 'var(--display)', fontSize: 17, fontWeight: 700, color: '#1C1410', lineHeight: 1.2, transition: 'color 100ms' }}>{s.name}</span>
              <span className="sd" style={{ fontFamily: 'var(--body)', fontSize: 12, color: 'var(--muted-fg)', transition: 'color 100ms' }}>{s.desc}</span>
            </button>
          )
        })}
      </div>

      {/* Quick access bar */}
      <div style={{ borderBottom: '1px solid var(--border-light)', padding: '20px 32px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-fg)' }}>Quick access</span>
        {[
          { label: 'Objection handler', id: 'objection-handler' },
          { label: 'Diagnostic breakup email', id: 'stalled' },
          { label: 'Cold call tree', id: 'cold-call' },
          { label: 'Create urgency', id: 'urgency' },
        ].map(q => {
          const sit = situations.situations.find(s => s.id === q.id)
          return (
            <button
              key={q.id}
              onClick={() => navigate('situation', sit)}
              className="btn-outline"
              style={{ padding: '7px 16px', fontSize: 11 }}
            >
              {q.label}
            </button>
          )
        })}
      </div>

      {/* The five things */}
      <div className="inverted-section">
        <div style={{ maxWidth: 680 }}>
          <span className="section-label" style={{ color: 'rgba(255,255,255,0.4)' }}>Non-negotiable</span>
          <div className="display-md" style={{ color: '#fff', marginBottom: 20, marginTop: 8, fontSize: '1.3rem' }}>
            Five things you leave every discovery call with.
          </div>
          {[
            'A quantified pain in the buyer\'s own numbers',
            'A compelling event with a date in the next 90 days',
            'The economic buyer\'s name and a path to meet them',
            'The decision process: who signs, how they buy, who blocks',
            'A specific next step on the calendar — not "I\'ll send you something"',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, paddingTop: 14, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(255,255,255,0.3)', flexShrink: 0, marginTop: 3 }}>0{i + 1}</span>
              <span style={{ fontFamily: 'var(--body)', fontSize: 15, color: '#fff', lineHeight: 1.55 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
