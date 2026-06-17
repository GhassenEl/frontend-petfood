import React from 'react';
import { QUALITY_LABELS, NON_CONFORME_OLED, PETFOODIOT_BRAND } from '../utils/foodQualityEngine';

/** Simulation afficheur LCD — scénario PetFoodIoT (normal ou alerte). */
const FoodQualityOledDisplay = ({ reading }) => {
  const cur = reading || {};
  const meta = QUALITY_LABELS[cur.quality] || QUALITY_LABELS.good;
  const score = cur.qualityScore ?? '—';
  const stock = cur.stockLevelPct ?? '—';
  const brand = cur.oledBrand || PETFOODIOT_BRAND;
  const showAlert = cur.isNonConforme || cur.oledAlert?.show;

  const screenClass = `iot-fq-oled__screen${showAlert ? ' iot-fq-oled__screen--alert' : ''}`;

  if (showAlert) {
    const alertTitle = cur.oledAlert?.title || NON_CONFORME_OLED.alertTitle;
    const alertMsg = cur.oledAlert?.message || cur.state || NON_CONFORME_OLED.alertMessage;
    return (
      <div className="iot-fq-oled iot-fq-oled--alert-mode" aria-label="Afficheur LCD ESP32-CAM — alerte">
        <div className="iot-fq-oled__bezel">
          <span className="iot-fq-oled__brand">{brand}</span>
          <div className={screenClass}>
            <div className="iot-fq-oled__scanlines" aria-hidden />
            <div className="iot-fq-oled__alert-header">⚠ {alertTitle}</div>
            <div className="iot-fq-oled__alert-msg">{alertMsg}</div>
            <div className="iot-fq-oled__alert-score">
              Qualité : <strong>{score}%</strong>
            </div>
          </div>
          <span className="iot-fq-oled__hint">LCD · I2C · GPIO 14/15</span>
        </div>
      </div>
    );
  }

  const state = cur.state || meta.state || meta.label;

  return (
    <div className="iot-fq-oled" aria-label="Afficheur LCD ESP32-CAM">
      <div className="iot-fq-oled__bezel">
        <span className="iot-fq-oled__brand">{brand}</span>
        <div className={screenClass}>
          <div className="iot-fq-oled__scanlines" aria-hidden />
          <div className="iot-fq-oled__line">
            <span>Qualité :</span>
            <strong style={{ color: meta.color }}>{score}%</strong>
          </div>
          <div className="iot-fq-oled__line">
            <span>Stock :</span>
            <strong>{stock}%</strong>
          </div>
          <div className="iot-fq-oled__line">
            <span>État :</span>
            <strong>{state}</strong>
          </div>
        </div>
        <span className="iot-fq-oled__hint">LCD · I2C · GPIO 14/15</span>
      </div>
    </div>
  );
};

export default FoodQualityOledDisplay;
