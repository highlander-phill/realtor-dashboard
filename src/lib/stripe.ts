import Stripe from 'stripe';

const apiKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock';
export const stripe = new Stripe(apiKey, {
  apiVersion: '2025-02-24',
});
