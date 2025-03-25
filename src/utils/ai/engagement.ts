
export interface EngagementMetric {
  metric: string;
  value: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  importance: number; // 1-10 scale of importance for churn prediction
}

export const CRITICAL_ENGAGEMENT_THRESHOLDS = {
  loginFrequency: 7, // days between logins
  featureUsage: 0.4, // 40% of available features
  supportTickets: 2, // number of open tickets
  responseTime: 24 // hours to respond to inquiries
};

export const getCustomerEngagementScore = (metrics: EngagementMetric[]): number => {
  if (!metrics.length) return 0;
  
  // Calculate weighted average of normalized metrics
  const totalWeight = metrics.reduce((sum, metric) => sum + metric.importance, 0);
  
  const score = metrics.reduce((sum, metric) => {
    // For metrics where lower is better (like days since login), invert the normalization
    const normalizedValue = metric.metric.includes('time') || metric.metric.includes('tickets') 
      ? Math.max(0, 1 - (metric.value / 100))
      : Math.min(metric.value / 100, 1);
      
    return sum + (normalizedValue * metric.importance);
  }, 0) / totalWeight;
  
  // Return score as percentage
  return Math.round(score * 100);
};

export const getEngagementTrend = (currentScore: number, previousScore: number): string => {
  const percentChange = ((currentScore - previousScore) / previousScore) * 100;
  
  if (percentChange >= 5) return '↑ Improving';
  if (percentChange <= -5) return '↓ Declining';
  return '→ Stable';
};

export const getPredictedChurnRisk = (engagementScore: number): number => {
  // Simple inverse relationship - can be replaced with more sophisticated ML model
  return Math.max(0, Math.min(100, Math.round(100 - engagementScore)));
};
