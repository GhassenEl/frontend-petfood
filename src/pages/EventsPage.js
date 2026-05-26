import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Edit, Trash2, Calendar, Clock, Tag, User, Info, XCircle, Star, MessageSquare } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext.jsx';

const EventsPage = () => {
  const { user } = useAuth(); // Get user to check role
  const isAdmin = user?.role === 'admin';
  const userId = user?.id || user?._id;
  // UI events (backend peut garder le nom appointments)

  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',

    // type d’événement (anniversaire, compétition, …)
    eventType: 'autre',

    // type d’animal (dog/cat/other) attendu par le backend
    animalType: 'other',

    petName: '',
    ownerId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [editingAppointment, setEditingAppointment] = useState(null); // For update operation

  // View mode for clients: 'mine' = my events, 'platform' = all public/platform events
  const [viewMode, setViewMode] = useState('mine');


  // Review specific states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  const eventTypes = [
    { value: 'autre', label: 'Autre' },
    { value: 'anniversaire', label: 'Anniversaire' },
    { value: 'competitions', label: 'Compétition' },
    { value: 'salle de sport', label: 'Salle de sport' },
    { value: 'coiffure', label: 'Coiffure' },
    // Add more types as needed
  ];

  const animalTypes = [
    { value: 'dog', label: 'Chien' },
    { value: 'cat', label: 'Chat' },
    { value: 'other', label: 'Autre' },
  ];

  const getEventTypeLabel = (value) =>
    eventTypes.find((type) => type.value === value)?.label || value || 'Autre';

  const getAnimalTypeLabel = (value) =>
    animalTypes.find((t) => t.value === value)?.label || value || 'Autre';

  const getEventTitle = (event) =>
    event.title || event.petName || getEventTypeLabel(event.type);

  useEffect(() => {
    // Hard guard: fermer le formulaire et annuler l'édition quand on n'est pas admin.
    if (!isAdmin) {
      setShowCreateForm(false);
      setEditingAppointment(null);
    }

    // Always try to fetch appointments when auth user exists.
    // In demo mode, the token payload may not provide the same id field shape.
    // Backend/middleware will still handle demo data generation.
    if (!user) return;
    fetchAppointments();
  }, [user, isAdmin]);


  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      // Backend may expose /veterinary/appointments for both clients and admins.
      // For admin we try the dedicated all endpoint first, then fall back to the standard route.
      // For clients, respect `viewMode`: 'mine' -> their appointments, 'platform' -> attempt to fetch all public events.
      let primaryEndpoint;
      const fallbackEndpoint = '/veterinary/appointments';
      if (isAdmin) {
        primaryEndpoint = '/veterinary/appointments/all';
      } else if (viewMode === 'platform') {
        primaryEndpoint = '/veterinary/appointments/all';
      } else {
        primaryEndpoint = '/veterinary/appointments';
      }

      let res;
      try {
        res = await api.get(primaryEndpoint);
      } catch (err) {
        const status = err?.response?.status;
        if (status === 404 && primaryEndpoint !== fallbackEndpoint) {
          res = await api.get(fallbackEndpoint);
        } else {
          throw err;
        }
      }

      console.log("Données reçues de l'API Events:", res.data);


      const data = Array.isArray(res.data)
        ? res.data
        : (res.data?.appointments || res.data?.data || []);

      // Backend peut retourner un objet ({ appointments: [...] }) ou directement un array.
      // Certains chemins peuvent aussi renvoyer un objet vide : normaliser en array.
      const normalized = Array.isArray(data) ? data : [];
      setAppointments(normalized);


      // Important: on considère une liste vide comme un état valide (pas un 404)
      // car le frontend affiche déjà un message dédié quand appointments.length === 0.
      // Certaines configs backend peuvent retourner 404 "Record not found" même quand
      // l'UI doit simplement afficher "aucun événement".
    } catch (err) {
      console.error('Error fetching appointments:', err);
      const status = err.response?.status;
      const backendMsg = err.response?.data?.error || err.response?.data?.message;

      // Treat 404 as empty list for this screen
      if (status === 404) {
        setAppointments([]);
        setError('');
      } else {
        const details = [
          status ? `HTTP ${status}` : null,
          backendMsg ? `- ${backendMsg}` : null,
        ].filter(Boolean).join(' ');
        const msg = details
          ? `Erreur lors du chargement des événements. ${details}`
          : 'Erreur lors du chargement des événements.';
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper to switch client view mode and reload appointments
  const switchViewMode = (mode) => {
    if (mode === viewMode) return;
    setViewMode(mode);
    // small delay to ensure state applied before fetch (not strictly necessary)
    setTimeout(() => fetchAppointments(), 50);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      eventType: 'autre',
      animalType: 'other',
      petName: '',
      ownerId: '',
    });
    setEditingAppointment(null);
    setSubmitError('');
    setSubmitSuccess('');
  };

  const handleCreateOrUpdateAppointment = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setSubmitError('Action réservée à l\'administrateur.');
      return;
    }


    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const payload = {
        date: `${formData.date}T${formData.time}:00.000Z`,
        animalType: formData.animalType || 'other',
        petName: formData.petName || 'N/A',
        notes: formData.description || null,
        type: formData.eventType || 'autre',
      };
      if (isAdmin) {
        if (formData.ownerId) {
          payload.ownerId = formData.ownerId;
        } else if (editingAppointment?.ownerId) {
          payload.ownerId = editingAppointment.ownerId;
        } else if (editingAppointment?.owner?.id) {
          payload.ownerId = editingAppointment.owner.id;
        } else if (editingAppointment?.owner?._id) {
          payload.ownerId = editingAppointment.owner._id;
        }
      }


      const appointmentId = editingAppointment?._id || editingAppointment?.id;
      if (!appointmentId && editingAppointment) {
        throw new Error('Identifiant d\'événement manquant (update)');
      }

      if (editingAppointment) {
        // Update existing appointment
        await api.put(`/veterinary/appointments/${appointmentId}`, payload);
        setSubmitSuccess('Événement mis à jour avec succès !');
      } else {
        // Create new appointment
        await api.post('/veterinary/appointments', payload);
        setSubmitSuccess('Événement ajouté avec succès !');
      }

      
      resetForm();
      setShowCreateForm(false);
      fetchAppointments(); // Refresh list
    } catch (err) {
      console.error('Submit appointment error:', err);
      setSubmitError(err.response?.data?.message || 'Erreur lors de la soumission de l\'événement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (appointment) => {
    if (!isAdmin) return;
    setEditingAppointment(appointment);
    const eventDate = new Date(appointment.date);

    const dateString = eventDate.toISOString().split('T')[0];
    const timeString = eventDate.toTimeString().split(' ')[0].substring(0, 5);

      setFormData({
      title: appointment.title || '',
      description: appointment.notes || appointment.description || '',
      date: dateString,
      time: timeString,
      eventType: appointment.type || 'autre',
      animalType: appointment.animalType || 'other',
      petName: appointment.petName || '',
      ownerId: appointment.ownerId || appointment.owner?.id || appointment.owner?._id || '',
    });
    setShowCreateForm(true);
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;
    if (!id) return;

    try {
      await api.delete(`/veterinary/appointments/${id}`);
      setSubmitSuccess('Événement supprimé avec succès !');
      fetchAppointments(); // Refresh list

    } catch (err) {
      console.error('Delete appointment error:', err);
      setSubmitError('Erreur lors de la suppression de l\'événement.');
    }
  };

  const handleReviewSubmit = async (e) => {
    if (!selectedEventId) {
      setSubmitError('Événement introuvable pour envoyer l\'avis.');
      setReviewLoading(false);
      return;
    }

    e.preventDefault();
    setReviewLoading(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      // Backend: endpoint générique /api/reviews attend productId.
      // Pour les événements, on mappe l'id de l'appointment vers productId et envoie type='event'.
      // Guard: éviter un POST si selectedEventId est invalide.
      const safeEventId = selectedEventId || (typeof selectedEventId === 'number' ? String(selectedEventId) : null);
      if (!safeEventId) {
        setSubmitError('Événement introuvable pour envoyer l\'avis.');
        return;
      }

      await api.post('/api/reviews', {
        productId: safeEventId,
        rating: Number(reviewData.rating),
        comment: reviewData.comment,
        type: 'event',
      });

      setSubmitSuccess('Merci pour votre avis !');
      setShowReviewForm(false);
      setReviewData({ rating: 5, comment: '' });
    } catch (err) {
      setSubmitError('Erreur lors de l\'envoi de l\'avis.');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div style={{ fontSize: '3rem', animation: 'float 2s ease-in-out infinite' }}>🐾</div>
        <p style={{ color: '#888' }}>Chargement des événements...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <p style={{ color: '#dc2626', fontWeight: 600 }}>{error}</p>
        <button onClick={fetchAppointments} style={{ padding: '12px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
          🔄 Réessayer
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: 'center',
          marginBottom: '32px',
          padding: '40px 24px',
          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
          borderRadius: '24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#065f46', margin: '0 0 8px' }}>
          📅 Mes Événements
        </h1>
      <p style={{ fontSize: '16px', color: '#6b7280', margin: '0 0 20px' }}>
          Gérez vos anniversaires, cadeaux, compétitions et autres événements
        </p>

        {isAdmin && (
          <button
            onClick={() => { setShowCreateForm(!showCreateForm); resetForm(); }}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #3498db, #2980b9)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '14px',
              boxShadow: '0 4px 14px rgba(52,152,219,0.3)',
            }}
          >
            <PlusCircle size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            {showCreateForm ? 'Annuler' : 'Ajouter un événement'}
          </button>
        )}
      </motion.div>

      {submitSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#dcfce7',
            color: '#065f46',
            padding: '12px 20px',
            borderRadius: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Info size={20} /> {submitSuccess}
        </motion.div>
      )}

      {submitError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#fee2e2',
            color: '#dc2626',
            padding: '12px 20px',
            borderRadius: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <XCircle size={20} /> {submitError}
        </motion.div>
      )}

      {/* Review Form Modal/Section for Clients */}
      {showReviewForm && !isAdmin && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: '#fff7ed',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            marginBottom: '32px',
            border: '2px solid #fdba74',
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#9a3412', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={20} fill="#f59e0b" color="#f59e0b" /> Laisser un avis sur l'événement
          </h2>
          <form onSubmit={handleReviewSubmit}>
            <div className="form-group">
              <label>Note</label>
              <select
                value={reviewData.rating}
                onChange={(e) => setReviewData({ ...reviewData, rating: e.target.value })}
                style={{ padding: '10px', borderRadius: '10px', border: '1px solid #ddd' }}
              >
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Très bien</option>
                <option value="3">3 - Moyen</option>
                <option value="2">2 - Passable</option>
                <option value="1">1 - Mauvais</option>
              </select>
            </div>
            <div className="form-group">
              <label>Commentaire</label>
              <textarea
                value={reviewData.comment}
                onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                placeholder="Partagez votre expérience..."
                rows="3"
                required
                style={{ padding: '10px', borderRadius: '10px', border: '1px solid #ddd' }}
              ></textarea>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                disabled={reviewLoading}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'linear-gradient(135deg, #e67e22, #d35400)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 700,
                  cursor: reviewLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {reviewLoading ? 'Envoi...' : 'Envoyer mon avis'}
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                style={{ padding: '12px 20px', background: '#f3f4f6', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                Annuler
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {isAdmin && showCreateForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            marginBottom: '32px',
            border: '2px solid #e5e7eb',
          }}
        >
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#333', marginBottom: '20px' }}>
            {editingAppointment ? 'Modifier l\'événement' : 'Ajouter un nouvel événement'}
          </h2>
          <form onSubmit={handleCreateOrUpdateAppointment}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label htmlFor="petName">Nom de l'animal</label>
                <input
                  type="text"
                  id="petName"
                  name="petName"
                  value={formData.petName}
                  onChange={handleInputChange}
                  placeholder="Ex: Max"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="time">Heure</label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="eventType">Type d'événement</label>
                <select
                  id="eventType"
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleInputChange}
                  required
                >
                  {eventTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              {isAdmin && (
                <div className="form-group">
                  <label htmlFor="ownerId">ID du propriétaire (Client)</label>
                  <input
                    type="text"
                    id="ownerId"
                    name="ownerId"
                    value={formData.ownerId}
                    onChange={handleInputChange}
                    placeholder="Laisser vide pour votre ID si client"
                  />
                </div>
              )}
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '16px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                marginTop: '20px',
                boxShadow: '0 4px 14px rgba(39,174,96,0.3)',
              }}
            >
              {isSubmitting ? 'Soumission...' : (editingAppointment ? 'Modifier l\'événement' : 'Ajouter l\'événement')}
            </button>
          </form>
        </motion.div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#333', margin: 0 }}>
            Liste des événements ({appointments.length})
          </h2>
          {!isAdmin && (
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <button
                onClick={() => switchViewMode('mine')}
                style={{
                  padding: '6px 10px',
                  borderRadius: 10,
                  border: viewMode === 'mine' ? '2px solid #10b981' : '1px solid #e5e7eb',
                  background: viewMode === 'mine' ? 'rgba(16,185,129,0.08)' : 'white',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                Mes événements
              </button>
              <button
                onClick={() => switchViewMode('platform')}
                style={{
                  padding: '6px 10px',
                  borderRadius: 10,
                  border: viewMode === 'platform' ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  background: viewMode === 'platform' ? 'rgba(59,130,246,0.08)' : 'white',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                Tous les événements
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={fetchAppointments} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            🔄 Actualiser
          </button>
        </div>
      </div>

      {isAdmin && appointments.length > 0 && (
         <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px', fontStyle: 'italic' }}>
            Note: Si la liste semble incomplète, vérifiez que les `ownerId` correspondent en base de données.
         </p>
      )}

      {appointments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af', background: 'white', borderRadius: '24px', border: '2px dashed #e5e7eb' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📅</div>
          <p style={{ fontSize: '16px', fontWeight: 500 }}>Aucun événement trouvé pour le moment.</p>
          <p style={{ fontSize: '13px' }}>Les rendez-vous programmés apparaîtront ici.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {appointments.map((event) => (
            <motion.div
              key={event._id || event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '20px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                border: '1px solid #e5e7eb',
                position: 'relative',
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
                {getEventTitle(event)}
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 12px' }}>
                <strong>Animal: {event.petName}</strong> - {event.notes || event.description || 'Pas de description.'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', color: '#4b5563' }}>
                <Calendar size={16} />
                <span>
                  {(() => {
                    const d = new Date(event.date);
                    if (Number.isNaN(d.getTime())) return '—';
                    return d.toLocaleDateString('fr-FR');
                  })()}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', color: '#4b5563' }}>
                <Clock size={16} />
                <span>
                  {(() => {
                    const d = new Date(event.date);
                    if (Number.isNaN(d.getTime())) return '—';
                    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                  })()}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '14px', color: '#4b5563' }}>
                <Tag size={16} />
                <span>{getEventTypeLabel(event.type)}</span>
              </div>
              {isAdmin && event.owner && ( // Display owner info for admin
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '13px', color: '#059669', fontWeight: 600 }}>
                  <User size={16} />
                  <span>Client: {event.owner.name || event.owner.email}</span>
                </div>
              )}

              {isAdmin && (
                <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleEditClick(event)}

                    style={{
                      background: '#f39c12',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Modifier"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteAppointment(event._id || event.id)}
                    style={{
                      background: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}

              {!isAdmin && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                  <button
                    onClick={() => {
                      setSelectedEventId(event._id || event.id);
                      setShowReviewForm(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'rgba(230, 126, 34, 0.1)',
                      color: '#d35400',
                      border: '1px dashed #e67e22',
                      borderRadius: '10px',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <MessageSquare size={14} /> Laisser un avis
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsPage;
