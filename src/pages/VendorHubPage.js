import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import VendorPublicLayout from '../layouts/VendorPublicLayout';
import { getVendorPublicCatalog } from '../config/platformServicesCatalog';
import { MARKETING_PARTNERS, VENDOR_QUICK_LINKS } from '../config/marketingContent';
import { DEMO_VENDOR_DASHBOARD } from '../utils/vendorDemoData';
import { DEMO_ADMIN_REGIONS } from '../utils/adminDemoData';
import { registerVendor } from '../services/ecosystemService';
import VisitorRouteLink from '../components/VisitorRouteLink';
import './VendorHubPage.css';

const VendorClickableCard = ({ service }) => {
  const route = service.id === 'vendor-hub' ? '#decouvrir' : service.route;
  const content = (
    <>
      <span className="vendor-card__icon">{service.icon}</span>
      {service.badge && <span className="vendor-card__badge">{service.badge}</span>}
      <h3>{service.label}</h3>
      <p>{service.description}</p>
      <span className="vendor-card__cta">Accéder →</span>
    </>
  );

  if (route.startsWith('#')) {
    return (
      <a href={route} className="vendor-card vendor-card--clickable">
        {content}
      </a>
    );
  }

  return (
    <VisitorRouteLink route={route} className="vendor-card vendor-card--clickable">
      {content}
    </VisitorRouteLink>
  );
};

const VendorHubPage = () => {
  const catalog = getVendorPublicCatalog();
  const services = catalog.flatMap((cat) => cat.services);
  const kpis = DEMO_VENDOR_DASHBOARD.kpis;
  const ml = DEMO_VENDOR_DASHBOARD.mlAgent;
  const previewPartners = MARKETING_PARTNERS.slice(0, 3);

  const [partnerForm, setPartnerForm] = useState({
    shopName: '',
    ownerName: '',
    email: '',
    phone: '',
    region: DEMO_ADMIN_REGIONS[0],
    siret: '',
    address: '',
    category: 'Animalerie',
  });
  const [partnerStatus, setPartnerStatus] = useState({ type: '', text: '' });
  const [partnerSending, setPartnerSending] = useState(false);

  const submitPartner = async (e) => {
    e.preventDefault();
    setPartnerSending(true);
    setPartnerStatus({ type: '', text: '' });
    try {
      await registerVendor({
        ...partnerForm,
        applicationStatus: 'pending',
      });
      setPartnerStatus({
        type: 'success',
        text: 'Demande envoyée ! Notre équipe vous contactera sous 48 h.',
      });
      setPartnerForm({
        shopName: '',
        ownerName: '',
        email: '',
        phone: '',
        region: DEMO_ADMIN_REGIONS[0],
        siret: '',
        address: '',
        category: 'Animalerie',
      });
    } catch (err) {
      setPartnerStatus({
        type: 'error',
        text: err?.response?.data?.message || 'Envoi impossible — réessayez ou contactez partenaires@petfoodtn.tn',
      });
    } finally {
      setPartnerSending(false);
    }
  };

  const vendorSteps = [
    {
      step: '1',
      title: 'Demandez l\'accès partenaire',
      text: 'Animalerie, fabricant ou distributeur — validation par l\'équipe PetfoodTN.',
      route: '/vendor#devenir-partenaire',
      cta: 'Devenir partenaire',
    },
    {
      step: '2',
      title: 'Connectez-vous',
      text: 'Accédez au dashboard vendeur avec vos identifiants pro.',
      route: '/login',
      cta: 'Connexion pro',
    },
    {
      step: '3',
      title: 'Pilotez votre boutique',
      text: 'Produits, commandes, commissions et alertes ML en temps réel.',
      route: '/login',
      cta: 'Tableau de bord',
    },
  ];

  return (
    <VendorPublicLayout>
    <div className="vendor-page">
      <header className="vendor-hero">
        <span className="vendor-hero__badge">🏬 Espace vendeur · marketplace</span>
        <h1>Vendez sur la marketplace PetfoodTN</h1>
        <p>
          Boutique en ligne certifiée, commissions transparentes, assistant ML pour le stock
          et les promos — rejoignez le réseau de fournisseurs animaliers en Tunisie.
        </p>
        <div className="vendor-hero__cta">
          <Link to="/login" className="vendor-btn vendor-btn--primary">Connexion vendeur</Link>
          <a href="#devenir-partenaire" className="vendor-btn vendor-btn--ghost">Devenir partenaire</a>
        </div>
        <div className="vendor-quick" role="navigation" aria-label="Raccourcis vendeur">
          {VENDOR_QUICK_LINKS.map((item) => (
            <VisitorRouteLink key={item.id} route={item.route} className="vendor-quick__chip">
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </VisitorRouteLink>
          ))}
        </div>
      </header>

      <section id="decouvrir" className="vendor-section">
        <h2>Parcours vendeur — tout est cliquable</h2>
        <p className="vendor-section__sub">
          {services.length} accès pour découvrir la marketplace avant connexion.
        </p>
        <div className="vendor-grid">
          {services.map((svc) => (
            <VendorClickableCard key={svc.id} service={svc} />
          ))}
        </div>
      </section>

      <section id="commissions" className="vendor-section vendor-section--alt">
        <h2>Commissions & performance</h2>
        <p className="vendor-section__sub">Indicateurs illustratifs — données démo marketplace.</p>
        <div className="vendor-kpis">
          <div className="vendor-kpi">
            <span>💰</span>
            <strong>{kpis.revenue30d?.toLocaleString('fr-FR')} DT</strong>
            <small>CA 30 jours</small>
          </div>
          <div className="vendor-kpi">
            <span>📦</span>
            <strong>{kpis.orders30d}</strong>
            <small>Commandes / mois</small>
          </div>
          <div className="vendor-kpi">
            <span>📊</span>
            <strong>12 %</strong>
            <small>Commission plateforme</small>
          </div>
          <div className="vendor-kpi">
            <span>🏆</span>
            <strong>#{kpis.marketplaceRank}</strong>
            <small>Rang marketplace</small>
          </div>
        </div>
      </section>

      <section id="ml-vendeur" className="vendor-section">
        <h2>Assistant ML vendeur</h2>
        <p className="vendor-section__sub">{ml.summary}</p>
        <div className="vendor-ml-grid">
          <div className="vendor-ml-card">
            <h3>Prévision CA</h3>
            <p className="vendor-ml-card__value">{ml.forecast.nextMonthRevenue?.toLocaleString('fr-FR')} DT</p>
            <p className="vendor-ml-card__meta">Confiance {(ml.forecast.confidence * 100).toFixed(0)} %</p>
          </div>
          <div className="vendor-ml-card">
            <h3>Conseil du jour</h3>
            <p>{ml.tip}</p>
          </div>
          <div className="vendor-ml-card">
            <h3>Alertes stock</h3>
            <ul>
              {ml.stockAlerts.map((a) => (
                <li key={a.productId}>{a.name} — {a.action}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="vendor-ml-login">
          <Link to="/login">Connectez-vous</Link> pour accéder au dashboard complet et à l&apos;
          <Link to="/vendor/ml">assistant ML</Link>.
        </p>
      </section>

      <section className="vendor-section vendor-section--alt">
        <h2>Réseau partenaires</h2>
        <div className="vendor-partners">
          {previewPartners.map((p) => (
            <VisitorRouteLink key={p.id} route="/#partenaires" className="vendor-partner-card">
              <span>{p.icon}</span>
              <h3>{p.name}</h3>
              <p>{p.type} · {p.city}</p>
              <span className="vendor-partner-card__cta">Voir le réseau →</span>
            </VisitorRouteLink>
          ))}
        </div>
      </section>

      <section id="devenir-partenaire" className="vendor-section">
        <h2>Devenir vendeur partenaire</h2>
        <form className="vendor-partner-form" onSubmit={submitPartner}>
          <div className="vendor-partner-form__grid">
            <label>
              Nom de la boutique
              <input required value={partnerForm.shopName} onChange={(e) => setPartnerForm((f) => ({ ...f, shopName: e.target.value }))} />
            </label>
            <label>
              Responsable
              <input required value={partnerForm.ownerName} onChange={(e) => setPartnerForm((f) => ({ ...f, ownerName: e.target.value }))} />
            </label>
            <label>
              Email pro
              <input required type="email" value={partnerForm.email} onChange={(e) => setPartnerForm((f) => ({ ...f, email: e.target.value }))} />
            </label>
            <label>
              Téléphone
              <input required value={partnerForm.phone} onChange={(e) => setPartnerForm((f) => ({ ...f, phone: e.target.value }))} />
            </label>
            <label>
              Région
              <select value={partnerForm.region} onChange={(e) => setPartnerForm((f) => ({ ...f, region: e.target.value }))}>
                {DEMO_ADMIN_REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </label>
            <label>
              Matricule fiscal / SIRET
              <input value={partnerForm.siret} onChange={(e) => setPartnerForm((f) => ({ ...f, siret: e.target.value }))} />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              Adresse
              <input required value={partnerForm.address} onChange={(e) => setPartnerForm((f) => ({ ...f, address: e.target.value }))} />
            </label>
          </div>
          {partnerStatus.text && (
            <p className={`vendor-partner-form__status vendor-partner-form__status--${partnerStatus.type}`}>
              {partnerStatus.text}
            </p>
          )}
          <button type="submit" className="vendor-btn vendor-btn--primary" disabled={partnerSending}>
            {partnerSending ? 'Envoi…' : 'Envoyer ma candidature'}
          </button>
        </form>
        <div className="vendor-steps">
          {vendorSteps.map((step) => (
            <VisitorRouteLink key={step.step} route={step.route} className="vendor-step vendor-step--clickable">
              <span>{step.step}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              <span className="vendor-step__cta">{step.cta} →</span>
            </VisitorRouteLink>
          ))}
        </div>
        <p className="vendor-contact">
          Ou écrivez à <a href="mailto:partenaires@petfoodtn.tn">partenaires@petfoodtn.tn</a>
        </p>
      </section>

      <div className="vendor-sticky-cta" aria-label="Actions rapides vendeur">
        <Link to="/contact" className="vendor-sticky-cta__btn vendor-sticky-cta__btn--ghost">
          Contact
        </Link>
        <Link to="/login" className="vendor-sticky-cta__btn vendor-sticky-cta__btn--primary">
          Connexion pro
        </Link>
      </div>

      <footer className="vendor-footer">
        <div className="vendor-footer__links">
          <Link to="/">Accueil</Link>
          <Link to="/moderator">Modération</Link>
          <VisitorRouteLink route="/#partenaires">Partenaires</VisitorRouteLink>
          <Link to="/login">Connexion</Link>
        </div>
        <span>© PetfoodTN — Marketplace</span>
      </footer>
    </div>
    </VendorPublicLayout>
  );
};

export default VendorHubPage;
