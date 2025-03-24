
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface StatusMessageProps {
  message: {
    type: 'success' | 'error';
    text: string;
  };
}

const StatusMessage: React.FC<StatusMessageProps> = ({ message }) => {
  const navigate = useNavigate();

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
};

export default StatusMessage;
