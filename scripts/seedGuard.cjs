/**
 * Garde-fous pour scripts de seed — empêche l'exécution non autorisée en production.
 */
const crypto = require('crypto');

const isProduction = () =>
  process.env.NODE_ENV === 'production' || process.env.DEMO_MODE === 'false';

function assertSeedAllowed() {
  if (!isProduction()) return;

  const secret = process.env.SEED_SECRET;
  if (!secret || secret.length < 16) {
    console.error('❌ SEED bloqué en production : définissez SEED_SECRET (min. 16 caractères).');
    console.error('   Ex. : SEED_SECRET=$(openssl rand -hex 32) npm run seed:platform-live');
    process.exit(1);
  }

  const provided = process.env.SEED_CONFIRM;
  if (provided !== secret) {
    console.error('❌ SEED bloqué : SEED_CONFIRM doit être égal à SEED_SECRET en production.');
    process.exit(1);
  }
}

function resolveSeedPassword(envKey, fallbackDev) {
  const fromEnv = process.env[envKey];
  if (fromEnv && fromEnv.length >= 8) return fromEnv;

  if (isProduction()) {
    const generated = crypto.randomBytes(18).toString('base64url');
    console.warn(`⚠️  ${envKey} absent — mot de passe aléatoire généré pour ce seed.`);
    console.warn('   Enregistrez-le et changez-le via l\'interface compte.');
    return generated;
  }

  return fallbackDev;
}

module.exports = { assertSeedAllowed, resolveSeedPassword, isProduction };
