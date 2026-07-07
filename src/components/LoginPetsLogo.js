import React from 'react';
import { Link } from 'react-router-dom';
import PetfoodLogo from './PetfoodLogo';

const LoginPetsLogo = () => (
  <Link to="/marketing" className="login-brand-link" aria-label="PetfoodTN — présentation">
    <PetfoodLogo size="lg" showTagline />
  </Link>
);

export default LoginPetsLogo;
