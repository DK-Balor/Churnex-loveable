
import { supabase } from '../../integrations/supabase/client';

interface StripeConnectionStatus {
  connected: boolean;
  account_id: string | null;
  last_sync_at: string | null;
  error?: string;
}

export const connectStripeAccount = async (userId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('stripe-connect', {
      body: { userId }
    });
    
    if (error) throw error;
    
    // If we have a URL, redirect to it for Stripe OAuth flow
    if (data?.url) {
      window.location.href = data.url;
    }
    
    return data;
  } catch (error) {
    console.error('Error initiating Stripe connection:', error);
    throw error;
  }
};

export const getStripeConnectionStatus = async (userId: string): Promise<StripeConnectionStatus> => {
  try {
    const { data, error } = await supabase
      .from('stripe_connections')
      .select('account_id, connected, last_sync_at')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      // If no record found, just return not connected
      if (error.code === 'PGRST116') {
        return { connected: false, account_id: null, last_sync_at: null };
      }
      throw error;
    }
    
    return {
      connected: data.connected,
      account_id: data.account_id,
      last_sync_at: data.last_sync_at
    };
  } catch (error) {
    console.error('Error checking Stripe connection:', error);
    return {
      connected: false,
      account_id: null,
      last_sync_at: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const disconnectStripeAccount = async (userId: string, accountId: string) => {
  try {
    const { error } = await supabase.functions.invoke('stripe-disconnect', {
      body: { userId, accountId }
    });
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error disconnecting Stripe account:', error);
    throw error;
  }
};

export const syncStripeData = async (userId: string) => {
  try {
    // First sync the data from Stripe
    const { data, error } = await supabase.functions.invoke('stripe-sync-data', {
      body: { userId }
    });
    
    if (error) throw error;
    
    // After syncing data, calculate the analytics
    await calculateAnalytics(userId);
    
    return data;
  } catch (error) {
    console.error('Error syncing Stripe data:', error);
    throw error;
  }
};

// New function to calculate analytics after data sync
export const calculateAnalytics = async (userId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('calculate-analytics', {
      body: { userId }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error calculating analytics:', error);
    throw error;
  }
};

// New function to update onboarding step status
export const updateOnboardingStepStatus = async (userId: string, step: string, completed: boolean) => {
  try {
    const { data: currentSteps, error: fetchError } = await supabase
      .from('user_metadata')
      .select('onboarding_steps')
      .eq('id', userId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }
    
    // Initialize or update the steps object
    const onboardingSteps = currentSteps?.onboarding_steps || {};
    onboardingSteps[step] = completed;
    
    // Update the user metadata with the new steps status
    const { error: updateError } = await supabase
      .from('user_metadata')
      .update({ onboarding_steps: onboardingSteps })
      .eq('id', userId);
    
    if (updateError) throw updateError;
    
    return { success: true, onboardingSteps };
  } catch (error) {
    console.error('Error updating onboarding step status:', error);
    throw error;
  }
};

// New function to get onboarding step statuses
export const getOnboardingStepStatuses = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_metadata')
      .select('onboarding_steps')
      .eq('id', userId)
      .single();
    
    if (error) {
      // If no record found or no onboarding steps yet, return empty object
      if (error.code === 'PGRST116') {
        return {};
      }
      throw error;
    }
    
    return data.onboarding_steps || {};
  } catch (error) {
    console.error('Error getting onboarding steps:', error);
    return {};
  }
};
