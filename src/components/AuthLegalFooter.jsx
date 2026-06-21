import React from 'react';
import { Link } from 'react-router-dom';

const AuthLegalFooter = ({ showForgot = false, showRegister = false }) => (
  <footer className="auth-legal-footer">
    {showForgot && (
      <p className="auth-legal-footer__forgot">
        <Link to="/forgot-password">Mot de passe oublié ?</Link>
      </p>
    )}
    {showRegister && (
      <p className="auth-legal-footer__register">
        Pas encore de compte ? <Link to="/register">Créer un compte</Link>
      </p>
    )}
    <p className="auth-legal-footer__links">
      <Link to="/politique-confidentialite">Politique de confidentialité</Link>
      <span aria-hidden="true"> · </span>
      <Link to="/cookies">Politique cookies</Link>
    </p>
    <p className="auth-legal-footer__hint">
      PetfoodTN utilise des cookies essentiels pour la session et, avec votre accord, des cookies de préférences et analytique.
    </p>
  </footer>
);

export default AuthLegalFooter;
