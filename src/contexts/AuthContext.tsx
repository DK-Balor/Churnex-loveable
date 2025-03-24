
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

type UserProfile = {
  id: string;
  full_name: string | null;
  business_name: string | null;
  subscription_plan: string | null;
  trial_ends_at: string | null;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isProfileLoading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
  }>;
  signUp: (email: string, password: string, fullName: string, businessName: string) => Promise<{
    error: Error | null;
    data: any;
  }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{
    error: Error | null;
    data: UserProfile | null;
  }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setIsProfileLoading(false);
        return;
      }

      try {
        setIsProfileLoading(true);
        const { data, error } = await supabase
          .from('user_metadata')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          // If the profile doesn't exist, create a new one
          if (error.code === 'PGRST116') {
            const { data: newProfile, error: createError } = await supabase
              .from('user_metadata')
              .insert([{ id: user.id }])
              .select('*')
              .single();

            if (createError) {
              console.error('Error creating user profile:', createError);
            } else {
              setProfile(newProfile);
            }
          } else {
            console.error('Error fetching user profile:', error);
          }
        } else {
          setProfile(data);
        }
      } catch (err) {
        console.error('Error in profile fetch:', err);
      } finally {
        setIsProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, businessName: string) => {
    try {
      const response = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName,
            business_name: businessName
          }
        }
      });

      if (response.data.user) {
        // Create the user profile
        await supabase.from('user_metadata').insert([{
          id: response.data.user.id,
          full_name: fullName,
          business_name: businessName,
          trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7-day trial
        }]);
      }

      return { error: response.error, data: response.data };
    } catch (error) {
      return { error: error as Error, data: null };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('User not authenticated'), data: null };

    try {
      const { data, error } = await supabase
        .from('user_metadata')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
      return { error: null, data };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error: error as Error, data: null };
    }
  };

  const value = {
    user,
    session,
    profile,
    isLoading,
    isProfileLoading,
    signIn,
    signUp,
    signOut,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
