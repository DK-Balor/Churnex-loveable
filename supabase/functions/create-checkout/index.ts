
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "https://esm.sh/stripe@12.5.0";

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Configure available plans
const productConfig = {
  growth: {
    name: "Growth Plan",
    description: "Up to 500 subscribers with basic recovery and churn prediction",
    features: ["Up to 500 subscribers", "Basic recovery", "Churn prediction", "Email notifications", "Standard support"],
    price: 4900, // £49 in pence
  },
  scale: {
    name: "Scale Plan",
    description: "Up to 2,000 subscribers with advanced recovery and AI churn prevention",
    features: ["Up to 2,000 subscribers", "Advanced recovery", "AI churn prevention", "Win-back campaigns", "Priority support"],
    price: 9900, // £99 in pence
  },
  pro: {
    name: "Pro Plan",
    description: "Unlimited subscribers with enterprise features and dedicated support",
    features: ["Unlimited subscribers", "Enterprise features", "Custom retention workflows", "Dedicated account manager", "24/7 premium support"],
    price: 19900, // £199 in pence
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Starting checkout session creation process");
    
    // Initialize Stripe with the secret key
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("Stripe secret key not found in environment variables");
      return new Response(
        JSON.stringify({ error: "Stripe configuration error - Missing API key" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Log the first few characters of the key to verify it's loaded (but not the whole key for security)
    console.log(`Stripe key loaded: ${stripeSecretKey.substring(0, 8)}...`);
    
    const stripe = new Stripe(stripeSecretKey);
    console.log("Stripe initialized successfully");
    
    // Get the Supabase configuration
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase configuration missing");
      return new Response(
        JSON.stringify({ error: "Server configuration error - Supabase credentials missing" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create a Supabase client
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Get the authorization header and validate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header found");
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the JWT token and verify the user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      console.error("User authentication error:", userError);
      return new Response(
        JSON.stringify({ error: "Invalid or expired authentication token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`User authenticated: ${user.id} (${user.email})`);

    // Parse the request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error("Error parsing request body:", error);
      return new Response(
        JSON.stringify({ error: "Invalid request format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Extract request parameters
    const { priceId, successUrl, cancelUrl, isTestMode } = requestBody;
    
    console.log(`Request parameters: priceId=${priceId}, isTestMode=${isTestMode}`);
    console.log(`Success URL: ${successUrl}`);
    console.log(`Cancel URL: ${cancelUrl}`);

    // Validate priceId
    if (!priceId) {
      console.error("Missing priceId in request body");
      return new Response(
        JSON.stringify({ error: "Missing priceId parameter" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Extract the plan name from the priceId (e.g., "price_growth" -> "growth")
    const planName = priceId.replace('price_', '');
    
    // Verify the plan exists in our config
    if (!productConfig[planName]) {
      console.error(`Unknown plan: ${planName}`);
      return new Response(
        JSON.stringify({ error: `Unknown plan: ${planName}` }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get user metadata to include business name in Stripe
    const { data: userMetadata, error: metadataError } = await supabaseClient
      .from("user_metadata")
      .select("business_name, full_name")
      .eq("id", user.id)
      .single();

    if (metadataError) {
      console.error("Error fetching user metadata:", metadataError);
      // Continue without metadata, not a critical error
    }

    const businessName = userMetadata?.business_name || "Customer";
    const fullName = userMetadata?.full_name || user.email;
    
    console.log(`Business: ${businessName}, User: ${fullName}`);

    // Find an existing Stripe price or create a new one
    let priceToUse;
    try {
      console.log(`Checking for existing price with lookup key: ${priceId}`);
      
      // Look for an existing price with this lookup key
      const existingPrices = await stripe.prices.list({
        lookup_keys: [priceId],
        limit: 1,
        active: true,
      });
      
      if (existingPrices.data.length > 0) {
        // Use the existing price
        priceToUse = existingPrices.data[0].id;
        console.log(`Found existing price: ${priceToUse}`);
      } else {
        console.log(`No existing price found. Creating new product and price for ${planName}`);
        
        // Create a new product
        const product = await stripe.products.create({
          name: productConfig[planName].name,
          description: productConfig[planName].description,
          metadata: {
            features: JSON.stringify(productConfig[planName].features),
            plan_id: planName,
          },
        });
        
        console.log(`Created product: ${product.id}`);
        
        // Create a new price for the product
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: productConfig[planName].price,
          currency: 'gbp',
          recurring: {
            interval: 'month',
          },
          lookup_key: priceId,
          metadata: {
            plan_id: planName,
          },
        });
        
        priceToUse = price.id;
        console.log(`Created price: ${priceToUse}`);
      }
    } catch (error) {
      console.error("Error ensuring Stripe product and price exist:", error);
      return new Response(
        JSON.stringify({ 
          error: "Error creating Stripe product or price", 
          details: error.message 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Find or create a customer in Stripe
    let customerId;
    try {
      // Look for existing customer with this email
      const customerSearch = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (customerSearch.data.length > 0) {
        // Use the existing customer
        customerId = customerSearch.data[0].id;
        console.log(`Found existing customer: ${customerId}`);
        
        // Optionally update the customer with latest info
        await stripe.customers.update(customerId, {
          name: businessName || fullName,
          metadata: {
            user_id: user.id,
            updated_at: new Date().toISOString()
          },
        });
        console.log(`Updated customer information`);
      } else {
        // Create a new customer
        const newCustomer = await stripe.customers.create({
          email: user.email,
          name: businessName || fullName,
          metadata: {
            user_id: user.id,
            created_at: new Date().toISOString()
          },
        });
        customerId = newCustomer.id;
        console.log(`Created new customer: ${customerId}`);
      }
    } catch (error) {
      console.error("Error finding/creating Stripe customer:", error);
      return new Response(
        JSON.stringify({ 
          error: "Error managing customer record", 
          details: error.message 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create the checkout session
    try {
      console.log("Creating checkout session...");
      
      // Prepare URLs with fallbacks
      const successUrlToUse = successUrl || `${req.headers.get("origin")}/checkout-success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrlToUse = cancelUrl || `${req.headers.get("origin")}/checkout?cancelled=true`;
      
      // Create the session with a trial period
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceToUse,
            quantity: 1,
          },
        ],
        mode: "subscription",
        subscription_data: {
          trial_period_days: 7, // 7-day free trial
        },
        success_url: successUrlToUse,
        cancel_url: cancelUrlToUse,
        customer: customerId,
        client_reference_id: user.id,
        currency: 'gbp',
        metadata: {
          user_id: user.id,
          business_name: businessName,
          plan: planName,
          is_test_mode: isTestMode ? "true" : "false"
        },
      });

      console.log(`Checkout session created: ${session.id}`);
      console.log(`Checkout URL: ${session.url}`);
      
      // Return the session details to the client
      return new Response(
        JSON.stringify({
          sessionId: session.id,
          url: session.url,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Error creating checkout session:", error);
      return new Response(
        JSON.stringify({ 
          error: "Error creating checkout session", 
          details: error.message,
          code: error.code || "unknown"
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    // Catch-all error handler
    console.error("Unhandled error in create-checkout function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Unexpected error occurred", 
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
