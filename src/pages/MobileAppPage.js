import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Bell, QrCode, Truck, Cpu, PawPrint, Download } from 'lucide-react';
import { MOBILE_CLOUD_DOMAINS } from '../config/mobileCloudCatalog';
import { DEMO_ADVANCED_IOT_DEVICES } from '../config/advancedIotPremiumCatalog';
import IoTMobileBridgePanel from '../components/IoTMobileBridgePanel';
import MobileBottomNav, { AUTH_PUBLIC_MOBILE_NAV } from '../components/MobileBottomNav';
import './EnterpriseFeaturesPage.css';
import './ClientIoTHub.css';

const mobileDomain = MOBILE_CLOUD_DOMAINS.find((d) => d.id === 'mobile');

const MODULES = [
  { id: 'push', icon: Bell, title: 'Notifications push', desc: 'Alertes IoT qualité, livraison en route et rappels santé animal.' },
  { id: 'qr', icon: QrCode, title: 'Scan QR Code', desc: 'Scannez le lot sur l\'emballage — vérification blockchain instantanée.' },
  { id: 'delivery', icon: Truck, title: 'Suivi livraison', desc: 'Carte temps réel, ETA livreur et température chaîne du froid.' },
  { id: 'iot', icon: Cpu, title: 'Données IoT', desc: 'ESP32-CAM PetFoodIoT, distributeur intelligent et historique capteurs.' },
  { id: 'pets', icon: PawPrint, title: 'Profil animal', desc: 'Ajoutez vos animaux, poids, race — nutrition IA synchronisée.' },
];

const MobileAppPage = () => (
  <div className="ef-page">
    <Link to="/enterprise" className="ef-back">← Fonctionnalités entreprise</Link>

    <header className="ef-hero" style={{ background: 'linear-gradient(135deg, #059669 0%, #0f766e 50%, #7c3aed 100%)' }}>
      <h1><Smartphone size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />Application Mobile Flutter</h1>
      <p>
        PetfoodTN Android &amp; iOS — companion IoT, boutique, BI client et sécurité.
        Code source : <code style={{ opacity: 0.9 }}>mobile_app/</code>
      </p>
      <div className="ef-stats">
        <div className="ef-stat"><strong>6</strong><span>Modules</span></div>
        <div className="ef-stat"><strong>Flutter 3.11+</strong><span>SDK</span></div>
        <div className="ef-stat"><strong>Android/iOS</strong><span>Plateformes</span></div>
      </div>
    </header>

    <section style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 18, marginBottom: 12 }}>Modules disponibles</h2>
      <div className="ef-grid">
        {MODULES.map(({ id, icon: Icon, title, desc }) => (
          <article key={id} id={id} className="ef-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon size={18} color="#059669" /> {title}
            </h3>
            <p>{desc}</p>
            <span className="ef-badge ef-badge--ok">Actif</span>
            {id === 'iot' && (
              <Link to="/client-iot" style={{ display: 'inline-block', marginTop: 10, fontSize: 12, fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>
                Hub IoT web →
              </Link>
            )}
          </article>
        ))}
      </div>
    </section>

    <section className="iot-mobile-bridge-wrap" style={{ marginBottom: 24 }} id="iot-sync">
      <h2 style={{ fontSize: 18, marginBottom: 12 }}>Synchronisation IoT web ↔ mobile</h2>
      <IoTMobileBridgePanel
        mobilePush={DEMO_ADVANCED_IOT_DEVICES.mobilePush}
        alertCount={6}
        healthScore={76}
        devicesOnline={4}
        devicesTotal={4}
      />
    </section>

    <section className="ef-card" style={{ marginBottom: 24 }}>
      <h3 style={{ margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Download size={18} /> Installation développeur
      </h3>
      <pre style={{ margin: 0, padding: 14, background: '#0f172a', color: '#e2e8f0', borderRadius: 10, fontSize: 12, overflow: 'auto' }}>
{`cd mobile_app
flutter pub get
flutter run                    # émulateur / appareil
flutter build apk --release    # Android
flutter build ios --release    # iOS (macOS requis)`}
      </pre>
      <p style={{ margin: '12px 0 0', fontSize: 13, color: '#64748b' }}>
        API par défaut : port 5002 — configurable dans l&apos;écran Profil.
      </p>
    </section>

    {mobileDomain && (
      <section>
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Liens web associés</h2>
        <div className="ef-grid">
          <Link to="/client-traceability" className="ef-card ef-link" style={{ textDecoration: 'none', color: 'inherit' }}>
            <strong>Traçabilité blockchain</strong>
            <p style={{ margin: '6px 0 0', fontSize: 12, color: '#64748b' }}>Vérifier un lot après scan QR</p>
          </Link>
          <Link to="/client-iot" className="ef-card ef-link" style={{ textDecoration: 'none', color: 'inherit' }}>
            <strong>Hub IoT client</strong>
            <p style={{ margin: '6px 0 0', fontSize: 12, color: '#64748b' }}>Version web des capteurs</p>
          </Link>
          <Link to="/client-smart-delivery" className="ef-card ef-link" style={{ textDecoration: 'none', color: 'inherit' }}>
            <strong>Livraison intelligente</strong>
            <p style={{ margin: '6px 0 0', fontSize: 12, color: '#64748b' }}>Suivi web temps réel</p>
          </Link>
        </div>
      </section>
    )}

    <MobileBottomNav items={AUTH_PUBLIC_MOBILE_NAV} />
  </div>
);

export default MobileAppPage;
