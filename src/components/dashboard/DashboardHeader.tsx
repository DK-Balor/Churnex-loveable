
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { ProfileType } from '../../types/auth';

interface DashboardHeaderProps {
  profile: ProfileType | null;
  lastSyncTime: string | null;
  isRefreshing: boolean;
  onRefreshData: () => void;
}

export default function DashboardHeader({ 
  profile, 
  lastSyncTime, 
  isRefreshing, 
  onRefreshData 
}: DashboardHeaderProps) {
  return (
    <div className="mb-6 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}! Here's an overview of your subscription recovery performance.
        </p>
      </div>
      
      {lastSyncTime && (
        <div className="flex items-center space-x-3">
          <span className="text-xs text-gray-500">
            Last updated: {new Date(lastSyncTime).toLocaleString()}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      )}
    </div>
  );
}
