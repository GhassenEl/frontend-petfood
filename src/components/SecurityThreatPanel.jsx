import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react';
import {
  fetchSecurityStatus,
  fetchThreatLog,
  scanTextForThreats,
} from '../services/securityService';
import usePlatformRefresh from '../hooks/usePlatformRefresh';

const SEVERITY_CLASS = {
  critical: 'adm-pill adm-pill--danger',
  high: 'adm-pill adm-pill--danger',
  medium: 'adm-pill adm-pill--warn',
  low: 'adm-pill',
};

const SecurityThreatPanel = () => {
  const [status, setStatus] = useState(null);
  const [threats, setThreats] = useState([]);
  const [sample, setSample] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [st, log] = await Promise.all([
        fetchSecurityStatus(),
        fetchThreatLog(30),
      ]);
      setStatus(st);
      setThreats(log?.items || []);
    } catch (e) {
      setError(e.backendErrorMessage || e.message || 'Impossible de charger la sécurité.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  usePlatformRefresh(load);

  const runScan = async () => {
    if (!sample.trim()) return;
    setScanning(true);
    setError('');
    try {
      const result = await scanTextForThreats(sample, { source: 'admin_panel' });
      setScanResult(result);
      await load();
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Échec du scan.');
    } finally {
      setScanning(false);
    }
  };

  if (loading && !status) {
    return <p>Chargement du module anti-menaces…</p>;
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {error && (
        <p className="adm-msg" style={{ color: '#b91c1c' }}>{error}</p>
      )}

      <div className="adm-form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="adm-card" style={{ padding: 14 }}>
          <strong>Moteur</strong>
          <p style={{ margin: '6px 0 0', fontSize: '0.85rem' }}>
            {status?.engine || 'PetfoodTN Threat Scanner'}
          </p>
        </div>
        <div className="adm-card" style={{ padding: 14 }}>
          <strong>Signatures</strong>
          <p style={{ margin: '6px 0 0', fontSize: '0.85rem' }}>{status?.signatureCount ?? '—'}</p>
        </div>
        <div className="adm-card" style={{ padding: 14 }}>
          <strong>Menaces détectées</strong>
          <p style={{ margin: '6px 0 0', fontSize: '0.85rem' }}>{status?.totalThreats ?? 0}</p>
        </div>
        <div className="adm-card" style={{ padding: 14 }}>
          <strong>Dernière alerte</strong>
          <p style={{ margin: '6px 0 0', fontSize: '0.85rem' }}>
            {status?.lastThreatAt
              ? new Date(status.lastThreatAt).toLocaleString('fr-FR')
              : 'Aucune'}
          </p>
        </div>
      </div>

      <div>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <ShieldAlert size={18} />
          Test de détection (anti-virus / scripts)
        </h3>
        <textarea
          value={sample}
          onChange={(e) => setSample(e.target.value)}
          rows={4}
          placeholder="Collez un texte, URL ou signature EICAR pour tester…"
          style={{ width: '100%', borderRadius: 10, padding: 10, border: '1px solid #e2e8f0' }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          <button type="button" className="adm-btn adm-btn--primary" onClick={runScan} disabled={scanning}>
            {scanning ? 'Analyse…' : 'Analyser'}
          </button>
          <button type="button" className="adm-btn" onClick={load} disabled={loading}>
            <RefreshCw size={15} /> Actualiser le journal
          </button>
        </div>
        {scanResult && (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 10,
              background: scanResult.safe ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            }}
          >
            <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              {scanResult.safe ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
              {scanResult.safe
                ? 'Aucune menace détectée.'
                : `${scanResult.threats?.length || 0} menace(s) détectée(s).`}
            </p>
            {!scanResult.safe && (
              <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: '0.85rem' }}>
                {(scanResult.threats || []).map((t) => (
                  <li key={`${t.id}-${t.matched}`}>
                    <span className={SEVERITY_CLASS[t.severity] || 'adm-pill'}>{t.severity}</span>{' '}
                    {t.label} — {t.matched}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div>
        <h3 style={{ marginBottom: 8 }}>Journal récent</h3>
        {threats.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Aucune alerte enregistrée.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table" style={{ fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Source</th>
                  <th>Gravité</th>
                  <th>Menace</th>
                  <th>Extrait</th>
                </tr>
              </thead>
              <tbody>
                {threats.map((row) => (
                  <tr key={row.id}>
                    <td>{new Date(row.at).toLocaleString('fr-FR')}</td>
                    <td>{row.source || '—'}</td>
                    <td>
                      <span className={SEVERITY_CLASS[row.severity] || 'adm-pill'}>{row.severity}</span>
                    </td>
                    <td>{row.label}</td>
                    <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row.snippet || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityThreatPanel;
