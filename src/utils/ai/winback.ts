
import { supabase } from '../../integrations/supabase/client';

export interface WinBackCampaign {
  subject: string;
  message: string;
  incentive: string;
  successRate: number;
}

export const generateWinBackCampaigns = async (customerId: string, riskFactors: string[]) => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-win-back', {
      body: { 
        customerId, 
        riskFactors 
      }
    });
    
    if (error) throw error;
    return data.campaigns as WinBackCampaign[];
  } catch (error) {
    console.error('Error generating win-back campaigns:', error);
    throw error;
  }
};

export const trackCampaignCreation = async (customerId: string, campaignType: string) => {
  try {
    // In a production app, this would log to your database
    console.log(`Campaign created for customer ${customerId} of type ${campaignType}`);
    return true;
  } catch (error) {
    console.error('Error tracking campaign creation:', error);
    return false;
  }
};

export const estimateCampaignROI = (monthlyValue: number, successRate: number, incentiveValue: number) => {
  // Simple ROI calculation based on probability of success
  const costOfIncentive = incentiveValue;
  const potentialRevenue = monthlyValue * 12; // Annual value
  const expectedRecoveryRate = successRate / 100;
  const expectedRecoveredRevenue = potentialRevenue * expectedRecoveryRate;
  const roi = (expectedRecoveredRevenue - costOfIncentive) / costOfIncentive;
  
  return {
    roi: roi > 0 ? roi : 0,
    expectedRecoveredRevenue,
    costOfIncentive,
    successProbability: successRate / 100
  };
};
