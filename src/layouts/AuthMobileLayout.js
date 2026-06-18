import React from 'react';
import { Link } from 'react-router-dom';
import MobileBottomNav, { AUTH_PUBLIC_MOBILE_NAV } from '../components/MobileBottomNav';
import PetfoodLogo from '../components/PetfoodLogo';

/** Coque mobile pour pages auth (login, register, mot de passe). */
const AuthMobileLayout = ({ children, title = 'Connexion' }) => (
  <div className="auth-mobile-shell platform-workspace platform-workspace--with-bottom-nav">
    <header className="auth-mobile-header">
      <Link to="/" className="auth-mobile-brand" aria-label="Accueil PetfoodTN">
        <PetfoodLogo size="sm" showTagline />
      </Link>
      <span className="auth-mobile-title">{title}</span>
    </header>
    <main className="auth-mobile-main" id="contenu-principal">
      {children}
    </main>
    <MobileBottomNav items={AUTH_PUBLIC_MOBILE_NAV} />
  </div>
);

export default AuthMobileLayout;
