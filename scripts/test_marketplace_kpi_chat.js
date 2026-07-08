/**
 * Smoke tests — marketplace KPI chat (node scripts/test_marketplace_kpi_chat.js)
 */
const svc = require('../backend/services/marketplaceKpiChat.service');

const cases = [
  ['KPI marketplace', 'admin'],
  ['Top ventes', 'admin'],
  ['Quel est le pourcentage de produits sans vente ?', 'admin'],
  ['Répartition catégories', 'analyst'],
  ['KPI jouets', 'vendor'],
  ['Produits populaires souhaits', 'client'],
  ['KPI marketplace produits mal notés', 'moderator'],
  ['Volume colis par catégorie', 'livreur'],
  ['Top souhaits', 'visitor'],
];

let ok = 0;
let fail = 0;

for (const [msg, role] of cases) {
  const res = svc.buildMarketplaceKpiResponse(msg, role);
  if (res && res.content && res.content.length > 20) {
    ok += 1;
    console.log(`OK [${role}] ${msg.slice(0, 40)} -> ${res.content.slice(0, 60)}...`);
  } else {
    fail += 1;
    console.log(`FAIL [${role}] ${msg}`);
  }
}

const kpis = svc.loadMarketplaceKpis();
if (!kpis || !kpis.total_products) {
  console.error('FAIL: kpi_summary.json not loaded');
  process.exit(1);
}

console.log(`\n${ok}/${cases.length} passed, KPI products=${kpis.total_products}`);
process.exit(fail > 0 ? 1 : 0);
