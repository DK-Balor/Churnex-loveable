
import { supabase } from '../../integrations/supabase/client';

// Function to create a checkout session
export const createCheckoutSession = async (priceId: string) => {
  try {
    // Make sure the priceId is in the expected format for the edge function
    const formattedPriceId = priceId.startsWith('price_') ? priceId : priceId;
    
    // Call our Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { 
        priceId: formattedPriceId,
        successUrl: window.location.origin + '/checkout-success',
        cancelUrl: window.location.origin + '/checkout?cancelled=true'
      }
    });

    if (error) {
      console.error('Function error:', error);
      throw new Error(`Failed to create checkout session: ${error.message}`);
    }
    
    if (!data || !data.url) {
      throw new Error('No checkout URL returned from server');
    }
    
    return data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Function to handle successful checkout
export const handleCheckoutSuccess = async (sessionId: string, userId: string) => {
  try {
    // With Stripe webhooks, this is handled automatically by the backend
    // This function now mainly checks the current subscription status
    const { data: profile, error } = await supabase
      .from('user_metadata')
      .select('subscription_plan, subscription_status')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return { 
      success: !!profile?.subscription_plan && profile?.subscription_plan !== 'free',
      plan: profile?.subscription_plan || null,
      status: profile?.subscription_status || 'inactive'
    };
  } catch (error) {
    console.error('Error verifying checkout:', error);
    throw error;
  }
};
