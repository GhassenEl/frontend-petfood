import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { isHomeVisit, isOnlineVisit } from '../constants/visitModes';
import api from '../utils/api';
import {
  DEMO_VET_APPOINTMENTS,
  DEMO_VET_UNASSIGNED,
  withDemoFallback,
} from '../utils/vetDemoData';
import usePlatformRefresh from '../hooks/usePlatformRefresh';

const statusLabel = {
  scheduled: 'Planifié',
  confirmed: 'Confirmé',
  completed: 'Terminé',
  cancelled: 'Annulé',
  pending: 'En attente',
};

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const VetCalendarPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState(null);

  const apptId = (a) => a?.id || a?._id;

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAppointments = async () => {
    try {
      const [apptRes, unassignedRes] = await Promise.all([
        api.get('/vet/appointments'),
        api.get('/vet/appointments/unassigned'),
      ]);
      setAppointments(withDemoFallback(apptRes.data, DEMO_VET_APPOINTMENTS));
      setUnassigned(withDemoFallback(unassignedRes.data, DEMO_VET_UNASSIGNED));
    } catch (error) {
      console.error('Calendar error:', error);
      setAppointments(DEMO_VET_APPOINTMENTS);
      setUnassigned(DEMO_VET_UNASSIGNED);
      showToast('Impossible de charger le calendrier.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  usePlatformRefresh(fetchAppointments);

  const claimAppt = async (id) => {
    if (!id) return;
    try {
      await api.put(`/vet/appointments/${id}/claim`);
      showToast('RDV pris en charge.');
      fetchAppointments();
    } catch {
      showToast('Erreur lors de la prise en charge.', 'error');
    }
  };

  const confirmAppt = async (id) => {
    if (!id) return;
    try {
      await api.put(`/vet/appointments/${id}/confirm`);
      showToast('Rendez-vous confirmé.');
      fetchAppointments();
    } catch {
      showToast('Erreur lors de la confirmation.', 'error');
    }
  };

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const weekEnd = addDays(weekStart, 6);

  const appointmentsInWeek = useMemo(() => {
    const end = addDays(weekStart, 7);
    return appointments.filter((a) => {
      const d = new Date(a.date);
      return d >= weekStart && d < end;
    });
  }, [appointments, weekStart]);

  const byDay = useMemo(() => {
    const map = {};
    weekDays.forEach((day) => {
      const key = day.toISOString().slice(0, 10);
      map[key] = appointmentsInWeek
        .filter((a) => sameDay(new Date(a.date), day))
        .filter((a) => {
          if (filter === 'pending') return ['scheduled', 'pending'].includes(a.status);
          if (filter === 'confirmed') return a.status === 'confirmed';
          return true;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    });
    return map;
  }, [weekDays, appointmentsInWeek, filter]);

  const todayKey = new Date().toISOString().slice(0, 10);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Chargement du calendrier...</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 9999,
            padding: '12px 18px',
            borderRadius: 12,
            background: toast.type === 'error' ? '#fef2f2' : '#ecfdf5',
            color: toast.type === 'error' ? '#b91c1c' : '#065f46',
            fontWeight: 700,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          }}
        >
          {toast.text}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <h1 style={{ marginBottom: 8 }}>📅 Calendrier hebdomadaire</h1>
          <p style={{ color: '#777', margin: 0 }}>
            Semaine du {weekStart.toLocaleDateString('fr-FR')} au {weekEnd.toLocaleDateString('fr-FR')}
            {' · '}{appointmentsInWeek.length} RDV
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-outline" onClick={() => setWeekStart(addDays(weekStart, -7))}>
            ← Semaine préc.
          </button>
          <button type="button" className="btn btn-outline" onClick={() => setWeekStart(startOfWeek(new Date()))}>
            Aujourd&apos;hui
          </button>
          <button type="button" className="btn btn-outline" onClick={() => setWeekStart(addDays(weekStart, 7))}>
            Semaine suiv. →
          </button>
          <button type="button" className="btn btn-outline" onClick={() => { setLoading(true); fetchAppointments(); }}>
            ↻ Actualiser
          </button>
        </div>
      </div>

      {unassigned.length > 0 && (
        <div style={{ background: '#fffbeb', borderRadius: 14, padding: 16, marginBottom: 20, border: '1px solid #fcd34d' }}>
          <strong>📋 Pool RDV non assignés ({unassigned.length})</strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            {unassigned.map((a) => (
              <div key={apptId(a)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <span>
                  {a.petName} — {new Date(a.date).toLocaleString('fr-FR')} — {a.owner?.name}
                  {isHomeVisit(a) && ' · 🏠'}
                  {isOnlineVisit(a) && ' · 📹'}
                </span>
                <button type="button" className="btn btn-primary" style={{ fontSize: 13 }} onClick={() => claimAppt(apptId(a))}>
                  Prendre en charge
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'Tous' },
          { key: 'pending', label: 'À confirmer' },
          { key: 'confirmed', label: 'Confirmés' },
        ].map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              border: filter === f.key ? '2px solid #0ea5e9' : '1px solid #ddd',
              background: filter === f.key ? '#e0f2fe' : 'white',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: 8 }} className="vet-calendar-scroll">
      <div
        className="vet-calendar-week"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(120px, 1fr))',
          gap: 10,
          minHeight: 320,
          minWidth: 840,
        }}
      >
        {weekDays.map((day, index) => {
          const key = day.toISOString().slice(0, 10);
          const dayAppts = byDay[key] || [];
          const isToday = key === todayKey;
          return (
            <div
              key={key}
              style={{
                background: isToday ? '#f0f9ff' : 'white',
                borderRadius: 12,
                border: isToday ? '2px solid #0ea5e9' : '1px solid #e5e7eb',
                padding: 10,
                minHeight: 140,
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 13, color: '#111827', marginBottom: 4 }}>
                {DAY_NAMES[index]}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>
                {day.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </div>
              {dayAppts.length === 0 ? (
                <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>—</p>
              ) : (
                dayAppts.map((appt) => (
                  <div
                    key={appt.id || appt._id}
                    style={{
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      padding: 8,
                      marginBottom: 8,
                      fontSize: 11,
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>
                      {new Date(appt.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div>{appt.petName}</div>
                    <div style={{ color: '#6b7280' }}>{statusLabel[appt.status] || appt.status}</div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                      {appt.status === 'scheduled' && (
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ padding: '2px 6px', fontSize: 10 }}
                          onClick={() => confirmAppt(appt.id || appt._id)}
                        >
                          OK
                        </button>
                      )}
                      <Link
                        to={`/vet/appointments/${appt.id || appt._id}`}
                        style={{ fontSize: 10, color: '#0ea5e9' }}
                      >
                        Détail
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
      </div>

      <h2 style={{ marginTop: 28, fontSize: '1.1rem' }}>Liste détaillée</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
        {appointmentsInWeek.length === 0 ? (
          <p style={{ color: '#888' }}>Aucun rendez-vous cette semaine.</p>
        ) : (
          appointmentsInWeek
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map((appt) => (
              <div
                key={appt.id || appt._id}
                style={{
                  background: 'white',
                  borderRadius: 14,
                  padding: 18,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <strong>{appt.petName}</strong> ({appt.animalType})
                  {isHomeVisit(appt) && (
                    <span style={{ marginLeft: 8, fontSize: '0.75rem', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>🏠 Domicile</span>
                  )}
                  {isOnlineVisit(appt) && (
                    <span style={{ marginLeft: 8, fontSize: '0.75rem', background: '#ede9fe', color: '#6d28d9', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>📹 En ligne</span>
                  )}
                  <p style={{ margin: '4px 0', color: '#666', fontSize: '0.9rem' }}>
                    {new Date(appt.date).toLocaleString('fr-FR')} — {appt.owner?.name || 'Client'}
                    {isHomeVisit(appt) && appt.homeAddress ? ` · ${appt.homeAddress}` : ''}
                  </p>
                  <span style={{ fontSize: '0.8rem', color: '#0ea5e9' }}>{statusLabel[appt.status] || appt.status}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {appt.status === 'scheduled' && (
                    <button type="button" className="btn btn-outline" onClick={() => confirmAppt(appt.id || appt._id)}>
                      Confirmer
                    </button>
                  )}
                  {isOnlineVisit(appt) && appt.meetingLink && (
                    <a href={appt.meetingLink} target="_blank" rel="noreferrer" className="btn btn-primary">
                      📹 Meet
                    </a>
                  )}
                  {appt.meetingLink && !isOnlineVisit(appt) && (
                    <a href={appt.meetingLink} target="_blank" rel="noreferrer" className="btn btn-primary">
                      Meet
                    </a>
                  )}
                  <Link to={`/vet/appointments/${appt.id || appt._id}`} className="btn btn-outline">
                    Détails
                  </Link>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default VetCalendarPage;
