
import { supabase, signUpUser } from '../integrations/supabase/client';
import { ToastProps } from '../components/ui/use-toast';
import { trackUserLogin } from '../utils/authUtils';

type ToastFunction = (props: ToastProps) => void;

export const signIn = async (
  email: string, 
  password: string, 
  toast: ToastFunction
) => {
  try {
    console.log('Signing in user:', email);
    const { error, data } = await supabase.auth.signInWithPassword({ 
      email, 
      password,
      options: {
        // Set session expiry to 24 hours
        expiresIn: 24 * 60 * 60
      }
    });
    
    if (error) {
      console.error('Sign in error:', error);
      toast({
        title: "Authentication failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Only show a single welcome toast
      toast({
        title: "Welcome back!",
        description: `You're now signed in as ${email}`,
      });
    }
    
    return { error, data };
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

export const signUp = async (
  email: string, 
  password: string, 
  fullName: string, 
  businessName: string,
  toast: ToastFunction
) => {
  try {
    console.log('Signing up user directly:', email);
    
    // Use the new signUpUser function that doesn't require email verification
    const { error, data } = await signUpUser(email, password, fullName, businessName);

    if (error) {
      console.error('Sign up error:', error);
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
      return { error, data: null };
    } 
    
    console.log('Signup successful, user should be logged in automatically');
    // Show only one toast for account creation
    toast({
      title: "Account created",
      description: "Your account has been created and you are now logged in.",
    });

    return { error: null, data };
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

export const signOut = async (toast: ToastFunction) => {
  try {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  } catch (error) {
    console.error('Sign out error:', error);
    toast({
      title: "Error signing out",
      description: "Failed to sign out. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
};
