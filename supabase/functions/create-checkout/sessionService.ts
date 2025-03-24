
import { getStripeClient } from "../_shared/stripeClient.ts";

// Checkout session creation
export const createCheckoutSession = async (
  customerId: string, 
  priceToUse: string, 
  userId: string, 
  businessName: string, 
  planName: string, 
  successUrl: string, 
  cancelUrl: string, 
  isTestMode: boolean
) => {
  const stripe = getStripeClient();
  
  try {
    console.log("Creating checkout session...");
    
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
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer: customerId,
      client_reference_id: userId,
      currency: 'gbp',
      metadata: {
        user_id: userId,
        business_name: businessName,
        plan: planName,
        is_test_mode: isTestMode ? "true" : "false"
      },
    });

    console.log(`Checkout session created: ${session.id}`);
    console.log(`Checkout URL: ${session.url}`);
    
    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw new Error(`Error creating checkout session: ${error.message}`);
  }
};
