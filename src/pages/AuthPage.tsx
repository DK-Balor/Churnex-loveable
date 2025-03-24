
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SignInForm from '../components/auth/SignInForm';
import SignUpForm from '../components/auth/SignUpForm';
import AuthStatusMessage from '../components/auth/AuthStatusMessage';
import { useAuthFormValidation } from '../hooks/useAuthFormValidation';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Form validation states
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [fullNameTouched, setFullNameTouched] = useState(false);
  const [businessNameTouched, setBusinessNameTouched] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

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
    
    // Reset touched states when switching
    setEmailTouched(false);
    setPasswordTouched(false);
    setConfirmPasswordTouched(false);
    setFullNameTouched(false);
    setBusinessNameTouched(false);
  }, [isLogin]);

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

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
        const { error } = await signIn(email, password);
        if (error) throw error;
        
        // Show success message
        setSuccess('Login successful! Redirecting to dashboard...');
        
        // Redirect will happen automatically from AuthContext useEffect
      } else {
        // Handle signup
        if (!fullName || !businessName) {
          throw new Error('Please fill in all fields');
        }
        
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        
        const { error } = await signUp(email, password, fullName, businessName);
        if (error) throw error;
        
        // Show success message
        setSuccess('Account created successfully! You can now log in.');
        
        // Switch to login view after successful signup
        setTimeout(() => {
          setIsLogin(true);
          setSuccess(null);
        }, 2000);
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

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
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
                className="font-medium text-brand-green hover:text-brand-green-600"
              >
                {isLogin ? 'Create one now' : 'Sign in'}
              </button>
            </p>
          </div>

          <AuthStatusMessage error={error} success={success} />

          <form className="space-y-6" onSubmit={handleSubmit}>
            {isLogin ? (
              <SignInForm 
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                emailTouched={emailTouched}
                setEmailTouched={setEmailTouched}
                passwordTouched={passwordTouched}
                setPasswordTouched={setPasswordTouched}
                emailError={validation.emailError}
                passwordError={validation.passwordError}
                rememberMe={rememberMe}
                setRememberMe={setRememberMe}
              />
            ) : (
              <SignUpForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                fullName={fullName}
                setFullName={setFullName}
                businessName={businessName}
                setBusinessName={setBusinessName}
                emailTouched={emailTouched}
                setEmailTouched={setEmailTouched}
                passwordTouched={passwordTouched}
                setPasswordTouched={setPasswordTouched}
                confirmPasswordTouched={confirmPasswordTouched}
                setConfirmPasswordTouched={setConfirmPasswordTouched}
                fullNameTouched={fullNameTouched}
                setFullNameTouched={setFullNameTouched}
                businessNameTouched={businessNameTouched}
                setBusinessNameTouched={setBusinessNameTouched}
                emailError={validation.emailError}
                passwordError={validation.passwordError}
                confirmPasswordError={validation.confirmPasswordError}
                fullNameError={validation.fullNameError}
                businessNameError={validation.businessNameError}
              />
            )}

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
}
