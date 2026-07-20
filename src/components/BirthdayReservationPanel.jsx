import React, { useCallback, useEffect, useState } from 'react';
import { Cake, CalendarPlus, RefreshCw } from 'lucide-react';
import { fetchBirthdaySuggestions, reserveBirthdayEvent } from '../services/adminOpsService';

const BirthdayReservationPanel = () => {
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchBirthdaySuggestions();
      setPack(data);
    } catch {
      setPack({ suggestions: [], existingBirthdayEvents: [] });
      setError('Impossible de charger les anniversaires.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const reserve = async (suggestion) => {
    setReserving(suggestion.petId);
    setMessage('');
    setError('');
    try {
      const result = await reserveBirthdayEvent({
        petId: suggestion.petId,
        eventDate: suggestion.nextBirthday,
        notes: `Réservation anniversaire — ${suggestion.suggestedTitle}`,
      });
      setMessage(result.message || 'Réservation confirmée');
      await load();
    } catch (e) {
      setError(e?.response?.data?.error || 'Réservation impossible');
    } finally {
      setReserving(null);
    }
  };

  if (loading) return <p style={{ color: '#94a3b8' }}>Chargement des anniversaires…</p>;

  const suggestions = pack?.suggestions || [];
  const existing = pack?.existingBirthdayEvents || [];

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
        borderRadius: 16,
        padding: 20,
        border: '1px solid #fdba74',
        marginBottom: 24,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <Cake size={22} color="#c2410c" />
        <strong style={{ flex: 1, fontSize: 17 }}>Anniversaires animaux</strong>
        <button
          type="button"
          onClick={load}
          style={{
            border: 'none',
            background: '#fff',
            borderRadius: 8,
            padding: '6px 10px',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} />
        </button>
      </div>
      <p style={{ margin: '0 0 14px', fontSize: 13, color: '#9a3412' }}>
        Réservez une fête d&apos;anniversaire pour votre compagnon — date suggérée selon sa date de naissance.
      </p>

      {message && (
        <p style={{ color: '#15803d', fontWeight: 600, fontSize: 14 }}>{message}</p>
      )}
      {error && <p style={{ color: '#b91c1c', fontSize: 14 }}>{error}</p>}

      {suggestions.length === 0 ? (
        <p style={{ color: '#78716c', fontSize: 14 }}>
          Aucun animal avec date de naissance. Ajoutez une date de naissance dans le profil animal.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
          {suggestions.map((s) => (
            <li
              key={s.petId}
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: 14,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 12,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <strong>{s.suggestedTitle}</strong>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
                  Dans {s.daysUntil} jour{s.daysUntil > 1 ? 's' : ''} ·{' '}
                  {s.nextBirthday
                    ? new Date(s.nextBirthday).toLocaleDateString('fr-FR')
                    : '—'}
                </p>
              </div>
              <button
                type="button"
                disabled={reserving === s.petId}
                onClick={() => reserve(s)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#ea580c',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <CalendarPlus size={16} />
                {reserving === s.petId ? 'Réservation…' : 'Réserver'}
              </button>
            </li>
          ))}
        </ul>
      )}

      {existing.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#9a3412' }}>Déjà réservés</p>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#57534e' }}>
            {existing.map((e) => (
              <li key={e.id}>
                {e.title || e.petName} —{' '}
                {e.date ? new Date(e.date).toLocaleDateString('fr-FR') : '—'} ({e.status})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BirthdayReservationPanel;
