import { useState } from 'react'
import { useSession } from './hooks/useSession'
import MissionControl from './components/MissionControl'
import HomeScreen from './components/HomeScreen'
import EmailGenerator from './components/EmailGenerator'
import ProductRef from './components/ProductRef'
import './App.css'

export default function App() {
  const [view, setView] = useState('home')
  const { session, updateSession, resetSession, hasContext } = useSession()

  function navigate(v, sessionUpdates = null) {
    if (sessionUpdates) updateSession(sessionUpdates)
    setView(v)
    window.scrollTo(0, 0)
  }

  return (
    <div className="app">
      <header className="app-header">
        <button className="logo-btn" onClick={() => setView('home')}>
          <span className="logo-ibm">IBM</span>
          <span className="logo-sep">/</span>
          <span className="logo-title">Dispatch</span>
        </button>
        <nav className="app-nav">
          <button className={`nav-btn ${view === 'home' ? 'active' : ''}`} onClick={() => setView('home')}>Home</button>
          <button className={`nav-btn ${view === 'mission' ? 'active' : ''}`} onClick={() => setView('mission')}>Mission Control</button>
          <button className={`nav-btn ${view === 'email' ? 'active' : ''}`} onClick={() => setView('email')}>Email</button>
          <button className={`nav-btn ${view === 'products' ? 'active' : ''}`} onClick={() => setView('products')}>Products</button>
        </nav>
      </header>

      {view === 'home'     && <HomeScreen navigate={navigate} session={session} />}
      {view === 'mission'  && <MissionControl session={session} updateSession={updateSession} navigate={navigate} />}
      {view === 'email'    && <EmailGenerator session={session} updateSession={updateSession} navigate={navigate} />}
      {view === 'products' && <ProductRef session={session} navigate={navigate} />}
    </div>
  )
}
