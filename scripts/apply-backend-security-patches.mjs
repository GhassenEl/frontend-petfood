/**
 * Applique les patches sécurité au conteneur backend Docker.
 * Usage : npm run security:apply
 */
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const container = process.env.BACKEND_CONTAINER || 'petfood-backend';

const run = (cmd) => {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: root });
};

const copy = (local, remote) => {
  run(`docker cp "${path.join(root, local)}" ${container}:${remote}`);
};

console.log(`🛡️  Application des patches sécurité → ${container}`);

copy('backend-patches/utils/authCookies.js', '/app/utils/authCookies.js');
copy('backend-patches/middleware/auth.js', '/app/middleware/auth.js');
copy('backend-patches/middleware/vetClinicalAudit.middleware.js', '/app/middleware/vetClinicalAudit.middleware.js');
copy('backend-patches/security-bootstrap.js', '/app/security-bootstrap.js');
copy('backend-patches/scripts/patch-auth-controller.js', '/app/scripts/patch-auth-controller.js');
copy('backend-patches/scripts/patch-server.js', '/app/scripts/patch-server.js');

run(`docker exec ${container} node /app/scripts/patch-auth-controller.js`);
run(`docker exec ${container} node /app/scripts/patch-server.js`);
run(`docker restart ${container}`);

console.log('✅ Patches backend appliqués — conteneur redémarré.');
