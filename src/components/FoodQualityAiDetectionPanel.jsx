import React from 'react';
import { Brain } from 'lucide-react';
import { AI_DETECTION_KEYS } from '../utils/foodQualityEngine';

const SEV_COLORS = {
  none: '#94a3b8',
  low: '#d97706',
  medium: '#ea580c',
  high: '#dc2626',
};

const SEV_LABELS = {
  none: 'OK',
  low: 'Faible',
  medium: 'Modéré',
  high: 'Élevé',
};

/** Panneau détections module IA (cas d'usage PetFoodTN). */
const FoodQualityAiDetectionPanel = ({ reading }) => {
  const signals = reading?.aiSignals || {};

  return (
    <section className="iot-fq-ai">
      <h4><Brain size={16} /> Module IA — détection intelligente</h4>
      <p className="iot-fq-ai-hint">
        Analyse périodique des images ESP32-CAM : moisissures, couleur, insectes, dégradation et niveau du récipient.
      </p>
      <ul className="iot-fq-ai-grid">
        {AI_DETECTION_KEYS.map(({ key, label, icon }) => {
          const sig = signals[key] || {};
          const sev = sig.severity || 'none';
          return (
            <li key={key} className={`iot-fq-ai-item iot-fq-ai-item--${sev}`}>
              <span className="iot-fq-ai-icon">{icon}</span>
              <div>
                <strong>{label}</strong>
                <span>
                  {sig.detected ? SEV_LABELS[sev] : 'Aucune anomalie'}
                  {sig.value != null && ` · ${sig.value}${sig.unit ? ` ${sig.unit}` : ''}`}
                </span>
              </div>
              <span className="iot-fq-ai-dot" style={{ background: SEV_COLORS[sev] }} />
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default FoodQualityAiDetectionPanel;
