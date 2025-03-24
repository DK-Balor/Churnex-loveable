
import { getSupabaseClient } from "../_shared/supabaseClient.ts";

// Helper to update user metadata
export const updateUserMetadata = async (userId: string, data: Record<string, any>) => {
  console.log(`Updating user metadata for ${userId}:`, data);
  
  try {
    const supabaseClient = getSupabaseClient();
    const { error } = await supabaseClient
      .from('user_metadata')
      .update(data)
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating user metadata:', error);
      throw error;
    }
    
    console.log(`User metadata updated successfully for ${userId}`);
    return { success: true };
  } catch (error) {
    console.error(`Failed to update user metadata for ${userId}:`, error);
    throw error;
  }
};

// Helper to find user by Stripe customer ID
export const findUserByStripeCustomerId = async (stripeCustomerId: string) => {
  try {
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('user_metadata')
      .select('id')
      .eq('stripe_customer_id', stripeCustomerId)
      .single();
    
    if (error || !data) {
      console.error(`Error finding user with customer ID ${stripeCustomerId}:`, error);
      throw error;
    }
    
    return data.id;
  } catch (error) {
    console.error(`Error finding user with customer ID ${stripeCustomerId}:`, error);
    throw error;
  }
};
