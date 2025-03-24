
import Stripe from "https://esm.sh/stripe@12.5.0";

// Initialize Stripe client
export const getStripeClient = () => {
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeSecretKey) {
    throw new Error("Stripe configuration error - Missing API key");
  }
  
  return new Stripe(stripeSecretKey);
};

// Verify Stripe webhook signature
export const verifyStripeSignature = (body: string, signature: string | null) => {
  const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
  if (!signature) {
    console.error("Webhook signature missing");
    throw new Error("Webhook signature missing");
  }

  try {
    const stripe = getStripeClient();
    return stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    throw new Error(`Webhook Error: ${err.message}`);
  }
};
