
import React from 'react';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardPage() {
  const { profile } = useAuth();
  const isNewUser = !profile?.subscription_plan;
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}! Here's an overview of your subscription recovery performance.
        </p>
      </div>
      
      {isNewUser && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
          <h2 className="font-medium text-blue-800 mb-2">Welcome to Churnex!</h2>
          <p className="text-blue-700 text-sm mb-3">
            You're currently on our free plan with limited access. Upgrade to a paid plan to unlock all features with a 7-day free trial.
          </p>
          <a 
            href="/checkout" 
            className="inline-block px-4 py-2 text-sm bg-brand-green text-white rounded-md hover:bg-brand-green-600 transition-colors"
          >
            Start Your 7-Day Free Trial
          </a>
        </div>
      )}
      
      <DashboardOverview />
    </div>
  );
}
