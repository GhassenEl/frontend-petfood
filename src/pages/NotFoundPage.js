import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HOME = {
  admin: '/admin/dashboard',
  client: '/client-dashboard',
  livreur: '/livreur/dashboard',
  vet: '/vet/dashboard',
  vendor: '/vendor/dashboard',
  moderator: '/moderator/dashboard',
  support: '/support/dashboard',
};

const NotFoundPage = () => {
  const { user } = useAuth();
  const home = HOME[user?.role] || '/';

  return (
    <div className="not-found-page">
      <div className="not-found-page__emoji" aria-hidden>🐾</div>
      <h1 className="not-found-page__title">Page introuvable</h1>
      <p className="not-found-page__text">
        Cette adresse n&apos;existe pas ou a été déplacée. Utilisez les liens ci-dessous pour continuer.
      </p>
      <div className="not-found-page__actions">
        <Link to={home} className="not-found-page__btn not-found-page__btn--primary">
          Retour à l&apos;accueil
        </Link>
        <Link to="/contact" className="not-found-page__btn not-found-page__btn--secondary">
          Contact &amp; questions
        </Link>
        {!user && (
          <Link to="/visitor" className="not-found-page__btn not-found-page__btn--secondary">
            Espace visiteur
          </Link>
        )}
      </div>
    </div>
  );
};

export default NotFoundPage;
