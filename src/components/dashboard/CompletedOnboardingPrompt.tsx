
import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';

interface CompletedOnboardingPromptProps {
  onDismiss: () => void;
}

export default function CompletedOnboardingPrompt({ onDismiss }: CompletedOnboardingPromptProps) {
  const { profile } = useAuth();
  
  // Determine if we should show trial or subscription CTAs
  const showTrialCTA = profile?.account_type === 'demo';
  const showSubscriptionCTA = profile?.account_type === 'trial';
  
  return (
    <div className="bg-white rounded-lg border border-green-200 shadow-sm p-6 mb-8">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
          <h2 className="text-xl font-bold text-gray-800">All steps completed!</h2>
        </div>
        <button 
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Dismiss"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      
      <p className="text-gray-600 mb-4">
        You've successfully set up your Churnex account and are now ready to prevent customer churn!
      </p>
      
      {showTrialCTA && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-blue-800 mb-1">Start your free trial</h3>
          <p className="text-blue-700 mb-3">
            Upgrade to a paid plan to unlock all features and get the most out of Churnex. Try it free for 7 days.
          </p>
          <Button asChild>
            <a href="/checkout">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      )}
      
      {showSubscriptionCTA && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-blue-800 mb-1">Your trial is active</h3>
          <p className="text-blue-700 mb-3">
            {profile?.trial_ends_at ? (
              <>Your trial ends on {new Date(profile.trial_ends_at).toLocaleDateString()}. Subscribe now to continue using all features.</>
            ) : (
              <>Subscribe now to continue using all features after your trial ends.</>
            )}
          </p>
          <Button asChild>
            <a href="/checkout">
              Subscribe Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      )}
      
      <div className="text-sm text-gray-500 mt-4">
        <p>Need help? Contact our support team at support@churnex.com</p>
      </div>
    </div>
  );
}
