import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Mail, Send, Sparkles, Target } from 'lucide-react';
import {
  createCrmCampaign,
  fetchCrmMlSuggestions,
  fetchCrmOverview,
  sendCrmCampaign,
} from '../services/adminOpsService';

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 20,
  marginBottom: 16,
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
};

const AdminCrmPage = () => {
  const [data, setData] = useState(null);
  const [ml, setMl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    segmentSlug: 'dormant',
    channel: 'email',
    subject: '',
    message: '',
    promoCode: '',
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [overview, suggestions] = await Promise.all([
        fetchCrmOverview(),
        fetchCrmMlSuggestions().catch(() => null),
      ]);
      setData(overview);
      setMl(suggestions);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      await createCrmCampaign(form);
      setMsg('Campagne créée.');
      setForm({ ...form, name: '', message: '', subject: '', promoCode: '' });
      load();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Erreur création');
    } finally {
      setBusy(false);
    }
  };

  const handleSend = async (id) => {
    setBusy(true);
    try {
      await sendCrmCampaign(id);
      setMsg('Campagne envoyée.');
      load();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Envoi impossible');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: 24,
          padding: '28px 24px',
          borderRadius: 20,
          background: 'linear-gradient(135deg, #0f766e 0%, #115e59 50%, #134e4a 100%)',
          color: 'white',
        }}
      >
        <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800 }}>
          <Users size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          CRM clients
        </h1>
        <p style={{ margin: 0, opacity: 0.9 }}>
          Segmentation des propriétaires et campagnes marketing ciblées (email, push, promo).
        </p>
      </motion.div>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Chargement CRM…</p>
      ) : !data ? (
        <p style={{ color: '#dc2626' }}>CRM indisponible — vérifiez le backend.</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
            <Kpi label="Clients" value={data.kpis?.totalClients} />
            <Kpi label="Actifs 30j" value={data.kpis?.active30d} />
            <Kpi label="Segments" value={data.kpis?.segmentsCount} />
            <Kpi label="Campagnes envoyées" value={data.kpis?.campaignsSent} />
          </div>

          {ml?.summary && (
            <div style={card}>
              <h3 style={{ margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} color="#0d9488" /> Suggestions IA
              </h3>
              <p style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{ml.summary}</p>
              {ml.suggestions?.length > 0 && (
                <ul style={{ margin: '12px 0 0', paddingLeft: 18 }}>
                  {ml.suggestions.map((s, i) => (
                    <li key={i}>
                      <strong>{s.title}</strong> — segment {s.segmentSlug} : {s.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div style={card}>
            <h3 style={{ margin: '0 0 14px' }}>
              <Target size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Segments propriétaires
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {(data.segments || []).map((seg) => (
                <div
                  key={seg.slug}
                  style={{
                    border: `2px solid ${seg.color}22`,
                    borderLeft: `4px solid ${seg.color}`,
                    borderRadius: 12,
                    padding: 14,
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{seg.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b', margin: '4px 0 8px' }}>{seg.description}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: seg.color }}>{seg.count}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={card}>
              <h3 style={{ margin: '0 0 12px' }}>Nouvelle campagne</h3>
              <form onSubmit={handleCreate}>
                <Field label="Nom" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                <label style={labelStyle}>
                  Segment
                  <select
                    style={inputStyle}
                    value={form.segmentSlug}
                    onChange={(e) => setForm({ ...form, segmentSlug: e.target.value })}
                  >
                    {(data.segments || []).map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.name} ({s.count})
                      </option>
                    ))}
                  </select>
                </label>
                <label style={labelStyle}>
                  Canal
                  <select
                    style={inputStyle}
                    value={form.channel}
                    onChange={(e) => setForm({ ...form, channel: e.target.value })}
                  >
                    <option value="email">Email</option>
                    <option value="push">Push</option>
                    <option value="sms">SMS</option>
                  </select>
                </label>
                <Field label="Objet (email)" value={form.subject} onChange={(v) => setForm({ ...form, subject: v })} />
                <label style={labelStyle}>
                  Message
                  <textarea
                    style={{ ...inputStyle, minHeight: 80 }}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </label>
                <Field label="Code promo" value={form.promoCode} onChange={(v) => setForm({ ...form, promoCode: v })} />
                <button type="submit" disabled={busy} style={btnPrimary}>
                  Créer le brouillon
                </button>
              </form>
              {msg && <p style={{ marginTop: 10, fontSize: 13, color: '#0d9488' }}>{msg}</p>}
            </div>

            <div style={card}>
              <h3 style={{ margin: '0 0 12px' }}>
                <Mail size={16} style={{ verticalAlign: 'middle' }} /> Campagnes
              </h3>
              {(data.campaigns || []).length === 0 ? (
                <p style={{ color: '#94a3b8' }}>Aucune campagne.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {data.campaigns.map((c) => (
                    <li
                      key={c.id}
                      style={{
                        padding: '12px 0',
                        borderBottom: '1px solid #f1f5f9',
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        {c.segmentSlug} · {c.channel} · {c.status}
                        {c.targeted ? ` · ${c.targeted} ciblés` : ''}
                      </div>
                      {c.status === 'draft' && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleSend(c.id)}
                          style={{ ...btnPrimary, marginTop: 8, fontSize: 12, padding: '6px 12px' }}
                        >
                          <Send size={14} style={{ verticalAlign: 'middle' }} /> Envoyer
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/admin/products" style={{ display: 'inline-block', marginTop: 12, fontSize: 13, color: '#0d9488' }}>
                Gérer le stock →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const Kpi = ({ label, value }) => (
  <div style={{ ...card, marginBottom: 0, textAlign: 'center' }}>
    <div style={{ fontSize: 12, color: '#64748b' }}>{label}</div>
    <div style={{ fontSize: 24, fontWeight: 800 }}>{value ?? '—'}</div>
  </div>
);

const Field = ({ label, value, onChange }) => (
  <label style={labelStyle}>
    {label}
    <input style={inputStyle} value={value} onChange={(e) => onChange(e.target.value)} />
  </label>
);

const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 10 };
const inputStyle = {
  display: 'block',
  width: '100%',
  marginTop: 4,
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  boxSizing: 'border-box',
};
const btnPrimary = {
  background: '#0d9488',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '10px 16px',
  fontWeight: 700,
  cursor: 'pointer',
};

export default AdminCrmPage;
