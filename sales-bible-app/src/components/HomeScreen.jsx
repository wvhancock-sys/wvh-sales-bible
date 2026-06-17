import bible from '../data/bible.json'

const scenarios = [
  { icon: '📞', name: 'Inbound Discovery', desc: 'They came to you', playId: 'play1' },
  { icon: '📤', name: 'Outbound Discovery', desc: 'You created the meeting', playId: 'play2' },
  { icon: '🧪', name: 'Validation', desc: 'Running or presenting a POC', playId: 'play3' },
  { icon: '🎯', name: 'Exec Alignment', desc: 'Meeting the economic buyer', playId: 'play4' },
  { icon: '🔄', name: 'Stalled Deal', desc: 'Gone quiet, need to recover', playId: 'play5' },
  { icon: '🤖', name: 'AI Prep Builder', desc: 'Build a custom call plan', view: 'prep' },
]

export default function HomeScreen({ navigate }) {
  function handleScenario(s) {
    if (s.view) { navigate(s.view); return; }
    const play = bible.plays.find(p => p.id === s.playId)
    navigate('play', play)
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <span className="label">IBM AI P&P IND</span>
        <h1>Sales Bible</h1>
        <p className="muted" style={{ marginTop: 6 }}>What's on your calendar? Pick the scenario and run the play.</p>
      </div>

      <span className="label">Today's call</span>
      <div className="scenario-grid">
        {scenarios.map(s => (
          <button key={s.name} className="scenario-card" onClick={() => handleScenario(s)}>
            <span className="scenario-icon">{s.icon}</span>
            <span className="scenario-name">{s.name}</span>
            <span className="scenario-desc">{s.desc}</span>
          </button>
        ))}
      </div>

      <div className="card">
        <span className="label">Quick access</span>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
          <button className="btn btn-sm" onClick={() => navigate('objections')}>Objection scripts</button>
          <button className="btn btn-sm" onClick={() => navigate('email')}>Email generator</button>
          <button className="btn btn-sm" onClick={() => navigate('products')}>Product POVs</button>
        </div>
      </div>

      <div className="card">
        <span className="label">The five things you leave every discovery call with</span>
        {[
          'A quantified pain in the buyer\'s own numbers',
          'A compelling event with a date in the next 90 days',
          'The economic buyer\'s name and a path to meet them',
          'The decision process: who signs, how they buy, who blocks',
          'A specific next step on the calendar, not "I\'ll send you something"',
        ].map((item, i) => (
          <div key={i} className="question-item" style={{ marginBottom: 6 }}>
            <span style={{ color: 'var(--muted)', fontFamily: 'Courier New', fontSize: 11, flexShrink: 0 }}>{i + 1}.</span>
            <span style={{ fontSize: 13 }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
