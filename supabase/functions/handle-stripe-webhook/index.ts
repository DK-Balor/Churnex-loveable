
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "https://esm.sh/stripe@12.5.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "");
const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabaseClient = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Helper function to verify Stripe webhook signature
const verifyStripeSignature = (body: string, signature: string | null) => {
  if (!signature) {
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
  const { error } = await supabaseClient
    .from('user_metadata')
    .update(data)
    .eq('id', userId);
  
  if (error) {
    console.error('Error updating user metadata:', error);
    throw error;
  }
  
  return { success: true };
};

// Handle checkout.session.completed event
const handleCheckoutCompleted = async (session: any) => {
  const userId = session.client_reference_id;
  const subscriptionId = session.subscription;

  console.log(`Processing checkout completion for user ${userId}`);

  if (!userId || !subscriptionId) {
    console.log('Missing userId or subscriptionId');
    return;
  }

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  // Get the price ID from the subscription
  const priceId = subscription.items.data[0].price.id;
  
  // Check the price lookup_key to determine the plan
  const price = await stripe.prices.retrieve(priceId);
  const planId = price.metadata?.plan_id || price.lookup_key?.replace('price_', '') || null;
  
  // Map to a plan name
  let plan = 'free';
  if (planId === 'growth') plan = 'growth';
  if (planId === 'scale') plan = 'scale';
  if (planId === 'pro') plan = 'pro';
  
  if (plan !== 'free') {
    // Check if subscription is in trial period
    const isTrialing = subscription.status === 'trialing';
    const trialEndDate = isTrialing ? new Date(subscription.trial_end * 1000) : null;
    
    // Update the user's subscription in the database
    await updateUserMetadata(userId, {
      subscription_plan: plan,
      subscription_status: subscription.status,
      stripe_customer_id: session.customer,
      stripe_subscription_id: subscriptionId,
      trial_ends_at: isTrialing ? trialEndDate.toISOString() : null,
      account_type: isTrialing ? 'trial' : 'paid', // Update account type
      // Clear account expiry for paid accounts
      account_expires_at: null
    });
    
    console.log(`Successfully updated subscription for user ${userId} to plan ${plan}`);
  }
};

// Handle invoice.payment_succeeded event
const handlePaymentSucceeded = async (invoice: any) => {
  const subscriptionId = invoice.subscription;
  const customerId = invoice.customer;
  
  if (!subscriptionId || !customerId) {
    console.log('Missing subscriptionId or customerId');
    return;
  }
  
  // Get the customer metadata to find the user ID
  const customer = await stripe.customers.retrieve(customerId);
  const userId = customer.metadata?.user_id;
  
  if (userId) {
    // Update the payment status
    await updateUserMetadata(userId, {
      last_payment_status: 'succeeded',
      last_payment_date: new Date().toISOString()
    });
    
    console.log(`Payment succeeded for user ${userId}`);
  }
};

// Handle invoice.payment_failed event
const handlePaymentFailed = async (invoice: any) => {
  const subscriptionId = invoice.subscription;
  const customerId = invoice.customer;
  
  if (!subscriptionId || !customerId) {
    console.log('Missing subscriptionId or customerId');
    return;
  }
  
  // Get the customer metadata to find the user ID
  const customer = await stripe.customers.retrieve(customerId);
  const userId = customer.metadata?.user_id;
  
  if (userId) {
    // Update the payment status
    await updateUserMetadata(userId, {
      last_payment_status: 'failed',
    });
    
    console.log(`Payment failed for user ${userId}`);
  }
};

// Handle customer.subscription.updated event
const handleSubscriptionUpdated = async (subscription: any) => {
  const stripeCustomerId = subscription.customer;
  
  // Get the user with this Stripe customer ID
  const { data, error } = await supabaseClient
    .from('user_metadata')
    .select('id')
    .eq('stripe_customer_id', stripeCustomerId)
    .single();
  
  if (error || !data) {
    console.error('Error finding user with customer ID:', error);
    return;
  }
  
  const userId = data.id;
  
  // Check subscription status
  const isTrialing = subscription.status === 'trialing';
  const isActive = subscription.status === 'active';
  const trialEndDate = isTrialing ? new Date(subscription.trial_end * 1000) : null;
  
  // Update subscription status and account type
  const accountType = isTrialing ? 'trial' : (isActive ? 'paid' : 'demo');
  
  // If account is reverting to demo, set expiry date to 30 days from now
  const accountExpiresAt = accountType === 'demo' ? 
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null;
  
  // Update subscription status
  await updateUserMetadata(userId, {
    subscription_status: subscription.status,
    trial_ends_at: isTrialing ? trialEndDate.toISOString() : null,
    account_type: accountType,
    account_expires_at: accountExpiresAt
  });
  
  console.log(`Updated subscription status to ${subscription.status} and account type to ${accountType} for user ${userId}`);
};

// Handle customer.subscription.deleted event
const handleSubscriptionDeleted = async (subscription: any) => {
  const stripeCustomerId = subscription.customer;
  
  // Get the user with this Stripe customer ID
  const { data, error } = await supabaseClient
    .from('user_metadata')
    .select('id')
    .eq('stripe_customer_id', stripeCustomerId)
    .single();
  
  if (error || !data) {
    console.error('Error finding user with customer ID:', error);
    return;
  }
  
  const userId = data.id;
  
  // Mark subscription as canceled and revert to demo account
  // Set account expiry date to 30 days from now
  const accountExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  
  await updateUserMetadata(userId, {
    subscription_plan: 'free',
    subscription_status: 'canceled',
    trial_ends_at: null,
    account_type: 'demo',
    account_expires_at: accountExpiresAt
  });
  
  console.log(`Subscription canceled for user ${userId}, reverted to demo account`);
};

// Handle customer.subscription.trial_will_end event
const handleTrialWillEnd = async (subscription: any) => {
  const stripeCustomerId = subscription.customer;
  
  // Get the user with this Stripe customer ID
  const { data, error } = await supabaseClient
    .from('user_metadata')
    .select('id')
    .eq('stripe_customer_id', stripeCustomerId)
    .single();
  
  if (error || !data) {
    console.error('Error finding user with customer ID:', error);
    return;
  }
  
  // Here you could send email notifications or implement other logic
  // for notifying users their trial is about to end
  console.log(`Trial will end soon for user: ${data.id}`);
};

// Main event handler for different event types
const handleStripeEvent = async (event: any) => {
  console.log(`Received webhook event: ${event.type}`);
  
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
};

// Main request handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    // Verify the webhook signature
    let event;
    try {
      event = verifyStripeSignature(body, signature);
    } catch (err) {
      return new Response(
        JSON.stringify({ error: err.message }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Process the event
    await handleStripeEvent(event);

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in handle-stripe-webhook function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
