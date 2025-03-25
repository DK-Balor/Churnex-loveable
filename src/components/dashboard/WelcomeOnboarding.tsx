
import React, { useState } from 'react';
import OnboardingStep from './OnboardingStep';
import OnboardingProgress from './OnboardingProgress';
import CompletedOnboardingPrompt from './CompletedOnboardingPrompt';
import { useOnboarding } from '../../hooks/useOnboarding';

export default function WelcomeOnboarding() {
  const [dismissed, setDismissed] = useState(false);
  const { 
    steps, 
    isLoading, 
    allStepsCompleted,
    completedStepsCount,
    totalStepsCount
  } = useOnboarding();
  
  // If all steps are completed or the banner is dismissed, show completion prompt
  if (dismissed) {
    return null;
  }
  
  if (allStepsCompleted) {
    return <CompletedOnboardingPrompt onDismiss={() => setDismissed(true)} />;
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
          aria-label="Dismiss"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      
      <OnboardingProgress 
        completedSteps={completedStepsCount} 
        totalSteps={totalStepsCount} 
      />
      
      <div className="space-y-4">
        {steps.map((step, index) => (
          <OnboardingStep
            key={index}
            title={step.title}
            description={step.description}
            action={step.action}
            completed={step.completed}
            isLoading={isLoading}
            onAction={step.handler}
          />
        ))}
      </div>
    </div>
  );
}
