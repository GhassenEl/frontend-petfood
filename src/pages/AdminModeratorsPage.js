import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, UserPlus, UserX, UserCheck } from 'lucide-react';
import {
  fetchAdminModerators,
  createAdminModerator,
  updateAdminModeratorStatus,
} from '../services/adminService';
import { DEMO_ADMIN_USERS } from '../utils/adminDemoData';
import './AdminPages.css';

const emptyForm = { name: '', email: '', phone: '', password: '' };

const AdminModeratorsPage = () => {
  const [moderators, setModerators] = useState([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, demo: isDemo } = await fetchAdminModerators();
    let list = data.moderators || data || [];
    if (isDemo && !list.length) {
      list = DEMO_ADMIN_USERS.filter((u) => u.role === 'moderator');
    }
    setModerators(list);
    setDemo(isDemo);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (e) => {
    e.preventDefault();
    await createAdminModerator(form);
    setForm(emptyForm);
    setShowForm(false);
    setMsg('Modérateur créé (démo).');
    load();
  };

  const toggleStatus = async (m) => {
    const id = m.id || m._id;
    const next = m.isActive === false;
    await updateAdminModeratorStatus(id, next);
    setModerators((list) =>
      list.map((x) => ((x.id || x._id) === id ? { ...x, isActive: next } : x)),
    );
    setMsg(next ? 'Compte réactivé.' : 'Compte suspendu.');
  };

  return (
    <div className="adm-page">
      <header className="adm-hero">
        <h1><Shield size={24} /> Gestion des modérateurs {demo && <span className="adm-demo-pill">Mode démo</span>}</h1>
        <p>Créer, suspendre et superviser les comptes modération communautaire.</p>
      </header>

      {msg && <p className="adm-msg">{msg}</p>}

      <div style={{ marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button type="button" className="adm-btn adm-btn--primary" onClick={() => setShowForm(!showForm)}>
          <UserPlus size={16} /> Ajouter un modérateur
        </button>
        <Link to="/admin/activity-logs?role=moderator" className="adm-btn adm-btn--ghost">
          Voir les logs modération →
        </Link>
        <Link to="/admin/vendors" className="adm-btn adm-btn--ghost">
          Gestion vendeurs →
        </Link>
      </div>

      {showForm && (
        <div className="adm-card">
          <h2>Nouveau modérateur</h2>
          <form onSubmit={create} className="adm-form-grid">
            <label>Nom<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>E-mail<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <label>Téléphone<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
            <label>Mot de passe<input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
          </form>
          <button type="button" className="adm-btn adm-btn--primary adm-btn--sm" style={{ marginTop: 12 }} onClick={create}>Créer</button>
        </div>
      )}

      <div className="adm-card">
        {loading ? <p>Chargement…</p> : (
          <table className="adm-table">
            <thead>
              <tr><th>Modérateur</th><th>Contact</th><th>Inscription</th><th>Statut</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {moderators.map((m) => (
                <tr key={m.id || m._id}>
                  <td><strong>{m.name}</strong></td>
                  <td>{m.email}<br /><small>{m.phone || '—'}</small></td>
                  <td>{m.createdAt ? new Date(m.createdAt).toLocaleDateString('fr-FR') : '—'}</td>
                  <td>
                    <span className={`adm-badge adm-badge--${m.isActive !== false ? 'active' : 'suspended'}`}>
                      {m.isActive !== false ? 'Actif' : 'Suspendu'}
                    </span>
                  </td>
                  <td>
                    {m.isActive !== false ? (
                      <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => toggleStatus(m)}>
                        <UserX size={14} /> Suspendre
                      </button>
                    ) : (
                      <button type="button" className="adm-btn adm-btn--primary adm-btn--sm" onClick={() => toggleStatus(m)}>
                        <UserCheck size={14} /> Réactiver
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminModeratorsPage;
