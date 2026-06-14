import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Headphones, RotateCcw, Send, ShieldCheck } from 'lucide-react';
import {
  createServiceAfterSale,
  getMyServiceAfterSales,
} from '../services/serviceBookingService';

export const AFTER_SALE_TYPE_LABELS = {
  reschedule: 'Reprogrammer un rendez-vous',
  quality_issue: 'Problème qualité de prestation',
  partial_refund: 'Demande remboursement partiel',
  warranty: 'Garantie satisfaction (7 jours)',
  follow_up: 'Suivi / question post-prestation',
};

const STATUS_LABELS = {
  pending: 'En attente',
  in_progress: 'En cours',
  resolved: 'Résolu',
  rejected: 'Refusé',
};

const emptyForm = {
  bookingId: '',
  type: 'follow_up',
  details: '',
};

const ClientAfterSalePanel = ({ bookings = [], showToast, initialBookingId = '' }) => {
  const [requests, setRequests] = useState([]);
  const [types, setTypes] = useState(AFTER_SALE_TYPE_LABELS);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const eligibleBookings = useMemo(
    () => bookings.filter(
      (b) => b.status !== 'cancelled' && (b.paymentStatus === 'paid' || b.status === 'completed' || b.status === 'confirmed'),
    ),
    [bookings],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyServiceAfterSales();
      setRequests(data?.items || []);
      if (data?.types) setTypes({ ...AFTER_SALE_TYPE_LABELS, ...data.types });
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (initialBookingId && eligibleBookings.some((b) => (b.id || b._id) === initialBookingId)) {
      setForm((f) => ({ ...f, bookingId: initialBookingId }));
      return;
    }
    if (!form.bookingId && eligibleBookings.length) {
      const first = eligibleBookings[0];
      setForm((f) => ({ ...f, bookingId: first.id || first._id }));
    }
  }, [eligibleBookings, form.bookingId, initialBookingId]);

  const selectedBooking = useMemo(
    () => eligibleBookings.find((b) => (b.id || b._id) === form.bookingId),
    [eligibleBookings, form.bookingId],
  );

  const submit = async (e) => {
    e.preventDefault();
    if (!form.bookingId) {
      showToast?.('Sélectionnez une réservation.', 'error');
      return;
    }
    if (!form.details.trim()) {
      showToast?.('Décrivez votre demande.', 'error');
      return;
    }
    setSaving(true);
    try {
      await createServiceAfterSale({
        bookingId: form.bookingId,
        type: form.type,
        details: form.details.trim(),
        serviceLabel: selectedBooking?.serviceLabel || selectedBooking?.type,
        petName: selectedBooking?.petName,
      });
      setForm({ ...emptyForm, bookingId: form.bookingId });
      await load();
      showToast?.('Demande après-vente envoyée — notre équipe vous répond sous 48 h.');
    } catch (err) {
      showToast?.(err?.response?.data?.error || 'Envoi impossible.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="cc-aftersale">
      <header className="cc-aftersale__hero">
        <h2>
          <Headphones size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Service après-vente
        </h2>
        <p>
          Reprogrammation, garantie satisfaction, remboursement partiel ou suivi après toilettage,
          pension ou dressage — traité par le support PetfoodTN.
        </p>
      </header>

      <div className="cc-aftersale__links">
        <Link to="/client-complaints" className="cc-aftersale__link">
          <ShieldCheck size={16} /> Ouvrir une réclamation
        </Link>
        <Link to="/client-returns" className="cc-aftersale__link">
          <RotateCcw size={16} /> Retour produit / remboursement commande
        </Link>
      </div>

      <form className="cc-form-card cc-aftersale__form" onSubmit={submit}>
        <h3>Nouvelle demande</h3>
        {eligibleBookings.length === 0 ? (
          <p className="cc-aftersale__hint">
            Aucune réservation éligible pour l&apos;instant. Effectuez et payez une prestation pour activer l&apos;après-vente.
          </p>
        ) : (
          <>
            <div className="cc-field">
              <label>Réservation concernée</label>
              <select
                value={form.bookingId}
                onChange={(e) => setForm({ ...form, bookingId: e.target.value })}
              >
                {eligibleBookings.map((b) => (
                  <option key={b.id || b._id} value={b.id || b._id}>
                    {b.serviceLabel || b.type} — {b.petName} ({new Date(b.date).toLocaleDateString('fr-FR')})
                  </option>
                ))}
              </select>
            </div>
            <div className="cc-field">
              <label>Type de demande</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {Object.entries(types).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="cc-field">
              <label>Détails</label>
              <textarea
                rows={4}
                required
                value={form.details}
                onChange={(e) => setForm({ ...form, details: e.target.value })}
                placeholder="Décrivez le problème, la date souhaitée pour reprogrammer, ou votre question…"
              />
            </div>
            <button type="submit" className="cc-submit services" disabled={saving}>
              <Send size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              {saving ? 'Envoi…' : 'Envoyer la demande'}
            </button>
          </>
        )}
      </form>

      <div className="cc-toolbar" style={{ marginTop: 24 }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Mes demandes après-vente</h3>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8' }}>Chargement…</p>
      ) : requests.length === 0 ? (
        <div className="cc-empty">
          <Headphones size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>Aucune demande après-vente pour le moment.</p>
        </div>
      ) : (
        <div className="cc-list">
          {requests.map((r) => (
            <article key={r.id} className="cc-card review cc-aftersale__card">
              <div className="cc-card-head">
                <h4>{r.typeLabel || r.type} — {r.serviceLabel}</h4>
              </div>
              <div className="cc-meta">
                <span className={`cc-badge ${r.status === 'resolved' ? 'resolved' : 'pending'}`}>
                  {STATUS_LABELS[r.status] || r.status}
                </span>
                {r.petName && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{r.petName}</span>}
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  {new Date(r.createdAt).toLocaleString('fr-FR')}
                </span>
              </div>
              <p className="cc-message">{r.details}</p>
              {r.response && (
                <p className="cc-aftersale__response">
                  <strong>Réponse support :</strong> {r.response}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default ClientAfterSalePanel;
