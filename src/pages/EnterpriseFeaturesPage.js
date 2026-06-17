import React from 'react';
import { Link } from 'react-router-dom';
import { ENTERPRISE_DOMAINS, countEnterpriseFeatures } from '../config/enterpriseFeaturesCatalog';
import MobileBottomNav, { AUTH_PUBLIC_MOBILE_NAV } from '../components/MobileBottomNav';
import './EnterpriseFeaturesPage.css';

const statusLabel = (status) => (status === 'implemented' ? 'Actif' : status === 'partial' ? 'Partiel' : 'Planifié');

const FeatureCard = ({ feature }) => {
  const href = feature.anchor ? `${feature.route}#${feature.anchor}` : feature.route;
  return (
    <article className="ef-card">
      <h3>{feature.label}</h3>
      <p>{feature.description}</p>
      <div className="ef-card__foot">
        <span className={`ef-badge ef-badge--${feature.status === 'implemented' ? 'ok' : 'partial'}`}>
          {statusLabel(feature.status)}
        </span>
        <Link to={href} className="ef-link">Accéder →</Link>
      </div>
    </article>
  );
};

const EnterpriseFeaturesPage = () => {
  const stats = countEnterpriseFeatures();

  return (
    <div className="ef-page">
      <Link to="/" className="ef-back">← Accueil PetfoodTN</Link>

      <header className="ef-hero">
        <h1>Fonctionnalités entreprise PetfoodTN</h1>
        <p>
          IA vétérinaire, Machine Learning, cybersécurité, Business Intelligence,
          conformité ISO et développement durable — plateforme complète pour l&apos;écosystème pet food tunisien.
        </p>
        <div className="ef-stats">
          <div className="ef-stat"><strong>{stats.total}</strong><span>Fonctionnalités</span></div>
          <div className="ef-stat"><strong>{stats.implemented}</strong><span>Actives</span></div>
          <div className="ef-stat"><strong>{ENTERPRISE_DOMAINS.length}</strong><span>Domaines</span></div>
          <div className="ef-stat"><strong>24/7</strong><span>Assistant IA</span></div>
        </div>
      </header>

      {ENTERPRISE_DOMAINS.map((domain) => (
        <section key={domain.id} className="ef-domain">
          <div className="ef-domain__head">
            <span style={{ fontSize: 24 }}>{domain.icon}</span>
            <h2 style={{ borderColor: domain.color }}>{domain.label}</h2>
          </div>
          <div className="ef-grid">
            {domain.features.map((f) => (
              <FeatureCard key={f.id} feature={f} />
            ))}
          </div>
        </section>
      ))}

      <p style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', marginTop: 16 }}>
        <Link to="/compliance" style={{ color: '#0f766e', fontWeight: 700 }}>Conformité ISO</Link>
        {' · '}
        <Link to="/capabilities" style={{ color: '#0f766e', fontWeight: 700 }}>Capacités par rôle</Link>
        {' · '}
        <Link to="/login" style={{ color: '#0f766e', fontWeight: 700 }}>Connexion</Link>
      </p>

      <MobileBottomNav items={AUTH_PUBLIC_MOBILE_NAV} />
    </div>
  );
};

export default EnterpriseFeaturesPage;
