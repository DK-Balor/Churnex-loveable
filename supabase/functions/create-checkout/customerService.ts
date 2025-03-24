
import { getStripeClient } from "../_shared/stripeClient.ts";

// Customer management functions
export const findOrCreateCustomer = async (email: string, userId: string, businessName?: string, fullName?: string) => {
  const stripe = getStripeClient();
  
  try {
    // Look for existing customer with this email
    const customerSearch = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (customerSearch.data.length > 0) {
      // Use the existing customer
      const customerId = customerSearch.data[0].id;
      console.log(`Found existing customer: ${customerId}`);
      
      // Optionally update the customer with latest info
      await stripe.customers.update(customerId, {
        name: businessName || fullName,
        metadata: {
          user_id: userId,
          updated_at: new Date().toISOString()
        },
      });
      console.log(`Updated customer information`);
      
      return customerId;
    } else {
      // Create a new customer
      const newCustomer = await stripe.customers.create({
        email,
        name: businessName || fullName,
        metadata: {
          user_id: userId,
          created_at: new Date().toISOString()
        },
      });
      console.log(`Created new customer: ${newCustomer.id}`);
      return newCustomer.id;
    }
  } catch (error) {
    console.error("Error finding/creating Stripe customer:", error);
    throw new Error(`Error managing customer record: ${error.message}`);
  }
};
