
import React from 'react';
import { CalendarDays } from 'lucide-react';
import { UserProfile } from '../../types/auth';

interface SubscriptionStatusBannerProps {
  profile: UserProfile | null;
}

export default function SubscriptionStatusBanner({ profile }: SubscriptionStatusBannerProps) {
  if (!profile) return null;
  
  // Calculate time left in trial or subscription
  const getTimeRemaining = () => {
    if (!profile) return null;
    
    const endDate = profile.subscription_current_period_end || profile.trial_ends_at;
    if (!endDate) return null;
    
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  const timeRemaining = getTimeRemaining();
  const isTrialing = profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date();
  const isActive = profile?.subscription_status === 'active' || isTrialing;
  
  if (!isActive) return null;

  return (
    <div className={`p-4 rounded-lg flex items-center justify-between ${
      isTrialing 
        ? 'bg-blue-50 border border-blue-200' 
        : 'bg-green-50 border border-green-200'
    }`}>
      <div className="flex items-center">
        <CalendarDays className={`h-6 w-6 mr-2 ${
          isTrialing 
            ? 'text-blue-600' 
            : 'text-green-600'
        }`} />
        <div>
          <h3 className="font-medium">
            {isTrialing 
              ? 'Trial Active' 
              : 'Subscription Active'}
          </h3>
          <p className="text-sm">
            {isTrialing 
              ? `Your trial ends in ${timeRemaining} days` 
              : `${profile.subscription_plan?.charAt(0).toUpperCase() + profile.subscription_plan?.slice(1)} plan renews in ${timeRemaining} days`}
          </p>
        </div>
      </div>
      {isTrialing && (
        <a 
          href="/checkout" 
          className="px-4 py-2 text-sm bg-brand-green text-white rounded-md hover:bg-brand-green-600 transition-colors"
        >
          Subscribe Now
        </a>
      )}
    </div>
  );
}
