
import React from 'react';
import { formatCurrency } from '../../utils/stripe';
import { BarChart2, Clock, MessageCircle, Users } from 'lucide-react';

interface RecoveryCampaignCardProps {
  campaign: {
    id: string;
    name: string;
    status: 'completed' | 'active' | 'draft';
    targetSegment: string;
    customersCount: number;
    recoveryGoal: number;
    recoveryAchieved: number;
    successRate: number;
  };
  onViewDetails: (campaignId: string) => void;
}

export default function RecoveryCampaignCard({ campaign, onViewDetails }: RecoveryCampaignCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'past_due': return 'bg-red-100 text-red-800';
      case 'at_risk': return 'bg-amber-100 text-amber-800';
      case 'canceled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatSegmentName = (segment: string) => {
    switch (segment) {
      case 'past_due': return 'Past Due';
      case 'at_risk': return 'At Risk';
      case 'canceled': return 'Canceled';
      default: return segment;
    }
  };

  const progressPercentage = Math.min(100, Math.round((campaign.recoveryAchieved / campaign.recoveryGoal) * 100));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-medium text-gray-900">{campaign.name}</h3>
          <span 
            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}
          >
            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            <Users className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-sm text-gray-600">{campaign.customersCount} customers</span>
          </div>
          <div className="flex items-center">
            <MessageCircle className="h-4 w-4 text-gray-500 mr-2" />
            <span 
              className={`text-xs px-2 py-0.5 rounded-full ${getSegmentColor(campaign.targetSegment)}`}
            >
              {formatSegmentName(campaign.targetSegment)}
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">Recovery Progress</span>
            <span className="text-sm font-medium text-gray-700">
              {formatCurrency(campaign.recoveryAchieved)} / {formatCurrency(campaign.recoveryGoal)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="block text-xs text-gray-500">Success Rate</span>
            <div className="flex items-center">
              <BarChart2 className="h-4 w-4 text-gray-700 mr-1" />
              <span className="text-lg font-semibold">{campaign.successRate}%</span>
            </div>
          </div>
          <div>
            <span className="block text-xs text-gray-500">Total Recovered</span>
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-gray-700 mr-1" />
              <span className="text-lg font-semibold">{formatCurrency(campaign.recoveryAchieved)}</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => onViewDetails(campaign.id)}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
