
import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface CompletedOnboardingPromptProps {
  onDismiss: () => void;
}

export default function CompletedOnboardingPrompt({ onDismiss }: CompletedOnboardingPromptProps) {
  const { profile } = useAuth();
  
  // Determine account type and show appropriate CTA
  const isDemoAccount = profile?.account_type === 'demo' || !profile?.account_type;
  const isTrialAccount = profile?.account_type === 'trial';
  const isPaidAccount = profile?.account_type === 'paid';
  
  // Format trial end date if available
  const trialEndDate = profile?.trial_ends_at 
    ? new Date(profile.trial_ends_at) 
    : null;
    
  const formattedTrialEnd = trialEndDate 
    ? trialEndDate.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) 
    : null;
  
  // Check if trial is ending soon (within 3 days)
  const isTrialEndingSoon = trialEndDate && 
    ((trialEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) < 3);
  
  return (
    <div className="bg-white rounded-lg border border-green-200 shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <CheckCircle className="h-5 w-5 sm:h-8 sm:w-8 text-green-500 flex-shrink-0" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Congratulations! Setup Complete!</h2>
        </div>
        <button 
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 p-1 flex-shrink-0"
          aria-label="Dismiss"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      
      <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
        You've successfully set up your Churnex account and are now ready to prevent customer churn!
      </p>
      
      {isDemoAccount && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
          <h3 className="font-medium text-sm sm:text-base text-blue-800 mb-1">Start your free trial</h3>
          <p className="text-xs sm:text-sm text-blue-700 mb-2 sm:mb-3">
            Upgrade to a paid plan to unlock all features and get the most out of Churnex. Try it free for 7 days.
          </p>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/checkout">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
      
      {isTrialAccount && (
        <div className={`${isTrialEndingSoon ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'} border rounded-lg p-3 sm:p-4 mb-3 sm:mb-4`}>
          <h3 className={`font-medium text-sm sm:text-base ${isTrialEndingSoon ? 'text-amber-800' : 'text-blue-800'} mb-1`}>
            {isTrialEndingSoon ? 'Your trial is ending soon!' : 'Your trial is active'}
          </h3>
          <p className={`text-xs sm:text-sm ${isTrialEndingSoon ? 'text-amber-700' : 'text-blue-700'} mb-2 sm:mb-3`}>
            {formattedTrialEnd ? (
              <>Your trial ends on {formattedTrialEnd}. Subscribe now to continue using all features.</>
            ) : (
              <>Subscribe now to continue using all features after your trial ends.</>
            )}
          </p>
          <Button asChild variant={isTrialEndingSoon ? "default" : "outline"} className="w-full sm:w-auto">
            <Link to="/checkout">
              Subscribe Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
      
      {isPaidAccount && (
        <div className="bg-green-50 border border-green-100 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
          <h3 className="font-medium text-sm sm:text-base text-green-800 mb-1">Your subscription is active</h3>
          <p className="text-xs sm:text-sm text-green-700 mb-2 sm:mb-3">
            You have full access to all Churnex features. Thank you for your subscription!
          </p>
        </div>
      )}
      
      <div className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
        <p>Need help? Contact our support team at support@churnex.com</p>
      </div>
    </div>
  );
}
