const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

/** Parse une requête en langage naturel (FR) */
export const parseNaturalLanguageQuery = (query = '') => {
  const q = normalize(query);
  const intent = {
    raw: query,
    animalType: null,
    lifeStage: null,
    allergies: false,
    goal: null,
    category: null,
    keywords: [],
    explanation: [],
  };

  if (/chien|dog|chiot|canin/.test(q)) {
    intent.animalType = 'dog';
    intent.explanation.push('Espèce : chien');
  }
  if (/chat|cat|chaton|felin|félin/.test(q)) {
    intent.animalType = 'cat';
    intent.explanation.push('Espèce : chat');
  }
  if (/oiseau|perruche|bird/.test(q)) intent.animalType = 'bird';
  if (/lapin|rabbit/.test(q)) intent.animalType = 'rabbit';

  if (/senior|vieux|age|âgé|7\+|7 ans/.test(q)) {
    intent.lifeStage = 'senior';
    intent.explanation.push('Stade : senior');
  }
  if (/chiot|chaton|junior|jeune|puppy|kitten/.test(q)) {
    intent.lifeStage = 'young';
    intent.explanation.push('Stade : jeune');
  }

  if (/allerg|hypoallerg|intoler|sans\s+(poulet|boeuf|gluten|cereales|céréales)/.test(q)) {
    intent.allergies = true;
    intent.explanation.push('Sensibilité / allergies');
  }

  if (/sterilis|stérilis|castr|neutre/.test(q)) {
    intent.keywords.push('sterilise', 'light', 'stérilisé');
    intent.explanation.push('Chat/chien stérilisé');
  }

  if (/sans\s+cereales|sans\s+céréales|grain\s+free|sans\s+gluten/.test(q)) {
    intent.keywords.push('sans cereales', 'hypoallergenique', 'mono-proteine');
    intent.explanation.push('Sans céréales');
  }

  if (/light|maigrir|perte|regime|régime|surpoids/.test(q)) {
    intent.goal = 'perte';
    intent.explanation.push('Objectif : contrôle du poids');
  }

  if (/croquette|kibble/.test(q)) {
    intent.category = 'croquettes';
    intent.explanation.push('Type : croquettes');
  } else if (/patee|pâtée|boite|boîte|humide/.test(q)) {
    intent.category = 'patee';
    intent.explanation.push('Type : pâtée');
  } else if (/friandise|snack/.test(q)) {
    intent.category = 'friandises';
  } else if (/litiere|litière/.test(q)) {
    intent.category = 'accessoires';
  }

  const allergenMatch = q.match(/sans\s+(\w+)/g);
  if (allergenMatch) {
    intent.keywords.push(...allergenMatch.map((m) => normalize(m.replace('sans ', ''))));
  }

  q.split(/\s+/).filter((w) => w.length > 3).forEach((w) => {
    if (!['cherche', 'pour', 'avec', 'sans', 'souffrant', 'allergies'].includes(w)) {
      intent.keywords.push(w);
    }
  });

  return intent;
};

const scoreProductForIntent = (product, intent) => {
  const hay = normalize(
    `${product.name} ${product.description || ''} ${product.category || ''} ${product.composition || ''} ${(product.tags || []).join(' ')}`,
  );
  let score = 0;
  const matches = [];

  if (intent.animalType) {
    if (product.animalType === intent.animalType || product.petType === intent.animalType) {
      score += 25;
      matches.push('Espèce');
    } else if (hay.includes(intent.animalType === 'dog' ? 'chien' : intent.animalType === 'cat' ? 'chat' : intent.animalType)) {
      score += 15;
      matches.push('Espèce (texte)');
    }
  }

  if (intent.lifeStage === 'senior' && (hay.includes('senior') || hay.includes('7+'))) {
    score += 20;
    matches.push('Senior');
  }
  if (intent.lifeStage === 'young' && (hay.includes('chiot') || hay.includes('chaton') || hay.includes('junior'))) {
    score += 20;
    matches.push('Junior');
  }

  if (intent.allergies && (hay.includes('hypoallerg') || hay.includes('mono-proteine') || hay.includes('sensible'))) {
    score += 22;
    matches.push('Hypoallergénique');
  }

  if (intent.goal === 'perte' && hay.includes('light')) {
    score += 15;
    matches.push('Light');
  }

  if (intent.category === 'croquettes' && (hay.includes('croquette') || hay.includes('kibble'))) {
    score += 18;
    matches.push('Croquettes');
  }
  if (intent.category === 'patee' && (hay.includes('patee') || hay.includes('pate') || hay.includes('boite'))) {
    score += 18;
    matches.push('Pâtée');
  }

  intent.keywords.forEach((kw) => {
    if (kw && hay.includes(kw)) {
      score += 5;
      matches.push(kw);
    }
  });

  if (Number(product.rating_avg) >= 4) score += 5;
  if (Number(product.stock ?? 0) > 0) score += 3;

  return { score, matches: [...new Set(matches)] };
};

/** Recherche intelligente en langage naturel */
export const searchProductsNaturalLanguage = (products = [], query = '', limit = 12) => {
  const intent = parseNaturalLanguageQuery(query);
  if (!String(query).trim()) {
    return { intent, results: [], summary: 'Saisissez une recherche en langage naturel.' };
  }

  const scored = (products || [])
    .map((p) => {
      const { score, matches } = scoreProductForIntent(p, intent);
      return { product: p, score, matches };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const summary =
    scored.length > 0
      ? `${scored.length} produit(s) — interprétation : ${intent.explanation.join(' · ') || 'analyse sémantique locale'}.`
      : `Aucun résultat exact. Essayez : « croquettes chien senior hypoallergéniques ».`;

  return { intent, results: scored, summary };
};

export default searchProductsNaturalLanguage;
