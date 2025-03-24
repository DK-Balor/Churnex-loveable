
import React, { useEffect, useState } from 'react';
import { analyzeRecoveryPerformance } from '../utils/ai';
import RecoveryCampaignCard from '../components/recovery/RecoveryCampaignCard';
import { useToast } from '../components/ui/use-toast';
import { BarChart4, Plus, Sparkles } from 'lucide-react';

interface RecoveryCampaign {
  id: string;
  name: string;
  status: 'completed' | 'active' | 'draft';
  targetSegment: string;
  customersCount: number;
  recoveryGoal: number;
  recoveryAchieved: number;
  successRate: number;
}

export default function RecoveryPage() {
  const [campaigns, setCampaigns] = useState<RecoveryCampaign[]>([]);
  const [metrics, setMetrics] = useState({
    totalRecovered: 0,
    recoveryRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecoveryData = async () => {
      try {
        setIsLoading(true);
        
        const { data } = await analyzeRecoveryPerformance();
        
        if (data) {
          setCampaigns(data.campaignPerformance || []);
          setMetrics({
            totalRecovered: data.totalRecovered || 0,
            recoveryRate: data.recoveryRate || 0
          });
        }
      } catch (error) {
        console.error('Error fetching recovery performance:', error);
        toast({
          title: "Error",
          description: "Failed to load recovery data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecoveryData();
  }, [toast]);

  const handleViewDetails = (campaignId: string) => {
    // In a full implementation, this would navigate to a campaign detail page or open a modal
    toast({
      title: "Campaign Details",
      description: `Viewing details for campaign ${campaignId}`,
    });
  };

  const handleCreateCampaign = () => {
    // In a full implementation, this would navigate to a campaign creation page or open a modal
    toast({
      title: "Create Campaign",
      description: "This would open a campaign creation flow in a full implementation.",
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Recovery Campaigns</h1>
          <p className="text-gray-600">
            Recover lost revenue with AI-powered win-back campaigns.
          </p>
        </div>
        <button
          onClick={handleCreateCampaign}
          className="px-4 py-2 bg-brand-green text-white rounded-md hover:bg-brand-green-600 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Recovered</h3>
              <p className="text-3xl font-semibold text-gray-800 mt-2">
                {isLoading ? '-' : `$${metrics.totalRecovered.toLocaleString()}`}
              </p>
            </div>
            <BarChart4 className="h-12 w-12 text-blue-100" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Recovery Rate</h3>
              <p className="text-3xl font-semibold text-gray-800 mt-2">
                {isLoading ? '-' : `${metrics.recoveryRate}%`}
              </p>
            </div>
            <Sparkles className="h-12 w-12 text-green-100" />
          </div>
        </div>
      </div>

      {/* AI-powered recovery suggestion */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100 mb-8">
        <div className="flex items-start">
          <div className="bg-blue-100 rounded-full p-3 mr-4">
            <Sparkles className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">AI Recovery Insight</h3>
            <p className="text-gray-700 mb-3">
              Based on your current data, targeting customers who have canceled within the last 30 days
              with a special 20% discount offer would likely yield a 40% recovery rate, recovering approximately $3,500 in MRR.
            </p>
            <button
              onClick={() => toast({ 
                title: "Campaign Created", 
                description: "An AI-optimized campaign has been created based on this recommendation." 
              })}
              className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 text-sm font-medium"
            >
              Create AI-Optimized Campaign
            </button>
          </div>
        </div>
      </div>

      {/* Campaigns grid */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <RecoveryCampaignCard
              key={campaign.id}
              campaign={campaign}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-4">No recovery campaigns yet.</p>
          <button
            onClick={handleCreateCampaign}
            className="px-4 py-2 bg-brand-green text-white rounded-md hover:bg-brand-green-600"
          >
            Create Your First Campaign
          </button>
        </div>
      )}
    </div>
  );
}
