import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useIntelligencePlatform from '../hooks/useIntelligencePlatform';
import { countIntelligencePillars } from '../config/intelligencePillarsCatalog';
import MobileBottomNav, { AUTH_PUBLIC_MOBILE_NAV } from '../components/MobileBottomNav';
import EthicalDisclaimer from '../components/EthicalDisclaimer';
import './IntelligencePlatformPage.css';

const PillarCard = ({ pillar, userRole }) => {
  const visibleRoutes = pillar.routes.filter(
    (r) => !r.roles?.length || r.roles.includes(userRole) || userRole === 'admin'
  );

  return (
    <article className="ip-pillar" style={{ '--pillar-color': pillar.color }}>
      <header className="ip-pillar__head">
        <span className="ip-pillar__icon" aria-hidden>{pillar.icon}</span>
        <div>
          <h2>{pillar.title}</h2>
          {pillar.live && <span className="ip-live-badge">ML live</span>}
        </div>
      </header>

      <ul className="ip-goals">
        {pillar.goals.map((g) => (
          <li key={g}>{g}</li>
        ))}
      </ul>

      <div className="ip-algorithms">
        {pillar.algorithms.map((algo) => (
          <span key={algo} className="ip-algo-chip">{algo}</span>
        ))}
      </div>

      <blockquote className="ip-example">
        <strong>{pillar.example.label} :</strong> {pillar.metrics?.insight || pillar.example.text}
      </blockquote>

      {pillar.metrics && (
        <div className="ip-metrics">
          {pillar.id === 'sales-analysis' && (
            <>
              <div><small>Part top produit</small><strong>{pillar.metrics.topProductShare}%</strong></div>
              <div><small>Pic demande</small><strong>{pillar.metrics.peakMonth}</strong></div>
              <div><small>CA prévu</small><strong>{Number(pillar.metrics.forecastRevenue).toLocaleString('fr-FR')} TND</strong></div>
            </>
          )}
          {pillar.id === 'sentiment' && (
            <>
              <div><small>Positifs</small><strong>{pillar.metrics.positivePct}%</strong></div>
              <div><small>Confiance</small><strong>{Math.round((pillar.metrics.avgConfidence || 0) * 100)}%</strong></div>
            </>
          )}
          {pillar.id === 'iot-analysis' && (
            <>
              <div><small>Capteurs</small><strong>{pillar.metrics.activeSensors}</strong></div>
              <div><small>Anomalies</small><strong>{pillar.metrics.anomalyCount}</strong></div>
            </>
          )}
          {pillar.id === 'computer-vision' && (
            <>
              <div><small>ESP32-CAM</small><strong>{pillar.metrics.camerasOnline}</strong></div>
              <div><small>Qualité</small><strong>{pillar.metrics.qualityScore}/100</strong></div>
            </>
          )}
          {pillar.id === 'fraud-detection' && (
            <div><small>Alertes</small><strong>{pillar.metrics.fraudAlerts}</strong></div>
          )}
          {pillar.id === 'digital-twin' && (
            <div><small>Jumeaux actifs</small><strong>{pillar.metrics.twinsActive}</strong></div>
          )}
        </div>
      )}

      {visibleRoutes.length > 0 && (
        <div className="ip-routes">
          {visibleRoutes.map((r) => (
            <Link key={r.path} to={r.path} className="ip-route-link">{r.label} →</Link>
          ))}
        </div>
      )}
    </article>
  );
};

const IntelligencePlatformPage = () => {
  const { user } = useAuth();
  const { pack, loading, error, refresh } = useIntelligencePlatform();
  const stats = countIntelligencePillars();
  const role = user?.role || null;

  return (
    <div className="ip-page">
      <Link to={user ? (role === 'admin' ? '/admin/dashboard' : '/client-products') : '/'} className="ip-back">
        ← Retour
      </Link>

      <header className="ip-hero">
        <p className="ip-hero__eyebrow">PetfoodTN Intelligence</p>
        <h1>Plateforme IA &amp; Business Intelligence</h1>
        <p>
          Analyse des ventes, prévision stocks ML, recommandations, sentiments BERT,
          IoT, vision ESP32-CAM, BI, nutrition, fraude et jumeau numérique — 10 piliers unifiés.
        </p>
        <div className="ip-stats">
          <div className="ip-stat"><strong>{stats.total}</strong><span>Piliers IA</span></div>
          <div className="ip-stat"><strong>{stats.algorithms}+</strong><span>Algorithmes</span></div>
          <div className="ip-stat"><strong>{pack?.summary?.liveModels ?? '—'}</strong><span>Modèles ML</span></div>
          <div className="ip-stat">
            <strong>{pack?.pythonPowered ? 'Python' : 'Demo'}</strong>
            <span>Moteur</span>
          </div>
        </div>
        <button type="button" className="ip-refresh" onClick={() => refresh()} disabled={loading}>
          {loading ? 'Chargement…' : 'Actualiser insights'}
        </button>
      </header>

      {error && (
        <p className="ip-error" role="alert">Mode démo — API ML indisponible ({error.message})</p>
      )}

      <EthicalDisclaimer variant="ai" />

      <section className="ip-grid">
        {(pack?.pillars || []).map((pillar) => (
          <PillarCard key={pillar.id} pillar={pillar} userRole={role} />
        ))}
      </section>

      <footer className="ip-footer">
        <Link to="/enterprise">Fonctionnalités entreprise</Link>
        <Link to="/admin/ml-agent">Agent ML admin</Link>
        <Link to="/client-digital-twin">Jumeau numérique</Link>
        <Link to="/compliance">Conformité</Link>
      </footer>

      {!user && <MobileBottomNav items={AUTH_PUBLIC_MOBILE_NAV} />}
    </div>
  );
};

export default IntelligencePlatformPage;
