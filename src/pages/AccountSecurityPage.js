import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Lock, Wifi, FileText, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import JwtAuthSecurityPanel from '../components/JwtAuthSecurityPanel';
import TwoFactorAuthPanel from '../components/TwoFactorAuthPanel';
import ProdSecurityAuditPanel from '../components/ProdSecurityAuditPanel';
import { getStoredToken } from '../utils/authStorage';
import { validateTokenClaims, VALID_ROLES, ROLE_LABELS } from '../utils/jwtSecurity';
import { isSecureConnection } from '../utils/platformSecurityLayer';
import { is2FARequiredForRole } from '../utils/twoFactorPolicy';
import { canAccessAuditFeatures } from '../utils/auditSecurityPolicy';
import {
  getPasswordChangeRoute,
  SECURITY_QUICK_LINKS,
} from '../config/roleSecurityConfig';
import '../pages/AdminIntelligentSecurity.css';

const CHECKS = [
  { id: 'jwt', label: 'Session JWT', detail: 'Token signé, rôle vérifié, expiration contrôlée' },
  { id: 'https', label: 'Connexion chiffrée', detail: 'HTTPS ou environnement local sécurisé' },
  { id: 'scan', label: 'Filtrage contenu', detail: 'Scan anti-XSS / SQL sur les formulaires sensibles' },
  { id: 'moderation', label: 'Modération automatique', detail: 'Textes injurieux ou frauduleux bloqués côté client' },
];

const AccountSecurityPage = ({ role: roleProp }) => {
  const { user } = useAuth();
  const location = useLocation();
  const role = roleProp || user?.role || 'client';
  const secure = isSecureConnection();
  const mandatory2fa = is2FARequiredForRole(role);
  const require2faBanner = Boolean(location.state?.require2fa) && mandatory2fa;
  const auditBlocked = Boolean(location.state?.auditBlocked);

  const jwt = useMemo(() => {
    const token = getStoredToken();
    const validation = token ? validateTokenClaims(token) : null;
    return {
      valid: Boolean(validation?.valid),
      hasToken: Boolean(token),
      role: validation?.decoded?.role,
      roleLabel: ROLE_LABELS[validation?.decoded?.role] || validation?.decoded?.role,
      exp: validation?.decoded?.exp ? validation.decoded.exp * 1000 : null,
      reason: validation?.reason,
      roles: VALID_ROLES,
      roleLabels: ROLE_LABELS,
    };
  }, [user]);

  const passwordRoute = getPasswordChangeRoute(role);
  const quickLinks = SECURITY_QUICK_LINKS[role] || SECURITY_QUICK_LINKS.client;

  return (
    <div className="ais-page">
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.6rem' }}>
          <Shield size={28} color="#7c3aed" aria-hidden />
          Sécurité du compte
        </h1>
        <p className="ais-lead">
          Session, mot de passe et bonnes pratiques — espace{' '}
          <strong>{ROLE_LABELS[role] || role}</strong>.
          {role === 'admin' && (
            <>
              {' '}
              <Link to="/admin/intelligent-security" style={{ color: '#7c3aed', fontWeight: 700 }}>
                Posture plateforme complète →
              </Link>
            </>
          )}
        </p>
      </header>

      {(require2faBanner || auditBlocked) && (
        <div
          style={{
            marginBottom: 20,
            padding: 14,
            borderRadius: 12,
            background: '#fff7ed',
            border: '1px solid #fed7aa',
            color: '#9a3412',
            fontSize: 14,
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
          }}
        >
          <AlertTriangle size={20} style={{ flexShrink: 0 }} aria-hidden />
          <div>
            <strong>{auditBlocked ? 'Accès audit refusé' : 'Configuration 2FA requise'}</strong>
            <p style={{ margin: '6px 0 0', fontSize: 13 }}>
              {auditBlocked
                ? 'Les journaux et l\'audit production exigent un compte administrateur avec 2FA active.'
                : 'Votre rôle exige l\'authentification à deux facteurs. Activez-la ci-dessous pour continuer.'}
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div className="ais-panel-wrap" style={{ padding: 16, textAlign: 'center' }}>
          <Wifi size={22} color={secure ? '#059669' : '#dc2626'} aria-hidden />
          <p style={{ margin: '8px 0 4px', fontWeight: 800, color: secure ? '#059669' : '#dc2626' }}>
            {secure ? 'Connexion sécurisée' : 'Connexion non chiffrée'}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>TLS / HTTPS</p>
        </div>
        <div className="ais-panel-wrap" style={{ padding: 16, textAlign: 'center' }}>
          <Lock size={22} color="#2563eb" aria-hidden />
          <p style={{ margin: '8px 0 4px', fontWeight: 800 }}>Mot de passe</p>
          <Link to={passwordRoute} style={{ fontSize: 13, fontWeight: 700, color: '#2563eb' }}>
            Modifier →
          </Link>
        </div>
        <div className="ais-panel-wrap" style={{ padding: 16, textAlign: 'center' }}>
          <Shield size={22} color={jwt.valid ? '#059669' : '#d97706'} aria-hidden />
          <p style={{ margin: '8px 0 4px', fontWeight: 800, color: jwt.valid ? '#059669' : '#d97706' }}>
            {jwt.valid ? 'Session active' : 'Session à vérifier'}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>JWT</p>
        </div>
      </div>

      <div className="ais-panel-wrap" style={{ marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 14px', fontSize: '1.05rem' }}>Session &amp; authentification</h2>
        <JwtAuthSecurityPanel jwt={jwt} loading={false} />
      </div>

      {mandatory2fa && (
        <TwoFactorAuthPanel user={user} mandatory />
      )}

      {canAccessAuditFeatures(user) && (
        <ProdSecurityAuditPanel user={user} recordRun={false} />
      )}

      {role === 'admin' && !canAccessAuditFeatures(user) && (
        <div className="ais-panel-wrap" style={{ marginBottom: 20, fontSize: 13, color: '#64748b' }}>
          <strong>Audit production</strong> — activez la 2FA pour débloquer la checklist et les journaux sensibles.
        </div>
      )}

      <div className="ais-panel-wrap" style={{ marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 14px', fontSize: '1.05rem' }}>Protections actives</h2>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
          {CHECKS.map((check) => {
            const ok = check.id === 'https' ? secure : check.id === 'jwt' ? jwt.valid : true;
            return (
              <li
                key={check.id}
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                  padding: 12,
                  borderRadius: 12,
                  background: ok ? '#f0fdf4' : '#fffbeb',
                  border: `1px solid ${ok ? '#bbf7d0' : '#fde68a'}`,
                }}
              >
                <Shield size={18} color={ok ? '#15803d' : '#d97706'} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden />
                <div>
                  <strong style={{ display: 'block', fontSize: 14 }}>{check.label}</strong>
                  <span style={{ fontSize: 13, color: '#64748b' }}>{check.detail}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {quickLinks.length > 0 && (
        <div className="ais-panel-wrap">
          <h2 style={{ margin: '0 0 14px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={18} aria-hidden />
            Ressources sécurité
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: 13,
                  textDecoration: 'none',
                }}
              >
                <span aria-hidden>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSecurityPage;
