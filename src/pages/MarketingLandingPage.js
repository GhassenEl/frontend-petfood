import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getPublicMarketingCatalog,
  MARKETING_STATS,
} from '../config/platformServicesCatalog';
import {
  MARKETING_PARTNER_TYPES,
  MARKETING_HOW_IT_WORKS,
  MARKETING_IOT_FEATURES,
  MARKETING_TRUST_BADGES,
  MARKETING_PROMO_CODES,
  MARKETING_FAQ,
  MARKETING_PLATFORM_ACTORS,
} from '../config/marketingContent';
import { fetchMarketingLiveData } from '../services/marketingService';
import { SERVICE_RATE_CARDS } from '../utils/clientDemoData';
import MobileBottomNav, { AUTH_PUBLIC_MOBILE_NAV } from '../components/MobileBottomNav';
import PlatformComplianceBadges from '../components/PlatformComplianceBadges';
import './MarketingLandingPage.css';
import './PlatformCompliancePage.css';

const renderStars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

const SOURCE_LABELS = {
  api: 'Données en direct',
  demo: 'Avis démo plateforme',
  static: 'Témoignages illustratifs',
};

const VENDOR_SOURCE_LABELS = {
  api: 'Fournisseurs marketplace (API)',
  demo: 'Fournisseurs démo',
};

const PILLARS = [
  {
    icon: '🥗',
    title: 'Nutrition sur mesure',
    text: 'Calories, races tunisiennes (Sloughi, chat maghrébin…) et 8 espèces : chien, chat, oiseau, poisson, lapin, hamster, reptile, NAC.',
  },
  {
    icon: '🩺',
    title: 'Santé connectée',
    text: 'RDV vétérinaire, dossier médical, vaccins, Retrouvé Moi et assistant chat NLP 24/7.',
  },
  {
    icon: '🛒',
    title: 'Boutique intelligente',
    text: 'Croquettes, traçabilité blockchain, fidélité, livraison prédictive et recommandations ML.',
  },
  {
    icon: '📡',
    title: 'IoT & connecté',
    text: 'Distributeur ESP32, fontaine, livraison prédictive et traçabilité — pilotés depuis le Centre IoT.',
  },
];

const BOOKABLE_PREVIEW = SERVICE_RATE_CARDS.filter(
  (s) => s.basePrice > 0 && !['rehabilitation', 'veterinary'].includes(s.type),
).slice(0, 4);

const SPECIES = ['🐕 Chien', '🐈 Chat', '🐦 Oiseau', '🐟 Poisson', '🐰 Lapin', '🐹 Hamster', '🦎 Reptile', '🐾 NAC'];

const HERO_HIGHLIGHTS = [
  { icon: '🤖', label: 'Chat NLP', sub: 'Règles + émotions' },
  { icon: '📡', label: 'Centre IoT', sub: 'ESP32 & fontaine' },
  { icon: '⭐', label: 'Avis 5★', sub: 'Sentiments analysés' },
];

const MarketingLandingPage = () => {
  const categories = getPublicMarketingCatalog();
  const [liveData, setLiveData] = useState(null);
  const [liveLoading, setLiveLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    fetchMarketingLiveData()
      .then(setLiveData)
      .finally(() => setLiveLoading(false));
  }, []);

  const testimonials = liveData?.testimonials?.testimonials || [];
  const testimonialStats = liveData?.testimonials?.stats || { average: 4.9, count: 0 };
  const testimonialSource = liveData?.testimonials?.source || 'demo';
  const partners = liveData?.partners?.partners || [];
  const partnerTypes = liveData?.partners?.types?.length
    ? liveData.partners.types
    : MARKETING_PARTNER_TYPES;
  const vendorSource = liveData?.partners?.vendorSource || 'demo';
  const activeVendorCount = liveData?.partners?.activeVendorCount || 0;

  const filteredCategories = useMemo(() => {
    if (activeCategory === 'all') return categories;
    return categories.filter((c) => c.id === activeCategory);
  }, [categories, activeCategory]);

  const categoryTabs = useMemo(
    () => [{ id: 'all', label: 'Tout', icon: '✨' }, ...categories.map((c) => ({ id: c.id, label: c.label, icon: c.icon }))],
    [categories],
  );

  return (
    <div className="mkt-page platform-workspace--with-bottom-nav">
      <nav className="mkt-nav" aria-label="Navigation marketing">
        <Link to="/" className="mkt-nav__brand">
          <span>🐾</span>
          <span>PetfoodTN</span>
        </Link>
        <div className="mkt-nav__links">
          <a href="#services" className="mkt-nav__link mkt-nav__link--hide-mobile">Services</a>
          <a href="#acteurs" className="mkt-nav__link mkt-nav__link--hide-mobile">Acteurs</a>
          <Link to="/visitor" className="mkt-nav__link mkt-nav__link--hide-mobile">Visiteur</Link>
          <Link to="/vendor" className="mkt-nav__link mkt-nav__link--hide-mobile">Vendeur</Link>
          <Link to="/moderator" className="mkt-nav__link mkt-nav__link--hide-mobile">Modération</Link>
          <a href="#iot" className="mkt-nav__link mkt-nav__link--hide-mobile">IoT</a>
          <a href="#temoignages" className="mkt-nav__link mkt-nav__link--hide-mobile">Avis</a>
          <a href="#faq" className="mkt-nav__link mkt-nav__link--hide-mobile">FAQ</a>
          <Link to="/login" className="mkt-nav__link">Connexion</Link>
          <Link to="/register" className="mkt-btn mkt-btn--primary">Créer un compte</Link>
        </div>
      </nav>

      <header className="mkt-hero">
        <div className="mkt-hero__layout">
          <div className="mkt-hero__inner">
            <span className="mkt-hero__badge">🇹🇳 Plateforme animaux · Tunisie</span>
            <h1>Tout pour le bien-être de vos compagnons, en un seul endroit</h1>
            <p className="mkt-hero__lead">
              Boutique, nutrition multi-espèces, soins réservables, IoT connecté, vétérinaire
              et intelligence artificielle — pour propriétaires, cliniques et professionnels.
            </p>
            <div className="mkt-hero__cta">
              <Link to="/register" className="mkt-btn mkt-btn--primary">Commencer gratuitement</Link>
              <a href="#comment-ca-marche" className="mkt-btn mkt-btn--ghost mkt-btn--hero-ghost">
                Comment ça marche
              </a>
            </div>
            <div className="mkt-stats">
              {MARKETING_STATS.map((s) => (
                <div key={s.label} className="mkt-stat">
                  <strong>{s.value}</strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mkt-hero__aside" aria-hidden>
            {HERO_HIGHLIGHTS.map((h) => (
              <div key={h.label} className="mkt-hero-card">
                <span className="mkt-hero-card__icon">{h.icon}</span>
                <div>
                  <strong>{h.label}</strong>
                  <span>{h.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      <section className="mkt-trust" aria-label="Garanties">
        <div className="mkt-trust__inner">
          {MARKETING_TRUST_BADGES.map((b) => (
            <div key={b.label} className="mkt-trust__item">
              <span className="mkt-trust__icon">{b.icon}</span>
              <div>
                <strong>{b.label}</strong>
                <span>{b.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mkt-promo-strip">
        <div className="mkt-promo-strip__inner">
          <p className="mkt-promo-strip__title">🎁 Codes promo à l&apos;inscription</p>
          <div className="mkt-promo-codes">
            {MARKETING_PROMO_CODES.map((p) => (
              <div key={p.code} className="mkt-promo-code">
                <code>{p.code}</code>
                <span>{p.label}</span>
                <small>min. {p.min}</small>
              </div>
            ))}
          </div>
          <Link to="/register" className="mkt-btn mkt-btn--secondary mkt-promo-strip__cta">
            Profiter maintenant
          </Link>
        </div>
      </section>

      <section className="mkt-section">
        <h2 className="mkt-section__title">Pourquoi PetfoodTN ?</h2>
        <p className="mkt-section__sub">
          Une plateforme complète pensée pour le marché tunisien : races locales, climat chaud,
          refuges partenaires et marketplace de fournisseurs certifiés.
        </p>
        <div className="mkt-pillars mkt-pillars--4">
          {PILLARS.map((p) => (
            <article key={p.title} className="mkt-pillar">
              <div className="mkt-pillar__icon">{p.icon}</div>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </article>
          ))}
        </div>
        <div className="mkt-species">
          {SPECIES.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
      </section>

      <section id="acteurs" className="mkt-section mkt-section--alt mkt-actors">
        <h2 className="mkt-section__title">Acteurs de la plateforme</h2>
        <p className="mkt-section__sub">
          Visiteurs, clients, professionnels et modérateurs — chaque profil dispose d&apos;un espace adapté.
        </p>
        <div className="mkt-actors-grid">
          {MARKETING_PLATFORM_ACTORS.map((actor) => (
            <Link
              key={actor.id}
              to={actor.ctaRoute}
              className={`mkt-actor-card mkt-actor-card--clickable${actor.featured ? ' mkt-actor-card--featured' : ''}`}
              style={{ '--actor-accent': actor.accent }}
            >
              {actor.featured && <span className="mkt-actor-card__ribbon">Nouveau</span>}
              <div className="mkt-actor-card__icon">{actor.icon}</div>
              <h3>{actor.title}</h3>
              <p className="mkt-actor-card__tagline">{actor.tagline}</p>
              <p className="mkt-actor-card__desc">{actor.description}</p>
              <ul className="mkt-actor-card__highlights">
                {actor.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              <span className="mkt-btn mkt-btn--secondary mkt-actor-card__cta">
                {actor.ctaLabel} →
              </span>
            </Link>
          ))}
        </div>
        <div className="mkt-actors-footer">
          <Link to="/visitor" className="mkt-btn mkt-btn--ghost">
            👀 Explorer en tant que visiteur
          </Link>
          <Link to="/vendor" className="mkt-btn mkt-btn--ghost">
            🏬 Découvrir l&apos;espace vendeur
          </Link>
          <Link to="/moderator" className="mkt-btn mkt-btn--ghost">
            🛡️ Découvrir l&apos;espace modération
          </Link>
        </div>
      </section>

      <section id="comment-ca-marche" className="mkt-section mkt-section--alt">
        <h2 className="mkt-section__title">Comment ça marche ?</h2>
        <p className="mkt-section__sub">Trois étapes pour profiter de toute la plateforme.</p>
        <div className="mkt-steps">
          {MARKETING_HOW_IT_WORKS.map((step) => (
            <article key={step.step} className="mkt-step">
              <div className="mkt-step__num">{step.step}</div>
              <div className="mkt-step__icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="iot" className="mkt-section mkt-iot">
        <h2 className="mkt-section__title">📡 IoT & écosystème connecté</h2>
        <p className="mkt-section__sub">
          Pilotez distributeur, fontaine, livraison et traçabilité depuis un seul tableau de bord — disponible après inscription.
        </p>
        <div className="mkt-iot-grid">
          {MARKETING_IOT_FEATURES.map((f) => (
            <article key={f.title} className="mkt-iot-card">
              <div className="mkt-iot-card__icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </article>
          ))}
        </div>
        <div className="mkt-iot-cta">
          <Link to="/register" className="mkt-btn mkt-btn--primary">Accéder au Centre IoT</Link>
        </div>
      </section>

      <section id="services" className="mkt-section mkt-section--alt mkt-section--full">
        <div className="mkt-section__contain">
          <h2 className="mkt-section__title">Nos services</h2>
          <p className="mkt-section__sub">
            Créez un compte client pour accéder à l&apos;ensemble des fonctionnalités.
            Réservation en ligne, paiement sécurisé et suivi en temps réel.
          </p>

          <div className="mkt-tabs" role="tablist" aria-label="Filtrer les services">
            {categoryTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeCategory === tab.id}
                className={`mkt-tab${activeCategory === tab.id ? ' mkt-tab--active' : ''}`}
                onClick={() => setActiveCategory(tab.id)}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {filteredCategories.map((cat) => (
            <div key={cat.id} className="mkt-category">
              <h3>{cat.icon} {cat.label}</h3>
              <div className="mkt-grid">
                {cat.services.map((svc) => (
                  <article key={svc.id} className="mkt-card">
                    <div className="mkt-card__head">
                      <span className="mkt-card__icon">{svc.icon}</span>
                      {svc.badge && <span className="mkt-card__badge">{svc.badge}</span>}
                    </div>
                    <h4>{svc.label}</h4>
                    <p>{svc.description}</p>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="temoignages" className="mkt-section">
        <h2 className="mkt-section__title">Ils nous font confiance</h2>
        <p className="mkt-section__sub">
          Avis 1–5★ sur produits et services — toilettage, véto, commandes, nutrition et IoT.
        </p>
        <div className="mkt-rating-summary">
          <div>
            <strong>{testimonialStats.average}</strong>
            <span>/ 5 · moyenne clients</span>
          </div>
          <span className="mkt-rating-summary__stars">
            {renderStars(Math.round(testimonialStats.average))}
          </span>
          <span className={`mkt-live-badge mkt-live-badge--${testimonialSource}`}>
            {SOURCE_LABELS[testimonialSource] || testimonialSource}
            {testimonialStats.count > 0 ? ` · ${testimonialStats.count} avis` : ''}
          </span>
        </div>
        {liveLoading ? (
          <p className="mkt-loading">Chargement des avis clients…</p>
        ) : (
          <div className="mkt-testimonials">
            {testimonials.map((t) => (
              <article key={t.id} className="mkt-testimonial">
                <div className="mkt-testimonial__stars" aria-label={`${t.rating} sur 5`}>
                  {renderStars(t.rating)}
                </div>
                <p className="mkt-testimonial__quote">{t.quote}</p>
                <div className="mkt-testimonial__footer">
                  <div className="mkt-testimonial__avatar" aria-hidden>{t.petEmoji}</div>
                  <div className="mkt-testimonial__meta">
                    <strong>{t.name}</strong>
                    <span>{t.city}{t.pet ? ` · ${t.pet}` : ''}</span>
                  </div>
                  <span className="mkt-testimonial__tag">{t.service}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="partenaires" className="mkt-section mkt-partners-wrap">
        <div className="mkt-partners-inner">
          <h2 className="mkt-section__title">Nos partenaires</h2>
          <p className="mkt-section__sub">
            {activeVendorCount > 0
              ? `${activeVendorCount} fournisseur(s) marketplace actif(s) et réseau communautaire (refuges, cliniques, clubs).`
              : 'Fournisseurs marketplace et réseau communautaire tunisien.'}
          </p>
          <div className="mkt-partner-types">
            {partnerTypes.map((type) => (
              <span key={type}>{type}</span>
            ))}
            <span className={`mkt-live-badge mkt-live-badge--${vendorSource}`}>
              {VENDOR_SOURCE_LABELS[vendorSource]}
            </span>
          </div>
          {liveLoading ? (
            <p className="mkt-loading">Chargement des partenaires…</p>
          ) : (
            <div className="mkt-partners">
              {partners.map((p) => (
                <article
                  key={p.id}
                  className={`mkt-partner${p.source === 'marketplace' ? ' mkt-partner--vendor' : ''}`}
                >
                  <div className="mkt-partner__icon" aria-hidden>{p.icon}</div>
                  {p.badge && <span className="mkt-partner__badge">{p.badge}</span>}
                  <span className="mkt-partner__type">{p.type}</span>
                  <h4>{p.name}</h4>
                  <div className="mkt-partner__city">📍 {p.city}</div>
                  <p>{p.description}</p>
                </article>
              ))}
            </div>
          )}
          <div className="mkt-partner-cta">
            <p>Vous êtes refuge, vétérinaire, toiletteur ou fournisseur ? Rejoignez l&apos;écosystème PetfoodTN.</p>
            <a href="mailto:partenaires@petfoodtn.tn" className="mkt-btn mkt-btn--secondary">
              Devenir partenaire
            </a>
          </div>
        </div>
      </section>

      <section id="tarifs" className="mkt-section">
        <h2 className="mkt-section__title">Soins & réservation</h2>
        <p className="mkt-section__sub">
          Toilettage, pension, dressage et forfaits bien-être — tarifs indicatifs, paiement wallet ou carte.
        </p>
        <div className="mkt-pricing">
          {BOOKABLE_PREVIEW.map((s) => (
            <article key={s.type} className="mkt-price-card">
              <div className="mkt-price-card__icon">{s.icon}</div>
              <h4>{s.label}</h4>
              <p className="price">
                {s.basePrice} DT
                <small> / {s.unit}</small>
              </p>
              <p className="mkt-price-card__desc">{s.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="conformite" className="mkt-section mkt-section--alt">
        <h2 className="mkt-section__title">ISO &amp; environnement écologique</h2>
        <p className="mkt-section__sub">
          Normes internationales, certifications mondiales et engagements RSE vérifiés.
        </p>
        <PlatformComplianceBadges />
      </section>

      <section id="faq" className="mkt-section mkt-section--alt">
        <h2 className="mkt-section__title">Questions fréquentes</h2>
        <p className="mkt-section__sub">Tout ce qu&apos;il faut savoir avant de créer votre compte.</p>
        <div className="mkt-faq">
          {MARKETING_FAQ.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={item.q} className={`mkt-faq__item${isOpen ? ' mkt-faq__item--open' : ''}`}>
                <button
                  type="button"
                  className="mkt-faq__q"
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                >
                  {item.q}
                  <span className="mkt-faq__chevron" aria-hidden>{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && <p className="mkt-faq__a">{item.a}</p>}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mkt-cta-band">
        <h2>Prêt à prendre soin de votre animal ?</h2>
        <p>Inscription en 2 minutes — boutique, nutrition, IoT, RDV vétérinaire et assistant chat NLP.</p>
        <div className="mkt-cta-band__actions">
          <Link to="/register" className="mkt-btn mkt-btn--secondary">Créer mon compte</Link>
          <Link to="/login" className="mkt-btn mkt-btn--ghost mkt-btn--cta-ghost">
            J&apos;ai déjà un compte
          </Link>
        </div>
      </section>

      <footer className="mkt-footer">
        <div className="mkt-footer__grid">
          <div>
            <strong className="mkt-footer__brand">🐾 PetfoodTN</strong>
            <p>Plateforme animaux Tunisie — boutique, santé, IoT & IA.</p>
          </div>
          <div>
            <strong>Produit</strong>
            <a href="#services">Services</a>
            <a href="#iot">IoT</a>
            <a href="#tarifs">Tarifs</a>
            <a href="#faq">FAQ</a>
          </div>
          <div>
            <strong>Compte</strong>
            <Link to="/register">Inscription</Link>
            <Link to="/login">Connexion</Link>
          </div>
          <div>
            <strong>Conformité</strong>
            <Link to="/compliance">ISO &amp; environnement</Link>
            <Link to="/compliance">Certifications mondiales</Link>
          </div>
          <div>
            <strong>Contact</strong>
            <a href="mailto:contact@petfoodtn.tn">contact@petfoodtn.tn</a>
            <a href="mailto:partenaires@petfoodtn.tn">Partenaires</a>
          </div>
        </div>
        <p className="mkt-footer__copy">
          © {new Date().getFullYear()} PetfoodTN — Pro, vétérinaire ou livreur ? Contactez-nous pour un accès dédié.
        </p>
      </footer>
      <MobileBottomNav items={AUTH_PUBLIC_MOBILE_NAV} />
    </div>
  );
};

export default MarketingLandingPage;
