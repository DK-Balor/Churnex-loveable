
import React, { useState } from 'react';
import { CheckCircle, ChevronRight } from 'lucide-react';

interface OnboardingStep {
  title: string;
  description: string;
  action: string;
  url: string;
  completed: boolean;
}

export default function WelcomeOnboarding() {
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      title: 'Complete your profile',
      description: 'Add your business details and preferences to get personalized insights.',
      action: 'Update Profile',
      url: '/dashboard/settings',
      completed: false
    },
    {
      title: 'Connect your customer data',
      description: 'Import your customer data to start receiving AI-powered churn predictions.',
      action: 'Connect Data',
      url: '/dashboard/settings',
      completed: false
    },
    {
      title: 'Explore churn predictions',
      description: 'See which customers are at risk of churning and why.',
      action: 'View Predictions',
      url: '/dashboard/churn-prediction',
      completed: false
    },
    {
      title: 'Create your first win-back campaign',
      description: 'Generate AI-powered campaigns to prevent customer churn.',
      action: 'Create Campaign',
      url: '/dashboard/recovery',
      completed: false
    }
  ]);
  
  const [dismissed, setDismissed] = useState(false);
  
  const handleMarkCompleted = (index: number) => {
    const updatedSteps = [...steps];
    updatedSteps[index].completed = true;
    setSteps(updatedSteps);
  };
  
  const completedSteps = steps.filter(step => step.completed).length;
  const progress = (completedSteps / steps.length) * 100;
  
  if (dismissed || completedSteps === steps.length) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Welcome to Churnex!</h2>
          <p className="text-gray-600">Complete these steps to get the most out of your subscription.</p>
        </div>
        <button 
          onClick={() => setDismissed(true)}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      
      <div className="mb-6">
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="absolute h-full bg-brand-green transition-all duration-500 ease-in-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm text-gray-600">{completedSteps} of {steps.length} completed</span>
          {completedSteps > 0 && completedSteps < steps.length && (
            <span className="text-sm font-medium text-brand-green">{progress.toFixed(0)}% complete</span>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div 
            key={index}
            className={`p-4 border rounded-lg transition-colors ${
              step.completed 
                ? 'border-green-200 bg-green-50' 
                : 'border-gray-200 hover:border-blue-200'
            }`}
          >
            <div className="flex items-start">
              <div className="mr-3 mt-1">
                {step.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-medium text-gray-800 mb-1 sm:mb-0">{step.title}</h3>
                  {!step.completed && (
                    <a
                      href={step.url}
                      onClick={() => handleMarkCompleted(index)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center mt-2 sm:mt-0"
                    >
                      {step.action}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </a>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
