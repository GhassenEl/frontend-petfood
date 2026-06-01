import React, { useEffect, useMemo, useState } from 'react';
import { Star, Plus, Trash2, Edit3, Search, Send, Sparkles } from 'lucide-react';
import api from '../utils/api';
import {
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
} from '../services/reviewService';
import { productId, dedupeProducts, withProductIds } from '../utils/productId';
import AdminServiceRatingsPanel from '../components/AdminServiceRatingsPanel';
import './ClientComplaintsPage.css';

const EMOTIONS = [
  { id: 'happy', label: 'Très heureux', emoji: '😊' },
  { id: 'satisfied', label: 'Satisfait', emoji: '🙂' },
  { id: 'neutral', label: 'Neutre', emoji: '😐' },
  { id: 'disappointed', label: 'Déçu', emoji: '😞' },
  { id: 'frustrated', label: 'Frustré', emoji: '😠' },
];

const EMOTION_STYLE = {
  happy: { bg: '#dcfce7', color: '#166534' },
  satisfied: { bg: '#dbeafe', color: '#1e40af' },
  neutral: { bg: '#f3f4f6', color: '#4b5563' },
  disappointed: { bg: '#fef3c7', color: '#92400e' },
  frustrated: { bg: '#fee2e2', color: '#991b1b' },
};

const reviewId = (r) => r?.id || r?._id;
const userOf = (r) => r?.user || r?.userId;
const productOf = (r) => r?.product || r?.productId;

const StarRow = ({ value, onChange }) => (
  <div className="cc-star-picker">
    {[1, 2, 3, 4, 5].map((n) => (
      <button key={n} type="button" className="cc-star-btn" onClick={() => onChange(n)} aria-label={`${n} étoiles`}>
        <Star size={26} fill={n <= value ? '#f59e0b' : 'none'} color={n <= value ? '#f59e0b' : '#d1d5db'} />
      </button>
    ))}
    <span style={{ marginLeft: 8, fontWeight: 800, color: '#92400e' }}>{value}/5</span>
  </div>
);

const emptyForm = { userId: '', productId: '', rating: 5, comment: '', emotion: 'neutral' };

const AdminReviews = () => {
  const [pageTab, setPageTab] = useState('products');
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [reviewList, usersRes, productsRes] = await Promise.all([
        getAllReviews(),
        api.get('/users').catch(() => ({ data: [] })),
        api.get('/products').catch(() => ({ data: [] })),
      ]);
      setReviews(reviewList);
      setUsers(usersRes.data || []);
      setProducts(dedupeProducts((productsRes.data || []).map(withProductIds)));
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    if (!reviews.length) return { total: 0, average: '—', five: 0, low: 0 };
    const sum = reviews.reduce((a, r) => a + (r.rating || 0), 0);
    return {
      total: reviews.length,
      average: (sum / reviews.length).toFixed(1),
      five: reviews.filter((r) => r.rating === 5).length,
      low: reviews.filter((r) => r.rating <= 2).length,
    };
  }, [reviews]);

  const filtered = useMemo(() => {
    let list = reviews;
    if (filter !== 'all' && filter.startsWith('star-')) {
      const n = Number(filter.replace('star-', ''));
      list = list.filter((r) => r.rating === n);
    } else if (filter === 'low') {
      list = list.filter((r) => r.rating <= 2);
    } else if (filter === 'ai') {
      list = list.filter((r) => r.aiSuggested);
    }
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((r) => {
      const u = userOf(r);
      const p = productOf(r);
      return `${u?.name || ''} ${u?.email || ''} ${p?.name || ''} ${r.comment || ''}`.toLowerCase().includes(q);
    });
  }, [reviews, filter, search]);

  const openCreate = () => {
    setEditingReview(null);
    setFormData({
      ...emptyForm,
      userId: users[0]?.id || users[0]?._id || '',
      productId: productId(products[0]) || '',
    });
    setShowForm(true);
  };

  const openEdit = (review) => {
    const u = userOf(review);
    const p = productOf(review);
    setEditingReview(review);
    setFormData({
      userId: u?.id || u?._id || '',
      productId: productId(p) || '',
      rating: review.rating || 5,
      comment: review.comment || '',
      emotion: review.emotion || 'neutral',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        userId: formData.userId,
        productId: formData.productId,
        rating: Number(formData.rating),
        comment: formData.comment,
        emotion: formData.emotion,
      };
      if (editingReview) {
        await updateReview(reviewId(editingReview), payload);
        showToast('Avis modifié.');
      } else {
        await createReview(payload);
        showToast('Avis créé.');
      }
      setShowForm(false);
      setEditingReview(null);
      await load();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Erreur enregistrement', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet avis ?')) return;
    try {
      await deleteReview(id);
      await load();
      showToast('Avis supprimé.');
    } catch {
      showToast('Suppression impossible.', 'error');
    }
  };

  const emotionMeta = (id) => EMOTIONS.find((e) => e.id === id) || EMOTIONS[2];

  return (
    <div className="cc-page cc-page--admin">
      {toast && <div className={`cc-toast ${toast.type}`}>{toast.text}</div>}

      <header className="cc-hero cc-hero--reviews cc-hero--admin">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1>⭐ Modération des avis</h1>
            <p>
              Consultez les avis produits et les notes livraison / vétérinaire. Répondez aux retours
              négatifs et supprimez les contenus inappropriés.
            </p>
          </div>
          {pageTab === 'products' && (
            <button
              type="button"
              className="cc-submit reviews"
              style={{ width: 'auto', padding: '12px 20px' }}
              onClick={() => (showForm ? setShowForm(false) : openCreate())}
            >
              <Plus size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              {showForm ? 'Fermer' : 'Ajouter un avis'}
            </button>
          )}
        </div>
      </header>

      <div className="cc-tabs-main">
        {[
          { id: 'products', label: '🛍️ Avis produits' },
          { id: 'services', label: '🚚 Livraison & Vétérinaire' },
        ].map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`cc-tab-main ${pageTab === id ? 'active' : ''}`}
            onClick={() => setPageTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {pageTab === 'services' ? (
        <AdminServiceRatingsPanel showToast={showToast} />
      ) : (
        <>
          <div className="cc-stats">
            <div className="cc-stat">
              <strong style={{ color: '#1e3a8a' }}>{stats.total}</strong>
              <span>Total avis</span>
            </div>
            <div className="cc-stat">
              <strong style={{ color: '#f59e0b' }}>{stats.average}</strong>
              <span>Note moyenne</span>
            </div>
            <div className="cc-stat">
              <strong style={{ color: '#16a34a' }}>{stats.five}</strong>
              <span>5 étoiles</span>
            </div>
            <div className="cc-stat">
              <strong style={{ color: '#dc2626' }}>{stats.low}</strong>
              <span>≤ 2 étoiles</span>
            </div>
          </div>

          {showForm && (
            <section className="cc-form-card">
              <h2>{editingReview ? '✏️ Modifier l’avis' : '➕ Nouvel avis (admin)'}</h2>
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
                  <label>Produit</label>
                  <select
                    required
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  >
                    <option value="">Choisir un produit</option>
                    {products.map((p) => (
                      <option key={productId(p)} value={productId(p)}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="cc-field">
                  <label>Note</label>
                  <StarRow value={formData.rating} onChange={(rating) => setFormData({ ...formData, rating })} />
                </div>
                <div className="cc-field">
                  <label>Émotion</label>
                  <select value={formData.emotion} onChange={(e) => setFormData({ ...formData, emotion: e.target.value })}>
                    {EMOTIONS.map((e) => (
                      <option key={e.id} value={e.id}>{e.emoji} {e.label}</option>
                    ))}
                  </select>
                </div>
                <div className="cc-field">
                  <label>Commentaire</label>
                  <textarea
                    rows={4}
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    placeholder="Commentaire de l’avis…"
                  />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="cc-btn-ghost" style={{ flex: 1 }} onClick={() => setShowForm(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="cc-submit reviews" style={{ flex: 2 }} disabled={submitting}>
                    <Send size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                    {submitting ? 'Enregistrement…' : editingReview ? 'Enregistrer' : 'Créer'}
                  </button>
                </div>
              </form>
            </section>
          )}

          <div className="cc-search">
            <Search size={18} color="#94a3b8" />
            <input
              type="text"
              placeholder="Rechercher par client, produit, commentaire…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="cc-search-count">{filtered.length} résultat(s)</span>
          </div>

          <div className="cc-toolbar">
            <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Tous les avis</h2>
            <div className="cc-filters">
              <button type="button" className={`cc-filter-btn reviews ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                Tous
              </button>
              {[5, 4, 3, 2, 1].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`cc-filter-btn reviews ${filter === `star-${n}` ? 'active' : ''}`}
                  onClick={() => setFilter(`star-${n}`)}
                >
                  {n} ★
                </button>
              ))}
              <button type="button" className={`cc-filter-btn reviews ${filter === 'low' ? 'active' : ''}`} onClick={() => setFilter('low')}>
                ≤ 2 ★
              </button>
              <button type="button" className={`cc-filter-btn reviews ${filter === 'ai' ? 'active' : ''}`} onClick={() => setFilter('ai')}>
                ✨ IA
              </button>
            </div>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: '#94a3b8' }}>Chargement…</p>
          ) : filtered.length === 0 ? (
            <div className="cc-empty">
              <Star size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p>Aucun avis{search ? ' pour cette recherche' : ''}.</p>
            </div>
          ) : (
            <div className="cc-list">
              {filtered.map((review) => {
                const u = userOf(review);
                const prod = productOf(review);
                const em = emotionMeta(review.emotion);
                const emStyle = EMOTION_STYLE[review.emotion] || EMOTION_STYLE.neutral;
                return (
                  <article key={reviewId(review)} className="cc-card review">
                    <div className="cc-card-head">
                      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                        {prod?.imageUrl ? (
                          <img src={prod.imageUrl} alt="" style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 56, height: 56, borderRadius: 12, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🐾</div>
                        )}
                        <div>
                          <h3 style={{ margin: 0 }}>{prod?.name || 'Produit'}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star key={i} size={16} fill={i <= review.rating ? '#f59e0b' : 'none'} color={i <= review.rating ? '#f59e0b' : '#d1d5db'} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="cc-meta">
                      <span className="cc-client-chip">{u?.name || 'Client'} · {u?.email || '—'}</span>
                      <span className="cc-badge" style={{ background: emStyle.bg, color: emStyle.color, textTransform: 'none' }}>
                        {em.emoji} {em.label}
                      </span>
                      {review.aiSuggested && (
                        <span className="cc-badge" style={{ background: '#ede9fe', color: '#5b21b6' }}>
                          <Sparkles size={12} style={{ verticalAlign: 'middle' }} /> IA
                        </span>
                      )}
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        {new Date(review.createdAt).toLocaleString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="cc-message">{review.comment}</p>
                    <div className="cc-actions">
                      <button type="button" className="cc-btn-ghost" onClick={() => openEdit(review)}>
                        <Edit3 size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                        Modifier
                      </button>
                      <button type="button" className="cc-btn-danger" onClick={() => handleDelete(reviewId(review))}>
                        <Trash2 size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                        Supprimer
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminReviews;
