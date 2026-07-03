/**
 * Journalise les accès vétérinaires aux données cliniques sensibles (RGPD / traçabilité).
 */
const { logFromRequest } = require('../services/activityLog.service');

const SENSITIVE_PREFIXES = [
  '/vet/clients',
  '/vet/history',
  '/vet/medical-dossiers',
  '/vet/prescriptions',
  '/vet/consultations',
  '/vet/clinical',
  '/vet/pharmacy',
  '/ml/vet/clinical',
];

const vetClinicalAuditMiddleware = (req, res, next) => {
  const role = req.user?.role;
  if (!role || !['vet', 'admin'].includes(role)) return next();

  const path = req.originalUrl || req.path || '';
  const isSensitive = SENSITIVE_PREFIXES.some((p) => path.includes(p));
  if (!isSensitive || req.method === 'OPTIONS') return next();

  res.on('finish', () => {
    if (res.statusCode >= 400) return;
    logFromRequest(req, {
      actorRole: role,
      actorName: req.user?.name || req.user?.email,
      action: 'vet_clinical_access',
      target: path.split('?')[0],
      details: `${req.method} — accès dossier / données patient`,
      module: 'vet_security',
      severity: path.includes('medical-dossier') ? 'high' : 'medium',
    }).catch(() => {});
  });

  return next();
};

module.exports = { vetClinicalAuditMiddleware };
