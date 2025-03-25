
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
      <div className="mb-8 bg-blue-50 border border-blue-100 p-6 rounded-lg flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-blue-800 mb-1">Connect Your Data</h3>
          <p className="text-blue-700">
            To get accurate churn predictions and recovery insights, connect your subscription data via Stripe or CSV import.
          </p>
        </div>
        <Link to="/integrations">
          <Button className="whitespace-nowrap">
            <Database className="h-4 w-4 mr-2" />
            Connect Data
          </Button>
        </Link>
      </div>
    );
  }
  
  return null;
}
