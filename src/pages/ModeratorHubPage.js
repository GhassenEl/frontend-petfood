import React from 'react';
import { Link } from 'react-router-dom';
import ModeratorPublicLayout from '../layouts/ModeratorPublicLayout';
import { getModeratorPublicCatalog } from '../config/platformServicesCatalog';
import { MODERATOR_QUICK_LINKS } from '../config/marketingContent';
import { DEMO_MODERATOR_QUEUE, DEMO_MODERATOR_STATS } from '../utils/moderatorDemoData';
import VisitorRouteLink from '../components/VisitorRouteLink';
import './ModeratorHubPage.css';

const ModeratorClickableCard = ({ service }) => {
  const route = service.id === 'moderator-hub' ? '#decouvrir' : service.route;
  const content = (
    <>
      <span className="moderator-card__icon">{service.icon}</span>
      {service.badge && <span className="moderator-card__badge">{service.badge}</span>}
      <h3>{service.label}</h3>
      <p>{service.description}</p>
      <span className="moderator-card__cta">Accéder →</span>
    </>
  );

  if (route.startsWith('#')) {
    return (
      <a href={route} className="moderator-card moderator-card--clickable">
        {content}
      </a>
    );
  }

  return (
    <VisitorRouteLink route={route} className="moderator-card moderator-card--clickable">
      {content}
    </VisitorRouteLink>
  );
};

const priorityLabel = (p) => (p === 'high' ? 'Urgent' : p === 'medium' ? 'Moyen' : 'Faible');

const ModeratorHubPage = () => {
  const catalog = getModeratorPublicCatalog();
  const services = catalog.flatMap((cat) => cat.services);
  const stats = DEMO_MODERATOR_STATS;
  const queue = DEMO_MODERATOR_QUEUE.slice(0, 4);

  const moderatorSteps = [
    {
      step: '1',
      title: 'Demandez l\'accès modérateur',
      text: 'Profil communauté, support client ou modération de contenu — validation PetfoodTN.',
      route: '/moderator#devenir-moderateur',
      cta: 'Devenir modérateur',
    },
    {
      step: '2',
      title: 'Connectez-vous',
      text: 'Accédez au tableau de bord modération avec vos identifiants pro.',
      route: '/login',
      cta: 'Connexion pro',
    },
    {
      step: '3',
      title: 'Pilotez la communauté',
      text: 'Avis NLP, réclamations, événements et messages signalés en temps réel.',
      route: '/login',
      cta: 'Tableau de bord',
    },
  ];

  return (
    <ModeratorPublicLayout>
      <div className="moderator-page">
        <header className="moderator-hero">
          <span className="moderator-hero__badge">🛡️ Espace modération · communauté</span>
          <h1>Modérez la qualité PetfoodTN</h1>
          <p>
            Validation des avis, traitement des signalements, supervision des événements
            et analyse NLP — rejoignez l&apos;équipe modération de la plateforme.
          </p>
          <div className="moderator-hero__cta">
            <Link to="/login" className="moderator-btn moderator-btn--primary">Connexion modérateur</Link>
            <a href="#devenir-moderateur" className="moderator-btn moderator-btn--ghost">Devenir modérateur</a>
          </div>
          <div className="moderator-quick" role="navigation" aria-label="Raccourcis modération">
            {MODERATOR_QUICK_LINKS.map((item) => (
              <VisitorRouteLink key={item.id} route={item.route} className="moderator-quick__chip">
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </VisitorRouteLink>
            ))}
          </div>
        </header>

        <section id="decouvrir" className="moderator-section">
          <h2>Parcours modération — tout est cliquable</h2>
          <p className="moderator-section__sub">
            {services.length} accès pour découvrir la modération avant connexion.
          </p>
          <div className="moderator-grid">
            {services.map((svc) => (
              <ModeratorClickableCard key={svc.id} service={svc} />
            ))}
          </div>
        </section>

        <section id="avis" className="moderator-section moderator-section--alt">
          <h2>Files d&apos;attente (aperçu)</h2>
          <p className="moderator-section__sub">Indicateurs illustratifs — données démo modération.</p>
          <div className="moderator-kpis">
            <div className="moderator-kpi">
              <span>⭐</span>
              <strong>{stats.pendingReviews}</strong>
              <small>Avis en attente</small>
            </div>
            <div className="moderator-kpi">
              <span>⚠️</span>
              <strong>{stats.pendingComplaints}</strong>
              <small>Réclamations</small>
            </div>
            <div className="moderator-kpi">
              <span>💬</span>
              <strong>{stats.flaggedMessages}</strong>
              <small>Messages signalés</small>
            </div>
            <div className="moderator-kpi">
              <span>✅</span>
              <strong>{stats.resolvedToday}</strong>
              <small>Résolus aujourd&apos;hui</small>
            </div>
          </div>
        </section>

        <section id="reclamations" className="moderator-section">
          <h2>File modération prioritaire</h2>
          <div className="moderator-queue">
            {queue.map((item) => (
              <div key={item.id} className="moderator-queue__item">
                <span className={`moderator-queue__prio moderator-queue__prio--${item.priority}`}>
                  {priorityLabel(item.priority)}
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.ago}</small>
                </div>
              </div>
            ))}
          </div>
          <p className="moderator-queue__login">
            <Link to="/login">Connectez-vous</Link> pour traiter les tickets en direct.
          </p>
        </section>

        <section id="nlp" className="moderator-section moderator-section--alt">
          <h2>Analyse NLP & sentiments</h2>
          <p className="moderator-section__sub">
            Détection automatique du spam, de l&apos;émotion et du sentiment sur les avis
            produits, livraison, toilettage et vétérinaire.
          </p>
          <div className="moderator-nlp-grid">
            <div className="moderator-nlp-card">
              <h3>Sentiment moyen</h3>
              <p className="moderator-nlp-card__value">4,2 ★</p>
              <p className="moderator-nlp-card__meta">Sur les 30 derniers jours</p>
            </div>
            <div className="moderator-nlp-card">
              <h3>Alertes NLP</h3>
              <p>3 avis suspects détectés — spam ou contenu inapproprié.</p>
            </div>
            <div className="moderator-nlp-card">
              <h3>SLA modération</h3>
              <p>Réponse moyenne : <strong>{stats.avgResponseHours} h</strong></p>
            </div>
          </div>
        </section>

        <section id="evenements" className="moderator-section">
          <h2>Événements & concours</h2>
          <p className="moderator-section__sub">
            {stats.activeEvents} événements actifs — supervision des inscriptions et lots.
          </p>
          <VisitorRouteLink route="/login" className="moderator-events-cta">
            Superviser les événements (connexion requise) →
          </VisitorRouteLink>
        </section>

        <section id="devenir-moderateur" className="moderator-section moderator-section--alt">
          <h2>Devenir modérateur PetfoodTN</h2>
          <div className="moderator-steps">
            {moderatorSteps.map((step) => (
              <VisitorRouteLink key={step.step} route={step.route} className="moderator-step moderator-step--clickable">
                <span>{step.step}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
                <span className="moderator-step__cta">{step.cta} →</span>
              </VisitorRouteLink>
            ))}
          </div>
          <p className="moderator-contact">
            Ou écrivez à <a href="mailto:moderation@petfoodtn.tn">moderation@petfoodtn.tn</a>
          </p>
        </section>

        <div className="moderator-sticky-cta" aria-label="Actions rapides modération">
          <VisitorRouteLink route="/visitor" className="moderator-sticky-cta__btn moderator-sticky-cta__btn--ghost">
            Visiteur
          </VisitorRouteLink>
          <Link to="/login" className="moderator-sticky-cta__btn moderator-sticky-cta__btn--primary">
            Connexion pro
          </Link>
        </div>

        <footer className="moderator-footer">
          <div className="moderator-footer__links">
            <Link to="/">Accueil</Link>
            <Link to="/visitor">Visiteur</Link>
            <Link to="/vendor">Vendeur</Link>
            <Link to="/login">Connexion</Link>
          </div>
          <span>© PetfoodTN — Modération</span>
        </footer>
      </div>
    </ModeratorPublicLayout>
  );
};

export default ModeratorHubPage;
