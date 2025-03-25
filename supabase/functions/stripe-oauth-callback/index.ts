
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, userId } = await req.json();
    
    if (!code || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization code or user ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    const appUrl = Deno.env.get("APP_URL") || "https://churnex.lovable.app";
    
    if (!supabaseUrl || !supabaseServiceKey || !stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeSecretKey);
    
    // Exchange the authorization code for an access token
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code
    });
    
    // Extract the connected account ID and key info
    const connectedAccountId = response.stripe_user_id;
    const accessToken = response.access_token;
    const refreshToken = response.refresh_token;
    
    if (!connectedAccountId || !accessToken) {
      throw new Error('Failed to get connected account details from Stripe');
    }
    
    // Get account details to store additional information
    const account = await stripe.accounts.retrieve(connectedAccountId);
    
    // Store the connection details in the database
    const { error: insertError } = await supabase
      .from('stripe_connections')
      .upsert({
        user_id: userId,
        account_id: connectedAccountId,
        connected: true,
        access_token: accessToken,
        refresh_token: refreshToken,
        account_name: account.business_profile?.name || account.email,
        account_email: account.email,
        last_sync_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    
    if (insertError) {
      console.error('Error storing Stripe connection:', insertError);
      throw insertError;
    }
    
    // Trigger initial data sync
    EdgeRuntime.waitUntil(syncStripeData(supabase, stripe, userId, connectedAccountId, accessToken));
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Successfully connected to Stripe', 
        accountId: connectedAccountId 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in stripe-oauth-callback function:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Background task to sync initial Stripe data
async function syncStripeData(supabase: any, stripe: any, userId: string, accountId: string, accessToken: string) {
  console.log(`Starting initial Stripe data sync for user ${userId}, account ${accountId}`);
  
  try {
    // Create a connection to the connected account
    const connectedStripe = new stripe.Stripe(accessToken);
    
    // Get customers (with pagination)
    let hasMore = true;
    let startingAfter = null;
    const customers = [];
    
    while (hasMore) {
      const options: any = { limit: 100 };
      if (startingAfter) options.starting_after = startingAfter;
      
      const customerList = await connectedStripe.customers.list(options);
      
      if (customerList.data.length > 0) {
        customers.push(...customerList.data);
        
        if (customerList.has_more) {
          startingAfter = customerList.data[customerList.data.length - 1].id;
        } else {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }
    
    console.log(`Retrieved ${customers.length} customers from Stripe`);
    
    // Process customers in batches
    const batchSize = 100;
    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = customers.slice(i, i + batchSize);
      
      // Map customers to our schema
      const customerInserts = batch.map(customer => ({
        id: customer.id,
        user_id: userId,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        created_at: new Date(customer.created * 1000).toISOString(),
        metadata: customer.metadata,
        source: 'stripe',
        source_account: accountId
      }));
      
      // Insert customers
      const { error: customerError } = await supabase
        .from('customers')
        .upsert(customerInserts, { onConflict: 'id,user_id', ignoreDuplicates: false });
      
      if (customerError) {
        console.error('Error inserting customer data:', customerError);
      }
    }
    
    // Get subscriptions (with pagination)
    hasMore = true;
    startingAfter = null;
    const subscriptions = [];
    
    while (hasMore) {
      const options: any = { 
        limit: 100,
        expand: ['data.customer', 'data.plan.product']
      };
      if (startingAfter) options.starting_after = startingAfter;
      
      const subscriptionList = await connectedStripe.subscriptions.list(options);
      
      if (subscriptionList.data.length > 0) {
        subscriptions.push(...subscriptionList.data);
        
        if (subscriptionList.has_more) {
          startingAfter = subscriptionList.data[subscriptionList.data.length - 1].id;
        } else {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }
    
    console.log(`Retrieved ${subscriptions.length} subscriptions from Stripe`);
    
    // Process subscriptions in batches
    for (let i = 0; i < subscriptions.length; i += batchSize) {
      const batch = subscriptions.slice(i, i + batchSize);
      
      // Map subscriptions to our schema
      const subscriptionInserts = batch.map(sub => ({
        id: sub.id,
        customer_id: sub.customer.id,
        user_id: userId,
        plan_name: sub.plan?.product?.name || sub.plan?.nickname ||'Unknown Plan',
        amount: sub.plan?.amount ? sub.plan.amount / 100 : 0,
        currency: sub.currency,
        start_date: new Date(sub.start_date * 1000).toISOString(),
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        status: sub.status,
        cancel_at_period_end: sub.cancel_at_period_end,
        canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
        trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
        source: 'stripe',
        source_account: accountId
      }));
      
      // Insert subscriptions
      const { error: subError } = await supabase
        .from('subscriptions')
        .upsert(subscriptionInserts, { onConflict: 'id,user_id', ignoreDuplicates: false });
      
      if (subError) {
        console.error('Error inserting subscription data:', subError);
      }
    }
    
    // Update last sync timestamp
    await supabase
      .from('stripe_connections')
      .update({ 
        last_sync_at: new Date().toISOString(),
        sync_status: 'success',
        sync_error: null
      })
      .eq('user_id', userId)
      .eq('account_id', accountId);
    
    console.log('Initial Stripe data sync completed successfully');
  } catch (error) {
    console.error('Error in Stripe data sync:', error);
    
    // Update sync status with error
    await supabase
      .from('stripe_connections')
      .update({ 
        sync_status: 'error',
        sync_error: error.message || 'Unknown error during sync'
      })
      .eq('user_id', userId)
      .eq('account_id', accountId);
  }
}
