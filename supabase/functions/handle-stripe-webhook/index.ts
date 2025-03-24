
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Webhook signature missing" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(
        JSON.stringify({ error: `Webhook Error: ${err.message}` }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id;
        const subscriptionId = session.subscription;

        if (userId && subscriptionId) {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0].price.id;
          
          // Map price ID to plan name
          let plan = null;
          if (priceId === 'price_growth') plan = 'growth';
          if (priceId === 'price_scale') plan = 'scale';
          if (priceId === 'price_pro') plan = 'pro';
          
          if (plan) {
            // Check if subscription is in trial period
            const isTrialing = subscription.status === 'trialing';
            const trialEndDate = isTrialing ? new Date(subscription.trial_end * 1000) : null;
            
            // Update the user's subscription in the database
            const { error } = await supabaseClient
              .from('user_metadata')
              .update({
                subscription_plan: plan,
                stripe_customer_id: session.customer,
                stripe_subscription_id: subscriptionId,
                trial_ends_at: isTrialing ? trialEndDate.toISOString() : null
              })
              .eq('id', userId);
            
            if (error) {
              console.error('Error updating subscription:', error);
              throw error;
            }
          }
        }
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const stripeCustomerId = subscription.customer;
        
        // Get the user with this Stripe customer ID
        const { data, error } = await supabaseClient
          .from('user_metadata')
          .select('id')
          .eq('stripe_customer_id', stripeCustomerId)
          .single();
        
        if (error || !data) {
          console.error('Error finding user with customer ID:', error);
          break;
        }
        
        const userId = data.id;
        
        // Check if subscription is in trial
        const isTrialing = subscription.status === 'trialing';
        const trialEndDate = isTrialing ? new Date(subscription.trial_end * 1000) : null;
        
        // Update subscription status
        await supabaseClient
          .from('user_metadata')
          .update({
            trial_ends_at: isTrialing ? trialEndDate.toISOString() : null
          })
          .eq('id', userId);
        
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const stripeCustomerId = subscription.customer;
        
        // Get the user with this Stripe customer ID
        const { data, error } = await supabaseClient
          .from('user_metadata')
          .select('id')
          .eq('stripe_customer_id', stripeCustomerId)
          .single();
        
        if (error || !data) {
          console.error('Error finding user with customer ID:', error);
          break;
        }
        
        const userId = data.id;
        
        // Mark subscription as canceled
        await supabaseClient
          .from('user_metadata')
          .update({
            subscription_plan: 'free', // Downgrade to free plan when canceled
            trial_ends_at: null
          })
          .eq('id', userId);
        
        break;
      }

      case 'customer.subscription.trial_will_end': {
        // Triggered 3 days before trial ends
        const subscription = event.data.object;
        const stripeCustomerId = subscription.customer;
        
        // Get the user with this Stripe customer ID
        const { data, error } = await supabaseClient
          .from('user_metadata')
          .select('id')
          .eq('stripe_customer_id', stripeCustomerId)
          .single();
        
        if (error || !data) {
          console.error('Error finding user with customer ID:', error);
          break;
        }
        
        // Here you could send email notifications or implement other logic
        // for notifying users their trial is about to end
        console.log(`Trial will end soon for user: ${data.id}`);
        
        break;
      }
    }

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
