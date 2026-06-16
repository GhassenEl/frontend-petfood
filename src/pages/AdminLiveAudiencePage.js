import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Radio, Users, MapPin, RefreshCw } from 'lucide-react';
import useAdminLivePresence from '../hooks/useAdminLivePresence';
import './AdminPages.css';

const ROLE_META = {
  visitor: { label: 'Visiteurs', emoji: '👀', color: '#64748b' },
  client: { label: 'Clients', emoji: '🛒', color: '#2563eb' },
  livreur: { label: 'Livreurs', emoji: '🚚', color: '#059669' },
  vet: { label: 'Vétérinaires', emoji: '🩺', color: '#7c3aed' },
  moderator: { label: 'Modérateurs', emoji: '🛡️', color: '#d97706' },
  vendor: { label: 'Vendeurs', emoji: '🏬', color: '#0d9488' },
  admin: { label: 'Admins', emoji: '🔴', color: '#dc2626' },
};

const TABS = [
  { id: 'live', label: 'En ligne' },
  { id: 'regions', label: 'Par région' },
  { id: 'visitors', label: 'Entrées site' },
  { id: 'registered', label: 'Comptes inscrits' },
];

const formatTime = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const AdminLiveAudiencePage = () => {
  const { pack, loading, live, reload } = useAdminLivePresence();
  const [tab, setTab] = useState('live');
  const [roleFilter, setRoleFilter] = useState('all');

  const liveData = pack?.live;
  const registered = pack?.registered;

  const roleOptions = useMemo(() => {
    const totals = liveData?.totals || {};
    return Object.entries(ROLE_META).filter(([id]) => (totals[id] || 0) > 0 || id !== 'admin');
  }, [liveData]);

  const filteredSessions = useMemo(() => {
    const list = liveData?.sessions || [];
    if (roleFilter === 'all') return list;
    return list.filter((s) => s.role === roleFilter);
  }, [liveData, roleFilter]);

  if (loading && !pack) {
    return <div className="adm-page"><p>Chargement audience temps réel…</p></div>;
  }

  return (
    <div className="adm-page">
      <header className="adm-hero">
        <h1>
          <Radio size={24} />
          Audience en temps réel
          <span className={`adm-demo-pill${live ? '' : ''}`} style={{ background: live ? '#ecfdf5' : '#f1f5f9', color: live ? '#047857' : '#64748b' }}>
            {live ? '● Live' : 'Polling'}
          </span>
        </h1>
        <p>
          Visiteurs sur le site, clients connectés et acteurs par région — mise à jour automatique toutes les 5 s.
        </p>
        <div className="adm-export-row" style={{ marginTop: 12 }}>
          <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={reload}>
            <RefreshCw size={14} /> Actualiser
          </button>
          <Link to="/admin/regional-contacts" className="adm-btn adm-btn--ghost adm-btn--sm">Contacts par région →</Link>
          <Link to="/admin/users" className="adm-btn adm-btn--ghost adm-btn--sm">Tous les comptes →</Link>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 20 }}>
        <Kpi label="En ligne" value={liveData?.onlineTotal ?? 0} />
        <Kpi label="Visiteurs" value={liveData?.totals?.visitor ?? 0} />
        <Kpi label="Clients" value={liveData?.totals?.client ?? 0} />
        <Kpi label="Livreurs" value={liveData?.totals?.livreur ?? 0} />
        <Kpi label="Vétos" value={liveData?.totals?.vet ?? 0} />
        <Kpi label="Vendeurs" value={liveData?.totals?.vendor ?? 0} />
        <Kpi label="Modérateurs" value={liveData?.totals?.moderator ?? 0} />
      </div>

      <div className="adm-tabs">
        {TABS.map((t) => (
          <button key={t.id} type="button" className={`adm-tab${tab === t.id ? ' adm-tab--active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'live' && (
        <>
          <div className="adm-export-row" style={{ marginBottom: 12 }}>
            <button type="button" className={`adm-btn adm-btn--sm${roleFilter === 'all' ? ' adm-btn--primary' : ' adm-btn--ghost'}`} onClick={() => setRoleFilter('all')}>Tous</button>
            {roleOptions.map(([id, meta]) => (
              <button key={id} type="button" className={`adm-btn adm-btn--sm${roleFilter === id ? ' adm-btn--primary' : ' adm-btn--ghost'}`} onClick={() => setRoleFilter(id)}>
                {meta.emoji} {meta.label} ({liveData?.totals?.[id] || 0})
              </button>
            ))}
          </div>
          <div className="adm-card">
            <h2><Users size={18} /> Sessions actives ({filteredSessions.length})</h2>
            {filteredSessions.length === 0 ? (
              <p style={{ color: '#64748b' }}>Aucune session active pour ce filtre.</p>
            ) : (
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Acteur</th>
                    <th>Rôle</th>
                    <th>Région</th>
                    <th>Page</th>
                    <th>Depuis</th>
                    <th>Dernière activité</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.map((s) => {
                    const meta = ROLE_META[s.role] || ROLE_META.visitor;
                    return (
                      <tr key={s.sessionId}>
                        <td><strong>{s.name}</strong>{s.userId ? <div style={{ fontSize: 11, color: '#94a3b8' }}>{s.userId.slice(0, 8)}…</div> : null}</td>
                        <td>{meta.emoji} {meta.label}</td>
                        <td><span className="adm-region-badge">{s.region}</span></td>
                        <td style={{ fontSize: 12, color: '#475569' }}>{s.path}</td>
                        <td>{formatTime(s.connectedAt)}</td>
                        <td>{formatTime(s.lastSeenAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {tab === 'regions' && (
        <div className="adm-card">
          <h2><MapPin size={18} /> Répartition en ligne par région</h2>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Région</th>
                <th>Total</th>
                <th>👀</th>
                <th>🛒</th>
                <th>🚚</th>
                <th>🩺</th>
                <th>🏬</th>
                <th>🛡️</th>
              </tr>
            </thead>
            <tbody>
              {(liveData?.byRegion || []).map((row) => (
                <tr key={row.region}>
                  <td><strong>{row.region}</strong></td>
                  <td>{row.total}</td>
                  <td>{row.visitor || 0}</td>
                  <td>{row.client || 0}</td>
                  <td>{row.livreur || 0}</td>
                  <td>{row.vet || 0}</td>
                  <td>{row.vendor || 0}</td>
                  <td>{row.moderator || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'visitors' && (
        <div className="adm-card">
          <h2>Entrées récentes sur le site</h2>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 0 }}>Connexions et déconnexions des 40 derniers événements.</p>
          <table className="adm-table">
            <thead>
              <tr><th>Heure</th><th>Événement</th><th>Acteur</th><th>Rôle</th><th>Région</th><th>Page</th></tr>
            </thead>
            <tbody>
              {(liveData?.recentEvents || []).map((e) => (
                <tr key={e.id}>
                  <td>{formatTime(e.at)}</td>
                  <td>{e.type === 'connect' ? '🟢 Entrée' : '⚪ Sortie'}</td>
                  <td>{e.name}</td>
                  <td>{ROLE_META[e.role]?.label || e.role}</td>
                  <td>{e.region}</td>
                  <td style={{ fontSize: 12 }}>{e.path}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'registered' && (
        <div className="adm-card">
          <h2>Comptes inscrits par région (base de données)</h2>
          <p style={{ fontSize: 13, color: '#64748b' }}>Total inscrits actifs : {registered?.totals?.all ?? '—'}</p>
          {(registered?.byRegion || []).filter((r) => r.total > 0).map((row) => (
            <div key={row.region} style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: '0 0 8px' }}>{row.region} — {row.total} compte(s)</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 12, marginBottom: 10 }}>
                <span>🛒 {row.client}</span>
                <span>🚚 {row.livreur}</span>
                <span>🩺 {row.vet}</span>
                <span>🏬 {row.vendor}</span>
                <span>🛡️ {row.moderator}</span>
              </div>
              <table className="adm-table">
                <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th></tr></thead>
                <tbody>
                  {(row.users || []).slice(0, 12).map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{ROLE_META[u.role]?.emoji} {ROLE_META[u.role]?.label || u.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 16 }}>
        Dernière sync : {liveData?.updatedAt ? new Date(liveData.updatedAt).toLocaleString('fr-FR') : '—'}
      </p>
    </div>
  );
};

const Kpi = ({ label, value }) => (
  <div style={{ textAlign: 'center', padding: 14, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{label}</div>
    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{value}</div>
  </div>
);

export default AdminLiveAudiencePage;
