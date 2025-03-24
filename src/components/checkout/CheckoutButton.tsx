
import React from 'react';
import { Loader2 } from 'lucide-react';

interface CheckoutButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
  selectedPlan: string | null;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({ onClick, disabled, isLoading, selectedPlan }) => {
  const handleClick = () => {
    console.log('Checkout button clicked with plan:', selectedPlan);
    console.log('Button state:', { disabled, isLoading });
    
    // Add timestamp for tracking the flow
    console.log('Checkout initiated at:', new Date().toISOString());
    
    onClick();
  };
  
  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`w-full py-4 rounded-md font-bold text-lg transition-colors flex items-center justify-center ${
        isLoading || disabled
          ? 'bg-gray-300 cursor-not-allowed text-gray-500'
          : 'bg-brand-green text-white hover:bg-brand-green-600 shadow-md hover:shadow-lg'
      }`}
      data-testid="checkout-button"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        'Continue to Checkout'
      )}
    </button>
  );
};

export default CheckoutButton;
