import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const STORAGE_KEY = 'petfood-livreur-availability';

const LivreurAvailabilityPage = () => {
  const { user } = useAuth();
  const [isAvailable, setIsAvailable] = useState(true);
  const [statusNote, setStatusNote] = useState('Prêt à prendre des commandes.');
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setIsAvailable(parsed.isAvailable ?? true);
        setStatusNote(parsed.statusNote ?? 'Prêt à prendre des commandes.');
        setUpdatedAt(parsed.updatedAt ? new Date(parsed.updatedAt) : null);
      } catch (error) {
        console.warn('Impossible de charger le statut livreur', error);
      }
    }
  }, []);

  useEffect(() => {
    const payload = {
      isAvailable,
      statusNote,
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setUpdatedAt(new Date(payload.updatedAt));
  }, [isAvailable, statusNote]);

  const statusLabel = useMemo(() => (isAvailable ? 'Disponible' : 'Indisponible'), [isAvailable]);
  const statusClass = isAvailable ? 'status-available' : 'status-unavailable';

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: 'center',
          padding: '28px 18px',
          borderRadius: 26,
          background: 'linear-gradient(135deg, rgba(236,253,245,1) 0%, rgba(209,250,229,1) 100%)',
          border: '1px solid rgba(16,185,129,0.12)',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>🟢</span>
          <h1 style={{ margin: 0, fontWeight: 900, color: '#065f46' }}>Disponibilité Livreur</h1>
        </div>
        <p style={{ margin: 0, color: '#6b7280', fontWeight: 600 }}>
          Gérez votre statut de disponibilité, vos notes de route et restez visible pour les nouvelles livraisons.
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 18 }}>
        <div
          style={{
            background: 'white',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Statut actuel
              </div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900, color: isAvailable ? '#047857' : '#b91c1c' }}>
                {statusLabel}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAvailable((current) => !current)}
              style={{
                padding: '14px 20px',
                borderRadius: 18,
                border: 'none',
                cursor: 'pointer',
                background: isAvailable ? '#ef4444' : '#10b981',
                color: 'white',
                fontWeight: 800,
                minWidth: 180,
              }}
            >
              {isAvailable ? 'Passer en pause' : 'Revenir disponible'}
            </button>
          </div>

          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            <div style={{ display: 'grid', gap: 10 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontWeight: 700, color: '#111827' }}>
                Note de statut
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  rows={4}
                  className="border rounded-xl px-3 py-3"
                  placeholder="Ex: En route vers la prochaine livraison, pause repas..."
                />
              </label>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ color: '#6b7280', fontSize: 13 }}>
                  Dernière mise à jour : {updatedAt ? updatedAt.toLocaleString('fr-FR') : 'Jamais'}
                </span>
                <span style={{ color: '#6b7280', fontSize: 13 }}>
                  Connecté en tant que {user?.name || 'Livreur'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'white',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.04)',
          }}
        >
          <h2 style={{ margin: '0 0 14px', fontWeight: 900 }}>Résumé rapide</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
            {[
              { label: 'Statut', value: statusLabel, accent: isAvailable ? '#d1fae5' : '#fee2e2' },
              { label: 'Etat de la journée', value: isAvailable ? 'Prêt à recevoir des livraisons' : 'En pause', accent: isAvailable ? '#f0fdf4' : '#fef2f2' },
              { label: 'Connexion', value: user?.email || 'Non défini', accent: '#eef2ff' },
            ].map((item) => (
              <div key={item.label} style={{ padding: 18, borderRadius: 18, background: item.accent }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {item.label}
                </div>
                <div style={{ marginTop: 8, fontSize: 16, fontWeight: 800, color: '#111827' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivreurAvailabilityPage;
