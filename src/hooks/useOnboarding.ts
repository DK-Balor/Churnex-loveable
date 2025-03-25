
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/use-toast';
import { 
  getOnboardingStepStatuses, 
  updateOnboardingStepStatus, 
  connectStripeAccount 
} from '../utils/integrations/stripe';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  action: string;
  handler: () => void;
  completed: boolean;
}

export function useOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
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
  
  // Check for completion after component updates
  useEffect(() => {
    if (steps.length > 0) {
      const completedSteps = steps.filter(step => step.completed).length;
      setAllStepsCompleted(completedSteps === steps.length);
    }
  }, [steps]);
  
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
      // Navigate to predictions page
      navigate('/churn-prediction');
      
      toast({
        title: "Exploring Predictions",
        description: "Check out your customer churn predictions.",
      });
    } catch (error) {
      console.error('Error navigating to prediction page:', error);
      setIsLoading(false);
    }
  };
  
  // Handle campaign creation
  const handleCreateCampaign = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Navigate to recovery page
      navigate('/recovery');
      
      toast({
        title: "Campaign Creation Started",
        description: "Create your first win-back campaign.",
      });
    } catch (error) {
      console.error('Error navigating to campaign page:', error);
      setIsLoading(false);
    }
  };

  return {
    steps,
    isLoading,
    allStepsCompleted,
    completedStepsCount: steps.filter(step => step.completed).length,
    totalStepsCount: steps.length
  };
}
