
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

    // Get the request body
    const { userId } = await req.json();

    // Get the user's Stripe subscription ID
    const { data: userMetadata, error: metadataError } = await supabaseClient
      .from("user_metadata")
      .select("stripe_subscription_id")
      .eq("id", userId)
      .single();

    if (metadataError || !userMetadata?.stripe_subscription_id) {
      throw new Error("Subscription not found");
    }

    // Cancel the subscription at the end of the billing period
    await stripe.subscriptions.update(userMetadata.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    // Update the user's metadata to reflect the future cancellation
    await supabaseClient
      .from("user_metadata")
      .update({
        subscription_cancel_at_period_end: true,
      })
      .eq("id", userId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Subscription will be canceled at the end of the billing period",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in cancel-subscription function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
