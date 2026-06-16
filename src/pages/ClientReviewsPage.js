import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Plus, Trash2, Edit3, Send, Sparkles, Package } from 'lucide-react';
import { getProducts } from '../services/productService';
import { getMyReviews, createReview, updateReview, deleteReview } from '../services/reviewService';
import { postAnalyzeComment } from '../services/mlService';
import { detectReviewAnomalies } from '../utils/contentAnomalyDetector';
import { DEMO_REVIEWS, withDemoFallback } from '../utils/clientDemoData';
import { productId, dedupeProducts, withProductIds } from '../utils/productId';
import { emotionFromRating, ratingLabel } from '../utils/ratingHelpers';
import ClientServiceRatingsPanel from '../components/ClientServiceRatingsPanel';
import ClientNutritionBlogPanel from '../components/ClientNutritionBlogPanel';
import CommentSentimentPanel from '../components/CommentSentimentPanel';
import StarRatingPicker from '../components/StarRatingPicker';
import StarRatingDisplay from '../components/StarRatingDisplay';
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

const ClientReviewsPage = () => {
  const [pageTab, setPageTab] = useState(() => {
    try {
      const tab = new URLSearchParams(window.location.search).get('tab');
      if (tab === 'services') return 'services';
      if (tab === 'nutrition') return 'nutrition';
      return 'products';
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
  const [anomalyWarning, setAnomalyWarning] = useState(null);
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
      setReviews(withDemoFallback(reviewsList, DEMO_REVIEWS));
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
      const res = await postAnalyzeComment({
        comment: formData.comment,
        rating: formData.rating,
        serviceType: 'products',
      });
      const analysis = res?.analysis;
      if (!analysis) throw new Error('IA indisponible');
      const suggestion = {
        emotion: analysis.emotion,
        confidence: analysis.confidence,
        sentiment: analysis.sentiment,
      };
      setAiSuggestion(suggestion);
      setFormData((prev) => ({ ...prev, emotion: suggestion.emotion || prev.emotion }));
      showToast(`${analysis.emotionEmoji || ''} ${analysis.emotionLabel} · ${analysis.sentiment} (${Math.round((suggestion.confidence || 0) * 100)} %)`);
    } catch {
      showToast('Analyse IA indisponible — émotion déduite de la note.', 'error');
      setFormData((prev) => ({ ...prev, emotion: emotionFromRating(prev.rating) }));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRatingChange = (rating) => {
    setFormData((prev) => ({
      ...prev,
      rating,
      emotion: emotionFromRating(rating),
    }));
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
      emotion: formData.emotion || emotionFromRating(formData.rating),
      aiSuggested: !!aiSuggestion && formData.emotion === aiSuggestion.emotion,
    };

    const anomaly = detectReviewAnomalies(submitData);
    if (anomaly.suspicious && anomaly.severity === 'high') {
      const ok = window.confirm(
        `Avis suspect détecté : ${anomaly.summary}\n\nPublier quand même ? (Un modérateur pourra le retirer.)`,
      );
      if (!ok) return;
    }

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
            <h1>⭐ Mes avis sur 5</h1>
            <p>
              Notez vos produits (1 à 5 étoiles), la livraison et tous les services PetfoodTN.
              L’émotion est déduite automatiquement de votre note et de votre commentaire.
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
          { id: 'products', label: '🛍️ Avis produits (5★)' },
          { id: 'services', label: '🛎️ Services & livraison (5★)' },
          { id: 'sentiments', label: '🧠 Sentiments' },
          { id: 'nutrition', label: '🥗 Nutrition & Blog' },
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
      ) : pageTab === 'sentiments' ? (
        <CommentSentimentPanel variant="client" />
      ) : pageTab === 'nutrition' ? (
        <ClientNutritionBlogPanel />
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
                  <label>Note sur 5</label>
                  <StarRatingPicker value={formData.rating} onChange={handleRatingChange} />
                  <span style={{ fontSize: 12, color: '#64748b', marginTop: 4, display: 'block' }}>
                    {ratingLabel(formData.rating)}
                  </span>
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
                    onChange={(e) => {
                      setFormData({ ...formData, comment: e.target.value });
                      const a = detectReviewAnomalies({ comment: e.target.value, rating: formData.rating });
                      setAnomalyWarning(a.suspicious ? a : null);
                    }}
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

                {anomalyWarning && (
                  <div className="cc-response" style={{ marginBottom: 12, background: '#fef2f2', borderColor: '#fecaca' }}>
                    <strong style={{ color: '#991b1b' }}>⚠️ Anomalie détectée</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>{anomalyWarning.summary}</p>
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
                          <div style={{ marginTop: 6 }}>
                            <StarRatingDisplay value={review.rating} size={16} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="cc-meta">
                      <span className="cc-badge" style={{ background: emStyle.bg, color: emStyle.color, textTransform: 'none' }}>
                        {em.emoji} {em.label}
                      </span>
                      {review.sentiment && (
                        <span
                          className="cc-badge"
                          style={{
                            background: review.sentiment === 'positive' ? '#dcfce7' : review.sentiment === 'negative' ? '#fee2e2' : '#f3f4f6',
                            color: review.sentiment === 'positive' ? '#166534' : review.sentiment === 'negative' ? '#991b1b' : '#4b5563',
                          }}
                        >
                          {review.sentiment === 'positive' ? '👍 Positif' : review.sentiment === 'negative' ? '👎 Négatif' : '😐 Neutre'}
                        </span>
                      )}
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
