
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { createErrorResponse } from "../_shared/error.ts";
import { verifyStripeSignature } from "../_shared/stripeClient.ts";
import { handleStripeEvent } from "./eventHandler.ts";

// Main Deno request handler
serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

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
      return createErrorResponse(err.message, null, 400);
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
    
    return createErrorResponse(
      "Webhook processing error", 
      error.message, 
      500
    );
  }
});
