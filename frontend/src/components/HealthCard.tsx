import { useHealth } from '../hooks/useHealth'

export function HealthCard() {
  const { state, refresh } = useHealth()

  return (
    <section className="card">
      <div className="card-header">
        <h2>Backend status</h2>
        <button onClick={refresh} disabled={state.status === 'loading'}>
          Refresh
        </button>
      </div>

      {state.status === 'loading' && <p className="muted">Checking…</p>}

      {state.status === 'ok' && (
        <dl className="status-list">
          <div>
            <dt>API</dt>
            <dd><span className="dot ok" /> {state.data.status}</dd>
          </div>
          <div>
            <dt>MongoDB</dt>
            <dd><span className="dot ok" /> {state.data.mongo}</dd>
          </div>
          <div>
            <dt>Database</dt>
            <dd><code>{state.data.database}</code></dd>
          </div>
        </dl>
      )}

      {state.status === 'error' && (
        <p className="error">
          <span className="dot err" /> Can't reach the backend. {state.error}
        </p>
      )}
    </section>
  )
}
