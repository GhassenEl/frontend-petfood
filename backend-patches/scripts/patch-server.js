/**
 * Injecte security-bootstrap dans server.js si absent.
 */
const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, '../server.js');
let src = fs.readFileSync(serverPath, 'utf8');

const marker = 'security-bootstrap';
if (src.includes(marker)) {
  console.log('ℹ️  server.js déjà patché');
  process.exit(0);
}

const injection = `
// --- PetfoodTN security bootstrap (HttpOnly cookies, audit vet) ---
try {
  const { applySecurityEnhancements } = require('./security-bootstrap');
  applySecurityEnhancements(app);
} catch (e) {
  console.warn('Security bootstrap skip:', e.message);
}
`;

const anchor = 'app.use(express.json());';
if (!src.includes(anchor)) {
  console.error('❌ Ancre server.js introuvable');
  process.exit(1);
}

src = src.replace(anchor, `${anchor}\n${injection}`);
fs.writeFileSync(serverPath, src, 'utf8');
console.log('✅ server.js patché (security-bootstrap)');

// CORS : autoriser cookies cross-origin
if (!src.includes('X-CSRF-Token')) {
  let corsSrc = fs.readFileSync(serverPath, 'utf8');
  corsSrc = corsSrc.replace(
    "allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],",
    "allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-CSRF-Token', 'X-Requested-With', 'Cookie'],",
  );
  fs.writeFileSync(serverPath, corsSrc, 'utf8');
  console.log('✅ server.js CORS headers étendus');
}
