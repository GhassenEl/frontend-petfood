import React, { useCallback, useEffect, useState } from 'react';
import { Video, Phone, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import TeleconsultMeetPanel from '../components/TeleconsultMeetPanel';
import { isOnlineVisit } from '../constants/visitModes';
import './ModeratorPages.css';

const VetTeleconsultPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/vet/appointments');
      const list = (data || []).filter((a) => isOnlineVisit(a));
      setSessions(list);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Impossible de charger les téléconsultations');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const startCall = async (session) => {
    setBusyId(session.id);
    setError('');
    try {
      const { data: updated } = await api.post(`/vet/appointments/${session.id}/teleconsult/start`);
      setSessions((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)));
      if (updated.meetingLink) {
        window.open(updated.meetingLink, '_blank', 'noopener,noreferrer');
      } else {
        setError('Lien Google Meet indisponible — réessayez dans un instant.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Échec du démarrage de la visio');
    } finally {
      setBusyId(null);
    }
  };

  const upcoming = sessions.filter((s) => !['cancelled', 'completed'].includes(s.status));

  return (
    <div className="mod-page">
      <header className="mod-hero">
        <h1><Video size={24} /> Téléconsultations Google Meet</h1>
        <p>
          Consultations vidéo en direct avec vos clients — caméra et micro via Google Meet.
          {' '}
          <button type="button" className="mod-btn mod-btn--ghost mod-btn--sm" onClick={load} disabled={loading}>
            <RefreshCw size={14} /> Actualiser
          </button>
        </p>
      </header>

      {error ? (
        <div className="mod-card" style={{ borderColor: '#fecaca', background: '#fef2f2', color: '#b91c1c' }}>
          {error}
        </div>
      ) : null}

      <div className="mod-card">
        {loading ? <p className="mod-empty">Chargement…</p> : upcoming.length === 0 ? (
          <p className="mod-empty">
            Aucune téléconsultation planifiée. Les clients réservent un créneau « En ligne » depuis l&apos;espace vétérinaire.
          </p>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {upcoming.map((s) => (
              <li
                key={s.id}
                style={{
                  padding: '16px 0',
                  borderBottom: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <strong>{s.owner?.name || s.clientName || 'Client'}</strong>
                    <span> — {s.petName}</span>
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                      {new Date(s.date || s.scheduledAt).toLocaleString('fr-FR')}
                      {' · '}
                      {s.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                    </p>
                    {s.notes ? (
                      <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#475569' }}>{s.notes}</p>
                    ) : null}
                    <TeleconsultMeetPanel appointment={s} compact />
                  </div>
                  <button
                    type="button"
                    className="mod-btn mod-btn--primary mod-btn--sm"
                    disabled={busyId === s.id}
                    onClick={() => startCall(s)}
                  >
                    <Phone size={16} />
                    {busyId === s.id ? 'Ouverture…' : 'Rejoindre Meet'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default VetTeleconsultPage;
