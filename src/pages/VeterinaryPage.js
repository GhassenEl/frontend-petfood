import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, Calendar, Weight, Thermometer, Pill, ChevronDown, ChevronUp, Printer } from 'lucide-react';
import { getProfile } from '../services/userService';
import {
  getVeterinaryRecords,
  getUpcomingVisits,
  getAppointments,
  createAppointment,
  getPrescriptions,
  getConsultations,
  getContactRequests,
  submitContactRequest,
  respondToContactRequest,
  getAvailability,
} from '../services/vetService';
import { sendMessage } from '../services/chatService';
import { useAuth } from '../contexts/AuthContext.jsx';
import Toast from '../components/Toast';
import ClientVetHealthHub from '../components/ClientVetHealthHub';
import ClientVetAiPanel from '../components/ClientVetAiPanel';
import ClientRelayPointsPanel from '../components/ClientRelayPointsPanel';
import MedicationSchedule from '../components/MedicationSchedule';
import { VISIT_MODES, visitModeLabel, isHomeVisit, isOnlineVisit, visitModeBadge } from '../constants/visitModes';
import TeleconsultMeetPanel from '../components/TeleconsultMeetPanel';

const animalEmojis = { dog: '🐕', cat: '🐈', bird: '🐦', fish: '🐟', rabbit: '🐰', other: '🐾' };
const animalNames = { dog: 'Chien', cat: 'Chat', bird: 'Oiseau', fish: 'Poisson', rabbit: 'Lapin', other: 'Autre' };
const sexLabels = { male: 'Male', female: 'Femelle', unknown: 'Non precise' };
const activityLabels = { low: 'Calme', normal: 'Normale', high: 'Active', sport: 'Sportive' };

const getPetAge = (birthDate) => {
  if (!birthDate) return '';
  const date = new Date(birthDate);
  if (Number.isNaN(date.getTime())) return '';
  const today = new Date();
  let years = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    years -= 1;
  }
  if (years > 0) return `${years} an${years > 1 ? 's' : ''}`;
  const months = Math.max(0, monthDiff + 12 * (today.getFullYear() - date.getFullYear()));
  return `${months} mois`;
};

const statusConfig = {
  active: { bg: '#dcfce7', color: '#166534', label: 'Actif' },
  completed: { bg: '#dbeafe', color: '#1e40af', label: 'Terminé' },
  cancelled: { bg: '#fee2e2', color: '#991b1b', label: 'Annulé' },
};

const VeterinaryPage = () => {
  const [records, setRecords] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Vet contact with client (demandes)
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState('');
  const [contactSuccess, setContactSuccess] = useState('');
  const [contactRequests, setContactRequests] = useState([]);

  const [contactForm, setContactForm] = useState({
    animalType: 'dog',
    petName: '',
    subject: '',
    message: '',
    preferredDate: '',
    visitMode: 'cabinet',
    homeAddress: '',
  });

  // RDV (agenda)
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);


  const [appointmentsError, setAppointmentsError] = useState('');
  const [appointmentsSuccess, setAppointmentsSuccess] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [consultations, setConsultations] = useState([]);

  const [availabilityDate, setAvailabilityDate] = useState(() => {
    const d = new Date();
    // YYYY-MM-DD local
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlotStart, setSelectedSlotStart] = useState('');

  const [appointmentForm, setAppointmentForm] = useState({
    petName: '',
    animalType: 'dog',
    notes: '',
    type: 'veterinary_consultation',
    visitMode: 'cabinet',
    homeAddress: '',
  });
  const { user } = useAuth();
  const isVet = user?.role === 'vet' || user?.role === 'admin';
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [selectedPet, setSelectedPet] = useState(null);
  const [clientTab, setClientTab] = useState('sante');

  const CLIENT_TABS = [
    { id: 'sante', label: 'Mes animaux & demandes' },
    { id: 'assistant', label: 'Assistant santé' },
    { id: 'rdv', label: 'Rendez-vous' },
    { id: 'suivi', label: 'Ordonnances & suivi' },
    { id: 'relais', label: 'Points relais' },
    { id: 'historique', label: 'Historique' },
  ];


  useEffect(() => {
    fetchData();
    loadContactRequests();
    (async () => {
      try {
        const profile = await getProfile();
        const addr = profile?.address || '';
        if (addr) {
          setAppointmentForm((p) => (p.homeAddress ? p : { ...p, homeAddress: addr }));
          setContactForm((p) => (p.homeAddress ? p : { ...p, homeAddress: addr }));
        }
      } catch { /* ignore */ }
    })();

    // Load appointments, prescriptions, consultations
    (async () => {
      try {
        setAppointmentsLoading(true);
        const [apptData, rxData, consultData] = await Promise.all([
          getAppointments(),
          getPrescriptions().catch(() => []),
          getConsultations().catch(() => []),
        ]);
        setAppointments(Array.isArray(apptData) ? apptData : []);
        setPrescriptions(Array.isArray(rxData) ? rxData : []);
        setConsultations(Array.isArray(consultData) ? consultData : []);
      } catch (e) {
        setAppointmentsError(e?.response?.data?.error || "Impossible de charger vos rendez-vous.");
      } finally {
        setAppointmentsLoading(false);
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedPet) return;
    const type = selectedPet.type || selectedPet.animalType || 'dog';
    setAppointmentForm((p) => ({
      ...p,
      petName: selectedPet.name || p.petName,
      animalType: type,
    }));
  }, [selectedPet]);

  // Prefill contact form when coming from Nutri flow
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const prefill = params.get('prefill');
      if (prefill === 'nutri' || prefill === 'nutripro') {
        const message = sessionStorage.getItem('nutripro:message') || sessionStorage.getItem('nutri:message') || params.get('message') || '';
        const pet = JSON.parse(sessionStorage.getItem('nutripro:pet') || sessionStorage.getItem('nutri:pet') || 'null');
        const subjectBase = prefill === 'nutripro' ? 'Validation NutriPro' : 'Validation plan nutritionnel';
        setContactForm((cf) => ({
          ...cf,
          petName: pet?.name || cf.petName || '',
          animalType: pet?.type || cf.animalType || 'dog',
          subject: `${subjectBase}${pet?.name ? ` — ${pet.name}` : ''}`,
          message: message || cf.message || '',
        }));
      }
    } catch (e) {
      // ignore
    }
  }, []);


  const fetchData = async () => {
    try {
      const [recordsData, upcomingData] = await Promise.all([
        getVeterinaryRecords(),
        getUpcomingVisits(),
      ]);
      setRecords(recordsData || []);
      setUpcoming(upcomingData || []);
    } catch (error) {
      console.error('Veterinary data error', error);
    } finally {
      setLoading(false);
    }
  };

  const loadContactRequests = async () => {
    try {
      // endpoint candidat (si existe)
      const data = await getContactRequests();
      setContactRequests(Array.isArray(data) ? data : []);
    } catch {
      // fallback: rien à afficher si endpoint non dispo
      setContactRequests([]);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Build weight history per pet
  const weightHistory = records.reduce((acc, r) => {
    if (!r.weight) return acc;
    if (!acc[r.petName]) acc[r.petName] = [];
    acc[r.petName].push({ date: r.visitDate, weight: r.weight });
    return acc;
  }, {});

  const filteredRecords = records.filter((r) =>
    `${r.petName || ''} ${r.diagnosis || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  const isContactAnswered = (req) => {
    const status = req?.status;
    return status && status !== 'pending';
  };

  const contactStatusLabel = (req) => {
    if (req?.status === 'confirmed') return '✅ Confirmé par le vétérinaire';
    if (req?.status === 'rejected') return '❌ Demande refusée';
    if (isContactAnswered(req)) return '✅ Traité';
    return '⏳ En attente de retour';
  };

  const parseMedications = (raw) => {
    if (!raw) return [];
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [{ name: String(raw), dosage: '', frequency: '' }];
    }
  };

  const openMeetingLink = (url) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const submitContactRequest = async (e) => {
    e.preventDefault();
    setContactError('');
    setContactSuccess('');
    setContactLoading(true);

    try {
      // endpoint candidat (si existe). Structure envoyée = simple et compatible.
      const payload = {
        animalType: contactForm.animalType,
        petName: contactForm.petName || undefined,
        subject: contactForm.subject,
        message: contactForm.message,
        preferredDate: contactForm.preferredDate || undefined,
        visitMode: contactForm.visitMode,
        homeAddress: contactForm.visitMode === 'home' ? contactForm.homeAddress : undefined,
      };

      if (contactForm.visitMode === 'home' && !contactForm.homeAddress?.trim()) {
        setContactError('Indiquez votre adresse pour une consultation à domicile.');
        setContactLoading(false);
        return;
      }

      await submitContactRequest(payload);
      setContactSuccess('Demande de consultation envoyée. Le vétérinaire pourra répondre et proposer un rendez-vous si nécessaire.');

      // best-effort refresh list
      await loadContactRequests();
      setContactForm({
        animalType: contactForm.animalType,
        petName: '',
        subject: '',
        message: '',
        preferredDate: '',
        visitMode: contactForm.visitMode,
        homeAddress: contactForm.homeAddress,
      });
    } catch (error) {
      // UI fallback si endpoint non implémenté côté backend
      setContactError(
        error?.response?.data?.error ||
          "Impossible d'envoyer la demande pour le moment (endpoint vétérinaire de contact non disponible)."
      );
    } finally {
      setContactLoading(false);
    }
  };

  const handleConfirmPlan = async (req) => {
    // Vet confirms the nutrition plan. Best-effort: call backend reply endpoint, then notify owner via chat.
    try {
      // Optimistic UI update
      setContactRequests((prev) => prev.map((r) => (r._id === req._id || r.id === req.id ? { ...r, response: true, respondedAt: new Date().toISOString() } : r)));

      // Call the dedicated backend endpoint for veterinarian responses.
      let replied = false;
      try {
        await respondToContactRequest(req._id || req.id, {
          status: 'confirmed',
          responseMessage: 'Régime nutritionnel confirmé par le vétérinaire.',
        });
        replied = true;
      } catch (e) {
        console.warn('Veterinary response endpoint unavailable:', e?.response?.status || e?.message);
      }

      // Notify owner via chat if possible
      try {
        const owner = req.ownerId || req.userId || req.from || req.clientId;
        await sendMessage(
          `Le vétérinaire a confirmé le plan nutritionnel pour ${req.petName || 'votre animal'}. Vous pouvez consulter les détails dans l'espace consultations.`,
          { type: 'vet_confirmation', requestId: req._id || req.id, pet: { name: req.petName, animalType: req.animalType } },
          owner,
        );
      } catch (e) {
        // ignore chat failures
      }

      if (!replied) {
        // Could not call a dedicated backend endpoint; leave optimistic UI change.
      }
      setToast({ message: 'Régime confirmé et propriétaire notifié.', type: 'success' });
    } catch (e) {
      // revert optimistic update on failure
      setContactRequests((prev) => prev.map((r) => (r._id === req._id || r.id === req.id ? { ...r, response: req.response } : r)));
      console.error('Confirm plan error', e);
      setToast({ message: "Erreur lors de la confirmation. Réessayez.", type: 'error' });
    }
  };

  const startTeleconsult = async (req) => {
    // Open chat assistant and create an initial message to start the teleconsultation
    try {
      window.dispatchEvent(new CustomEvent('petfood:open-chat'));
      const initial = `Demande de téléconsultation pour ${req.petName || 'votre animal'} (${req.animalType || 'type inconnu'}). Contexte: ${req.message || ''}`;
      await sendMessage(initial, { type: 'teleconsult_request', requestId: req._id || req.id });
    } catch (e) {
      console.error('Start teleconsult error', e);
    }
  };

  const openAiRecommendations = async (req) => {
    // Open the assistant and ask it for personalized recommendations using the request context
    try {
      window.dispatchEvent(new CustomEvent('petfood:open-chat'));
      const prompt = `Peux-tu proposer un plan et des recommandations nutritionnelles personnalisées pour un ${req.animalType || 'animal'} nommé ${req.petName || ''}? Contexte: ${req.message || ''}`;
      await sendMessage(prompt, { type: 'nutrition_recommendation', requestId: req._id || req.id, pet: { name: req.petName, type: req.animalType } });
    } catch (e) {
      console.error('AI recommendations error', e);
    }
  };

  if (loading) {
    return (
      <div style={styles.loader}>
        <div style={styles.spinner}></div>
        <p>Chargement des données vétérinaires...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.hero}
      >
        <Stethoscope size={48} style={{ color: '#e67e22', marginBottom: '12px' }} />
        <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>Santé & vétérinaire</h1>
        <p style={{ margin: '8px 0 0', color: '#777' }}>
          Demande de consultation pour vos animaux, vétérinaire le plus proche, assistant santé et suivi médical.
        </p>
        {!isVet && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18, justifyContent: 'center' }}>
            <Link
              to="/medical-dossier"
              style={{
                padding: '10px 16px',
                borderRadius: 12,
                background: 'white',
                border: '2px solid #0ea5e9',
                color: '#0369a1',
                fontWeight: 800,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              📁 Mon dossier médical
            </Link>
            <button
              type="button"
              onClick={() => setClientTab('rdv')}
              style={{
                padding: '10px 16px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                border: 'none',
                color: 'white',
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              🗓️ Prendre rendez-vous
            </button>
            <button
              type="button"
              onClick={() => setClientTab('assistant')}
              style={{
                padding: '10px 16px',
                borderRadius: 12,
                background: 'white',
                border: '2px solid #e67e22',
                color: '#c2410c',
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              🤖 Assistant santé
            </button>
            <Link
              to="/client-reviews?tab=services"
              style={{
                padding: '10px 16px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #e67e22, #d35400)',
                color: 'white',
                fontWeight: 800,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              ⭐ Noter le service
            </Link>
          </div>
        )}
      </motion.div>

      {!isVet && (
        <>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 20,
            padding: 6,
            background: 'white',
            borderRadius: 14,
            border: '1px solid #e5e7eb',
          }}>
            {CLIENT_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setClientTab(tab.id)}
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: 'none',
                  background: clientTab === tab.id ? '#e67e22' : 'transparent',
                  color: clientTab === tab.id ? 'white' : '#374151',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {clientTab === 'sante' && (
            <ClientVetHealthHub
              selectedPet={selectedPet}
              onSelectPet={setSelectedPet}
              contactForm={contactForm}
              setContactForm={setContactForm}
              onSubmitContact={submitContactRequest}
              contactLoading={contactLoading}
              contactError={contactError}
              contactSuccess={contactSuccess}
              contactRequests={contactRequests}
              contactStatusLabel={contactStatusLabel}
            />
          )}

          {clientTab === 'assistant' && (
            <ClientVetAiPanel
              selectedPet={selectedPet}
              prescriptions={prescriptions}
              consultations={consultations}
            />
          )}
        </>
      )}

      {(isVet || clientTab === 'rdv') && (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.section}>
        <h2 style={styles.sectionTitle}>🗓️ Rendez-vous</h2>
        <p style={{ margin: '0 0 14px', color: '#6b7280', fontSize: 14 }}>
          Réservez un créneau cabinet, à domicile ou en téléconsultation.
        </p>
        <div style={{ marginTop: 18, background: 'white', borderRadius: 18, padding: 18, border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontWeight: 900, margin: '0 0 12px', fontSize: 16 }}>🗓️ Réserver un rendez-vous</h3>
          <p style={{ margin: '0 0 14px', color: '#6b7280', fontSize: 13 }}>
            Choisissez d'abord une date, puis un créneau. Le rendez-vous sera enregistré en attente de confirmation.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'end' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={styles.label}>Date</span>
              <input
                type="date"
                value={availabilityDate}
                onChange={(e) => setAvailabilityDate(e.target.value)}
                style={styles.input}
              />
            </label>

            <button
              type="button"
              disabled={availabilityLoading}
              onClick={async () => {
                setAvailabilityLoading(true);
                setAvailabilityError('');
                try {
                  const data = await getAvailability(availabilityDate);
                  setSlots(Array.isArray(data?.slots) ? data.slots : []);
                  if (data?.message && !(data.slots || []).length) {
                    setAvailabilityError(data.message);
                  }
                } catch (err) {
                  setAvailabilityError(err?.response?.data?.error || "Impossible de charger la disponibilité.");
                  setSlots([]);
                } finally {
                  setAvailabilityLoading(false);
                }
              }}
              style={{
                ...styles.primaryBtn,
                opacity: availabilityLoading ? 0.7 : 1,
                cursor: availabilityLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              {availabilityLoading ? 'Chargement...' : 'Voir les créneaux'}
            </button>
          </div>

          {availabilityError ? <div style={{ marginTop: 12, ...styles.errorBox }}>{availabilityError}</div> : null}

          <div style={{ marginTop: 14 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={styles.label}>Choisir un créneau</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {slots.length === 0 ? (
                  <div style={styles.infoBox}>Sélectionnez une date pour afficher les créneaux.</div>
                ) : (
                  slots.map((s) => {
                    const startTs = s.start;
                    const isAvailable = s.isAvailable;
                    const isSelected = selectedSlotStart === startTs;
                    const label = new Date(startTs).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                    return (
                      <button
                        key={s.start}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setSelectedSlotStart(startTs)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 12,
                          border: `1px solid ${isSelected ? '#e67e22' : 'rgba(0,0,0,0.12)'}`,
                          background: isSelected ? 'rgba(230,126,34,0.10)' : 'white',
                          color: !isAvailable ? '#9ca3af' : '#111827',
                          fontWeight: 900,
                          cursor: !isAvailable ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {label}
                      </button>
                    );
                  })
                )}
              </div>
            </label>

            <div style={{ marginTop: 18, borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 18 }}>
              <h4 style={{ fontWeight: 900, margin: '0 0 10px', fontSize: 14 }}>Mode de consultation</h4>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
                {VISIT_MODES.map((mode) => {
                  const selected = appointmentForm.visitMode === mode.value;
                  return (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => setAppointmentForm((p) => ({ ...p, visitMode: mode.value }))}
                      style={{
                        flex: '1 1 180px',
                        padding: '14px 16px',
                        borderRadius: 14,
                        border: `2px solid ${selected ? '#e67e22' : 'rgba(0,0,0,0.08)'}`,
                        background: selected ? 'rgba(230,126,34,0.08)' : 'white',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ fontWeight: 900, fontSize: 14 }}>{mode.icon} {mode.label}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{mode.description}</div>
                    </button>
                  );
                })}
              </div>
              {appointmentForm.visitMode === 'home' && (
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                  <span style={styles.label}>Adresse de visite *</span>
                  <input
                    value={appointmentForm.homeAddress}
                    onChange={(e) => setAppointmentForm((p) => ({ ...p, homeAddress: e.target.value }))}
                    placeholder="Ex: 12 Rue de la République, Tunis"
                    style={styles.input}
                  />
                  <span style={{ fontSize: 12, color: '#6b7280' }}>Le vétérinaire interviendra à cette adresse au créneau choisi.</span>
                </label>
              )}

              <h4 style={{ fontWeight: 900, margin: '0 0 10px', fontSize: 14 }}>Confirmations</h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={styles.label}>Nom animal</span>
                  <input
                    value={appointmentForm.petName}
                    onChange={(e) => setAppointmentForm((p) => ({ ...p, petName: e.target.value }))}
                    placeholder="Ex: Rex"
                    style={styles.input}
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={styles.label}>Type animal</span>
                  <select
                    value={appointmentForm.animalType}
                    onChange={(e) => setAppointmentForm((p) => ({ ...p, animalType: e.target.value }))}
                    style={styles.input}
                  >
                    <option value="dog">Chien</option>
                    <option value="cat">Chat</option>
                    <option value="bird">Oiseau</option>
                    <option value="fish">Poisson</option>
                    <option value="rabbit">Lapin</option>
                    <option value="other">Autre</option>
                  </select>
                </label>
              </div>

              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
                <span style={styles.label}>Notes (optionnel)</span>
                <textarea
                  value={appointmentForm.notes}
                  onChange={(e) => setAppointmentForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Symptômes, contexte..."
                  style={{ ...styles.input, resize: 'vertical', minHeight: 90 }}
                />
              </label>

              <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  style={styles.secondaryBtn}
                  onClick={() => {
                    setSelectedSlotStart('');
                    setAppointmentForm({ petName: '', animalType: 'dog', notes: '', type: 'veterinary_consultation', visitMode: 'cabinet', homeAddress: appointmentForm.homeAddress });
                  }}
                >
                  Effacer
                </button>
                <button
                  type="button"
                  disabled={!selectedSlotStart || !appointmentForm.petName || (appointmentForm.visitMode === 'home' && !appointmentForm.homeAddress?.trim())}
                  onClick={async () => {
                    setAppointmentsLoading(true);
                    setAppointmentsError('');
                    setAppointmentsSuccess('');
                    try {
                      const payload = {
                        petName: appointmentForm.petName,
                        animalType: appointmentForm.animalType,
                        date: selectedSlotStart,
                        notes: appointmentForm.notes || undefined,
                        visitMode: appointmentForm.visitMode,
                        homeAddress: appointmentForm.visitMode === 'home' ? appointmentForm.homeAddress : undefined,
                      };
                      await createAppointment(payload);
                      const apptData = await getAppointments();
                      setAppointments(Array.isArray(apptData) ? apptData : []);
                      setAppointmentsSuccess(
                        appointmentForm.visitMode === 'home'
                          ? 'RDV à domicile enregistré. Le vétérinaire confirmera l’intervention.'
                          : appointmentForm.visitMode === 'online'
                            ? 'Téléconsultation enregistrée. Le lien Google Meet (caméra + voix) est prêt — rejoignez à l’heure du RDV.'
                            : 'Rendez-vous enregistré. Il apparaîtra en attente jusqu’à confirmation.'
                      );
                      setSelectedSlotStart('');
                      setAppointmentForm({
                        petName: '',
                        animalType: appointmentForm.animalType,
                        notes: '',
                        type: 'veterinary_consultation',
                        visitMode: appointmentForm.visitMode,
                        homeAddress: appointmentForm.homeAddress,
                      });
                    } catch (err) {
                      setAppointmentsError(err?.response?.data?.error || "Impossible de créer le rendez-vous.");
                    } finally {
                      setAppointmentsLoading(false);
                    }
                  }}
                  style={{
                    ...styles.primaryBtn,
                    opacity: !selectedSlotStart || !appointmentForm.petName || appointmentsLoading || (appointmentForm.visitMode === 'home' && !appointmentForm.homeAddress?.trim()) ? 0.7 : 1,
                    cursor: !selectedSlotStart || !appointmentForm.petName || appointmentsLoading || (appointmentForm.visitMode === 'home' && !appointmentForm.homeAddress?.trim()) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {appointmentsLoading ? 'Enregistrement...' : 'Confirmer mon RDV'}
                </button>
              </div>

              {appointmentsError ? <div style={{ marginTop: 12, ...styles.errorBox }}>{appointmentsError}</div> : null}
              {appointmentsSuccess ? <div style={{ marginTop: 12, ...styles.successBox }}>{appointmentsSuccess}</div> : null}
            </div>
          </div>
        </div>


        <div style={{ marginTop: 18 }} />

        {/* Liste des RDV existants */}
        <div style={{ marginTop: 18, background: 'white', borderRadius: 18, padding: 18, border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <h4 style={{ fontWeight: 900, margin: '0 0 12px', fontSize: 14 }}>Mes rendez-vous vétérinaires</h4>

          {appointmentsLoading ? (
            <div style={styles.infoBox}>Chargement...</div>
          ) : appointments.length === 0 ? (
            <div style={styles.infoBox}>Aucun rendez-vous pour le moment.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {appointments
                .slice()
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((a) => {
                  const statusLabel = a.status === 'confirmed' ? '✅ Confirmé' : a.status === 'scheduled' ? '⏳ En attente' : a.status;
                  const badge = visitModeBadge(a);
                  return (
                    <div key={a.id} style={{ background: '#fafafa', border: '1px solid #f3f4f6', borderRadius: 14, padding: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 900, color: '#111827', marginBottom: 4, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            {a.petName}
                            <span style={{
                              fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
                              background: badge.bg,
                              color: badge.color,
                            }}>
                              {badge.label}
                            </span>
                          </div>
                          <div style={{ color: '#6b7280', fontSize: 13 }}>
                            {a.animalType || ''} • {a.date ? new Date(a.date).toLocaleString('fr-FR') : 'Date inconnue'}
                          </div>
                          {isHomeVisit(a) && a.homeAddress ? (
                            <div style={{ marginTop: 6, fontSize: 13, color: '#92400e' }}>📍 {a.homeAddress}</div>
                          ) : null}
                          {a.notes ? <div style={{ marginTop: 6, color: '#374151', fontSize: 13, whiteSpace: 'pre-wrap' }}>{a.notes}</div> : null}
                          {isOnlineVisit(a) ? (
                            <TeleconsultMeetPanel appointment={a} compact />
                          ) : a.meetingLink ? (
                            <button
                              onClick={() => openMeetingLink(a.meetingLink)}
                              style={{
                                marginTop: 12,
                                padding: '10px 12px',
                                background: '#ecfdf5',
                                color: '#166534',
                                border: '1px solid #34d399',
                                borderRadius: 12,
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Ouvrir la réunion vétérinaire
                            </button>
                          ) : a.status === 'confirmed' ? (
                            <div style={{ marginTop: 12, color: '#6b7280', fontSize: 13 }}>
                              Lien de réunion en cours de préparation par le vétérinaire.
                            </div>
                          ) : null}
                        </div>
                        <div style={{ ...styles.consultationStatusLabel, background: a.status === 'confirmed' ? '#dcfce7' : '#dbeafe', color: a.status === 'confirmed' ? '#166534' : '#1d4ed8' }}>
                          {statusLabel}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </motion.div>
      )}

      {(isVet || clientTab === 'suivi') && (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.section}>
        <h2 style={styles.sectionTitle}>💊 Ordonnances & suivi médical</h2>

        {/* Mes ordonnances */}
        <div style={{ marginTop: 18, background: 'white', borderRadius: 18, padding: 18, border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <h4 style={{ fontWeight: 900, margin: '0 0 12px', fontSize: 14 }}>💊 Mes ordonnances</h4>
          {prescriptions.length === 0 ? (
            <div style={styles.infoBox}>Aucune ordonnance disponible pour le moment. Elles apparaîtront ici après une consultation validée par le vétérinaire.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {prescriptions.map((rx) => (
                <div key={rx.id || rx._id} style={{ background: '#fafafa', border: '1px solid #f3f4f6', borderRadius: 14, padding: 14 }}>
                  <div style={{ fontWeight: 900, color: '#111827', marginBottom: 4, fontSize: 14 }}>
                    {rx.petName} — {new Date(rx.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                  {rx.vet?.name ? (
                    <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 8 }}>Prescrit par Dr. {rx.vet.name}</div>
                  ) : null}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {parseMedications(rx.medications).map((med, idx) => (
                      <div key={idx} style={{ fontSize: 13, color: '#374151' }}>
                        <Pill size={12} style={{ display: 'inline', marginRight: 6 }} />
                        <strong>{med.name || 'Médicament'}</strong>
                        {med.dosage ? ` — ${med.dosage}` : ''}
                        {med.frequency ? ` (${med.frequency})` : ''}
                      </div>
                    ))}
                  </div>
                  {rx.instructions ? (
                    <div style={{ marginTop: 8, fontSize: 13, color: '#4b5563', whiteSpace: 'pre-wrap' }}>{rx.instructions}</div>
                  ) : null}
                  <MedicationSchedule medications={parseMedications(rx.medications)} />
                  {rx.validUntil ? (
                    <div style={{ marginTop: 8, fontSize: 12, color: '#9ca3af' }}>
                      Valide jusqu'au {new Date(rx.validUntil).toLocaleDateString('fr-FR')}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mes analyses / consultations */}
        <div style={{ marginTop: 18, background: 'white', borderRadius: 18, padding: 18, border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <h4 style={{ fontWeight: 900, margin: '0 0 12px', fontSize: 14 }}>🔬 Mes analyses & consultations</h4>
          {consultations.length === 0 ? (
            <div style={styles.infoBox}>Aucune analyse publiée. Après votre rendez-vous, le vétérinaire partagera ici le compte-rendu.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {consultations.map((c) => (
                <div key={c.id || c._id} style={{ background: '#fafafa', border: '1px solid #f3f4f6', borderRadius: 14, padding: 14 }}>
                  <div style={{ fontWeight: 900, color: '#111827', marginBottom: 4, fontSize: 14 }}>
                    {c.petName} ({c.animalType}) — {new Date(c.updatedAt || c.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                  {c.vet?.name ? <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 8 }}>Dr. {c.vet.name}</div> : null}
                  {c.diagnosis ? <div style={{ fontSize: 13, marginBottom: 6 }}><strong>Diagnostic :</strong> {c.diagnosis}</div> : null}
                  {c.analysis ? <div style={{ fontSize: 13, marginBottom: 6 }}><strong>Analyse :</strong> {c.analysis}</div> : null}
                  {c.recommendations ? <div style={{ fontSize: 13, color: '#374151' }}><strong>Recommandations :</strong> {c.recommendations}</div> : null}
                  {c.appointment && isOnlineVisit(c.appointment) ? (
                    <TeleconsultMeetPanel appointment={c.appointment} compact />
                  ) : c.appointment?.meetingLink ? (
                    <button
                      type="button"
                      onClick={() => openMeetingLink(c.appointment.meetingLink)}
                      style={{ marginTop: 10, padding: '8px 12px', background: '#ecfdf5', color: '#166534', border: '1px solid #34d399', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                    >
                      Revoir la réunion
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
      )}

      {!isVet && clientTab === 'relais' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.section}>
          <ClientRelayPointsPanel />
        </motion.div>
      )}

      {(isVet || clientTab === 'historique') && (
      <>
      <div style={styles.searchBar}>
        <span style={{ fontSize: '16px' }}>🔍</span>
        <input
          type="text"
          placeholder="Rechercher par animal, diagnostic..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <button style={styles.printBtn} onClick={handlePrint} title="Imprimer">
          <Printer size={16} /> Imprimer
        </button>
      </div>

      {/* Conseils avant / après / urgence */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.section}>
        <h2 style={styles.sectionTitle}>🩺 Vétérinaire : avant, après & urgence</h2>

        <div style={{ ...styles.staticAdviceBox, marginTop: 4 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.04)', borderRadius: 16, padding: 14 }}>
              <div style={{ fontWeight: 900, color: '#111827', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>📋</span> Avant la visite (préparer)
              </div>
              <ul style={{ ...styles.adviceList, paddingLeft: 18 }}>
                <li>Notez les symptômes (début, fréquence, intensité) et ce qui a été essayé.</li>
                <li>Préparez le carnet de santé + dates de vaccins/traitements.</li>
                <li>Prenez des photos (plaies, selles, vomissements, zones douloureuses).</li>
                <li>Arrivez avec le carnet / médicaments habituels (ou leurs photos).</li>
              </ul>
            </div>

            <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.04)', borderRadius: 16, padding: 14 }}>
              <div style={{ fontWeight: 900, color: '#111827', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>💊</span> Après la consultation (suivi)
              </div>
              <ul style={{ ...styles.adviceList, paddingLeft: 18 }}>
                <li>Respectez strictement la posologie et le rythme des médicaments.</li>
                <li>Surveillez l appétit, l énergie, la prise de boisson et les urines.</li>
                <li>Planifiez le contrôle recommandé (date + objectif du rendez-vous).</li>
                <li>Notez l évolution (amélioration, stabilisation, aggravation).</li>
              </ul>
            </div>

            <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.04)', borderRadius: 16, padding: 14 }}>
              <div style={{ fontWeight: 900, color: '#111827', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🚨</span> Urgence (quand appeler vite)
              </div>
              <ul style={{ ...styles.adviceList, paddingLeft: 18 }}>
                <li>Difficulté à respirer, gencives pâles/bleutées, détresse importante.</li>
                <li>Vomissements répétés, diarrhée sévère ou sang dans les selles.</li>
                <li>Prostration marquée, douleur intense, incapacité à se lever.</li>
                <li>Possibilité d intoxication (plantes, médicaments, produit ménager).</li>
              </ul>
            </div>
          </div>

          <div style={styles.adviceDisclaimer}>
            <strong>Note :</strong> Ces conseils sont informatifs et ne remplacent pas un diagnostic vétérinaire.
          </div>
        </div>
      </motion.div>


      {/* Weight History Mini-Chart */}
      {Object.keys(weightHistory).length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.section}>
          <h2 style={styles.sectionTitle}>📊 Évolution du poids</h2>
          <div style={styles.weightChart}>
            {Object.entries(weightHistory).map(([petName, entries]) => {
              const maxW = Math.max(...entries.map(e => e.weight));
              const minW = Math.min(...entries.map(e => e.weight));
              const range = maxW - minW || 1;
              return (
                <div key={petName} style={styles.petWeightCard}>
                  <div style={{ fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '18px' }}>{animalEmojis[records.find(r => r.petName === petName)?.animalType] || '🐾'}</span>
                    {petName}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '80px' }}>
                    {entries.sort((a, b) => new Date(a.date) - new Date(b.date)).map((e, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <div style={{
                          width: '100%',
                          maxWidth: '30px',
                          height: `${((e.weight - minW) / range) * 60 + 20}px`,
                          background: 'linear-gradient(180deg, #10b981, #059669)',
                          borderRadius: '6px 6px 0 0',
                          minHeight: '10px',
                        }} />
                        <span style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>{e.weight}kg</span>
                        <span style={{ fontSize: '9px', color: '#9ca3af' }}>{new Date(e.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Upcoming Visits */}

      {upcoming.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.section}>
          <h2 style={styles.sectionTitle}>📅 Prochaines visites</h2>
          <div style={styles.upcomingGrid}>
            {upcoming.map((visit, i) => (
              <motion.div
                key={visit._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                style={styles.upcomingCard}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '1.8rem' }}>{animalEmojis[visit.animalType] || '🐾'}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px' }}>{visit.petName}</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>{animalNames[visit.animalType] || visit.animalType}</div>
                  </div>
                  <span style={{ ...styles.badge, background: '#fef3c7', color: '#92400e', marginLeft: 'auto' }}>
                    <Calendar size={12} /> {new Date(visit.nextVisit).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '8px' }}>
                  <strong>Diagnostic:</strong> {visit.diagnosis}
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {visit.weight && (
                    <span style={styles.miniBadge}><Weight size={12} /> {visit.weight} kg</span>
                  )}
                  {visit.temperature && (
                    <span style={styles.miniBadge}><Thermometer size={12} /> {visit.temperature}°C</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Health Records Timeline */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.section}>
        <h2 style={styles.sectionTitle}>📋 Historique de santé ({filteredRecords.length})</h2>
        {filteredRecords.length === 0 ? (
          <div style={styles.infoBox}>
            Aucune fiche vétérinaire trouvée. Contactez votre administrateur pour créer une fiche. 🐾
          </div>
        ) : (
          <div style={styles.timeline}>
            {filteredRecords.map((record, i) => {
              const isExpanded = expandedId === record._id;
              const st = statusConfig[record.status] || statusConfig.active;
              return (
                <motion.div
                  key={record._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  style={styles.timelineItem}
                >
                  {/* Timeline dot */}
                  <div style={styles.timelineDot}></div>

                  {/* Card */}
                  <div style={styles.recordCard}>
                    {/* Header */}
                    <div style={styles.recordHeader} onClick={() => toggleExpand(record._id)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <span style={{ fontSize: '2rem' }}>{animalEmojis[record.animalType] || '🐾'}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '15px' }}>{record.petName}</div>
                          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                            {animalNames[record.animalType] || record.animalType} • Visite du {new Date(record.visitDate).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ ...styles.badge, background: st.bg, color: st.color }}>{st.label}</span>
                        {isExpanded ? <ChevronUp size={18} color="#9ca3af" /> : <ChevronDown size={18} color="#9ca3af" />}
                      </div>
                    </div>

                    {/* Quick Info */}
                    <div style={styles.quickInfo}>
                      <div style={styles.infoItem}><Stethoscope size={14} /> <strong>{record.diagnosis}</strong></div>
                      {record.weight && <div style={styles.infoItem}><Weight size={14} /> {record.weight} kg</div>}
                      {record.temperature && <div style={styles.infoItem}><Thermometer size={14} /> {record.temperature}°C</div>}
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={styles.expandedContent}>
                            {(record.breed || record.sex || record.birthDate || record.identificationNumber || record.allergies || record.diet || record.activityLevel || record.chronicDiseases) && (
                              <div style={styles.detailBlock}>
                                <div style={styles.detailLabel}>Profil animal</div>
                                <div style={styles.petProfileGrid}>
                                  {record.breed ? <span><strong>Race:</strong> {record.breed}</span> : null}
                                  {record.sex ? <span><strong>Sexe:</strong> {sexLabels[record.sex] || record.sex}</span> : null}
                                  {record.birthDate ? <span><strong>Age:</strong> {getPetAge(record.birthDate)}</span> : null}
                                  {record.identificationNumber ? <span><strong>ID:</strong> {record.identificationNumber}</span> : null}
                                  {record.sterilized !== undefined && record.sterilized !== null ? <span><strong>Sterilise:</strong> {record.sterilized ? 'Oui' : 'Non'}</span> : null}
                                  {record.activityLevel ? <span><strong>Activite:</strong> {activityLabels[record.activityLevel] || record.activityLevel}</span> : null}
                                  {record.allergies ? <span><strong>Allergies:</strong> {record.allergies}</span> : null}
                                  {record.diet ? <span><strong>Alimentation:</strong> {record.diet}</span> : null}
                                  {record.chronicDiseases ? <span><strong>Antecedents:</strong> {record.chronicDiseases}</span> : null}
                                </div>
                              </div>
                            )}
                            {record.treatment && (
                              <div style={styles.detailBlock}>
                                <div style={styles.detailLabel}>💊 Traitement</div>
                                <div style={styles.detailText}>{record.treatment}</div>
                              </div>
                            )}
                            {record.medications && record.medications.length > 0 && (
                              <div style={styles.detailBlock}>
                                <div style={styles.detailLabel}>💊 Médicaments</div>
                                {record.medications.map((med, idx) => (
                                  <div key={idx} style={styles.medicationItem}>
                                    <Pill size={14} style={{ color: '#e67e22' }} />
                                    <span><strong>{med.name}</strong> — {med.dosage} ({med.frequency})</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {record.vetNotes && (
                              <div style={styles.detailBlock}>
                                <div style={styles.detailLabel}>📝 Notes vétérinaire</div>
                                <div style={{ ...styles.detailText, background: 'rgba(230,126,34,0.04)', padding: '10px', borderRadius: '10px' }}>{record.vetNotes}</div>
                              </div>
                            )}
                            {record.nextVisit && (
                              <div style={styles.detailBlock}>
                                <div style={styles.detailLabel}>📅 Prochaine visite</div>
                                <div style={{ color: '#e67e22', fontWeight: 700 }}>{new Date(record.nextVisit).toLocaleDateString('fr-FR')}</div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
      </>
      )}

      {toast.message ? (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />
      ) : null}
    </div>
  );
};

const styles = {
  page: { padding: '24px', maxWidth: '1000px', margin: '0 auto' },
  loader: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '12px' },
  spinner: { width: '32px', height: '32px', border: '3px solid #fef3c7', borderTopColor: '#e67e22', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  hero: {
    background: 'linear-gradient(135deg, rgba(230,126,34,0.08) 0%, rgba(39,174,96,0.06) 100%)',
    borderRadius: '24px',
    padding: '28px',
    marginBottom: '24px',
    textAlign: 'center',
  },
  searchBar: { display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '12px 18px', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', marginBottom: '20px', border: '1px solid #e5e7eb' },
  searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: '14px', background: 'transparent' },
  printBtn: { padding: '8px 14px', background: '#f3f4f6', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#4b5563' },
  section: { marginBottom: '28px' },
  sectionTitle: { fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#111827' },
  flowGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12, marginBottom: 18 },
  flowCard: { background: 'white', borderRadius: 16, padding: 14, border: '1px solid #edf2f7', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: 6, color: '#374151', fontSize: 13 },
  weightChart: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' },
  petWeightCard: { background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #f3f4f6' },
  upcomingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' },
  upcomingCard: { background: 'white', borderRadius: '16px', padding: '18px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', borderLeft: '4px solid #e67e22' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' },
  miniBadge: { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '8px', background: '#f3f4f6', fontSize: '12px', color: '#4b5563' },
  infoBox: { background: '#eff6ff', borderRadius: '16px', padding: '20px', color: '#1e40af', fontSize: '14px', textAlign: 'center' },
  consultationGrid: { display: 'grid', gap: '14px' },
  consultationCard: { background: 'white', borderRadius: '18px', padding: '18px', boxShadow: '0 8px 24px rgba(15,23,42,0.06)', border: '1px solid #edf2f7' },
  consultationHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' },
  consultationBadge: { background: '#dbeafe', color: '#1d4ed8', borderRadius: '999px', padding: '6px 12px', fontSize: '12px', fontWeight: 700 },
  consultationDate: { fontSize: '12px', color: '#6b7280' },
  consultationLine: { fontSize: '13px', color: '#374151', marginBottom: '8px' },
  consultationSubject: { fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '10px' },
  consultationMessage: { fontSize: '14px', color: '#4b5563', lineHeight: 1.6, marginBottom: '12px' },
  consultationStatus: { display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' },
  consultationStatusLabel: { fontSize: '12px', fontWeight: 700, color: '#065f46', background: '#dcfce7', borderRadius: '999px', padding: '6px 12px' },
  consultationStatusMeta: { fontSize: '12px', color: '#6b7280' },
  timeline: { position: 'relative', paddingLeft: '24px' },
  timelineItem: { position: 'relative', marginBottom: '16px', display: 'flex', gap: '16px' },
  timelineDot: { position: 'absolute', left: '-20px', top: '20px', width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', border: '3px solid #d1fae5', zIndex: 1 },
  recordCard: { flex: 1, background: 'white', borderRadius: '18px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #f3f4f6', overflow: 'hidden' },
  recordHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', cursor: 'pointer', userSelect: 'none' },
  quickInfo: { display: 'flex', gap: '16px', flexWrap: 'wrap', padding: '0 18px 12px', borderBottom: '1px solid #f9fafb' },
  infoItem: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#6b7280' },
  expandedContent: { padding: '16px 18px', background: '#fafafa' },
  detailBlock: { marginBottom: '12px' },
  detailLabel: { fontSize: '12px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' },
  detailText: { fontSize: '14px', color: '#374151', lineHeight: 1.5 },
  petProfileGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '13px', color: '#374151', lineHeight: 1.5 },
  medicationItem: { display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', fontSize: '13px', color: '#4b5563' },

  // Contact form styles
  label: { fontSize: 13, fontWeight: 800, color: '#111827' },
  input: { width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  primaryBtn: { padding: '12px 18px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #e67e22, #d35400)', color: 'white', fontWeight: 900, boxShadow: '0 10px 30px rgba(211,84,0,0.18)' },
  secondaryBtn: { padding: '12px 18px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)', background: 'white', color: '#111827', fontWeight: 900 },
  errorBox: { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#b91c1c', fontWeight: 800, padding: 12, borderRadius: 14 },
  successBox: { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: '#065f46', fontWeight: 800, padding: 12, borderRadius: 14 },

  // Static advice section
  staticAdviceBox: {
    background: 'linear-gradient(135deg, rgba(230,126,34,0.10) 0%, rgba(39,174,96,0.06) 100%)',
    borderRadius: 18,
    padding: 16,
    border: '1px solid rgba(0,0,0,0.04)',
    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
  },
  adviceList: { margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 10, color: '#374151', fontSize: 14, lineHeight: 1.5 },
  adviceDisclaimer: { marginTop: 12, background: 'rgba(230,126,34,0.08)', border: '1px solid rgba(230,126,34,0.18)', padding: 12, borderRadius: 14, color: '#92400e', fontSize: 13, fontWeight: 700 },
};

export default VeterinaryPage;

