import { getProductDetailFields } from './productDetails';

const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const extractNutritionFromProduct = (product) => {
  const fromFields = product?.nutrition;
  if (fromFields) {
    const pct = (v) => {
      if (v == null) return null;
      const n = parseFloat(String(v).replace('%', ''));
      return Number.isNaN(n) ? null : n;
    };
    return {
      proteinPercent: pct(fromFields.proteinPercent ?? fromFields.protein) ?? '—',
      fatPercent: pct(fromFields.fatPercent ?? fromFields.fat) ?? '—',
      fiberPercent: pct(fromFields.fiberPercent ?? fromFields.fiber) ?? '—',
      kcalPer100g: fromFields.kcalPer100g ?? fromFields.kcal ?? '—',
    };
  }

  const comp = normalize(getProductDetailFields(product).composition);
  const pct = (label) => {
    const m = comp.match(new RegExp(`${label}[^\\d]*(\\d+(?:[.,]\\d+)?)\\s*%`));
    return m ? parseFloat(m[1].replace(',', '.')) : null;
  };

  const protein = pct('proteine') ?? pct('poulet') ?? (comp.includes('premium') ? 28 : 22);
  const fat = pct('graisse') ?? pct('lipide') ?? 14;
  const fiber = pct('fibre') ?? 3;
  const kcal = product?.kcalPer100g ?? (comp.includes('light') ? 320 : 360);

  return { proteinPercent: protein, fatPercent: fat, fiberPercent: fiber, kcalPer100g: kcal };
};

export default extractNutritionFromProduct;
