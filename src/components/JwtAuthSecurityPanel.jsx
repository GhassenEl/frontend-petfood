import React from 'react';
import { Shield, Key, Users } from 'lucide-react';
import { VALID_ROLES } from '../utils/jwtSecurity';

const JwtAuthSecurityPanel = ({ jwt, loading }) => {
  if (loading) {
    return <p className="ais-loading">Vérification session JWT…</p>;
  }

  const roles = (jwt?.roles || VALID_ROLES).filter((r) =>
    ['admin', 'vendor', 'vet', 'client', 'moderator', 'livreur'].includes(r),
  );

  return (
    <div className="ais-jwt">
      <div className="ais-jwt-status">
        <Shield size={22} aria-hidden />
        <div>
          <strong>Session JWT</strong>
          <p>
            {jwt?.valid
              ? `Valide — rôle ${jwt?.roleLabel || jwt?.role || '—'}`
              : jwt?.hasToken
                ? `Invalide (${jwt?.reason || 'erreur'})`
                : 'Non connecté'}
          </p>
          {jwt?.exp && (
            <small>Expiration : {new Date(jwt.exp).toLocaleString('fr-FR')}</small>
          )}
        </div>
      </div>

      <h3><Key size={18} aria-hidden /> Rôles gérés par le token</h3>
      <ul className="ais-role-grid">
        {roles.map((role) => (
          <li key={role} className={jwt?.role === role ? 'ais-role-active' : ''}>
            <Users size={16} aria-hidden />
            <span>{jwt?.roleLabels?.[role] || role}</span>
            <code>{role}</code>
          </li>
        ))}
      </ul>

      <div className="ais-jwt-rules">
        <h4>Contrôles appliqués</h4>
        <ul>
          <li>Signature &amp; expiration du token (buffer configurable)</li>
          <li>Issuer / Audience (<code>VITE_JWT_ISSUER</code>, <code>VITE_JWT_AUDIENCE</code>)</li>
          <li>Rôle autorisé dans <code>VALID_ROLES</code></li>
          <li>En-tête <code>Authorization: Bearer</code> sur chaque requête API</li>
          <li>Déconnexion automatique si claims invalides ou session expirée</li>
        </ul>
      </div>
    </div>
  );
};

export default JwtAuthSecurityPanel;
