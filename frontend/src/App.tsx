import './App.css'
import ChatSection from './components/Chat/ChatSection'

export default function App() {
  return (
    <main className="container">
      <header>
        <h1>Starter App</h1>
        <p className="muted">React + FastAPI + MongoDB</p>
      </header>
      <ChatSection />
    </main>
  )
}
