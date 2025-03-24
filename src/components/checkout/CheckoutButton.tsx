
import React from 'react';

interface CheckoutButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
  selectedPlan: string | null;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({ onClick, disabled, isLoading, selectedPlan }) => {
  const isFree = selectedPlan === 'free';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`w-full py-4 rounded-md font-bold text-lg transition-colors ${
        isLoading || disabled
          ? 'bg-gray-300 cursor-not-allowed'
          : 'bg-brand-green text-white hover:bg-brand-green-600'
      }`}
    >
      {isLoading ? 'Processing...' : isFree ? 'Activate Free Plan' : 'Continue to Checkout'}
    </button>
  );
};

export default CheckoutButton;
