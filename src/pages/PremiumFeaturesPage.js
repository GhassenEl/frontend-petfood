import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Dna, Sparkles } from 'lucide-react';
import { ADVANCED_IOT_FEATURES, DIGITAL_TWIN_PREMIUM_FEATURES } from '../config/advancedIotPremiumCatalog';
import MobileBottomNav, { AUTH_PUBLIC_MOBILE_NAV } from '../components/MobileBottomNav';
import './EnterpriseFeaturesPage.css';

const PremiumFeaturesPage = () => (
  <div className="ef-page">
    <Link to="/enterprise" className="ef-back">← Fonctionnalités entreprise</Link>

    <header className="ef-hero" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #0f766e 50%, #1e40af 100%)' }}>
      <h1><Sparkles size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />Fonctionnalités Premium PFE</h1>
      <p>
        IoT avancé PetFoodIoT et Smart Pet Digital Twin — jumeau numérique complet
        avec IA, alertes préventives et tableau de bord vétérinaire intelligent.
      </p>
      <div className="ef-stats">
        <div className="ef-stat"><strong>{ADVANCED_IOT_FEATURES.length}</strong><span>IoT avancé</span></div>
        <div className="ef-stat"><strong>{DIGITAL_TWIN_PREMIUM_FEATURES.length}</strong><span>Digital Twin</span></div>
        <div className="ef-stat"><strong>PFE</strong><span>Valorisation</span></div>
      </div>
    </header>

    <section style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 18, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Cpu size={20} color="#0ea5e9" /> IoT avancé
      </h2>
      <div className="ef-grid">
        {ADVANCED_IOT_FEATURES.map((f) => (
          <article key={f.id} className="ef-card">
            <h3>{f.icon} {f.label}</h3>
            <p>{f.description}</p>
            <div className="ef-card__foot">
              <span className="ef-badge ef-badge--ok">{f.metric}</span>
              <Link to={f.route} className="ef-link">Accéder →</Link>
            </div>
          </article>
        ))}
      </div>
      <p style={{ marginTop: 12 }}>
        <Link to="/client-iot?tab=advanced" className="ef-link" style={{ fontWeight: 700 }}>Centre IoT complet →</Link>
      </p>
    </section>

    <section style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 18, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Dna size={20} color="#7c3aed" /> Smart Pet Digital Twin
      </h2>
      <div className="ef-grid">
        {DIGITAL_TWIN_PREMIUM_FEATURES.map((f) => (
          <article key={f.id} className="ef-card">
            <h3>{f.icon} {f.label}</h3>
            <p>{f.description}</p>
            <div className="ef-card__foot">
              <span className="ef-badge ef-badge--ok">Actif</span>
              <Link to={f.route} className="ef-link">Accéder →</Link>
            </div>
          </article>
        ))}
      </div>
      <p style={{ marginTop: 12 }}>
        <Link to="/client-digital-twin" className="ef-link" style={{ fontWeight: 700 }}>Ouvrir le jumeau numérique →</Link>
      </p>
    </section>

    <MobileBottomNav items={AUTH_PUBLIC_MOBILE_NAV} />
  </div>
);

export default PremiumFeaturesPage;
