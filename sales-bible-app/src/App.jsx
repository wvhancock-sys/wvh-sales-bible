import { useState } from 'react'
import HomeScreen from './components/HomeScreen'
import PlayViewer from './components/PlayViewer'
import PrepBuilder from './components/PrepBuilder'
import ObjectionLookup from './components/ObjectionLookup'
import EmailGenerator from './components/EmailGenerator'
import ProductRef from './components/ProductRef'
import './App.css'

export default function App() {
  const [view, setView] = useState('home')
  const [viewData, setViewData] = useState(null)

  function navigate(v, data = null) {
    setView(v)
    setViewData(data)
    window.scrollTo(0, 0)
  }

  return (
    <div className="app">
      <header className="app-header">
        <button className="logo-btn" onClick={() => navigate('home')}>
          <span className="logo-ibm">IBM</span>
          <span className="logo-title">Sales Bible</span>
        </button>
        <nav className="app-nav">
          <button className={view === 'prep' ? 'nav-btn active' : 'nav-btn'} onClick={() => navigate('prep')}>AI Prep</button>
          <button className={view === 'objections' ? 'nav-btn active' : 'nav-btn'} onClick={() => navigate('objections')}>Objections</button>
          <button className={view === 'email' ? 'nav-btn active' : 'nav-btn'} onClick={() => navigate('email')}>Email</button>
          <button className={view === 'products' ? 'nav-btn active' : 'nav-btn'} onClick={() => navigate('products')}>Products</button>
        </nav>
      </header>

      <main className="app-main">
        {view === 'home'       && <HomeScreen navigate={navigate} />}
        {view === 'play'       && <PlayViewer play={viewData} navigate={navigate} />}
        {view === 'prep'       && <PrepBuilder navigate={navigate} initData={viewData} />}
        {view === 'objections' && <ObjectionLookup navigate={navigate} />}
        {view === 'email'      && <EmailGenerator navigate={navigate} initData={viewData} />}
        {view === 'products'   && <ProductRef navigate={navigate} />}
      </main>
    </div>
  )
}
