
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/use-toast';
import { updateOnboardingStepStatus } from '../utils/integrations/stripe';

export default function StripeCallbackPage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get the required parameters from the URL
        const code = searchParams.get('code');
        const state = searchParams.get('userId') || searchParams.get('state'); // Get user ID from either param
        const error = searchParams.get('error');
        
        if (error) {
          console.error('Error from Stripe:', error);
          setError(`Stripe returned an error: ${error}`);
          return;
        }
        
        if (!code || !state) {
          console.error('Missing required parameters');
          setError('Missing required parameters from Stripe');
          return;
        }
        
        // The state param contains the user ID we sent when creating the OAuth link
        const userId = state;
        
        if (!userId) {
          console.error('Invalid state parameter, no user ID');
          setError('Authentication error. Please try again.');
          return;
        }
        
        // Call the Supabase edge function to exchange the code for access token
        const { data, error: fnError } = await supabase.functions.invoke('stripe-oauth-callback', {
          body: { code, userId }
        });
        
        if (fnError) {
          console.error('Error calling edge function:', fnError);
          throw fnError;
        }
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to connect Stripe account');
        }
        
        // Mark the connect_data step as completed
        if (user) {
          await updateOnboardingStepStatus(user.id, 'connect_data', true);
        }
        
        // Redirect to dashboard with success param
        navigate('/dashboard?stripe_success=true');
        
        toast({
          title: "Stripe Connected",
          description: "Your Stripe account has been successfully connected!",
          variant: "success",
        });
      } catch (error) {
        console.error('Error in Stripe callback:', error);
        setError('Error connecting your Stripe account. Please try again.');
        toast({
          title: "Connection Failed",
          description: "There was a problem connecting your Stripe account.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [searchParams, user, navigate, toast]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-b-2 border-brand-green border-t-transparent rounded-full mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-brand-dark-900 mb-2">Connecting Your Stripe Account</h1>
          <p className="text-brand-dark-600">Please wait while we set up your integration...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connection Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/integrations')}
              className="inline-block px-5 py-3 bg-brand-green text-white rounded-md font-medium hover:bg-brand-green-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null; // This should never render as we always redirect on success
}
