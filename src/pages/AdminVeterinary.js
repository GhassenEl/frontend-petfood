import React, { useEffect, useState } from 'react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import api from '../utils/api';
import { DEMO_ADMIN_USERS, DEMO_ADMIN_VET_RECORDS, withDemoFallback } from '../utils/adminDemoData';

const emptyForm = {
  petName: '',
  animalType: 'dog',
  ownerId: '',
  diagnosis: '',
  treatment: '',
  vetNotes: '',
  nextVisit: '',
  weight: '',
  temperature: '',
  status: 'active',
};

const animalEmojis = { dog: '🐕', cat: '🐈', bird: '🐦', fish: '🐟', rabbit: '🐰', other: '🐾' };
const animalNames = { dog: 'Chien', cat: 'Chat', bird: 'Oiseau', fish: 'Poisson', rabbit: 'Lapin', other: 'Autre' };

const statusBadge = (status) => {
  const config = {
    active: { bg: '#dcfce7', color: '#166534', label: '🟢 Actif' },
    completed: { bg: '#dbeafe', color: '#1e40af', label: '🔵 Terminé' },
    cancelled: { bg: '#fee2e2', color: '#991b1b', label: '🔴 Annulé' },
  };
  const s = config[status] || config.active;
  return <span style={{ ...styles.badge, background: s.bg, color: s.color }}>{s.label}</span>;
};

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-TN');
};

const AdminVeterinary = () => {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewRecord, setViewRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    fetchRecords();
    fetchUsers();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await api.get('/veterinary');
      const list = withDemoFallback(res.data || [], DEMO_ADMIN_VET_RECORDS);
      setRecords(list);
      setDemoMode(!Array.isArray(res.data) || res.data.length === 0);
    } catch (error) {
      console.error('Erreur chargement fiches', error);
      setRecords(DEMO_ADMIN_VET_RECORDS);
      setDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(withDemoFallback(res.data || [], DEMO_ADMIN_USERS.filter((u) => u.role === 'client')));
    } catch (error) {
      console.error('Users load error', error);
      setUsers(DEMO_ADMIN_USERS.filter((u) => u.role === 'client'));
    }
  };

  const openCreate = () => {
    setEditingRecord(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEdit = (record) => {
    setViewRecord(null);
    setEditingRecord(record);
    setFormData({
      petName: record.petName || '',
      animalType: record.animalType || 'dog',
      ownerId: record.ownerId?._id || record.ownerId || '',
      diagnosis: record.diagnosis || '',
      treatment: record.treatment || '',
      vetNotes: record.vetNotes || '',
      nextVisit: record.nextVisit ? record.nextVisit.split('T')[0] : '',
      weight: record.weight || '',
      temperature: record.temperature || '',
      status: record.status || 'active',
    });
    setShowModal(true);
  };

  const openView = (record) => {
    setViewRecord(record);
    setShowModal(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRecord(null);
    setFormData(emptyForm);
  };

  const saveLocalRecord = (record, isNew) => {
    setRecords((prev) => (isNew ? [...prev, record] : prev.map((r) => (r._id === record._id ? record : r))));
    setDemoMode(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = { ...formData };
    if (payload.weight) payload.weight = Number(payload.weight);
    if (payload.temperature) payload.temperature = Number(payload.temperature);
    const owner = users.find((u) => u._id === payload.ownerId);
    if (owner) payload.ownerName = owner.name;

    try {
      if (editingRecord && !demoMode) {
        await api.put(`/veterinary/${editingRecord._id}`, payload);
      } else if (!demoMode) {
        await api.post('/veterinary', payload);
      } else {
        throw new Error('demo');
      }
      closeModal();
      fetchRecords();
    } catch (error) {
      if (error.message !== 'demo' && error.response?.status !== 404 && !demoMode) {
        window.alert(error.response?.data?.error || 'Erreur enregistrement fiche');
        return;
      }
      const id = editingRecord?._id || `vet-rec-${Date.now()}`;
      const record = {
        _id: id,
        ...payload,
        ownerId: owner ? { _id: owner._id, name: owner.name, email: owner.email } : payload.ownerId,
        ownerName: owner?.name || payload.ownerName,
        visitDate: editingRecord?.visitDate || new Date().toISOString(),
      };
      saveLocalRecord(record, !editingRecord);
      closeModal();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette fiche vétérinaire ?')) return;
    try {
      if (!demoMode) await api.delete(`/veterinary/${id}`);
      else throw new Error('demo');
      fetchRecords();
    } catch (error) {
      if (error.message !== 'demo' && error.response?.status !== 404 && !demoMode) {
        window.alert(error.response?.data?.error || 'Erreur suppression fiche');
        return;
      }
      setRecords((prev) => prev.filter((r) => r._id !== id));
      setDemoMode(true);
      if (viewRecord?._id === id) setViewRecord(null);
    }
  };

  const filteredRecords = records.filter((r) =>
    `${r.petName || ''} ${r.ownerId?.name || r.ownerName || ''} ${r.diagnosis || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 style={styles.title}>🩺 Suivi Vétérinaire</h1>
          <p style={styles.subtitle}>
            {records.length} fiche(s){demoMode ? ' · mode démo (CRUD local)' : ''}
          </p>
        </div>
        <button type="button" style={styles.addBtn} onClick={openCreate}>
          <Plus size={16} /> Créer
        </button>
      </div>

      <div style={styles.searchBar}>
        <span style={{ fontSize: '16px' }}>🔍</span>
        <input
          type="text"
          placeholder="Rechercher par animal, propriétaire, diagnostic..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <span style={styles.searchCount}>{filteredRecords.length} résultat(s)</span>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Animal</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Propriétaire</th>
              <th style={styles.th}>Diagnostic</th>
              <th style={styles.th}>Poids</th>
              <th style={styles.th}>Temp.</th>
              <th style={styles.th}>Visite</th>
              <th style={styles.th}>Prochaine</th>
              <th style={styles.th}>Statut</th>
              <th style={styles.th}>Actions CRUD</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => (
              <tr key={record._id} style={styles.tr}>
                <td style={styles.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>{animalEmojis[record.animalType] || '🐾'}</span>
                    <strong>{record.petName}</strong>
                  </div>
                </td>
                <td style={styles.td}>{animalNames[record.animalType] || record.animalType}</td>
                <td style={styles.td}>{record.ownerId?.name || record.ownerName || 'Inconnu'}</td>
                <td style={styles.td}>
                  <div style={{ maxWidth: '180px', fontSize: '13px', color: '#4b5563' }}>
                    {record.diagnosis?.length > 100 ? `${record.diagnosis.substring(0, 100)}...` : record.diagnosis}
                  </div>
                </td>
                <td style={styles.td}>{record.weight ? `${record.weight} kg` : '—'}</td>
                <td style={styles.td}>{record.temperature ? `${record.temperature}°C` : '—'}</td>
                <td style={styles.td}>{formatDate(record.visitDate)}</td>
                <td style={styles.td}>
                  {record.nextVisit ? (
                    <span style={{ color: '#e67e22', fontWeight: 600 }}>{formatDate(record.nextVisit)}</span>
                  ) : (
                    '—'
                  )}
                </td>
                <td style={styles.td}>{statusBadge(record.status)}</td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button type="button" style={styles.viewBtn} onClick={() => openView(record)} title="Voir">
                      <Eye size={14} /> Voir
                    </button>
                    <button type="button" style={styles.editBtn} onClick={() => openEdit(record)} title="Modifier">
                      <Pencil size={14} /> Modifier
                    </button>
                    <button type="button" style={styles.deleteBtn} onClick={() => handleDelete(record._id)} title="Supprimer">
                      <Trash2 size={14} /> Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRecords.length === 0 && (
          <p style={styles.empty}>Aucune fiche trouvée — utilisez « Créer » pour ajouter un dossier.</p>
        )}
      </div>

      {viewRecord && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modal, width: '520px' }}>
            <h2 style={styles.modalTitle}>👁️ Détail fiche — {viewRecord.petName}</h2>
            <dl style={styles.detailList}>
              <DetailRow label="Animal" value={`${animalEmojis[viewRecord.animalType] || '🐾'} ${viewRecord.petName}`} />
              <DetailRow label="Type" value={animalNames[viewRecord.animalType] || viewRecord.animalType} />
              <DetailRow label="Propriétaire" value={viewRecord.ownerId?.name || viewRecord.ownerName || '—'} />
              <DetailRow label="Diagnostic" value={viewRecord.diagnosis || '—'} />
              <DetailRow label="Traitement" value={viewRecord.treatment || '—'} />
              <DetailRow label="Notes véto" value={viewRecord.vetNotes || '—'} />
              <DetailRow label="Poids" value={viewRecord.weight ? `${viewRecord.weight} kg` : '—'} />
              <DetailRow label="Température" value={viewRecord.temperature ? `${viewRecord.temperature}°C` : '—'} />
              <DetailRow label="Dernière visite" value={formatDate(viewRecord.visitDate)} />
              <DetailRow label="Prochaine visite" value={formatDate(viewRecord.nextVisit)} />
              <DetailRow label="Statut" value={statusBadge(viewRecord.status)} />
            </dl>
            <div style={styles.modalActions}>
              <button type="button" style={styles.cancelBtn} onClick={() => setViewRecord(null)}>Fermer</button>
              <button type="button" style={styles.editBtn} onClick={() => openEdit(viewRecord)}>
                <Pencil size={14} /> Modifier
              </button>
              <button type="button" style={styles.deleteBtn} onClick={() => handleDelete(viewRecord._id)}>
                <Trash2 size={14} /> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modal, width: '560px' }}>
            <h2 style={styles.modalTitle}>{editingRecord ? '✏️ Modifier fiche' : '➕ Nouvelle fiche vétérinaire'}</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.row2}>
                <input required placeholder="Nom de l'animal" value={formData.petName} onChange={(e) => setFormData({ ...formData, petName: e.target.value })} style={styles.input} />
                <select value={formData.animalType} onChange={(e) => setFormData({ ...formData, animalType: e.target.value })} style={styles.input}>
                  <option value="dog">🐕 Chien</option>
                  <option value="cat">🐈 Chat</option>
                  <option value="bird">🐦 Oiseau</option>
                  <option value="fish">🐟 Poisson</option>
                  <option value="rabbit">🐰 Lapin</option>
                  <option value="other">🐾 Autre</option>
                </select>
              </div>
              <select
                required
                value={formData.ownerId}
                onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                style={styles.input}
              >
                <option value="">Choisir un propriétaire</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                ))}
              </select>
              <textarea required placeholder="Diagnostic" rows="2" value={formData.diagnosis} onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })} style={styles.input} />
              <textarea placeholder="Traitement" rows="2" value={formData.treatment} onChange={(e) => setFormData({ ...formData, treatment: e.target.value })} style={styles.input} />
              <textarea placeholder="Notes vétérinaire" rows="2" value={formData.vetNotes} onChange={(e) => setFormData({ ...formData, vetNotes: e.target.value })} style={styles.input} />
              <div style={styles.row2}>
                <input type="number" step="0.1" placeholder="Poids (kg)" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} style={styles.input} />
                <input type="number" step="0.1" placeholder="Température (°C)" value={formData.temperature} onChange={(e) => setFormData({ ...formData, temperature: e.target.value })} style={styles.input} />
              </div>
              <input type="date" placeholder="Prochaine visite" value={formData.nextVisit} onChange={(e) => setFormData({ ...formData, nextVisit: e.target.value })} style={styles.input} />
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={styles.input}>
                <option value="active">🟢 Actif</option>
                <option value="completed">🔵 Terminé</option>
                <option value="cancelled">🔴 Annulé</option>
              </select>
              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelBtn} onClick={closeModal}>Annuler</button>
                <button type="submit" style={styles.saveBtn}>{editingRecord ? '💾 Enregistrer' : '✅ Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div style={{ marginBottom: 10 }}>
    <dt style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>{label}</dt>
    <dd style={{ margin: '4px 0 0', fontSize: 14, color: '#111827' }}>{value}</dd>
  </div>
);

const styles = {
  page: { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  title: { fontSize: '24px', fontWeight: '800', color: '#065f46', margin: 0 },
  subtitle: { fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' },
  addBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' },
  searchBar: { display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '12px 18px', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', marginBottom: '20px', border: '1px solid #e5e7eb' },
  searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: '14px', background: 'transparent' },
  searchCount: { fontSize: '12px', color: '#9ca3af', whiteSpace: 'nowrap' },
  tableWrapper: { background: 'white', borderRadius: '18px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '14px 16px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', borderBottom: '2px solid #f3f4f6', fontWeight: '700', background: '#f9fafb' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '12px 16px', fontSize: '14px', color: '#374151', verticalAlign: 'middle' },
  badge: { display: 'inline-block', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' },
  viewBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 },
  editBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 },
  deleteBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 },
  empty: { textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: '14px' },
  loader: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '12px' },
  spinner: { width: '32px', height: '32px', border: '3px solid #d1fae5', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 1000, backdropFilter: 'blur(4px)' },
  modal: { background: 'white', borderRadius: '20px', padding: '28px', width: '520px', maxWidth: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' },
  modalTitle: { margin: '0 0 20px 0', fontSize: '18px', fontWeight: '800', color: '#111827' },
  detailList: { margin: '0 0 16px', padding: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px', flexWrap: 'wrap' },
  cancelBtn: { padding: '10px 18px', background: '#f3f4f6', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', color: '#4b5563' },
  saveBtn: { padding: '10px 18px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' },
};

export default AdminVeterinary;
