const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const COMPLAINT_CATEGORIES = {
  delivery: { id: 'delivery', label: 'Livraison', icon: '🚚' },
  payment: { id: 'payment', label: 'Paiement', icon: '💳' },
  product: { id: 'product', label: 'Produit', icon: '📦' },
  veterinary: { id: 'veterinary', label: 'Service vétérinaire', icon: '🩺' },
  other: { id: 'other', label: 'Autre', icon: '📋' },
};

const RULES = [
  {
    category: 'delivery',
    keywords: ['livraison', 'livreur', 'retard', 'colis', 'expedition', 'reception', 'endommage', 'perdu', 'tracking'],
    weight: 1,
  },
  {
    category: 'payment',
    keywords: ['paiement', 'facture', 'remboursement', 'debit', 'carte', 'wallet', 'portefeuille', 'double', 'montant'],
    weight: 1,
  },
  {
    category: 'product',
    keywords: ['produit', 'qualite', 'defectueux', 'casse', 'conforme', 'description', 'stock', 'allergie', 'croquette'],
    weight: 1,
  },
  {
    category: 'veterinary',
    keywords: ['veterinaire', 'consultation', 'rdv', 'rendez-vous', 'vaccin', 'soin', 'clinique', 'teleconsult', 'ordonnance'],
    weight: 1,
  },
];

/** Catégorise une réclamation par analyse de mots-clés. */
export const classifyComplaint = (complaint = {}) => {
  const text = normalize(`${complaint.subject || ''} ${complaint.message || complaint.content || ''}`);
  const scores = { delivery: 0, payment: 0, product: 0, veterinary: 0 };

  RULES.forEach(({ category, keywords, weight }) => {
    keywords.forEach((kw) => {
      if (text.includes(kw)) scores[category] += weight;
    });
  });

  const existing = complaint.category && COMPLAINT_CATEGORIES[complaint.category];
  if (existing && scores[complaint.category] === 0) {
    scores[complaint.category] = 2;
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [topCat, topScore] = sorted[0];
  const category = topScore > 0 ? topCat : 'other';
  const confidence = topScore >= 3 ? 'high' : topScore >= 2 ? 'medium' : topScore >= 1 ? 'low' : 'guess';

  const matchedKeywords = RULES.find((r) => r.category === category)?.keywords.filter((kw) => text.includes(kw)) || [];

  return {
    category,
    categoryLabel: COMPLAINT_CATEGORIES[category]?.label || 'Autre',
    categoryIcon: COMPLAINT_CATEGORIES[category]?.icon || '📋',
    confidence,
    scores,
    matchedKeywords: matchedKeywords.slice(0, 4),
    suggestedRoute:
      category === 'delivery'
        ? '/moderator/refunds'
        : category === 'veterinary'
          ? '/moderator/complaints'
          : '/moderator/complaints',
    aiSummary:
      confidence === 'high'
        ? `Réclamation classée « ${COMPLAINT_CATEGORIES[category]?.label} » avec forte confiance.`
        : confidence === 'medium'
          ? `Probablement liée à « ${COMPLAINT_CATEGORIES[category]?.label} » — vérification recommandée.`
          : 'Catégorie incertaine — traitement manuel conseillé.',
  };
};

export const classifyComplaintsBatch = (complaints = []) =>
  (complaints || []).map((c) => ({
    complaint: c,
    classification: classifyComplaint(c),
  }));

export default classifyComplaint;
