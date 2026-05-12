import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const emptyForm = {
  userId: '',
  subject: '',
  message: '',
  orderId: '',
};

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [resolveModal, setResolveModal] = useState(null);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    fetchComplaints();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data || []);
    } catch (error) {
      console.error('Users load error', error);
    }
  };

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints/all');
      setComplaints(res.data || []);
    } catch (error) {
      console.error('Erreur chargement réclamations', error);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingComplaint(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEdit = (complaint) => {
    setEditingComplaint(complaint);
    setFormData({
      userId: complaint.userId?._id || complaint.userId || '',
      subject: complaint.subject || '',
      message: complaint.message || '',
      orderId: complaint.orderId || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingComplaint(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editingComplaint) {
        await api.put(`/complaints/${editingComplaint._id}`, formData);
      } else {
        await api.post('/complaints/admin', formData);
      }
      closeModal();
      fetchComplaints();
    } catch (error) {
      window.alert(error.response?.data?.error || 'Erreur enregistrement réclamation');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette réclamation ?')) return;
    try {
      await api.delete(`/complaints/${id}`);
      fetchComplaints();
    } catch (error) {
      window.alert(error.response?.data?.error || 'Erreur suppression réclamation');
    }
  };

  const handleResolve = async () => {
    if (!resolveModal || !responseText.trim()) return;
    try {
      await api.put(`/complaints/${resolveModal._id}`, { response: responseText, status: 'resolved' });
      setResolveModal(null);
      setResponseText('');
      fetchComplaints();
    } catch (error) {
      window.alert('Erreur lors de la résolution');
    }
  };

  const statusBadge = (status) => {
    const config = {
      resolved: { bg: '#dcfce7', color: '#166534', label: '✅ Résolue' },
      pending: { bg: '#fef3c7', color: '#92400e', label: '⏳ En attente' },
    };
    const s = config[status] || config.pending;
    return <span style={{ ...styles.badge, background: s.bg, color: s.color }}>{s.label}</span>;
  };

  const filteredComplaints = complaints.filter((c) =>
    `${c.userId?.name || ''} ${c.userId?.email || ''} ${c.subject || ''} ${c.message || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={styles.loader}>
        <div style={styles.spinner}></div>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>⚠️ Gestion des réclamations</h1>
          <p style={styles.subtitle}>{complaints.length} réclamation(s)</p>
        </div>
        <button style={styles.addBtn} onClick={openCreate}>➕ Ajouter une réclamation</button>
      </div>

      {/* Search */}
      <div style={styles.searchBar}>
        <span style={{ fontSize: '16px' }}>🔍</span>
        <input
          type="text"
          placeholder="Rechercher une réclamation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <span style={styles.searchCount}>{filteredComplaints.length} résultat(s)</span>
      </div>

      {/* Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Client</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Sujet</th>
              <th style={styles.th}>Message</th>
              <th style={styles.th}>Statut</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.map((c) => (
              <tr key={c._id} style={styles.tr}>
                <td style={styles.td}><strong>{c.userId?.name || 'Inconnu'}</strong></td>
                <td style={styles.td}>{c.userId?.email || 'N/A'}</td>
                <td style={styles.td}>{c.subject}</td>
                <td style={styles.td}>
                  <div style={{ maxWidth: '250px', fontSize: '13px', color: '#4b5563' }}>
{c.message?.length > 120 ? c.message.substring(0, 120) + '...' : c.message}
                  </div>
                </td>
                <td style={styles.td}>{statusBadge(c.status)}</td>
                <td style={styles.td}>{new Date(c.createdAt).toLocaleDateString('fr-TN')}</td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {c.status !== 'resolved' && (
                      <button style={{ ...styles.editBtn, fontSize: '13px', padding: '6px 10px' }} onClick={() => { setResolveModal(c); setResponseText(''); }} title="Traiter">📝 Traiter</button>
                    )}
                    <button style={styles.editBtn} onClick={() => openEdit(c)} title="Modifier">✏️</button>
                    <button style={styles.deleteBtn} onClick={() => handleDelete(c._id)} title="Supprimer">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredComplaints.length === 0 && (
          <p style={styles.empty}>Aucune réclamation trouvée</p>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>{editingComplaint ? '✏️ Modifier la réclamation' : '➕ Nouvelle réclamation'}</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <select
                required
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                style={styles.input}
              >
                <option value="">Choisir un client</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                ))}
              </select>
              <input required placeholder="Sujet" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} style={styles.input} />
              <textarea required placeholder="Message" rows="4" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} style={styles.input} />
              <input placeholder="ID Commande (optionnel)" value={formData.orderId} onChange={(e) => setFormData({ ...formData, orderId: e.target.value })} style={styles.input} />
              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelBtn} onClick={closeModal}>Annuler</button>
                <button type="submit" style={styles.saveBtn}>{editingComplaint ? '💾 Enregistrer' : '✅ Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {resolveModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>📝 Traiter la réclamation</h2>
            <div style={{ marginBottom: '16px' }}>
              <p><strong>Client:</strong> {resolveModal.userId?.name}</p>
              <p><strong>Sujet:</strong> {resolveModal.subject}</p>
              <p><strong>Message:</strong> {resolveModal.message}</p>
            </div>
            <textarea
              rows="4"
              placeholder="Saisir votre réponse..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              style={styles.input}
            />
            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setResolveModal(null)}>Annuler</button>
              <button style={{ ...styles.saveBtn, background: 'linear-gradient(135deg, #16a34a, #15803d)' }} onClick={handleResolve} disabled={!responseText.trim()}>✅ Résoudre</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  title: { fontSize: '24px', fontWeight: '800', color: '#065f46', margin: 0 },
  subtitle: { fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' },
  addBtn: { padding: '12px 20px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16,185,129,0.3)', transition: 'transform 0.2s' },
  searchBar: { display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '12px 18px', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', marginBottom: '20px', border: '1px solid #e5e7eb' },
  searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: '14px', background: 'transparent' },
  searchCount: { fontSize: '12px', color: '#9ca3af', whiteSpace: 'nowrap' },
  tableWrapper: { background: 'white', borderRadius: '18px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '14px 16px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', borderBottom: '2px solid #f3f4f6', fontWeight: '700', background: '#f9fafb' },
  tr: { borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s' },
  td: { padding: '12px 16px', fontSize: '14px', color: '#374151', verticalAlign: 'middle' },
  badge: { display: 'inline-block', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' },
  editBtn: { padding: '6px 10px', background: '#eff6ff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', transition: 'background 0.2s' },
  deleteBtn: { padding: '6px 10px', background: '#fef2f2', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', transition: 'background 0.2s' },
  empty: { textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: '14px' },
  loader: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '12px' },
  spinner: { width: '32px', height: '32px', border: '3px solid #d1fae5', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 1000, backdropFilter: 'blur(4px)' },
  modal: { background: 'white', borderRadius: '20px', padding: '28px', width: '520px', maxWidth: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' },
  modalTitle: { margin: '0 0 20px 0', fontSize: '18px', fontWeight: '800', color: '#111827' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.2s' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' },
  cancelBtn: { padding: '10px 18px', background: '#f3f4f6', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', color: '#4b5563' },
  saveBtn: { padding: '10px 18px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' },
};

export default AdminComplaints;

