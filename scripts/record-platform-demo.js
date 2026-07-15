/**
 * Vidéo MP4 — Présentation plateforme PetfoodTN (7 acteurs, IA, architecture)
 *
 * Usage : npm run demo:platform:mp4
 * Prérequis : npm run dev (:3001 + :5002)
 */

const { recordTour } = require('./demo-recorder-utils');

const PLATFORM_TOUR = [
  { phase: 'Intro — page démo jury', path: '/jury-demo', pauseMs: 6000, logout: false },
  { phase: 'Vue d\'ensemble PFE & stack', path: '/jury-demo', pauseMs: 5500, juryTab: 'Vue', scroll: 3 },
  { phase: 'Les 7 acteurs — cartes interfaces', path: '/jury-demo', pauseMs: 7000, juryTab: 'Acteurs', scroll: 8 },
  { phase: 'Landing publique', path: '/', pauseMs: 4500, scroll: 3 },
  { phase: 'Fonctionnalités entreprise', path: '/enterprise', pauseMs: 5000, scroll: 4 },
  { phase: 'Hub intelligence IA', path: '/intelligence', pauseMs: 5000, scroll: 4 },
  { phase: 'Client — Boutique', path: '/client-products', pauseMs: 4500, loginAs: 'client', scroll: 2 },
  { phase: 'Client — Smart Hub IoT', path: '/client-smart-hub', pauseMs: 4500, loginAs: 'client', scroll: 2 },
  { phase: 'Client — Recommandations IA', path: '/client-recommendations', pauseMs: 4500, loginAs: 'client', scroll: 2 },
  { phase: 'Admin — Dashboard pilotage', path: '/admin/dashboard', pauseMs: 4500, loginAs: 'admin', scroll: 2 },
  { phase: 'Admin — Recommandations ML', path: '/admin/recommendations', pauseMs: 4500, loginAs: 'admin', scroll: 2 },
  { phase: 'Vendeur — Marketplace', path: '/vendor/dashboard', pauseMs: 4500, loginAs: 'vendor', scroll: 2 },
  { phase: 'Vendeur — Assistant ML stock', path: '/vendor/ml', pauseMs: 4000, loginAs: 'vendor', scroll: 2 },
  { phase: 'Modérateur — Centre anti-fraude', path: '/moderator/fraud', pauseMs: 4500, loginAs: 'moderator', scroll: 2 },
  { phase: 'Modérateur — Validation contenu', path: '/moderator/content', pauseMs: 4000, loginAs: 'moderator', scroll: 2 },
  { phase: 'Livreur — Tournée & carte', path: '/livreur/map', pauseMs: 4500, loginAs: 'livreur', scroll: 2 },
  { phase: 'Livreur — Dashboard gains', path: '/livreur/dashboard', pauseMs: 4000, loginAs: 'livreur', scroll: 2 },
  { phase: 'Vétérinaire — Agenda RDV', path: '/vet/calendar', pauseMs: 4500, loginAs: 'vet', scroll: 2 },
  { phase: 'Vétérinaire — Dossiers médicaux', path: '/vet/medical-dossiers', pauseMs: 4500, loginAs: 'vet', scroll: 2 },
  { phase: 'Chatbot & IA — récap jury', path: '/jury-demo', pauseMs: 5500, juryTab: 'Chatbot', scroll: 2 },
  { phase: 'Parcours live — conclusion', path: '/jury-demo', pauseMs: 5000, juryTab: 'Parcours' },
];

recordTour({
  title: 'Plateforme PetfoodTN — enregistrement MP4',
  tour: PLATFORM_TOUR,
  outputName: 'petfoodtn-platform-demo',
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
