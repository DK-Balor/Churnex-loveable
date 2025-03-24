
import { getStripeClient } from "../_shared/stripeClient.ts";
import { productConfig } from "./productConfig.ts";

// Product and price management
export const findOrCreatePrice = async (priceId: string) => {
  const stripe = getStripeClient();
  
  try {
    console.log(`Checking for existing price with lookup key: ${priceId}`);
    
    // Look for an existing price with this lookup key
    const existingPrices = await stripe.prices.list({
      lookup_keys: [priceId],
      limit: 1,
      active: true,
    });
    
    if (existingPrices.data.length > 0) {
      // Use the existing price
      const priceToUse = existingPrices.data[0].id;
      console.log(`Found existing price: ${priceToUse}`);
      return priceToUse;
    }
    
    // Extract the plan name from the priceId (e.g., "price_growth" -> "growth")
    const planName = priceId.replace('price_', '');
    
    // Verify the plan exists in our config
    if (!productConfig[planName]) {
      console.error(`Unknown plan: ${planName}`);
      throw new Error(`Unknown plan: ${planName}`);
    }
    
    console.log(`No existing price found. Creating new product and price for ${planName}`);
    
    // Create a new product
    const product = await stripe.products.create({
      name: productConfig[planName].name,
      description: productConfig[planName].description,
      metadata: {
        features: JSON.stringify(productConfig[planName].features),
        plan_id: planName,
      },
    });
    
    console.log(`Created product: ${product.id}`);
    
    // Create a new price for the product
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
    
    console.log(`Created price: ${price.id}`);
    return price.id;
  } catch (error) {
    console.error("Error ensuring Stripe product and price exist:", error);
    throw new Error(`Error creating Stripe product or price: ${error.message}`);
  }
};
