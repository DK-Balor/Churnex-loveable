
import React, { createContext, useContext } from 'react';
import { useToast } from '../components/ui/use-toast';
import { AuthContextType } from '../types/auth';
import { useAuthProvider } from '../hooks/useAuthProvider';
import { signIn as authSignIn, signUp as authSignUp, signOut as authSignOut } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session, profile, isLoading, isProfileLoading, updateProfile } = useAuthProvider();
  const { toast } = useToast();

  const signIn = async (email: string, password: string) => {
    return authSignIn(email, password, toast);
  };

  const signUp = async (email: string, password: string, fullName: string, businessName: string) => {
    return authSignUp(email, password, fullName, businessName, toast);
  };

  const signOut = async () => {
    return authSignOut(toast);
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
