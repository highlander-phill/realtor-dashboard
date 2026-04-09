import Stripe from 'stripe';

const apiKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock';
export const stripe = new Stripe(apiKey, {
  apiVersion: '2025-02-24',
  httpClient: Stripe.createFetchHttpClient(),
});

export async function updateSubscriptionQuantity(subscriptionId: string, agentCount: number, apiKey?: string) {
  const stripeInstance = apiKey ? new Stripe(apiKey, {
    apiVersion: '2025-02-24',
    httpClient: Stripe.createFetchHttpClient(),
  }) : stripe;

  const quantity = Math.max(1, Math.ceil(agentCount / 10));
  
  try {
    const subscription = await stripeInstance.subscriptions.retrieve(subscriptionId);
    const itemId = subscription.items.data[0].id;
    
    await stripeInstance.subscriptions.update(subscriptionId, {
      items: [{
        id: itemId,
        quantity: quantity,
      }],
      proration_behavior: 'always_invoice', // Or 'create_prorations'
    });
    return { success: true, quantity };
  } catch (error) {
    console.error('Stripe quantity update error:', error);
    return { success: false, error };
  }
}
