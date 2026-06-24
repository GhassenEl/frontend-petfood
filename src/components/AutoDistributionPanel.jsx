import React, { useEffect, useMemo, useState } from 'react';
import { Play, Calendar, Zap, Clock, Target } from 'lucide-react';
import {
  computeSuggestedPortion,
  getTodayAdherence,
  formatCountdown,
} from '../utils/autoFeederEngine';

const card = {
  background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
  borderRadius: 16,
  padding: 20,
  border: '1px solid #bbf7d0',
  marginBottom: 16,
};

const btnPrimary = {
  padding: '10px 16px',
  borderRadius: 12,
  border: 'none',
  background: '#059669',
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: 13,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
};

const btnOutline = {
  ...btnPrimary,
  background: '#fff',
  color: '#059669',
  border: '2px solid #059669',
};

/**
 * Panneau distribution automatique — portion suggérée, compte à rebours, actions rapides.
 */
const AutoDistributionPanel = ({
  plan,
  stats,
  slots = [],
  nextMeal,
  reservoirLow = false,
  autoEnabled = true,
  loading = false,
  onDispense,
  onApplySchedules,
}) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const suggestion = useMemo(
    () => computeSuggestedPortion({ plan, stats, slots, reservoirLow }),
    [plan, stats, slots, reservoirLow, tick],
  );

  const adherence = useMemo(
    () => getTodayAdherence(stats?.todayGrams, plan?.dailyGrams || stats?.dailyAverage),
    [stats?.todayGrams, plan?.dailyGrams, stats?.dailyAverage],
  );

  const doneCount = slots.filter((s) => s.status === 'done').length;
  const totalActive = slots.filter((s) => s.enabled !== false).length;

  return (
    <section style={card} className="fd-auto-panel" aria-label="Distribution automatique">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#047857', letterSpacing: '0.06em' }}>
            {autoEnabled ? '● AUTO ACTIF' : '○ AUTO PAUSE'}
          </span>
          <h3 style={{ margin: '6px 0 4px', fontSize: 17, fontWeight: 800, color: '#14532d' }}>
            Distribution intelligente
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: '#166534', maxWidth: 420 }}>
            {suggestion.reason}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#059669', lineHeight: 1 }}>
            {suggestion.grams}
            <span style={{ fontSize: 14, fontWeight: 600 }}> g</span>
          </div>
          <small style={{ color: '#64748b' }}>portion suggérée</small>
        </div>
      </div>

      <div className="fd-auto-panel__progress">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#475569', marginBottom: 6 }}>
          <span><Target size={12} style={{ verticalAlign: 'middle' }} /> Objectif jour</span>
          <strong>{stats?.todayGrams ?? 0} / {plan?.dailyGrams || stats?.dailyAverage || '—'} g ({adherence.pct}%)</strong>
        </div>
        <div className="fd-auto-panel__track">
          <div
            className={`fd-auto-panel__fill fd-auto-panel__fill--${adherence.status}`}
            style={{ width: `${Math.min(100, adherence.pct)}%` }}
          />
        </div>
        {adherence.remaining > 0 && (
          <p style={{ margin: '6px 0 0', fontSize: 12, color: '#64748b' }}>
            Encore {adherence.remaining} g pour atteindre l&apos;objectif
          </p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, margin: '14px 0' }}>
        <div className="fd-auto-stat">
          <Clock size={16} color="#7c3aed" />
          <strong>{nextMeal ? formatCountdown(nextMeal.minutesUntil) : '—'}</strong>
          <span>Prochain repas{nextMeal ? ` (${nextMeal.time})` : ''}</span>
        </div>
        <div className="fd-auto-stat">
          <Zap size={16} color="#059669" />
          <strong>{doneCount}/{totalActive || '—'}</strong>
          <span>Repas servis aujourd&apos;hui</span>
        </div>
        <div className="fd-auto-stat">
          <Calendar size={16} color="#2563eb" />
          <strong>{plan?.mealsPerDay || 3}</strong>
          <span>Repas / jour planifiés</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <button
          type="button"
          style={btnPrimary}
          disabled={loading || reservoirLow}
          onClick={() => onDispense?.(suggestion.grams)}
        >
          <Play size={16} /> Distribuer {suggestion.grams} g
        </button>
        <button
          type="button"
          style={btnOutline}
          disabled={loading}
          onClick={() => onApplySchedules?.()}
        >
          <Calendar size={16} /> Appliquer planning auto
        </button>
      </div>
      {reservoirLow && (
        <p style={{ margin: '12px 0 0', fontSize: 12, color: '#b45309', fontWeight: 600 }}>
          Réservoir bas — rechargez avant la prochaine distribution automatique.
        </p>
      )}
    </section>
  );
};

export default AutoDistributionPanel;
