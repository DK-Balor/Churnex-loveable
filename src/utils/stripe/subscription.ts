
import { supabase } from '../../integrations/supabase/client';

interface Subscription {
  status: string;
  plan: string | null;
  currentPeriodEnd: string;
  isCanceled: boolean;
  isTrialing: boolean;
  accountType: string;
  daysUntilExpiry: number | null;
}

// Function to get the current user's subscription
export const getCurrentSubscription = async (userId: string): Promise<Subscription> => {
  try {
    console.log('Fetching subscription for user:', userId);
    
    // Fetch user's subscription data from Supabase
    const { data: profile, error } = await supabase
      .from('user_metadata')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user metadata:', error);
      throw error;
    }

    console.log('User metadata retrieved:', profile);
    
    // Calculate days until expiry for demo accounts
    let daysUntilExpiry = null;
    if (profile?.account_expires_at) {
      const expiryDate = new Date(profile.account_expires_at);
      const now = new Date();
      const diffTime = expiryDate.getTime() - now.getTime();
      daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry < 0) daysUntilExpiry = 0;
    }

    // Use account_type field to determine status if available
    const accountType = profile?.account_type || 'demo';
    
    // Only consider it a trial if account_type is 'trial' AND trial_ends_at exists and is in the future
    const isTrialing = accountType === 'trial' && 
                      profile?.trial_ends_at && 
                      new Date(profile.trial_ends_at) > new Date();
    
    console.log('Account type:', accountType);
    console.log('Is trialing:', isTrialing);
    console.log('Trial ends at:', profile?.trial_ends_at);
    console.log('Subscription status:', profile?.subscription_status);

    return {
      status: profile?.subscription_status || (profile?.subscription_plan ? 'active' : 'inactive'),
      plan: profile?.subscription_plan || null, // Default to null if none is set
      currentPeriodEnd: profile?.subscription_current_period_end || profile?.trial_ends_at || new Date().toISOString(),
      isCanceled: profile?.subscription_cancel_at_period_end || false,
      isTrialing: isTrialing,
      accountType: accountType,
      daysUntilExpiry
    };
  } catch (error) {
    console.error('Error getting subscription:', error);
    return {
      status: 'inactive',
      plan: null, // Default to null
      currentPeriodEnd: new Date().toISOString(),
      isCanceled: false,
      isTrialing: false,
      accountType: 'demo',
      daysUntilExpiry: 30
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
export const isReadOnlyUser = async (userId: string) => {
  const subscription = await getCurrentSubscription(userId);
  
  // User is in read-only mode if:
  // 1. They have no active subscription or trial (inactive/canceled status)
  // 2. They are marked as a demo account
  
  // Trial accounts have access to paid features during trial period
  if (subscription.isTrialing) return false;
  
  // Paid accounts have full access
  if (subscription.status === 'active' && subscription.plan) return false;
  
  // Everyone else (demo accounts, expired trials, canceled subscriptions) is read-only
  return true;
};
