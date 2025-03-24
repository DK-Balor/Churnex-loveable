
import React from 'react';
import StatusMessage from '../components/checkout/StatusMessage';
import PlanSelector from '../components/checkout/PlanSelector';
import CheckoutButton from '../components/checkout/CheckoutButton';
import CheckoutFooter from '../components/checkout/CheckoutFooter';
import { useCheckoutProcess } from '../hooks/useCheckoutProcess';

export default function CheckoutPage() {
  const {
    plans,
    selectedPlan,
    isLoading,
    message,
    handleSelectPlan,
    handleCheckout
  } = useCheckoutProcess();

  // Render a message if we're returning from checkout or if checkout was canceled
  if (message) {
    return <StatusMessage message={message} />;
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-brand-dark-900 mb-8 text-center">Choose Your Plan</h1>
      
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
        />
        
        <CheckoutFooter />
      </div>
    </div>
  );
}
