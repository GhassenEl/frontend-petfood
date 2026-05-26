import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NutriProHistory = () => {
  const [plans, setPlans] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const p = JSON.parse(localStorage.getItem('nutripro:plans') || '[]');
    setPlans(Array.isArray(p) ? p : []);
  }, []);

  const viewPlan = (plan) => {
    // simple show details page: navigate back to NutriPro and prefill sessionStorage for quick view
    try {
      sessionStorage.setItem('nutripro:viewPlan', JSON.stringify(plan));
    } catch (e) {}
    navigate('/smart-food-agent');
  };

  const deletePlan = (id) => {
    const next = plans.filter((p) => p.id !== id);
    setPlans(next);
    localStorage.setItem('nutripro:plans', JSON.stringify(next));
  };

  if (!plans || plans.length === 0) {
    return (
      <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ fontWeight: 900 }}>Historique NutriPro</h2>
        <div style={{ marginTop: 12, padding: 18, borderRadius: 12, background: 'white', border: '1px solid rgba(0,0,0,0.04)' }}>Aucun plan sauvegardé pour le moment.</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ fontWeight: 900 }}>Historique NutriPro</h2>
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {plans.map((p) => (
          <div key={p.id} style={{ padding: 14, borderRadius: 12, background: 'white', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 800 }}>{p.petName || 'Votre animal'}</div>
              <div style={{ color: '#6b7280', fontSize: 13 }}>{new Date(p.date).toLocaleString()}</div>
              <div style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{String(p.plan).slice(0, 240)}{String(p.plan).length > 240 ? '…' : ''}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={() => viewPlan(p)} style={{ padding: '8px 10px', borderRadius: 8, background: '#10b981', color: 'white', border: 'none' }}>Voir</button>
              <button onClick={() => deletePlan(p.id)} style={{ padding: '8px 10px', borderRadius: 8, background: '#ef4444', color: 'white', border: 'none' }}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NutriProHistory;
