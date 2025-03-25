
import { CheckoutSessionResponse, CheckoutError } from './types';
import { buildCheckoutPayload } from './payload';
import { invokeEdgeFunction } from './edge-function';
import { logCheckoutEvent, logCheckoutError } from './logger';

/**
 * Creates a checkout session with Stripe through our Edge Function
 * @param priceId The Stripe price ID to checkout with
 * @returns The checkout session data with URL
 */
export const createCheckoutSession = async (priceId: string): Promise<CheckoutSessionResponse> => {
  logCheckoutEvent('Creating checkout session for price:', priceId);
  
  if (!priceId) {
    throw new CheckoutError('Price ID is required', 'invalid_price_id');
  }
  
  const payload = buildCheckoutPayload(priceId);
  
  try {
    const data = await invokeEdgeFunction<CheckoutSessionResponse>('create-checkout', payload);
    
    if (!data.url) {
      logCheckoutError('No checkout URL returned from create-checkout function', null);
      throw new CheckoutError('No checkout URL returned', 'no_checkout_url');
    }
    
    logCheckoutEvent('Checkout session created successfully with URL:', data.url);
    return data;
  } catch (error) {
    logCheckoutError('Error creating checkout session:', error);
    
    // Rethrow CheckoutError instances, wrap other errors
    if (error instanceof CheckoutError) {
      throw error;
    }
    
    throw new CheckoutError(
      `Failed to create checkout session: ${error.message}`,
      'checkout_creation_failed'
    );
  }
};
