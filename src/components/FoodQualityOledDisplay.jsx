import React from 'react';
import { QUALITY_LABELS, NON_CONFORME_OLED } from '../utils/foodQualityEngine';

/** Simulation afficheur LCD/OLED — scénario normal ou alerte non conforme. */
const FoodQualityOledDisplay = ({ reading }) => {
  const cur = reading || {};
  const meta = QUALITY_LABELS[cur.quality] || QUALITY_LABELS.good;
  const score = cur.qualityScore ?? '—';
  const stock = cur.stockLevelPct ?? '—';
  const showAlert = cur.isNonConforme || cur.oledAlert?.show;

  if (showAlert) {
    const alertTitle = cur.oledAlert?.title || NON_CONFORME_OLED.alertTitle;
    const alertMsg = cur.oledAlert?.message || cur.state || NON_CONFORME_OLED.alertMessage;
    return (
      <div className="iot-fq-oled" aria-label="Afficheur OLED ESP32-CAM — alerte">
        <div className="iot-fq-oled__bezel">
          <span className="iot-fq-oled__brand">PetFoodTN IoT</span>
          <div className="iot-fq-oled__screen iot-fq-oled__screen--alert">
            <div className="iot-fq-oled__alert-header">⚠ {alertTitle}</div>
            <div className="iot-fq-oled__alert-msg">{alertMsg}</div>
            <div className="iot-fq-oled__alert-score">
              Qualité : <strong>{score}%</strong>
            </div>
          </div>
          <span className="iot-fq-oled__hint">SSD1306 · I2C · GPIO 14/15</span>
        </div>
      </div>
    );
  }

  const state = cur.state || meta.state || meta.label;

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
        </div>
        <span className="iot-fq-oled__hint">SSD1306 · I2C · GPIO 14/15</span>
      </div>
    </div>
  );
};

export default FoodQualityOledDisplay;
