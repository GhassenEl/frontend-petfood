import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const emptyForm = { name: '', email: '', phone: '', address: '', role: 'client', password: '' };

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data || []);
    } catch (error) {
      console.error('Erreur chargement utilisateurs', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingUser(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      role: user.role || 'client',
      password: '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password;
      if (editingUser) {
        await api.put(`/users/${editingUser._id}`, payload);
      } else {
        await api.post('/users', payload);
      }
      closeModal();
      fetchUsers();
    } catch (error) {
      window.alert(error.response?.data?.error || 'Erreur enregistrement utilisateur');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (error) {
      window.alert(error.response?.data?.error || 'Erreur suppression utilisateur');
    }
  };

  const roleBadge = (role) => {
    const config = {
      admin: { bg: '#fee2e2', color: '#991b1b', label: '🔴 Admin' },
      client: { bg: '#dbeafe', color: '#1e40af', label: '🔵 Client' },
    };
    const r = config[role] || config.client;
    return <span style={{ ...styles.badge, background: r.bg, color: r.color }}>{r.label}</span>;
  };

  const filteredUsers = users.filter((u) =>
    `${u.name} ${u.email} ${u.phone}`.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 style={styles.title}>👥 Gestion des utilisateurs</h1>
          <p style={styles.subtitle}>{users.length} utilisateur(s)</p>
        </div>
        <button style={styles.addBtn} onClick={openCreate}>➕ Ajouter un utilisateur</button>
      </div>

      {/* Search */}
      <div style={styles.searchBar}>
        <span style={{ fontSize: '16px' }}>🔍</span>
        <input
          type="text"
          placeholder="Rechercher un utilisateur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <span style={styles.searchCount}>{filteredUsers.length} résultat(s)</span>
      </div>

      {/* Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nom</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Téléphone</th>
              <th style={styles.th}>Adresse</th>
              <th style={styles.th}>Rôle</th>
              <th style={styles.th}>Inscription</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id} style={styles.tr}>
                <td style={styles.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={styles.avatar}>{user.name?.charAt(0).toUpperCase()}</div>
                    <strong>{user.name}</strong>
                  </div>
                </td>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>{user.phone || '-'}</td>
                <td style={styles.td}>{user.address || '-'}</td>
                <td style={styles.td}>{roleBadge(user.role)}</td>
                <td style={styles.td}>{new Date(user.createdAt).toLocaleDateString('fr-TN')}</td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={styles.editBtn} onClick={() => openEdit(user)} title="Modifier">✏️</button>
                    <button style={styles.deleteBtn} onClick={() => handleDelete(user._id)} title="Supprimer">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <p style={styles.empty}>Aucun utilisateur trouvé</p>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>{editingUser ? '✏️ Modifier utilisateur' : '➕ Nouvel utilisateur'}</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <input required placeholder="Nom complet" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={styles.input} />
              <input required type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={styles.input} />
              <div style={styles.row2}>
                <input placeholder="Téléphone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={styles.input} />
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} style={styles.input}>
                  <option value="client">🔵 Client</option>
                  <option value="admin">🔴 Admin</option>
                </select>
              </div>
              <input placeholder="Adresse" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} style={styles.input} />
              <input type="password" placeholder={editingUser ? 'Nouveau mot de passe (laisser vide = inchangé)' : 'Mot de passe'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} style={styles.input} />
              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelBtn} onClick={closeModal}>Annuler</button>
                <button type="submit" style={styles.saveBtn}>{editingUser ? '💾 Enregistrer' : '✅ Créer'}</button>
              </div>
            </form>
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
  avatar: { width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' },
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

export default AdminUsers;

