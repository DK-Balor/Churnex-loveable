
import { supabase } from '../integrations/supabase/client';

// Function to predict customers at risk of churning
export const predictChurnRisk = async () => {
  // In a real implementation, this would call a Supabase Edge Function
  // that would use a machine learning model to predict churn risk
  // For now, we'll return mock data
  
  return {
    data: [
      {
        id: '1',
        name: 'Globex Industries',
        email: 'accounts@globex.com',
        plan: 'Scale',
        churnRisk: 86,
        monthlyValue: 119,
        factors: ['Payment failures', 'Decreasing usage', 'Support inquiries'],
      },
      {
        id: '2',
        name: 'Oscorp',
        email: 'norman@oscorp.com',
        plan: 'Scale',
        churnRisk: 78,
        monthlyValue: 119,
        factors: ['Feature usage decline', 'Competitor inquiry'],
      },
      {
        id: '3',
        name: 'Dunder Mifflin',
        email: 'michael@dundermifflin.com',
        plan: 'Growth',
        churnRisk: 72,
        monthlyValue: 59,
        factors: ['Payment failures', 'Support complaints'],
      }
    ]
  };
};

// Function to generate win-back campaign suggestions
export const generateWinBackSuggestions = async (customerId: string) => {
  // In a real implementation, this would call a Supabase Edge Function
  // that would use AI to generate personalized win-back campaign suggestions
  // For now, we'll return mock data
  
  return {
    data: {
      suggestions: [
        {
          title: 'One-month discount offer',
          message: 'We noticed you've been with us for a while and we'd like to offer you a special discount of 20% off your next month's subscription as a thank you for your loyalty.',
          incentive: {
            type: 'discount',
            value: 20,
            unit: 'percent'
          },
          predictedSuccessRate: 65
        },
        {
          title: 'Feature upgrade',
          message: 'We've noticed you've been using our analytics feature frequently. We'd like to offer you a free upgrade to our advanced analytics package for the next 3 months.',
          incentive: {
            type: 'feature_upgrade',
            featureName: 'Advanced Analytics',
            duration: 3,
            unit: 'months'
          },
          predictedSuccessRate: 48
        },
        {
          title: 'Consultation call',
          message: 'We'd love to learn more about how we can better serve your needs. Would you be interested in scheduling a 30-minute consultation call with one of our customer success managers?',
          incentive: {
            type: 'consultation',
            duration: 30,
            unit: 'minutes'
          },
          predictedSuccessRate: 35
        }
      ]
    }
  };
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
  // In a real implementation, this would call a Supabase Edge Function
  // that would generate AI insights based on the user's data
  // For now, we'll return mock data
  
  return {
    data: {
      insights: [
        {
          type: 'churn_prediction',
          title: 'Churn Risk Detected',
          description: 'Our AI has identified 24 customers at high risk of churning in the next 30 days, representing approximately $3,840 in monthly recurring revenue.',
          severity: 'high',
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
};
