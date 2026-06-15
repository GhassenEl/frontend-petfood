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
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🐾</div>
      <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 900 }}>Page introuvable</h1>
      <p style={{ margin: '0 0 24px', color: '#64748b', maxWidth: 400 }}>
        Cette adresse n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        to={home}
        style={{
          padding: '12px 24px',
          borderRadius: 12,
          background: '#e67e22',
          color: '#fff',
          fontWeight: 700,
          textDecoration: 'none',
        }}
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
};

export default NotFoundPage;
