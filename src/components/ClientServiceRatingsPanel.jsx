import React, { useEffect, useMemo, useState } from 'react';
import { Star, Trash2, Truck, Stethoscope, MapPin, Send, Sparkles } from 'lucide-react';
import StarRatingPicker from './StarRatingPicker';
import ClientEmotionPicker from './ClientEmotionPicker';
import {
  getServiceRatings,
  getEligibleServiceRatings,
  createServiceRating,
  deleteServiceRating,
  getServiceRatingStats,
} from '../services/serviceRatingService';
import { analyzeOwnerEmotion } from '../services/ownerEmotionService';
import { PLATFORM_SERVICE_TABS, emotionMeta, EMOTION_STYLE } from '../constants/ownerEmotions';
import '../pages/ClientComplaintsPage.css';

const ClientServiceRatingsPanel = ({ showToast: parentToast }) => {
  const [tab, setTab] = useState('grooming');
  const [ratings, setRatings] = useState([]);
  const [eligible, setEligible] = useState({
    delivery: [],
    veterinary: [],
    grooming: [],
    boarding: [],
    training: [],
  });
  const [regionStats, setRegionStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');
  const [localToast, setLocalToast] = useState(null);
  const [form, setForm] = useState({
    rating: 5,
    comment: '',
    emotion: 'satisfied',
    orderId: '',
    appointmentId: '',
    bookingId: '',
  });
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

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
      const [list, targets, stats] = await Promise.all([
        getServiceRatings(),
        getEligibleServiceRatings(),
        getServiceRatingStats('delivery'),
      ]);
      setRatings(Array.isArray(list) ? list : []);
      setEligible(targets || { delivery: [], veterinary: [], grooming: [], boarding: [], training: [] });
      setRegionStats(Array.isArray(stats) ? stats : []);
      const firstDelivery = targets?.delivery?.[0];
      const firstVet = targets?.veterinary?.[0];
      const firstGroom = targets?.grooming?.[0];
      const firstBoard = targets?.boarding?.[0];
      const firstTrain = targets?.training?.[0];
      setForm((f) => ({
        ...f,
        orderId: firstDelivery?.orderId || '',
        appointmentId: firstVet?.appointmentId || '',
        bookingId: firstGroom?.bookingId || firstBoard?.bookingId || firstTrain?.bookingId || '',
      }));
    } catch (err) {
      console.error('Service ratings load error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredRatings = useMemo(() => {
    const byType = ratings.filter((r) => r.type === tab);
    if (filter === 'all') return byType;
    const n = Number(filter.replace('star-', ''));
    return byType.filter((r) => r.rating === n);
  }, [ratings, tab, filter]);

  const stats = useMemo(() => {
    const list = ratings.filter((r) => r.type === tab);
    if (!list.length) return { total: 0, average: '—' };
    const sum = list.reduce((a, r) => a + r.rating, 0);
    return { total: list.length, average: (sum / list.length).toFixed(1) };
  }, [ratings, tab]);

  const runEmotionAnalysis = async () => {
    if (!form.comment.trim()) {
      toast('Écrivez un commentaire pour l’analyse IA.', 'error');
      return;
    }
    setAnalyzing(true);
    try {
      const suggestion = await analyzeOwnerEmotion({
        text: form.comment,
        serviceType: tab,
        rating: form.rating,
      });
      setAiSuggestion(suggestion);
      setForm((prev) => ({ ...prev, emotion: suggestion.emotion || prev.emotion }));
      toast(`IA : ${emotionMeta(suggestion.emotion).label}`);
    } catch {
      toast('Analyse IA indisponible.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        type: tab,
        rating: form.rating,
        comment: form.comment.trim() || undefined,
        emotion: form.emotion,
        aiSuggested: Boolean(aiSuggestion && form.emotion === aiSuggestion.emotion),
      };
      if (tab === 'delivery') {
        if (!form.orderId) {
          toast('Sélectionnez une commande livrée.', 'error');
          return;
        }
        payload.orderId = form.orderId;
        const target = eligible.delivery.find((o) => o.orderId === form.orderId);
        payload.region = target?.region || undefined;
      } else if (tab === 'veterinary') {
        if (!form.appointmentId) {
          toast('Sélectionnez une consultation vétérinaire.', 'error');
          return;
        }
        payload.appointmentId = form.appointmentId;
      } else {
        if (!form.bookingId) {
          toast('Sélectionnez une réservation terminée.', 'error');
          return;
        }
        payload.bookingId = form.bookingId;
      }
      await createServiceRating(payload);
      setForm((f) => ({ ...f, comment: '', rating: 5, emotion: 'satisfied' }));
      setAiSuggestion(null);
      await load();
      toast('Merci pour votre note et votre ressenti !');
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

  const tabMeta = PLATFORM_SERVICE_TABS.find((t) => t.id === tab) || { label: tab };
  const typeLabel = tabMeta.label?.replace(/^[^\s]+\s/, '') || tab;
  const TypeIcon =
    tab === 'delivery' ? Truck : tab === 'veterinary' ? Stethoscope : tab === 'grooming' ? MapPin : Stethoscope;
  const eligibleList =
    tab === 'delivery'
      ? eligible.delivery
      : tab === 'veterinary'
        ? eligible.veterinary
        : tab === 'boarding'
          ? eligible.boarding
          : tab === 'training'
            ? eligible.training
            : eligible.grooming;
  const canSubmit = eligibleList.length > 0;

  const emotionFields = (
    <>
      <div className="cc-field">
        <label>Votre ressenti émotionnel</label>
        <ClientEmotionPicker value={form.emotion} onChange={(emotion) => setForm({ ...form, emotion })} />
      </div>
      <button type="button" className="cc-filter-btn reviews" onClick={runEmotionAnalysis} disabled={analyzing}>
        <Sparkles size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
        {analyzing ? 'Analyse…' : 'Analyser mon ressenti (IA)'}
      </button>
      {aiSuggestion && (
        <p style={{ fontSize: 13, color: '#6b21a8', marginTop: 8 }}>
          Suggestion IA : {emotionMeta(aiSuggestion.emotion).emoji} {emotionMeta(aiSuggestion.emotion).label}
        </p>
      )}
    </>
  );

  if (loading) {
    return <p style={{ color: '#6b7280', textAlign: 'center', padding: 24 }}>Chargement des notes services…</p>;
  }

  return (
    <div>
      {localToast && !parentToast && (
        <div className={`cc-toast ${localToast.type}`}>{localToast.text}</div>
      )}

      <div className="cc-categories" style={{ marginBottom: 20 }}>
        {PLATFORM_SERVICE_TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`cc-cat-btn ${tab === id ? 'active' : ''}`}
            onClick={() => {
              setTab(id);
              setFilter('all');
              setAiSuggestion(null);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="cc-stats">
        <div className="cc-stat">
          <strong style={{ color: '#1e3a8a' }}>{stats.total}</strong>
          <span>Notes {typeLabel.toLowerCase()}</span>
        </div>
        <div className="cc-stat">
          <strong style={{ color: '#f59e0b' }}>{stats.average}</strong>
          <span>Moyenne</span>
        </div>
        <div className="cc-stat">
          <strong style={{ color: '#059669' }}>{eligible.delivery.length}</strong>
          <span>Livraisons à noter</span>
        </div>
        <div className="cc-stat">
          <strong style={{ color: '#7c3aed' }}>{eligible.veterinary.length}</strong>
          <span>Consultations à noter</span>
        </div>
      </div>

      {tab === 'delivery' && regionStats.length > 0 && (
        <div className="cc-form-card" style={{ background: 'linear-gradient(135deg, #eff6ff, #ecfdf5)' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={18} /> Notes livreurs par région
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {regionStats.map((s) => (
              <div key={s.region} className="cc-stat" style={{ minWidth: 120, textAlign: 'left' }}>
                <strong style={{ fontSize: '0.95rem', color: '#111' }}>{s.region}</strong>
                <div style={{ color: '#f59e0b', fontWeight: 800, fontSize: '1.2rem' }}>
                  {s.average} <Star size={14} fill="#f59e0b" color="#f59e0b" style={{ verticalAlign: 'middle' }} />
                </div>
                <span>{s.count} avis</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <section className="cc-form-card">
        <h2>
          <TypeIcon size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Noter le service {typeLabel.toLowerCase()}
        </h2>

        {tab === 'delivery' ? (
          eligible.delivery.length === 0 ? (
            <div className="cc-empty" style={{ padding: 24 }}>
              <p>Aucune commande livrée en attente de note.</p>
              <p style={{ fontSize: '0.85rem' }}>Passez une commande et attendez la livraison.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="cc-field">
                <label>Commande livrée</label>
                <select
                  value={form.orderId}
                  onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                  required
                >
                  {eligible.delivery.map((o) => (
                    <option key={o.orderId} value={o.orderId}>
                      #{String(o.orderId).slice(-6)} — {o.region || 'Région'} — {o.total} DT
                    </option>
                  ))}
                </select>
              </div>
              {canSubmit && (
                <>
                  <div className="cc-field">
                    <label>Votre note</label>
                    <StarRatingPicker value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
                  </div>
                  <div className="cc-field">
                    <label>Commentaire (optionnel)</label>
                    <textarea
                      value={form.comment}
                      onChange={(e) => setForm({ ...form, comment: e.target.value })}
                      placeholder="Ponctualité, courtoisie du livreur, état du colis…"
                      rows={4}
                      maxLength={800}
                    />
                    <div className="cc-char-count">{form.comment.length} / 800</div>
                  </div>
                  {emotionFields}
                  <button type="submit" className="cc-submit reviews" disabled={submitting}>
                    <Send size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                    {submitting ? 'Envoi…' : 'Publier ma note livraison'}
                  </button>
                </>
              )}
            </form>
          )
        ) : tab === 'veterinary' ? (
          eligible.veterinary.length === 0 ? (
            <div className="cc-empty" style={{ padding: 24 }}>
              <p>Aucune consultation terminée à noter.</p>
              <p style={{ fontSize: '0.85rem' }}>Prenez rendez-vous dans Santé & Vétérinaire.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="cc-field">
                <label>Consultation</label>
                <select
                  value={form.appointmentId}
                  onChange={(e) => setForm({ ...form, appointmentId: e.target.value })}
                  required
                >
                  {eligible.veterinary.map((a) => (
                    <option key={a.appointmentId} value={a.appointmentId}>
                      {a.petName} ({a.animalType}) — {a.vetName || 'Vétérinaire'} —{' '}
                      {new Date(a.date).toLocaleDateString('fr-FR')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="cc-field">
                <label>Votre note</label>
                <StarRatingPicker value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
              </div>
              <div className="cc-field">
                <label>Commentaire (optionnel)</label>
                <textarea
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  placeholder="Qualité de l'accueil, diagnostic, suivi…"
                  rows={4}
                  maxLength={800}
                />
                <div className="cc-char-count">{form.comment.length} / 800</div>
              </div>
              {emotionFields}
              <button type="submit" className="cc-submit reviews" disabled={submitting}>
                <Send size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                {submitting ? 'Envoi…' : 'Publier ma note vétérinaire'}
              </button>
            </form>
          )
        ) : canSubmit ? (
          <form onSubmit={handleSubmit}>
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
            <div className="cc-field">
              <label>Votre note</label>
              <StarRatingPicker value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
            </div>
            <div className="cc-field">
              <label>Commentaire (toilettage, dressage, pension…)</label>
              <textarea
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                placeholder="Décrivez votre expérience et ce que vous avez ressenti…"
                rows={4}
                maxLength={800}
              />
              <div className="cc-char-count">{form.comment.length} / 800</div>
            </div>
            {emotionFields}
            <button type="submit" className="cc-submit reviews" disabled={submitting}>
              <Send size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              {submitting ? 'Envoi…' : `Publier ma note ${typeLabel.toLowerCase()}`}
            </button>
          </form>
        ) : (
          <div className="cc-empty" style={{ padding: 24 }}>
            <p>Aucune réservation {typeLabel.toLowerCase()} terminée à noter.</p>
            <p style={{ fontSize: '0.85rem' }}>
              <a href="/client-services">Réserver un service</a>
            </p>
          </div>
        )}
      </section>

      <div className="cc-toolbar">
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Mes notes {typeLabel.toLowerCase()}</h2>
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
          <p>Aucune note {typeLabel.toLowerCase()} pour le moment.</p>
        </div>
      ) : (
        <div className="cc-list">
          {filteredRatings.map((r) => (
            <article key={r.id || r._id} className="cc-card review">
              <div className="cc-meta">
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={16} fill={i <= r.rating ? '#f59e0b' : 'none'} color={i <= r.rating ? '#f59e0b' : '#d1d5db'} />
                  ))}
                  <span style={{ fontSize: 13, color: '#6b7280', marginLeft: 6 }}>({r.rating}/5)</span>
                </div>
                {r.region && (
                  <span className="cc-badge" style={{ background: '#ecfdf5', color: '#047857', textTransform: 'none' }}>
                    <MapPin size={12} style={{ verticalAlign: 'middle' }} /> {r.region}
                  </span>
                )}
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  {new Date(r.createdAt).toLocaleString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              {r.orderId && (
                <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                  Commande #{String(r.orderId).slice(-6)}
                </p>
              )}
              {r.appointmentId && (
                <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: '#64748b' }}>Consultation vétérinaire</p>
              )}
              {r.emotion && (
                <span
                  className="cc-badge"
                  style={{
                    ...(EMOTION_STYLE[r.emotion] || EMOTION_STYLE.neutral),
                    textTransform: 'none',
                    marginTop: 8,
                    display: 'inline-block',
                  }}
                >
                  {emotionMeta(r.emotion).emoji} {emotionMeta(r.emotion).label}
                </span>
              )}
              {r.comment && <p className="cc-message">{r.comment}</p>}
              <div className="cc-actions">
                <button type="button" className="cc-btn-danger" onClick={() => handleDelete(r.id || r._id)}>
                  <Trash2 size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Supprimer
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientServiceRatingsPanel;
