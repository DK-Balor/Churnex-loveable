
import { handleCheckoutCompleted } from "./checkoutHandler.ts";
import { handlePaymentSucceeded, handlePaymentFailed } from "./paymentHandler.ts";
import { 
  handleSubscriptionUpdated, 
  handleSubscriptionDeleted, 
  handleTrialWillEnd 
} from "./subscriptionHandler.ts";

// Main event handler for different Stripe event types
export const handleStripeEvent = async (event: any) => {
  console.log(`Received webhook event: ${event.type} (id: ${event.id})`);
  
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
  
      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object);
        break;
  
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return { success: true, event: event.type };
  } catch (error) {
    console.error(`Error handling event ${event.type}:`, error);
    throw error;
  }
};
