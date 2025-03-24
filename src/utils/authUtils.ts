
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
    if (!userId) {
      console.warn('Cannot update activity for empty userId');
      return;
    }
    
    const { error } = await supabase
      .from('user_metadata')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', userId);
      
    if (error) {
      console.error('Failed to update user activity:', error.message);
    }
  } catch (error) {
    console.error('Failed to update user activity:', error);
  }
};

// Track user login
export const trackUserLogin = async (userId: string) => {
  try {
    if (!userId) {
      console.warn('Cannot track login for empty userId');
      return;
    }
    
    const { data, error } = await supabase
      .from('user_metadata')
      .select('login_count')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Failed to get user login count:', error.message);
      return;
    }
    
    const currentCount = data?.login_count || 0;
    
    const { error: updateError } = await supabase
      .from('user_metadata')
      .update({ 
        last_login_at: new Date().toISOString(),
        login_count: currentCount + 1
      })
      .eq('id', userId);
      
    if (updateError) {
      console.error('Failed to update login tracking:', updateError.message);
    }
  } catch (error) {
    console.error('Failed to track user login:', error);
  }
};

// New function to check if a user is authenticated and has a valid session
export const isAuthenticated = (session: Session | null) => {
  if (!session) return false;
  if (checkSessionExpiry(session)) return false;
  return true;
};
