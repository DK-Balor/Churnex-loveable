import { supabase } from '../../integrations/supabase/client';

/**
 * Error types specific to the checkout process
 */
export class CheckoutError extends Error {
  public code: string;
  
  constructor(message: string, code = 'checkout_error') {
    super(message);
    this.name = 'CheckoutError';
    this.code = code;
  }
}

/**
 * Response type for checkout session
 */
interface CheckoutSessionResponse {
  url: string;
  sessionId: string;
}

/**
 * Response type for checkout success verification
 */
interface CheckoutSuccessResponse {
  success: boolean;
  plan: string | null;
  status: string;
  accountType: string;
  isTrial: boolean;
  trialEndsAt: string | null;
  subscriptionId: string | null;
  customerId: string | null;
  currentPeriodEnd: string | null;
}

/**
 * Builds the request payload for creating a checkout session
 * @param priceId The Stripe price ID
 * @returns The request payload object
 */
const buildCheckoutPayload = (priceId: string) => {
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
const invokeEdgeFunction = async <T>(functionName: string, payload: any): Promise<T> => {
  console.log(`[${new Date().toISOString()}] Invoking ${functionName} function with payload:`, payload);
  
  try {
    console.log(`Calling supabase.functions.invoke('${functionName}')`);
    const response = await supabase.functions.invoke(functionName, {
      body: payload
    });
    
    console.log(`[${new Date().toISOString()}] ${functionName} raw response:`, response);
    const { data, error, status } = response;
    
    console.log(`${functionName} response status:`, status);
    console.log(`${functionName} response data:`, data);
    console.log(`${functionName} response error:`, error);
    
    // Check for non-2xx response status
    if (status < 200 || status >= 300) {
      console.error(`${functionName} returned non-2xx status:`, status);
      throw new CheckoutError(
        `Error invoking ${functionName}: Server returned ${status} status`, 
        'edge_function_status_error'
      );
    }
    
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
    
    console.log(`${functionName} returned data:`, data);
    return data as T;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in invokeEdgeFunction:`, error);
    
    if (error instanceof CheckoutError) {
      throw error;
    }
    
    console.error(`Unexpected error in ${functionName}:`, error);
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
  console.log('[CHECKOUT] Browser information:', {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform
  });
  
  if (!priceId) {
    throw new CheckoutError('Price ID is required', 'invalid_price_id');
  }
  
  const payload = buildCheckoutPayload(priceId);
  console.log('[CHECKOUT] Built checkout payload:', payload);
  
  try {
    console.log('[CHECKOUT] About to invoke create-checkout edge function');
    const data = await invokeEdgeFunction<CheckoutSessionResponse>('create-checkout', payload);
    
    if (!data.url) {
      console.error('[CHECKOUT] No checkout URL returned from create-checkout function');
      throw new CheckoutError('No checkout URL returned', 'no_checkout_url');
    }
    
    console.log('[CHECKOUT] Checkout session created successfully with URL:', data.url);
    console.log('[CHECKOUT] Session ID:', data.sessionId);
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

/**
 * Fetches user profile data from Supabase
 * @param userId The user ID
 * @returns The user profile data
 */
const fetchUserProfile = async (userId: string) => {
  console.log('Fetching user profile for ID:', userId);
  
  if (!userId) {
    throw new CheckoutError('User ID is required', 'missing_user_id');
  }
  
  try {
    const { data: profile, error, status } = await supabase
      .from('user_metadata')
      .select('subscription_plan, subscription_status, account_type, stripe_subscription_id, stripe_customer_id, subscription_current_period_end, trial_ends_at')
      .eq('id', userId)
      .maybeSingle();
    
    // Check for non-2xx response status
    if (status < 200 || status >= 300) {
      console.error(`Profile fetch returned non-2xx status:`, status);
      throw new CheckoutError(`Failed to fetch user profile: Server returned ${status} status`, 'profile_fetch_status_error');
    }
    
    if (error) {
      console.error('Error fetching user profile:', error);
      throw new CheckoutError(`Failed to fetch user profile: ${error.message}`, 'profile_fetch_error');
    }
    
    if (!profile) {
      console.warn('User profile not found, returning empty object');
      return {};
    }
    
    console.log('User profile data retrieved:', profile);
    return profile;
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    
    if (error instanceof CheckoutError) {
      throw error;
    }
    
    throw new CheckoutError(`Error fetching user profile: ${error.message}`, 'profile_fetch_error');
  }
};

/**
 * Analyzes user profile data to determine subscription status
 * @param profile The user profile data
 * @returns Analyzed subscription status
 */
const analyzeSubscriptionStatus = (profile: any) => {
  // Check if subscription is active
  const isActive = !!profile?.subscription_plan && 
                  ['active', 'trialing'].includes(profile?.subscription_status || '');
  
  const isTrial = !!profile?.trial_ends_at && 
                 new Date(profile.trial_ends_at) > new Date();
  
  // Determine account type status
  const accountType = profile?.account_type || 'demo';
  const isPaid = accountType === 'paid' || accountType === 'trial';
  
  console.log('Analyzed subscription status:', {
    isActive,
    isTrial,
    accountType,
    isPaid,
    subscriptionStatus: profile?.subscription_status
  });
  
  return { isActive, isTrial, accountType, isPaid };
};

/**
 * Handles a successful checkout by verifying subscription details
 * @param sessionId The Stripe checkout session ID
 * @param userId The user ID
 * @returns Subscription verification result
 */
export const handleCheckoutSuccess = async (sessionId: string, userId: string): Promise<CheckoutSuccessResponse> => {
  console.log('Handling checkout success for session:', sessionId, 'user:', userId);
  
  if (!sessionId) {
    throw new CheckoutError('Session ID is required', 'missing_session_id');
  }
  
  if (!userId) {
    throw new CheckoutError('User ID is required', 'missing_user_id');
  }
  
  try {
    // Fetch the current user profile information
    const profile = await fetchUserProfile(userId);
    
    // Analyze subscription status
    const { isActive, isTrial, accountType, isPaid } = analyzeSubscriptionStatus(profile);
    
    // For complete verification, we could also validate the session with Stripe directly
    // But we'll rely on our database state for now
    
    return { 
      success: isActive || isPaid,
      plan: profile?.subscription_plan || null,
      status: profile?.subscription_status || 'inactive',
      accountType: accountType,
      isTrial,
      trialEndsAt: profile?.trial_ends_at || null,
      subscriptionId: profile?.stripe_subscription_id || null,
      customerId: profile?.stripe_customer_id || null,
      currentPeriodEnd: profile?.subscription_current_period_end || null
    };
  } catch (error) {
    console.error('Error verifying checkout:', error);
    
    if (error instanceof CheckoutError) {
      throw error;
    }
    
    throw new CheckoutError(`Error verifying checkout: ${error.message}`, 'verification_error');
  }
};
