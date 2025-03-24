
import { getStripeClient } from "../_shared/stripeClient.ts";
import { updateUserMetadata } from "./userMetadataService.ts";

// Handle invoice.payment_succeeded event
export const handlePaymentSucceeded = async (invoice: any) => {
  const subscriptionId = invoice.subscription;
  const customerId = invoice.customer;
  
  if (!subscriptionId || !customerId) {
    console.log('Missing subscriptionId or customerId, cannot process payment success');
    return;
  }
  
  try {
    const stripe = getStripeClient();
    
    // Get the customer to find the user ID
    const customer = await stripe.customers.retrieve(customerId);
    const userId = customer.metadata?.user_id;
    
    if (!userId) {
      console.log(`No user ID found in customer metadata for ${customerId}`);
      return;
    }
    
    console.log(`Payment succeeded for user ${userId}, subscription ${subscriptionId}`);
    
    // Update payment status in user metadata
    await updateUserMetadata(userId, {
      last_payment_status: 'succeeded',
      last_payment_date: new Date().toISOString(),
      last_payment_amount: invoice.amount_paid / 100, // Convert from cents to currency unit
      payment_failure_count: 0 // Reset any payment failure count
    });
  } catch (error) {
    console.error(`Error processing payment success for subscription ${subscriptionId}:`, error);
    throw error;
  }
};

// Handle invoice.payment_failed event
export const handlePaymentFailed = async (invoice: any) => {
  const subscriptionId = invoice.subscription;
  const customerId = invoice.customer;
  
  if (!subscriptionId || !customerId) {
    console.log('Missing subscriptionId or customerId, cannot process payment failure');
    return;
  }
  
  try {
    const stripe = getStripeClient();
    const supabaseClient = getSupabaseClient(); 
    
    // Get the customer to find the user ID
    const customer = await stripe.customers.retrieve(customerId);
    const userId = customer.metadata?.user_id;
    
    if (!userId) {
      console.log(`No user ID found in customer metadata for ${customerId}`);
      return;
    }
    
    console.log(`Payment failed for user ${userId}, subscription ${subscriptionId}`);
    
    // Get the current user metadata to update the failure count
    const { data: userData, error: userError } = await supabaseClient
      .from('user_metadata')
      .select('payment_failure_count')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error(`Error fetching current user data for ${userId}:`, userError);
    }
    
    // Calculate the new failure count
    const currentFailures = userData?.payment_failure_count || 0;
    const newFailureCount = currentFailures + 1;
    
    // Update the payment status
    await updateUserMetadata(userId, {
      last_payment_status: 'failed',
      last_payment_failure_date: new Date().toISOString(),
      last_payment_failure_reason: invoice.last_payment_error?.message || 'Unknown reason',
      payment_failure_count: newFailureCount
    });
    
    console.log(`Updated payment failure for user ${userId}, failure count: ${newFailureCount}`);
  } catch (error) {
    console.error(`Error processing payment failure for subscription ${subscriptionId}:`, error);
    throw error;
  }
};
