
import { getStripeClient } from "../_shared/stripeClient.ts";
import { updateUserMetadata, findUserByStripeCustomerId } from "./userMetadataService.ts";

// Handle customer.subscription.updated event
export const handleSubscriptionUpdated = async (subscription: any) => {
  const stripeCustomerId = subscription.customer;
  
  try {
    // Get the user with this Stripe customer ID
    const userId = await findUserByStripeCustomerId(stripeCustomerId);
    console.log(`Processing subscription update for user ${userId}`);
    
    // Check subscription status
    const isTrialing = subscription.status === 'trialing';
    const isActive = subscription.status === 'active';
    const isCanceled = subscription.status === 'canceled';
    const isPastDue = subscription.status === 'past_due';
    
    // Determine trial end date if applicable
    const trialEndDate = isTrialing && subscription.trial_end 
      ? new Date(subscription.trial_end * 1000) 
      : null;
    
    // Determine account type based on subscription status
    let accountType;
    if (isTrialing) {
      accountType = 'trial';
    } else if (isActive) {
      accountType = 'paid';
    } else if (isCanceled) {
      accountType = 'demo'; // Revert to demo on cancellation
    } else if (isPastDue) {
      accountType = 'past_due'; // Special status for past due
    } else {
      accountType = 'demo'; // Default fallback
    }
    
    // Set account expiry date for demo accounts (30 days from now)
    const accountExpiresAt = accountType === 'demo' 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
      : null;
    
    // Set current period end date for active or trialing subscriptions
    const subscriptionCurrentPeriodEnd = (isActive || isTrialing) && subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString() 
      : null;
    
    // Update the user metadata with all relevant fields
    await updateUserMetadata(userId, {
      subscription_status: subscription.status,
      trial_ends_at: trialEndDate?.toISOString() || null,
      account_type: accountType,
      account_expires_at: accountExpiresAt,
      subscription_current_period_end: subscriptionCurrentPeriodEnd,
      canceled_at: subscription.canceled_at 
        ? new Date(subscription.canceled_at * 1000).toISOString() 
        : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString()
    });
    
    console.log(`Updated subscription status to ${subscription.status} and account type to ${accountType} for user ${userId}`);
  } catch (error) {
    console.error(`Error processing subscription update for customer ${stripeCustomerId}:`, error);
    throw error;
  }
};

// Handle customer.subscription.deleted event
export const handleSubscriptionDeleted = async (subscription: any) => {
  const stripeCustomerId = subscription.customer;
  
  try {
    const supabaseClient = getSupabaseClient();
    
    // Get the user with this Stripe customer ID
    const { data, error } = await supabaseClient
      .from('user_metadata')
      .select('id, subscription_plan')
      .eq('stripe_customer_id', stripeCustomerId)
      .single();
    
    if (error || !data) {
      console.error(`Error finding user with customer ID ${stripeCustomerId}:`, error);
      return;
    }
    
    const userId = data.id;
    const previousPlan = data.subscription_plan;
    
    console.log(`Processing subscription deletion for user ${userId} (previous plan: ${previousPlan})`);
    
    // Mark subscription as canceled and revert to demo account
    // Set account expiry date to 30 days from now
    const accountExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    await updateUserMetadata(userId, {
      subscription_plan: 'free',
      subscription_status: 'canceled',
      previous_plan: previousPlan, // Store the previous plan for potential win-back campaigns
      trial_ends_at: null,
      account_type: 'demo',
      account_expires_at: accountExpiresAt,
      canceled_at: new Date().toISOString()
    });
    
    console.log(`Subscription canceled for user ${userId}, reverted to demo account expiring ${accountExpiresAt}`);
  } catch (error) {
    console.error(`Error processing subscription deletion for customer ${stripeCustomerId}:`, error);
    throw error;
  }
};

// Handle customer.subscription.trial_will_end event
export const handleTrialWillEnd = async (subscription: any) => {
  const stripeCustomerId = subscription.customer;
  
  try {
    const supabaseClient = getSupabaseClient();
    
    // Get the user with this Stripe customer ID
    const { data, error } = await supabaseClient
      .from('user_metadata')
      .select('id, full_name, business_name')
      .eq('stripe_customer_id', stripeCustomerId)
      .single();
    
    if (error || !data) {
      console.error(`Error finding user with customer ID ${stripeCustomerId}:`, error);
      return;
    }
    
    const userId = data.id;
    const businessName = data.business_name || 'your business';
    
    console.log(`Trial will end soon for user: ${userId} (${businessName})`);
    
    // Update user metadata to indicate trial is ending
    await updateUserMetadata(userId, {
      trial_ending_notified: true,
      trial_end_notification_date: new Date().toISOString()
    });
    
    // Here you could implement additional logic like sending an email notification
  } catch (error) {
    console.error(`Error processing trial end notification for customer ${stripeCustomerId}:`, error);
    throw error;
  }
};
