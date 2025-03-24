
import React from 'react';
import StatusMessage from '../components/checkout/StatusMessage';
import PlanSelector from '../components/checkout/PlanSelector';
import CheckoutButton from '../components/checkout/CheckoutButton';
import CheckoutFooter from '../components/checkout/CheckoutFooter';
import { useCheckoutProcess } from '../hooks/useCheckoutProcess';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const {
    plans,
    selectedPlan,
    isLoading,
    message,
    handleSelectPlan,
    handleCheckout
  } = useCheckoutProcess();

  // Render a message if we're returning from checkout or if checkout was cancelled
  if (message) {
    return <StatusMessage message={message} />;
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-brand-dark-900">Choose Your Plan</h1>
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </button>
      </div>
      
      <div className="mb-6 text-center">
        <h2 className="text-xl text-brand-dark-700 mb-2">All plans include a 7-day free trial</h2>
        <p className="text-gray-500">Cancel anytime. No payment needed until your trial ends.</p>
      </div>
      
      <PlanSelector
        plans={plans}
        selectedPlan={selectedPlan}
        onSelectPlan={handleSelectPlan}
      />
      
      <div className="max-w-md mx-auto">
        <CheckoutButton
          onClick={handleCheckout}
          disabled={!selectedPlan}
          isLoading={isLoading}
          selectedPlan={selectedPlan}
        />
        
        <CheckoutFooter />
      </div>
    </div>
  );
}
