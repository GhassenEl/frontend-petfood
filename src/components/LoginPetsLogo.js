import React from 'react';
import { Link } from 'react-router-dom';
import PetfoodLogo from './PetfoodLogo';

const LoginPetsLogo = () => (
  <Link to="/" className="login-brand-link" aria-label="PetfoodTN — retour à l'accueil">
    <PetfoodLogo size="lg" showTagline />
  </Link>
);

export default LoginPetsLogo;
