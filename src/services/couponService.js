import api from '../utils/api';
import { DEMO_ADMIN_COUPONS } from '../utils/adminDemoData';
import { allowDemoFallback, resolveApiCall } from '../utils/liveDataResolver';

const findDemoCoupon = (code) => DEMO_ADMIN_COUPONS.find(
  (c) => c.code === code && c.active,
);

/**
 * Valide un code promo — API live en priorité, démo si backend indisponible.
 * @returns {{ valid: boolean, discount: number, message: string, demo?: boolean }}
 */
export async function validateCouponCode(code, subtotal) {
  const normalized = String(code || '').trim().toUpperCase();
  if (!normalized) {
    return { valid: false, discount: 0, message: '' };
  }

  try {
    const { data, demo } = await resolveApiCall(
      () => api.post('/coupons/validate', { code: normalized, subtotal }),
      () => {
        const coupon = findDemoCoupon(normalized);
        if (!coupon) return { valid: false };
        if (subtotal < coupon.minOrder) {
          return { valid: false, message: `Commande minimum ${coupon.minOrder} DT pour ce code.` };
        }
        const discount = coupon.type === 'percent'
          ? Number((subtotal * coupon.value / 100).toFixed(2))
          : Math.min(coupon.value, subtotal);
        return { valid: true, discount, message: `Code ${normalized} appliqué — −${discount.toFixed(2)} DT` };
      },
    );

    if (data?.valid) {
      return {
        valid: true,
        discount: Number(data.discount ?? 0),
        message: data.message || `Code ${normalized} appliqué`,
        demo,
      };
    }
    return {
      valid: false,
      discount: 0,
      message: data?.message || 'Code invalide ou expiré.',
      demo,
    };
  } catch {
    if (!allowDemoFallback()) {
      return { valid: false, discount: 0, message: 'Impossible de valider le code promo.' };
    }
    const coupon = findDemoCoupon(normalized);
    if (!coupon) {
      return { valid: false, discount: 0, message: 'Code invalide ou expiré.', demo: true };
    }
    if (subtotal < coupon.minOrder) {
      return { valid: false, discount: 0, message: `Commande minimum ${coupon.minOrder} DT pour ce code.`, demo: true };
    }
    const discount = coupon.type === 'percent'
      ? Number((subtotal * coupon.value / 100).toFixed(2))
      : Math.min(coupon.value, subtotal);
    return {
      valid: true,
      discount,
      message: `Code ${normalized} appliqué — −${discount.toFixed(2)} DT`,
      demo: true,
    };
  }
}
