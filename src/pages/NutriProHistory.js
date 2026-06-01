import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const NutriProHistory = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let { data } = await api.get('/nutrition/plans');
      if (!data?.length) {
        const local = JSON.parse(localStorage.getItem('nutripro:plans') || '[]');
        if (Array.isArray(local) && local.length) {
          const sync = await api.post('/nutrition/plans/sync-local', { plans: local });
          data = sync.data?.plans || [];
          if (sync.data?.synced > 0) {
            localStorage.removeItem('nutripro:plans');
          }
        }
      }
      setPlans(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError('Impossible de charger l\'historique. Réessayez plus tard.');
      try {
        const local = JSON.parse(localStorage.getItem('nutripro:plans') || '[]');
        setPlans(Array.isArray(local) ? local : []);
      } catch {
        setPlans([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const viewPlan = (plan) => {
    try {
      sessionStorage.setItem('nutripro:viewPlan', JSON.stringify(plan));
    } catch (e) { /* ignore */ }
    navigate('/smart-food-agent');
  };

  const deletePlan = async (id) => {
    try {
      await api.delete(`/nutrition/plans/${id}`);
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      window.alert('Suppression échouée');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24, maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <p>Chargement de l&apos;historique nutrition…</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ fontWeight: 900, margin: 0 }}>Historique NutriPro</h2>
        <button
          type="button"
          onClick={() => navigate('/smart-food-agent')}
          style={{ padding: '10px 14px', borderRadius: 10, background: '#10b981', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}
        >
          + Nouveau plan
        </button>
      </div>
      <p style={{ color: '#64748b', marginTop: 8 }}>
        Vos plans alimentaires générés par NutriPro, sauvegardés sur votre compte.
      </p>

      {error && (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: '#fffbeb', color: '#b45309' }}>{error}</div>
      )}

      {!plans || plans.length === 0 ? (
        <div style={{ marginTop: 12, padding: 18, borderRadius: 12, background: 'white', border: '1px solid rgba(0,0,0,0.04)' }}>
          Aucun plan sauvegardé. Générez un plan dans{' '}
          <button type="button" onClick={() => navigate('/smart-food-agent')} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
            NutriPro
          </button>
          {' '}— il sera enregistré automatiquement.
        </div>
      ) : (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {plans.map((p) => (
            <div key={p.id} style={{ padding: 14, borderRadius: 12, background: 'white', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800 }}>
                  {p.petName || 'Votre animal'}
                  {p.petType ? ` (${p.petType})` : ''}
                  {p.goal ? ` — ${p.goal}` : ''}
                </div>
                <div style={{ color: '#6b7280', fontSize: 13 }}>
                  {new Date(p.date || p.createdAt).toLocaleString('fr-FR')}
                  {p.source === 'feeder' ? ' · Distributeur IoT' : ' · NutriPro'}
                </div>
                <div style={{ marginTop: 8, whiteSpace: 'pre-wrap', fontSize: 14, color: '#374151' }}>
                  {String(p.plan || p.planText).slice(0, 320)}
                  {String(p.plan || p.planText).length > 320 ? '…' : ''}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                <button type="button" onClick={() => viewPlan(p)} style={{ padding: '8px 10px', borderRadius: 8, background: '#10b981', color: 'white', border: 'none', cursor: 'pointer' }}>Voir</button>
                <button type="button" onClick={() => deletePlan(p.id)} style={{ padding: '8px 10px', borderRadius: 8, background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer' }}>Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NutriProHistory;
