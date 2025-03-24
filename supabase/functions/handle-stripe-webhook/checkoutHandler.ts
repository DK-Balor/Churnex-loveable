
import { getStripeClient } from "../_shared/stripeClient.ts";
import { updateUserMetadata } from "./userMetadataService.ts";

// Handle checkout.session.completed event
export const handleCheckoutCompleted = async (session: any) => {
  const userId = session.client_reference_id;
  const subscriptionId = session.subscription;

  console.log(`Processing checkout completion for user ${userId}, subscription ${subscriptionId}`);

  if (!userId || !subscriptionId) {
    console.log('Missing userId or subscriptionId, cannot process checkout');
    return;
  }

  try {
    const stripe = getStripeClient();
    
    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    console.log(`Retrieved subscription details: ${subscription.id}, status: ${subscription.status}`);
    
    // Get the price ID and plan from the subscription
    const priceId = subscription.items.data[0].price.id;
    const price = await stripe.prices.retrieve(priceId);
    
    // Determine the plan name
    const planId = price.metadata?.plan_id || price.lookup_key?.replace('price_', '') || null;
    console.log(`Subscription plan: ${planId}, price: ${priceId}`);
    
    // Map to a plan name (fallback to 'free' if unknown)
    let plan = 'free';
    if (planId === 'growth') plan = 'growth';
    if (planId === 'scale') plan = 'scale';
    if (planId === 'pro') plan = 'pro';
    
    // Check if subscription is in trial period
    const isTrialing = subscription.status === 'trialing';
    const trialEndDate = isTrialing ? new Date(subscription.trial_end * 1000) : null;
    
    // Update the user's subscription in the database
    await updateUserMetadata(userId, {
      subscription_plan: plan,
      subscription_status: subscription.status,
      stripe_customer_id: session.customer,
      stripe_subscription_id: subscriptionId,
      trial_ends_at: isTrialing ? trialEndDate?.toISOString() : null,
      account_type: isTrialing ? 'trial' : 'paid',
      account_expires_at: null, // Clear any expiry for paid accounts
      subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      last_updated: new Date().toISOString()
    });
    
    console.log(`Successfully updated subscription for user ${userId} to plan ${plan}, account type: ${isTrialing ? 'trial' : 'paid'}`);
  } catch (error) {
    console.error(`Error processing checkout completion for user ${userId}:`, error);
    throw error;
  }
};
