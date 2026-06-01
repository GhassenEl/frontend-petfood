import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Plus, Trash2, Edit3, Send, Sparkles, Package } from 'lucide-react';
import { getProducts } from '../services/productService';
import { getMyReviews, createReview, updateReview, deleteReview } from '../services/reviewService';
import { productId, dedupeProducts, withProductIds } from '../utils/productId';
import ClientServiceRatingsPanel from '../components/ClientServiceRatingsPanel';
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
const productOf = (r) => r?.product || r?.productId;

const StarRow = ({ value, onChange, size = 28 }) => (
  <div className="cc-star-picker">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        className="cc-star-btn"
        onClick={() => onChange(n)}
        aria-label={`${n} étoiles`}
      >
        <Star size={size} fill={n <= value ? '#f59e0b' : 'none'} color={n <= value ? '#f59e0b' : '#d1d5db'} />
      </button>
    ))}
    <span style={{ marginLeft: 8, fontWeight: 800, color: '#92400e' }}>{value}/5</span>
  </div>
);

const ClientReviewsPage = () => {
  const [pageTab, setPageTab] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('tab') === 'services' ? 'services' : 'products';
    } catch {
      return 'products';
    }
  });

  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ productId: '', rating: 5, comment: '', emotion: 'satisfied' });
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState(null);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    setListLoading(true);
    try {
      const [reviewsList, productsList] = await Promise.all([
        getMyReviews(),
        getProducts().catch(() => []),
      ]);
      const prods = dedupeProducts((productsList || []).map(withProductIds));
      setReviews(reviewsList);
      setProducts(prods);
      if (prods.length && !formData.productId) {
        setFormData((c) => ({ ...c, productId: productId(prods[0]) }));
      }
    } catch {
      setReviews([]);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    if (!reviews.length) return { total: 0, average: '—', five: 0, withAi: 0 };
    const sum = reviews.reduce((a, r) => a + (r.rating || 0), 0);
    return {
      total: reviews.length,
      average: (sum / reviews.length).toFixed(1),
      five: reviews.filter((r) => r.rating === 5).length,
      withAi: reviews.filter((r) => r.aiSuggested).length,
    };
  }, [reviews]);

  const filtered = useMemo(() => {
    if (filter === 'all') return reviews;
    if (filter.startsWith('star-')) {
      const n = Number(filter.replace('star-', ''));
      return reviews.filter((r) => r.rating === n);
    }
    return reviews.filter((r) => (r.emotion || 'neutral') === filter);
  }, [reviews, filter]);

  const analyzeComment = async () => {
    if (!formData.comment.trim()) {
      showToast('Écrivez votre avis avant l’analyse IA.', 'error');
      return;
    }
    setAnalyzing(true);
    try {
      const response = await fetch('/fastapi/analyze-sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: formData.comment }),
      });
      if (!response.ok) throw new Error('IA indisponible');
      const suggestion = await response.json();
      setAiSuggestion(suggestion);
      setFormData((prev) => ({ ...prev, emotion: suggestion.emotion || prev.emotion }));
      showToast(`IA : ${suggestion.emotion} (${Math.round((suggestion.confidence || 0) * 100)} %)`);
    } catch {
      showToast('Analyse IA indisponible — choisissez l’émotion manuellement.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const openNewForm = () => {
    setEditingReview(null);
    setAiSuggestion(null);
    setFormData({
      productId: productId(products[0]) || '',
      rating: 5,
      comment: '',
      emotion: 'satisfied',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.comment.trim().length < 10) {
      showToast('L’avis doit contenir au moins 10 caractères.', 'error');
      return;
    }
    if (!formData.productId) {
      showToast('Choisissez un produit.', 'error');
      return;
    }

    const submitData = {
      productId: formData.productId,
      rating: formData.rating,
      comment: formData.comment.trim(),
      emotion: formData.emotion,
      aiSuggested: !!aiSuggestion && formData.emotion === aiSuggestion.emotion,
    };

    setLoading(true);
    try {
      if (editingReview) {
        await updateReview(reviewId(editingReview), submitData);
        showToast('Avis modifié avec succès.');
      } else {
        await createReview(submitData);
        showToast('Merci ! Votre avis a été publié.');
      }
      setShowForm(false);
      setEditingReview(null);
      setAiSuggestion(null);
      setFormData((c) => ({ ...c, comment: '', rating: 5 }));
      await fetchData();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Erreur lors de l’envoi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (review) => {
    const prod = productOf(review);
    setEditingReview(review);
    setFormData({
      productId: productId(prod) || '',
      rating: review.rating,
      comment: review.comment,
      emotion: review.emotion || 'neutral',
    });
    setAiSuggestion(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet avis ?')) return;
    try {
      await deleteReview(id);
      await fetchData();
      showToast('Avis supprimé.');
    } catch {
      showToast('Suppression impossible.', 'error');
    }
  };

  const emotionMeta = (id) => EMOTIONS.find((e) => e.id === id) || EMOTIONS[2];

  return (
    <div className="cc-page">
      {toast && <div className={`cc-toast ${toast.type}`}>{toast.text}</div>}

      <header className="cc-hero cc-hero--reviews">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1>⭐ Mes avis</h1>
            <p>
              Notez vos produits, la livraison par région et le service vétérinaire. Vos retours aident
              toute la communauté PetfoodTN.
            </p>
          </div>
          {pageTab === 'products' && (
            <button type="button" className="cc-submit reviews" style={{ width: 'auto', padding: '12px 20px' }} onClick={() => (showForm ? setShowForm(false) : openNewForm())}>
              <Plus size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              {showForm ? 'Fermer' : 'Nouvel avis produit'}
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
        <ClientServiceRatingsPanel showToast={showToast} />
      ) : (
        <>
          <div className="cc-stats">
            <div className="cc-stat">
              <strong style={{ color: '#1e3a8a' }}>{stats.total}</strong>
              <span>Avis publiés</span>
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
              <strong style={{ color: '#7c3aed' }}>{stats.withAi}</strong>
              <span>Avec aide IA</span>
            </div>
          </div>

          {showForm && (
            <section className="cc-form-card">
              <h2>
                <Package size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                {editingReview ? 'Modifier l’avis' : 'Nouvel avis produit'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="cc-field">
                  <label htmlFor="rev-product">Produit</label>
                  <select
                    id="rev-product"
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    required
                  >
                    {products.map((p) => (
                      <option key={productId(p)} value={productId(p)}>
                        {p.name} — {p.price} DT
                      </option>
                    ))}
                  </select>
                </div>

                <div className="cc-field">
                  <label>Note</label>
                  <StarRow value={formData.rating} onChange={(rating) => setFormData({ ...formData, rating })} />
                </div>

                <div className="cc-field">
                  <label htmlFor="rev-emotion">Votre ressenti</label>
                  <select
                    id="rev-emotion"
                    value={formData.emotion}
                    onChange={(e) => setFormData({ ...formData, emotion: e.target.value })}
                  >
                    {EMOTIONS.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.emoji} {e.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="cc-field">
                  <label htmlFor="rev-comment">Votre avis</label>
                  <textarea
                    id="rev-comment"
                    placeholder="Qualité, rapport qualité-prix, appétence pour votre animal…"
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    required
                    minLength={10}
                    maxLength={1500}
                  />
                  <div className="cc-char-count">{formData.comment.length} / 1500 (min. 10)</div>
                </div>

                <button
                  type="button"
                  className="cc-cat-btn"
                  style={{ width: '100%', marginBottom: 12, borderColor: '#c4b5fd', background: '#f5f3ff' }}
                  onClick={analyzeComment}
                  disabled={analyzing || !formData.comment.trim()}
                >
                  <Sparkles size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  {analyzing ? 'Analyse en cours…' : 'Analyser le sentiment avec l’IA'}
                </button>

                {aiSuggestion && (
                  <div className="cc-response" style={{ marginBottom: 12 }}>
                    <strong>Suggestion IA</strong>
                    <p style={{ margin: 0 }}>
                      {emotionMeta(aiSuggestion.emotion).emoji} {emotionMeta(aiSuggestion.emotion).label}
                      {' '}— confiance {Math.round((aiSuggestion.confidence || 0) * 100)} %
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="cc-btn-ghost" style={{ flex: 1 }} onClick={() => setShowForm(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="cc-submit reviews" style={{ flex: 2 }} disabled={loading}>
                    <Send size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                    {loading ? 'Envoi…' : editingReview ? 'Enregistrer' : 'Publier l’avis'}
                  </button>
                </div>
              </form>
            </section>
          )}

          <div className="cc-toolbar">
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Historique</h2>
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
            </div>
          </div>

          {listLoading ? (
            <p style={{ textAlign: 'center', color: '#94a3b8' }}>Chargement…</p>
          ) : filtered.length === 0 ? (
            <div className="cc-empty">
              <Star size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p>Aucun avis{filter !== 'all' ? ' pour ce filtre' : ''}.</p>
              {filter === 'all' && (
                <p style={{ fontSize: '0.9rem' }}>
                  <Link to="/client-products" style={{ color: '#2563eb', fontWeight: 700 }}>
                    Parcourir le catalogue
                  </Link>
                  {' '}pour noter un produit.
                </p>
              )}
            </div>
          ) : (
            <div className="cc-list">
              {filtered.map((review) => {
                const prod = productOf(review);
                const em = emotionMeta(review.emotion);
                const emStyle = EMOTION_STYLE[review.emotion] || EMOTION_STYLE.neutral;
                return (
                  <article key={reviewId(review)} className="cc-card review">
                    <div className="cc-card-head">
                      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                        {prod?.imageUrl ? (
                          <img
                            src={prod.imageUrl}
                            alt=""
                            style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ width: 64, height: 64, borderRadius: 12, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                            🐾
                          </div>
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
                      <span className="cc-badge" style={{ background: emStyle.bg, color: emStyle.color, textTransform: 'none' }}>
                        {em.emoji} {em.label}
                      </span>
                      {review.aiSuggested && (
                        <span className="cc-badge" style={{ background: '#ede9fe', color: '#5b21b6' }}>
                          ✨ IA
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
                      <button type="button" className="cc-btn-ghost" onClick={() => handleEdit(review)}>
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

export default ClientReviewsPage;
