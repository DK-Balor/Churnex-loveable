
import React, { useEffect, useState } from 'react';
import { getAIInsights } from '../../utils/ai';

interface AIInsightsProps {
  isReadOnly: boolean;
}

export default function AIInsights({ isReadOnly }: AIInsightsProps) {
  const [insights, setInsights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const { data } = await getAIInsights();
        setInsights(data.insights || []);
      } catch (error) {
        console.error('Error fetching insights:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, []);

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-100 ${isReadOnly ? 'opacity-75 pointer-events-none' : ''}`}>
      <h2 className="text-lg font-bold mb-4">AI Insights</h2>
      
      {isLoading ? (
        <div className="flex justify-center p-6">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : insights.length > 0 ? (
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border ${
                insight.severity === 'high' 
                  ? 'border-red-200 bg-red-50' 
                  : insight.severity === 'medium'
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-blue-200 bg-blue-50'
              }`}
            >
              <h3 className="font-medium mb-1">{insight.title}</h3>
              <p className="text-sm text-gray-700">{insight.description}</p>
              <a 
                href={insight.actionUrl} 
                className="text-sm font-medium text-blue-600 hover:text-blue-800 mt-2 inline-block"
              >
                View Details →
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-6 text-gray-500">
          No insights available yet. Check back later as your data grows.
        </div>
      )}
    </div>
  );
}
