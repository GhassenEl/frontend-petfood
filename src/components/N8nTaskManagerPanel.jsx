import React, { useCallback, useEffect, useState } from 'react';
import {
  getUserWorkflows,
  getTaskLog,
  toggleWorkflow,
  triggerWorkflow,
  getAutomationStats,
  checkN8nConnection,
} from '../services/n8nTaskService';

const STATUS_COLORS = {
  success: '#059669',
  flagged: '#d97706',
  error: '#dc2626',
};

const N8nTaskManagerPanel = () => {
  const [workflows, setWorkflows] = useState([]);
  const [log, setLog] = useState([]);
  const [stats, setStats] = useState(null);
  const [running, setRunning] = useState(null);
  const [n8nStatus, setN8nStatus] = useState(null);

  const refresh = useCallback(() => {
    setWorkflows(getUserWorkflows());
    setLog(getTaskLog());
    setStats(getAutomationStats());
    checkN8nConnection().then(setN8nStatus);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleToggle = (id, enabled) => {
    toggleWorkflow(id, enabled);
    refresh();
  };

  const handleRun = async (id) => {
    setRunning(id);
    try {
      await triggerWorkflow(id, { manual: true });
      refresh();
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="cia-panel">
      <h2 className="cia-panel__title">Gestionnaire de tâches n8n</h2>
      <p className="cia-panel__desc">
        Automatisations orchestrées par n8n : rappels IoT, suivi commandes, alertes NLP et scan anomalies.
        {n8nStatus && (
          <span
            className="cia-n8n-badge"
            style={{
              color: n8nStatus.connected ? '#059669' : '#d97706',
              marginLeft: 8,
            }}
          >
            {n8nStatus.connected ? '● n8n connecté' : `● ${n8nStatus.message}`}
          </span>
        )}
      </p>
      {!n8nStatus?.connected && (
        <p className="cia-muted" style={{ marginBottom: 12 }}>
          Démarrez n8n : <code>npm run n8n:up</code> — UI :{' '}
          <a href="http://localhost:5678" target="_blank" rel="noreferrer">localhost:5678</a>
          {' '}(admin / changeme)
        </p>
      )}

      {stats && (
        <div className="cia-stats-grid">
          <div className="cia-stat">
            <span>Workflows actifs</span>
            <strong>{stats.activeCount}/{stats.totalWorkflows}</strong>
          </div>
          <div className="cia-stat">
            <span>Exécutions aujourd&apos;hui</span>
            <strong>{stats.runsToday}</strong>
          </div>
          <div className="cia-stat">
            <span>Signalements</span>
            <strong>{stats.flaggedCount}</strong>
          </div>
        </div>
      )}

      <div className="cia-workflow-list">
        {workflows.map((wf) => (
          <article key={wf.id} className={`cia-workflow${wf.enabled ? '' : ' cia-workflow--off'}`}>
            <div className="cia-workflow__head">
              <span className="cia-workflow__icon">{wf.icon}</span>
              <div>
                <h3>{wf.name}</h3>
                <p className="cia-muted">{wf.schedule}</p>
              </div>
              <label className="cia-switch">
                <input
                  type="checkbox"
                  checked={wf.enabled}
                  onChange={(e) => handleToggle(wf.id, e.target.checked)}
                />
                <span>Actif</span>
              </label>
            </div>
            <p>{wf.description}</p>
            <p className="cia-n8n-node"><code>{wf.n8nNode}</code></p>
            <div className="cia-workflow__actions">
              <button
                type="button"
                className="cia-btn cia-btn--secondary"
                disabled={!wf.enabled || running === wf.id}
                onClick={() => handleRun(wf.id)}
              >
                {running === wf.id ? 'Exécution…' : 'Exécuter maintenant'}
              </button>
              {wf.lastRun && (
                <span className="cia-muted">Dernière exécution : {new Date(wf.lastRun).toLocaleString('fr-FR')}</span>
              )}
            </div>
          </article>
        ))}
      </div>

      <section className="cia-section">
        <h3>Journal des tâches</h3>
        <ul className="cia-log-list">
          {log.map((entry) => (
            <li key={entry.id} className="cia-log-item">
              <span
                className="cia-log-dot"
                style={{ background: STATUS_COLORS[entry.status] || '#64748b' }}
              />
              <div>
                <strong>{entry.message}</strong>
                <span className="cia-muted">{new Date(entry.at).toLocaleString('fr-FR')}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default N8nTaskManagerPanel;
