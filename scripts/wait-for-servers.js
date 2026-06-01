/**
 * Attend que le frontend et le backend répondent avant les tests E2E.
 * Usage: node scripts/wait-for-servers.js
 */
const FRONTEND = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001';
const BACKEND = process.env.API_BASE_URL || 'http://localhost:5002';
const MAX_ATTEMPTS = 60;
const DELAY_MS = 2000;

async function ping(url) {
  const res = await fetch(url, { method: 'GET' });
  return res.ok || res.status < 500;
}

async function wait() {
  for (let i = 1; i <= MAX_ATTEMPTS; i += 1) {
    try {
      const [fe, be] = await Promise.all([
        ping(FRONTEND),
        ping(`${BACKEND}/health`),
      ]);
      if (fe && be) {
        console.log(`✅ Serveurs prêts (${FRONTEND}, ${BACKEND}) — tentative ${i}`);
        process.exit(0);
      }
    } catch {
      /* retry */
    }
    console.log(`⏳ En attente des serveurs… (${i}/${MAX_ATTEMPTS})`);
    await new Promise((r) => setTimeout(r, DELAY_MS));
  }
  console.error('❌ Timeout : frontend ou backend indisponible');
  process.exit(1);
}

wait();
