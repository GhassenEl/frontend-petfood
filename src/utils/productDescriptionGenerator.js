import { getProductDetailFields } from './productDetails';

const animalLabel = (t) =>
  ({ dog: 'chien', cat: 'chat', bird: 'oiseau', rabbit: 'lapin' }[t] || 'animal');

/** Génération automatique de fiches produits optimisées SEO */
export const generateProductDescription = (product = {}) => {
  const fields = getProductDetailFields(product);
  const type = product.animalType || product.petType || 'dog';
  const name = product.name || 'Produit PetfoodTN';
  const category = product.category || 'nourriture';
  const rating = Number(product.rating_avg);
  const benefits = fields.benefits || '';
  const composition = fields.composition || product.composition || '';

  const title = `${name} — ${animalLabel(type)} | PetfoodTN`;
  const intro = `${name} est une formule ${category} premium conçue pour ${animalLabel(type)} exigeants.`;

  const nutritionBlock = composition
    ? `Composition : ${composition.slice(0, 200)}${composition.length > 200 ? '…' : ''}.`
    : 'Formule équilibrée avec protéines de qualité et apports vitaminiques essentiels.';

  const benefitBlock = benefits
    ? `Bénéfices : ${benefits}.`
    : 'Soutient vitalité, digestion et pelage brillant au quotidien.';

  const socialProof =
    rating >= 4.5
      ? `Apprécié par nos clients (${rating}/5).`
      : rating >= 4
        ? `Bien noté par la communauté PetfoodTN (${rating}/5).`
        : '';

  const seoKeywords = [
    animalLabel(type),
    category,
    'PetfoodTN',
    'Tunisie',
    product.tags?.includes('hypoallergenique') ? 'hypoallergénique' : null,
    /senior/i.test(name) ? 'senior' : null,
    /light|sterilis/i.test(name) ? 'contrôle du poids' : null,
  ]
    .filter(Boolean)
    .join(', ');

  const shortDescription = `${intro} ${nutritionBlock}`.slice(0, 280);
  const longDescription = [intro, nutritionBlock, benefitBlock, socialProof, `Livraison rapide partout en Tunisie.`]
    .filter(Boolean)
    .join('\n\n');

  return {
    productId: product.id || product._id,
    title,
    shortDescription,
    longDescription,
    seoKeywords,
    metaDescription: shortDescription.slice(0, 155),
    bulletPoints: [
      `Formule ${category} pour ${animalLabel(type)}`,
      composition ? 'Composition détaillée disponible' : 'Qualité premium',
      benefits ? benefits.split(/[.;]/)[0] : 'Digestibilité optimale',
      'Certifié PetfoodTN',
    ].filter(Boolean),
  };
};

export const generateBatchDescriptions = (products = []) =>
  (products || []).slice(0, 20).map(generateProductDescription);

export default generateProductDescription;
