const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

/** Analyse qualité du contenu publié (produits, posts, descriptions). */
export const analyzeContentQuality = (item = {}) => {
  const flags = [];
  let score = 100;

  const name = String(item.name || item.title || '').trim();
  const description = String(item.description || item.content || item.text || '').trim();
  const price = Number(item.price);
  const stock = item.stock;
  const hasImage = Boolean(item.imageUrl || item.image || item.photo);

  if (!name || name.length < 4) {
    flags.push({ type: 'title', issue: 'Titre trop court ou absent', severity: 'high' });
    score -= 25;
  }

  if (description.length < 30) {
    flags.push({ type: 'description', issue: 'Description insuffisante (< 30 car.)', severity: 'high' });
    score -= 20;
  } else if (description.length < 80) {
    flags.push({ type: 'description', issue: 'Description courte — enrichir pour le SEO', severity: 'medium' });
    score -= 10;
  }

  if (!hasImage) {
    flags.push({ type: 'media', issue: 'Aucune image associée', severity: 'high' });
    score -= 20;
  }

  if (price > 0 && price < 3) {
    flags.push({ type: 'price', issue: 'Prix suspectement bas — vérifier cohérence', severity: 'medium' });
    score -= 15;
  }

  if (price > 500) {
    flags.push({ type: 'price', issue: 'Prix très élevé — contrôle recommandé', severity: 'low' });
    score -= 5;
  }

  if (stock === 0) {
    flags.push({ type: 'stock', issue: 'Produit en rupture de stock', severity: 'low' });
    score -= 5;
  }

  const norm = normalize(description);
  if (/guerison|guérison|guerit|guérit|medicament|médicament|curer/.test(norm)) {
    flags.push({ type: 'compliance', issue: 'Allégations médicales non autorisées', severity: 'high' });
    score -= 30;
  }

  if (/promo.*-?\d{2,}%|gratuit|gagnez/i.test(norm)) {
    flags.push({ type: 'marketing', issue: 'Promesse marketing agressive dans la description', severity: 'medium' });
    score -= 10;
  }

  if (description.split(/\s+/).length >= 5) {
    const words = description.split(/\s+/);
    const unique = new Set(words.map((w) => normalize(w)));
    if (unique.size / words.length < 0.4) {
      flags.push({ type: 'spam', issue: 'Répétition excessive de mots', severity: 'medium' });
      score -= 15;
    }
  }

  score = Math.max(0, Math.min(100, score));

  let grade = 'A';
  if (score < 50) grade = 'D';
  else if (score < 65) grade = 'C';
  else if (score < 80) grade = 'B';

  return {
    id: item.id || item._id,
    name: name || 'Sans titre',
    score,
    grade,
    flags,
    needsReview: score < 65 || flags.some((f) => f.severity === 'high'),
    summary:
      score >= 80
        ? 'Contenu de bonne qualité.'
        : score >= 65
          ? 'Qualité acceptable — améliorations possibles.'
          : 'Qualité insuffisante — révision requise.',
  };
};

export const analyzeContentQualityBatch = (items = []) =>
  (items || [])
    .map((item) => ({
      item,
      quality: analyzeContentQuality(item),
    }))
    .sort((a, b) => a.quality.score - b.quality.score);

export default analyzeContentQuality;
