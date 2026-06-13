import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Plus, Trash2, Edit3, Search, Send, MessageSquare, Clock } from 'lucide-react';
import api from '../utils/api';
import {
  getAllComplaints,
  createAdminComplaint,
  updateComplaint,
  deleteComplaint,
} from '../services/complaintService';
import { Link } from 'react-router-dom';
import './ClientComplaintsPage.css';

const STATUS_LABELS = {
  pending: 'En attente',
  in_progress: 'En cours',
  ai_proposed: 'À valider',
  resolved: 'Résolue',
  rejected: 'Refusée',
};

const emptyForm = { userId: '', subject: '', message: '', orderId: '' };

const complaintId = (c) => c?.id || c?._id;
const userOf = (c) => c?.user || c?.userId;

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [resolveModal, setResolveModal] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [list, usersRes] = await Promise.all([
        getAllComplaints(),
        api.get('/users').catch(() => ({ data: [] })),
      ]);
      setComplaints(list);
      setUsers(usersRes.data || []);
    } catch {
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => ({
    total: complaints.length,
    pending: complaints.filter((c) => (c.status || 'pending') === 'pending').length,
    toValidate: complaints.filter((c) => c.status === 'ai_proposed').length,
    inProgress: complaints.filter((c) => c.status === 'in_progress').length,
    resolved: complaints.filter((c) => c.status === 'resolved').length,
  }), [complaints]);

  const filtered = useMemo(() => {
    let list = complaints;
    if (filter !== 'all') {
      list = list.filter((c) => (c.status || 'pending') === filter);
    }
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) => {
      const u = userOf(c);
      return `${u?.name || ''} ${u?.email || ''} ${c.subject || ''} ${c.message || ''}`.toLowerCase().includes(q);
    });
  }, [complaints, filter, search]);

  const openCreate = () => {
    setEditingComplaint(null);
    setFormData({
      ...emptyForm,
      userId: users.find((u) => u.role === 'client')?.id || users[0]?.id || users[0]?._id || '',
    });
    setShowForm(true);
  };

  const openEdit = (c) => {
    const u = userOf(c);
    setEditingComplaint(c);
    setFormData({
      userId: u?.id || u?._id || c.userId || '',
      subject: c.subject || '',
      message: c.message || '',
      orderId: c.orderId || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingComplaint) {
        await updateComplaint(complaintId(editingComplaint), formData);
        showToast('Réclamation mise à jour.');
      } else {
        await createAdminComplaint(formData);
        showToast('Réclamation créée.');
      }
      setShowForm(false);
      setEditingComplaint(null);
      await load();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Erreur enregistrement', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatus = async (c, status, response) => {
    try {
      await updateComplaint(complaintId(c), { status, response: response ?? c.response });
      await load();
      showToast(status === 'resolved' ? 'Réclamation résolue.' : status === 'in_progress' ? 'Marquée en cours.' : 'Statut mis à jour.');
    } catch {
      showToast('Erreur lors de la mise à jour.', 'error');
    }
  };

  const handleResolve = async () => {
    if (!resolveModal || !responseText.trim()) return;
    setSubmitting(true);
    try {
      await updateComplaint(complaintId(resolveModal), {
        response: responseText.trim(),
        status: 'resolved',
      });
      setResolveModal(null);
      setResponseText('');
      await load();
      showToast('Réponse envoyée — réclamation résolue.');
    } catch {
      showToast('Erreur lors de la résolution.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette réclamation ?')) return;
    try {
      await deleteComplaint(id);
      await load();
      showToast('Réclamation supprimée.');
    } catch {
      showToast('Suppression impossible.', 'error');
    }
  };

  return (
    <div className="cc-page cc-page--admin">
      {toast && <div className={`cc-toast ${toast.type}`}>{toast.text}</div>}

      <header className="cc-hero cc-hero--admin-complaints">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1>⚠️ Modération des réclamations</h1>
            <p>
              Traitez les demandes clients, répondez sous 48 h et suivez l’historique des litiges
              commandes et livraisons.
            </p>
          </div>
          <button
            type="button"
            className="cc-submit"
            style={{ width: 'auto', padding: '12px 20px' }}
            onClick={() => (showForm ? setShowForm(false) : openCreate())}
          >
            <Plus size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            {showForm ? 'Fermer' : 'Ajouter'}
          </button>
        </div>
      </header>

      <div className="cc-stats">
        <div className="cc-stat">
          <strong style={{ color: '#881337' }}>{stats.total}</strong>
          <span>Total</span>
        </div>
        <div className="cc-stat">
          <strong style={{ color: '#d97706' }}>{stats.pending}</strong>
          <span>En attente</span>
        </div>
        <div className="cc-stat">
          <strong style={{ color: '#dc2626' }}>{stats.toValidate}</strong>
          <span>À valider</span>
        </div>
        <div className="cc-stat">
          <strong style={{ color: '#2563eb' }}>{stats.inProgress}</strong>
          <span>En cours</span>
        </div>
        <div className="cc-stat">
          <strong style={{ color: '#16a34a' }}>{stats.resolved}</strong>
          <span>Résolues</span>
        </div>
      </div>

      {showForm && (
        <section className="cc-form-card">
          <h2>{editingComplaint ? '✏️ Modifier la réclamation' : '➕ Nouvelle réclamation (admin)'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="cc-field">
              <label>Client</label>
              <select
                required
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              >
                <option value="">Choisir un client</option>
                {users.map((u) => (
                  <option key={u.id || u._id} value={u.id || u._id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="cc-field">
              <label>Sujet</label>
              <input
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                maxLength={120}
              />
            </div>
            <div className="cc-field">
              <label>Message</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>
            <div className="cc-field">
              <label>ID commande (optionnel)</label>
              <input
                value={formData.orderId}
                onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="cc-btn-ghost" style={{ flex: 1 }} onClick={() => setShowForm(false)}>
                Annuler
              </button>
              <button type="submit" className="cc-submit" style={{ flex: 2 }} disabled={submitting}>
                <Send size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                {submitting ? 'Enregistrement…' : editingComplaint ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </form>
        </section>
      )}

      <div className="cc-search">
        <Search size={18} color="#94a3b8" />
        <input
          type="text"
          placeholder="Rechercher par client, sujet, message…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="cc-search-count">{filtered.length} résultat(s)</span>
      </div>

      <div className="cc-toolbar">
        <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>File d’attente</h2>
        <div className="cc-filters">
          {[
            { id: 'all', label: 'Toutes' },
            { id: 'pending', label: 'En attente' },
            { id: 'in_progress', label: 'En cours' },
            { id: 'ai_proposed', label: 'À valider' },
            { id: 'resolved', label: 'Résolues' },
            { id: 'rejected', label: 'Refusées' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              className={`cc-filter-btn ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8' }}>Chargement…</p>
      ) : filtered.length === 0 ? (
        <div className="cc-empty">
          <AlertCircle size={48} style={{ opacity: 0.35, marginBottom: 12 }} />
          <p>Aucune réclamation{search ? ' pour cette recherche' : ''}.</p>
        </div>
      ) : (
        <div className="cc-list">
          {filtered.map((c) => {
            const status = c.status || 'pending';
            const u = userOf(c);
            return (
              <article key={complaintId(c)} className={`cc-card ${status}`}>
                <div className="cc-card-head">
                  <h3>{c.subject}</h3>
                </div>
                <div className="cc-meta">
                  <span className={`cc-badge ${status}`}>{STATUS_LABELS[status] || status}</span>
                  <span className="cc-client-chip">{u?.name || c.name || 'Client'} · {u?.email || c.email || '—'}</span>
                  {c.orderId && (
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Commande #{String(c.orderId).slice(-6)}
                    </span>
                  )}
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    {new Date(c.createdAt).toLocaleString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="cc-message">{c.message}</p>
                {c.response && (
                  <div className="cc-response">
                    <strong>Réponse</strong>
                    <p>{c.response}</p>
                  </div>
                )}
                <div className="cc-actions">
                  {status !== 'resolved' && status !== 'rejected' && (
                    <>
                      <button
                        type="button"
                        className="cc-btn-ghost"
                        onClick={() => { setResolveModal(c); setResponseText(c.response || ''); }}
                      >
                        <MessageSquare size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                        Répondre
                      </button>
                      {status === 'pending' && (
                        <button type="button" className="cc-btn-ghost" onClick={() => handleStatus(c, 'in_progress')}>
                          <Clock size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                          En cours
                        </button>
                      )}
                    </>
                  )}
                  <button type="button" className="cc-btn-ghost" onClick={() => openEdit(c)}>
                    <Edit3 size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    Modifier
                  </button>
                  <button type="button" className="cc-btn-danger" onClick={() => handleDelete(complaintId(c))}>
                    <Trash2 size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    Supprimer
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {resolveModal && (
        <div className="cc-modal-overlay" onClick={() => setResolveModal(null)}>
          <div className="cc-modal" onClick={(e) => e.stopPropagation()}>
            <h2>📝 Répondre au client</h2>
            <div style={{ marginBottom: 16, fontSize: '0.9rem', color: '#4b5563' }}>
              <p style={{ margin: '0 0 8px' }}><strong>Client :</strong> {userOf(resolveModal)?.name || resolveModal.name}</p>
              <p style={{ margin: '0 0 8px' }}><strong>Sujet :</strong> {resolveModal.subject}</p>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}><strong>Message :</strong> {resolveModal.message}</p>
            </div>
            <div className="cc-field">
              <label>Réponse (visible par le client)</label>
              <textarea
                rows={4}
                placeholder="Expliquez la résolution ou les prochaines étapes…"
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
              />
            </div>
            <div className="cc-modal-actions">
              <button type="button" className="cc-btn-ghost" onClick={() => setResolveModal(null)}>Annuler</button>
              <button
                type="button"
                className="cc-btn-primary cc-btn-resolve"
                onClick={handleResolve}
                disabled={!responseText.trim() || submitting}
              >
                ✅ Résoudre et notifier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
