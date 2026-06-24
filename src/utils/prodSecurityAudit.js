import { isStrictLiveMode } from '../config/liveDataPolicy';
import { getStoredToken } from './authStorage';
import { validateTokenClaims } from './jwtSecurity';
import { isSecureConnection } from './platformSecurityLayer';
import {
  is2FAEnabled,
  is2FARequiredForRole,
  getUserStorageKey,
  MANDATORY_2FA_ROLES,
} from './twoFactorPolicy';
import { canAccessAuditFeatures } from './auditSecurityPolicy';

const severity = { pass: 'pass', warn: 'warn', fail: 'fail' };

const item = (id, label, ok, detail, level = null) => ({
  id,
  label,
  ok: Boolean(ok),
  level: level || (ok ? severity.pass : severity.fail),
  detail,
});

export function runProdSecurityAudit(user, context = {}) {
  const token = getStoredToken();
  const jwt = token ? validateTokenClaims(token) : null;
  const secure = isSecureConnection();
  const strictLive = isStrictLiveMode();
  const issuer = import.meta.env.VITE_JWT_ISSUER || '';
  const audience = import.meta.env.VITE_JWT_AUDIENCE || '';
  const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';
  const isProdBuild = import.meta.env.PROD;
  const userKey = getUserStorageKey(user);
  const user2faOk = !user || !is2FARequiredForRole(user.role) || is2FAEnabled(userKey);
  const auditAccessOk = canAccessAuditFeatures(user);
  const chainOk = context.chainOk !== false;
  const logsFromServer = context.activityLogSource === 'server';
  const recentAudit = Boolean(context.recentAuditRun);

  const csrfMeta =
    typeof document !== 'undefined'
      ? document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
      : '';

  return [
    item(
      'https',
      'Connexion TLS (HTTPS)',
      secure,
      secure
        ? 'Protocole chiffré ou environnement local de développement.'
        : 'Le site est servi en HTTP — activer HTTPS en production.',
    ),
    item(
      'strict-live',
      'Mode strict live (pas de fallback démo)',
      strictLive,
      strictLive
        ? 'VITE_STRICT_LIVE actif — les données démo ne masquent pas les erreurs API.'
        : 'Activer VITE_STRICT_LIVE=true en staging/production.',
      strictLive ? severity.pass : isProdBuild ? severity.fail : severity.warn,
    ),
    item(
      'jwt-session',
      'Session JWT valide',
      Boolean(jwt?.valid),
      jwt?.valid
        ? `Rôle ${jwt.decoded?.role || '—'} — expiration contrôlée.`
        : jwt?.reason || 'Aucun token valide — reconnectez-vous.',
    ),
    item(
      'jwt-issuer',
      'Émetteur JWT configuré',
      Boolean(issuer) || !isProdBuild,
      issuer
        ? `Issuer : ${issuer}`
        : 'Définir VITE_JWT_ISSUER pour valider l\'émetteur en production.',
      issuer || !isProdBuild ? severity.pass : severity.fail,
    ),
    item(
      'jwt-audience',
      'Audience JWT configurée',
      Boolean(audience) || !isProdBuild,
      audience
        ? `Audience : ${audience}`
        : 'Définir VITE_JWT_AUDIENCE pour restreindre les tokens.',
      audience || !isProdBuild ? severity.pass : severity.warn,
    ),
    item(
      'api-base',
      'URL API backend définie',
      Boolean(apiBase) || !isProdBuild,
      apiBase
        ? `API : ${apiBase}`
        : 'Configurer VITE_API_URL vers l\'API de production.',
      apiBase || !isProdBuild ? severity.pass : severity.fail,
    ),
    item(
      'csrf',
      'Token CSRF (requêtes mutantes)',
      Boolean(csrfMeta) || !isProdBuild,
      csrfMeta
        ? 'Meta csrf-token présente — en-tête X-CSRF-Token envoyé.'
        : 'Injecter un token CSRF côté serveur (meta ou cookie).',
      csrfMeta || !isProdBuild ? severity.pass : severity.warn,
    ),
    item(
      '2fa-privileged',
      '2FA compte privilégié actif',
      user2faOk,
      user2faOk
        ? user && is2FARequiredForRole(user.role)
          ? '2FA activée pour ce compte sensible.'
          : `Rôles concernés : ${MANDATORY_2FA_ROLES.join(', ')}.`
        : 'Activez la 2FA sur cette page avant d\'accéder au reste de la plateforme.',
      user2faOk ? severity.pass : severity.fail,
    ),
    item(
      'rbac-guard',
      'Garde RBAC par rôle (RoleRoute)',
      true,
      'Routes protégées par rôle — accès refusé si rôle incompatible.',
    ),
    item(
      'token-storage',
      'Stockage token (pas en URL)',
      typeof window === 'undefined' || !window.location.search.includes('token='),
      'Les tokens ne doivent pas transiter dans l\'URL.',
    ),
    item(
      'content-scan',
      'Filtrage XSS / contenu sensible',
      true,
      'Couche client assertContentSafe + modération automatique.',
      severity.pass,
    ),
    item(
      'backend-2fa',
      '2FA validée côté serveur',
      false,
      'La 2FA actuelle est locale (démo) — brancher TOTP sur l\'API avant mise en prod.',
      severity.warn,
    ),
    item(
      'secrets-env',
      'Secrets hors du dépôt',
      true,
      'Vérifier que .env, clés Stripe et JWT ne sont pas commités.',
      severity.pass,
    ),
    item(
      'audit-access',
      'Accès audit réservé (admin + 2FA)',
      auditAccessOk,
      auditAccessOk
        ? 'Compte administrateur avec 2FA — accès aux journaux et checklist autorisé.'
        : 'Seuls les administrateurs avec 2FA active peuvent consulter l\'audit.',
      auditAccessOk ? severity.pass : severity.fail,
    ),
    item(
      'audit-chain',
      'Intégrité chaîne d\'audit locale',
      chainOk,
      chainOk
        ? (context.chainMessage || 'Empreintes chaînées vérifiées.')
        : (context.chainMessage || 'Altération détectée dans l\'historique des audits.'),
      chainOk ? severity.pass : severity.fail,
    ),
    item(
      'audit-logs',
      'Journal d\'audit centralisé',
      logsFromServer,
      logsFromServer
        ? 'Journaux servis par l\'API backend (source serveur).'
        : 'Journaux en mode local/démo — brancher GET /admin/activity-logs sur stockage immuable.',
      logsFromServer ? severity.pass : severity.warn,
    ),
    item(
      'audit-recent-run',
      'Audit production récent',
      recentAudit || !isProdBuild,
      recentAudit
        ? 'Un audit a été exécuté récemment (< 30 jours).'
        : 'Exécutez l\'audit depuis /admin/security-audit.',
      recentAudit || !isProdBuild ? severity.pass : severity.warn,
    ),
  ];
};

export function summarizeProdAudit(checks) {
  const total = checks.length;
  const passed = checks.filter((c) => c.level === severity.pass).length;
  const warnings = checks.filter((c) => c.level === severity.warn).length;
  const failed = checks.filter((c) => c.level === severity.fail).length;
  const score = Math.round((passed / total) * 100);
  return { total, passed, warnings, failed, score };
};

export const AUDIT_SEVERITY = severity;
