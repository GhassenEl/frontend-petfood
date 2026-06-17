import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Bell, Wifi, Download, ChevronRight } from 'lucide-react';

const IoTMobileBridgePanel = ({
  mobilePush = {},
  alertCount = 0,
  healthScore = 0,
  devicesOnline = 0,
  devicesTotal = 0,
}) => {
  const unread = mobilePush.unread ?? 0;
  const enabled = mobilePush.enabled !== false;
  const lastAlert = mobilePush.lastAlert || 'Aucune alerte récente';

  return (
    <section className="iot-mobile-bridge" aria-labelledby="iot-mobile-bridge-title">
      <header className="iot-mobile-bridge__head">
        <div>
          <span className="iot-mobile-bridge__badge">Flutter · Android &amp; iOS</span>
          <h3 id="iot-mobile-bridge-title">Application mobile connectée</h3>
          <p>Recevez les alertes IoT en push — qualité croquettes, stock, hydratation et capteurs.</p>
        </div>
        <div className="iot-mobile-bridge__phone" aria-hidden>
          <Smartphone size={28} />
          {unread > 0 && <span className="iot-mobile-bridge__notif">{unread}</span>}
        </div>
      </header>

      <div className="iot-mobile-bridge__kpis">
        <div className="iot-mobile-bridge__kpi">
          <Bell size={16} color="#7c3aed" />
          <strong>{unread}</strong>
          <span>Push non lus</span>
        </div>
        <div className="iot-mobile-bridge__kpi">
          <Wifi size={16} color="#059669" />
          <strong>{devicesOnline}/{devicesTotal}</strong>
          <span>Appareils sync</span>
        </div>
        <div className="iot-mobile-bridge__kpi">
          <strong>{healthScore}</strong>
          <span>Score IoT</span>
        </div>
        <div className="iot-mobile-bridge__kpi">
          <strong>{alertCount}</strong>
          <span>Alertes actives</span>
        </div>
      </div>

      <div className="iot-mobile-bridge__status">
        <span className={`iot-mobile-bridge__sync${enabled ? ' is-on' : ''}`}>
          {enabled ? '● Sync mobile active' : '○ Notifications désactivées'}
        </span>
        <p className="iot-mobile-bridge__last">{lastAlert}</p>
      </div>

      <div className="iot-mobile-bridge__actions">
        <Link to="/mobile#iot" className="iot-mobile-bridge__btn iot-mobile-bridge__btn--primary">
          <Smartphone size={16} />
          Ouvrir l&apos;app mobile
          <ChevronRight size={14} />
        </Link>
        <Link to="/mobile#push" className="iot-mobile-bridge__btn">
          <Bell size={16} />
          Configurer les push
        </Link>
        <a
          href="https://github.com/GhassenEl/frontend-petfood/tree/main/mobile_app"
          target="_blank"
          rel="noopener noreferrer"
          className="iot-mobile-bridge__btn iot-mobile-bridge__btn--ghost"
        >
          <Download size={16} />
          Code Flutter
        </a>
      </div>
    </section>
  );
};

export default IoTMobileBridgePanel;
