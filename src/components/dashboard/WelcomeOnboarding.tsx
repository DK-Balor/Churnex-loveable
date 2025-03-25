
import React, { useState, useEffect } from 'react';
import { CheckCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/use-toast';
import { getOnboardingStepStatuses, updateOnboardingStepStatus, connectStripeAccount } from '../../utils/integrations/stripe';
import CompletedOnboardingPrompt from './CompletedOnboardingPrompt';

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
  const [allStepsCompleted, setAllStepsCompleted] = useState(false);
  
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
          handler: () => handleExplorePredictions(),
          completed: !!stepStatuses.explore_predictions
        },
        {
          id: 'create_campaign',
          title: 'Create your first win-back campaign',
          description: 'Generate AI-powered campaigns to prevent customer churn.',
          action: 'Create Campaign',
          handler: () => handleCreateCampaign(),
          completed: !!stepStatuses.create_campaign
        }
      ];
      
      setSteps(initialSteps);
      
      // Check if all steps are completed
      const completedCount = initialSteps.filter(step => step.completed).length;
      setAllStepsCompleted(completedCount === initialSteps.length);
    };
    
    initializeSteps();
  }, [user, navigate]);
  
  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!user) return;
    
    // Mark as in progress
    setIsLoading(true);
    
    try {
      // First mark the step as completed
      await updateOnboardingStepStatus(user.id, 'profile', true);
      
      // Navigate to settings page
      navigate('/settings');
      
      toast({
        title: "Profile Step Started",
        description: "Complete your profile in the settings page.",
      });
    } catch (error) {
      console.error('Error marking profile step:', error);
      setIsLoading(false);
    }
  };
  
  // Handle data connection - directly initiate Stripe OAuth
  const handleConnectData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Initiate Stripe connection - will redirect to Stripe
      await connectStripeAccount(user.id);
      
      // Note: The rest of the flow continues after redirect back from Stripe
      // This will be handled in StripeCallbackPage.tsx and DashboardPage.tsx
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
  
  // Handle explore predictions
  const handleExplorePredictions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // First mark the step as completed
      await updateOnboardingStepStatus(user.id, 'explore_predictions', true);
      
      // Navigate to predictions page
      navigate('/churn-prediction');
      
      toast({
        title: "Exploring Predictions",
        description: "Check out your customer churn predictions.",
      });
    } catch (error) {
      console.error('Error marking prediction step:', error);
      setIsLoading(false);
    }
  };
  
  // Handle campaign creation
  const handleCreateCampaign = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // First mark the step as completed
      await updateOnboardingStepStatus(user.id, 'create_campaign', true);
      
      // Navigate to recovery page
      navigate('/recovery');
      
      toast({
        title: "Campaign Creation Started",
        description: "Create your first win-back campaign.",
      });
    } catch (error) {
      console.error('Error marking campaign step:', error);
      setIsLoading(false);
    }
  };
  
  // Check for completion after component updates
  useEffect(() => {
    if (steps.length > 0) {
      const completedSteps = steps.filter(step => step.completed).length;
      setAllStepsCompleted(completedSteps === steps.length);
    }
  }, [steps]);
  
  // If all steps are completed or the banner is dismissed, show completion prompt
  if (dismissed) {
    return null;
  }
  
  if (allStepsCompleted) {
    return <CompletedOnboardingPrompt onDismiss={() => setDismissed(true)} />;
  }

  const completedSteps = steps.filter(step => step.completed).length;
  const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

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
                      onClick={() => step.handler()}
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
    </div>
  );
}
