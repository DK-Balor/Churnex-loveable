
import { supabase } from '../../integrations/supabase/client';

interface Subscription {
  status: string;
  plan: string | null;
  currentPeriodEnd: string;
  isCanceled: boolean;
  isTrialing: boolean;
}

// Function to get the current user's subscription
export const getCurrentSubscription = async (userId: string): Promise<Subscription> => {
  try {
    // Fetch user's subscription data from Supabase
    const { data: profile, error } = await supabase
      .from('user_metadata')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return {
      status: profile?.subscription_status || (profile?.subscription_plan ? 'active' : 'inactive'),
      plan: profile?.subscription_plan || null, // Default to null if none is set
      currentPeriodEnd: profile?.trial_ends_at || new Date().toISOString(),
      isCanceled: profile?.subscription_status === 'canceled',
      isTrialing: profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date()
    };
  } catch (error) {
    console.error('Error getting subscription:', error);
    return {
      status: 'inactive',
      plan: null, // Default to null
      currentPeriodEnd: new Date().toISOString(),
      isCanceled: false,
      isTrialing: false
    };
  }
};

// Function to cancel a subscription
export const cancelSubscription = async (userId: string) => {
  try {
    // Call our Supabase Edge Function for cancellation
    const { data, error } = await supabase.functions.invoke('cancel-subscription', {
      body: { userId }
    });

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
};

// Function to update payment method
export const updatePaymentMethod = async (userId: string) => {
  try {
    // Call Supabase Edge Function to create a billing portal session
    const { data, error } = await supabase.functions.invoke('create-billing-portal', {
      body: { userId }
    });

    if (error) throw error;
    
    // Redirect to the billing portal
    if (data?.url) {
      window.location.href = data.url;
    }
    
    return data;
  } catch (error) {
    console.error('Error updating payment method:', error);
    throw error;
  }
};

// Function to check if a user is in read-only mode (no active subscription)
export const isReadOnlyUser = (userId: string) => {
  return getCurrentSubscription(userId).then(subscription => {
    return subscription.status !== 'active' || !subscription.plan;
  });
};
