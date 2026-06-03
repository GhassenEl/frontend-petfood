import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Shield, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import useAdminIncidentsMl from '../hooks/useAdminIncidentsMl';
import {
  processAllIncidents,
  validateIncidentProposal,
} from '../services/incidentMlService';
import './ClientComplaintsPage.css';

const PRIORITY_COLOR = {
  urgent: '#dc2626',
  high: '#ea580c',
  medium: '#ca8a04',
  low: '#64748b',
};

const complaintId = (c) => c?.id || c?._id;

const AdminIncidentsMlPage = () => {
  const { data, loading, reload } = useAdminIncidentsMl();
  const [busy, setBusy] = useState(null);
  const [toast, setToast] = useState(null);
  const [editResponse, setEditResponse] = useState({});

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const runProcessAll = async () => {
    setBusy('all');
    try {
      const r = await processAllIncidents();
      showToast(`${r.processed} incident(s) traité(s) par l'IA.`);
      reload();
    } catch {
      showToast('Traitement IA impossible.', 'error');
    } finally {
      setBusy(null);
    }
  };

  const handleValidate = async (c, approved) => {
    const id = complaintId(c);
    setBusy(id);
    try {
      await validateIncidentProposal(id, {
        approved,
        response: editResponse[id] || c.aiProposedResponse || c.response,
        rejectReason: approved ? undefined : 'Réponse IA à réécrire manuellement',
      });
      showToast(approved ? 'Incident validé et résolu.' : 'Proposition IA rejetée.');
      reload();
    } catch {
      showToast('Validation impossible.', 'error');
    } finally {
      setBusy(null);
    }
  };

  const queue = data?.queue || [];

  return (
    <div className="cc-page" style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      {toast && <div className={`cc-toast ${toast.type}`}>{toast.text}</div>}

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: 24,
          padding: '28px 24px',
          borderRadius: 20,
          background: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 50%, #dc2626 100%)',
          color: 'white',
        }}
      >
        <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800 }}>
          <Brain size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Agent IA — Résolution d&apos;incidents
        </h1>
        <p style={{ margin: 0, opacity: 0.9 }}>
          L&apos;agent analyse les réclamations clients, propose une réponse et un plan d&apos;action.
          Vous validez ou rejetez avant envoi officiel.
        </p>
        <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" onClick={reload} style={btnLight} disabled={loading}>
            <RefreshCw size={14} /> Actualiser
          </button>
          <button type="button" onClick={runProcessAll} style={btnLight} disabled={busy === 'all'}>
            {busy === 'all' ? 'Traitement…' : 'Traiter tous les incidents en attente'}
          </button>
          <Link to="/admin/complaints" style={{ ...btnLight, textDecoration: 'none' }}>
            Toutes les réclamations
          </Link>
        </div>
      </motion.div>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Chargement de la file de validation…</p>
      ) : (
        <>
          {data?.summary && (
            <div className="cc-form-card" style={{ marginBottom: 20 }}>
              <p style={{ margin: 0, lineHeight: 1.6 }}>{data.summary}</p>
              {data.tip && <p style={{ margin: '10px 0 0', fontSize: 13, color: '#b45309' }}>{data.tip}</p>}
            </div>
          )}

          <div className="cc-stats" style={{ marginBottom: 20 }}>
            <div className="cc-stat">
              <strong style={{ color: '#dc2626' }}>{data?.platformStats?.awaitingValidation ?? 0}</strong>
              <span>À valider</span>
            </div>
            <div className="cc-stat">
              <strong>{data?.platformStats?.pendingForAgent ?? 0}</strong>
              <span>En attente agent</span>
            </div>
            <div className="cc-stat">
              <strong style={{ color: '#059669' }}>{data?.platformStats?.validatedLast24h ?? 0}</strong>
              <span>Validés 24 h</span>
            </div>
            <div className="cc-stat">
              <strong>{data?.stats?.urgent ?? 0}</strong>
              <span>Urgents</span>
            </div>
          </div>

          {queue.length === 0 ? (
            <div className="cc-empty">
              <Shield size={40} style={{ opacity: 0.3 }} />
              <p>Aucune proposition IA en attente de validation.</p>
            </div>
          ) : (
            <div className="cc-list">
              {queue.map((c) => {
                const id = complaintId(c);
                const plan = (() => {
                  try {
                    return JSON.parse(c.aiResolutionPlan || '{}');
                  } catch {
                    return {};
                  }
                })();
                return (
                  <article key={id} className="cc-card" style={{ borderLeft: `4px solid ${PRIORITY_COLOR[c.aiPriority] || '#94a3b8'}` }}>
                    <div className="cc-meta">
                      <span className="cc-badge" style={{ background: '#fef2f2', color: PRIORITY_COLOR[c.aiPriority] }}>
                        {c.aiPriority || 'medium'} · {c.aiCategory || 'other'}
                      </span>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>
                        {new Date(c.createdAt).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <h3 style={{ margin: '8px 0 4px' }}>{c.subject}</h3>
                    <p style={{ margin: '0 0 8px', fontSize: 14, color: '#64748b' }}>
                      {c.user?.name || c.user?.email || 'Client'} — {c.message?.slice(0, 200)}
                      {c.message?.length > 200 ? '…' : ''}
                    </p>
                    {plan.steps?.length > 0 && (
                      <ul style={{ margin: '0 0 12px', paddingLeft: 18, fontSize: 13 }}>
                        {plan.steps.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    )}
                    <label style={{ fontSize: 12, fontWeight: 700 }}>Réponse proposée (modifiable)</label>
                    <textarea
                      rows={4}
                      style={{ width: '100%', marginTop: 6, marginBottom: 12 }}
                      value={editResponse[id] ?? c.aiProposedResponse ?? ''}
                      onChange={(e) => setEditResponse((prev) => ({ ...prev, [id]: e.target.value }))}
                    />
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="cc-submit"
                        style={{ background: '#059669' }}
                        disabled={busy === id}
                        onClick={() => handleValidate(c, true)}
                      >
                        <CheckCircle size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                        Valider et envoyer
                      </button>
                      <button
                        type="button"
                        className="cc-btn-danger"
                        disabled={busy === id}
                        onClick={() => handleValidate(c, false)}
                      >
                        <XCircle size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                        Rejeter
                      </button>
                    </div>
                    {c.aiConfidence != null && (
                      <p style={{ margin: '10px 0 0', fontSize: 12, color: '#6b7280' }}>
                        Confiance IA : {Math.round(c.aiConfidence * 100)} %
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const btnLight = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 14px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.4)',
  background: 'rgba(255,255,255,0.15)',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 13,
};

export default AdminIncidentsMlPage;
