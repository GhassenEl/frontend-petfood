const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const pid = (p) => String(p?.id || p?._id || '');

const COMPLEMENT_RULES = [
  {
    match: (p) => /croquette|croquettes|kibble/.test(normalize(`${p.name} ${p.category}`)),
    suggest: { keywords: ['patee', 'pâtée', 'boite', 'friandise', 'snack'], categories: ['hygiene', 'accessoire'] },
    reason: 'Complément alimentaire',
  },
  {
    match: (p) => /chat|cat/.test(normalize(`${p.name} ${p.animalType} ${p.category}`)),
    suggest: { keywords: ['litiere', 'litière', 'jouet'], categories: ['hygiene'] },
    reason: 'Accessoire chat',
  },
  {
    match: (p) => /chien|dog/.test(normalize(`${p.name} ${p.animalType}`)),
    suggest: { keywords: ['laisse', 'manteau', 'jouet', 'shampoing'], categories: ['accessoire', 'vetements'] },
    reason: 'Accessoire chien',
  },
  {
    match: (p) => /jouet|toy/.test(normalize(`${p.name} ${p.category}`)),
    suggest: { keywords: ['friandise', 'snack', 'croquette'] },
    reason: 'Récompense & nutrition',
  },
  {
    match: () => true,
    suggest: { keywords: ['croquette', 'shampoing'], categories: ['nourriture', 'hygiene'] },
    reason: 'Souvent acheté ensemble',
  },
];

/** Produits complémentaires selon historique d'achats */
export const suggestComplementaryProducts = ({
  purchased = [],
  catalog = [],
  limit = 6,
} = {}) => {
  const boughtIds = new Set(purchased.map(pid));
  const scored = new Map();

  purchased.forEach((product) => {
    const rule = COMPLEMENT_RULES.find((r) => r.match(product)) || COMPLEMENT_RULES[COMPLEMENT_RULES.length - 1];
    catalog.forEach((candidate) => {
      const cid = pid(candidate);
      if (!cid || boughtIds.has(cid)) return;

      const hay = normalize(`${candidate.name} ${candidate.category} ${candidate.description || ''}`);
      let score = 0;
      if (candidate.animalType && product.animalType && candidate.animalType === product.animalType) score += 2;
      (rule.suggest.keywords || []).forEach((kw) => {
        if (hay.includes(normalize(kw))) score += 3;
      });
      (rule.suggest.categories || []).forEach((cat) => {
        if (hay.includes(normalize(cat))) score += 2;
      });
      if (Number(candidate.rating_avg) >= 4) score += 1;
      if (Number(candidate.discount) > 0) score += 0.5;

      if (score > 0) {
        const prev = scored.get(cid) || { product: candidate, score: 0, reasons: new Set() };
        prev.score += score;
        prev.reasons.add(rule.reason);
        scored.set(cid, prev);
      }
    });
  });

  return [...scored.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ product, score, reasons }) => ({
      ...product,
      complementScore: Math.round(score * 10) / 10,
      complementReason: [...reasons][0] || 'Complément suggéré',
    }));
};

export default suggestComplementaryProducts;
