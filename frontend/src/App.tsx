import { HealthCard } from './components/HealthCard'
import './App.css'

export default function App() {
  return (
    <main className="container">
      <header>
        <h1>Starter App</h1>
        <p className="muted">React + FastAPI + MongoDB</p>
      </header>
      <HealthCard />
    </main>
  )
}
