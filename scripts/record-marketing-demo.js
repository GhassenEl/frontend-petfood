/**
 * Vidéo MP4 — Marketing digital PetfoodTN
 * Landing, newsletter, hub admin, audience live, marketing vendeur.
 *
 * Usage : npm run demo:marketing:mp4
 * Prérequis : npm run dev (:3001 + :5002)
 */

const { recordTour } = require('./demo-recorder-utils');

const MARKETING_TOUR = [
  { phase: 'Landing — accueil marketing', path: '/', pauseMs: 5000, logout: false },
  { phase: 'Landing — section marketing digital', path: '/', hash: '#marketing-digital', pauseMs: 5500, scroll: 3 },
  { phase: 'Landing — newsletter & codes promo', path: '/', hash: '#newsletter-title', pauseMs: 5000, scroll: 2 },
  { phase: 'Page jury — onglet Marketing', path: '/jury-demo', pauseMs: 4500, juryTab: 'Marketing' },
  { phase: 'Admin — Hub marketing digital', path: '/admin/digital-marketing', pauseMs: 6500, loginAs: 'admin', scroll: 5 },
  { phase: 'Admin — Campagnes & entonnoir (scroll)', path: '/admin/digital-marketing', pauseMs: 5500, loginAs: 'admin', scroll: 6, scrollDelta: 380 },
  { phase: 'Admin — Audience live', path: '/admin/live-audience', pauseMs: 5500, loginAs: 'admin', scroll: 3 },
  { phase: 'Admin — Hub commercial', path: '/admin/commercial', pauseMs: 5000, loginAs: 'admin', scroll: 3 },
  { phase: 'Vendeur — Marketing réseaux sociaux', path: '/vendor/marketing', pauseMs: 6000, loginAs: 'vendor', scroll: 5 },
  { phase: 'Vendeur — Dashboard CA', path: '/vendor/dashboard', pauseMs: 4500, loginAs: 'vendor', scroll: 2 },
  { phase: 'Retour landing — acteurs plateforme', path: '/', pauseMs: 4500, scroll: 4 },
  { phase: 'Jury — récap marketing', path: '/jury-demo', pauseMs: 5000, juryTab: 'Marketing' },
];

recordTour({
  title: 'Marketing digital — enregistrement MP4',
  tour: MARKETING_TOUR,
  outputName: 'petfoodtn-marketing-demo',
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
