import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Users, UserX, UserCheck, AlertTriangle, Eye } from 'lucide-react';
import {
  fetchModeratorUsers,
  suspendModeratorUser,
  reactivateModeratorUser,
  flagAbusiveUser,
} from '../services/moderatorService';
import './ModeratorPages.css';

const ROLE_LABELS = {
  admin: 'Admin', client: 'Client', livreur: 'Livreur',
  vet: 'Vétérinaire', vendor: 'Vendeur', moderator: 'Modérateur',
};

const ModeratorUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, demo: isDemo } = await fetchModeratorUsers();
    setUsers((data.users || []).filter((u) => u.role === 'client'));
    setDemo(isDemo);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.role?.includes(q),
    );
  }, [users, search]);

  const act = async (fn, id) => {
    await fn(id);
    setMsg('Action enregistrée.');
    setSelected(null);
    load();
  };

  return (
    <div className="mod-page">
      <header className="mod-hero">
        <h1><Users size={24} /> Comptes clients {demo && <span className="mod-demo-pill">Mode démo</span>}</h1>
        <p>Suspendre ou réactiver les comptes clients — la gestion vendeurs/modérateurs est réservée à l&apos;administrateur.</p>
      </header>

      {msg && <p className="mod-badge mod-badge--approved" style={{ marginBottom: 12 }}>{msg}</p>}

      <input
        className="mod-search"
        placeholder="Rechercher par nom, e-mail ou rôle…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="mod-card">
        {loading ? <p className="mod-empty">Chargement…</p> : (
          <table className="mod-table">
            <thead>
              <tr><th>Utilisateur</th><th>Rôle</th><th>Statut</th><th>Signalements</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id || u._id}>
                  <td>
                    <strong>{u.name}</strong><br />
                    <small style={{ color: '#94a3b8' }}>{u.email}</small>
                  </td>
                  <td>{ROLE_LABELS[u.role] || u.role}</td>
                  <td>
                    <span className={`mod-badge mod-badge--${u.isActive !== false ? 'active' : 'suspended'}`}>
                      {u.isActive !== false ? 'Actif' : 'Suspendu'}
                    </span>
                  </td>
                  <td>{u.abusiveReports || 0}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button type="button" className="mod-btn mod-btn--ghost mod-btn--sm" onClick={() => setSelected(u)}>
                      <Eye size={14} /> Profil
                    </button>
                    {' '}
                    {u.isActive !== false ? (
                      <button type="button" className="mod-btn mod-btn--danger mod-btn--sm" onClick={() => act(suspendModeratorUser, u.id || u._id)}>
                        <UserX size={14} /> Suspendre
                      </button>
                    ) : (
                      <button type="button" className="mod-btn mod-btn--success mod-btn--sm" onClick={() => act(reactivateModeratorUser, u.id || u._id)}>
                        <UserCheck size={14} /> Réactiver
                      </button>
                    )}
                    {' '}
                    <button type="button" className="mod-btn mod-btn--ghost mod-btn--sm" onClick={() => act((id) => flagAbusiveUser(id, 'Comportement abusif signalé'), u.id || u._id)}>
                      <AlertTriangle size={14} /> Signaler
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="mod-card mod-profile">
          <h2>Profil — {selected.name}</h2>
          <p><strong>E-mail :</strong> {selected.email}</p>
          <p><strong>Téléphone :</strong> {selected.phone || '—'}</p>
          <p><strong>Rôle :</strong> {ROLE_LABELS[selected.role]}</p>
          <p><strong>Adresse :</strong> {selected.address || selected.region || '—'}</p>
          <p><strong>Inscription :</strong> {selected.createdAt ? new Date(selected.createdAt).toLocaleDateString('fr-FR') : '—'}</p>
          <p><strong>Signalements abusifs :</strong> {selected.abusiveReports || 0}</p>
          <button type="button" className="mod-btn mod-btn--ghost mod-btn--sm" onClick={() => setSelected(null)}>Fermer</button>
        </div>
      )}
    </div>
  );
};

export default ModeratorUsersPage;
