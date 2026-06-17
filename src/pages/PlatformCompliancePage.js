import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Leaf, Globe, CheckCircle, AlertCircle } from 'lucide-react';
import { getPlatformComplianceDashboard } from '../utils/platformComplianceEngine';
import FoodWasteSustainabilityPanel from '../components/FoodWasteSustainabilityPanel';
import MobileBottomNav, { AUTH_PUBLIC_MOBILE_NAV } from '../components/MobileBottomNav';
import './PlatformCompliancePage.css';

const TABS = [
  { id: 'iso', label: 'Normes ISO', icon: Shield },
  { id: 'eco', label: 'Environnement', icon: Leaf },
  { id: 'global', label: 'Certifications mondiales', icon: Globe },
];

const CertCard = ({ cert }) => {
  const days = cert.validUntil === 'Permanent'
    ? null
    : Math.ceil((new Date(cert.validUntil) - Date.now()) / 86400000);

  return (
    <article className={`pcmp-cert${cert.verified ? '' : ' pcmp-cert--pending'}`}>
      <div className="pcmp-cert__head">
        <span className="pcmp-cert__icon">{cert.icon}</span>
        <div>
          <strong>{cert.code}</strong>
          <p>{cert.label}</p>
        </div>
        {cert.verified ? (
          <CheckCircle size={20} color="#059669" aria-label="Vérifié" />
        ) : (
          <AlertCircle size={20} color="#d97706" aria-label="En cours" />
        )}
      </div>
      <ul className="pcmp-cert__meta">
        <li><span>Organisme</span> {cert.issuer}</li>
        <li><span>Périmètre</span> {cert.scope}</li>
        <li>
          <span>Validité</span>
          {cert.validUntil === 'Permanent' ? 'Permanente' : cert.validUntil}
          {days != null && days <= 90 && days > 0 && (
            <em className="pcmp-cert__expiry"> — renouvellement sous {days} j</em>
          )}
        </li>
      </ul>
    </article>
  );
};

const PlatformCompliancePage = () => {
  const [tab, setTab] = useState('iso');
  const dash = useMemo(() => getPlatformComplianceDashboard(), []);

  const certs =
    tab === 'iso' ? dash.iso : tab === 'eco' ? dash.eco : dash.global;

  return (
    <div className="pcmp-page">
      <header className="pcmp-hero">
        <Link to="/" className="pcmp-back">← Accueil PetfoodTN</Link>
        <h1>Conformité ISO &amp; engagement environnemental</h1>
        <p>
          PetfoodTN respecte les normes internationales de qualité, sécurité alimentaire,
          management environnemental et certifications mondiales reconnues.
        </p>
        <div className="pcmp-scores">
          <div className="pcmp-score pcmp-score--main">
            <strong>{dash.overallScore}</strong>
            <span>Score conformité global</span>
          </div>
          <div className="pcmp-score">
            <strong>{dash.isoScore}%</strong>
            <span>ISO</span>
          </div>
          <div className="pcmp-score">
            <strong>{dash.ecoScore}%</strong>
            <span>Environnement</span>
          </div>
          <div className="pcmp-score">
            <strong>{dash.globalScore}%</strong>
            <span>Mondial</span>
          </div>
          <div className="pcmp-score">
            <strong>{dash.verifiedCount}</strong>
            <span>Certifications actives</span>
          </div>
        </div>
      </header>

      <section className="pcmp-section">
        <h2>Engagements écologiques</h2>
        <div className="pcmp-commitments">
          {dash.commitments.map((c) => (
            <article key={c.id} className="pcmp-commitment">
              <span className="pcmp-commitment__icon">{c.icon}</span>
              <div>
                <strong>{c.label}</strong>
                <p>{c.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="pcmp-section">
        <FoodWasteSustainabilityPanel />
      </section>

      <section className="pcmp-section">
        <div className="pcmp-tabs">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`pcmp-tab${tab === id ? ' pcmp-tab--active' : ''}`}
              onClick={() => setTab(id)}
            >
              <Icon size={16} aria-hidden /> {label}
            </button>
          ))}
        </div>
        <div className="pcmp-cert-grid">
          {certs.map((c) => (
            <CertCard key={c.id} cert={c} />
          ))}
        </div>
      </section>

      <section className="pcmp-section pcmp-audit">
        <h2>Audits &amp; traçabilité</h2>
        <p>
          Dernier audit : <strong>{dash.lastAudit}</strong> · Prochain audit planifié :{' '}
          <strong>{dash.nextAudit}</strong>
        </p>
        <p className="pcmp-muted">
          Chaque lot alimentaire est vérifiable via la traçabilité blockchain (SHA-256) avec
          certifications ISO 22000, HACCP et Bio Tunisie — consultez vos commandes dans l&apos;espace client.
        </p>
        {dash.expiringSoon.length > 0 && (
          <div className="pcmp-expiring">
            <AlertCircle size={16} />
            {dash.expiringSoon.length} certification(s) en renouvellement prochain — processus engagé.
          </div>
        )}
      </section>

      <footer className="pcmp-footer">
        <p>{dash.summary}</p>
        <div className="pcmp-footer__links">
          <Link to="/register">Créer un compte</Link>
          <Link to="/login">Connexion</Link>
          <Link to="/enterprise">Fonctionnalités entreprise</Link>
          <a href="mailto:qualite@petfoodtn.tn">qualite@petfoodtn.tn</a>
        </div>
      </footer>
      <MobileBottomNav items={AUTH_PUBLIC_MOBILE_NAV} />
    </div>
  );
};

export default PlatformCompliancePage;
