const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const INAPPROPRIATE_WORDS = [
  'connard', 'idiot', 'merde', 'putain', 'nul', 'naze', 'haine', 'suicide',
  'raciste', 'terror', 'porn', 'sexe', 'insulte',
];

const SPAM_PATTERNS = [
  /https?:\/\//i,
  /www\./i,
  /(.)\1{7,}/,
  /gagn[eé]z.*gratuit/i,
  /cliquez\s+ici/i,
  /whatsapp\s*:/i,
];

const AD_PATTERNS = [
  /promo.*-?\d{2,}%/i,
  /achetez\s+maintenant/i,
  /visitez\s+notre\s+(site|page|boutique)/i,
  /contactez.*telegram/i,
  /offre\s+limit[eé]e/i,
  /prix\s+cass[eé]/i,
];

const GENERIC_FAKE_REVIEWS = [
  'excellent produit je recommande',
  'super produit 5 etoiles',
  'top qualite prix bas',
  'meilleur produit du monde',
  'produit genial je conseille',
];

const AI_GENERATED_PATTERNS = [
  /en tant que (?:proprietaire|propriétaire)/i,
  /je recommande vivement ce produit/i,
  /dans l'ensemble/i,
  /il est important de noter/i,
  /je suis ravi(?:e)? de/i,
  /produit de qualite exceptionnelle/i,
  /sans hesitation/i,
  /repond parfaitement a mes attentes/i,
  /je n'hesite pas a recommander/i,
  /offre un excellent rapport qualite prix/i,
  /tres satisfait(?:e)? de mon achat/i,
  /conforme a la description/i,
  /experience globalement positive/i,
];

const AI_UNIFORM_PHRASES = [
  'produit correspondant parfaitement',
  'je suis très satisfait',
  'qualité exceptionnelle',
  'recommande sans hésitation',
  'exceeds my expectations',
  'highly recommend this product',
];

const POSITIVE_WORDS = ['excellent', 'super', 'parfait', 'adore', 'genial', 'merveilleux', 'top'];
const NEGATIVE_WORDS = ['mauvais', 'nul', 'horrible', 'decevant', 'frustr', 'deçu', 'catastrophe'];

const pushFlag = (flags, type, reason, weight = 1) => {
  flags.push({ type, reason, weight });
};

const severityFromScore = (score) => {
  if (score >= 5) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
};

/** Détecte avis suspects (faux avis, incohérences, spam). */
export const detectReviewAnomalies = (review = {}) => {
  const flags = [];
  const comment = String(review.comment || review.content || '').trim();
  const text = normalize(comment);
  const rating = Number(review.rating || 0);

  if (!comment) {
    pushFlag(flags, 'empty', 'Commentaire vide', 2);
  }

  if (comment.length > 0 && comment.length < 15 && rating >= 4) {
    pushFlag(flags, 'fake', 'Avis très court avec note élevée (possible faux avis)', 2);
  }

  GENERIC_FAKE_REVIEWS.forEach((phrase) => {
    if (text.includes(normalize(phrase))) {
      pushFlag(flags, 'fake', 'Formulation générique typique de faux avis', 3);
    }
  });

  const pos = POSITIVE_WORDS.filter((w) => text.includes(w)).length;
  const neg = NEGATIVE_WORDS.filter((w) => text.includes(w)).length;
  if (rating >= 4 && neg > pos) {
    pushFlag(flags, 'incoherent', 'Note élevée mais vocabulaire négatif', 3);
  }
  if (rating <= 2 && pos > neg + 1) {
    pushFlag(flags, 'incoherent', 'Note basse mais vocabulaire très positif', 3);
  }

  SPAM_PATTERNS.forEach((re) => {
    if (re.test(comment)) pushFlag(flags, 'spam', 'Motif spam ou lien externe détecté', 3);
  });

  AD_PATTERNS.forEach((re) => {
    if (re.test(comment)) pushFlag(flags, 'advertising', 'Publicité abusive ou promotion externe', 3);
  });

  INAPPROPRIATE_WORDS.forEach((w) => {
    if (text.includes(w)) pushFlag(flags, 'inappropriate', `Langage inapproprié (« ${w} »)`, 4);
  });

  if (/[A-Z]{8,}/.test(comment.replace(new RegExp('\\s+', 'g'), ''))) {
    pushFlag(flags, 'spam', 'Majuscules excessives', 1);
  }

  AI_GENERATED_PATTERNS.forEach((re) => {
    if (re.test(comment)) {
      pushFlag(flags, 'ai_generated', 'Formulation typique d\'avis généré par IA', 4);
    }
  });

  AI_UNIFORM_PHRASES.forEach((phrase) => {
    if (text.includes(normalize(phrase))) {
      pushFlag(flags, 'ai_generated', 'Phrase générique type ChatGPT / IA', 3);
    }
  });

  const words = comment.split(/\s+/).filter(Boolean);
  if (words.length >= 20 && words.length <= 45) {
    const avgWordLen = words.reduce((s, w) => s + w.length, 0) / words.length;
    const hasSpecifics = /mon (chien|chat|lapin)|\d+\s*(kg|ans|mois)|race|berger|maine|sloughi/i.test(comment);
    if (avgWordLen > 5.5 && !hasSpecifics && rating >= 4) {
      pushFlag(flags, 'ai_generated', 'Style formel sans détail personnel (suspect IA)', 3);
    }
  }

  const score = flags.reduce((s, f) => s + f.weight, 0);
  return {
    suspicious: score >= 3,
    score,
    severity: severityFromScore(score),
    flags,
    summary: flags.length
      ? flags.slice(0, 2).map((f) => f.reason).join(' · ')
      : 'Avis conforme',
  };
};

/** Détecte contenu inapproprié (signalements, commentaires publics). */
export const detectContentAnomalies = (text = '') => {
  const flags = [];
  const raw = String(text).trim();
  const norm = normalize(raw);

  if (!raw) return { suspicious: false, score: 0, severity: 'low', flags: [], summary: 'Contenu vide' };

  INAPPROPRIATE_WORDS.forEach((w) => {
    if (norm.includes(w)) pushFlag(flags, 'inappropriate', `Terme inapproprié : ${w}`, 4);
  });

  SPAM_PATTERNS.forEach((re) => {
    if (re.test(raw)) pushFlag(flags, 'spam', 'Spam ou promotion externe', 3);
  });

  AD_PATTERNS.forEach((re) => {
    if (re.test(raw)) pushFlag(flags, 'advertising', 'Publicité abusive détectée', 3);
  });

  if (norm.length > 20 && norm.split(/\s+/).length <= 3 && /(.)\1{3,}/.test(norm.replace(/\s/g, ''))) {
    pushFlag(flags, 'spam', 'Répétition de caractères suspecte', 2);
  }

  const score = flags.reduce((s, f) => s + f.weight, 0);
  return {
    suspicious: score >= 3,
    score,
    severity: severityFromScore(score),
    flags,
    summary: flags[0]?.reason || 'Contenu conforme',
  };
};

/** Comportements frauduleux (rafales d'actions, montants atypiques). */
export const detectBehaviorAnomalies = (events = []) => {
  const flags = [];
  const list = Array.isArray(events) ? events : [events].filter(Boolean);

  list.forEach((ev) => {
    const type = ev.type || ev.action || '';
    if (type === 'review_burst' && Number(ev.count) >= 5) {
      pushFlag(flags, 'fraud', `${ev.count} avis en moins d'une heure`, 4);
    }
    if (type === 'refund_abuse' && Number(ev.count) >= 3) {
      pushFlag(flags, 'fraud', 'Multiples demandes de remboursement', 3);
    }
    if (Number(ev.amount) > 800 || Number(ev.total) > 800) {
      pushFlag(flags, 'fraud', 'Montant de commande atypique', 2);
    }
  });

  const score = flags.reduce((s, f) => s + f.weight, 0);
  return {
    suspicious: score >= 3,
    score,
    severity: severityFromScore(score),
    flags,
    summary: flags[0]?.reason || 'Comportement normal',
  };
};

export const scanReviewsBatch = (reviews = []) =>
  (reviews || []).map((r) => ({
    review: r,
    anomaly: detectReviewAnomalies(r),
  })).filter((x) => x.anomaly.suspicious);

/** Avis probablement générés par IA (ChatGPT, bots). */
export const scanAiGeneratedReviews = (reviews = []) =>
  (reviews || [])
    .map((r) => {
      const anomaly = detectReviewAnomalies(r);
      const aiFlags = (anomaly.flags || []).filter((f) => f.type === 'ai_generated');
      return {
        review: r,
        anomaly,
        aiGenerated: aiFlags.length > 0,
        aiScore: aiFlags.reduce((s, f) => s + f.weight, 0),
      };
    })
    .filter((x) => x.aiGenerated)
    .sort((a, b) => b.aiScore - a.aiScore);

export default detectReviewAnomalies;
