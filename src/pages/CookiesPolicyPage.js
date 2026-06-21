import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  COOKIE_CATEGORIES,
  getCookieConsent,
  reopenCookiePreferences,
} from '../utils/cookieConsent';
import './LegalPages.css';

const COOKIE_TABLE = [
  { name: 'petfood_session / token JWT', category: 'necessary', duration: 'Session ou 30 j', purpose: 'Authentification sécurisée' },
  { name: 'petfood_cookie_consent', category: 'necessary', duration: '12 mois', purpose: 'Mémorisation de vos choix cookies' },
  { name: 'petfood_remember_email', category: 'preferences', duration: '30 j', purpose: 'E-mail mémorisé sur la page connexion' },
  { name: 'petfood_theme', category: 'preferences', duration: '12 mois', purpose: 'Thème clair / sombre' },
  { name: 'petfood_analytics', category: 'analytics', duration: '6 mois', purpose: 'Mesure d\'audience agrégée' },
  { name: 'petfood_marketing', category: 'marketing', duration: '6 mois', purpose: 'Offres et rappels promotionnels' },
];

const CookiesPolicyPage = () => {
  const [consent, setConsent] = useState(() => getCookieConsent());
  const [prefsOpened, setPrefsOpened] = useState(false);

  const handleManage = useCallback(() => {
    reopenCookiePreferences();
    setConsent(getCookieConsent());
    setPrefsOpened(true);
  }, []);

  return (
    <div className="legal-page">
      <header className="legal-page__hero legal-page__hero--cookies">
        <Link to="/login" className="legal-page__back">← Retour connexion</Link>
        <h1>Politique cookies</h1>
        <p>
          Types de cookies utilisés sur PetfoodTN, leur finalité et la gestion de vos préférences.
        </p>
      </header>

      <main className="legal-page__content">
        <section className="legal-page__section">
          <h2>Vos choix actuels</h2>
          <ul className="legal-page__consent-list">
            {Object.values(COOKIE_CATEGORIES).map((cat) => (
              <li key={cat.id}>
                <strong>{cat.label}</strong>
                {' — '}
                {cat.required || consent.categories?.[cat.id] ? (
                  <span className="legal-page__tag legal-page__tag--on">
                    {cat.required ? 'Toujours actif' : 'Activé'}
                  </span>
                ) : (
                  <span className="legal-page__tag legal-page__tag--off">Désactivé</span>
                )}
                <br />
                <small>{cat.description}</small>
              </li>
            ))}
          </ul>
          <button type="button" className="legal-page__manage-btn" onClick={handleManage}>
            Gérer mes préférences cookies
          </button>
          {prefsOpened && (
            <p className="legal-page__notice" role="status">
              La bannière cookies a été réaffichée en bas de l&apos;écran.
            </p>
          )}
        </section>

        <section className="legal-page__section">
          <h2>Tableau des cookies</h2>
          <div className="legal-page__table-wrap">
            <table className="legal-page__table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Catégorie</th>
                  <th>Durée</th>
                  <th>Finalité</th>
                </tr>
              </thead>
              <tbody>
                {COOKIE_TABLE.map((row) => (
                  <tr key={row.name}>
                    <td><code>{row.name}</code></td>
                    <td>{COOKIE_CATEGORIES[row.category]?.label || row.category}</td>
                    <td>{row.duration}</td>
                    <td>{row.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="legal-page__section">
          <h2>Comment refuser ou retirer votre consentement</h2>
          <p>
            Vous pouvez refuser les cookies non essentiels via la bannière ou le bouton ci-dessus.
            Les cookies essentiels (session, sécurité) restent nécessaires au fonctionnement du site.
            Pour en savoir plus sur vos données :{' '}
            <Link to="/politique-confidentialite">politique de confidentialité</Link>.
          </p>
        </section>
      </main>

      <footer className="legal-page__footer">
        <Link to="/politique-confidentialite">Confidentialité</Link>
        <Link to="/login">Connexion</Link>
        <Link to="/contact">Contact</Link>
      </footer>
    </div>
  );
};

export default CookiesPolicyPage;
