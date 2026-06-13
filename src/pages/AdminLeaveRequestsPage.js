import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Filter } from 'lucide-react';
import api from '../utils/api';
import { DEMO_ADMIN_LEAVE_REQUESTS, withDemoFallback } from '../utils/adminDemoData';
import {
  LEAVE_TYPES,
  getLeaveTypeLabel,
  getLeaveStatusMeta,
} from '../constants/leaveRequests';

const AdminLeaveRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [filterRole, setFilterRole] = useState('all');
  const [reviewModal, setReviewModal] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus && filterStatus !== 'all') params.set('status', filterStatus);
      if (filterRole && filterRole !== 'all') params.set('staffRole', filterRole);
      const qs = params.toString();
      const { data } = await api.get(`/leave-requests${qs ? `?${qs}` : ''}`);
      setRequests(withDemoFallback(data || [], DEMO_ADMIN_LEAVE_REQUESTS));
    } catch (error) {
      console.error(error);
      setRequests(DEMO_ADMIN_LEAVE_REQUESTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filterStatus, filterRole]);

  const pendingCount = useMemo(
    () => requests.filter((r) => r.status === 'pending').length,
    [requests]
  );

  const openReview = (req, decision) => {
    setReviewModal({ req, decision });
    setAdminNote('');
  };

  const submitReview = async () => {
    if (!reviewModal) return;
    setReviewing(true);
    try {
      await api.patch(`/leave-requests/${reviewModal.req.id || reviewModal.req._id}/review`, {
        status: reviewModal.decision,
        adminNote: adminNote || undefined,
      });
      setReviewModal(null);
      await load();
      window.alert(
        reviewModal.decision === 'approved'
          ? 'Demande approuvée'
          : 'Demande refusée'
      );
    } catch (error) {
      window.alert(error.response?.data?.error || 'Erreur');
    } finally {
      setReviewing(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

  const roleLabel = (r) => (r === 'vet' ? 'Vétérinaire' : r === 'livreur' ? 'Livreur' : r);

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={heroStyle}>
        <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800 }}>Congés & arrêts maladie</h1>
        <p style={{ margin: 0, color: '#6b7280' }}>
          Validez ou refusez les demandes des vétérinaires et livreurs.
          {filterStatus === 'pending' && pendingCount > 0 && (
            <strong style={{ color: '#b45309' }}> — {pendingCount} en attente</strong>
          )}
        </p>
      </motion.div>

      <div style={filterBarStyle}>
        <Filter size={18} color="#6b7280" />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={selectStyle}>
          <option value="pending">En attente</option>
          <option value="approved">Approuvées</option>
          <option value="rejected">Refusées</option>
          <option value="all">Toutes</option>
        </select>
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} style={selectStyle}>
          <option value="all">Tous les rôles</option>
          <option value="vet">Vétérinaires</option>
          <option value="livreur">Livreurs</option>
        </select>
      </div>

      {loading ? (
        <p style={{ color: '#6b7280' }}>Chargement…</p>
      ) : requests.length === 0 ? (
        <div style={cardStyle}>Aucune demande pour ces filtres.</div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {requests.map((req) => {
            const meta = getLeaveStatusMeta(req.status);
            const user = req.user || {};
            return (
              <article key={req.id || req._id} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <strong>{user.name || 'Utilisateur'}</strong>
                      <span style={roleBadgeStyle}>{roleLabel(req.staffRole)}</span>
                      <span style={{ ...statusPillStyle, color: meta.color, background: meta.bg }}>
                        {meta.label}
                      </span>
                    </div>
                    <p style={{ margin: '8px 0 4px', color: '#4b5563' }}>
                      {getLeaveTypeLabel(req.type)} — {formatDate(req.startDate)} → {formatDate(req.endDate)}
                    </p>
                    <p style={{ margin: 0, fontSize: 13, color: '#9ca3af' }}>{user.email}</p>
                    {req.reason && (
                      <p style={{ margin: '10px 0 0', fontSize: 14 }}><em>{req.reason}</em></p>
                    )}
                    {req.adminNote && (
                      <p style={{ margin: '8px 0 0', fontSize: 13, color: '#0369a1' }}>
                        Note admin : {req.adminNote}
                      </p>
                    )}
                  </div>
                  {req.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <button
                        type="button"
                        onClick={() => openReview(req, 'approved')}
                        style={approveBtnStyle}
                      >
                        <CheckCircle size={16} /> Approuver
                      </button>
                      <button
                        type="button"
                        onClick={() => openReview(req, 'rejected')}
                        style={rejectBtnStyle}
                      >
                        <XCircle size={16} /> Refuser
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {reviewModal && (
        <div style={overlayStyle}>
          <div style={{ ...cardStyle, width: 420, maxWidth: '100%' }}>
            <h3 style={{ marginTop: 0 }}>
              {reviewModal.decision === 'approved' ? 'Confirmer l\'approbation' : 'Confirmer le refus'}
            </h3>
            <p style={{ color: '#6b7280', fontSize: 14 }}>
              {reviewModal.req.user?.name} — {getLeaveTypeLabel(reviewModal.req.type)}
            </p>
            <label style={{ display: 'block', marginBottom: 16, fontSize: 14, fontWeight: 600 }}>
              Message à l&apos;employé (optionnel)
              <textarea
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: 8,
                  padding: 10,
                  borderRadius: 10,
                  border: '2px solid #e5e7eb',
                  boxSizing: 'border-box',
                }}
                placeholder="Ex. congé validé, bon repos…"
              />
            </label>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setReviewModal(null)} style={cancelBtnStyle}>
                Annuler
              </button>
              <button
                type="button"
                disabled={reviewing}
                onClick={submitReview}
                style={reviewModal.decision === 'approved' ? approveBtnStyle : rejectBtnStyle}
              >
                {reviewing ? '…' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const heroStyle = {
  background: 'linear-gradient(135deg, #fff7ed 0%, #fff 100%)',
  borderRadius: 20,
  padding: 24,
  marginBottom: 20,
};

const filterBarStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  marginBottom: 20,
  padding: '12px 16px',
  background: 'white',
  borderRadius: 14,
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
};

const selectStyle = {
  padding: '8px 12px',
  borderRadius: 10,
  border: '1px solid #e5e7eb',
  fontSize: 14,
};

const cardStyle = {
  background: 'white',
  borderRadius: 16,
  padding: 20,
  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
};

const roleBadgeStyle = {
  fontSize: 11,
  fontWeight: 700,
  padding: '4px 8px',
  borderRadius: 6,
  background: '#e0f2fe',
  color: '#0369a1',
};

const statusPillStyle = {
  fontSize: 11,
  fontWeight: 700,
  padding: '4px 10px',
  borderRadius: 999,
};

const approveBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '10px 14px',
  background: '#16a34a',
  color: 'white',
  border: 'none',
  borderRadius: 10,
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: 13,
};

const rejectBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '10px 14px',
  background: '#fef2f2',
  color: '#dc2626',
  border: '2px solid #fecaca',
  borderRadius: 10,
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: 13,
};

const cancelBtnStyle = {
  padding: '10px 16px',
  background: '#f3f4f6',
  border: 'none',
  borderRadius: 10,
  fontWeight: 600,
  cursor: 'pointer',
};

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
  zIndex: 1000,
};

export default AdminLeaveRequestsPage;
