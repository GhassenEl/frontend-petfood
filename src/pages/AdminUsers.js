import React, { useEffect, useMemo, useState } from 'react';
import api from '../utils/api';
import { DEMO_ADMIN_USERS, withDemoFallback, withDemoUserStats } from '../utils/adminDemoData';
import { useAuth } from '../contexts/AuthContext';
import {
  validateEmail,
  validateName,
  validatePassword,
} from '../utils/loginValidation';

const emptyForm = { name: '', email: '', phone: '', address: '', role: 'client', password: '' };

const userIdOf = (user) => user?.id || user?._id;

const ROLE_CONFIG = {
  all: { label: 'Tous les rôles', emoji: '👥' },
  admin: { label: 'Admin', emoji: '🔴', bg: '#fee2e2', color: '#991b1b' },
  client: { label: 'Client', emoji: '🔵', bg: '#dbeafe', color: '#1e40af' },
  livreur: { label: 'Livreur', emoji: '🚚', bg: '#d1fae5', color: '#047857' },
  vet: { label: 'Vétérinaire', emoji: '🩺', bg: '#e0e7ff', color: '#3730a3' },
  vendor: { label: 'Vendeur', emoji: '🏬', bg: '#ccfbf1', color: '#0f766e' },
  moderator: { label: 'Modérateur', emoji: '🛡️', bg: '#fef3c7', color: '#92400e' },
};

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ count: 0, byRole: {}, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const showFlash = (type, text) => {
    setFlash({ type, text });
    setTimeout(() => setFlash(null), 4000);
  };

  const fetchUsers = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        api.get('/users'),
        api.get('/users/count'),
      ]);
      setUsers(withDemoFallback(usersRes.data || [], DEMO_ADMIN_USERS));
      setStats(withDemoUserStats(statsRes.data));
    } catch (error) {
      console.error('Erreur chargement utilisateurs', error);
      setUsers(DEMO_ADMIN_USERS);
      setStats(withDemoUserStats(null));
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingUser(null);
    setFormData(emptyForm);
    setFormErrors({});
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
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData(emptyForm);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    const nameErr = validateName(formData.name);
    const emailErr = validateEmail(formData.email);
    if (nameErr) errors.name = nameErr;
    if (emailErr) errors.email = emailErr;
    if (!editingUser) {
      const passErr = validatePassword(formData.password);
      if (passErr) errors.password = passErr;
    } else if (formData.password) {
      const passErr = validatePassword(formData.password);
      if (passErr) errors.password = passErr;
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = {
        ...formData,
        email: formData.email.trim().toLowerCase(),
        name: formData.name.trim(),
      };
      if (!payload.password) delete payload.password;

      if (editingUser) {
        await api.put(`/users/${userIdOf(editingUser)}`, payload);
        showFlash('success', 'Utilisateur mis à jour.');
      } else {
        await api.post('/users', payload);
        showFlash('success', 'Utilisateur créé.');
      }
      closeModal();
      fetchUsers();
    } catch (error) {
      showFlash('error', error.response?.data?.error || 'Erreur enregistrement utilisateur.');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Supprimer le compte de ${name} ? Cette action est irréversible.`)) return;
    try {
      await api.delete(`/users/${id}`);
      showFlash('success', 'Utilisateur supprimé.');
      fetchUsers();
    } catch (error) {
      showFlash('error', error.response?.data?.error || 'Erreur suppression utilisateur.');
    }
  };

  const handleToggleActive = async (user) => {
    const id = userIdOf(user);
    const nextActive = user.isActive === false;
    const action = nextActive ? 'activer' : 'désactiver';
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} le compte de ${user.name} ?`)) return;
    try {
      await api.patch(`/users/${id}/active`, { isActive: nextActive });
      showFlash('success', `Compte ${nextActive ? 'activé' : 'désactivé'}.`);
      fetchUsers();
    } catch (error) {
      showFlash('error', error.response?.data?.error || 'Erreur changement statut.');
    }
  };

  const statusBadge = (user) => {
    const active = user.isActive !== false;
    return (
      <span style={{ ...styles.badge, background: active ? '#d1fae5' : '#fee2e2', color: active ? '#047857' : '#991b1b' }}>
        {active ? 'Actif' : 'Inactif'}
      </span>
    );
  };

  const roleBadge = (role) => {
    const r = ROLE_CONFIG[role] || ROLE_CONFIG.client;
    return (
      <span style={{ ...styles.badge, background: r.bg, color: r.color }}>
        {r.emoji} {r.label}
      </span>
    );
  };

  const filteredUsers = useMemo(() => {
    let list = users.filter((u) => {
      const matchesSearch = `${u.name} ${u.email} ${u.phone || ''} ${u.address || ''}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const isActive = u.isActive !== false;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && isActive) ||
        (statusFilter === 'inactive' && !isActive);
      return matchesSearch && matchesRole && matchesStatus;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '', 'fr');
      if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    return list;
  }, [users, searchTerm, roleFilter, statusFilter, sortBy]);

  const adminCount = stats.byRole?.admin ?? users.filter((u) => u.role === 'admin').length;
  const canAssignAdmin = adminCount === 0 || (editingUser && editingUser.role === 'admin');

  if (loading) {
    return (
      <div style={styles.loader}>
        <div style={styles.spinner} />
        <p>Chargement des utilisateurs…</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {flash && (
        <div
          style={{
            ...styles.flash,
            background: flash.type === 'success' ? '#d1fae5' : '#fee2e2',
            color: flash.type === 'success' ? '#047857' : '#991b1b',
            borderColor: flash.type === 'success' ? '#6ee7b7' : '#fca5a5',
          }}
          role="alert"
        >
          {flash.type === 'success' ? '✅' : '⚠'} {flash.text}
        </div>
      )}

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Gestion des utilisateurs</h1>
          <p style={styles.subtitle}>
            {stats.count} compte(s) · {stats.active ?? 0} actif(s) · admin unique : admin@petfood.tn
          </p>
        </div>
        <button type="button" style={styles.addBtn} onClick={openCreate}>
          + Nouvel utilisateur
        </button>
      </div>

      <div style={styles.statsGrid}>
        {[
          { label: 'Total', value: stats.count, color: '#065f46' },
          { label: 'Clients', value: stats.byRole?.client ?? 0, color: '#1e40af' },
          { label: 'Livreurs', value: stats.byRole?.livreur ?? 0, color: '#047857' },
          { label: 'Vétérinaires', value: stats.byRole?.vet ?? 0, color: '#3730a3' },
          { label: 'Inactifs', value: stats.inactive ?? 0, color: '#991b1b' },
        ].map((s) => (
          <div key={s.label} style={styles.statCard}>
            <span style={{ ...styles.statValue, color: s.color }}>{s.value}</span>
            <span style={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      <div style={styles.toolbar}>
        <div style={styles.searchBar}>
          <span aria-hidden>🔍</span>
          <input
            type="search"
            placeholder="Rechercher par nom, email, téléphone…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={styles.filterSelect}>
          {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.emoji} {cfg.label}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.filterSelect}>
          <option value="all">Tous statuts</option>
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={styles.filterSelect}>
          <option value="newest">Plus récents</option>
          <option value="oldest">Plus anciens</option>
          <option value="name">Nom A→Z</option>
        </select>
        <span style={styles.searchCount}>{filteredUsers.length} résultat(s)</span>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Utilisateur</th>
              <th style={styles.th}>Contact</th>
              <th style={styles.th}>Rôle</th>
              <th style={styles.th}>Statut</th>
              <th style={styles.th}>Inscription</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => {
              const id = userIdOf(user);
              const isSelf = id === userIdOf(currentUser);
              const isActive = user.isActive !== false;
              return (
                <tr key={id} style={{ ...styles.tr, opacity: isActive ? 1 : 0.7 }}>
                  <td style={styles.td}>
                    <div style={styles.userCell}>
                      <div style={styles.avatar}>{user.name?.charAt(0).toUpperCase() || '?'}</div>
                      <div>
                        <strong>{user.name}</strong>
                        {isSelf && <span style={styles.selfTag}> (vous)</span>}
                        {user.address && <p style={styles.subText}>{user.address}</p>}
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div>{user.email}</div>
                    <div style={styles.subText}>{user.phone || '—'}</div>
                  </td>
                  <td style={styles.td}>{roleBadge(user.role)}</td>
                  <td style={styles.td}>{statusBadge(user)}</td>
                  <td style={styles.td}>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('fr-TN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      {!isSelf && (
                        <button
                          type="button"
                          style={isActive ? styles.deactivateBtn : styles.activateBtn}
                          onClick={() => handleToggleActive(user)}
                          title={isActive ? 'Désactiver' : 'Activer'}
                        >
                          {isActive ? 'Désactiver' : 'Activer'}
                        </button>
                      )}
                      <button type="button" style={styles.editBtn} onClick={() => openEdit(user)} title="Modifier">
                        Modifier
                      </button>
                      {!isSelf && (
                        <button type="button" style={styles.deleteBtn} onClick={() => handleDelete(id, user.name)} title="Supprimer">
                          Suppr.
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <p style={styles.empty}>Aucun utilisateur ne correspond à vos filtres.</p>
        )}
      </div>

      {showModal && (
        <div style={styles.modalOverlay} onClick={closeModal} role="presentation">
          <div style={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h2 style={styles.modalTitle}>
              {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
            </h2>
            <form onSubmit={handleSubmit} style={styles.form} noValidate>
              <div>
                <label style={styles.label}>Nom complet *</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={styles.input(formErrors.name)}
                  placeholder="Prénom Nom"
                />
                {formErrors.name && <p style={styles.fieldError}>{formErrors.name}</p>}
              </div>
              <div>
                <label style={styles.label}>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={styles.input(formErrors.email)}
                  placeholder="nom@domaine.tn"
                />
                {formErrors.email && <p style={styles.fieldError}>{formErrors.email}</p>}
              </div>
              <div style={styles.row2}>
                <div>
                  <label style={styles.label}>Téléphone</label>
                  <input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={styles.input()}
                    placeholder="+216 …"
                  />
                </div>
                <div>
                  <label style={styles.label}>Rôle *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    style={styles.input()}
                  >
                    <option value="client">Client</option>
                    <option value="livreur">Livreur</option>
                    <option value="vet">Vétérinaire</option>
                    <option value="vendor">Vendeur marketplace</option>
                    <option value="moderator">Modérateur</option>
                    {canAssignAdmin && <option value="admin">Admin (unique)</option>}
                  </select>
                </div>
              </div>
              <div>
                <label style={styles.label}>Adresse</label>
                <input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={styles.input()}
                  placeholder="Ville, rue…"
                />
              </div>
              <div>
                <label style={styles.label}>
                  Mot de passe {editingUser ? '(laisser vide = inchangé)' : '*'}
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={styles.input(formErrors.password)}
                  placeholder="Minimum 6 caractères"
                />
                {formErrors.password && <p style={styles.fieldError}>{formErrors.password}</p>}
              </div>
              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelBtn} onClick={closeModal}>Annuler</button>
                <button type="submit" style={styles.saveBtn}>
                  {editingUser ? 'Enregistrer' : 'Créer le compte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { padding: '24px', maxWidth: '1280px', margin: '0 auto' },
  flash: {
    padding: '12px 16px',
    borderRadius: '12px',
    marginBottom: '16px',
    fontSize: '14px',
    fontWeight: 600,
    border: '1px solid',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  title: { fontSize: '26px', fontWeight: 800, color: '#065f46', margin: 0 },
  subtitle: { fontSize: '14px', color: '#6b7280', margin: '6px 0 0' },
  addBtn: { padding: '12px 20px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '20px' },
  statCard: { background: 'white', borderRadius: '14px', padding: '16px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' },
  statValue: { display: 'block', fontSize: '28px', fontWeight: 800, lineHeight: 1.1 },
  statLabel: { fontSize: '12px', color: '#6b7280', fontWeight: 600, marginTop: '4px' },
  toolbar: { display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '16px' },
  searchBar: { flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '10px 14px', borderRadius: '12px', border: '1px solid #e5e7eb' },
  searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: '14px', background: 'transparent' },
  filterSelect: { padding: '10px 12px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px', background: 'white', cursor: 'pointer' },
  searchCount: { fontSize: '12px', color: '#9ca3af', marginLeft: 'auto' },
  tableWrapper: { background: 'white', borderRadius: '18px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '720px' },
  th: { textAlign: 'left', padding: '14px 16px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', borderBottom: '2px solid #f3f4f6', fontWeight: 700, background: '#f9fafb' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '14px 16px', fontSize: '14px', color: '#374151', verticalAlign: 'middle' },
  userCell: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', flexShrink: 0 },
  selfTag: { fontSize: '12px', color: '#059669', fontWeight: 600 },
  subText: { margin: '2px 0 0', fontSize: '12px', color: '#9ca3af' },
  badge: { display: 'inline-block', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 },
  actions: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  activateBtn: { padding: '6px 10px', background: '#d1fae5', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#047857' },
  deactivateBtn: { padding: '6px 10px', background: '#fef3c7', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#92400e' },
  editBtn: { padding: '6px 10px', background: '#eff6ff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#1d4ed8' },
  deleteBtn: { padding: '6px 10px', background: '#fef2f2', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#b91c1c' },
  empty: { textAlign: 'center', padding: '48px', color: '#9ca3af', fontSize: '14px' },
  loader: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '12px' },
  spinner: { width: '32px', height: '32px', border: '3px solid #d1fae5', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 1000, backdropFilter: 'blur(4px)' },
  modal: { background: 'white', borderRadius: '20px', padding: '28px', width: '520px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' },
  modalTitle: { margin: '0 0 20px', fontSize: '18px', fontWeight: 800, color: '#111827' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  label: { display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' },
  input: (hasError) => ({
    width: '100%',
    padding: '12px 14px',
    borderRadius: '12px',
    border: `1px solid ${hasError ? '#f87171' : '#e5e7eb'}`,
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  }),
  fieldError: { color: '#dc2626', fontSize: '12px', margin: '4px 0 0' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' },
  cancelBtn: { padding: '10px 18px', background: '#f3f4f6', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '14px', color: '#4b5563' },
  saveBtn: { padding: '10px 18px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '14px' },
};

export default AdminUsers;
