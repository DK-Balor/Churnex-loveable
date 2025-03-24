
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ReadOnlyBanner from './ReadOnlyBanner';
import SubscriptionStatusBanner from './SubscriptionStatusBanner';
import MetricsGrid from './MetricsGrid';
import AIInsights from './AIInsights';
import SubscriptionCTA from './SubscriptionCTA';

export default function DashboardOverview() {
  const { profile } = useAuth();
  
  // Check if the user is in read-only mode (no active subscription)
  const isTrialing = profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date();
  const isActive = profile?.subscription_status === 'active' || isTrialing;
  const isReadOnly = !isActive || !profile?.subscription_plan;

  return (
    <div className="space-y-8">
      {/* Read-Only Banner for users without a subscription */}
      {isReadOnly && <ReadOnlyBanner />}

      {/* Subscription Status Banner */}
      <SubscriptionStatusBanner profile={profile} />

      {/* Metrics Grid */}
      <MetricsGrid isReadOnly={isReadOnly} />

      {/* AI Insights */}
      <AIInsights isReadOnly={isReadOnly} />

      {/* Read-Only Overlay Message at the bottom */}
      {isReadOnly && <SubscriptionCTA />}
    </div>
  );
}
