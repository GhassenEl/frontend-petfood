import React, { useEffect, useMemo, useState } from 'react';
import { Star, Trash2, Stethoscope, Truck, Send } from 'lucide-react';
import StarRatingPicker from './StarRatingPicker';
import StarRatingDisplay from './StarRatingDisplay';
import {
  getServiceRatings,
  getEligibleServiceRatings,
  createServiceRating,
  deleteServiceRating,
} from '../services/serviceRatingService';
import { SERVICE_RATE_CARDS, DEMO_SERVICE_RATINGS, withDemoFallback } from '../utils/clientDemoData';
import { emotionFromRating, ratingLabel } from '../utils/ratingHelpers';
import '../pages/ClientComplaintsPage.css';

const RATING_TAB_TYPES = [
  'delivery',
  'grooming',
  'bathing',
  'nail_trim',
  'dental_cleaning',
  'wellness_pack',
  'home_sitting',
  'boarding',
  'training',
  'veterinary',
];

const PLATFORM_SERVICE_TABS = [
  { id: 'delivery', label: '🚚 Livraison' },
  { id: 'grooming', label: '✂️ Toilettage' },
  { id: 'bathing', label: '🛁 Bain' },
  { id: 'nail_trim', label: '💅 Griffes' },
  { id: 'dental_cleaning', label: '🦷 Dentaire' },
  { id: 'wellness_pack', label: '✨ Forfait' },
  { id: 'home_sitting', label: '🏡 Garde domicile' },
  { id: 'boarding', label: '🏠 Pension' },
  { id: 'training', label: '🎓 Dressage' },
  { id: 'veterinary', label: '🩺 Vétérinaire' },
];

const emptyEligible = () =>
  RATING_TAB_TYPES.reduce((acc, type) => {
    acc[type] = [];
    return acc;
  }, {});

const ClientServiceRatingsPanel = ({ showToast: parentToast }) => {
  const [tab, setTab] = useState('delivery');
  const [ratings, setRatings] = useState([]);
  const [eligible, setEligible] = useState(emptyEligible());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');
  const [localToast, setLocalToast] = useState(null);
  const [form, setForm] = useState({
    rating: 5,
    comment: '',
    appointmentId: '',
    bookingId: '',
    orderId: '',
  });

  const toast = (text, type = 'success') => {
    if (parentToast) parentToast(text, type);
    else {
      setLocalToast({ text, type });
      setTimeout(() => setLocalToast(null), 4000);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const [list, targets] = await Promise.all([
        getServiceRatings(),
        getEligibleServiceRatings(),
      ]);
      setRatings(withDemoFallback(Array.isArray(list) ? list : [], DEMO_SERVICE_RATINGS));
      const merged = { ...emptyEligible(), ...(targets || {}) };
      setEligible(merged);
      setForm((f) => ({
        ...f,
        orderId: merged.delivery?.[0]?.orderId || '',
        appointmentId: merged.veterinary?.[0]?.appointmentId || '',
        bookingId: merged[tab]?.[0]?.bookingId || '',
      }));
    } catch (err) {
      console.error('Service ratings load error', err);
      setRatings(DEMO_SERVICE_RATINGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const list = eligible[tab] || [];
    if (tab === 'delivery') {
      setForm((f) => ({ ...f, orderId: list[0]?.orderId || '' }));
    } else if (tab === 'veterinary') {
      setForm((f) => ({ ...f, appointmentId: list[0]?.appointmentId || '' }));
    } else {
      setForm((f) => ({ ...f, bookingId: list[0]?.bookingId || '' }));
    }
  }, [tab, eligible]);

  const filteredRatings = useMemo(() => {
    const byType = ratings.filter((r) => r.type === tab);
    if (filter === 'all') return byType;
    const n = Number(filter.replace('star-', ''));
    return byType.filter((r) => r.rating === n);
  }, [ratings, tab, filter]);

  const stats = useMemo(() => {
    const list = ratings.filter((r) => r.type === tab);
    if (!list.length) {
      const card = SERVICE_RATE_CARDS.find((c) => c.type === tab);
      return { total: card?.reviewCount || 0, average: card?.avgRating?.toFixed(1) || '—' };
    }
    const sum = list.reduce((a, r) => a + r.rating, 0);
    return { total: list.length, average: (sum / list.length).toFixed(1) };
  }, [ratings, tab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        type: tab,
        rating: form.rating,
        comment: form.comment.trim() || undefined,
        emotion: emotionFromRating(form.rating),
      };
      if (tab === 'veterinary') {
        if (!form.appointmentId) {
          toast('Sélectionnez une consultation vétérinaire.', 'error');
          return;
        }
        payload.appointmentId = form.appointmentId;
      } else if (tab === 'delivery') {
        if (!form.orderId) {
          toast('Sélectionnez une commande livrée.', 'error');
          return;
        }
        payload.orderId = form.orderId;
      } else {
        if (!form.bookingId) {
          toast('Sélectionnez une réservation terminée.', 'error');
          return;
        }
        payload.bookingId = form.bookingId;
      }
      await createServiceRating(payload);
      setForm((f) => ({ ...f, comment: '', rating: 5 }));
      await load();
      toast('Merci pour votre avis sur 5 !');
    } catch (err) {
      toast(err?.response?.data?.error || 'Erreur lors de l’envoi', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette note ?')) return;
    try {
      await deleteServiceRating(id);
      await load();
      toast('Note supprimée.');
    } catch {
      toast('Suppression impossible.', 'error');
    }
  };

  const tabMeta = SERVICE_RATE_CARDS.find((t) => t.type === tab) || { label: tab, icon: '⭐' };
  const typeLabel = tabMeta.label || tab;
  const TypeIcon = tab === 'veterinary' ? Stethoscope : tab === 'delivery' ? Truck : Star;
  const eligibleList = eligible[tab] || [];
  const canSubmit = eligibleList.length > 0;

  if (loading) {
    return <p style={{ color: '#6b7280', textAlign: 'center', padding: 24 }}>Chargement des notes services…</p>;
  }

  return (
    <div>
      {localToast && !parentToast && (
        <div className={`cc-toast ${localToast.type}`}>{localToast.text}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 20 }}>
        {SERVICE_RATE_CARDS.map((card) => (
          <div
            key={card.type}
            style={{
              background: tab === card.type ? '#eff6ff' : '#f8fafc',
              border: tab === card.type ? '2px solid #3b82f6' : '1px solid #e2e8f0',
              borderRadius: 12,
              padding: 12,
              cursor: RATING_TAB_TYPES.includes(card.type) ? 'pointer' : 'default',
            }}
            onClick={() => {
              if (RATING_TAB_TYPES.includes(card.type)) {
                setTab(card.type);
                setFilter('all');
              }
            }}
          >
            <div style={{ fontSize: 20 }}>{card.icon}</div>
            <strong style={{ fontSize: 12, display: 'block', marginTop: 4 }}>{card.label}</strong>
            <div style={{ marginTop: 4 }}>
              <StarRatingDisplay value={card.avgRating} size={14} showValue />
            </div>
            <span style={{ fontSize: 11, color: '#64748b' }}>
              {card.basePrice > 0 ? `${card.basePrice} DT/${card.unit}` : 'Gratuit'} · {card.reviewCount} avis
            </span>
          </div>
        ))}
      </div>

      <div className="cc-categories" style={{ marginBottom: 20 }}>
        {PLATFORM_SERVICE_TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`cc-cat-btn ${tab === id ? 'active' : ''}`}
            onClick={() => {
              setTab(id);
              setFilter('all');
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="cc-stats">
        <div className="cc-stat">
          <strong style={{ color: '#1e3a8a' }}>{stats.total}</strong>
          <span>Avis {typeLabel.toLowerCase()}</span>
        </div>
        <div className="cc-stat">
          <strong style={{ color: '#f59e0b' }}>{stats.average}</strong>
          <span>Moyenne / 5</span>
        </div>
        <div className="cc-stat">
          <strong style={{ color: '#7c3aed' }}>{eligible.delivery?.length || 0}</strong>
          <span>Livraisons à noter</span>
        </div>
      </div>

      <section className="cc-form-card">
        <h2>
          <TypeIcon size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Noter {typeLabel.toLowerCase()} — sur 5
        </h2>

        {!canSubmit ? (
          <div className="cc-empty" style={{ padding: 24 }}>
            <p>
              {tab === 'delivery'
                ? 'Aucune commande livrée à noter pour le moment.'
                : tab === 'veterinary'
                  ? 'Aucune consultation terminée à noter.'
                  : `Aucune réservation ${typeLabel.toLowerCase()} terminée à noter.`}
            </p>
            <p style={{ fontSize: '0.85rem' }}>
              <a href={tab === 'delivery' ? '/client-orders' : '/client-services'}>
                {tab === 'delivery' ? 'Voir mes commandes' : 'Réserver un service'}
              </a>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {tab === 'delivery' && (
              <div className="cc-field">
                <label>Commande livrée</label>
                <select
                  value={form.orderId}
                  onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                  required
                >
                  {eligibleList.map((o) => (
                    <option key={o.orderId} value={o.orderId}>
                      Commande #{String(o.orderId).slice(-6)} — {Number(o.total || 0).toFixed(2)} DT
                      {o.region ? ` — ${o.region}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {tab === 'veterinary' && (
              <div className="cc-field">
                <label>Consultation</label>
                <select
                  value={form.appointmentId}
                  onChange={(e) => setForm({ ...form, appointmentId: e.target.value })}
                  required
                >
                  {eligibleList.map((a) => (
                    <option key={a.appointmentId} value={a.appointmentId}>
                      {a.petName} ({a.animalType}) — {a.vetName || 'Vétérinaire'} —{' '}
                      {new Date(a.date).toLocaleDateString('fr-FR')}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {tab !== 'delivery' && tab !== 'veterinary' && (
              <div className="cc-field">
                <label>Réservation {typeLabel.toLowerCase()}</label>
                <select
                  value={form.bookingId}
                  onChange={(e) => setForm({ ...form, bookingId: e.target.value })}
                  required
                >
                  {eligibleList.map((b) => (
                    <option key={b.bookingId} value={b.bookingId}>
                      {b.petName} — {new Date(b.date).toLocaleDateString('fr-FR')} — {b.price ?? '—'} DT
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="cc-field">
              <label>Votre note sur 5</label>
              <StarRatingPicker
                value={form.rating}
                onChange={(rating) => setForm({ ...form, rating })}
              />
              <span style={{ fontSize: 12, color: '#64748b', marginTop: 4, display: 'block' }}>
                {ratingLabel(form.rating)} · émotion : {emotionFromRating(form.rating)}
              </span>
            </div>

            <div className="cc-field">
              <label>Commentaire (optionnel)</label>
              <textarea
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                placeholder={`Décrivez votre expérience ${typeLabel.toLowerCase()}…`}
                rows={4}
                maxLength={800}
              />
              <div className="cc-char-count">{form.comment.length} / 800</div>
            </div>

            <button type="submit" className="cc-submit reviews" disabled={submitting}>
              <Send size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              {submitting ? 'Envoi…' : 'Publier mon avis sur 5'}
            </button>
          </form>
        )}
      </section>

      <div className="cc-toolbar">
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Avis — {typeLabel.toLowerCase()}</h2>
        <div className="cc-filters">
          <button type="button" className={`cc-filter-btn reviews ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            Toutes
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

      {filteredRatings.length === 0 ? (
        <div className="cc-empty">
          <Star size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>Aucun avis {typeLabel.toLowerCase()} pour le moment.</p>
        </div>
      ) : (
        <div className="cc-list">
          {filteredRatings.map((r) => (
            <article key={r.id || r._id} className="cc-card review">
              <div className="cc-meta">
                <StarRatingDisplay value={r.rating} size={16} />
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  {new Date(r.createdAt).toLocaleString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              {r.comment && <p className="cc-message">{r.comment}</p>}
              {!(String(r.id || r._id).startsWith('demo-')) && (
                <div className="cc-actions">
                  <button type="button" className="cc-btn-danger" onClick={() => handleDelete(r.id || r._id)}>
                    <Trash2 size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    Supprimer
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientServiceRatingsPanel;
