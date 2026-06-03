import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, ArrowRight } from 'lucide-react';
import useVetMlAgents from '../hooks/useVetMlAgents';

const VetMlPanel = ({ compact = false }) => {
  const { vet, clinic, pharmacy, loading } = useVetMlAgents();

  if (loading) return <p style={{ color: '#94a3b8', fontSize: 14 }}>Chargement IA…</p>;
  if (!vet && !clinic && !pharmacy) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #ecfeff, #e0f2fe)',
        borderRadius: 16,
        padding: compact ? 14 : 20,
        marginBottom: compact ? 16 : 24,
        border: '1px solid #7dd3fc',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
        <Brain size={22} color="#0e7490" />
        <strong style={{ flex: 1 }}>Agents IA vétérinaires</strong>
        {(vet?.pythonPowered || clinic?.pythonPowered) && <span style={badge}>XGBoost</span>}
        {(vet?.groqPowered || clinic?.groqPowered || pharmacy?.groqPowered) && (
          <span style={{ ...badge, background: '#ecfdf5', color: '#059669' }}>Groq</span>
        )}
        <Link to="/vet/ml-agent" style={{ fontSize: 12, fontWeight: 700, color: '#0e7490', textDecoration: 'none' }}>
          Hub IA <ArrowRight size={12} />
        </Link>
      </div>
      {vet?.seniorPetCount != null && (
        <p style={{ margin: '0 0 6px', fontSize: 14 }}>
          Patients senior : <strong>{vet.seniorPetCount}</strong>
        </p>
      )}
      {clinic?.clinicStats?.vaccinesDueSoon > 0 && (
        <p style={{ margin: 0, fontSize: 13, color: '#b45309' }}>
          {clinic.clinicStats.vaccinesDueSoon} rappel(s) vaccin à planifier
        </p>
      )}
      {pharmacy?.lowStockAlerts?.length > 0 && (
        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#dc2626' }}>
          {pharmacy.lowStockAlerts.length} alerte(s) stock pharmacie
        </p>
      )}
    </div>
  );
};

const badge = {
  fontSize: 11,
  fontWeight: 700,
  padding: '4px 10px',
  borderRadius: 999,
  background: '#cffafe',
  color: '#0e7490',
};

export default VetMlPanel;
