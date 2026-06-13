import React, { useEffect, useState } from 'react';
import { Video, Phone } from 'lucide-react';
import api from '../utils/api';
import { DEMO_VET_APPOINTMENTS } from '../utils/vetDemoData';
import './ModeratorPages.css';

const VetTeleconsultPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/vet/appointments')
      .then((r) => {
        const list = (r.data || []).filter((a) => a.visitMode === 'online' || a.mode === 'teleconsult');
        setSessions(list.length ? list : DEMO_VET_APPOINTMENTS.filter((a) => a.visitMode === 'online'));
      })
      .catch(() => setSessions(DEMO_VET_APPOINTMENTS.filter((a) => a.visitMode === 'online')))
      .finally(() => setLoading(false));
  }, []);

  const startCall = (id) => {
    window.alert(`Téléconsultation #${id} — démo : la visio s'ouvrirait ici (WebRTC / lien sécurisé).`);
  };

  return (
    <div className="mod-page">
      <header className="mod-hero">
        <h1><Video size={24} /> Téléconsultations</h1>
        <p>Effectuer des consultations vidéo à distance avec vos clients.</p>
      </header>

      <div className="mod-card">
        {loading ? <p className="mod-empty">Chargement…</p> : sessions.length === 0 ? (
          <p className="mod-empty">Aucune téléconsultation planifiée.</p>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {sessions.map((s) => (
              <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
                <div>
                  <strong>{s.owner?.name || s.clientName}</strong>
                  <span> — {s.petName}</span>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                    {new Date(s.date || s.scheduledAt).toLocaleString('fr-FR')}
                  </p>
                </div>
                <button type="button" className="mod-btn mod-btn--primary mod-btn--sm" onClick={() => startCall(s.id)}>
                  <Phone size={16} /> Démarrer
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default VetTeleconsultPage;
