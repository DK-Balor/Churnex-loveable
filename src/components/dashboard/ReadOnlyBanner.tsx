
import React from 'react';
import { Lock } from 'lucide-react';

export default function ReadOnlyBanner() {
  return (
    <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-center justify-between">
      <div className="flex items-center">
        <Lock className="h-6 w-6 mr-2 text-amber-600" />
        <div>
          <h3 className="font-medium">Demo Mode Active</h3>
          <p className="text-sm">
            You're currently viewing a demo dashboard. Subscribe to a plan to access all features and start reducing churn today.
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
