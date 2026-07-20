import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PetfoodLogo from '../components/PetfoodLogo';
import JuryCombinedVideosPanel from '../components/JuryCombinedVideosPanel';
import {
  JURY_DEMO_SECTIONS,
  ACTOR_DEMO_INTERFACES,
  CHATBOT_DEMO_POINTS,
  RECO_DEMO_POINTS,
  MARKETING_DEMO,
} from '../config/juryDemoConfig';
import { MARKETING_PFE_CONTEXT, MARKETING_TECH_STACK } from '../config/marketingContent';
import './JuryDemoPage.css';

const JuryDemoPage = () => {
  const [section, setSection] = useState('videos');
  const [loginBusy, setLoginBusy] = useState(null);
  const [loginError, setLoginError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const loginAsRole = useCallback(
    async (actor, targetPath) => {
      if (!actor?.account) {
        navigate(targetPath || actor.home);
        return;
      }
      setLoginError('');
      setLoginBusy(actor.role);
      try {
        const result = await login(actor.account.email, actor.account.password);
        if (result?.success === false) {
          setLoginError(`Connexion ${actor.title} échouée — vérifiez le backend (npm run dev).`);
          return;
        }
        navigate(targetPath || actor.home);
      } catch {
        setLoginError(`Impossible de se connecter en tant que ${actor.title}.`);
      } finally {
        setLoginBusy(null);
      }
    },
    [login, navigate],
  );

  const handleVideoLiveAction = useCallback(
    (action) => {
      const actor = ACTOR_DEMO_INTERFACES.find((a) => a.role === action.role);
      if (actor) {
        loginAsRole(actor, action.path);
      } else {
        navigate(action.path);
      }
    },
    [loginAsRole, navigate],
  );

  return (
    <div className="jury-page">
      <header className="jury-hero">
        <div className="jury-hero__top">
          <PetfoodLogo size="sm" />
          <span className="jury-badge">Présentation jury · PFE PetfoodTN</span>
        </div>
        <h1>Démo jury — vidéo commerciale · plateforme · Flutter</h1>
        <p>
          Trilogie vidéo pour la soutenance, puis parcours live : 7 acteurs, marketing digital,
          chatbot multilingue, IA et application mobile Flutter.
        </p>
        <div className="jury-hero__actions">
          <button type="button" className="jury-btn jury-btn--primary" onClick={() => setSection('videos')}>
            ▶ Vidéos combinées
          </button>
          <button type="button" className="jury-btn jury-btn--secondary" onClick={() => setSection('tour')}>
            Parcours live
          </button>
          <Link to="/mobile" className="jury-btn jury-btn--ghost">App Flutter</Link>
        </div>
        {user && (
          <p className="jury-session">
            Connecté : <strong>{user.name || user.email}</strong> ({user.role})
          </p>
        )}
        {loginError && <p className="jury-error" role="alert">{loginError}</p>}
      </header>

      <nav className="jury-nav" aria-label="Sections démo jury">
        {JURY_DEMO_SECTIONS.map(({ id, label, icon }) => (
          <button
            key={id}
            type="button"
            className={`jury-nav__btn${section === id ? ' jury-nav__btn--active' : ''}`}
            onClick={() => setSection(id)}
          >
            <span aria-hidden>{icon}</span> {label}
          </button>
        ))}
      </nav>

      <main className="jury-main">
        {section === 'videos' && (
          <JuryCombinedVideosPanel onLiveAction={handleVideoLiveAction} />
        )}

        {section === 'overview' && (
          <section className="jury-section">
            <h2>{MARKETING_PFE_CONTEXT.title}</h2>
            <p className="jury-lead">{MARKETING_PFE_CONTEXT.lead}</p>
            <ul className="jury-list">
              {MARKETING_PFE_CONTEXT.objectives.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
            <div className="jury-stack-grid">
              {MARKETING_TECH_STACK.map((stack) => (
                <article key={stack.id} className="jury-stack-card" style={{ borderTopColor: stack.color }}>
                  <h3>{stack.icon} {stack.label}</h3>
                  <ul>
                    {stack.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            <div className="jury-arch-diagram" aria-hidden>
              <div className="jury-arch-box">React :3001</div>
              <span>→</span>
              <div className="jury-arch-box">Node :5002</div>
              <span>→</span>
              <div className="jury-arch-box">PostgreSQL</div>
              <span>+</span>
              <div className="jury-arch-box">FastAPI :8000</div>
              <span>+</span>
              <div className="jury-arch-box">Flutter mobile</div>
            </div>
          </section>
        )}

        {section === 'actors' && (
          <section className="jury-section">
            <h2>Les 7 acteurs — fonctionnalités &amp; interfaces</h2>
            <p className="jury-lead">
              Chaque carte liste les écrans à montrer au jury. Cliquez « Voir l&apos;interface » pour une connexion
              démo automatique puis navigation.
            </p>
            <div className="jury-actors-grid">
              {ACTOR_DEMO_INTERFACES.map((actor) => (
                <article
                  key={actor.role}
                  className="jury-actor-card"
                  style={{ '--actor-accent': actor.accent }}
                >
                  <header className="jury-actor-card__head">
                    <span className="jury-actor-card__icon" aria-hidden>{actor.icon}</span>
                    <div>
                      <h3>{actor.title}</h3>
                      <p>{actor.tagline}</p>
                    </div>
                  </header>
                  <ul className="jury-feature-list">
                    {actor.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <div className="jury-interfaces">
                    <h4>Interfaces à montrer</h4>
                    {actor.interfaces.map((iface) => (
                      <div key={iface.path} className="jury-interface-row">
                        <div>
                          <strong>{iface.label}</strong>
                          <span>{iface.desc}</span>
                        </div>
                        <button
                          type="button"
                          className="jury-btn jury-btn--sm"
                          disabled={loginBusy === actor.role}
                          onClick={() => loginAsRole(actor, iface.path)}
                        >
                          {loginBusy === actor.role ? '…' : 'Voir →'}
                        </button>
                      </div>
                    ))}
                  </div>
                  {actor.account && (
                    <p className="jury-creds">
                      Démo : <code>{actor.account.email}</code>
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {section === 'marketing' && (
          <section className="jury-section">
            <span className="jury-pill">{MARKETING_DEMO.badge}</span>
            <h2>{MARKETING_DEMO.title}</h2>
            <p className="jury-lead">{MARKETING_DEMO.lead}</p>
            <div className="jury-pillars">
              {MARKETING_DEMO.pillars.map((p) => (
                <article key={p.title} className="jury-pillar">
                  <span className="jury-pillar__icon" aria-hidden>{p.icon}</span>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </article>
              ))}
            </div>
            <h3>Parcours marketing pour le jury</h3>
            <ol className="jury-tour-steps">
              {MARKETING_DEMO.demoSteps.map((step) => (
                <li key={step.step}>
                  <span className="jury-step-num">{step.step}</span>
                  <div>
                    <strong>{step.label}</strong>
                    <code>{step.path}</code>
                  </div>
                  <Link to={step.path} className="jury-btn jury-btn--sm">Ouvrir</Link>
                </li>
              ))}
            </ol>
            <div className="jury-marketing-cta">
              <button
                type="button"
                className="jury-btn jury-btn--primary"
                onClick={() => loginAsRole(
                  ACTOR_DEMO_INTERFACES.find((a) => a.role === 'admin'),
                  MARKETING_DEMO.adminRoute,
                )}
              >
                Hub marketing admin →
              </button>
              <button
                type="button"
                className="jury-btn jury-btn--secondary"
                onClick={() => loginAsRole(
                  ACTOR_DEMO_INTERFACES.find((a) => a.role === 'vendor'),
                  MARKETING_DEMO.vendorRoute,
                )}
              >
                Marketing vendeur →
              </button>
            </div>
            <p className="jury-note">
              Données : commandes live + segmentation clients + campagnes IA (
              <code>digitalMarketingEngine.js</code>
              ). Newsletter sur la landing (
              <code>MarketingNewsletterForm</code>
              ).
            </p>
          </section>
        )}

        {section === 'chatbot' && (
          <section className="jury-section jury-section--split">
            <div>
              <h2>Chatbot multilingue</h2>
              <ul className="jury-check-list">
                {CHATBOT_DEMO_POINTS.map((p) => (
                  <li key={p.title}>
                    <strong>{p.title}</strong>
                    <span>{p.detail}</span>
                  </li>
                ))}
              </ul>
              <p className="jury-demo-prompt">
                Essayer dans le chat (admin) : « KPI marketplace », « Top ventes », « Répartition catégories »
              </p>
            </div>
            <div>
              <h2>Système de recommandations</h2>
              <ul className="jury-check-list">
                {RECO_DEMO_POINTS.map((p) => (
                  <li key={p.title}>
                    <strong>{p.title}</strong>
                    <span>{p.detail}</span>
                  </li>
                ))}
              </ul>
              <p className="jury-demo-prompt">
                Pages : <Link to="/admin/recommendations">/admin/recommendations</Link>
                {' · '}
                <Link to="/client-recommendations">/client-recommendations</Link>
              </p>
            </div>
          </section>
        )}

        {section === 'tour' && (
          <section className="jury-section">
            <h2>Parcours live — ordre suggéré pour le jury</h2>
            <p className="jury-lead">
              Idéalement : d&apos;abord la section <strong>Vidéos combinées</strong>, puis ce parcours live.
              Enregistrement auto : <code> npm run demo:jury</code>
            </p>
            <ol className="jury-tour-full">
              <li>
                Trilogie vidéo (commercial → plateforme → Flutter) —
                <button type="button" className="jury-btn jury-btn--sm jury-tour-login" onClick={() => setSection('videos')}>
                  Ouvrir
                </button>
              </li>
              <li>Landing <Link to="/">/</Link> — newsletter, acteurs, stack</li>
              <li>Cette page <Link to="/jury-demo">/jury-demo</Link> — vue d&apos;ensemble</li>
              {ACTOR_DEMO_INTERFACES.filter((a) => a.account).map((actor) => (
                <li key={actor.role}>
                  <strong>{actor.icon} {actor.title}</strong>
                  {' — '}
                  {actor.interfaces.slice(0, 2).map((i) => i.label).join(', ')}
                  <button
                    type="button"
                    className="jury-btn jury-btn--sm jury-tour-login"
                    onClick={() => loginAsRole(actor)}
                  >
                    Connexion démo
                  </button>
                </li>
              ))}
              <li>
                <strong>📣 Marketing digital</strong> — admin puis vendeur
                <button
                  type="button"
                  className="jury-btn jury-btn--sm jury-tour-login"
                  onClick={() => loginAsRole(
                    ACTOR_DEMO_INTERFACES.find((a) => a.role === 'admin'),
                    '/admin/digital-marketing',
                  )}
                >
                  Admin marketing
                </button>
              </li>
              <li>Chatbot — ouvrir l&apos;assistant (bouton orange) sur chaque espace</li>
            </ol>
            <div className="jury-video-hint">
              <h3>Enregistrement vidéo</h3>
              <pre className="jury-code">
{`npm run dev          # :3001 + :5002
npm run demo:jury    # vidéo → demo-videos/`}
              </pre>
            </div>
          </section>
        )}
      </main>

      <footer className="jury-footer">
        <Link to="/login">Connexion</Link>
        <Link to="/enterprise">Fonctionnalités</Link>
        <Link to="/mobile">App Flutter</Link>
        <Link to="/admin/digital-marketing">Marketing digital</Link>
        <span>PetfoodTN — démo jury 2026</span>
      </footer>
    </div>
  );
};

export default JuryDemoPage;
