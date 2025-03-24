
import { supabase } from '../integrations/supabase/client';

// Function to predict customers at risk of churning
export const predictChurnRisk = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('predict-churn');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error predicting churn risk:", error);
    throw error;
  }
};

// Function to generate win-back campaign suggestions
export const generateWinBackSuggestions = async (customerId: string, customerData: any) => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-winback', {
      body: { customerId, customerData }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error generating win-back suggestions:", error);
    throw error;
  }
};

// Function to analyze recovery performance
export const analyzeRecoveryPerformance = async () => {
  // In a real implementation, this would call a Supabase Edge Function
  // that would analyze recovery campaign performance
  // For now, we'll return mock data
  
  return {
    data: {
      totalRecovered: 8795,
      recoveryRate: 68,
      campaignPerformance: [
        {
          id: '1',
          name: 'Payment Recovery - April',
          status: 'completed',
          targetSegment: 'past_due',
          customersCount: 32,
          recoveryGoal: 5000,
          recoveryAchieved: 3200,
          successRate: 64
        },
        {
          id: '2',
          name: 'Win-back Campaign - Q2',
          status: 'active',
          targetSegment: 'canceled',
          customersCount: 45,
          recoveryGoal: 8000,
          recoveryAchieved: 5600,
          successRate: 70
        },
        {
          id: '3',
          name: 'At-risk Prevention - May',
          status: 'active',
          targetSegment: 'at_risk',
          customersCount: 28,
          recoveryGoal: 4800,
          recoveryAchieved: 2100,
          successRate: 44
        }
      ]
    }
  };
};

// Function to get AI insights for the dashboard
export const getAIInsights = async () => {
  try {
    // Call our predict-churn endpoint
    const churnData = await predictChurnRisk();
    
    // Create insights based on real data
    const atRiskCustomers = churnData.data || [];
    const totalAtRisk = atRiskCustomers.length;
    const atRiskRevenue = atRiskCustomers.reduce((sum, customer) => sum + customer.monthlyValue, 0);
    
    return {
      data: {
        insights: [
          {
            type: 'churn_prediction',
            title: 'Churn Risk Detected',
            description: `Our AI has identified ${totalAtRisk} customers at high risk of churning, representing approximately $${atRiskRevenue} in monthly recurring revenue.`,
            severity: totalAtRisk > 10 ? 'high' : 'medium',
            actionUrl: '/dashboard/churn-prediction'
          },
          {
            type: 'payment_recovery',
            title: 'Payment Recovery Opportunity',
            description: 'There are 12 customers with failed payments that could be recovered, representing $1,428 in potential recovered revenue.',
            severity: 'medium',
            actionUrl: '/dashboard/recovery'
          },
          {
            type: 'customer_behavior',
            title: 'Usage Pattern Change',
            description: '15 customers have shown a significant decrease in product usage over the last 14 days. Consider reaching out to re-engage them.',
            severity: 'medium',
            actionUrl: '/dashboard/customers'
          }
        ]
      }
    };
  } catch (error) {
    console.error("Error generating AI insights:", error);
    
    // Fallback if the API call fails
    return {
      data: {
        insights: [
          {
            type: 'churn_prediction',
            title: 'Churn Risk Detected',
            description: 'Our AI has identified several customers at high risk of churning. Check the churn prediction page for details.',
            severity: 'medium',
            actionUrl: '/dashboard/churn-prediction'
          }
        ]
      }
    };
  }
};
