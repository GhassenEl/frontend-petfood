import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const emptyForm = {
  userId: '',
  productId: '',
  rating: 5,
  comment: '',
};

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingReview, setEditingReview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchReviews();
    fetchUsers();
    fetchProducts();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await api.get('/reviews');
      setReviews(res.data || []);
    } catch (error) {
      console.error('Erreur chargement avis', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data || []);
    } catch (error) {
      console.error('Users load error', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data || []);
    } catch (error) {
      console.error('Products load error', error);
    }
  };

  const openCreate = () => {
    setEditingReview(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEdit = (review) => {
    setEditingReview(review);
    setFormData({
      userId: review.userId?._id || review.userId || '',
      productId: review.productId?._id || review.productId || '',
      rating: review.rating || 5,
      comment: review.comment || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingReview(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        userId: formData.userId,
        productId: formData.productId,
        rating: Number(formData.rating),
        comment: formData.comment,
      };
      if (editingReview) {
        await api.put(`/reviews/${editingReview._id}`, payload);
      } else {
        await api.post('/reviews', payload);
      }
      closeModal();
      fetchReviews();
    } catch (error) {
      window.alert(error.response?.data?.error || 'Erreur enregistrement avis');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet avis ?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      fetchReviews();
    } catch (error) {
      window.alert(error.response?.data?.error || 'Erreur suppression avis');
    }
  };

  const starDisplay = (rating) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ fontSize: '16px', color: s <= rating ? '#fbbf24' : '#d1d5db' }}>★</span>
      ))}
      <span style={{ fontSize: '12px', fontWeight: 600, marginLeft: '4px', color: '#6b7280' }}>({rating}/5)</span>
    </div>
  );

  const filteredReviews = reviews.filter((r) =>
    `${r.userId?.email || ''} ${r.productId?.name || ''} ${r.comment || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 style={styles.title}>⭐ Gestion des avis</h1>
          <p style={styles.subtitle}>{reviews.length} avis</p>
        </div>
        <button style={styles.addBtn} onClick={openCreate}>➕ Ajouter un avis</button>
      </div>

      {/* Search */}
      <div style={styles.searchBar}>
        <span style={{ fontSize: '16px' }}>🔍</span>
        <input
          type="text"
          placeholder="Rechercher un avis..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <span style={styles.searchCount}>{filteredReviews.length} résultat(s)</span>
      </div>

      {/* Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Client</th>
              <th style={styles.th}>Produit</th>
              <th style={styles.th}>Note</th>
              <th style={styles.th}>Commentaire</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.map((review) => (
              <tr key={review._id} style={styles.tr}>
                <td style={styles.td}>{review.userId?.email || 'N/A'}</td>
                <td style={styles.td}>{review.productId?.name || 'N/A'}</td>
                <td style={styles.td}>{starDisplay(review.rating)}</td>
                <td style={styles.td}>
                  <div style={{ maxWidth: '300px', fontSize: '13px', color: '#4b5563' }}>
{review.comment?.length > 120 ? review.comment.substring(0, 120) + '...' : review.comment}
                  </div>
                </td>
                <td style={styles.td}>{new Date(review.createdAt).toLocaleDateString('fr-TN')}</td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={styles.editBtn} onClick={() => openEdit(review)} title="Modifier">✏️</button>
                    <button style={styles.deleteBtn} onClick={() => handleDelete(review._id)} title="Supprimer">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredReviews.length === 0 && (
          <p style={styles.empty}>Aucun avis trouvé</p>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>{editingReview ? '✏️ Modifier l\'avis' : '➕ Nouvel avis'}</h2>
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
              <select
                required
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                style={styles.input}
              >
                <option value="">Choisir un produit</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
              <div style={styles.row2}>
                <select value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} style={styles.input}>
                  <option value={5}>★★★★★ (5)</option>
                  <option value={4}>★★★★☆ (4)</option>
                  <option value={3}>★★★☆☆ (3)</option>
                  <option value={2}>★★☆☆☆ (2)</option>
                  <option value={1}>★☆☆☆☆ (1)</option>
                </select>
              </div>
              <textarea placeholder="Commentaire" rows="4" value={formData.comment} onChange={(e) => setFormData({ ...formData, comment: e.target.value })} style={styles.input} />
              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelBtn} onClick={closeModal}>Annuler</button>
                <button type="submit" style={styles.saveBtn}>{editingReview ? '💾 Enregistrer' : '✅ Créer'}</button>
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

export default AdminReviews;

