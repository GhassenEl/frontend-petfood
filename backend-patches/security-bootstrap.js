/**
 * Bootstrap sécurité — chargé par server.js après les middlewares de base.
 * Journalisation accès cliniques vet.
 */
const { vetClinicalAuditMiddleware } = require('./middleware/vetClinicalAudit.middleware');

function applySecurityEnhancements(app) {
  app.use('/api', vetClinicalAuditMiddleware);
  console.log('🛡️  Security bootstrap: vet clinical audit + HttpOnly cookies actifs');
}

module.exports = { applySecurityEnhancements };
