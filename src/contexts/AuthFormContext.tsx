
import React, { createContext, useContext, useState } from 'react';

interface AuthFormState {
  isLogin: boolean;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  businessName: string;
  rememberMe: boolean;
  emailTouched: boolean;
  passwordTouched: boolean;
  confirmPasswordTouched: boolean;
  fullNameTouched: boolean;
  businessNameTouched: boolean;
  error: string | null;
  success: string | null;
  isLoading: boolean;
}

interface AuthFormActions {
  setIsLogin: (isLogin: boolean) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setConfirmPassword: (confirmPassword: string) => void;
  setFullName: (fullName: string) => void;
  setBusinessName: (businessName: string) => void;
  setRememberMe: (rememberMe: boolean) => void;
  setEmailTouched: (touched: boolean) => void;
  setPasswordTouched: (touched: boolean) => void;
  setConfirmPasswordTouched: (touched: boolean) => void;
  setFullNameTouched: (touched: boolean) => void;
  setBusinessNameTouched: (touched: boolean) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  resetTouchedStates: () => void;
}

const AuthFormContext = createContext<
  { state: AuthFormState; actions: AuthFormActions } | undefined
>(undefined);

export const AuthFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [fullNameTouched, setFullNameTouched] = useState(false);
  const [businessNameTouched, setBusinessNameTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetTouchedStates = () => {
    setEmailTouched(false);
    setPasswordTouched(false);
    setConfirmPasswordTouched(false);
    setFullNameTouched(false);
    setBusinessNameTouched(false);
  };

  const state: AuthFormState = {
    isLogin,
    email,
    password,
    confirmPassword,
    fullName,
    businessName,
    rememberMe,
    emailTouched,
    passwordTouched,
    confirmPasswordTouched,
    fullNameTouched,
    businessNameTouched,
    error,
    success,
    isLoading,
  };

  const actions: AuthFormActions = {
    setIsLogin,
    setEmail,
    setPassword,
    setConfirmPassword,
    setFullName,
    setBusinessName,
    setRememberMe,
    setEmailTouched,
    setPasswordTouched,
    setConfirmPasswordTouched,
    setFullNameTouched,
    setBusinessNameTouched,
    setError,
    setSuccess,
    setIsLoading,
    resetTouchedStates,
  };

  return (
    <AuthFormContext.Provider value={{ state, actions }}>
      {children}
    </AuthFormContext.Provider>
  );
};

export const useAuthForm = () => {
  const context = useContext(AuthFormContext);
  if (!context) {
    throw new Error('useAuthForm must be used within an AuthFormProvider');
  }
  return context;
};
