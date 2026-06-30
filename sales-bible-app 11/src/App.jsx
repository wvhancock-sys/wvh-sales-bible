import { useState } from 'react'
import { useSession } from './hooks/useSession'
import FrameworkHome from './components/FrameworkHome'
import SituationView from './components/SituationView'
import MissionControl from './components/MissionControl'
import EmailGenerator from './components/EmailGenerator'
import ProductRef from './components/ProductRef'
import DealDashboard from './components/DealDashboard'
import './App.css'

export default function App() {
  const [view, setView] = useState('home')
  const [viewData, setViewData] = useState(null)
  const { session, updateSession, resetSession } = useSession()

  function navigate(v, data = null, sessionUpdates = null) {
    if (sessionUpdates) updateSession(sessionUpdates)
    setViewData(data)
    setView(v)
    window.scrollTo(0, 0)
  }

  const NAV = [
    { id: 'home',     label: 'Playbook' },
    { id: 'deals',    label: 'Deals' },
    { id: 'mission',  label: 'AI Prep' },
    { id: 'email',    label: 'Email' },
    { id: 'products', label: 'Products' },
  ]

  return (
    <div className="app">
      <header className="app-header">
        <button className="logo-btn" onClick={() => navigate('home')}>
          <span className="logo-ibm">IBM</span>
          <span className="logo-sep">/</span>
          <span className="logo-title">Dispatch</span>
        </button>
        <nav className="app-nav">
          {NAV.map(n => (
            <button
              key={n.id}
              className={`nav-btn ${view === n.id || (view === 'situation' && n.id === 'home') ? 'active' : ''}`}
              onClick={() => navigate(n.id)}
            >
              {n.label}
            </button>
          ))}
        </nav>
      </header>

      {view === 'home'      && <FrameworkHome navigate={navigate} />}
      {view === 'situation' && <SituationView situation={viewData} navigate={navigate} session={session} updateSession={updateSession} />}
      {view === 'deals'     && <DealDashboard navigate={navigate} session={session} updateSession={updateSession} />}
      {view === 'mission'   && <MissionControl session={session} updateSession={updateSession} navigate={navigate} />}
      {view === 'email'     && <EmailGenerator session={session} updateSession={updateSession} navigate={navigate} />}
      {view === 'products'  && <ProductRef session={session} navigate={navigate} />}
    </div>
  )
}
