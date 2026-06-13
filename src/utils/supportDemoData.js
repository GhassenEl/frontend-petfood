/** Données démo — service client (tickets, assistance). */

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();
const hoursAgo = (h) => new Date(Date.now() - h * 3600000).toISOString();

export const DEMO_SUPPORT_TICKETS = [
  { id: 'tkt-1', subject: 'Commande non reçue CMD-9102', clientName: 'Amira B.', priority: 'high', status: 'open', channel: 'email', createdAt: hoursAgo(2) },
  { id: 'tkt-2', subject: 'Problème paiement PayPal', clientName: 'Karim M.', priority: 'medium', status: 'in_progress', channel: 'chat', createdAt: hoursAgo(5) },
  { id: 'tkt-3', subject: 'Question abonnement croquettes', clientName: 'Ines T.', priority: 'low', status: 'resolved', channel: 'phone', createdAt: daysAgo(1) },
  { id: 'tkt-4', subject: 'Retour produit endommagé', clientName: 'Leila S.', priority: 'high', status: 'open', channel: 'email', createdAt: daysAgo(2) },
];

export const DEMO_SUPPORT_ASSIST_QUEUE = [
  { id: 'as-1', clientName: 'Sami B.', topic: 'Choix croquettes chiot', waitingMin: 12, channel: 'chat' },
  { id: 'as-2', clientName: 'Nour H.', topic: 'RDV vétérinaire annulé', waitingMin: 5, channel: 'phone' },
];
