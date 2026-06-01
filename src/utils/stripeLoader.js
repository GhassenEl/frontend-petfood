import { loadStripe } from '@stripe/stripe-js';

let stripePromise = null;

const STRIPE_PK = (import.meta.env.VITE_STRIPE_PK || '').trim();

/** Clé publishable Stripe valide (évite pk_test_demo qui provoque des 401). */
export const isStripeConfigured = () =>
  /^pk_(live|test)_[A-Za-z0-9]+$/.test(STRIPE_PK);

/** Charge Stripe.js une seule fois, à la demande (checkout / facture). */
export const getStripePromise = () => {
  if (!isStripeConfigured()) return null;
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PK);
  }
  return stripePromise;
};

export default getStripePromise;
