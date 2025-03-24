
import React from 'react';
import { Lock, Shield } from 'lucide-react';

const CheckoutFooter: React.FC = () => {
  return (
    <div>
      <p className="text-center text-brand-dark-500 mt-4">
        You'll have a 7-day free trial. Cancel anytime.
      </p>
      
      <div className="flex justify-center space-x-4 mt-8">
        <div className="flex items-center">
          <Lock className="h-5 w-5 text-brand-dark-400 mr-2" />
          <span className="text-sm">Secure checkout</span>
        </div>
        
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-brand-dark-400 mr-2" />
          <span className="text-sm">100% money-back guarantee</span>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFooter;
