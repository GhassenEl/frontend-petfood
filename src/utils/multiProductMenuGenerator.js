const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

/** Menus hebdomadaires combinant plusieurs produits compatibles. */
export const generateMultiProductWeeklyMenus = ({
  pet,
  recommendation,
  scoredProducts = [],
  startDate = new Date(),
} = {}) => {
  const rec = recommendation || {};
  const gramsPerDay = rec.adaptedGramsPerDay ?? rec.calories?.dryFoodGramsPerDay ?? 0;
  const kcalPerDay = rec.adaptedKcal ?? rec.calories?.dailyKcal ?? 0;
  const petName = pet?.name || rec.name || 'Animal';

  const products = (scoredProducts || [])
    .filter((p) => p.product || p.productName)
    .slice(0, 4)
    .map((p) => ({
      id: p.productId || p.product?.id || p.id,
      name: p.productName || p.product?.name || p.name,
      score: p.overall ?? p.compatibilityScore ?? p.score ?? 70,
    }));

  if (!gramsPerDay || !products.length) {
    return {
      petName,
      products: [],
      days: [],
      summary: 'Données insuffisantes — complétez le profil ou ajoutez des produits compatibles.',
    };
  }

  const start = new Date(startDate);
  const mondayOffset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - mondayOffset);

  const days = DAY_NAMES.map((dayName, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const primary = products[i % products.length];
    const secondary = products[(i + 1) % products.length];
    const splitPrimary = i % 3 === 2 ? 0.7 : 0.85;
    const primaryGrams = Math.round(gramsPerDay * splitPrimary);
    const secondaryGrams = gramsPerDay - primaryGrams;

    const meals = [
      {
        label: 'Matin',
        items: [{ product: primary.name, grams: Math.round(primaryGrams * 0.55) }],
      },
      {
        label: 'Soir',
        items: [
          { product: primary.name, grams: Math.round(primaryGrams * 0.45) },
          ...(secondaryGrams > 0
            ? [{ product: secondary.name, grams: secondaryGrams, note: 'Complément / variation' }]
            : []),
        ],
      },
    ];

    return {
      dayName,
      date: date.toISOString().slice(0, 10),
      totalGrams: gramsPerDay,
      totalKcal: kcalPerDay,
      meals,
      rotationNote: i === 6 ? 'Dimanche : jour de rotation produit pour variété digestive.' : null,
    };
  });

  return {
    petName,
    weekStart: start.toISOString().slice(0, 10),
    products,
    avgKcalPerDay: kcalPerDay,
    avgGramsPerDay: gramsPerDay,
    days,
    summary: `Menu 7 jours pour ${petName} avec ${products.length} produit(s) compatibles (~${gramsPerDay} g/j).`,
  };
};

export default generateMultiProductWeeklyMenus;
