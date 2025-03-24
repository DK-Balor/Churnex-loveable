
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        // Handle login
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        // Handle signup
        if (!fullName || !businessName) {
          throw new Error('Please fill in all fields');
        }
        
        const { error } = await signUp(email, password, fullName, businessName);
        if (error) throw error;
      }
      
      // The AuthProvider will automatically redirect to dashboard if login/signup is successful
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
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-brand-dark-700">
                    Full Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-brand-dark-700">
                    Business Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="businessName"
                      name="businessName"
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green sm:text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-dark-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brand-dark-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green sm:text-sm"
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
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
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isLoading
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
