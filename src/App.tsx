import { useState } from 'react'
import Landing from './pages/Landing'
import AppShell from './app/AppShell'
import { C } from './design'

export default function App() {
  const [view, setView] = useState<'landing'|'app'>('landing')
  const [user, setUser] = useState<any>(null)

  if (view === 'app') {
    return <AppShell user={user} onLogout={() => setView('landing')} />
  }

  return (
    <Landing
      onLogin={() => setView('app')}
      onSignup={() => setView('app')}
    />
  )
}
