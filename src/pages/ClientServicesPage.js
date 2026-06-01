import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Send, Trash2, CreditCard, Wallet } from 'lucide-react';
import {
  getServiceCatalog,
  getServiceSlots,
  getMyServiceBookings,
  createServiceBooking,
  payServiceBooking,
  cancelServiceBooking,
  estimateServicePrice,
} from '../services/serviceBookingService';
import { getWallet } from '../services/walletService';
import { createStripeIntent, processPayPalPayment } from '../utils/onlinePayment';
import './ClientComplaintsPage.css';
import './ClientServicesPage.css';

const bookingId = (b) => b?.id || b?._id;

const STATUS_LABELS = {
  scheduled: 'Planifiée',
  confirmed: 'Confirmée',
  completed: 'Terminée',
  cancelled: 'Annulée',
};

const ClientServicesPage = () => {
  const [catalog, setCatalog] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [serviceType, setServiceType] = useState('grooming');
  const [form, setForm] = useState({
    petName: '',
    animalType: 'dog',
    notes: '',
    date: new Date().toISOString().slice(0, 10),
    endDate: '',
  });
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [payModal, setPayModal] = useState(null);
  const [payMethod, setPayMethod] = useState('wallet');
  const [toast, setToast] = useState(null);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const load = async () => {
    setListLoading(true);
    try {
      const [cat, list, wallet] = await Promise.all([
        getServiceCatalog(),
        getMyServiceBookings(),
        getWallet().catch(() => ({ balance: 0 })),
      ]);
      setCatalog(cat);
      setBookings(list);
      setWalletBalance(wallet.balance || 0);
    } catch {
      setBookings([]);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await getServiceSlots(form.date);
        setSlots(data.slots || []);
        setSelectedSlot('');
      } catch {
        setSlots([]);
      }
    })();
  }, [form.date]);

  useEffect(() => {
    (async () => {
      try {
        const est = await estimateServicePrice(
          serviceType,
          selectedSlot || form.date,
          serviceType === 'boarding' ? form.endDate : undefined
        );
        setEstimatedPrice(est.price);
      } catch {
        setEstimatedPrice(null);
      }
    })();
  }, [serviceType, form.date, form.endDate, selectedSlot]);

  const activeService = useMemo(
    () => catalog.find((s) => s.type === serviceType) || catalog[0],
    [catalog, serviceType]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.petName.trim()) {
      showToast('Indiquez le nom de votre animal.', 'error');
      return;
    }
    if (!selectedSlot && serviceType !== 'boarding') {
      showToast('Choisissez un créneau horaire.', 'error');
      return;
    }
    if (serviceType === 'boarding' && !form.endDate) {
      showToast('Indiquez la date de fin de pension.', 'error');
      return;
    }

    setLoading(true);
    try {
      const booking = await createServiceBooking({
        type: serviceType,
        petName: form.petName.trim(),
        animalType: form.animalType,
        notes: form.notes.trim() || undefined,
        slotStart: selectedSlot || undefined,
        date: form.date,
        endDate: serviceType === 'boarding' ? form.endDate : undefined,
      });
      await load();
      setPayModal(booking);
      showToast('Réservation créée — procédez au paiement.');
    } catch (err) {
      showToast(err?.response?.data?.error || 'Erreur réservation', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!payModal) return;
    setLoading(true);
    try {
      const price = payModal.price || estimatedPrice || 0;

      if (payMethod === 'wallet') {
        if (walletBalance < price) {
          showToast('Solde insuffisant — rechargez votre portefeuille.', 'error');
          return;
        }
        await payServiceBooking(bookingId(payModal), 'wallet');
      } else if (payMethod === 'stripe') {
        const intent = await createStripeIntent(price);
        if (!intent?.clientSecret && !intent?.demo) {
          showToast('Stripe indisponible', 'error');
          return;
        }
        await payServiceBooking(bookingId(payModal), 'stripe');
      } else if (payMethod === 'paypal') {
        const result = await processPayPalPayment(price);
        if (!result.ok) {
          showToast(result.error || 'PayPal échoué', 'error');
          return;
        }
        await payServiceBooking(bookingId(payModal), 'paypal');
      }

      setPayModal(null);
      await load();
      showToast('Paiement confirmé — réservation validée !');
    } catch (err) {
      showToast(err?.response?.data?.error || 'Paiement échoué', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (b) => {
    if (!window.confirm('Annuler cette réservation ?')) return;
    try {
      await cancelServiceBooking(bookingId(b));
      await load();
      showToast('Réservation annulée.');
    } catch {
      showToast('Annulation impossible.', 'error');
    }
  };

  return (
    <div className="cc-page cc-page--services">
      {toast && <div className={`cc-toast ${toast.type}`}>{toast.text}</div>}

      <header className="cc-hero cc-hero--services">
        <h1>🐾 Réservation de services</h1>
        <p>
          Toilettage, pension et dressage — réservez en ligne et payez par portefeuille,
          carte ou PayPal.
        </p>
        <p style={{ marginTop: 8, fontSize: '0.85rem' }}>
          Solde portefeuille : <strong>{walletBalance.toFixed(2)} DT</strong>
          {' · '}
          <Link to="/client-wallet" style={{ color: '#059669', fontWeight: 700 }}>Recharger</Link>
        </p>
      </header>

      <div className="cc-service-grid">
        {(catalog.length ? catalog : [
          { type: 'grooming', label: 'Toilettage', description: 'Soins esthétiques', basePrice: 45, unit: 'session', icon: '✂️' },
          { type: 'boarding', label: 'Pension', description: 'Hébergement', basePrice: 35, unit: 'jour', icon: '🏠' },
          { type: 'training', label: 'Dressage', description: 'Éducation canine', basePrice: 60, unit: 'session', icon: '🎓' },
        ]).map((s) => (
          <button
            key={s.type}
            type="button"
            className={`cc-service-card ${serviceType === s.type ? 'active' : ''}`}
            onClick={() => setServiceType(s.type)}
          >
            <div className="icon">{s.icon}</div>
            <h3>{s.label}</h3>
            <p>{s.description}</p>
            <span className="cc-price-tag">{s.basePrice} DT / {s.unit}</span>
          </button>
        ))}
      </div>

      <section className="cc-form-card">
        <h2>
          <Calendar size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Réserver — {activeService?.label || serviceType}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="cc-field">
              <label>Nom de l’animal</label>
              <input
                required
                value={form.petName}
                onChange={(e) => setForm({ ...form, petName: e.target.value })}
                placeholder="Ex. Max"
              />
            </div>
            <div className="cc-field">
              <label>Espèce</label>
              <select value={form.animalType} onChange={(e) => setForm({ ...form, animalType: e.target.value })}>
                <option value="dog">Chien</option>
                <option value="cat">Chat</option>
                <option value="rabbit">Lapin</option>
                <option value="other">Autre</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: serviceType === 'boarding' ? '1fr 1fr' : '1fr', gap: 12 }}>
            <div className="cc-field">
              <label>{serviceType === 'boarding' ? 'Arrivée' : 'Date'}</label>
              <input
                type="date"
                required
                value={form.date}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            {serviceType === 'boarding' && (
              <div className="cc-field">
                <label>Départ</label>
                <input
                  type="date"
                  required
                  value={form.endDate}
                  min={form.date}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            )}
          </div>

          {serviceType !== 'boarding' && (
            <div className="cc-field">
              <label>Créneau horaire</label>
              <div className="cc-slots">
                {slots.length === 0 && <span style={{ color: '#94a3b8' }}>Chargement des créneaux…</span>}
                {slots.map((slot) => {
                  const label = new Date(slot.start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <button
                      key={slot.start}
                      type="button"
                      className={`cc-slot-btn ${selectedSlot === slot.start ? 'active' : ''}`}
                      disabled={!slot.isAvailable}
                      onClick={() => setSelectedSlot(slot.start)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="cc-field">
            <label>Notes (optionnel)</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Allergies, comportement, instructions particulières…"
            />
          </div>

          {estimatedPrice != null && (
            <p style={{ fontWeight: 800, color: '#065f46', marginBottom: 16 }}>
              Total estimé : {estimatedPrice} DT
            </p>
          )}

          <button type="submit" className="cc-submit services" disabled={loading}>
            <Send size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            {loading ? 'Réservation…' : 'Réserver et payer'}
          </button>
        </form>
      </section>

      <div className="cc-toolbar">
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Mes réservations</h2>
      </div>

      {listLoading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8' }}>Chargement…</p>
      ) : bookings.length === 0 ? (
        <div className="cc-empty">
          <Calendar size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>Aucune réservation pour le moment.</p>
        </div>
      ) : (
        <div className="cc-list">
          {bookings.map((b) => (
            <article key={bookingId(b)} className="cc-card review">
              <div className="cc-card-head">
                <h3>{b.serviceIcon} {b.serviceLabel || b.type} — {b.petName}</h3>
              </div>
              <div className="cc-meta">
                <span className={`cc-badge ${b.paymentStatus === 'paid' ? 'resolved' : 'pending'}`}>
                  {b.paymentStatus === 'paid' ? 'Payée' : 'En attente paiement'}
                </span>
                <span className="cc-badge" style={{ background: '#f3f4f6', color: '#374151', textTransform: 'none' }}>
                  {STATUS_LABELS[b.status] || b.status}
                </span>
                <span style={{ fontWeight: 800, color: '#065f46' }}>{b.price} DT</span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  {new Date(b.date).toLocaleString('fr-FR', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                  {b.endDate && ` → ${new Date(b.endDate).toLocaleDateString('fr-FR')}`}
                </span>
              </div>
              {b.notes && <p className="cc-message">{b.notes}</p>}
              <div className="cc-actions">
                {b.paymentStatus !== 'paid' && b.status !== 'cancelled' && (
                  <button type="button" className="cc-btn-ghost" onClick={() => { setPayModal(b); setPayMethod('wallet'); }}>
                    <CreditCard size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    Payer
                  </button>
                )}
                {b.status !== 'cancelled' && b.status !== 'completed' && (
                  <button type="button" className="cc-btn-danger" onClick={() => handleCancel(b)}>
                    <Trash2 size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    Annuler
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {payModal && (
        <div className="cc-modal-overlay" onClick={() => setPayModal(null)}>
          <div className="cc-modal" onClick={(e) => e.stopPropagation()}>
            <h2>💳 Paiement en ligne</h2>
            <p style={{ marginBottom: 16 }}>
              <strong>{payModal.serviceLabel || payModal.type}</strong> — {payModal.petName}
              <br />
              Montant : <strong>{payModal.price || estimatedPrice} DT</strong>
            </p>
            <div className="cc-pay-methods">
              {[
                { id: 'wallet', label: 'Portefeuille', icon: '👛' },
                { id: 'stripe', label: 'Carte', icon: '💳' },
                { id: 'paypal', label: 'PayPal', icon: '🅿️' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`cc-pay-method ${payMethod === m.id ? 'active' : ''}`}
                  onClick={() => setPayMethod(m.id)}
                >
                  {m.icon} {m.label}
                  {m.id === 'wallet' && (
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: 4 }}>
                      {walletBalance.toFixed(2)} DT
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="cc-modal-actions">
              <button type="button" className="cc-btn-ghost" onClick={() => setPayModal(null)}>Annuler</button>
              <button type="button" className="cc-btn-primary" onClick={handlePay} disabled={loading}>
                <Wallet size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                {loading ? 'Paiement…' : 'Confirmer le paiement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientServicesPage;
