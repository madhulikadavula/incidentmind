import { useState } from 'react'
import './App.css'

const incidents = [
  {
    id: 'INC-1042',
    title: 'Payment API latency spike',
    service: 'Payment API',
    severity: 'Critical',
    time: '12 min ago',
    status: 'Investigating',
  },
  {
    id: 'INC-1041',
    title: 'Database connection pool exhausted',
    service: 'Order Service',
    severity: 'High',
    time: '2 hrs ago',
    status: 'Resolved',
  },
  {
    id: 'INC-1040',
    title: 'Authentication failures',
    service: 'Auth Service',
    severity: 'Medium',
    time: 'Yesterday',
    status: 'Resolved',
  },
]

function App() {
  const [activePage, setActivePage] = useState('Dashboard')
  const [showForm, setShowForm] = useState(false)
  const [incidentText, setIncidentText] = useState('')

  // Investigation state
  const [investigationData, setInvestigationData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Hindsight memory state
  const [memoryData, setMemoryData] = useState([])
  const [memoryLoading, setMemoryLoading] = useState(false)
  const [memoryError, setMemoryError] = useState('')

  // Incident resolution / Retain state
  const [resolutionText, setResolutionText] = useState('')
  const [resolving, setResolving] = useState(false)
  const [resolutionMessage, setResolutionMessage] = useState('')

  // Hindsight Reflect state
  const [reflection, setReflection] = useState('')
  const [reflectionLoading, setReflectionLoading] = useState(false)
  const [reflectionError, setReflectionError] = useState('')

  // =====================================================
  // LOAD HINDSIGHT MEMORIES
  // =====================================================

  const loadMemories = async () => {
    setMemoryLoading(true)
    setMemoryError('')

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/memory'
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail?.message ||
            data.detail ||
            'Could not load Hindsight memories'
        )
      }

      // Backend returns:
      // { success: true, items: [...], total: number }
      const memories = data.items || []

      setMemoryData(memories)
    } catch (err) {
      console.error(err)

      setMemoryError(
        err.message || 'Could not connect to backend.'
      )
    } finally {
      setMemoryLoading(false)
    }
  }

  // =====================================================
  // SUBMIT INCIDENT
  // Recall + Groq Investigation
  // =====================================================

  const submitIncident = async (e) => {
    e.preventDefault()

    const incident = incidentText.trim()

    if (!incident) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/incidents/investigate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            incident: incident,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail?.message ||
            data.detail ||
            'Investigation failed'
        )
      }

      setInvestigationData(data)
      setShowForm(false)
      setActivePage('Investigation')
    } catch (err) {
      console.error(err)

      setError(
        err.message || 'Could not connect to backend.'
      )
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // RESOLVE INCIDENT
  // Hindsight Retain
  // =====================================================

  const resolveIncident = async () => {
    if (
      !investigationData?.incident ||
      !resolutionText.trim()
    ) {
      return
    }

    setResolving(true)
    setResolutionMessage('')

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/incidents/resolve',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            incident: investigationData.incident,
            resolution: resolutionText.trim(),
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail?.message ||
            data.detail ||
            'Resolution failed'
        )
      }

      setResolutionMessage(
        'Resolution retained in Hindsight successfully.'
      )

      setResolutionText('')

      // Reload live memories so the newly retained
      // resolution appears in the Memory page.
      await loadMemories()
    } catch (err) {
      console.error(err)

      setResolutionMessage(
        err.message || 'Could not retain resolution.'
      )
    } finally {
      setResolving(false)
    }
  }

  // =====================================================
  // REFLECT
  // Hindsight Reflect
  // =====================================================

  const runReflection = async () => {
    if (!investigationData?.incident) {
      return
    }

    setReflectionLoading(true)
    setReflectionError('')
    setReflection('')

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/incidents/reflect',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            incident: investigationData.incident,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail?.message ||
            data.detail ||
            'Reflection failed'
        )
      }

      setReflection(data.text || '')
    } catch (err) {
      console.error(err)

      setReflectionError(
        err.message || 'Could not generate reflection.'
      )
    } finally {
      setReflectionLoading(false)
    }
  }

  return (
    <div className="app-shell">

      {/* ===================================================== */}
      {/* SIDEBAR */}
      {/* ===================================================== */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-icon">
            ✦
          </div>

          <div>
            <h1>IncidentMind</h1>
            <span>AI Incident Response</span>
          </div>

        </div>

        <nav className="nav">

          {/* Dashboard */}

          <button
            className={
              activePage === 'Dashboard'
                ? 'nav-item active'
                : 'nav-item'
            }
            onClick={() =>
              setActivePage('Dashboard')
            }
          >
            <span>⌂</span>
            Dashboard
          </button>

          {/* Investigation */}

          <button
            className={
              activePage === 'Investigation'
                ? 'nav-item active'
                : 'nav-item'
            }
            onClick={() =>
              setActivePage('Investigation')
            }
          >
            <span>◈</span>
            Investigation
          </button>

          {/* Hindsight Memory */}

          <button
            className={
              activePage === 'Memory'
                ? 'nav-item active'
                : 'nav-item'
            }
            onClick={() => {
              setActivePage('Memory')
              loadMemories()
            }}
          >
            <span>◉</span>
            Hindsight Memory
          </button>

          {/* Incident History */}

          <button
            className={
              activePage === 'History'
                ? 'nav-item active'
                : 'nav-item'
            }
            onClick={() =>
              setActivePage('History')
            }
          >
            <span>↻</span>
            Incident History
          </button>

        </nav>

        <div className="sidebar-bottom">

          <div className="memory-status">

            <div className="status-dot"></div>

            <div>
              <strong>
                Hindsight Connected
              </strong>

              <small>
                Memory bank: incidentmind
              </small>
            </div>

          </div>

        </div>

      </aside>

      {/* ===================================================== */}
      {/* MAIN */}
      {/* ===================================================== */}

      <main className="main-content">

        {/* ===================================================== */}
        {/* TOP BAR */}
        {/* ===================================================== */}

        <header className="topbar">

          <div>

            <p className="eyebrow">
              AI OPERATIONS CENTER
            </p>

            <h2>
              {activePage}
            </h2>

          </div>

          <button
            className="primary-button"
            onClick={() => {
              setError('')
              setShowForm(true)
            }}
          >
            + Report Incident
          </button>

        </header>

        {/* ===================================================== */}
        {/* DASHBOARD */}
        {/* ===================================================== */}

        {activePage === 'Dashboard' && (
          <>

            <section className="hero-card">

              <div>

                <div className="hero-label">
                  <span className="pulse"></span>
                  INCIDENTMIND AGENT ONLINE
                </div>

                <h3>
                  Investigate incidents.
                  <br />
                  <span>
                    Learn from every resolution.
                  </span>
                </h3>

                <p>
                  IncidentMind uses persistent Hindsight
                  memory to recall previous incidents,
                  connect patterns, and improve
                  recommendations over time.
                </p>

                <button
                  className="hero-button"
                  onClick={() => {
                    setError('')
                    setShowForm(true)
                  }}
                >
                  Investigate an Incident →
                </button>

              </div>

              <div className="agent-visual">

                <div className="orbit orbit-one"></div>
                <div className="orbit orbit-two"></div>

                <div className="brain">
                  ✦
                </div>

              </div>

            </section>

            {/* Stats */}

            <section className="stats-grid">

              <div className="stat-card">

                <span>
                  Total Incidents
                </span>

                <strong>
                  42
                </strong>

                <small>
                  ↑ 8 this week
                </small>

              </div>

              <div className="stat-card">

                <span>
                  Resolved
                </span>

                <strong>
                  37
                </strong>

                <small>
                  88% resolution rate
                </small>

              </div>

              <div className="stat-card">

                <span>
                  Memories Stored
                </span>

                <strong>
                  128
                </strong>

                <small>
                  Hindsight memory bank
                </small>

              </div>

              <div className="stat-card">

                <span>
                  Avg. Resolution
                </span>

                <strong>
                  17m
                </strong>

                <small>
                  ↓ 34% after learning
                </small>

              </div>

            </section>

            {/* Dashboard grid */}

            <section className="dashboard-grid">

              <div className="panel incidents-panel">

                <div className="panel-header">

                  <div>

                    <h3>
                      Recent Incidents
                    </h3>

                    <p>
                      Latest incidents handled by the agent
                    </p>

                  </div>

                  <button
                    className="text-button"
                    onClick={() =>
                      setActivePage('History')
                    }
                  >
                    View all →
                  </button>

                </div>

                <div className="incident-list">

                  {incidents.map((incident) => (

                    <div
                      className="incident-row"
                      key={incident.id}
                    >

                      <div className="incident-main">

                        <div
                          className={`severity ${incident.severity.toLowerCase()}`}
                        >
                          {incident.severity[0]}
                        </div>

                        <div>

                          <strong>
                            {incident.title}
                          </strong>

                          <span>
                            {incident.id} · {incident.service}
                          </span>

                        </div>

                      </div>

                      <div className="incident-meta">

                        <span
                          className={`status ${incident.status.toLowerCase()}`}
                        >
                          {incident.status}
                        </span>

                        <small>
                          {incident.time}
                        </small>

                      </div>

                    </div>

                  ))}

                </div>

              </div>

              {/* Learning card */}

              <div className="panel learning-panel">

                <div className="panel-header">

                  <div>

                    <h3>
                      Agent Learning
                    </h3>

                    <p>
                      How memory improves response
                    </p>

                  </div>

                </div>

                <div className="learning-chart">

                  <div className="chart-line">

                    <span style={{ height: '78%' }}></span>
                    <span style={{ height: '65%' }}></span>
                    <span style={{ height: '51%' }}></span>
                    <span style={{ height: '37%' }}></span>
                    <span style={{ height: '24%' }}></span>

                  </div>

                  <div className="chart-labels">

                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>

                  </div>

                </div>

                <div className="learning-message">

                  <strong>
                    Resolution time is improving
                  </strong>

                  <span>
                    Agent now recalls proven solutions
                    from previous incidents.
                  </span>

                </div>

              </div>

            </section>

          </>
        )}

        {/* ===================================================== */}
        {/* INVESTIGATION */}
        {/* ===================================================== */}

        {activePage === 'Investigation' && (

          <section className="page-content">

            <div className="page-heading">

              <p className="eyebrow">
                AI INVESTIGATION
              </p>

              <h3>
                Incident Investigation
              </h3>

              <p>
                The agent combines the current incident
                with relevant Hindsight memories.
              </p>

            </div>

            {loading && (

              <div className="panel">

                <h3>
                  Investigating incident...
                </h3>

                <p>
                  IncidentMind is searching Hindsight
                  for relevant memories and generating
                  an AI investigation.
                </p>

              </div>

            )}

            {error && (

              <div className="panel">

                <h3>
                  Investigation Error
                </h3>

                <p>
                  {error}
                </p>

              </div>

            )}

            {investigationData && (

              <div className="investigation-grid">

                {/* ================================================= */}
                {/* CURRENT INCIDENT */}
                {/* ================================================= */}

                <div className="panel">

                  <div className="panel-header">

                    <div>

                      <h3>
                        Current Incident
                      </h3>

                      <p>
                        Live incident from frontend
                      </p>

                    </div>

                    <span className="status investigating">
                      Investigating
                    </span>

                  </div>

                  <div className="incident-description">

                    <strong>
                      Reported Incident
                    </strong>

                    <p>
                      {investigationData.incident}
                    </p>

                    <div className="log-box">

                      <span>
                        INCIDENT
                      </span>

                      <br />

                      Investigation sent to
                      IncidentMind backend

                      <br />

                      Hindsight memory bank:{' '}
                      {investigationData.memory_bank}

                      <br />

                      Groq AI analysis generated successfully

                    </div>

                  </div>

                </div>

                {/* ================================================= */}
                {/* HINDSIGHT RECALL */}
                {/* ================================================= */}

                <div className="panel">

                  <div className="panel-header">

                    <div>

                      <h3>
                        Hindsight Recall
                      </h3>

                      <p>
                        Relevant memories found
                      </p>

                    </div>

                    <span className="memory-badge">
                      {investigationData.memories?.results?.length || 0}{' '}
                      memories
                    </span>

                  </div>

                  {investigationData.memories?.results?.length > 0 ? (

                    investigationData.memories.results.map(
                      (memory, index) => (

                        <div
                          className="memory-result"
                          key={memory.id || index}
                        >

                          <div className="memory-icon">
                            ◉
                          </div>

                          <div>

                            <strong>
                              Memory {index + 1}
                            </strong>

                            <p>
                              {typeof memory === 'string'
                                ? memory
                                : memory.text ||
                                  memory.content ||
                                  memory.memory ||
                                  JSON.stringify(memory)}
                            </p>

                            <span className="confidence">
                              Recalled from Hindsight
                            </span>

                          </div>

                        </div>

                      )
                    )

                  ) : (

                    <div className="memory-result">

                      <div className="memory-icon">
                        ◉
                      </div>

                      <div>

                        <strong>
                          No previous memories found
                        </strong>

                        <p>
                          Hindsight did not find a matching
                          incident in the current memory bank.
                        </p>

                      </div>

                    </div>

                  )}

                </div>

                {/* ================================================= */}
                {/* AI INVESTIGATION RESULT */}
                {/* ================================================= */}

                <div className="panel recommendation-panel">

                  <div className="panel-header">

                    <div>

                      <h3>
                        AI Investigation Result
                      </h3>

                      <p>
                        Analysis generated by Groq using
                        Hindsight memory
                      </p>

                    </div>

                  </div>

                  <div className="recommendation">

                    <div className="recommendation-number">
                      AI
                    </div>

                    <div>

                      <strong>
                        Incident Analysis
                      </strong>

                      <div className="ai-analysis">

                        {investigationData.analysis ? (

                          <pre>
                            {investigationData.analysis}
                          </pre>

                        ) : (

                          <p>
                            No AI analysis was returned
                            for this incident.
                          </p>

                        )}

                      </div>

                    </div>

                  </div>

                  <button
                    className="resolve-button"
                    onClick={() => {
                      setActivePage('Memory')
                      loadMemories()
                    }}
                  >
                    View Hindsight Memory →
                  </button>

                </div>

                {/* ================================================= */}
                {/* RESOLVE / RETAIN */}
                {/* ================================================= */}

                <div className="panel">

                  <div className="panel-header">

                    <div>

                      <h3>
                        Resolve Incident
                      </h3>

                      <p>
                        Save the successful resolution
                        to Hindsight memory.
                      </p>

                    </div>

                  </div>

                  <textarea
                    value={resolutionText}
                    onChange={(e) =>
                      setResolutionText(e.target.value)
                    }
                    placeholder="Example: Increased database connection pool from 20 to 50 and adjusted idle timeout."
                    rows="5"
                  />

                  <button
                    className="resolve-button"
                    onClick={resolveIncident}
                    disabled={
                      resolving ||
                      !resolutionText.trim()
                    }
                  >
                    {resolving
                      ? 'Saving to Hindsight...'
                      : 'Resolve & Remember →'}
                  </button>

                  {resolutionMessage && (

                    <div className="form-hint">
                      {resolutionMessage}
                    </div>

                  )}

                </div>

                {/* ================================================= */}
                {/* REFLECT */}
                {/* ================================================= */}

                <div className="panel">

                  <div className="panel-header">

                    <div>

                      <h3>
                        Memory Reflection
                      </h3>

                      <p>
                        Identify patterns and lessons
                        from previous incidents.
                      </p>

                    </div>

                  </div>

                  <button
                    className="secondary-button"
                    onClick={runReflection}
                    disabled={reflectionLoading}
                  >
                    {reflectionLoading
                      ? 'Reflecting...'
                      : 'Reflect on Incident ↻'}
                  </button>

                  {reflectionError && (

                    <div className="form-hint">
                      {reflectionError}
                    </div>

                  )}

                  {reflection && (

                    <div className="ai-analysis">

                      <pre>
                        {reflection}
                      </pre>

                    </div>

                  )}

                </div>

              </div>

            )}

          </section>

        )}

        {/* ===================================================== */}
        {/* MEMORY */}
        {/* ===================================================== */}

        {activePage === 'Memory' && (

          <section className="page-content">

            <div className="page-heading">

              <p className="eyebrow">
                HINDSIGHT MEMORY
              </p>

              <h3>
                What IncidentMind Has Learned
              </h3>

              <p>
                Persistent memories allow the agent to
                improve its investigation over time.
              </p>

            </div>

            {/* Memory overview */}

            <div className="memory-overview">

              <div className="panel memory-stat">

                <span>
                  Total memories
                </span>

                <strong>
                  {memoryData.length}
                </strong>

              </div>

              <div className="panel memory-stat">

                <span>
                  Incident patterns
                </span>

                <strong>

                  {memoryData.filter(
                    (memory) => {

                      const text =
                        typeof memory === 'string'
                          ? memory
                          : memory.text ||
                            memory.content ||
                            memory.memory ||
                            ''

                      return text
                        .toLowerCase()
                        .includes('incident')
                    }
                  ).length}

                </strong>

              </div>

              <div className="panel memory-stat">

                <span>
                  Proven resolutions
                </span>

                <strong>

                  {memoryData.filter(
                    (memory) => {

                      const text =
                        typeof memory === 'string'
                          ? memory
                          : memory.text ||
                            memory.content ||
                            memory.memory ||
                            ''

                      return text
                        .toLowerCase()
                        .includes('resolv')
                    }
                  ).length}

                </strong>

              </div>

            </div>

            {/* Memory list */}

            <div className="panel">

              <div className="panel-header">

                <div>

                  <h3>
                    Recent Learned Memories
                  </h3>

                  <p>
                    Live memories stored in Hindsight
                  </p>

                </div>

                <button
                  className="text-button"
                  onClick={loadMemories}
                  disabled={memoryLoading}
                >
                  {memoryLoading
                    ? 'Refreshing...'
                    : 'Refresh ↻'}
                </button>

              </div>

              {/* Loading */}

              {memoryLoading && (

                <div className="memory-result">

                  <div className="memory-icon">
                    ◉
                  </div>

                  <div>

                    <strong>
                      Loading Hindsight memories...
                    </strong>

                    <p>
                      Fetching the latest memories
                      from the incidentmind memory bank.
                    </p>

                  </div>

                </div>

              )}

              {/* Error */}

              {memoryError && (

                <div className="memory-result">

                  <div className="memory-icon">
                    !
                  </div>

                  <div>

                    <strong>
                      Could not load memories
                    </strong>

                    <p>
                      {memoryError}
                    </p>

                  </div>

                </div>

              )}

              {/* Empty */}

              {!memoryLoading &&
                !memoryError &&
                memoryData.length === 0 && (

                  <div className="memory-result">

                    <div className="memory-icon">
                      ◉
                    </div>

                    <div>

                      <strong>
                        No memories found
                      </strong>

                      <p>
                        Hindsight has not returned
                        any memories yet.
                      </p>

                    </div>

                  </div>

                )}

              {/* Memories */}

              {!memoryLoading &&
                !memoryError &&
                memoryData.length > 0 && (

                  <div className="memory-timeline">

                    {memoryData.map(
                      (memory, index) => {

                        const memoryText =
                          typeof memory === 'string'
                            ? memory
                            : memory.text ||
                              memory.content ||
                              memory.memory ||
                              JSON.stringify(memory)

                        return (

                          <div
                            className="timeline-item"
                            key={
                              memory.id || index
                            }
                          >

                            <div className="timeline-dot"></div>

                            <div>

                              <span className="timeline-date">

                                {memory.occurred_start
                                  ? new Date(
                                      memory.occurred_start
                                    ).toLocaleString()
                                  : `Memory ${index + 1}`}

                              </span>

                              <strong>

                                {memory.context ||
                                  memory.type ||
                                  'Incident memory'}

                              </strong>

                              <p>
                                {memoryText}
                              </p>

                            </div>

                          </div>

                        )
                      }
                    )}

                  </div>

                )}

            </div>

          </section>

        )}

        {/* ===================================================== */}
        {/* HISTORY */}
        {/* ===================================================== */}

        {activePage === 'History' && (

          <section className="page-content">

            <div className="page-heading">

              <p className="eyebrow">
                INCIDENT HISTORY
              </p>

              <h3>
                Previous Incidents
              </h3>

              <p>
                Past incidents become knowledge that
                IncidentMind can recall during future
                investigations.
              </p>

            </div>

            <div className="panel">

              <div className="incident-list large">

                {incidents.map((incident) => (

                  <div
                    className="incident-row"
                    key={incident.id}
                  >

                    <div className="incident-main">

                      <div
                        className={`severity ${incident.severity.toLowerCase()}`}
                      >
                        {incident.severity[0]}
                      </div>

                      <div>

                        <strong>
                          {incident.title}
                        </strong>

                        <span>
                          {incident.id} · {incident.service}
                        </span>

                      </div>

                    </div>

                    <div className="incident-meta">

                      <span
                        className={`status ${incident.status.toLowerCase()}`}
                      >
                        {incident.status}
                      </span>

                      <small>
                        {incident.time}
                      </small>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </section>

        )}

      </main>

      {/* ===================================================== */}
      {/* REPORT INCIDENT MODAL */}
      {/* ===================================================== */}

      {showForm && (

        <div className="modal-overlay">

          <div className="modal">

            <div className="modal-header">

              <div>

                <p className="eyebrow">
                  NEW INCIDENT
                </p>

                <h3>
                  Report an Incident
                </h3>

              </div>

              <button
                className="close-button"
                onClick={() =>
                  setShowForm(false)
                }
              >
                ×
              </button>

            </div>

            <form onSubmit={submitIncident}>

              <label>
                Incident description
              </label>

              <textarea
                value={incidentText}
                onChange={(e) =>
                  setIncidentText(e.target.value)
                }
                placeholder="Example: Payment API latency increased to 4.8 seconds and database connection timeouts are appearing in the logs..."
                rows="7"
              />

              <div className="form-hint">

                IncidentMind will investigate the incident
                and recall relevant Hindsight memories.

              </div>

              {error && (

                <div className="form-hint">
                  Error: {error}
                </div>

              )}

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setShowForm(false)
                  }
                  disabled={loading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={loading}
                >
                  {loading
                    ? 'Investigating...'
                    : 'Investigate Incident →'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}

export default App