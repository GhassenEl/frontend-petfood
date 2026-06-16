import React, { useState, useEffect } from 'react';
import { X, MapPin, Camera } from 'lucide-react';

const overlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
  zIndex: 2000,
};

const card = {
  background: 'white',
  borderRadius: 20,
  padding: 24,
  width: '100%',
  maxWidth: 440,
  maxHeight: '90vh',
  overflow: 'auto',
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
};

const DeliveryProofModal = ({ orderId, orderLabel, onClose, onComplete }) => {
  const [note, setNote] = useState('');
  const [photoName, setPhotoName] = useState('');
  const [geo, setGeo] = useState(null);
  const [geoError, setGeoError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      () => setGeoError('Géolocalisation indisponible — confirmez manuellement.'),
      { timeout: 8000, maximumAge: 60000 },
    );
  }, []);

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      await onComplete({
        deliveryNote: note.trim() || undefined,
        proofGeo: geo || undefined,
        proofPhotoName: photoName || undefined,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Échec de la clôture');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlay} onClick={onClose} role="presentation">
      <div style={card} onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="delivery-proof-title">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 id="delivery-proof-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
            Confirmer la livraison
          </h2>
          <button type="button" onClick={onClose} style={iconBtn} aria-label="Fermer">
            <X size={20} />
          </button>
        </div>

        <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: 14 }}>
          Commande {orderLabel || `#${String(orderId).slice(-6)}`} — confirmez la remise au client.
        </p>

        <div style={{ marginBottom: 14, padding: '10px 12px', background: geo ? '#ecfdf5' : '#fffbeb', borderRadius: 10, fontSize: 13 }}>
          <MapPin size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          {geo
            ? `Position capturée (±${Math.round(geo.accuracy || 0)} m)`
            : geoError || 'Capture géolocalisation…'}
        </div>

        <label style={labelStyle}>
          Photo preuve (optionnel)
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => setPhotoName(e.target.files?.[0]?.name || '')}
            style={{ ...inputStyle, padding: 8 }}
          />
          {photoName && (
            <span style={{ fontSize: 12, color: '#059669', marginTop: 4 }}>
              <Camera size={12} style={{ verticalAlign: 'middle' }} /> {photoName}
            </span>
          )}
        </label>

        <label style={labelStyle}>
          Note (optionnel)
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Remis au gardien, code porte 4521…"
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </label>

        {error && (
          <p style={{ color: '#b91c1c', fontSize: 13, margin: '0 0 12px', padding: '10px 12px', background: '#fef2f2', borderRadius: 10 }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={onClose} style={btnSecondary} disabled={loading}>
            Annuler
          </button>
          <button type="button" onClick={submit} style={btnPrimary} disabled={loading}>
            {loading ? 'Validation…' : 'Confirmer livraison'}
          </button>
        </div>
      </div>
    </div>
  );
};

const labelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontSize: 13,
  fontWeight: 700,
  color: '#374151',
  marginBottom: 14,
};

const inputStyle = {
  padding: '12px 14px',
  borderRadius: 12,
  border: '2px solid #e5e7eb',
  fontSize: 15,
  fontWeight: 600,
  outline: 'none',
};

const iconBtn = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 4,
  color: '#64748b',
};

const btnPrimary = {
  flex: 1,
  padding: '14px 16px',
  background: '#059669',
  color: 'white',
  border: 'none',
  borderRadius: 12,
  fontWeight: 700,
  cursor: 'pointer',
};

const btnSecondary = {
  padding: '14px 16px',
  background: '#f1f5f9',
  color: '#334155',
  border: 'none',
  borderRadius: 12,
  fontWeight: 700,
  cursor: 'pointer',
};

export default DeliveryProofModal;
