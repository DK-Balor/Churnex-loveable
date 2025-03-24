
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { createErrorResponse } from "../_shared/error.ts";
import { getSupabaseClient } from "../_shared/supabaseClient.ts";
import { findOrCreateCustomer } from "./customerService.ts";
import { findOrCreatePrice } from "./priceService.ts";
import { createCheckoutSession } from "./sessionService.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    console.log("Starting checkout session creation process");
    
    // Create a Supabase client
    let supabaseClient;
    try {
      supabaseClient = getSupabaseClient();
    } catch (error) {
      return createErrorResponse(error.message, null, 500);
    }

    // Get the authorization header and validate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return createErrorResponse("Authentication required", null, 401);
    }

    // Get the JWT token and verify the user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return createErrorResponse(
        "Invalid or expired authentication token", 
        userError?.message, 
        401
      );
    }

    console.log(`User authenticated: ${user.id} (${user.email})`);

    // Parse the request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      return createErrorResponse("Invalid request format", error.message, 400);
    }

    // Extract request parameters
    const { priceId, successUrl, cancelUrl, isTestMode } = requestBody;
    
    console.log(`Request parameters: priceId=${priceId}, isTestMode=${isTestMode}`);
    console.log(`Success URL: ${successUrl}`);
    console.log(`Cancel URL: ${cancelUrl}`);

    // Validate priceId
    if (!priceId) {
      return createErrorResponse("Missing priceId parameter", null, 400);
    }

    // Extract the plan name from the priceId (e.g., "price_growth" -> "growth")
    const planName = priceId.replace('price_', '');

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

    try {
      // Find or create a price
      const priceToUse = await findOrCreatePrice(priceId);
      
      // Find or create a customer
      const customerId = await findOrCreateCustomer(user.email, user.id, businessName, fullName);
      
      // Create the checkout session
      const successUrlToUse = successUrl || `${req.headers.get("origin")}/checkout-success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrlToUse = cancelUrl || `${req.headers.get("origin")}/checkout?cancelled=true`;
      
      const session = await createCheckoutSession(
        customerId,
        priceToUse,
        user.id,
        businessName,
        planName,
        successUrlToUse,
        cancelUrlToUse,
        isTestMode
      );
      
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
      return createErrorResponse(
        "Error creating checkout session", 
        error.message, 
        500, 
        error.code
      );
    }
  } catch (error) {
    // Catch-all error handler
    return createErrorResponse(
      "Unexpected error occurred", 
      error.message, 
      500
    );
  }
});
