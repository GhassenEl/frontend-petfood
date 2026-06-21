import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import usePlatformRefresh from '../hooks/usePlatformRefresh';
import { ROLE_RSE_FOCUS } from '../config/rseEcologyCatalog';
import { fetchRseEcologyPack, toggleEcoPledge } from '../services/rseEcologyService';
import FoodWasteSustainabilityPanel from '../components/FoodWasteSustainabilityPanel';
import CarbonDeliveryPanel from '../components/CarbonDeliveryPanel';
import './RseEcologyHubPage.css';

const TAB_LABELS = {
  panorama: { label: 'Vue d\'ensemble', icon: '🌐' },
  ecology: { label: 'Écologie', icon: '♻️' },
  nature: { label: 'Nature', icon: '🌿' },
  environment: { label: 'Environnement', icon: '🌍' },
  social: { label: 'RSE sociale', icon: '🤝' },
  impact: { label: 'Mon impact', icon: '📊' },
  timeline: { label: 'Feuille de route', icon: '🗓️' },
};

const RseEcologyHubPage = ({ role: roleProp = 'public' }) => {
  const role = roleProp;
  const focus = ROLE_RSE_FOCUS[role] || ROLE_RSE_FOCUS.public;
  const [tab, setTab] = useState(focus.tabs[0]);
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [activePledges, setActivePledges] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchRseEcologyPack(role);
      setPack(data);
      if (data.clientPledges) {
        setActivePledges(data.clientPledges);
      }
      if (data.userEmail) {
        setUserEmail(data.userEmail);
      }
    } catch {
      setPack(null);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => { load(); }, [load]);
  usePlatformRefresh(load);

  const handlePledgeToggle = async (pledgeId) => {
    const email = userEmail || pack?.userEmail || 'client@petfood.tn';
    const next = await toggleEcoPledge(email, pledgeId);
    setActivePledges(next);
    load();
  };

  const visibleTabs = useMemo(
    () => focus.tabs.map((id) => ({ id, ...TAB_LABELS[id] })).filter((t) => t.label),
    [focus.tabs],
  );

  if (loading || !pack) {
    return <div className="rse-page rse-loader">Chargement du hub RSE…</div>;
  }

  const { platform, pillars, nature, ecology, pledges, timeline, commitments } = pack;

  return (
    <div className="rse-page">
      <header className="rse-hero">
        <h1>🌱 {focus.title}</h1>
        <p>{focus.subtitle}</p>
        <div className="rse-scores">
          <div className="rse-score rse-score--main">
            <strong>{platform.overall}</strong>
            <span>Score RSE global</span>
          </div>
          {platform.pillars.map((p) => (
            <div key={p.id} className="rse-score">
              <strong style={{ color: p.color }}>{p.score}</strong>
              <span>{p.label}</span>
            </div>
          ))}
          <div className="rse-score">
            <strong>{platform.initiatives}</strong>
            <span>Initiatives nature</span>
          </div>
        </div>
      </header>

      <div className="rse-tabs">
        {visibleTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`rse-tab${tab === t.id ? ' rse-tab--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'panorama' && (
        <div className="rse-grid">
          {pillars.map((p) => (
            <article
              key={p.id}
              className="rse-card rse-pillar"
              style={{ '--pillar-color': p.color }}
            >
              <h3>{p.icon} {p.label}</h3>
              <p>{p.description}</p>
              <div className="rse-pillar__kpis">
                {p.kpis.map((k) => (
                  <div key={k.label} className="rse-pillar__kpi">
                    <span>{k.label}</span>
                    <span>
                      <strong>{k.value}</strong>{' '}
                      <em>{k.trend}</em>
                    </span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}

      {tab === 'ecology' && (
        <>
          <h2 className="rse-section-title">Actions écologiques</h2>
          <div className="rse-grid" style={{ marginBottom: 24 }}>
            {ecology.map((a) => (
              <article key={a.id} className="rse-card">
                <h3>{a.icon} {a.title}</h3>
                <p>{a.description}</p>
                <strong style={{ color: '#059669', fontSize: 14 }}>{a.metric}</strong>
                {a.route && (
                  <Link to={a.route} className="rse-link">En savoir plus →</Link>
                )}
              </article>
            ))}
          </div>
          <FoodWasteSustainabilityPanel />
        </>
      )}

      {tab === 'nature' && (
        <>
          <h2 className="rse-section-title">Nature &amp; biodiversité</h2>
          <div className="rse-grid">
            {nature.map((n) => (
              <article key={n.id} className="rse-card rse-nature-card">
                <h3>{n.icon} {n.title}</h3>
                <p>{n.description}</p>
                <strong style={{ color: '#16a34a', fontSize: 13 }}>{n.impact}</strong>
                <div className="rse-nature-card__partners">
                  {n.partners.map((pt) => (
                    <span key={pt} className="rse-nature-card__partner">{pt}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {tab === 'environment' && (
        <>
          <h2 className="rse-section-title">Environnement &amp; climat</h2>
          <div className="rse-grid" style={{ marginBottom: 24 }}>
            {commitments.map((c) => (
              <article key={c.id} className="rse-card" id={c.id}>
                <h3>{c.icon} {c.label}</h3>
                <p>{c.detail}</p>
              </article>
            ))}
          </div>
          <CarbonDeliveryPanel />
        </>
      )}

      {tab === 'social' && (
        <>
          <h2 className="rse-section-title">Responsabilité sociale</h2>
          <div className="rse-grid">
            <article className="rse-card">
              <h3>👷 Emploi local &amp; formation</h3>
              <p>156 emplois directs en Tunisie, 94 % des équipes formées aux bonnes pratiques RSE et bien-être animal.</p>
            </article>
            <article className="rse-card">
              <h3>🏠 Soutien aux refuges</h3>
              <p>Dons alimentaires, kits d&apos;accueil et campagnes d&apos;adoption avec 18 refuges partenaires.</p>
              <Link to="/client-community" className="rse-link">Communauté PetfoodTN →</Link>
            </article>
            <article className="rse-card">
              <h3>🎓 Sensibilisation &amp; éducation</h3>
              <p>Ateliers nutrition responsable, protection de la faune et adoption éthique des animaux.</p>
              <Link to="/pet-advice" className="rse-link">Conseils pour pets →</Link>
            </article>
            <article className="rse-card">
              <h3>♿ Inclusion &amp; accessibilité</h3>
              <p>Interface accessible, support multilingue et engagement auprès des associations locales.</p>
            </article>
          </div>
        </>
      )}

      {tab === 'impact' && role === 'client' && pack.clientImpact && (
        <>
          <span className="rse-rank-badge">🏅 {pack.clientImpact.rank}</span>
          <div className="rse-impact-grid">
            <div className="rse-impact-kpi">
              <strong>{pack.clientImpact.co2Net} kg</strong>
              <span>CO₂ net estimé</span>
            </div>
            <div className="rse-impact-kpi">
              <strong>{pack.clientImpact.co2Saved} kg</strong>
              <span>CO₂ économisés</span>
            </div>
            <div className="rse-impact-kpi">
              <strong>{pack.clientImpact.treesContributed}</strong>
              <span>Arbres contribués</span>
            </div>
            <div className="rse-impact-kpi">
              <strong>{pack.clientImpact.wasteAvoidedKg} kg</strong>
              <span>Gaspillage évité</span>
            </div>
            <div className="rse-impact-kpi">
              <strong>{pack.clientImpact.ecoScore}/100</strong>
              <span>Score éco personnel</span>
            </div>
          </div>
          <h2 className="rse-section-title">Mes engagements écologiques</h2>
          {pledges.map((p) => (
            <label
              key={p.id}
              className={`rse-pledge${activePledges.includes(p.id) ? ' rse-pledge--active' : ''}`}
            >
              <input
                type="checkbox"
                checked={activePledges.includes(p.id)}
                onChange={() => handlePledgeToggle(p.id)}
              />
              <div>
                <strong>{p.label}</strong>
                {p.co2Saved > 0 && (
                  <span> — jusqu&apos;à {p.co2Saved} kg CO₂ économisés par commande</span>
                )}
              </div>
            </label>
          ))}
        </>
      )}

      {tab === 'impact' && role === 'livreur' && pack.livreur && (
        <>
          <div className="rse-impact-grid">
            <div className="rse-impact-kpi">
              <strong>{pack.livreur.personalDeliveries}</strong>
              <span>Livraisons (30 j)</span>
            </div>
            <div className="rse-impact-kpi">
              <strong>{pack.livreur.personalCo2Kg} kg</strong>
              <span>CO₂ émis</span>
            </div>
            <div className="rse-impact-kpi">
              <strong>{pack.livreur.personalSavedKg} kg</strong>
              <span>CO₂ économisés</span>
            </div>
            <div className="rse-impact-kpi">
              <strong>{pack.livreur.ecoRoutesPct}%</strong>
              <span>Tournées optimisées</span>
            </div>
          </div>
          <h2 className="rse-section-title">Conseils logistique verte</h2>
          {pack.livreur.greenTips.map((tip) => (
            <div key={tip} className="rse-tip">💡 {tip}</div>
          ))}
          <Link to="/livreur/intelligence" className="rse-link">Hub intelligence livreur →</Link>
        </>
      )}

      {tab === 'panorama' && role === 'vendor' && pack.vendor && (
        <div style={{ marginTop: 20 }}>
          <h2 className="rse-section-title">Performance RSE boutique</h2>
          {[
            { label: 'Produits éco-labellisés', pct: pack.vendor.ecoProductsPct },
            { label: 'Emballages recyclables', pct: pack.vendor.recyclablePackagingPct },
            { label: 'Approvisionnement local', pct: pack.vendor.localSourcingPct },
          ].map((bar) => (
            <div key={bar.label} className="rse-vendor-bar">
              <div className="rse-vendor-bar__label">
                <span>{bar.label}</span>
                <span>{bar.pct}%</span>
              </div>
              <div className="rse-vendor-bar__track">
                <div className="rse-vendor-bar__fill" style={{ width: `${bar.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'timeline' && (
        <>
          <h2 className="rse-section-title">Feuille de route RSE 2023–2027</h2>
          <div className="rse-timeline">
            {timeline.map((t) => (
              <div key={t.year} className="rse-timeline__item">
                <div className="rse-timeline__year">{t.year}</div>
                <div className="rse-timeline__event">{t.event}</div>
              </div>
            ))}
          </div>
          <Link to="/compliance" className="rse-link" style={{ marginTop: 16, display: 'inline-block' }}>
            Voir conformité ISO &amp; certifications →
          </Link>
        </>
      )}
    </div>
  );
};

export default RseEcologyHubPage;
