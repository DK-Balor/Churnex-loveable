
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSubscriptionPlans, formatCurrency, createCheckoutSession, handleCheckoutSuccess } from '../utils/stripe';
import { useToast } from '../components/ui/use-toast';

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Check if this is a return from a checkout session or if there was a cancellation
  const sessionId = searchParams.get('session_id');
  const canceled = searchParams.get('canceled');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plansData = await getSubscriptionPlans();
        setPlans(plansData);
        
        // Set the default selected plan (Scale)
        const defaultPlan = plansData.find(p => p.name === 'Scale');
        if (defaultPlan) {
          setSelectedPlan(defaultPlan.id);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
        toast({
          title: "Error",
          description: "Failed to load subscription plans. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    fetchPlans();

    // Show message if checkout was canceled
    if (canceled) {
      setMessage({
        type: 'error',
        text: "Checkout was canceled. Please try again when you're ready."
      });
    }
  }, [canceled, toast]);

  useEffect(() => {
    // Handle checkout success
    const processCheckoutSuccess = async () => {
      if (sessionId && user) {
        setIsLoading(true);
        try {
          const result = await handleCheckoutSuccess(sessionId, user.id);
          if (result.success) {
            setMessage({
              type: 'success',
              text: `Successfully subscribed to the ${result.plan.charAt(0).toUpperCase() + result.plan.slice(1)} plan! Redirecting to dashboard...`
            });
            
            toast({
              title: "Subscription activated",
              description: `You have successfully subscribed to the ${result.plan.charAt(0).toUpperCase() + result.plan.slice(1)} plan.`,
            });
            
            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
              navigate('/dashboard');
            }, 3000);
          } else {
            setMessage({
              type: 'error',
              text: 'Subscription was not found. Please contact support if you believe this is an error.'
            });
          }
        } catch (error) {
          console.error('Error processing checkout:', error);
          setMessage({
            type: 'error',
            text: 'There was an error processing your subscription. Please try again or contact support.'
          });
          
          toast({
            title: "Checkout error",
            description: "There was a problem processing your subscription.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    processCheckoutSuccess();
  }, [sessionId, user, navigate, toast]);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleCheckout = async () => {
    if (!selectedPlan || !user) {
      toast({
        title: "Error",
        description: "Please select a plan to continue.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const { url } = await createCheckoutSession(selectedPlan);
      
      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setMessage({
        type: 'error',
        text: 'There was an error creating your checkout session. Please try again.'
      });
      
      toast({
        title: "Checkout error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render a message if we're returning from checkout or if checkout was canceled
  if (message) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
        {message.type === 'error' && (
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-brand-dark-800 text-white px-4 py-2 rounded-md hover:bg-brand-dark-700"
          >
            Return to Dashboard
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-brand-dark-900 mb-8 text-center">Choose Your Plan</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-lg border-2 p-6 transition-all ${
              selectedPlan === plan.id ? 'border-brand-green shadow-md' : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-brand-dark-800">{plan.name}</h2>
              {plan.name === 'Scale' && (
                <span className="bg-brand-green text-white text-xs px-2 py-1 rounded-full">Popular</span>
              )}
            </div>
            
            <div className="mb-6">
              <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
              <span className="text-brand-dark-500">/{plan.interval}</span>
            </div>
            
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature: string, index: number) => (
                <li key={index} className="flex items-start">
                  <svg className="h-5 w-5 text-brand-green mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-brand-dark-600">{feature}</span>
                </li>
              ))}
            </ul>
            
            <button
              onClick={() => handleSelectPlan(plan.id)}
              className={`w-full py-3 rounded-md font-medium transition-colors ${
                selectedPlan === plan.id
                  ? 'bg-brand-green text-white hover:bg-brand-green-600'
                  : 'bg-white text-brand-dark-700 border border-brand-dark-300 hover:bg-gray-50'
              }`}
            >
              {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>
      
      <div className="max-w-md mx-auto">
        <button
          onClick={handleCheckout}
          disabled={!selectedPlan || isLoading}
          className={`w-full py-4 rounded-md font-bold text-lg transition-colors ${
            isLoading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-brand-green text-white hover:bg-brand-green-600'
          }`}
        >
          {isLoading ? 'Processing...' : 'Continue to Checkout'}
        </button>
        
        <p className="text-center text-brand-dark-500 mt-4">
          You'll have a 7-day free trial. Cancel anytime.
        </p>
        
        <div className="flex justify-center space-x-4 mt-8">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-brand-dark-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-sm">Secure checkout</span>
          </div>
          
          <div className="flex items-center">
            <svg className="h-5 w-5 text-brand-dark-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-sm">100% money-back guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
}
