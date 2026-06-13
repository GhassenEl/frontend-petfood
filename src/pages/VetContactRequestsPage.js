import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { DEMO_VET_CONTACT_REQUESTS, isDemoVetId, withDemoFallback } from '../utils/vetDemoData';

const STATUS_LABELS = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  rejected: 'Refusée',
};

const VetContactRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/vet/contact-requests');
      setRequests(withDemoFallback(data, DEMO_VET_CONTACT_REQUESTS));
    } catch (error) {
      console.error('Contact requests error:', error);
      setRequests(DEMO_VET_CONTACT_REQUESTS);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (req, status) => {
    setModal({ id: req.id || req._id, status, subject: req.subject });
    setResponseText(
      status === 'confirmed'
        ? 'Bonjour, votre demande a été acceptée. Nous vous recontacterons pour fixer le rendez-vous.'
        : 'Bonjour, nous ne pouvons pas traiter cette demande pour le moment.'
    );
  };

  const submitResponse = async () => {
    if (!modal) return;
    setSubmitting(true);
    const reqId = modal.id;
    try {
      await api.put(`/vet/contact-requests/${reqId}/respond`, {
        status: modal.status,
        response: responseText.trim() || undefined,
      });
      setModal(null);
      setResponseText('');
      fetchRequests();
    } catch {
      if (isDemoVetId(reqId)) {
        setRequests((prev) =>
          prev.map((r) =>
            (r.id || r._id) === reqId
              ? { ...r, status: modal.status, response: responseText.trim() }
              : r
          )
        );
        setModal(null);
        setResponseText('');
      } else {
        window.alert('Erreur lors de la réponse');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>;

  const pending = requests.filter((r) => r.status === 'pending');
  const others = requests.filter((r) => r.status !== 'pending');

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 8px' }}>📩 Demandes de contact</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>{pending.length} en attente · {requests.length} au total</p>

      {[...pending, ...others].map((req) => (
        <div
          key={req.id || req._id}
          style={{
            background: 'white',
            borderRadius: '14px',
            padding: '18px',
            marginBottom: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            borderLeft: req.status === 'pending' ? '4px solid #f59e0b' : '4px solid #10b981',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <strong>{req.subject}</strong>
              <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#666' }}>
                {req.owner?.name || 'Client'} · {req.petName || req.animalType}
              </p>
            </div>
            <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: 12, background: '#f1f5f9' }}>
              {STATUS_LABELS[req.status] || req.status}
            </span>
          </div>
          <p style={{ margin: '12px 0', color: '#444' }}>{req.message}</p>
          {req.response && (
            <p style={{ fontSize: '0.85rem', color: '#059669', marginTop: 8, fontStyle: 'italic' }}>
              Réponse : {req.response}
            </p>
          )}
          {req.preferredDate && (
            <p style={{ fontSize: '0.85rem', color: '#888' }}>
              Date souhaitée : {new Date(req.preferredDate).toLocaleDateString('fr-FR')}
            </p>
          )}
          {req.status === 'pending' && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button type="button" className="btn btn-primary" onClick={() => openModal(req, 'confirmed')}>
                Confirmer
              </button>
              <button type="button" className="btn btn-outline" onClick={() => openModal(req, 'rejected')}>
                Refuser
              </button>
            </div>
          )}
        </div>
      ))}

      {requests.length === 0 && <p style={{ color: '#888' }}>Aucune demande.</p>}

      {modal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ margin: '0 0 12px', fontSize: '1.1rem' }}>
              {modal.status === 'confirmed' ? '✅ Confirmer' : '❌ Refuser'} — {modal.subject}
            </h2>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>
              Message au client
              <textarea
                rows={5}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                style={{ width: '100%', marginTop: 6, padding: 12, borderRadius: 12, border: '1px solid #e5e7eb', boxSizing: 'border-box' }}
              />
            </label>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <button type="button" className="btn btn-outline" onClick={() => setModal(null)} disabled={submitting}>
                Annuler
              </button>
              <button type="button" className="btn btn-primary" onClick={submitResponse} disabled={submitting}>
                {submitting ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
  zIndex: 1000,
};

const modalStyle = {
  background: 'white',
  borderRadius: 20,
  padding: 24,
  width: 480,
  maxWidth: '100%',
};

export default VetContactRequestsPage;
