
import React, { useState, useEffect } from 'react';
import { CheckCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/use-toast';
import { getOnboardingStepStatuses, updateOnboardingStepStatus, connectStripeAccount } from '../../utils/integrations/stripe';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  action: string;
  handler: () => void;
  completed: boolean;
}

export default function WelcomeOnboarding() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize steps with handlers and load completion status
  useEffect(() => {
    if (!user) return;
    
    const initializeSteps = async () => {
      // Get saved step statuses from database
      const stepStatuses = await getOnboardingStepStatuses(user.id);
      
      // Define initial steps with handlers
      const initialSteps: OnboardingStep[] = [
        {
          id: 'profile',
          title: 'Complete your profile',
          description: 'Add your business details and preferences to get personalized insights.',
          action: 'Update Profile',
          handler: () => handleUpdateProfile(),
          completed: !!stepStatuses.profile
        },
        {
          id: 'connect_data',
          title: 'Connect your customer data',
          description: 'Import your customer data to start receiving AI-powered churn predictions.',
          action: 'Connect Data',
          handler: () => handleConnectData(),
          completed: !!stepStatuses.connect_data
        },
        {
          id: 'explore_predictions',
          title: 'Explore churn predictions',
          description: 'See which customers are at risk of churning and why.',
          action: 'View Predictions',
          handler: () => navigate('/churn-prediction'),
          completed: !!stepStatuses.explore_predictions
        },
        {
          id: 'create_campaign',
          title: 'Create your first win-back campaign',
          description: 'Generate AI-powered campaigns to prevent customer churn.',
          action: 'Create Campaign',
          handler: () => navigate('/recovery'),
          completed: !!stepStatuses.create_campaign
        }
      ];
      
      setSteps(initialSteps);
    };
    
    initializeSteps();
  }, [user, navigate]);
  
  // Handle profile update
  const handleUpdateProfile = () => {
    navigate('/settings');
  };
  
  // Handle data connection
  const handleConnectData = async () => {
    setIsLoading(true);
    try {
      if (!user) return;
      
      // Initiate Stripe connection - will redirect to Stripe
      await connectStripeAccount(user.id);
      
      // Note: The rest of the flow continues after redirect back from Stripe
    } catch (error) {
      console.error('Error connecting data:', error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to Stripe. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  // Mark a step as completed
  const handleMarkCompleted = async (index: number) => {
    if (!user) return;
    
    try {
      const step = steps[index];
      
      // Update the step status in the database
      await updateOnboardingStepStatus(user.id, step.id, true);
      
      // Update local state
      const updatedSteps = [...steps];
      updatedSteps[index].completed = true;
      setSteps(updatedSteps);
      
      // Perform the action for the step
      step.handler();
      
      toast({
        title: "Step Completed",
        description: `${step.title} marked as completed.`,
      });
    } catch (error) {
      console.error('Error marking step as completed:', error);
      toast({
        title: "Error",
        description: "Could not save your progress. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const completedSteps = steps.filter(step => step.completed).length;
  const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;
  
  // If all steps are completed or the banner is dismissed, don't show it
  if (dismissed || (steps.length > 0 && completedSteps === steps.length)) {
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
          aria-label="Dismiss"
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
                    <button
                      onClick={() => handleMarkCompleted(index)}
                      disabled={isLoading}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center mt-2 sm:mt-0 disabled:opacity-50"
                    >
                      {isLoading ? 'Loading...' : step.action}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show subscription prompt if all steps are completed */}
      {steps.length > 0 && completedSteps === steps.length && (
        <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="font-medium text-blue-800">All steps completed!</h3>
          {profile?.account_type === 'demo' && (
            <div className="mt-2">
              <p className="text-blue-700 mb-3">
                Upgrade to a paid subscription to unlock all features and get the most out of Churnex.
              </p>
              <a 
                href="/checkout"
                className="inline-block px-4 py-2 bg-brand-green text-white rounded-md hover:bg-brand-green-600 transition-colors"
              >
                Start Free Trial
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
