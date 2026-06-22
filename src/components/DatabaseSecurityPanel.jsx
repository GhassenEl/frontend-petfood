import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, Database, Key, Lock, RefreshCw, Shield, ShieldCheck, ShieldAlert,
} from 'lucide-react';

const STATUS_LABELS = {
  healthy: 'Sécurisée',
  degraded: 'À surveiller',
  critical: 'Critique',
};

const STATUS_COLORS = {
  healthy: '#059669',
  degraded: '#d97706',
  critical: '#dc2626',
};

const SEVERITY_CLASS = {
  critical: 'adm-pill adm-pill--danger',
  high: 'adm-pill adm-pill--danger',
  medium: 'adm-pill adm-pill--warn',
  low: 'adm-pill',
};

const fmt = (iso) => (iso ? new Date(iso).toLocaleString('fr-FR') : '—');

const DatabaseSecurityPanel = ({ pack, loading, onRefresh }) => {
  if (loading && !pack) {
    return <p className="ais-loading">Analyse sécurité base de données…</p>;
  }

  if (!pack) {
    return <p className="ais-empty">Données sécurité base indisponibles.</p>;
  }

  const statusColor = STATUS_COLORS[pack.status] || '#64748b';
  const conn = pack.connection || {};

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        <div className="ais-panel-wrap" style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: statusColor }}>{pack.score ?? '—'}</div>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Score sécurité DB</p>
        </div>
        <div className="ais-panel-wrap" style={{ padding: 16, textAlign: 'center' }}>
          <Database size={22} color={conn.ok ? '#059669' : '#dc2626'} aria-hidden />
          <p style={{ margin: '8px 0 4px', fontWeight: 800, color: conn.ok ? '#059669' : '#dc2626' }}>
            {conn.ok ? 'Connectée' : 'Hors ligne'}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>{conn.latencyMs ?? 0} ms</p>
        </div>
        <div className="ais-panel-wrap" style={{ padding: 16, textAlign: 'center' }}>
          <Lock size={22} color={conn.ssl ? '#2563eb' : '#dc2626'} aria-hidden />
          <p style={{ margin: '8px 0 4px', fontWeight: 800 }}>TLS {conn.ssl ? 'actif' : 'inactif'}</p>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>{conn.sslMode || 'sslmode'}</p>
        </div>
        <div className="ais-panel-wrap" style={{ padding: 16, textAlign: 'center' }}>
          <Shield size={22} color="#7c3aed" aria-hidden />
          <p style={{ margin: '8px 0 4px', fontWeight: 800 }}>{pack.sqlInjection?.blocked24h ?? 0}</p>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Injections bloquées / 24h</p>
        </div>
      </div>

      <div className="ais-panel-wrap">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
          <div>
            <h2 style={{ margin: '0 0 6px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Database size={18} aria-hidden />
              {pack.engine?.name} {pack.engine?.version}
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
              {pack.provider} — statut{' '}
              <strong style={{ color: statusColor }}>{STATUS_LABELS[pack.status] || pack.status}</strong>
              {pack.mode === 'demo' && ' · mode démo'}
            </p>
          </div>
          {onRefresh && (
            <button type="button" className="adm-btn adm-btn--ghost" onClick={onRefresh} disabled={loading}>
              <RefreshCw size={15} /> Actualiser
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, fontSize: 13, color: '#475569' }}>
          <div>Pool : {conn.poolMin ?? 2}–{conn.poolMax ?? 10} connexions</div>
          <div>Actives : {conn.activeConnections ?? '—'} / {conn.maxConnections ?? '—'}</div>
          <div>Migrations : {pack.migrations?.pending ? `${pack.migrations.pending} en attente` : 'À jour'}</div>
          <div>Dernière migration : {fmt(pack.migrations?.lastApplied)}</div>
        </div>
      </div>

      <div className="ais-panel-wrap">
        <h2 style={{ margin: '0 0 14px', fontSize: '1.05rem' }}>Protections actives</h2>
        <ul className="ps-checks" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
          {(pack.protections || []).map((check) => (
            <li key={check.id} className={check.ok ? 'ps-check-ok' : 'ps-check-warn'} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 12, borderRadius: 12, background: check.ok ? '#f0fdf4' : '#fffbeb', border: `1px solid ${check.ok ? '#bbf7d0' : '#fde68a'}` }}>
              {check.ok ? <ShieldCheck size={18} color="#15803d" aria-hidden /> : <ShieldAlert size={18} color="#d97706" aria-hidden />}
              <div>
                <strong style={{ display: 'block', fontSize: 14 }}>{check.label}</strong>
                <span style={{ fontSize: 13, color: '#64748b' }}>{check.detail}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className="ais-panel-wrap">
          <h2 style={{ margin: '0 0 14px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Key size={18} aria-hidden />
            Rôles &amp; accès
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table" style={{ fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  <th>Rôle</th>
                  <th>Type</th>
                  <th>Privilèges</th>
                  <th>Périmètre</th>
                </tr>
              </thead>
              <tbody>
                {(pack.accessRoles || []).map((role) => (
                  <tr key={role.name}>
                    <td><code>{role.name}</code></td>
                    <td>{role.type}</td>
                    <td>{role.privileges}</td>
                    <td>{role.scope}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="ais-panel-wrap">
          <h2 style={{ margin: '0 0 14px', fontSize: '1.05rem' }}>Sauvegardes &amp; audit</h2>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 14, color: '#475569', display: 'grid', gap: 8 }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span>Sauvegardes chiffrées</span>
              <strong style={{ color: pack.backups?.encrypted ? '#059669' : '#dc2626' }}>
                {pack.backups?.encrypted ? 'Oui' : 'Non'}
              </strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span>Dernière sauvegarde</span>
              <strong>{fmt(pack.backups?.lastAt)}</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span>Rétention</span>
              <strong>{pack.backups?.retentionDays ?? 30} jours</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span>Prochaine planifiée</span>
              <strong>{fmt(pack.backups?.nextScheduled)}</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 8, paddingTop: 8, borderTop: '1px solid #e2e8f0' }}>
              <span>Événements audit / 24h</span>
              <strong>{pack.audit?.events24h ?? 0}</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span>Actions sensibles / 24h</span>
              <strong>{pack.audit?.sensitiveActions24h ?? 0}</strong>
            </li>
          </ul>
          <p style={{ margin: '12px 0 0', fontSize: 12 }}>
            <Link to="/admin/backups" style={{ color: '#2563eb', fontWeight: 700 }}>Gérer les sauvegardes →</Link>
            {' · '}
            <Link to="/admin/activity-logs" style={{ color: '#2563eb', fontWeight: 700 }}>Journaux d&apos;activité →</Link>
          </p>
        </div>
      </div>

      <div className="ais-panel-wrap">
        <h2 style={{ margin: '0 0 14px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={18} aria-hidden />
          Tentatives d&apos;injection SQL bloquées
        </h2>
        {(pack.recentSqlEvents || []).length === 0 ? (
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Aucune tentative récente. L&apos;IDS et Prisma protègent les requêtes entrantes.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table" style={{ fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Gravité</th>
                  <th>IP</th>
                  <th>Détail</th>
                  <th>Bloqué</th>
                </tr>
              </thead>
              <tbody>
                {pack.recentSqlEvents.map((row) => (
                  <tr key={row.id}>
                    <td>{fmt(row.at)}</td>
                    <td><span className={SEVERITY_CLASS[row.severity] || 'adm-pill'}>{row.severity}</span></td>
                    <td>{row.ip}</td>
                    <td style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.detail}</td>
                    <td>{row.blocked ? <Shield size={14} color="#059669" aria-label="Bloqué" /> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p style={{ margin: '12px 0 0', fontSize: 12, color: '#64748b' }}>
          Variables serveur : <code>DATABASE_URL</code> (TLS), <code>PRISMA_MIGRATE</code>, <code>IDS_ENABLED</code>, <code>BLOCK_INTRUSIONS</code>
        </p>
      </div>
    </div>
  );
};

export default DatabaseSecurityPanel;
