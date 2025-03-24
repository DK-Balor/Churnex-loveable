
import { supabase } from '../../integrations/supabase/client';

// Function to create a checkout session
export const createCheckoutSession = async (priceId: string) => {
  try {
    console.log('Creating checkout session for price:', priceId);
    
    // Make sure the priceId is in the expected format for the edge function
    const formattedPriceId = priceId.startsWith('price_') ? priceId : `price_${priceId}`;
    
    // Call our Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { 
        priceId: formattedPriceId,
        successUrl: window.location.origin + '/checkout-success?session_id={CHECKOUT_SESSION_ID}',
        cancelUrl: window.location.origin + '/checkout?cancelled=true'
      }
    });

    if (error) {
      console.error('Function error:', error);
      throw new Error(`Failed to create checkout session: ${error.message}`);
    }
    
    if (!data || !data.url) {
      console.error('No checkout URL returned:', data);
      throw new Error(data?.error || 'No checkout URL returned from server');
    }
    
    console.log('Checkout session created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Function to handle successful checkout
export const handleCheckoutSuccess = async (sessionId: string, userId: string) => {
  try {
    console.log('Handling checkout success for session:', sessionId);
    
    // With Stripe webhooks, this is handled automatically by the backend
    // This function now mainly checks the current subscription status
    const { data: profile, error } = await supabase
      .from('user_metadata')
      .select('subscription_plan, subscription_status, account_type')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
    
    console.log('User profile after checkout:', profile);
    
    // Check if the subscription is active
    const success = !!profile?.subscription_plan && 
                   (profile?.subscription_status === 'active' || 
                    profile?.subscription_status === 'trialing' ||
                    profile?.account_type === 'trial' ||
                    profile?.account_type === 'paid');
    
    return { 
      success: success,
      plan: profile?.subscription_plan || null,
      status: profile?.subscription_status || 'inactive',
      accountType: profile?.account_type || 'demo'
    };
  } catch (error) {
    console.error('Error verifying checkout:', error);
    throw error;
  }
};
