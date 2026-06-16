import React from 'react';
import { Activity, HeartPulse } from 'lucide-react';
import { Link } from 'react-router-dom';

const scoreColor = (score) => {
  if (score >= 80) return '#16a34a';
  if (score >= 55) return '#d97706';
  return '#dc2626';
};

/** Surveillance des habitudes alimentaires et détection comportementale */
const FeederHabitMonitor = ({ analysis, petName }) => {
  if (!analysis) return null;

  const { healthScore, insights, todayGrams, dailyTarget, abnormal, missedMealsCount } = analysis;

  return (
    <div style={{
      background: 'white',
      borderRadius: 16,
      padding: 20,
      border: abnormal ? '1px solid #fecaca' : '1px solid #e2e8f0',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      gridColumn: '1 / -1',
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={20} color="#7c3aed" />
          Surveillance des habitudes alimentaires
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <HeartPulse size={18} color={scoreColor(healthScore)} />
          <span style={{ fontWeight: 800, color: scoreColor(healthScore) }}>Score santé {healthScore}/100</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 16 }}>
        <Metric label="Aujourd'hui" value={`${todayGrams} g`} sub={`Objectif ${dailyTarget} g`} />
        <Metric
          label="Statut"
          value={abnormal ? 'Anomalie' : 'Normal'}
          sub={abnormal ? 'Surveillance active' : 'Habitudes stables'}
          warn={abnormal}
        />
        <Metric label="Repas manqués" value={missedMealsCount} sub="Aujourd'hui" warn={missedMealsCount > 0} />
      </div>

      {insights.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
          Collecte des données en cours… Les tendances apparaîtront après plusieurs jours de suivi IoT.
        </p>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {insights.map((ins, i) => (
            <li
              key={i}
              style={{
                padding: '10px 12px',
                background: ins.icon.includes('⚠') || ins.icon.includes('📉') ? '#fef2f2' : '#f0fdf4',
                borderRadius: 10,
                fontSize: 13,
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
              }}
            >
              <span>{ins.icon}</span>
              <span>{ins.text}</span>
            </li>
          ))}
        </ul>
      )}

      {abnormal && (
        <p style={{ margin: '14px 0 0', fontSize: 12, color: '#64748b' }}>
          Un changement d&apos;appétit peut signaler un problème de santé.{' '}
          <Link to="/medical-dossier" style={{ color: '#0ea5e9', fontWeight: 700 }}>Consulter le carnet de santé</Link>
          {' '}ou{' '}
          <Link to="/client-teleconsult" style={{ color: '#7c3aed', fontWeight: 700 }}>téléconsultation</Link>.
        </p>
      )}
    </div>
  );
};

const Metric = ({ label, value, sub, warn }) => (
  <div style={{
    padding: 14,
    borderRadius: 12,
    background: warn ? '#fef2f2' : '#f8fafc',
    border: `1px solid ${warn ? '#fecaca' : '#e2e8f0'}`,
  }}>
    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{label}</div>
    <div style={{ fontSize: 20, fontWeight: 800, color: warn ? '#b91c1c' : '#0f172a', margin: '4px 0' }}>{value}</div>
    <div style={{ fontSize: 11, color: '#94a3b8' }}>{sub}</div>
  </div>
);

export default FeederHabitMonitor;
