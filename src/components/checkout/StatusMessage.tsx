
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

interface StatusMessageProps {
  message: {
    type: 'success' | 'error';
    text: string;
  };
}

const StatusMessage: React.FC<StatusMessageProps> = ({ message }) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto p-8 mt-12">
      <div 
        className={`p-6 rounded-lg mb-8 flex flex-col items-center text-center ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-100' 
            : 'bg-red-50 border border-red-100'
        }`}
      >
        <div className="mb-4">
          {message.type === 'success' ? (
            <CheckCircle className="h-12 w-12 text-green-500" />
          ) : (
            <AlertCircle className="h-12 w-12 text-red-500" />
          )}
        </div>
        <h2 className={`text-xl font-semibold mb-2 ${
          message.type === 'success' ? 'text-green-700' : 'text-red-700'
        }`}>
          {message.type === 'success' ? 'Success' : 'Something went wrong'}
        </h2>
        <p className={`text-${message.type === 'success' ? 'green' : 'red'}-600`}>
          {message.text}
        </p>
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center px-6 py-3 bg-brand-dark-800 text-white rounded-md hover:bg-brand-dark-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default StatusMessage;
