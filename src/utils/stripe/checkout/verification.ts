
import { CheckoutSuccessResponse, CheckoutError } from './types';
import { fetchUserProfile, analyzeSubscriptionStatus } from './profile';

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
