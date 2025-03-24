import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://atobskmygodtszvfmtww.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0b2Jza215Z29kdHN6dmZtdHd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MjcwODMsImV4cCI6MjA1ODQwMzA4M30.y7Z4DYunMGOba6AgbSrYY6j_SqOrm1XRIAfTSmcw6EY';

// Session expiry in seconds (24 hours)
export const SESSION_EXPIRY = 24 * 60 * 60;

// Fixed production URL for redirects
const SITE_URL = 'https://churnex.lovable.app';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
    flowType: 'pkce',
    debug: false, // Disable debug logs in production
    // Use the fixed site URL for redirects without any query parameters
    redirectTo: `${SITE_URL}/auth`
  }
});

// Helper function to sign up a user directly without verification
export const signUpUser = async (email: string, password: string, fullName: string, businessName: string) => {
  try {
    console.log('Signing up user directly:', email);
    
    // First check if user exists already
    const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (existingUser?.user) {
      console.log('User already exists, signing in directly');
      // User already exists, so just return the session
      return { error: null, data: existingUser };
    }
    
    if (checkError && checkError.message !== 'Invalid login credentials') {
      console.error('Error checking existing user:', checkError);
      return { error: checkError };
    }
    
    // Create new user without email confirmation
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: fullName,
          business_name: businessName
        },
        // Set session expiry to 24 hours
        expiresIn: SESSION_EXPIRY,
        emailRedirectTo: `${SITE_URL}/dashboard`,
      }
    });
    
    if (error) {
      console.error('Sign up error:', error);
      return { error };
    }
    
    // If we get here but don't have a user, something went wrong
    if (!data.user) {
      console.error('No user returned from signup');
      return { error: new Error('No user returned from signup') };
    }
    
    console.log('User created:', data.user.id);
    
    // Set account expiry to 30 days from now
    const accountExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    // Create the user profile
    await supabase.from('user_metadata').insert([{
      id: data.user.id,
      full_name: fullName,
      business_name: businessName,
      trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7-day trial
      last_login_at: new Date().toISOString(),
      login_count: 1,
      account_type: 'demo', // Start as demo account
      account_created_at: new Date().toISOString(),
      account_expires_at: accountExpiresAt.toISOString() // Expires after 30 days
    }]);
    
    // Explicitly sign in immediately after signup to ensure we have a session
    if (!data.session) {
      console.log('No session after signup, signing in explicitly');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) {
        console.error('Error signing in after signup:', signInError);
        return { error: signInError };
      }
      
      // Return the sign-in data with session
      return { error: null, data: signInData };
    }
    
    return { error: null, data };
  } catch (error) {
    console.error('Sign up exception:', error);
    return { error: error as Error };
  }
};
