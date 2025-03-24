
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "https://esm.sh/stripe@12.5.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "");
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

// Function to ensure products and prices exist
async function ensureProductsAndPrices() {
  console.log("Ensuring products and prices exist...");
  
  try {
    // For each product config
    for (const [planId, config] of Object.entries(productConfig)) {
      // Define the lookup key for the price
      const priceId = `price_${planId}`;
      
      // Check if price already exists
      const existingPrices = await stripe.prices.list({
        lookup_keys: [priceId],
        limit: 1,
      });
      
      if (existingPrices.data.length > 0) {
        console.log(`Price ${priceId} already exists, skipping creation`);
        continue;
      }
      
      // Create product
      console.log(`Creating product for ${planId} plan...`);
      const product = await stripe.products.create({
        name: config.name,
        description: config.description,
        metadata: {
          features: JSON.stringify(config.features),
        },
      });
      
      // Create price
      console.log(`Creating price for ${planId} plan...`);
      await stripe.prices.create({
        product: product.id,
        unit_amount: config.price,
        currency: 'gbp',
        recurring: {
          interval: 'month',
        },
        lookup_key: priceId,
        metadata: {
          plan_id: planId,
        },
      });
      
      console.log(`Successfully created product and price for ${planId} plan`);
    }
    
    return true;
  } catch (error) {
    console.error("Error ensuring products and prices:", error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Get the authorization header from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Get user information from the JWT token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Invalid user token");
    }

    // Get the request body
    const { priceId, successUrl, cancelUrl } = await req.json();
    
    console.log(`Received checkout request for priceId: ${priceId}`);

    // Make sure we have a valid priceId format
    if (!priceId) {
      throw new Error("Missing priceId parameter");
    }

    // Ensure all products and prices exist in Stripe
    await ensureProductsAndPrices();
    
    // Extract the plan name from the priceId (e.g., "price_growth" -> "growth")
    const planName = priceId.replace('price_', '');
    
    // Verify the plan exists in our config
    if (!productConfig[planName]) {
      throw new Error(`Unknown plan: ${planName}`);
    }

    // Look up the price in Stripe using the lookup_key
    const prices = await stripe.prices.list({
      lookup_keys: [priceId],
      active: true,
      limit: 1,
    });

    if (prices.data.length === 0) {
      throw new Error(`Price not found for lookup key: ${priceId}`);
    }

    const price = prices.data[0];
    console.log(`Found price: ${price.id} for lookup key: ${priceId}`);

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
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 7, // Add a 7-day free trial
      },
      success_url: successUrl || `${req.headers.get("origin")}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/checkout?cancelled=true`, // UK spelling
      customer: customerId,
      client_reference_id: user.id,
      currency: 'gbp', // Set currency to GBP
      metadata: {
        user_id: user.id,
        business_name: businessName
      },
    });

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
    console.error("Error in create-checkout function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
