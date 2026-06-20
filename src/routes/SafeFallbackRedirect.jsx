import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getRoleHome } from '../config/roleConfig';

/** Redirige les URLs inconnues vers l'accueil ou l'espace de l'acteur — sans page 404. */
const SafeFallbackRedirect = () => {
  const { user } = useAuth();
  const target = user ? getRoleHome(user.role) : '/';
  return <Navigate to={target} replace />;
};

export default SafeFallbackRedirect;
