import React from 'react';
import { QUALITY_LABELS } from '../utils/foodQualityEngine';

/** Simulation afficheur LCD/OLED connecté à l'ESP32-CAM. */
const FoodQualityOledDisplay = ({ reading }) => {
  const cur = reading || {};
  const meta = QUALITY_LABELS[cur.quality] || QUALITY_LABELS.good;
  const score = cur.qualityScore ?? '—';
  const state = cur.state || meta.state || meta.label;
  const stock = cur.stockLevelPct ?? '—';

  return (
    <div className="iot-fq-oled" aria-label="Afficheur OLED ESP32-CAM">
      <div className="iot-fq-oled__bezel">
        <span className="iot-fq-oled__brand">PetFoodTN IoT</span>
        <div className="iot-fq-oled__screen">
          <div className="iot-fq-oled__line">
            <span>Qualité :</span>
            <strong style={{ color: meta.color }}>{score}%</strong>
          </div>
          <div className="iot-fq-oled__line">
            <span>État :</span>
            <strong>{state}</strong>
          </div>
          <div className="iot-fq-oled__line">
            <span>Stock :</span>
            <strong>{stock}%</strong>
          </div>
          {cur.isCritical && (
            <div className="iot-fq-oled__alert">
              ⚠ {cur.recommendedAction || 'Remplacer l\'aliment'}
            </div>
          )}
        </div>
        <span className="iot-fq-oled__hint">SSD1306 · I2C · GPIO 14/15</span>
      </div>
    </div>
  );
};

export default FoodQualityOledDisplay;
