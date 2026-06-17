import React from 'react';
import { AlertTriangle, Bell, Users } from 'lucide-react';
import { NON_CONFORME_OLED } from '../utils/foodQualityEngine';

/** Bannière alerte — scénario alternatif ou critique. */
const FoodQualityCriticalBanner = ({ reading, lastAlert }) => {
  if (!reading?.isNonConforme && !reading?.isCritical
    && reading?.quality !== 'bad' && reading?.quality !== 'critical') {
    return null;
  }

  const score = reading.qualityScore ?? 0;
  const isAlternate = reading.isNonConforme && !reading.isCritical;

  if (isAlternate) {
    return (
      <div className="iot-fq-critical iot-fq-critical--alternate" role="alert">
        <AlertTriangle size={22} />
        <div>
          <strong>⚠ {NON_CONFORME_OLED.alertTitle} — {NON_CONFORME_OLED.alertMessage}</strong>
          <p>Qualité : {score}% · Anomalie IA détectée</p>
          {lastAlert?.sent && (
            <p className="iot-fq-critical-notify">
              <Bell size={14} />
              Alerte envoyée sur l&apos;application PetFoodTN
              {lastAlert.mode === 'demo' && ' (mode démo)'}
            </p>
          )}
        </div>
      </div>
    );
  }

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
