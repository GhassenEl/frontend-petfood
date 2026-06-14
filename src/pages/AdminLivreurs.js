import React, { useEffect, useMemo, useState } from 'react';
import api from '../utils/api';
import { AdminMessageButton } from '../components/AdminMessageButton';
import {
  DEMO_ADMIN_ORDERS,
  DEMO_ADMIN_REGIONS,
  DEMO_ADMIN_USERS,
  withDemoFallback,
} from '../utils/adminDemoData';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  region: 'Tunis',
};

const parseAvailability = (preferences) => {
  try {
    const prefs = preferences ? JSON.parse(preferences) : {};
    return prefs.availability;
  } catch {
    return null;
  }
};

const AdminLivreurs = () => {
  const [livreurs, setLivreurs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regionFilter, setRegionFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingLivreur, setEditingLivreur] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, ordersRes, regionsRes] = await Promise.all([
        api.get('/users'),
        api.get('/orders'),
        api.get('/users/regions'),
      ]);
      const allUsers = withDemoFallback(usersRes.data || [], DEMO_ADMIN_USERS);
      setLivreurs(allUsers.filter((u) => u.role === 'livreur'));
      setOrders(withDemoFallback(ordersRes.data || [], DEMO_ADMIN_ORDERS));
      setRegions((regionsRes.data || []).length ? regionsRes.data : DEMO_ADMIN_REGIONS);
    } catch (error) {
      console.error('Erreur chargement livreurs', error);
    } finally {
      setLoading(false);
    }
  };

  const regionStats = useMemo(() => {
    const stats = {};
    regions.forEach((region) => {
      stats[region] = {
        livreurs: livreurs.filter((l) => l.region === region).length,
        pendingOrders: orders.filter(
          (o) => o.region === region && ['pending', 'shipped'].includes(o.status)
        ).length,
      };
    });
    return stats;
  }, [regions, livreurs, orders]);

  const filteredLivreurs = livreurs.filter((livreur) => {
    const matchesRegion = regionFilter === 'all' || livreur.region === regionFilter;
    const matchesSearch = `${livreur.name} ${livreur.email} ${livreur.phone || ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  const openCreate = () => {
    setEditingLivreur(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEdit = (livreur) => {
    setEditingLivreur(livreur);
    setFormData({
      name: livreur.name || '',
      email: livreur.email || '',
      phone: livreur.phone || '',
      password: '',
      region: livreur.region || 'Tunis',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingLivreur(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...formData, role: 'livreur' };
      if (!payload.password) delete payload.password;
      if (editingLivreur) {
        await api.put(`/users/${editingLivreur._id}`, payload);
      } else {
        if (!payload.password) {
          window.alert('Mot de passe requis pour un nouveau livreur');
          return;
        }
        await api.post('/users', payload);
      }
      closeModal();
      fetchData();
    } catch (error) {
      window.alert(error.response?.data?.error || 'Erreur enregistrement livreur');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce livreur ?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchData();
    } catch (error) {
      window.alert(error.response?.data?.error || 'Erreur suppression livreur');
    }
  };

  if (loading) {
    return (
      <div style={styles.loader}>
        <div style={styles.spinner} />
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🚚 Livreurs par région</h1>
          <p style={styles.subtitle}>
            {livreurs.length} livreur(s) · {orders.filter((o) => ['pending', 'shipped'].includes(o.status)).length} livraison(s) en cours
          </p>
        </div>
        <button type="button" style={styles.addBtn} onClick={openCreate}>
          ➕ Ajouter un livreur
        </button>
      </div>

      <div style={styles.regionGrid}>
        {regions.map((region) => (
          <button
            key={region}
            type="button"
            onClick={() => setRegionFilter(regionFilter === region ? 'all' : region)}
            style={{
              ...styles.regionCard,
              borderColor: regionFilter === region ? '#10b981' : '#e5e7eb',
              background: regionFilter === region ? 'rgba(16,185,129,0.08)' : 'white',
            }}
          >
            <div style={styles.regionName}>{region}</div>
            <div style={styles.regionMeta}>
              <span>👤 {regionStats[region]?.livreurs || 0}</span>
              <span>📦 {regionStats[region]?.pendingOrders || 0}</span>
            </div>
          </button>
        ))}
      </div>

      <div style={styles.searchBar}>
        <span>🔍</span>
        <input
          type="text"
          placeholder="Rechercher un livreur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        {regionFilter !== 'all' && (
          <button type="button" style={styles.clearFilter} onClick={() => setRegionFilter('all')}>
            Toutes les régions
          </button>
        )}
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nom</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Téléphone</th>
              <th style={styles.th}>Région</th>
              <th style={styles.th}>Disponibilité</th>
              <th style={styles.th}>Commandes zone</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLivreurs.map((livreur) => {
              const availability = parseAvailability(livreur.preferences);
              const zoneOrders = orders.filter(
                (o) => o.region === livreur.region && ['pending', 'shipped'].includes(o.status)
              ).length;
              return (
                <tr key={livreur._id} style={styles.tr}>
                  <td style={styles.td}>
                    <strong>{livreur.name}</strong>
                  </td>
                  <td style={styles.td}>{livreur.email}</td>
                  <td style={styles.td}>{livreur.phone || '-'}</td>
                  <td style={styles.td}>
                    <span style={styles.regionBadge}>{livreur.region || 'Non assignée'}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.regionBadge,
                      background: availability?.isAvailable !== false ? '#d1fae5' : '#fee2e2',
                      color: availability?.isAvailable !== false ? '#047857' : '#b91c1c',
                    }}>
                      {availability?.isAvailable === false ? 'En pause' : 'Disponible'}
                    </span>
                  </td>
                  <td style={styles.td}>{zoneOrders}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <AdminMessageButton userId={livreur._id || livreur.id} label="Message" compact />
                      <button type="button" style={styles.editBtn} onClick={() => openEdit(livreur)}>✏️</button>
                      <button type="button" style={styles.deleteBtn} onClick={() => handleDelete(livreur._id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredLivreurs.length === 0 && (
          <p style={styles.empty}>Aucun livreur trouvé pour cette région.</p>
        )}
      </div>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>
              {editingLivreur ? '✏️ Modifier le livreur' : '➕ Nouveau livreur'}
            </h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <input
                required
                placeholder="Nom complet"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={styles.input}
              />
              <input
                required
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={styles.input}
              />
              <div style={styles.row2}>
                <input
                  placeholder="Téléphone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={styles.input}
                />
                <select
                  required
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  style={styles.input}
                >
                  {regions.map((region) => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
              <input
                type="password"
                placeholder={editingLivreur ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={styles.input}
              />
              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelBtn} onClick={closeModal}>Annuler</button>
                <button type="submit" style={styles.saveBtn}>
                  {editingLivreur ? '💾 Enregistrer' : '✅ Créer'}
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
  page: { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  title: { fontSize: '24px', fontWeight: '800', color: '#065f46', margin: 0 },
  subtitle: { fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' },
  addBtn: { padding: '12px 20px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' },
  regionGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' },
  regionCard: { border: '2px solid #e5e7eb', borderRadius: '14px', padding: '14px', cursor: 'pointer', textAlign: 'left' },
  regionName: { fontWeight: '800', color: '#111827', marginBottom: '8px' },
  regionMeta: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6b7280' },
  searchBar: { display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '12px 18px', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', marginBottom: '20px', border: '1px solid #e5e7eb' },
  searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: '14px', background: 'transparent' },
  clearFilter: { border: 'none', background: '#ecfdf5', color: '#047857', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' },
  tableWrapper: { background: 'white', borderRadius: '18px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '14px 16px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', borderBottom: '2px solid #f3f4f6', fontWeight: '700', background: '#f9fafb' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '12px 16px', fontSize: '14px', color: '#374151', verticalAlign: 'middle' },
  regionBadge: { display: 'inline-block', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', background: '#ecfdf5', color: '#047857' },
  editBtn: { padding: '6px 10px', background: '#eff6ff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' },
  deleteBtn: { padding: '6px 10px', background: '#fef2f2', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' },
  empty: { textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: '14px' },
  loader: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '12px' },
  spinner: { width: '32px', height: '32px', border: '3px solid #d1fae5', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 1000 },
  modal: { background: 'white', borderRadius: '20px', padding: '28px', width: '520px', maxWidth: '100%' },
  modalTitle: { margin: '0 0 20px 0', fontSize: '18px', fontWeight: '800', color: '#111827' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' },
  cancelBtn: { padding: '10px 18px', background: '#f3f4f6', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', color: '#4b5563' },
  saveBtn: { padding: '10px 18px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' },
};

export default AdminLivreurs;
