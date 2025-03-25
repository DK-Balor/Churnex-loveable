
import React, { useEffect, useState } from 'react';
import { getAIInsights } from '../../utils/ai';
import { BarChart, Bell, TrendingUp, TrendingDown, AlertCircle, DollarSign, Users, Clock } from 'lucide-react';

interface AIInsightsProps {
  isReadOnly: boolean;
}

interface Insight {
  type: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  actionUrl: string;
  icon?: React.ReactNode;
}

export default function AIInsights({ isReadOnly }: AIInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const { data } = await getAIInsights();
        
        // Enhance insights with icons
        const enhancedInsights = (data.insights || []).map((insight: Insight) => {
          let icon;
          switch (insight.type) {
            case 'churn_prediction':
              icon = <Users className="h-5 w-5" />;
              break;
            case 'payment_recovery':
              icon = <DollarSign className="h-5 w-5" />;
              break;
            case 'revenue_opportunity':
              icon = <TrendingUp className="h-5 w-5" />;
              break;
            case 'customer_behavior':
              icon = <BarChart className="h-5 w-5" />;
              break;
            case 'urgent_alert':
              icon = <Bell className="h-5 w-5" />;
              break;
            case 'subscription_expiring':
              icon = <Clock className="h-5 w-5" />;
              break;
            case 'negative_trend':
              icon = <TrendingDown className="h-5 w-5" />;
              break;
            default:
              icon = <AlertCircle className="h-5 w-5" />;
          }
          
          return {
            ...insight,
            icon
          };
        });
        
        setInsights(enhancedInsights);
      } catch (error) {
        console.error('Error fetching insights:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const getSeverityClasses = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-amber-200 bg-amber-50';
      case 'low':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };
  
  const getIconClasses = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-amber-500';
      case 'low':
        return 'text-blue-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <div className={`bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100 ${isReadOnly ? 'opacity-75 pointer-events-none' : ''}`}>
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-bold">AI Insights</h2>
        <span className="text-xs text-gray-500">Updated today</span>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-4 sm:p-6">
          <div className="animate-spin h-6 w-6 sm:h-8 sm:w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : insights.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {insights.map((insight, index) => (
            <div 
              key={index}
              className={`p-3 sm:p-4 rounded-lg border ${getSeverityClasses(insight.severity)}`}
            >
              <div className="flex">
                <div className={`mr-2 sm:mr-3 flex-shrink-0 ${getIconClasses(insight.severity)}`}>
                  {insight.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                    <h3 className="font-medium text-sm sm:text-base mb-1">{insight.title}</h3>
                    {insight.severity === 'high' && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full self-start sm:self-auto mb-1 sm:mb-0">Urgent</span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700">{insight.description}</p>
                  <a 
                    href={insight.actionUrl} 
                    className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 mt-2 inline-block"
                  >
                    View Details →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-4 sm:p-6 text-gray-500">
          <AlertCircle className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mb-2" />
          <p className="text-sm sm:text-base">No insights available yet. Check back later as your data grows.</p>
          <p className="text-xs sm:text-sm mt-2">
            Our AI continuously analyzes your customer data to provide actionable insights.
          </p>
        </div>
      )}
    </div>
  );
}
