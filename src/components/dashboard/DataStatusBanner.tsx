
import React from 'react';
import { Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

interface DataStatusBannerProps {
  hasData: boolean | null;
}

export default function DataStatusBanner({ hasData }: DataStatusBannerProps) {
  if (hasData === false) {
    return (
      <div className="mb-6 sm:mb-8 bg-blue-50 border border-blue-100 p-4 sm:p-6 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-medium text-blue-800 mb-1">Connect Your Data</h3>
          <p className="text-sm sm:text-base text-blue-700">
            To get accurate churn predictions and recovery insights, connect your subscription data via Stripe or CSV import.
          </p>
        </div>
        <Link to="/integrations">
          <Button className="whitespace-nowrap w-full sm:w-auto">
            <Database className="h-4 w-4 mr-2" />
            Connect Data
          </Button>
        </Link>
      </div>
    );
  }
  
  return null;
}
