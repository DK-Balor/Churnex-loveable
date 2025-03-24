
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "https://esm.sh/stripe@12.5.0";

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
    console.log("Starting checkout session creation process");
    
    // Initialize Stripe with your secret key
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("Stripe secret key not found in environment variables");
      throw new Error("Stripe configuration error");
    }
    
    const stripe = new Stripe(stripeSecretKey);
    console.log("Stripe initialized with API key");
    
    // Get Supabase configuration
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase configuration missing");
      throw new Error("Supabase configuration error");
    }

    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Get the authorization header from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header found");
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get user information from the JWT token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      console.error("User auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Invalid user token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("User authenticated:", user.id);

    // Get the request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error("Error parsing request body:", error);
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { priceId, successUrl, cancelUrl, isTestMode } = requestBody;
    console.log(`Received checkout request for priceId: ${priceId}, isTestMode: ${isTestMode}`);

    // Make sure we have a valid priceId format
    if (!priceId) {
      console.error("Missing priceId parameter");
      return new Response(
        JSON.stringify({ error: "Missing priceId parameter" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Define product info
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

    // Ensure products and prices exist in Stripe
    try {
      console.log("Ensuring products and prices exist...");
      
      // Check if price already exists
      console.log(`Checking if price with lookup key ${priceId} exists...`);
      const existingPrices = await stripe.prices.list({
        lookup_keys: [priceId],
        limit: 1,
        active: true,
      });
      
      let priceToUse;
      
      if (existingPrices.data.length > 0) {
        console.log(`Price with lookup key ${priceId} already exists, using it`);
        priceToUse = existingPrices.data[0].id;
      } else {
        console.log(`Creating product for ${planName} plan...`);
        // Create product
        const product = await stripe.products.create({
          name: productConfig[planName].name,
          description: productConfig[planName].description,
          metadata: {
            features: JSON.stringify(productConfig[planName].features),
            plan_id: planName,
          },
        });
        
        // Create price
        console.log(`Creating price for ${planName} plan with lookup key ${priceId}...`);
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
        console.log(`Successfully created product and price for ${planName} plan`);
      }

      // Get user metadata to include their business name in Stripe
      const { data: userMetadata, error: metadataError } = await supabaseClient
        .from("user_metadata")
        .select("*")
        .eq("id", user.id)
        .single();

      if (metadataError) {
        console.error("Error fetching user metadata:", metadataError);
      }

      const businessName = userMetadata?.business_name || "Customer";

      // Look for existing customer
      let customerId;
      const customerSearch = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (customerSearch.data.length > 0) {
        customerId = customerSearch.data[0].id;
        console.log(`Found existing customer: ${customerId}`);
      } else {
        // Create a new customer if one doesn't exist
        const newCustomer = await stripe.customers.create({
          email: user.email,
          name: businessName,
          metadata: {
            user_id: user.id,
          },
        });
        customerId = newCustomer.id;
        console.log(`Created new customer: ${customerId}`);
      }

      // Create a Stripe checkout session with a trial period
      console.log("Creating checkout session...");
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
          trial_period_days: 7, // Add a 7-day free trial
        },
        success_url: successUrl || `${req.headers.get("origin")}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${req.headers.get("origin")}/checkout?cancelled=true`,
        customer: customerId,
        client_reference_id: user.id,
        currency: 'gbp', // Set currency to GBP
        metadata: {
          user_id: user.id,
          business_name: businessName,
          is_test_mode: isTestMode ? "true" : "false"
        },
      });

      console.log(`Checkout session created successfully: ${session.id}`);
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
      console.error("Error ensuring products and prices:", error);
      // Provide detailed error for debugging
      return new Response(
        JSON.stringify({ 
          error: error.message || "Unknown error occurred during Stripe product setup",
          details: error.stack,
          statusCode: 500
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error in create-checkout function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Unknown error occurred",
        details: error.stack,
        statusCode: 500
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
