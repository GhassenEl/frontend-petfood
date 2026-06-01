import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const LivreurAvailabilityPage = () => {
  const { user } = useAuth();
  const [isAvailable, setIsAvailable] = useState(true);
  const [statusNote, setStatusNote] = useState('Prêt à prendre des commandes.');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/users/profile');
        let availability = null;
        try {
          const prefs = data?.preferences ? JSON.parse(data.preferences) : {};
          availability = prefs.availability;
        } catch {
          availability = null;
        }
        if (availability) {
          setIsAvailable(availability.isAvailable ?? true);
          setStatusNote(availability.statusNote ?? 'Prêt à prendre des commandes.');
          setUpdatedAt(availability.updatedAt ? new Date(availability.updatedAt) : null);
        }
      } catch (error) {
        console.warn('Impossible de charger le statut livreur', error);
      }
    };
    load();
  }, []);

  const persist = async (nextAvailable, nextNote) => {
    setSaving(true);
    setSaved(false);
    try {
      const payload = {
        availability: {
          isAvailable: nextAvailable,
          statusNote: nextNote,
          updatedAt: new Date().toISOString(),
        },
      };
      await api.put('/users/profile', payload);
      setUpdatedAt(new Date());
      setSaved(true);
    } catch (error) {
      window.alert(error.response?.data?.error || 'Erreur enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailability = async () => {
    const next = !isAvailable;
    setIsAvailable(next);
    await persist(next, statusNote);
  };

  const saveNote = async () => {
    await persist(isAvailable, statusNote);
  };

  const statusLabel = useMemo(() => (isAvailable ? 'Disponible' : 'Indisponible'), [isAvailable]);

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
        <h1 style={{ margin: 0, fontWeight: 900, color: '#065f46' }}>🟢 Disponibilité</h1>
        <p style={{ margin: '8px 0 0', color: '#6b7280', fontWeight: 600 }}>
          Visible par l&apos;administration · zone {user?.region || 'non assignée'}
        </p>
      </motion.div>

      <div style={{ background: 'white', borderRadius: 20, padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', textTransform: 'uppercase' }}>Statut</div>
            <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900, color: isAvailable ? '#047857' : '#b91c1c' }}>
              {statusLabel}
            </div>
          </div>
          <button
            type="button"
            onClick={toggleAvailability}
            disabled={saving}
            style={{
              padding: '14px 20px',
              borderRadius: 18,
              border: 'none',
              cursor: 'pointer',
              background: isAvailable ? '#ef4444' : '#10b981',
              color: 'white',
              fontWeight: 800,
              minWidth: 180,
              opacity: saving ? 0.7 : 1,
            }}
          >
            {isAvailable ? 'Passer en pause' : 'Revenir disponible'}
          </button>
        </div>

        <label style={{ display: 'block', marginTop: 24, fontWeight: 700, color: '#111827' }}>
          Note de statut
          <textarea
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            rows={4}
            style={{ width: '100%', marginTop: 8, padding: 12, borderRadius: 12, border: '1px solid #e5e7eb', boxSizing: 'border-box' }}
            placeholder="Ex: En route vers Ariana, pause déjeuner..."
          />
        </label>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, flexWrap: 'wrap', gap: 12 }}>
          <span style={{ color: '#6b7280', fontSize: 13 }}>
            Dernière mise à jour : {updatedAt ? updatedAt.toLocaleString('fr-FR') : '—'}
          </span>
          <button type="button" className="btn btn-primary" onClick={saveNote} disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer la note'}
          </button>
        </div>
        {saved && <p style={{ color: '#047857', fontWeight: 600, marginTop: 12 }}>✅ Statut synchronisé avec le serveur</p>}
      </div>
    </div>
  );
};

export default LivreurAvailabilityPage;
