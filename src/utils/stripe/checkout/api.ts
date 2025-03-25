
import { supabase } from '../../../integrations/supabase/client';
import { CheckoutError, CheckoutSessionResponse } from './types';

/**
 * Builds the request payload for creating a checkout session
 * @param priceId The Stripe price ID
 * @returns The request payload object
 */
export const buildCheckoutPayload = (priceId: string) => {
  const origin = window.location.origin;
  
  return {
    priceId,
    isTestMode: true, // Always use test mode for now
    successUrl: `${origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${origin}/checkout?cancelled=true`
  };
};

/**
 * Invoke an Edge Function and handle standard error responses
 * @param functionName Name of the Edge Function to invoke
 * @param payload Request payload
 * @returns The response data
 */
export const invokeEdgeFunction = async <T>(functionName: string, payload: any): Promise<T> => {
  console.log(`[${new Date().toISOString()}] Invoking ${functionName} function with payload:`, payload);
  
  try {
    console.log(`Calling supabase.functions.invoke('${functionName}')`);
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload
    });
    
    console.log(`[${new Date().toISOString()}] ${functionName} response:`, { data, error });
    
    if (error) {
      console.error(`${functionName} function error:`, error);
      throw new CheckoutError(
        `Error invoking ${functionName}: ${error.message}`, 
        'edge_function_error'
      );
    }
    
    if (!data) {
      console.error(`No data returned from ${functionName}`);
      throw new CheckoutError(
        `No data returned from ${functionName}`, 
        'no_data_returned'
      );
    }
    
    if (data.error) {
      console.error(`${functionName} returned error:`, data.error);
      throw new CheckoutError(
        data.error, 
        data.code || 'edge_function_error'
      );
    }
    
    return data as T;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in invokeEdgeFunction:`, error);
    
    if (error instanceof CheckoutError) {
      throw error;
    }
    
    throw new CheckoutError(
      error.message || `Unexpected error in ${functionName}`, 
      'unexpected_error'
    );
  }
};

/**
 * Creates a checkout session with Stripe through our Edge Function
 * @param priceId The Stripe price ID to checkout with
 * @returns The checkout session data with URL
 */
export const createCheckoutSession = async (priceId: string): Promise<CheckoutSessionResponse> => {
  console.log('[CHECKOUT] Creating checkout session for price:', priceId);
  
  if (!priceId) {
    throw new CheckoutError('Price ID is required', 'invalid_price_id');
  }
  
  const payload = buildCheckoutPayload(priceId);
  
  try {
    const data = await invokeEdgeFunction<CheckoutSessionResponse>('create-checkout', payload);
    
    if (!data.url) {
      console.error('[CHECKOUT] No checkout URL returned from create-checkout function');
      throw new CheckoutError('No checkout URL returned', 'no_checkout_url');
    }
    
    console.log('[CHECKOUT] Checkout session created successfully with URL:', data.url);
    return data;
  } catch (error) {
    console.error('[CHECKOUT] Error creating checkout session:', error);
    
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
