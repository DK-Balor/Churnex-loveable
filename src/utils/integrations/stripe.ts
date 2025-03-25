
import { supabase } from '../../integrations/supabase/client';

interface StripeConnectionStatus {
  connected: boolean;
  account_id: string | null;
  last_sync_at: string | null;
  error?: string;
}

export const connectStripeAccount = async (userId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('stripe-connect', {
      body: { userId }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error initiating Stripe connection:', error);
    throw error;
  }
};

export const getStripeConnectionStatus = async (userId: string): Promise<StripeConnectionStatus> => {
  try {
    const { data, error } = await supabase
      .from('stripe_connections')
      .select('account_id, connected, last_sync_at')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      // If no record found, just return not connected
      if (error.code === 'PGRST116') {
        return { connected: false, account_id: null, last_sync_at: null };
      }
      throw error;
    }
    
    return {
      connected: data.connected,
      account_id: data.account_id,
      last_sync_at: data.last_sync_at
    };
  } catch (error) {
    console.error('Error checking Stripe connection:', error);
    return {
      connected: false,
      account_id: null,
      last_sync_at: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const disconnectStripeAccount = async (userId: string, accountId: string) => {
  try {
    const { error } = await supabase.functions.invoke('stripe-disconnect', {
      body: { userId, accountId }
    });
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error disconnecting Stripe account:', error);
    throw error;
  }
};

export const syncStripeData = async (userId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('stripe-sync-data', {
      body: { userId }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error syncing Stripe data:', error);
    throw error;
  }
};
