import React from 'react';
import AuthMobileLayout from '../layouts/AuthMobileLayout';
import useIsMobile from '../hooks/useIsMobile';

/** Enveloppe les pages auth avec la coque mobile (header + bottom nav) sur petit écran. */
const AuthMobileRoute = ({ children, title = 'Connexion' }) => {
  const isMobile = useIsMobile();
  if (!isMobile) return children;
  return <AuthMobileLayout title={title}>{children}</AuthMobileLayout>;
};

export default AuthMobileRoute;
