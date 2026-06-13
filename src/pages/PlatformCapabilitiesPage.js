import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_CAPABILITIES } from '../config/roleCapabilities';
import './AdminPages.css';

const PlatformCapabilitiesPage = () => {
  const { user } = useAuth();

  const canAccess = (cap) => {
    if (!cap.auth) return true;
    if (!user) return false;
    return user.role === cap.role || user.role === 'admin';
  };

  return (
    <div className="adm-page" style={{ maxWidth: 1100 }}>
      <header className="adm-hero">
        <h1>📋 Capacités PetfoodTN par acteur</h1>
        <p>Matrice officielle des fonctionnalités — chaque lien mène à la page correspondante.</p>
      </header>

      <div style={{ display: 'grid', gap: 16 }}>
        {ROLE_CAPABILITIES.map((role) => (
          <div key={role.id} className="adm-card">
            <h2 style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{role.icon}</span> {role.label}
              {role.auth && !user && (
                <span className="adm-demo-pill">Connexion requise</span>
              )}
            </h2>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
              {role.features.map((f) => {
                const ok = canAccess(role);
                return (
                  <li key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem' }}>
                    <span style={{ color: ok ? '#059669' : '#94a3b8' }}>{ok ? '✓' : '○'}</span>
                    {ok ? (
                      <Link to={f.route} style={{ color: '#0ea5e9', fontWeight: 600 }}>{f.label}</Link>
                    ) : (
                      <span style={{ color: '#64748b' }}>{f.label}</span>
                    )}
                    {ok && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{f.route}</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {!user && (
        <p style={{ marginTop: 20, textAlign: 'center' }}>
          <Link to="/login" className="adm-btn adm-btn--primary">Se connecter pour accéder aux espaces métiers</Link>
        </p>
      )}
    </div>
  );
};

export default PlatformCapabilitiesPage;
