
import React from 'react';

export default function SubscriptionCTA() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
      <h3 className="font-bold text-lg mb-2">Ready to unlock full access?</h3>
      <p className="text-gray-600 mb-4">
        Subscribe to a plan to access all features, including custom analytics, AI-powered churn prevention, and priority support.
      </p>
      <a 
        href="/checkout" 
        className="px-6 py-3 bg-brand-green text-white rounded-md hover:bg-brand-green-600 transition-colors inline-block"
      >
        View Plans & Pricing
      </a>
    </div>
  );
}
