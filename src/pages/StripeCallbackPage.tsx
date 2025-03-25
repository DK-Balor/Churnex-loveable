
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';

export default function StripeCallbackPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing your Stripe connection...');

  useEffect(() => {
    if (!user) {
      // If not authenticated, redirect to login
      navigate('/auth', { replace: true });
      return;
    }

    const handleStripeCallback = async () => {
      try {
        // Parse query params
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        
        if (error) {
          setStatus('error');
          setMessage(`Connection failed: ${error}`);
          setTimeout(() => navigate('/integrations', { replace: true }), 3000);
          return;
        }
        
        if (!code || !state) {
          setStatus('error');
          setMessage('Invalid callback parameters');
          setTimeout(() => navigate('/integrations', { replace: true }), 3000);
          return;
        }
        
        // Verify that the state matches the user ID
        if (state !== user.id) {
          setStatus('error');
          setMessage('Invalid session state');
          setTimeout(() => navigate('/integrations', { replace: true }), 3000);
          return;
        }
        
        // Call Supabase Edge Function to handle the OAuth exchange
        const { data, error: callError } = await supabase.functions.invoke('stripe-oauth-callback', {
          body: { code, userId: user.id }
        });
        
        if (callError) throw callError;
        
        if (data?.success) {
          setStatus('success');
          setMessage('Successfully connected to Stripe!');
          setTimeout(() => navigate('/integrations', { replace: true }), 2000);
        } else {
          throw new Error(data?.message || 'Failed to connect to Stripe');
        }
      } catch (error) {
        console.error('Error handling Stripe callback:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Unknown error occurred');
        setTimeout(() => navigate('/integrations', { replace: true }), 3000);
      }
    };

    handleStripeCallback();
  }, [user, location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto p-8 bg-white rounded-xl shadow-md text-center">
        {status === 'loading' && (
          <Loader2 className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-spin" />
        )}
        
        {status === 'success' && (
          <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        
        {status === 'error' && (
          <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
        
        <h2 className={`text-xl font-medium mb-2 ${
          status === 'error' ? 'text-red-700' : 
          status === 'success' ? 'text-green-700' : 'text-gray-800'
        }`}>
          {status === 'loading' ? 'Connecting to Stripe' : 
           status === 'success' ? 'Connection Successful' : 'Connection Failed'}
        </h2>
        
        <p className="text-gray-600">{message}</p>
        
        {status !== 'loading' && (
          <p className="text-sm text-gray-500 mt-4">
            Redirecting you back to integrations...
          </p>
        )}
      </div>
    </div>
  );
}
