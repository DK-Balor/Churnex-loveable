
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SubscriptionStatusBanner from './SubscriptionStatusBanner';
import MetricsGrid from './MetricsGrid';
import AIInsights from './AIInsights';
import SubscriptionCTA from './SubscriptionCTA';

export default function DashboardOverview() {
  const { profile } = useAuth();
  
  // Check if the user is in trial or has an active subscription
  const isTrialing = profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date();
  const isActive = profile?.subscription_status === 'active';
  const isReadOnly = !isActive && !isTrialing;

  return (
    <div className="space-y-8">
      {/* Unified Subscription Status Banner */}
      <SubscriptionStatusBanner profile={profile} />

      {/* Metrics Grid */}
      <MetricsGrid isReadOnly={isReadOnly} />

      {/* AI Insights */}
      <AIInsights isReadOnly={isReadOnly} />

      {/* Only show CTA at the bottom if they're not subscribed and not in trial */}
      {isReadOnly && <SubscriptionCTA />}
    </div>
  );
}
