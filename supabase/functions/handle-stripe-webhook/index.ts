
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "https://esm.sh/stripe@12.5.0";

// Initialize Stripe client
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "");
const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Helper function to verify Stripe webhook signature
const verifyStripeSignature = (body: string, signature: string | null) => {
  if (!signature) {
    console.error("Webhook signature missing");
    throw new Error("Webhook signature missing");
  }

  try {
    return stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    throw new Error(`Webhook Error: ${err.message}`);
  }
};

// Helper to update user metadata
const updateUserMetadata = async (userId: string, data: Record<string, any>) => {
  console.log(`Updating user metadata for ${userId}:`, data);
  
  try {
    const { error } = await supabaseClient
      .from('user_metadata')
      .update(data)
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating user metadata:', error);
      throw error;
    }
    
    console.log(`User metadata updated successfully for ${userId}`);
    return { success: true };
  } catch (error) {
    console.error(`Failed to update user metadata for ${userId}:`, error);
    throw error;
  }
};

// Handle checkout.session.completed event
const handleCheckoutCompleted = async (session: any) => {
  const userId = session.client_reference_id;
  const subscriptionId = session.subscription;

  console.log(`Processing checkout completion for user ${userId}, subscription ${subscriptionId}`);

  if (!userId || !subscriptionId) {
    console.log('Missing userId or subscriptionId, cannot process checkout');
    return;
  }

  try {
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

// Handle invoice.payment_succeeded event
const handlePaymentSucceeded = async (invoice: any) => {
  const subscriptionId = invoice.subscription;
  const customerId = invoice.customer;
  
  if (!subscriptionId || !customerId) {
    console.log('Missing subscriptionId or customerId, cannot process payment success');
    return;
  }
  
  try {
    // Get the customer to find the user ID
    const customer = await stripe.customers.retrieve(customerId);
    const userId = customer.metadata?.user_id;
    
    if (!userId) {
      console.log(`No user ID found in customer metadata for ${customerId}`);
      return;
    }
    
    console.log(`Payment succeeded for user ${userId}, subscription ${subscriptionId}`);
    
    // Update payment status in user metadata
    await updateUserMetadata(userId, {
      last_payment_status: 'succeeded',
      last_payment_date: new Date().toISOString(),
      last_payment_amount: invoice.amount_paid / 100, // Convert from cents to currency unit
      payment_failure_count: 0 // Reset any payment failure count
    });
  } catch (error) {
    console.error(`Error processing payment success for subscription ${subscriptionId}:`, error);
    throw error;
  }
};

// Handle invoice.payment_failed event
const handlePaymentFailed = async (invoice: any) => {
  const subscriptionId = invoice.subscription;
  const customerId = invoice.customer;
  
  if (!subscriptionId || !customerId) {
    console.log('Missing subscriptionId or customerId, cannot process payment failure');
    return;
  }
  
  try {
    // Get the customer to find the user ID
    const customer = await stripe.customers.retrieve(customerId);
    const userId = customer.metadata?.user_id;
    
    if (!userId) {
      console.log(`No user ID found in customer metadata for ${customerId}`);
      return;
    }
    
    console.log(`Payment failed for user ${userId}, subscription ${subscriptionId}`);
    
    // Get the current user metadata to update the failure count
    const { data: userData, error: userError } = await supabaseClient
      .from('user_metadata')
      .select('payment_failure_count')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error(`Error fetching current user data for ${userId}:`, userError);
    }
    
    // Calculate the new failure count
    const currentFailures = userData?.payment_failure_count || 0;
    const newFailureCount = currentFailures + 1;
    
    // Update the payment status
    await updateUserMetadata(userId, {
      last_payment_status: 'failed',
      last_payment_failure_date: new Date().toISOString(),
      last_payment_failure_reason: invoice.last_payment_error?.message || 'Unknown reason',
      payment_failure_count: newFailureCount
    });
    
    console.log(`Updated payment failure for user ${userId}, failure count: ${newFailureCount}`);
  } catch (error) {
    console.error(`Error processing payment failure for subscription ${subscriptionId}:`, error);
    throw error;
  }
};

// Handle customer.subscription.updated event
const handleSubscriptionUpdated = async (subscription: any) => {
  const stripeCustomerId = subscription.customer;
  
  try {
    // Get the user with this Stripe customer ID
    const { data, error } = await supabaseClient
      .from('user_metadata')
      .select('id')
      .eq('stripe_customer_id', stripeCustomerId)
      .single();
    
    if (error || !data) {
      console.error(`Error finding user with customer ID ${stripeCustomerId}:`, error);
      return;
    }
    
    const userId = data.id;
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
const handleSubscriptionDeleted = async (subscription: any) => {
  const stripeCustomerId = subscription.customer;
  
  try {
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
const handleTrialWillEnd = async (subscription: any) => {
  const stripeCustomerId = subscription.customer;
  
  try {
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

// Main event handler for different Stripe event types
const handleStripeEvent = async (event: any) => {
  console.log(`Received webhook event: ${event.type} (id: ${event.id})`);
  
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
  
      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object);
        break;
  
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return { success: true, event: event.type };
  } catch (error) {
    console.error(`Error handling event ${event.type}:`, error);
    throw error;
  }
};

// Main Deno request handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log(`Received ${req.method} request to webhook handler`);
    
    // Get the raw request body text
    const body = await req.text();
    
    // Get the Stripe signature header
    const signature = req.headers.get("stripe-signature");
    
    // Verify the webhook signature
    let event;
    try {
      event = verifyStripeSignature(body, signature);
      console.log(`Webhook signature verified for event ${event.id}`);
    } catch (err) {
      console.error(`Webhook signature verification failed:`, err);
      return new Response(
        JSON.stringify({ error: err.message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Process the verified event
    await handleStripeEvent(event);

    return new Response(
      JSON.stringify({ received: true, event_id: event.id, event_type: event.type }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in handle-stripe-webhook function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Webhook processing error", 
        message: error.message,
        stack: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
