
import { CheckoutRequestPayload } from './types';

/**
 * Builds the request payload for creating a checkout session
 * @param priceId The Stripe price ID
 * @returns The request payload object
 */
export const buildCheckoutPayload = (priceId: string): CheckoutRequestPayload => {
  const origin = window.location.origin;
  
  return {
    priceId,
    isTestMode: true, // Always use test mode for now
    successUrl: `${origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${origin}/checkout?cancelled=true`
  };
};
