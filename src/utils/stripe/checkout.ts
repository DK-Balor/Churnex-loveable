
import { supabase } from '../../integrations/supabase/client';

/**
 * Creates a checkout session with Stripe through our Edge Function
 * @param priceId The Stripe price ID to checkout with
 * @returns The checkout session data with URL
 */
export const createCheckoutSession = async (priceId: string) => {
  try {
    console.log('Creating checkout session for price:', priceId);
    
    // Get the current origin for success and cancel URLs
    const origin = window.location.origin;
    
    // Call our Supabase Edge Function with comprehensive logging
    console.log('Calling create-checkout edge function with:', { 
      priceId,
      isTestMode: true,
      successUrl: `${origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/checkout?cancelled=true`
    });
    
    const { data, error, status } = await supabase.functions.invoke('create-checkout', {
      body: { 
        priceId,
        isTestMode: true, // Always use test mode for now
        successUrl: `${origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/checkout?cancelled=true`
      }
    });
    
    console.log('Edge function response status:', status);
    console.log('Edge function response data:', data);
    
    if (error) {
      console.error('Edge function error:', error);
      throw new Error(`Failed to create checkout session: ${error.message}`);
    }
    
    if (!data || !data.url) {
      console.error('No checkout URL returned:', data);
      const errorMessage = data?.error || 'No checkout URL returned from server';
      console.error('Error message:', errorMessage);
      throw new Error(errorMessage);
    }
    
    console.log('Checkout session created successfully with URL:', data.url);
    return data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

/**
 * Handles a successful checkout by verifying subscription details
 * @param sessionId The Stripe checkout session ID
 * @param userId The user ID
 * @returns Subscription verification result
 */
export const handleCheckoutSuccess = async (sessionId: string, userId: string) => {
  try {
    console.log('Handling checkout success for session:', sessionId, 'user:', userId);
    
    // Fetch the current user profile information
    const { data: profile, error } = await supabase
      .from('user_metadata')
      .select('subscription_plan, subscription_status, account_type, stripe_subscription_id, stripe_customer_id, subscription_current_period_end, trial_ends_at')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
    
    console.log('User profile after checkout:', profile);
    
    // Check if subscription is active
    const isActive = !!profile?.subscription_plan && 
                    ['active', 'trialing'].includes(profile?.subscription_status || '');
    
    const isTrial = !!profile?.trial_ends_at && 
                   new Date(profile.trial_ends_at) > new Date();
    
    // Determine account type status
    const accountType = profile?.account_type || 'demo';
    const isPaid = accountType === 'paid' || accountType === 'trial';
    
    console.log('Subscription status check:', {
      isActive,
      isTrial,
      accountType,
      isPaid,
      subscriptionStatus: profile?.subscription_status
    });
    
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
    throw error;
  }
};
