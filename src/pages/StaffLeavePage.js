import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus } from 'lucide-react';
import api from '../utils/api';
import {
  LEAVE_TYPES,
  getLeaveTypeLabel,
  getLeaveStatusMeta,
} from '../constants/leaveRequests';

const StaffLeavePage = ({ roleLabel = 'Personnel' }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    type: 'conge',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/leave-requests/mine');
      setRequests(data || []);
    } catch (error) {
      console.error(error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate) {
      window.alert('Indiquez les dates de début et de fin');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/leave-requests', form);
      setShowForm(false);
      setForm({ type: 'conge', startDate: '', endDate: '', reason: '' });
      await load();
      window.alert('Demande envoyée à l\'administration');
    } catch (error) {
      window.alert(error.response?.data?.error || 'Erreur lors de l\'envoi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Annuler cette demande ?')) return;
    try {
      await api.delete(`/leave-requests/${id}`);
      await load();
    } catch (error) {
      window.alert(error.response?.data?.error || 'Erreur');
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        style={heroStyle}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Calendar size={28} color="#0ea5e9" />
              Congés & maladie
            </h1>
            <p style={{ margin: 0, color: '#6b7280' }}>
              {roleLabel} — envoyez une demande ; l&apos;admin la confirme ou la refuse.
            </p>
          </div>
          <button type="button" onClick={() => setShowForm(!showForm)} style={primaryBtnStyle}>
            <Plus size={18} /> Nouvelle demande
          </button>
        </div>
      </motion.div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleSubmit}
          style={cardStyle}
        >
          <h2 style={{ marginTop: 0, fontSize: 18 }}>Nouvelle demande</h2>
          <label style={labelStyle}>
            Type
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              style={inputStyle}
            >
              {LEAVE_TYPES.map((t) => (
                <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>
              ))}
            </select>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label style={labelStyle}>
              Du
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                style={inputStyle}
              />
            </label>
            <label style={labelStyle}>
              Au
              <input
                type="date"
                required
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                style={inputStyle}
              />
            </label>
          </div>
          <label style={labelStyle}>
            Motif (optionnel)
            <textarea
              rows={3}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Précisions pour l'administration…"
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </label>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowForm(false)} style={secondaryBtnStyle}>
              Annuler
            </button>
            <button type="submit" disabled={submitting} style={primaryBtnStyle}>
              {submitting ? 'Envoi…' : 'Envoyer à l\'admin'}
            </button>
          </div>
        </motion.form>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: '#6b7280' }}>Chargement…</p>
      ) : requests.length === 0 ? (
        <div style={cardStyle}>
          <p style={{ margin: 0, color: '#6b7280' }}>Aucune demande pour le moment.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {requests.map((req) => {
            const meta = getLeaveStatusMeta(req.status);
            return (
              <article key={req.id || req._id} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <strong style={{ fontSize: 17 }}>
                      {getLeaveTypeLabel(req.type)}
                    </strong>
                    <p style={{ margin: '6px 0 0', color: '#4b5563' }}>
                      {formatDate(req.startDate)} → {formatDate(req.endDate)}
                    </p>
                    {req.reason && (
                      <p style={{ margin: '8px 0 0', fontSize: 14, color: '#6b7280' }}>{req.reason}</p>
                    )}
                    {req.adminNote && req.status !== 'pending' && (
                      <p style={{ margin: '8px 0 0', fontSize: 13, color: '#0369a1' }}>
                        Réponse admin : {req.adminNote}
                      </p>
                    )}
                  </div>
                  <span
                    style={{
                      padding: '6px 12px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      color: meta.color,
                      background: meta.bg,
                    }}
                  >
                    {meta.label}
                  </span>
                </div>
                {req.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => handleCancel(req.id || req._id)}
                    style={{ ...secondaryBtnStyle, marginTop: 12 }}
                  >
                    Annuler la demande
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

const heroStyle = {
  background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
  borderRadius: 20,
  padding: 24,
  marginBottom: 20,
  boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
};

const cardStyle = {
  background: 'white',
  borderRadius: 16,
  padding: 20,
  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
  border: '1px solid #f0f0f0',
};

const labelStyle = { display: 'block', marginBottom: 14, fontSize: 14, fontWeight: 600, color: '#374151' };
const inputStyle = {
  display: 'block',
  width: '100%',
  marginTop: 6,
  padding: '10px 12px',
  borderRadius: 10,
  border: '2px solid #e5e7eb',
  fontSize: 14,
  boxSizing: 'border-box',
};

const primaryBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '12px 18px',
  background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
  color: 'white',
  border: 'none',
  borderRadius: 12,
  fontWeight: 700,
  cursor: 'pointer',
};

const secondaryBtnStyle = {
  padding: '10px 16px',
  background: '#f3f4f6',
  color: '#374151',
  border: 'none',
  borderRadius: 10,
  fontWeight: 600,
  cursor: 'pointer',
};

export default StaffLeavePage;
