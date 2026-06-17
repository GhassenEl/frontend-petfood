import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Check, X } from 'lucide-react';
import api from '../utils/api';
import { approveVet, rejectVet } from '../services/adminUserService';
import { DEMO_ADMIN_USERS, withDemoFallback } from '../utils/adminDemoData';
import './AdminPages.css';

const AdminVetValidationPage = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      const users = withDemoFallback(res.data || [], DEMO_ADMIN_USERS);
      setPending(users.filter((u) => u.role === 'vet' && (u.vetValidated === false || u.status === 'pending')));
    } catch {
      setPending(
        DEMO_ADMIN_USERS.filter((u) => u.role === 'vet').slice(0, 2).map((u) => ({
          ...u,
          vetValidated: false,
          status: 'pending',
        })),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (user) => {
    setBusy(user._id || user.id);
    setMsg('');
    try {
      await approveVet(user._id || user.id);
      setPending((prev) => prev.filter((u) => (u._id || u.id) !== (user._id || user.id)));
      setMsg(`Vétérinaire ${user.name} validé.`);
    } finally {
      setBusy(null);
    }
  };

  const handleReject = async (user) => {
    setBusy(user._id || user.id);
    try {
      await rejectVet(user._id || user.id);
      setPending((prev) => prev.filter((u) => (u._id || u.id) !== (user._id || user.id)));
      setMsg(`Demande ${user.name} refusée.`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="adm-page">
      <header className="adm-hero">
        <h1><Stethoscope size={24} /> Validation vétérinaires</h1>
        <p>
          Examen des credentials avant activation sur la plateforme.
          {' '}
          <Link to="/admin/vets">Annuaire vétérinaires →</Link>
          {' · '}
          <Link to="/admin/users">Utilisateurs →</Link>
        </p>
      </header>

      {msg && <p className="adm-banner adm-banner--info">{msg}</p>}

      {loading ? (
        <p className="adm-muted">Chargement…</p>
      ) : pending.length === 0 ? (
        <div className="adm-card adm-card--empty">
          <p>Aucune demande vétérinaire en attente.</p>
        </div>
      ) : (
        <div className="adm-card">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Région</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((u) => (
                <tr key={u._id || u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.region || '—'}</td>
                  <td>
                    <div className="adm-export-row">
                      <button
                        type="button"
                        className="adm-btn adm-btn--primary adm-btn--sm"
                        disabled={busy === (u._id || u.id)}
                        onClick={() => handleApprove(u)}
                      >
                        <Check size={14} /> Valider
                      </button>
                      <button
                        type="button"
                        className="adm-btn adm-btn--ghost adm-btn--sm"
                        disabled={busy === (u._id || u.id)}
                        onClick={() => handleReject(u)}
                      >
                        <X size={14} /> Refuser
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminVetValidationPage;
