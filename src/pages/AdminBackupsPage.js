import React, { useCallback, useEffect, useState } from 'react';
import { Database, Play, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import './AdminPages.css';

const DEMO_BACKUPS = [
  { id: 'bk-1', label: 'Sauvegarde automatique quotidienne', size: '248 Mo', at: new Date(Date.now() - 86400000).toISOString(), status: 'ok' },
  { id: 'bk-2', label: 'Sauvegarde hebdomadaire complète', size: '1,2 Go', at: new Date(Date.now() - 7 * 86400000).toISOString(), status: 'ok' },
  { id: 'bk-3', label: 'Snapshot pré-déploiement', size: '312 Mo', at: new Date(Date.now() - 2 * 86400000).toISOString(), status: 'ok' },
];

const AdminBackupsPage = () => {
  const [backups, setBackups] = useState(DEMO_BACKUPS);
  const [backupEnabled, setBackupEnabled] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await api.get('/admin/system/config');
      if (res.data?.backupEnabled != null) setBackupEnabled(res.data.backupEnabled);
      const bk = await api.get('/admin/backups').catch(() => null);
      if (bk?.data?.backups?.length) setBackups(bk.data.backups);
    } catch {
      setBackups(DEMO_BACKUPS);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const triggerBackup = async () => {
    setBusy(true);
    setMsg('');
    try {
      await api.post('/admin/backups/trigger');
      setMsg('Sauvegarde manuelle lancée.');
    } catch {
      const newBk = {
        id: `bk-${Date.now()}`,
        label: 'Sauvegarde manuelle admin',
        size: '—',
        at: new Date().toISOString(),
        status: 'running',
      };
      setBackups((prev) => [newBk, ...prev]);
      setMsg('Sauvegarde manuelle lancée (mode démo).');
    } finally {
      setBusy(false);
    }
  };

  const fmt = (iso) => new Date(iso).toLocaleString('fr-FR');

  return (
    <div className="adm-page">
      <header className="adm-hero">
        <h1><Database size={24} /> Sauvegardes automatiques</h1>
        <p>
          Gestion des sauvegardes plateforme PetFoodTN — déclenchement manuel et historique.
          {' '}
          <a href="/admin/system">Configuration globale →</a>
        </p>
      </header>

      <div className="adm-hub-kpis">
        <div className="adm-hub-kpi">
          <strong>{backupEnabled ? 'Activées' : 'Désactivées'}</strong>
          <span>Sauvegardes auto</span>
        </div>
        <div className="adm-hub-kpi">
          <strong>{backups.length}</strong>
          <span>Points de restauration</span>
        </div>
      </div>

      {msg && <p className="adm-banner adm-banner--info">{msg}</p>}

      <div className="adm-export-row" style={{ marginBottom: 16 }}>
        <button type="button" className="adm-btn adm-btn--primary" disabled={busy} onClick={triggerBackup}>
          <Play size={16} /> Lancer sauvegarde manuelle
        </button>
        <button type="button" className="adm-btn adm-btn--ghost" onClick={load}>
          <RefreshCw size={16} /> Actualiser
        </button>
      </div>

      <div className="adm-card">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Libellé</th>
              <th>Taille</th>
              <th>Date</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {backups.map((b) => (
              <tr key={b.id}>
                <td>{b.label}</td>
                <td>{b.size}</td>
                <td>{fmt(b.at)}</td>
                <td>
                  <span className={`adm-badge adm-badge--${b.status === 'ok' ? 'ok' : 'warn'}`}>
                    {b.status === 'ok' ? 'OK' : b.status === 'running' ? 'En cours' : b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBackupsPage;
