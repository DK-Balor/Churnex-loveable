
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

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

  // Form validation
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordIsValid = password.length >= 6;
  const passwordsMatch = password === confirmPassword;
  const fullNameIsValid = fullName.length > 0;
  const businessNameIsValid = businessName.length > 0;
  
  const emailError = emailTouched && !emailIsValid ? 'Please enter a valid email address' : null;
  const passwordError = passwordTouched && !passwordIsValid ? 'Password must be at least 6 characters' : null;
  const confirmPasswordError = confirmPasswordTouched && !passwordsMatch ? 'Passwords do not match' : null;
  const fullNameError = fullNameTouched && !fullNameIsValid ? 'Please enter your full name' : null;
  const businessNameError = businessNameTouched && !businessNameIsValid ? 'Please enter your business name' : null;

  const formIsValid = emailIsValid && passwordIsValid && 
    (isLogin || (passwordsMatch && fullNameIsValid && businessNameIsValid));

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
    
    if (!formIsValid) {
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

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm flex items-start">
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-brand-dark-700">
                    Full Name
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      onBlur={() => setFullNameTouched(true)}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        fullNameError ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green sm:text-sm`}
                      placeholder="John Doe"
                    />
                    {fullNameError && (
                      <div className="absolute right-0 top-0 pr-3 pt-2">
                        <X className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {fullNameError && (
                    <p className="mt-1 text-sm text-red-600">{fullNameError}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-brand-dark-700">
                    Business Name
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="businessName"
                      name="businessName"
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      onBlur={() => setBusinessNameTouched(true)}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        businessNameError ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green sm:text-sm`}
                      placeholder="Acme Inc."
                    />
                    {businessNameError && (
                      <div className="absolute right-0 top-0 pr-3 pt-2">
                        <X className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {businessNameError && (
                    <p className="mt-1 text-sm text-red-600">{businessNameError}</p>
                  )}
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-dark-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    emailError ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green sm:text-sm`}
                  placeholder="your.email@example.com"
                />
                {emailError && (
                  <div className="absolute right-0 top-0 pr-3 pt-2">
                    <X className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {emailError && (
                <p className="mt-1 text-sm text-red-600">{emailError}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brand-dark-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setPasswordTouched(true)}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    passwordError ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green sm:text-sm`}
                />
                {passwordError && (
                  <div className="absolute right-0 top-0 pr-3 pt-2">
                    <X className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {passwordError && (
                <p className="mt-1 text-sm text-red-600">{passwordError}</p>
              )}
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-dark-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => setConfirmPasswordTouched(true)}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      confirmPasswordError ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green sm:text-sm`}
                  />
                  {confirmPasswordError && (
                    <div className="absolute right-0 top-0 pr-3 pt-2">
                      <X className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {confirmPasswordError && (
                  <p className="mt-1 text-sm text-red-600">{confirmPasswordError}</p>
                )}
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-brand-green focus:ring-brand-green border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-brand-dark-700">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-brand-green hover:text-brand-green-600">
                    Forgot your password?
                  </a>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading || !formIsValid}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-300 ${
                  isLoading || !formIsValid
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
