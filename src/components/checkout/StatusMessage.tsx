
import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CheckoutMessage } from '../../hooks/useCheckoutProcess';

interface StatusMessageProps {
  message: CheckoutMessage;
}

const StatusMessage: React.FC<StatusMessageProps> = ({ message }) => {
  const isSuccess = message.type === 'success';
  
  return (
    <div className="max-w-3xl mx-auto py-20 px-4">
      <div className="text-center">
        <div className={`p-6 rounded-lg mb-8 ${isSuccess ? 'bg-green-50' : 'bg-red-50'}`}>
          {isSuccess ? (
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
          ) : (
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          )}
          
          <h1 className={`text-2xl font-bold mb-4 ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
            {isSuccess ? 'Success!' : 'Something went wrong'}
          </h1>
          
          <p className="mb-4">{message.text}</p>
        </div>
        
        <Link
          to="/dashboard"
          className="px-6 py-3 bg-brand-dark-800 text-white rounded-md hover:bg-brand-dark-700 inline-block"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default StatusMessage;
