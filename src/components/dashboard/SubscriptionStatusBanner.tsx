
import React from 'react';
import { CalendarDays, Lock } from 'lucide-react';
import { UserProfile } from '../../types/auth';

interface SubscriptionStatusBannerProps {
  profile: UserProfile | null;
}

export default function SubscriptionStatusBanner({ profile }: SubscriptionStatusBannerProps) {
  if (!profile) return null;
  
  // Calculate time left in trial or subscription
  const getTimeRemaining = () => {
    if (!profile) return null;
    
    const endDate = profile.subscription_status === 'active' 
      ? profile.subscription_current_period_end 
      : profile.trial_ends_at;
      
    if (!endDate) return null;
    
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  const timeRemaining = getTimeRemaining();
  const isTrialing = profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date();
  const isActive = profile?.subscription_status === 'active';
  
  // If user has an active paid subscription
  if (isActive && profile.subscription_plan) {
    return (
      <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-center justify-between">
        <div className="flex items-center">
          <CalendarDays className="h-6 w-6 mr-2 text-green-600" />
          <div>
            <h3 className="font-medium text-green-800">Subscription Active</h3>
            <p className="text-sm text-green-700">
              {`${profile.subscription_plan.charAt(0).toUpperCase() + profile.subscription_plan.slice(1)} plan`}
              {timeRemaining ? ` renews in ${timeRemaining} days` : ''}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // If user is in trial period
  if (isTrialing) {
    return (
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-center justify-between">
        <div className="flex items-center">
          <CalendarDays className="h-6 w-6 mr-2 text-blue-600" />
          <div>
            <h3 className="font-medium text-blue-800">Trial Active</h3>
            <p className="text-sm text-blue-700">
              Your trial ends in {timeRemaining} days
            </p>
          </div>
        </div>
        <a 
          href="/checkout" 
          className="px-4 py-2 text-sm bg-brand-green text-white rounded-md hover:bg-brand-green-600 transition-colors"
        >
          Subscribe Now
        </a>
      </div>
    );
  }
  
  // If user is in demo/read-only mode (no active subscription or trial)
  return (
    <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-center justify-between">
      <div className="flex items-center">
        <Lock className="h-6 w-6 mr-2 text-amber-600" />
        <div>
          <h3 className="font-medium text-amber-800">Demo Mode Active</h3>
          <p className="text-sm text-amber-700">
            You're viewing a demo dashboard with limited features. Start your 7-day free trial to access all features.
          </p>
        </div>
      </div>
      <a 
        href="/checkout" 
        className="px-4 py-2 text-sm bg-brand-green text-white rounded-md hover:bg-brand-green-600 transition-colors"
      >
        Start Free Trial
      </a>
    </div>
  );
}
