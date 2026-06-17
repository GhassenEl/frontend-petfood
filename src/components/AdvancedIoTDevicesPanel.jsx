import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Thermometer, Scale, Refrigerator, Smartphone, ExternalLink } from 'lucide-react';
import { ADVANCED_IOT_FEATURES, DEMO_ADVANCED_IOT_DEVICES } from '../config/advancedIotPremiumCatalog';

const ICONS = { 'esp32-cam': Camera, 'temp-humidity': Thermometer, 'smart-scale': Scale, 'smart-fridge': Refrigerator, 'mobile-alerts': Smartphone };

const AdvancedIoTDevicesPanel = () => {
  const d = DEMO_ADVANCED_IOT_DEVICES;

  return (
    <div className="iot-advanced-panel">
      <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>IoT avancé — écosystème connecté</h2>
      <p style={{ margin: '0 0 20px', fontSize: 14, color: '#64748b' }}>
        ESP32-CAM, capteurs environnement, balance, réfrigérateur intelligent et alertes mobile.
      </p>

      <div className="iot-advanced-grid">
        {ADVANCED_IOT_FEATURES.map((f) => {
          const Icon = ICONS[f.id] || Camera;
          const href = f.anchor ? `${f.route.split('?')[0]}?tab=advanced#${f.anchor}` : f.route;
          return (
            <article key={f.id} id={f.id} className="iot-advanced-card">
              <div className="iot-advanced-card__head">
                <Icon size={20} color="#0ea5e9" />
                <strong>{f.label}</strong>
              </div>
              <p>{f.description}</p>
              <span className="iot-advanced-metric">{f.metric}</span>
              <Link to={href} className="iot-advanced-link">Configurer <ExternalLink size={11} /></Link>
            </article>
          );
        })}
      </div>

      <div className="iot-advanced-live" style={{ marginTop: 20 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>État temps réel</h3>
        <div className="iot-advanced-live-grid">
          <div id="sensors" className="iot-advanced-live-card">
            <Thermometer size={18} color="#d97706" />
            <strong>{d.sensors.temperature}°C</strong>
            <span>Température · {d.sensors.location}</span>
            <small>{d.sensors.humidity} % humidité</small>
          </div>
          <div id="scale" className="iot-advanced-live-card">
            <Scale size={18} color="#059669" />
            <strong>{d.scale.todayGrams} g</strong>
            <span>Balance — {d.scale.petName}</span>
            <small>Adhérence {d.scale.adherence} %</small>
          </div>
          <div id="fridge" className="iot-advanced-live-card">
            <Refrigerator size={18} color="#0369a1" />
            <strong>{d.fridge.temperature}°C</strong>
            <span>Réfrigérateur intelligent</span>
            <small>Lot {d.fridge.batchCode} · J-{d.fridge.expiryDays}</small>
          </div>
          <div id="push" className="iot-advanced-live-card">
            <Smartphone size={18} color="#7c3aed" />
            <strong>{d.mobilePush.unread}</strong>
            <span>Alertes smartphone</span>
            <small>{d.mobilePush.lastAlert}</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedIoTDevicesPanel;
