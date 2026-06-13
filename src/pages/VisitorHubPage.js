import React from 'react';
import { Link } from 'react-router-dom';
import VisitorLayout from '../layouts/VisitorLayout';
import { getVisitorCatalog } from '../config/platformServicesCatalog';
import {
  MARKETING_FAQ,
  MARKETING_TESTIMONIALS,
  VISITOR_QUICK_LINKS,
} from '../config/marketingContent';
import VisitorRouteLink from '../components/VisitorRouteLink';
import './VisitorHubPage.css';

const renderStars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

const VisitorClickableCard = ({ service }) => {
  const route = service.id === 'visitor-hub' ? '#decouvrir' : service.route;
  const content = (
    <>
      <span className="visitor-card__icon">{service.icon}</span>
      {service.badge && <span className="visitor-card__badge">{service.badge}</span>}
      <h3>{service.label}</h3>
      <p>{service.description}</p>
      <span className="visitor-card__cta">Accéder →</span>
    </>
  );

  if (route.startsWith('#')) {
    return (
      <a href={route} className="visitor-card visitor-card--clickable">
        {content}
      </a>
    );
  }

  return (
    <VisitorRouteLink route={route} className="visitor-card visitor-card--clickable">
      {content}
    </VisitorRouteLink>
  );
};

const VisitorHubPage = () => {
  const catalog = getVisitorCatalog();
  const services = catalog.flatMap((cat) => cat.services);
  const previewTestimonials = MARKETING_TESTIMONIALS.slice(0, 3);

  const visitorSteps = [
    {
      step: '1',
      title: 'Créez votre compte client',
      text: 'Boutique, commandes, fidélité et dossier médical de vos animaux.',
      route: '/register',
      cta: "S'inscrire",
    },
    {
      step: '2',
      title: 'Explorez les espaces pro',
      text: 'Vétérinaires, livreurs, vendeurs et modérateurs ont des espaces dédiés.',
      route: '/vendor',
      cta: 'Espace vendeur',
    },
    {
      step: '3',
      title: 'Participez aux événements',
      text: 'Compétitions, cadeaux et lots — réservés aux clients connectés.',
      route: '/login',
      cta: 'Se connecter',
    },
  ];

  return (
    <VisitorLayout>
    <div className="visitor-page">
      <header className="visitor-hero">
        <span className="visitor-hero__badge">👀 Espace visiteur · accès libre</span>
        <h1>Découvrez PetfoodTN sans créer de compte</h1>
        <p>
          Parcourez les services, consultez la FAQ et inscrivez-vous quand vous êtes prêt à
          commander, réserver un soin ou participer aux compétitions.
        </p>
        <div className="visitor-hero__cta">
          <Link to="/visitor/products" className="visitor-btn visitor-btn--primary">Parcourir les produits</Link>
          <Link to="/visitor/tools" className="visitor-btn visitor-btn--ghost">Outils nutrition</Link>
          <Link to="/register" className="visitor-btn visitor-btn--ghost">Créer un compte</Link>
        </div>
        <div className="visitor-quick" role="navigation" aria-label="Raccourcis visiteur">
          {VISITOR_QUICK_LINKS.map((item) => (
            <VisitorRouteLink key={item.id} route={item.route} className="visitor-quick__chip">
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </VisitorRouteLink>
          ))}
        </div>
      </header>

      <section id="decouvrir" className="visitor-section">
        <h2>Parcours découverte — tout est cliquable</h2>
        <p className="visitor-section__sub">
          {services.length} accès publics — cliquez sur une carte pour explorer la plateforme.
        </p>
        <div className="visitor-grid">
          {services.map((svc) => (
            <VisitorClickableCard key={svc.id} service={svc} />
          ))}
        </div>
      </section>

      <section className="visitor-section visitor-section--alt">
        <h2>Ils nous font confiance</h2>
        <p className="visitor-section__sub">
          Aperçu des avis clients — cliquez pour voir tous les témoignages.
        </p>
        <div className="visitor-testimonials">
          {previewTestimonials.map((t) => (
            <VisitorRouteLink
              key={t.id}
              route="/visitor/info"
              className="visitor-testimonial"
            >
              <div className="visitor-testimonial__head">
                <span>{t.petEmoji}</span>
                <span className="visitor-testimonial__stars">{renderStars(t.rating)}</span>
              </div>
              <p className="visitor-testimonial__quote">&ldquo;{t.quote}&rdquo;</p>
              <p className="visitor-testimonial__meta">
                {t.name} · {t.city} · {t.service}
              </p>
              <span className="visitor-testimonial__cta">Lire tous les avis →</span>
            </VisitorRouteLink>
          ))}
        </div>
      </section>

      <section className="visitor-section">
        <h2>Prêt à aller plus loin ?</h2>
        <div className="visitor-steps">
          {visitorSteps.map((step) => (
            <VisitorRouteLink key={step.step} route={step.route} className="visitor-step visitor-step--clickable">
              <span>{step.step}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              <span className="visitor-step__cta">{step.cta} →</span>
            </VisitorRouteLink>
          ))}
        </div>
      </section>

      <section id="faq-visiteur" className="visitor-section visitor-section--alt">
        <h2>Questions fréquentes</h2>
        <div className="visitor-faq">
          {MARKETING_FAQ.slice(0, 4).map((item) => (
            <details key={item.q} className="visitor-faq__item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
        <p className="visitor-faq__more">
          <VisitorRouteLink route="/visitor/info">Voir toute la FAQ →</VisitorRouteLink>
        </p>
      </section>

      <div className="visitor-sticky-cta" aria-label="Actions rapides">
        <VisitorRouteLink route="/visitor/products" className="visitor-sticky-cta__btn visitor-sticky-cta__btn--ghost">
          Produits
        </VisitorRouteLink>
        <Link to="/register" className="visitor-sticky-cta__btn visitor-sticky-cta__btn--primary">
          Créer un compte
        </Link>
      </div>

      <footer className="visitor-footer">
        <div className="visitor-footer__links">
          <Link to="/">Accueil</Link>
          <Link to="/vendor">Espace vendeur</Link>
          <Link to="/moderator">Espace modération</Link>
          <VisitorRouteLink route="/#temoignages">Avis</VisitorRouteLink>
          <VisitorRouteLink route="/#tarifs">Tarifs</VisitorRouteLink>
          <VisitorRouteLink route="/#partenaires">Partenaires</VisitorRouteLink>
          <Link to="/login">Connexion</Link>
        </div>
        <span>© PetfoodTN — Tunisie</span>
      </footer>
    </div>
    </VisitorLayout>
  );
};

export default VisitorHubPage;
