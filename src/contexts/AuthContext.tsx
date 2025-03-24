
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../components/ui/use-toast';

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
  const { toast } = useToast();

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
            // Get user metadata from auth
            const { data: authUser } = await supabase.auth.getUser();
            const userMetadata = authUser?.user?.user_metadata;
            
            // Create profile with data from auth metadata
            const { data: newProfile, error: createError } = await supabase
              .from('user_metadata')
              .insert([{ 
                id: user.id,
                full_name: userMetadata?.full_name || null,
                business_name: userMetadata?.business_name || null,
                trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7-day trial
              }])
              .select('*')
              .single();

            if (createError) {
              console.error('Error creating user profile:', createError);
              toast({
                title: "Error",
                description: "Failed to create user profile. Please refresh the page or contact support.",
                variant: "destructive",
              });
            } else {
              setProfile(newProfile);
              toast({
                title: "Profile created",
                description: "Your account has been set up successfully.",
              });
            }
          } else {
            console.error('Error fetching user profile:', error);
            toast({
              title: "Error",
              description: "Failed to load your profile. Please refresh the page.",
              variant: "destructive",
            });
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
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        if (event === 'SIGNED_IN') {
          toast({
            title: "Welcome back!",
            description: `You're now signed in as ${session?.user?.email}`,
          });
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Signed out",
            description: "You have been signed out successfully.",
          });
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Existing session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in user:', email);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Sign in error:', error);
        toast({
          title: "Authentication failed",
          description: error.message,
          variant: "destructive",
        });
      }
      
      return { error };
    } catch (error) {
      console.error('Sign in exception:', error);
      toast({
        title: "Authentication error",
        description: "An unexpected error occurred during sign in.",
        variant: "destructive",
      });
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, businessName: string) => {
    try {
      console.log('Signing up user:', email);
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

      if (response.error) {
        console.error('Sign up error:', response.error);
        toast({
          title: "Signup failed",
          description: response.error.message,
          variant: "destructive",
        });
      } else if (response.data.user) {
        console.log('User created:', response.data.user.id);
        // Create the user profile
        await supabase.from('user_metadata').insert([{
          id: response.data.user.id,
          full_name: fullName,
          business_name: businessName,
          trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7-day trial
        }]);
        
        toast({
          title: "Account created",
          description: "Your account has been created successfully!",
        });
      }

      return { error: response.error, data: response.data };
    } catch (error) {
      console.error('Sign up exception:', error);
      toast({
        title: "Signup error",
        description: "An unexpected error occurred during sign up.",
        variant: "destructive",
      });
      return { error: error as Error, data: null };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error signing out",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to update your profile.",
        variant: "destructive",
      });
      return { error: new Error('User not authenticated'), data: null };
    }

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
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      return { error: null, data };
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
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
