
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { handleCheckoutSuccess } from '../utils/stripe';
import { useToast } from '../components/ui/use-toast';
import { CheckCircle, ArrowLeft } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const [plan, setPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get the session ID from the URL
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Process the checkout success
    const processCheckoutSuccess = async () => {
      if (!sessionId || !user) {
        setError('Invalid checkout session. Please try again or contact support.');
        setIsProcessing(false);
        return;
      }

      try {
        const result = await handleCheckoutSuccess(sessionId, user.id);
        
        if (result.success) {
          setPlan(result.plan);
          
          toast({
            title: "Subscription activated",
            description: `You have successfully subscribed to the ${result.plan ? result.plan.charAt(0).toUpperCase() + result.plan.slice(1) : ''} plan.`,
            variant: "success"
          });
          
          // Redirect to dashboard after 5 seconds
          setTimeout(() => {
            navigate('/dashboard');
          }, 5000);
        } else {
          setError('Your subscription could not be verified. Please contact support if you believe this is an error.');
        }
      } catch (error: any) {
        console.error('Error processing checkout:', error);
        setError(error.message || 'There was an error processing your subscription. Please try again or contact support.');
        
        toast({
          title: "Checkout error",
          description: "There was a problem processing your subscription.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    processCheckoutSuccess();
  }, [sessionId, user, navigate, toast]);

  if (isProcessing) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-brand-green border-t-transparent rounded-full mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-brand-dark-900 mb-2">Processing your subscription...</h1>
          <p className="text-brand-dark-600">Please wait while we activate your subscription.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4">
        <div className="text-center">
          <div className="bg-red-50 text-red-700 p-6 rounded-lg mb-8">
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p>{error}</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center mx-auto px-6 py-3 bg-brand-dark-800 text-white rounded-md hover:bg-brand-dark-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-20 px-4">
      <div className="text-center">
        <div className="mb-8">
          <CheckCircle className="h-20 w-20 text-brand-green mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-brand-dark-900 mb-4">Success!</h1>
          <p className="text-xl text-brand-dark-700 mb-2">
            Your {plan && plan.charAt(0).toUpperCase() + plan.slice(1)} plan is now active.
          </p>
          <p className="text-brand-dark-600 mb-8">
            You'll be redirected to your dashboard in a few seconds...
          </p>
        </div>
        
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-brand-green text-white px-6 py-3 rounded-md hover:bg-brand-green-600 transition-colors shadow-md"
        >
          Go to Dashboard Now
        </button>
      </div>
    </div>
  );
}
