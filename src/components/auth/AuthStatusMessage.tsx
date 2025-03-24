
import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthForm } from '../../contexts/AuthFormContext';

const AuthStatusMessage: React.FC = () => {
  const { state: { error, success } } = useAuthForm();
  
  if (!error && !success) return null;
  
  return (
    <>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm flex items-start">
          <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}
    </>
  );
};

export default AuthStatusMessage;
