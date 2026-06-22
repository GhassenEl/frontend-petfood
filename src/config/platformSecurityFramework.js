/**
 * Cadre de sécurité PetfoodTN — 12 piliers (cahier des charges).
 * Stack réelle : React + Node/Express API + Prisma/PostgreSQL (équivalent JPA paramétré).
 */

export const SECURITY_STATUS = {
  implemented: { label: 'Actif', color: '#059669', bg: '#ecfdf5' },
  partial: { label: 'Partiel', color: '#d97706', bg: '#fffbeb' },
  planned: { label: 'Planifié', color: '#64748b', bg: '#f1f5f9' },
};

export const PLATFORM_SECURITY_PILLARS = [
  {
    id: 'auth',
    order: 1,
    title: 'Authentification sécurisée',
    icon: '🔐',
    summary: 'Inscription / connexion JWT, BCrypt, politique de mots de passe, vérification email et 2FA.',
    status: 'partial',
    route: '/admin/intelligent-security',
    items: [
      { id: 'jwt', label: 'Inscription / connexion avec JWT', status: 'implemented', route: '/admin/intelligent-security', note: 'Access + refresh token, bannière expiration' },
      { id: 'bcrypt', label: 'Hachage BCrypt des mots de passe', status: 'partial', route: '/admin/intelligent-security', note: 'Cost 12 côté API — vérification UI' },
      { id: 'password-policy', label: 'Politique de mots de passe forts', status: 'implemented', route: '/register', note: '8+ car., majuscule, minuscule, chiffre, symbole' },
      { id: 'email-verify', label: 'Vérification adresse email', status: 'partial', route: '/verify-email', note: 'Lien de confirmation après inscription' },
      { id: '2fa', label: '2FA (TOTP, email ou SMS)', status: 'partial', route: '/admin/intelligent-security#2fa', note: 'TOTP actif — canaux email/SMS en déploiement' },
    ],
  },
  {
    id: 'rbac',
    order: 2,
    title: 'Gestion des rôles (RBAC)',
    icon: '👥',
    summary: 'Permissions minimales par rôle — administrateur, gestionnaire stock, client, livreur et autres acteurs.',
    status: 'implemented',
    route: '/capabilities',
    items: [
      { id: 'admin', label: 'Administrateur', status: 'implemented', route: '/admin/dashboard' },
      { id: 'stock_manager', label: 'Gestionnaire de stock', status: 'implemented', route: '/admin/stock' },
      { id: 'client', label: 'Client', status: 'implemented', route: '/client-dashboard' },
      { id: 'livreur', label: 'Livreur', status: 'implemented', route: '/livreur/dashboard' },
      { id: 'vendor', label: 'Vendeur marketplace', status: 'implemented', route: '/vendor/dashboard' },
      { id: 'vet', label: 'Vétérinaire', status: 'implemented', route: '/vet/dashboard' },
      { id: 'moderator', label: 'Modérateur', status: 'implemented', route: '/moderator/dashboard' },
    ],
  },
  {
    id: 'web-attacks',
    order: 3,
    title: 'Protection contre les attaques Web',
    icon: '🛡️',
    summary: 'SQL Injection, XSS, CSRF et brute force.',
    status: 'partial',
    route: '/admin/security',
    items: [
      { id: 'sqli', label: 'SQL Injection — ORM Prisma & requêtes paramétrées', status: 'implemented', route: '/admin/database-security' },
      { id: 'xss', label: 'XSS — validation & échappement HTML', status: 'implemented', route: '/admin/security', note: 'IDS + modération + escapeHtml côté client' },
      { id: 'csrf', label: 'Protection CSRF', status: 'partial', route: '/admin/security-framework', note: 'Token XSRF sur requêtes mutantes (API)' },
      { id: 'brute-force', label: 'Brute force — blocage temporaire', status: 'implemented', route: '/admin/security', note: 'Rate limit login + IDS' },
    ],
  },
  {
    id: 'payment',
    order: 4,
    title: 'Paiement sécurisé',
    icon: '💳',
    summary: 'Stripe, Konnect, TLS — aucune donnée bancaire stockée.',
    status: 'implemented',
    route: '/checkout',
    items: [
      { id: 'stripe', label: 'Intégration Stripe (PaymentIntent)', status: 'implemented', route: '/checkout' },
      { id: 'konnect', label: 'Intégration Konnect (Tunisie)', status: 'partial', route: '/checkout' },
      { id: 'tls', label: 'Chiffrement SSL/TLS', status: 'implemented', route: '/admin/account-security' },
      { id: 'no-pan', label: 'Aucune sauvegarde CB (PCI-DSS)', status: 'implemented', route: '/checkout', note: 'Tokenisation Stripe — pas de PAN en base' },
    ],
  },
  {
    id: 'encryption',
    order: 5,
    title: 'Chiffrement des données sensibles',
    icon: '🔒',
    summary: 'Adresses, téléphones, livraison — AES-256 et HTTPS.',
    status: 'partial',
    route: '/admin/database-security',
    items: [
      { id: 'aes-fields', label: 'Chiffrement AES-256 champs sensibles', status: 'partial', route: '/admin/database-security', note: 'Au repos côté API / cloud' },
      { id: 'https', label: 'HTTPS obligatoire en production', status: 'implemented', route: '/admin/performance' },
      { id: 'masking', label: 'Masquage affichage (tél., adresse)', status: 'implemented', route: '/admin/security-framework', note: 'Masquage UI + contrôle rôle' },
    ],
  },
  {
    id: 'ai-fraud',
    order: 6,
    title: 'Détection comportements suspects (IA)',
    icon: '🧠',
    summary: 'Commandes rapides, connexions multi-pays, échecs auth — alertes automatiques.',
    status: 'implemented',
    route: '/admin/intelligent-security',
    items: [
      { id: 'burst-orders', label: 'Plusieurs commandes en quelques secondes', status: 'implemented', route: '/admin/intelligent-security' },
      { id: 'geo-anomaly', label: 'Connexions depuis pays différents', status: 'implemented', route: '/admin/intelligent-security' },
      { id: 'auth-failures', label: 'Échecs d\'authentification répétés', status: 'implemented', route: '/admin/security' },
      { id: 'auto-alerts', label: 'Alertes automatiques admin', status: 'implemented', route: '/moderator/fraud' },
    ],
  },
  {
    id: 'audit',
    order: 7,
    title: 'Journalisation & Audit',
    icon: '📋',
    summary: 'Connexions, produits, suppressions, paiements — table Audit complète.',
    status: 'implemented',
    route: '/admin/activity-logs',
    items: [
      { id: 'logins', label: 'Connexions utilisateurs', status: 'implemented', route: '/admin/activity-logs' },
      { id: 'products', label: 'Modifications produits', status: 'implemented', route: '/admin/activity-logs' },
      { id: 'deletes', label: 'Suppressions', status: 'implemented', route: '/admin/activity-logs' },
      { id: 'payments', label: 'Paiements', status: 'implemented', route: '/admin/sales' },
    ],
  },
  {
    id: 'api',
    order: 8,
    title: 'Protection des API',
    icon: '🔌',
    summary: 'JWT, rate limiting (~100 req/min/user), passerelle API.',
    status: 'partial',
    route: '/admin/security-framework',
    items: [
      { id: 'api-jwt', label: 'Authentification JWT sur /api', status: 'implemented', route: '/admin/intelligent-security' },
      { id: 'rate-limit', label: 'Rate limiting (100 req/min/user)', status: 'partial', route: '/admin/security', note: 'Middleware Express — configurable' },
      { id: 'gateway', label: 'API Gateway / reverse proxy', status: 'partial', route: '/devops', note: 'Nginx / Render / Docker' },
    ],
  },
  {
    id: 'cloud-docker',
    order: 9,
    title: 'Sécurité Cloud & Docker',
    icon: '☁️',
    summary: 'Conteneurs, secrets, variables d\'environnement, sauvegardes DB.',
    status: 'implemented',
    route: '/devops',
    items: [
      { id: 'docker', label: 'Application conteneurisée', status: 'implemented', route: '/devops' },
      { id: 'secrets', label: 'Secrets Docker / env chiffrés', status: 'partial', route: '/cloud' },
      { id: 'env', label: 'Variables d\'environnement', status: 'implemented', route: '/admin/system' },
      { id: 'db-backup', label: 'Sauvegarde automatique base', status: 'implemented', route: '/admin/backups' },
    ],
  },
  {
    id: 'realtime',
    order: 10,
    title: 'Surveillance temps réel',
    icon: '📡',
    summary: 'Dashboard admin — utilisateurs connectés, tentatives piratage, alertes, serveurs.',
    status: 'implemented',
    route: '/admin/live-audience',
    items: [
      { id: 'online', label: 'Utilisateurs connectés', status: 'implemented', route: '/admin/live-audience' },
      { id: 'intrusions', label: 'Tentatives de piratage (IDS)', status: 'implemented', route: '/admin/security' },
      { id: 'alerts', label: 'Alertes sécurité', status: 'implemented', route: '/admin/intelligent-security' },
      { id: 'servers', label: 'État serveurs & SQL', status: 'implemented', route: '/admin/performance' },
    ],
  },
  {
    id: 'blockchain',
    order: 11,
    title: 'Traçabilité Blockchain',
    icon: '🔗',
    summary: 'Origine, fabricant, production, expiration — authenticité produits premium.',
    status: 'implemented',
    route: '/client-traceability',
    items: [
      { id: 'origin', label: 'Origine & fabricant', status: 'implemented', route: '/client-traceability' },
      { id: 'dates', label: 'Dates production / expiration', status: 'implemented', route: '/vendor/traceability' },
      { id: 'verify', label: 'Vérification authenticité (hash SHA-256)', status: 'implemented', route: '/client-traceability' },
    ],
  },
  {
    id: 'ai-reco-privacy',
    order: 12,
    title: 'Recommandation IA sécurisée',
    icon: '✨',
    summary: 'Race, âge, poids, produits véto — confidentialité RGPD respectée.',
    status: 'implemented',
    route: '/client-recommendations',
    items: [
      { id: 'breed', label: 'Recommandations par race', status: 'implemented', route: '/client-recommendations' },
      { id: 'age-weight', label: 'Par âge et poids', status: 'implemented', route: '/pet-calories' },
      { id: 'vet-products', label: 'Produits vétérinaires adaptés', status: 'implemented', route: '/client-pet-health-recommendations' },
      { id: 'privacy', label: 'Confidentialité & consentement', status: 'implemented', route: '/privacy-policy', note: 'Cookies, analytics, Explainable AI' },
    ],
  },
];

export const countSecurityPillarStats = () => {
  let total = 0;
  let implemented = 0;
  let partial = 0;
  PLATFORM_SECURITY_PILLARS.forEach((pillar) => {
    pillar.items.forEach((item) => {
      total += 1;
      if (item.status === 'implemented') implemented += 1;
      if (item.status === 'partial') partial += 1;
    });
  });
  return { pillars: PLATFORM_SECURITY_PILLARS.length, total, implemented, partial };
};

export const RBAC_ROLE_MATRIX = [
  { role: 'admin', label: 'Administrateur', scope: 'Plateforme complète', permissions: 'Utilisateurs, commandes, sécurité, BI, configuration' },
  { role: 'stock_manager', label: 'Gestionnaire de stock', scope: 'Logistique & inventaire', permissions: 'Stock, réappro, alertes rupture — pas d\'accès sécurité ni utilisateurs' },
  { role: 'client', label: 'Client', scope: 'Espace personnel', permissions: 'Commandes, profil, animaux, paiement, avis' },
  { role: 'livreur', label: 'Livreur', scope: 'Livraisons', permissions: 'Tournées, statuts colis, gains — pas de données admin' },
  { role: 'vendor', label: 'Vendeur', scope: 'Marketplace', permissions: 'Produits, commandes boutique, ventes' },
  { role: 'vet', label: 'Vétérinaire', scope: 'Clinique', permissions: 'RDV, dossiers, ordonnances' },
  { role: 'moderator', label: 'Modérateur', scope: 'Contenu & fraude', permissions: 'Avis, signalements, remboursements' },
];

export const AUDIT_TABLE_DEMO = [
  { action: 'CONNEXION', user: 'client@demo.tn', date: new Date(Date.now() - 3600000).toISOString(), ip: '41.224.12.8' },
  { action: 'MODIFICATION_PRODUIT', user: 'admin@petfood.tn', date: new Date(Date.now() - 7200000).toISOString(), ip: '10.0.0.4' },
  { action: 'PAIEMENT_STRIPE', user: 'client@demo.tn', date: new Date(Date.now() - 10800000).toISOString(), ip: '41.224.12.8' },
  { action: 'SUPPRESSION_AVIS', user: 'moderator@petfood.tn', date: new Date(Date.now() - 14400000).toISOString(), ip: '10.0.0.12' },
  { action: 'ECHEC_LOGIN', user: 'unknown@spam.net', date: new Date(Date.now() - 18000000).toISOString(), ip: '203.0.113.44' },
];
