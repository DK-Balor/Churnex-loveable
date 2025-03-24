
import { Session } from '@supabase/supabase-js';
import { supabase, SESSION_EXPIRY } from '../integrations/supabase/client';

// Check if the session has expired
export const checkSessionExpiry = (currentSession: Session | null) => {
  if (!currentSession) return false;
  
  // Get the creation time of the session
  const createdAt = new Date(currentSession.created_at).getTime();
  const now = new Date().getTime();
  
  // If more than SESSION_EXPIRY seconds have passed, the session has expired
  return (now - createdAt) / 1000 > SESSION_EXPIRY;
};

// Update user's last activity timestamp
export const updateUserActivity = async (userId: string) => {
  try {
    await supabase
      .from('user_metadata')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', userId);
  } catch (error) {
    console.error('Failed to update user activity:', error);
  }
};

// Track user login
export const trackUserLogin = async (userId: string) => {
  try {
    const { data } = await supabase
      .from('user_metadata')
      .select('login_count')
      .eq('id', userId)
      .single();
    
    const currentCount = data?.login_count || 0;
    
    await supabase
      .from('user_metadata')
      .update({ 
        last_login_at: new Date().toISOString(),
        login_count: currentCount + 1
      })
      .eq('id', userId);
  } catch (error) {
    console.error('Failed to track user login:', error);
  }
};
