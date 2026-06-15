import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import usePlatformRefresh from '../hooks/usePlatformRefresh';

const DAYS = [
  { key: 'mon', label: 'Lundi' },
  { key: 'tue', label: 'Mardi' },
  { key: 'wed', label: 'Mercredi' },
  { key: 'thu', label: 'Jeudi' },
  { key: 'fri', label: 'Vendredi' },
  { key: 'sat', label: 'Samedi' },
  { key: 'sun', label: 'Dimanche' },
];

const emptyDay = () => ({
  open: true,
  ranges: [
    { start: '09:00', end: '12:00' },
    { start: '14:00', end: '17:00' },
  ],
});

const card = {
  background: 'white',
  borderRadius: 16,
  padding: 24,
  marginBottom: 20,
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  border: '1px solid #e2e8f0',
};

const VetAvailabilityPage = () => {
  const [isAvailable, setIsAvailable] = useState(true);
  const [statusNote, setStatusNote] = useState('');
  const [slotDuration, setSlotDuration] = useState(60);
  const [weeklyHours, setWeeklyHours] = useState(() =>
    DAYS.reduce((acc, { key }) => {
      acc[key] = key === 'sun' ? { open: false, ranges: [] } : emptyDay();
      return acc;
    }, {})
  );
  const [blockedDates, setBlockedDates] = useState([]);
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [previewDate, setPreviewDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [previewSlots, setPreviewSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/vet/availability');
      setIsAvailable(data.isAvailable !== false);
      setStatusNote(data.statusNote || '');
      setSlotDuration(data.slotDurationMinutes || 60);
      if (data.weeklyHours) setWeeklyHours(data.weeklyHours);
      setBlockedDates(data.blockedDates || []);
      setUpdatedAt(data.updatedAt ? new Date(data.updatedAt) : null);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  usePlatformRefresh(load);

  const persist = async (patch = {}) => {
    setSaving(true);
    setSaved(false);
    try {
      const { data } = await api.put('/vet/availability', {
        isAvailable: patch.isAvailable ?? isAvailable,
        statusNote: patch.statusNote ?? statusNote,
        slotDurationMinutes: patch.slotDurationMinutes ?? slotDuration,
        weeklyHours: patch.weeklyHours ?? weeklyHours,
        blockedDates: patch.blockedDates ?? blockedDates,
        syncOpeningHours: true,
      });
      setIsAvailable(data.isAvailable !== false);
      setStatusNote(data.statusNote || '');
      setSlotDuration(data.slotDurationMinutes || 60);
      if (data.weeklyHours) setWeeklyHours(data.weeklyHours);
      setBlockedDates(data.blockedDates || []);
      setUpdatedAt(data.updatedAt ? new Date(data.updatedAt) : null);
      setSaved(true);
    } catch (err) {
      window.alert(err.response?.data?.error || 'Erreur enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailable = async () => {
    const next = !isAvailable;
    setIsAvailable(next);
    await persist({ isAvailable: next });
  };

  const updateDay = (key, field, value) => {
    setWeeklyHours((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const updateRange = (dayKey, idx, field, value) => {
    setWeeklyHours((prev) => {
      const day = { ...prev[dayKey] };
      const ranges = [...(day.ranges || [])];
      ranges[idx] = { ...ranges[idx], [field]: value };
      return { ...prev, [dayKey]: { ...day, ranges } };
    });
  };

  const addRange = (dayKey) => {
    setWeeklyHours((prev) => {
      const day = { ...prev[dayKey] };
      const ranges = [...(day.ranges || []), { start: '14:00', end: '17:00' }];
      return { ...prev, [dayKey]: { ...day, ranges, open: true } };
    });
  };

  const removeRange = (dayKey, idx) => {
    setWeeklyHours((prev) => {
      const day = { ...prev[dayKey] };
      const ranges = (day.ranges || []).filter((_, i) => i !== idx);
      return { ...prev, [dayKey]: { ...day, ranges, open: ranges.length > 0 } };
    });
  };

  const addBlockedDate = () => {
    if (!newBlockedDate || blockedDates.includes(newBlockedDate)) return;
    setBlockedDates((prev) => [...prev, newBlockedDate].sort());
    setNewBlockedDate('');
  };

  const loadPreview = async () => {
    try {
      const { data } = await api.get('/vet/availability/preview', { params: { date: previewDate } });
      setPreviewSlots(data.slots || []);
    } catch {
      setPreviewSlots([]);
    }
  };

  useEffect(() => {
    if (!loading) loadPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewDate, loading, weeklyHours, isAvailable, slotDuration, blockedDates]);

  const statusLabel = useMemo(
    () => (isAvailable ? 'Accepte les rendez-vous' : 'Indisponible (pause)'),
    [isAvailable]
  );

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Chargement…</div>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: 24,
          padding: '28px 24px',
          borderRadius: 20,
          background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0e7490 100%)',
          color: 'white',
        }}
      >
        <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 800 }}>🟢 Disponibilité vétérinaire</h1>
        <p style={{ margin: 0, opacity: 0.9 }}>
          Définissez vos horaires et créneaux — visibles par les clients lors de la prise de rendez-vous.
        </p>
      </motion.div>

      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Statut</div>
            <div style={{ marginTop: 8, fontSize: 22, fontWeight: 800, color: isAvailable ? '#047857' : '#b91c1c' }}>
              {statusLabel}
            </div>
          </div>
          <button
            type="button"
            onClick={toggleAvailable}
            disabled={saving}
            style={{
              padding: '12px 20px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              background: isAvailable ? '#ef4444' : '#10b981',
              color: 'white',
              fontWeight: 700,
            }}
          >
            {isAvailable ? 'Activer la pause' : 'Reprendre les RDV'}
          </button>
        </div>

        <label style={{ display: 'block', marginTop: 20, fontWeight: 600 }}>
          Message pour les clients
          <textarea
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            rows={2}
            placeholder="Ex. : Téléconsultations l'après-midi, urgences par téléphone…"
            style={{
              width: '100%',
              marginTop: 8,
              padding: 12,
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              boxSizing: 'border-box',
            }}
          />
        </label>

        <label style={{ display: 'block', marginTop: 16, fontWeight: 600 }}>
          Durée d&apos;un créneau (minutes)
          <select
            value={slotDuration}
            onChange={(e) => setSlotDuration(Number(e.target.value))}
            style={{ display: 'block', marginTop: 8, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
          >
            <option value={30}>30 min</option>
            <option value={45}>45 min</option>
            <option value={60}>60 min</option>
            <option value={90}>90 min</option>
          </select>
        </label>
      </div>

      <div style={card}>
        <h2 style={{ margin: '0 0 16px', fontSize: 18 }}>Horaires hebdomadaires</h2>
        {DAYS.map(({ key, label }) => {
          const day = weeklyHours[key] || { open: false, ranges: [] };
          return (
            <div
              key={key}
              style={{
                padding: '14px 0',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: day.open ? 10 : 0 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120, fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={day.open}
                    onChange={(e) => {
                      const open = e.target.checked;
                      updateDay(key, 'open', open);
                      if (open && !(day.ranges || []).length) {
                        setWeeklyHours((prev) => ({ ...prev, [key]: emptyDay() }));
                      }
                    }}
                  />
                  {label}
                </label>
                {day.open && (
                  <button type="button" className="btn btn-outline" style={{ fontSize: 12 }} onClick={() => addRange(key)}>
                    + Plage horaire
                  </button>
                )}
              </div>
              {day.open &&
                (day.ranges || []).map((range, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 128, marginBottom: 8, flexWrap: 'wrap' }}>
                    <input
                      type="time"
                      value={range.start}
                      onChange={(e) => updateRange(key, idx, 'start', e.target.value)}
                      style={{ padding: 8, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    />
                    <span>→</span>
                    <input
                      type="time"
                      value={range.end}
                      onChange={(e) => updateRange(key, idx, 'end', e.target.value)}
                      style={{ padding: 8, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    />
                    {(day.ranges || []).length > 1 && (
                      <button type="button" onClick={() => removeRange(key, idx)} style={{ border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer' }}>
                        Supprimer
                      </button>
                    )}
                  </div>
                ))}
            </div>
          );
        })}
      </div>

      <div style={card}>
        <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>Jours fermés exceptionnels</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          <input
            type="date"
            value={newBlockedDate}
            onChange={(e) => setNewBlockedDate(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
          />
          <button type="button" className="btn btn-outline" onClick={addBlockedDate}>
            Ajouter
          </button>
        </div>
        {blockedDates.length > 0 ? (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {blockedDates.map((d) => (
              <li key={d} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                {new Date(`${d}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                <button
                  type="button"
                  onClick={() => setBlockedDates((prev) => prev.filter((x) => x !== d))}
                  style={{ border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer' }}
                >
                  Retirer
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#94a3b8', margin: 0, fontSize: 14 }}>Aucun jour bloqué.</p>
        )}
      </div>

      <div style={card}>
        <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>Aperçu créneaux clients</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <input
            type="date"
            value={previewDate}
            onChange={(e) => setPreviewDate(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
          />
          <button type="button" className="btn btn-outline" onClick={loadPreview}>
            Actualiser
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {previewSlots.length === 0 && (
            <span style={{ color: '#94a3b8' }}>Aucun créneau ce jour (fermé, pause ou jour bloqué).</span>
          )}
          {previewSlots.map((s) => (
            <span
              key={s.start}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                background: s.isAvailable ? '#ecfdf5' : '#f1f5f9',
                color: s.isAvailable ? '#047857' : '#94a3b8',
                border: `1px solid ${s.isAvailable ? '#6ee7b7' : '#e2e8f0'}`,
              }}
            >
              {new Date(s.start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              {!s.isAvailable && ' (pris)'}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ color: '#64748b', fontSize: 13 }}>
          Dernière mise à jour : {updatedAt ? updatedAt.toLocaleString('fr-FR') : '—'}
        </span>
        <button type="button" className="btn btn-primary" onClick={() => persist()} disabled={saving}>
          {saving ? 'Enregistrement…' : 'Enregistrer la disponibilité'}
        </button>
      </div>
      {saved && <p style={{ color: '#047857', fontWeight: 600 }}>✅ Horaires synchronisés (profil clinique inclus)</p>}
    </div>
  );
};

export default VetAvailabilityPage;
