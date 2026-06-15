import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain, Heart, RefreshCw, Sparkles, Calendar, ShoppingCart, Stethoscope, AlertTriangle,
} from 'lucide-react';
import { fetchClientAdvancedPack } from '../services/advancedAiService';
import { DEMO_CLIENT_ADVANCED_AI } from '../utils/clientDemoData';
import usePlatformRefresh from '../hooks/usePlatformRefresh';

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 20,
  border: '1px solid #e2e8f0',
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
};

const URGENCY_COLORS = { urgent: '#dc2626', soon: '#d97706', normal: '#059669' };
const URGENCY_LABELS = { urgent: 'Urgent', soon: 'Bientôt', normal: 'Normal' };

const ClientAdvancedAiPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const pack = await fetchClientAdvancedPack();
      setData(pack?.pets ? pack : DEMO_CLIENT_ADVANCED_AI);
    } catch {
      setData(DEMO_CLIENT_ADVANCED_AI);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  usePlatformRefresh(load, [load]);

  const d = data || DEMO_CLIENT_ADVANCED_AI;

  const addToCart = (name) => {
    window.dispatchEvent(new CustomEvent('addToCart', {
      detail: { name, price: 0, quantity: 1 },
    }));
  };

  if (loading) {
    return <div style={{ padding: 48, textAlign: 'center' }}>Analyse IA de vos animaux…</div>;
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: 24,
          padding: '28px 24px',
          borderRadius: 20,
          background: 'linear-gradient(135deg, #312e81, #4c1d95, #7c3aed)',
          color: '#fff',
        }}
      >
        <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Brain size={28} /> IA avancée — Santé & réappro intelligent
        </h1>
        <p style={{ margin: 0, opacity: 0.9, fontSize: 14, maxWidth: 560 }}>
          Conseiller santé Groq, score bien-être par animal et prédictions de réapprovisionnement basées sur vos achats.
        </p>
        <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {d.groqPowered && <span style={badge}><Sparkles size={12} /> Groq</span>}
          {d.mode === 'demo' && <span style={{ ...badge, background: '#fef9c3', color: '#854d0e' }}>Mode démo</span>}
          <button type="button" onClick={load} style={btnLight}><RefreshCw size={14} /> Actualiser</button>
          <Link to="/client-ai" style={{ ...btnLight, textDecoration: 'none' }}>Chat catalogue</Link>
          <Link to="/client-ml-agent" style={{ ...btnLight, textDecoration: 'none' }}>Agent ML</Link>
        </div>
      </motion.div>

      {d.healthSummary && (
        <div style={{ ...card, marginBottom: 20, background: '#f5f3ff', borderColor: '#c4b5fd' }}>
          <h3 style={{ margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800 }}>
            <Heart size={20} color="#7c3aed" /> Synthèse santé IA
          </h3>
          <p style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap', fontSize: 14, color: '#334155' }}>
            {d.healthSummary}
          </p>
        </div>
      )}

      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Profil santé par animal</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        {(d.pets || []).map((pet) => (
          <div key={pet.id} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{pet.name}</h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
                  {pet.breed} · {pet.type} · {pet.ageYears != null ? `${pet.ageYears} an(s)` : '—'}
                  {pet.weightKg != null ? ` · ${pet.weightKg} kg` : ''}
                </p>
              </div>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: pet.healthScore >= 80 ? '#dcfce7' : pet.healthScore >= 65 ? '#fef3c7' : '#fee2e2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: 16,
                color: pet.healthScore >= 80 ? '#166534' : pet.healthScore >= 65 ? '#92400e' : '#991b1b',
              }}
              >
                {pet.healthScore}
              </div>
            </div>
            <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: '#059669' }}>{pet.healthLabel}</p>
            <p style={{ margin: '0 0 8px', fontSize: 13, color: '#475569' }}>{pet.nutritionTip}</p>
            <p style={{ margin: 0, fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Stethoscope size={14} /> {pet.vetReminder}
            </p>
            {pet.riskFlags?.length > 0 && (
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {pet.riskFlags.map((f) => (
                  <span key={f} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: '#fef3c7', color: '#92400e', fontWeight: 700 }}>
                    <AlertTriangle size={10} style={{ verticalAlign: 'middle' }} /> {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Calendar size={20} color="#7c3aed" /> Réapprovisionnement intelligent
      </h2>
      <div style={{ ...card, marginBottom: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
              <th style={th}>Produit</th>
              <th style={th}>Animal</th>
              <th style={th}>Jours restants</th>
              <th style={th}>Urgence</th>
              <th style={th}>Confiance</th>
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {(d.smartReorder || []).map((r) => (
              <tr key={r.productId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={td}><strong>{r.productName}</strong></td>
                <td style={td}>{r.petName}</td>
                <td style={td}>{r.daysUntilEmpty} j · {r.suggestedDate}</td>
                <td style={td}>
                  <span style={{ color: URGENCY_COLORS[r.urgency], fontWeight: 700 }}>
                    {URGENCY_LABELS[r.urgency] || r.urgency}
                  </span>
                </td>
                <td style={td}>{r.confidence != null ? `${(r.confidence * 100).toFixed(0)}%` : '—'}</td>
                <td style={td}>
                  <button type="button" onClick={() => addToCart(r.productName)} style={cartBtn}>
                    <ShoppingCart size={14} /> Commander
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!d.smartReorder?.length && (
          <p style={{ color: '#64748b', margin: 0 }}>Passez des commandes pour activer les prédictions de réappro.</p>
        )}
      </div>

      {(d.recommendations || []).length > 0 && (
        <>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Recommandations IA</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            {d.recommendations.map((rec) => (
              <div key={rec.name} style={card}>
                <p style={{ margin: '0 0 6px', fontWeight: 800 }}>{rec.name}</p>
                <p style={{ margin: '0 0 10px', fontSize: 13, color: '#64748b' }}>{rec.reason}</p>
                {rec.score != null && (
                  <span style={{ fontSize: 12, color: '#7c3aed', fontWeight: 700 }}>
                    Score {(rec.score * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const th = { padding: '10px 8px' };
const td = { padding: '10px 8px' };
const badge = { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.15)', fontSize: 12, fontWeight: 700 };
const btnLight = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' };
const cartBtn = { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 8, border: 'none', background: '#7c3aed', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' };

export default ClientAdvancedAiPage;
