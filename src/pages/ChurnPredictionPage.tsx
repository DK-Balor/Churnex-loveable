import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateOnboardingStepStatus } from '../utils/integrations/stripe';

export default function ChurnPredictionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Add useEffect to mark as complete after a delay for demo purposes
  useEffect(() => {
    // For demonstration, we'll mark it as complete after 5 seconds
    // In a real implementation, this would be triggered by user interaction
    const timer = setTimeout(() => {
      if (user) {
        updateOnboardingStepStatus(user.id, 'explore_predictions', true).then(() => {
          navigate('/dashboard', { state: { from: '/churn-prediction' } });
        });
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [user, navigate]);
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Churn Prediction</h1>
      <p className="text-gray-500 mb-8">Exploring predictions... This will automatically complete in a few seconds.</p>
      {/* Original page content would be here */}
    </div>
  );
}
