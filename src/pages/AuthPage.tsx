import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthFormProvider, useAuthForm } from '../contexts/AuthFormContext';
import SignInForm from '../components/auth/SignInForm';
import SignUpForm from '../components/auth/SignUpForm';
import AuthStatusMessage from '../components/auth/AuthStatusMessage';
import { useAuthFormValidation } from '../hooks/useAuthFormValidation';
import { useToast } from '../components/ui/use-toast';
import { MailCheck } from 'lucide-react';
import VerificationCodeInput from '../components/auth/VerificationCodeInput';
import { supabase, sendVerificationEmail } from '../integrations/supabase/client';

const AuthFormContent = () => {
  const { state, actions } = useAuthForm();
  const { 
    isLogin, 
    email, 
    password,
    confirmPassword,
    fullName, 
    businessName,
    emailTouched,
    passwordTouched,
    confirmPasswordTouched,
    fullNameTouched,
    businessNameTouched,
    isLoading
  } = state;
  
  const { 
    setIsLogin, 
    setError, 
    setSuccess, 
    setIsLoading,
    resetTouchedStates,
    setEmailTouched,
    setPasswordTouched,
    setConfirmPasswordTouched,
    setFullNameTouched,
    setBusinessNameTouched
  } = actions;

  const { signIn, signUp, signOut, user, emailConfirmed, verifyEmail, setEmailConfirmed } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [showVerificationCodeInput, setShowVerificationCodeInput] = useState(false);
  const [resendingCode, setResendingCode] = useState(false);

  // Check for verification parameters in the URL
  useEffect(() => {
    const code = searchParams.get('code');
    
    // Handle link-based verification
    if (code) {
      console.log('Detected verification code in URL:', code);
      
      // Process the verification code automatically
      const processVerificationCode = async () => {
        setIsLoading(true);
        try {
          // The auth.exchangeCodeForSession method handles the code parameter
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('Code verification failed:', error);
            setError(`Verification failed: ${error.message}`);
          } else {
            console.log('Code verification succeeded:', data);
            setEmailConfirmed(true);
            setSuccess('Email verified successfully! You can now sign in.');
            
            // If user is already authenticated after verification, redirect to dashboard
            if (data?.session?.user) {
              setTimeout(() => navigate('/dashboard'), 1500);
            }
          }
        } catch (err: any) {
          console.error('Error processing verification code:', err);
          setError(`Verification error: ${err.message}`);
        } finally {
          setIsLoading(false);
        }
      };
      
      processVerificationCode();
    }
  }, [searchParams, setEmailConfirmed, navigate, setError, setSuccess, setIsLoading]);

  // Use our validation hook
  const validation = useAuthFormValidation(
    isLogin,
    email,
    password,
    confirmPassword,
    fullName,
    businessName,
    emailTouched,
    passwordTouched,
    confirmPasswordTouched,
    fullNameTouched,
    businessNameTouched
  );

  useEffect(() => {
    // Clear error when switching between login and signup
    setError(null);
    setSuccess(null);
    resetTouchedStates();
    setShowVerificationCodeInput(false);
  }, [isLogin]);

  useEffect(() => {
    // If user is already logged in and email is verified, redirect to dashboard
    if (user && emailConfirmed) {
      navigate('/dashboard');
    }
  }, [user, emailConfirmed, navigate]);

  const handleResendCode = async () => {
    if (!email) {
      setError('Please enter your email address to resend verification email');
      return;
    }
    
    setResendingCode(true);
    try {
      console.log('AuthPage: Resending verification email to:', email);
      // Use our helper function for more reliable email sending
      const { error } = await sendVerificationEmail(email);
      
      if (error) {
        console.error('AuthPage: Failed to resend email:', error);
        setError(`Failed to resend verification email: ${error.message}`);
      } else {
        console.log('AuthPage: Verification email sent successfully');
        toast({
          title: "Verification email sent",
          description: `A verification link has been sent to ${email}. Please check your inbox and click the link to verify your email.`,
        });
      }
    } catch (err: any) {
      console.error('AuthPage: Error resending email:', err);
      setError(`An error occurred: ${err.message}`);
    } finally {
      setResendingCode(false);
    }
  };

  const handleVerificationSuccess = () => {
    setEmailConfirmed(true);
    setSuccess('Email verified successfully! Redirecting to dashboard...');
    // The useEffect will handle the redirect to dashboard
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Force validation on all fields
    setEmailTouched(true);
    setPasswordTouched(true);
    if (!isLogin) {
      setConfirmPasswordTouched(true);
      setFullNameTouched(true);
      setBusinessNameTouched(true);
    }
    
    if (!validation.formIsValid) {
      return;
    }
    
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        // Handle login
        const { error, emailVerificationNeeded } = await signIn(email, password);
        
        if (error && !emailVerificationNeeded) {
          throw error;
        }
        
        // If emailVerificationNeeded, explain that they need to verify email
        if (emailVerificationNeeded) {
          console.log("Email verification needed");
          setSuccess('Please verify your email address using the verification link we sent you.');
          await handleResendCode();
        } else if (!error) {
          // Only show success message if email is verified
          setSuccess('Login successful! Redirecting to dashboard...');
        }
      } else {
        // Handle signup
        if (!fullName || !businessName) {
          throw new Error('Please fill in all fields');
        }
        
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        
        console.log('Starting signup process for:', email);
        const { error } = await signUp(email, password, fullName, businessName);
        if (error) throw error;
        
        // Show success message after successful signup
        setSuccess('Account created successfully! Please check your email for a verification link.');
        
        // We don't need to call handleResendCode since signUp now automatically sends a verification email
        console.log('Signup successful, verification email should be sent');
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  // Show email verification UI if user exists but email is not confirmed
  if (user && !emailConfirmed) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
        <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
          <Link to="/" className="flex justify-center">
            <h1 className="text-3xl font-bold text-brand-dark-800">
              Churnex<span className="text-sm align-top">™</span>
            </h1>
          </Link>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-full bg-brand-green-100 flex items-center justify-center">
                  <MailCheck className="h-6 w-6 text-brand-green" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-brand-dark-900">Verify your email</h2>
              <p className="mt-2 text-sm text-brand-dark-500">
                We've sent a verification link to <span className="font-medium">{user.email}</span>.
                Please check your inbox and click the link to verify your account.
              </p>
            </div>
            
            <AuthStatusMessage />
            
            <div className="mt-6">
              <button
                onClick={handleResendCode}
                disabled={resendingCode}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-green hover:bg-brand-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green ${
                  resendingCode ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {resendingCode ? 'Sending...' : 'Resend verification link'}
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <button 
                onClick={() => signOut()} 
                className="text-sm text-brand-dark-500 hover:text-brand-dark-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Show the normal authentication form
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
        <Link to="/" className="flex justify-center">
          <h1 className="text-3xl font-bold text-brand-dark-800">
            Churnex<span className="text-sm align-top">™</span>
          </h1>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-center text-brand-dark-900">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </h2>
            <p className="mt-2 text-center text-sm text-brand-dark-500">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-medium text-brand-green hover:text-brand-green-600"
              >
                {isLogin ? 'Create one now' : 'Sign in'}
              </button>
            </p>
          </div>

          <AuthStatusMessage />

          <form className="space-y-6" onSubmit={handleSubmit}>
            {isLogin ? <SignInForm /> : <SignUpForm />}

            <div>
              <button
                type="submit"
                disabled={isLoading || !validation.formIsValid}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-300 ${
                  isLoading || !validation.formIsValid
                    ? 'bg-brand-green-300 cursor-not-allowed'
                    : 'bg-brand-green hover:bg-brand-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green'
                }`}
              >
                {isLoading
                  ? 'Processing...'
                  : isLogin
                  ? 'Sign in'
                  : 'Create account'}
              </button>
            </div>
          </form>

          {!isLogin && (
            <div className="mt-6">
              <p className="text-xs text-center text-brand-dark-500">
                By creating an account, you agree to our{' '}
                <a href="#" className="font-medium text-brand-green hover:text-brand-green-600">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="font-medium text-brand-green hover:text-brand-green-600">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AuthPage() {
  return (
    <AuthFormProvider>
      <AuthFormContent />
    </AuthFormProvider>
  );
}
