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

  const submitIncident = (e) => {
    e.preventDefault()
    if (!incidentText.trim()) return

    setShowForm(false)
    setActivePage('Investigation')
  }

  return (
    <div className="app-shell">

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">✦</div>
          <div>
            <h1>IncidentMind</h1>
            <span>AI Incident Response</span>
          </div>
        </div>

        <nav className="nav">
          <button
            className={activePage === 'Dashboard' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActivePage('Dashboard')}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className={activePage === 'Investigation' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActivePage('Investigation')}
          >
            <span>◈</span>
            Investigation
          </button>

          <button
            className={activePage === 'Memory' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActivePage('Memory')}
          >
            <span>◉</span>
            Hindsight Memory
          </button>

          <button
            className={activePage === 'History' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActivePage('History')}
          >
            <span>↻</span>
            Incident History
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="memory-status">
            <div className="status-dot"></div>
            <div>
              <strong>Hindsight Connected</strong>
              <small>Memory bank: incidentmind</small>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">

        {/* Top bar */}
        <header className="topbar">
          <div>
            <p className="eyebrow">AI OPERATIONS CENTER</p>
            <h2>{activePage}</h2>
          </div>

          <button
            className="primary-button"
            onClick={() => setShowForm(true)}
          >
            + Report Incident
          </button>
        </header>

        {/* Dashboard */}
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
                  <span>Learn from every resolution.</span>
                </h3>

                <p>
                  IncidentMind uses persistent Hindsight memory to recall
                  previous incidents, connect patterns, and improve
                  recommendations over time.
                </p>

                <button
                  className="hero-button"
                  onClick={() => setShowForm(true)}
                >
                  Investigate an Incident →
                </button>
              </div>

              <div className="agent-visual">
                <div className="orbit orbit-one"></div>
                <div className="orbit orbit-two"></div>
                <div className="brain">✦</div>
              </div>
            </section>

            {/* Stats */}
            <section className="stats-grid">
              <div className="stat-card">
                <span>Total Incidents</span>
                <strong>42</strong>
                <small>↑ 8 this week</small>
              </div>

              <div className="stat-card">
                <span>Resolved</span>
                <strong>37</strong>
                <small>88% resolution rate</small>
              </div>

              <div className="stat-card">
                <span>Memories Stored</span>
                <strong>128</strong>
                <small>Hindsight memory bank</small>
              </div>

              <div className="stat-card">
                <span>Avg. Resolution</span>
                <strong>17m</strong>
                <small>↓ 34% after learning</small>
              </div>
            </section>

            {/* Main dashboard grid */}
            <section className="dashboard-grid">

              <div className="panel incidents-panel">
                <div className="panel-header">
                  <div>
                    <h3>Recent Incidents</h3>
                    <p>Latest incidents handled by the agent</p>
                  </div>

                  <button
                    className="text-button"
                    onClick={() => setActivePage('History')}
                  >
                    View all →
                  </button>
                </div>

                <div className="incident-list">
                  {incidents.map((incident) => (
                    <div className="incident-row" key={incident.id}>
                      <div className="incident-main">
                        <div className={`severity ${incident.severity.toLowerCase()}`}>
                          {incident.severity[0]}
                        </div>

                        <div>
                          <strong>{incident.title}</strong>
                          <span>
                            {incident.id} · {incident.service}
                          </span>
                        </div>
                      </div>

                      <div className="incident-meta">
                        <span className={`status ${incident.status.toLowerCase()}`}>
                          {incident.status}
                        </span>
                        <small>{incident.time}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning card */}
              <div className="panel learning-panel">
                <div className="panel-header">
                  <div>
                    <h3>Agent Learning</h3>
                    <p>How memory improves response</p>
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
                  <strong>Resolution time is improving</strong>
                  <span>
                    Agent now recalls proven solutions from previous incidents.
                  </span>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Investigation */}
        {activePage === 'Investigation' && (
          <section className="page-content">

            <div className="page-heading">
              <p className="eyebrow">AI INVESTIGATION</p>
              <h3>Incident Investigation</h3>
              <p>
                The agent combines the current incident with relevant
                Hindsight memories.
              </p>
            </div>

            <div className="investigation-grid">

              <div className="panel">
                <div className="panel-header">
                  <div>
                    <h3>Current Incident</h3>
                    <p>INC-1042 · Payment API</p>
                  </div>

                  <span className="status investigating">
                    Investigating
                  </span>
                </div>

                <div className="incident-description">
                  <strong>Payment API latency spike</strong>

                  <p>
                    API response time increased from 420ms to 4.8s.
                    Error logs show repeated database connection timeout
                    messages.
                  </p>

                  <div className="log-box">
                    <span>ERROR</span>
                    Connection pool exhausted
                    <br />
                    Active connections: 20/20
                    <br />
                    Timeout waiting for database connection
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <div>
                    <h3>Hindsight Recall</h3>
                    <p>Relevant memories found</p>
                  </div>

                  <span className="memory-badge">3 memories</span>
                </div>

                <div className="memory-result">
                  <div className="memory-icon">◉</div>

                  <div>
                    <strong>Similar incident detected</strong>

                    <p>
                      INC-1031 experienced database connection pool
                      exhaustion under high traffic.
                    </p>

                    <span className="confidence">
                      94% relevance
                    </span>
                  </div>
                </div>

                <div className="memory-result">
                  <div className="memory-icon">◉</div>

                  <div>
                    <strong>Previous resolution</strong>

                    <p>
                      Connection pool increased from 20 to 50 and
                      idle timeout was adjusted.
                    </p>

                    <span className="confidence">
                      Proven resolution
                    </span>
                  </div>
                </div>
              </div>

              <div className="panel recommendation-panel">
                <div className="panel-header">
                  <div>
                    <h3>AI Recommendation</h3>
                    <p>Based on current evidence + memory</p>
                  </div>
                </div>

                <div className="recommendation">
                  <div className="recommendation-number">01</div>

                  <div>
                    <strong>Increase database connection pool</strong>

                    <p>
                      Increase the pool size from 20 to 50 connections
                      and monitor database utilization.
                    </p>
                  </div>
                </div>

                <div className="recommendation">
                  <div className="recommendation-number">02</div>

                  <div>
                    <strong>Check traffic increase</strong>

                    <p>
                      Compare current request volume against the
                      previous incident.
                    </p>
                  </div>
                </div>

                <button className="resolve-button">
                  Mark Resolution Applied
                </button>
              </div>

            </div>
          </section>
        )}

        {/* Memory */}
        {activePage === 'Memory' && (
          <section className="page-content">

            <div className="page-heading">
              <p className="eyebrow">HINDSIGHT MEMORY</p>
              <h3>What IncidentMind Has Learned</h3>
              <p>
                Persistent memories allow the agent to improve its
                investigation over time.
              </p>
            </div>

            <div className="memory-overview">
              <div className="panel memory-stat">
                <span>Total memories</span>
                <strong>128</strong>
              </div>

              <div className="panel memory-stat">
                <span>Incident patterns</span>
                <strong>24</strong>
              </div>

              <div className="panel memory-stat">
                <span>Proven resolutions</span>
                <strong>31</strong>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <div>
                  <h3>Recent Learned Memories</h3>
                  <p>Stored through Hindsight</p>
                </div>
              </div>

              <div className="memory-timeline">

                <div className="timeline-item">
                  <div className="timeline-dot"></div>

                  <div>
                    <span className="timeline-date">Today · 14:32</span>
                    <strong>Database connection exhaustion</strong>
                    <p>
                      High traffic can exhaust a 20-connection pool.
                      Increasing to 50 resolved the previous incident.
                    </p>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-dot"></div>

                  <div>
                    <span className="timeline-date">Yesterday · 18:10</span>
                    <strong>Payment API latency pattern</strong>
                    <p>
                      Latency above 4 seconds correlated with database
                      connection timeouts.
                    </p>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-dot"></div>

                  <div>
                    <span className="timeline-date">Sep 25 · 11:45</span>
                    <strong>Authentication failure pattern</strong>
                    <p>
                      Token-service failures were previously caused by
                      expired signing keys.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </section>
        )}

        {/* History */}
        {activePage === 'History' && (
          <section className="page-content">

            <div className="page-heading">
              <p className="eyebrow">INCIDENT HISTORY</p>
              <h3>Previous Incidents</h3>
              <p>
                Past incidents become knowledge that IncidentMind can
                recall during future investigations.
              </p>
            </div>

            <div className="panel">
              <div className="incident-list large">

                {incidents.map((incident) => (
                  <div className="incident-row" key={incident.id}>
                    <div className="incident-main">
                      <div className={`severity ${incident.severity.toLowerCase()}`}>
                        {incident.severity[0]}
                      </div>

                      <div>
                        <strong>{incident.title}</strong>
                        <span>
                          {incident.id} · {incident.service}
                        </span>
                      </div>
                    </div>

                    <div className="incident-meta">
                      <span className={`status ${incident.status.toLowerCase()}`}>
                        {incident.status}
                      </span>
                      <small>{incident.time}</small>
                    </div>
                  </div>
                ))}

              </div>
            </div>
          </section>
        )}

      </main>

      {/* Report Incident Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">

            <div className="modal-header">
              <div>
                <p className="eyebrow">NEW INCIDENT</p>
                <h3>Report an Incident</h3>
              </div>

              <button
                className="close-button"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={submitIncident}>

              <label>Incident description</label>

              <textarea
                value={incidentText}
                onChange={(e) => setIncidentText(e.target.value)}
                placeholder="Example: Payment API latency increased to 4.8 seconds and database connection timeouts are appearing in the logs..."
                rows="7"
              />

              <div className="form-hint">
                IncidentMind will investigate the incident and recall
                relevant Hindsight memories.
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-button">
                  Investigate Incident →
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