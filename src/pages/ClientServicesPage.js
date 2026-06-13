import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Calendar, Send, Trash2, CreditCard, Heart, ChevronRight } from 'lucide-react';
import PaymentMethodPicker from '../components/PaymentMethodPicker';
import PaymentMethodDetails from '../components/PaymentMethodDetails';
import ClientServiceRatingsPanel from '../components/ClientServiceRatingsPanel';
import { isWalletPayment } from '../constants/paymentMethods';
import { getWallet } from '../services/walletService';
import {
  getServiceCatalog,
  getServiceSlots,
  getMyServiceBookings,
  createServiceBooking,
  payServiceBooking,
  cancelServiceBooking,
  estimateServicePrice,
} from '../services/serviceBookingService';
import { fetchRehabOverview, applyAdoption } from '../services/ecosystemService';
import { createStripeIntent, processPayPalPayment } from '../utils/onlinePayment';
import { SERVICE_RATE_CARDS } from '../utils/clientDemoData';
import {
  mergeServiceCatalog,
  estimateLocalServicePrice,
  SERVICES_WITH_DATE_RANGE,
  getDefaultServiceSlots,
} from '../utils/serviceCatalogUtils';
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
  const [priceNote, setPriceNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [payModal, setPayModal] = useState(null);
  const [payMethod, setPayMethod] = useState('wallet');
  const [walletBalance, setWalletBalance] = useState(0);
  const [toast, setToast] = useState(null);
  const [rehabData, setRehabData] = useState(null);
  const [rehabLoading, setRehabLoading] = useState(true);
  const [adoptMsg, setAdoptMsg] = useState('');

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
      setCatalog(mergeServiceCatalog(cat));
      setBookings(list);
      setWalletBalance(wallet.balance || 0);
    } catch {
      setCatalog(mergeServiceCatalog([]));
      setBookings([]);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const loadRehab = useCallback(async () => {
    setRehabLoading(true);
    try {
      setRehabData(await fetchRehabOverview({ scaredOnly: 'true' }));
    } catch {
      setRehabData(null);
    } finally {
      setRehabLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRehab();
  }, [loadRehab]);

  const handleAdoptInterest = async (animalId, name) => {
    setAdoptMsg('');
    try {
      await applyAdoption({
        shelterAnimalId: animalId,
        message: `Je souhaite adopter ${name} après sa réhabilitation — foyer calme et patient.`,
      });
      setAdoptMsg('Demande envoyée — le refuge vous recontactera.');
    } catch (e) {
      setAdoptMsg(e.response?.data?.error || 'Demande impossible');
    }
  };

  useEffect(() => {
    getWallet().then((w) => setWalletBalance(w?.balance ?? 0)).catch(() => setWalletBalance(0));
  }, [payModal]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getServiceSlots(form.date);
        setSlots(data.slots?.length ? data.slots : getDefaultServiceSlots(form.date));
        setSelectedSlot('');
      } catch {
        setSlots(getDefaultServiceSlots(form.date));
      }
    })();
  }, [form.date]);

  useEffect(() => {
    (async () => {
      try {
        const est = await estimateServicePrice(
          serviceType,
          selectedSlot || form.date,
          SERVICES_WITH_DATE_RANGE.includes(serviceType) ? form.endDate : undefined
        );
        setEstimatedPrice(est.price);
        setPriceNote('');
      } catch {
        const local = estimateLocalServicePrice(
          serviceType,
          form.date,
          SERVICES_WITH_DATE_RANGE.includes(serviceType) ? form.endDate : undefined
        );
        setEstimatedPrice(local.price);
        setPriceNote(local.discountNote || '');
      }
    })();
  }, [serviceType, form.date, form.endDate, selectedSlot]);

  const activeService = useMemo(
    () => catalog.find((s) => s.type === serviceType) || SERVICE_RATE_CARDS.find((s) => s.type === serviceType),
    [catalog, serviceType]
  );

  const displayCatalog = catalog.length ? catalog : mergeServiceCatalog([]);

  const usesDateRange = SERVICES_WITH_DATE_RANGE.includes(serviceType);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.petName.trim()) {
      showToast('Indiquez le nom de votre animal.', 'error');
      return;
    }
    if (!selectedSlot && !usesDateRange) {
      showToast('Choisissez un créneau horaire.', 'error');
      return;
    }
    if (usesDateRange && !form.endDate) {
      showToast('Indiquez la date de fin.', 'error');
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
        endDate: usesDateRange ? form.endDate : undefined,
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
        if ((walletBalance ?? 0) < price) {
          showToast('Solde insuffisant — rechargez via le portefeuille dans les moyens de paiement.', 'error');
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
        <h1>🐾 Mes services PetfoodTN</h1>
        <p>
          Toilettage, coupe griffes, nettoyage dentaire, forfait bien-être (-10 %), garde à domicile,
          pension et dressage — réservez en ligne et consultez les tarifs & avis clients.
        </p>
        {walletBalance != null && (
          <p style={{ marginTop: 8, fontSize: '0.85rem' }}>
            Solde portefeuille : <strong>{walletBalance.toFixed(2)} DT</strong>
          </p>
        )}
      </header>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 12 }}>Tarifs & avis par service</h2>
        <ClientServiceRatingsPanel showToast={showToast} />
      </section>

      <div className="cc-service-grid">
        {displayCatalog.map((s) => (
          <button
            key={s.type}
            type="button"
            className={`cc-service-card ${serviceType === s.type ? 'active' : ''}`}
            onClick={() => setServiceType(s.type)}
          >
            {s.badge && <span className="cc-service-badge">{s.badge}</span>}
            <div className="icon">{s.icon}</div>
            <h3>{s.label}</h3>
            <p>{s.description || `${s.avgRating || '—'} ★ · ${s.reviewCount || 0} avis`}</p>
            <span className="cc-price-tag">
              {s.basePrice > 0 ? `${s.basePrice} DT / ${s.unit}` : 'Sur demande'}
            </span>
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

          <div style={{ display: 'grid', gridTemplateColumns: usesDateRange ? '1fr 1fr' : '1fr', gap: 12 }}>
            <div className="cc-field">
              <label>{usesDateRange ? 'Arrivée / début' : 'Date'}</label>
              <input
                type="date"
                required
                value={form.date}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            {usesDateRange && (
              <div className="cc-field">
                <label>{serviceType === 'boarding' ? 'Départ' : 'Fin de garde'}</label>
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

          {!usesDateRange && (
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
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontWeight: 800, color: '#065f46', margin: 0 }}>
                Total estimé : {estimatedPrice} DT
              </p>
              {priceNote && (
                <p style={{ margin: '6px 0 0', fontSize: 13, color: '#047857' }}>{priceNote}</p>
              )}
              {serviceType === 'wellness_pack' && (
                <p style={{ margin: '6px 0 0', fontSize: 13, color: '#64748b' }}>
                  Inclus : toilettage (45 DT) + bain (35 DT) + griffes (15 DT)
                </p>
              )}
            </div>
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

      <section className="cc-form-card" style={{ marginTop: 32, background: 'linear-gradient(135deg, #ecfdf5, #f0fdf4)' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Heart size={20} color="#059669" />
          Réhabilitation refuges
        </h2>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>
          Soutenez la réhabilitation des animaux de refuge — programmes d&apos;adaptation et adoption responsable.
        </p>
        {adoptMsg && <p style={{ color: '#059669', fontWeight: 700, fontSize: 14 }}>{adoptMsg}</p>}
        {rehabLoading ? (
          <p style={{ color: '#94a3b8' }}>Chargement des programmes…</p>
        ) : !(rehabData?.programs?.length) ? (
          <p style={{ color: '#64748b' }}>Aucun programme actif pour le moment. Revenez bientôt.</p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {rehabData.programs.slice(0, 4).map((prog) => {
              const animal = prog.animal || {};
              const id = prog.shelterAnimalId || animal.id;
              const name = animal.name || 'Animal refuge';
              return (
                <div
                  key={id}
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: 14,
                    border: '1px solid #bbf7d0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <strong>{name}</strong>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
                      {prog.phaseLabel || prog.status || 'Programme en cours'} · {animal.species || 'chien/chat'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAdoptInterest(id, name)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 10,
                      border: 'none',
                      background: '#059669',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    Soutenir / adopter <ChevronRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {payModal && (
        <div className="cc-modal-overlay" onClick={() => setPayModal(null)}>
          <div className="cc-modal" onClick={(e) => e.stopPropagation()}>
            <h2>💳 Paiement en ligne</h2>
            <p style={{ marginBottom: 16 }}>
              <strong>{payModal.serviceLabel || payModal.type}</strong> — {payModal.petName}
              <br />
              Montant : <strong>{payModal.price || estimatedPrice} DT</strong>
            </p>
            <div className="cc-pay-methods" style={{ flexDirection: 'column', gap: 12 }}>
              <PaymentMethodPicker value={payMethod} onChange={setPayMethod} layout="flex" />
              <PaymentMethodDetails
                method={payMethod}
                walletBalance={walletBalance}
                onWalletBalanceChange={setWalletBalance}
                amountDue={payModal.price || estimatedPrice || 0}
              />
            </div>
            <div className="cc-modal-actions">
              <button type="button" className="cc-btn-ghost" onClick={() => setPayModal(null)}>Annuler</button>
              <button type="button" className="cc-btn-primary" onClick={handlePay} disabled={loading || (isWalletPayment(payMethod) && (walletBalance ?? 0) < (payModal.price || 0))}>
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
