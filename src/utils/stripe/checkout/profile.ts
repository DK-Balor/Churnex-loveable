
import { supabase } from '../../../integrations/supabase/client';
import { CheckoutError } from './types';

/**
 * Fetches user profile data from Supabase
 * @param userId The user ID
 * @returns The user profile data
 */
export const fetchUserProfile = async (userId: string) => {
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
export const analyzeSubscriptionStatus = (profile: any) => {
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
