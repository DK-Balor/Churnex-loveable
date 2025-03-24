
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
    debug: true, // Enable this to see detailed auth logs
    // Use the fixed site URL for redirects without any query parameters
    redirectTo: `${SITE_URL}/auth`
  }
});

// Helper function to sign up a user directly without verification
export const signUpUser = async (email: string, password: string, fullName: string, businessName: string) => {
  try {
    console.log('Signing up user directly:', email);
    
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: fullName,
          business_name: businessName
        },
        // Set session expiry to 24 hours
        expiresIn: SESSION_EXPIRY
      }
    });
    
    if (error) {
      console.error('Sign up error:', error);
      return { error };
    }
    
    // Create the user profile if signup was successful
    if (data.user) {
      console.log('User created:', data.user.id);
      
      // Create the user profile
      await supabase.from('user_metadata').insert([{
        id: data.user.id,
        full_name: fullName,
        business_name: businessName,
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7-day trial
        last_login_at: new Date().toISOString(),
        login_count: 1
      }]);
    }
    
    return { error: null, data };
  } catch (error) {
    console.error('Sign up exception:', error);
    return { error: error as Error };
  }
};
