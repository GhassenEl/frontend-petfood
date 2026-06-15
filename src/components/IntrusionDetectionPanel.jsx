import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Radar, RefreshCw, Shield } from 'lucide-react';
import { fetchIntrusionEvents, fetchSecurityStatus } from '../services/securityService';
import usePlatformRefresh from '../hooks/usePlatformRefresh';

const SEVERITY_CLASS = {
  critical: 'adm-pill adm-pill--danger',
  high: 'adm-pill adm-pill--danger',
  medium: 'adm-pill adm-pill--warn',
  low: 'adm-pill',
};

const TYPE_LABELS = {
  scanner: 'Scanner',
  path_traversal: 'Path traversal',
  sql_injection: 'SQL injection',
  xss: 'XSS',
  admin_probe: 'Sonde admin',
  brute_force: 'Brute force',
  rate_limit: 'Débit anormal',
};

const IntrusionDetectionPanel = () => {
  const [status, setStatus] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [st, intrusion] = await Promise.all([
        fetchSecurityStatus(),
        fetchIntrusionEvents(40),
      ]);
      setStatus(st?.ids || st);
      setEvents(intrusion?.items || []);
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Impossible de charger le module IDS.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  usePlatformRefresh(load);

  if (loading && !status) {
    return <p>Chargement du système de détection d&apos;intrusions…</p>;
  }

  const severity = status?.bySeverity || {};

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {error && <p className="adm-msg" style={{ color: '#b91c1c' }}>{error}</p>}

      <div className="adm-form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <div className="adm-card" style={{ padding: 14 }}>
          <strong style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Radar size={16} /> Moteur IDS
          </strong>
          <p style={{ margin: '6px 0 0', fontSize: '0.85rem' }}>{status?.engine || 'PetfoodTN IDS'}</p>
        </div>
        <div className="adm-card" style={{ padding: 14 }}>
          <strong>Statut</strong>
          <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: status?.enabled !== false ? '#059669' : '#b91c1c' }}>
            {status?.enabled !== false ? 'Actif' : 'Désactivé'}
          </p>
        </div>
        <div className="adm-card" style={{ padding: 14 }}>
          <strong>Alertes 24h</strong>
          <p style={{ margin: '6px 0 0', fontSize: '0.85rem' }}>{status?.eventsLast24h ?? 0}</p>
        </div>
        <div className="adm-card" style={{ padding: 14 }}>
          <strong>IPs surveillées</strong>
          <p style={{ margin: '6px 0 0', fontSize: '0.85rem' }}>{status?.monitoredIps ?? 0}</p>
        </div>
        <div className="adm-card" style={{ padding: 14 }}>
          <strong>Blocage auto</strong>
          <p style={{ margin: '6px 0 0', fontSize: '0.85rem' }}>
            {status?.blockingEnabled ? 'Activé' : 'Journalisation seule'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: '0.82rem' }}>
        {Object.entries(severity).map(([level, count]) => (
          <span key={level} className={SEVERITY_CLASS[level] || 'adm-pill'}>
            {level}: {count}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={18} />
          Journal d&apos;intrusions
        </h3>
        <button type="button" className="adm-btn" onClick={load} disabled={loading}>
          <RefreshCw size={15} /> Actualiser
        </button>
      </div>

      {events.length === 0 ? (
        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Aucune intrusion détectée. Le système surveille les scans, injections, brute-force et débits anormaux.
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="adm-table" style={{ fontSize: '0.82rem' }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Gravité</th>
                <th>IP</th>
                <th>Détail</th>
                <th>Bloqué</th>
              </tr>
            </thead>
            <tbody>
              {events.map((row) => (
                <tr key={row.id}>
                  <td>{new Date(row.at).toLocaleString('fr-FR')}</td>
                  <td>{TYPE_LABELS[row.type] || row.type || '—'}</td>
                  <td>
                    <span className={SEVERITY_CLASS[row.severity] || 'adm-pill'}>{row.severity}</span>
                  </td>
                  <td>{row.ip || '—'}</td>
                  <td style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {row.detail || row.label || '—'}
                  </td>
                  <td>{row.blocked ? <AlertTriangle size={14} color="#b91c1c" /> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default IntrusionDetectionPanel;
