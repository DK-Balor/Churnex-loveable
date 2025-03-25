
import React, { useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle, Send } from 'lucide-react';
import { generateWinBackCampaigns, WinBackCampaign, estimateCampaignROI } from '../../utils/ai/winback';
import { useToast } from '../ui/use-toast';

interface ChurnDetailsProps {
  customer: {
    id: string;
    customerName: string;
    email: string;
    riskScore: number;
    riskFactors: string[];
    monthlyValue: number;
    predictedChurnDate: string;
    lastActivity: string;
  };
  onClose: () => void;
}

export default function ChurnDetails({ customer, onClose }: ChurnDetailsProps) {
  const [campaigns, setCampaigns] = useState<WinBackCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<WinBackCampaign | null>(null);
  const { toast } = useToast();

  const handleGenerateCampaigns = async () => {
    setIsLoading(true);
    try {
      const suggestions = await generateWinBackCampaigns(customer.id, customer.riskFactors);
      setCampaigns(suggestions);
    } catch (error) {
      console.error('Error generating campaigns:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate win-back campaigns. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCampaign = (campaign: WinBackCampaign) => {
    // In a real implementation, this would send the campaign
    toast({
      title: 'Campaign Queued',
      description: `Campaign "${campaign.subject}" has been queued for sending to ${customer.customerName}.`,
      variant: 'default',
    });
    
    // Close the dialog
    setTimeout(onClose, 2000);
  };
  
  const getRiskLevelColor = (riskScore: number) => {
    if (riskScore >= 70) return 'text-red-600 bg-red-50 border-red-200';
    if (riskScore >= 40) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateROI = (campaign: WinBackCampaign) => {
    // Roughly estimate incentive value based on description
    let incentiveValue = 0;
    const incentive = campaign.incentive.toLowerCase();
    
    if (incentive.includes('discount')) {
      const percentMatch = incentive.match(/(\d+)%/);
      if (percentMatch) {
        const percent = parseInt(percentMatch[1]);
        const monthsMatch = incentive.match(/(\d+) months?/);
        const months = monthsMatch ? parseInt(monthsMatch[1]) : 1;
        incentiveValue = (customer.monthlyValue * (percent / 100)) * months;
      }
    } else if (incentive.includes('free')) {
      const monthsMatch = incentive.match(/(\d+) months?/);
      if (monthsMatch) {
        const months = parseInt(monthsMatch[1]);
        incentiveValue = customer.monthlyValue * months;
      } else {
        incentiveValue = customer.monthlyValue; // Default to one month
      }
    } else if (incentive.includes('gift')) {
      incentiveValue = 25; // Assume $25 gift card
    } else {
      incentiveValue = customer.monthlyValue * 0.2; // Default to 20% of monthly value
    }
    
    return estimateCampaignROI(customer.monthlyValue, campaign.successRate, incentiveValue);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-gray-800">Customer Churn Risk Details</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Customer Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {customer.customerName}</p>
                <p><span className="font-medium">Email:</span> {customer.email}</p>
                <p><span className="font-medium">Monthly Value:</span> ${customer.monthlyValue}</p>
                <p><span className="font-medium">Last Activity:</span> {formatDate(customer.lastActivity)}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Risk Assessment</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="font-medium mr-2">Risk Score:</span>
                  <span className={`px-2 py-1 rounded-full text-sm font-semibold ${getRiskLevelColor(customer.riskScore)}`}>
                    {customer.riskScore}%
                  </span>
                </div>
                <p><span className="font-medium">Predicted Churn:</span> {formatDate(customer.predictedChurnDate)}</p>
                <div>
                  <span className="font-medium">Risk Factors:</span>
                  <ul className="mt-1 ml-4 list-disc text-sm">
                    {customer.riskFactors.map((factor, index) => (
                      <li key={index} className="text-gray-700">{factor}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="font-medium text-gray-700 mb-4">AI-Generated Win-Back Campaigns</h3>
            
            {campaigns.length === 0 ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800">
                  Our AI can analyze this customer's risk factors and generate personalized win-back campaign suggestions to help prevent churn.
                </p>
                <button
                  onClick={handleGenerateCampaigns}
                  disabled={isLoading}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate Campaign Suggestions
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign, index) => {
                  const roi = calculateROI(campaign);
                  return (
                    <div 
                      key={index} 
                      className={`border rounded-lg p-4 transition-all cursor-pointer ${
                        selectedCampaign === campaign 
                          ? 'border-blue-400 bg-blue-50 shadow-md' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => setSelectedCampaign(campaign)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-800">{campaign.subject}</h4>
                          <p className="text-gray-600 mt-1">{campaign.message}</p>
                          <div className="mt-2 inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            Incentive: {campaign.incentive}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">Success Rate</div>
                          <div className="text-lg font-bold text-blue-600">{campaign.successRate}%</div>
                          <div className="text-xs text-gray-500 mt-1">Est. ROI: {Math.round(roi.roi * 100)}%</div>
                        </div>
                      </div>
                      
                      {selectedCampaign === campaign && (
                        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-700">Expected Outcome</div>
                            <div className="text-green-700 font-medium">${Math.round(roi.expectedRecoveredRevenue)} recovered revenue</div>
                          </div>
                          <button
                            onClick={() => handleSendCampaign(campaign)}
                            className="px-4 py-2 bg-brand-green text-white rounded-md hover:bg-green-600 transition-colors flex items-center"
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Send Campaign
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
