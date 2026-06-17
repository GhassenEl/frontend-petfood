import React from 'react';
import { AlertTriangle, Users } from 'lucide-react';

/** Bannière alerte critique + notification client / vétérinaire. */
const FoodQualityCriticalBanner = ({ reading, lastAlert }) => {
  if (!reading?.isCritical && reading?.quality !== 'bad' && reading?.quality !== 'critical') {
    return null;
  }

  const score = reading.qualityScore ?? 0;
  const state = reading.state || 'Aliment altéré';
  const action = reading.recommendedAction || 'Remplacer l\'aliment';

  return (
    <div className="iot-fq-critical" role="alert">
      <AlertTriangle size={22} />
      <div>
        <strong>Qualité : {score}% — État : {state}</strong>
        <p>Action recommandée : {action}</p>
        {lastAlert?.sent && (
          <p className="iot-fq-critical-notify">
            <Users size={14} />
            Notification envoyée au client et au vétérinaire
            {lastAlert.mode === 'demo' && ' (mode démo)'}
          </p>
        )}
      </div>
    </div>
  );
};

export default FoodQualityCriticalBanner;
