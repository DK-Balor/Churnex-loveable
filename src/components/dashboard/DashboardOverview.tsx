
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getAIInsights } from '../../utils/ai';
import { formatCurrency } from '../../utils/stripe';
import { CalendarDays, BarChart3, Users, CreditCard, AlertTriangle } from 'lucide-react';

export default function DashboardOverview() {
  const { profile } = useAuth();
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

  // Calculate time left in trial or subscription
  const getTimeRemaining = () => {
    if (!profile) return null;
    
    const endDate = profile.subscription_current_period_end || profile.trial_ends_at;
    if (!endDate) return null;
    
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  const timeRemaining = getTimeRemaining();
  const isTrialing = profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date();
  const isActive = profile?.subscription_status === 'active' || isTrialing;

  // Mock data for the dashboard
  const metrics = [
    {
      title: 'Active Subscribers',
      value: '498',
      change: '+12%',
      positive: true,
      icon: <Users className="h-6 w-6 text-blue-600" />
    },
    {
      title: 'MRR Recovered',
      value: formatCurrency(7584),
      change: '+8.3%',
      positive: true,
      icon: <CreditCard className="h-6 w-6 text-green-600" />
    },
    {
      title: 'Recovery Rate',
      value: '64%',
      change: '+3%',
      positive: true,
      icon: <BarChart3 className="h-6 w-6 text-purple-600" />
    },
    {
      title: 'At-Risk MRR',
      value: formatCurrency(2150),
      change: '-5%',
      positive: true,
      icon: <AlertTriangle className="h-6 w-6 text-amber-600" />
    }
  ];

  return (
    <div className="space-y-8">
      {/* Subscription Status Banner */}
      {profile && (
        <div className={`p-4 rounded-lg flex items-center justify-between ${
          isActive ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
        }`}>
          <div className="flex items-center">
            <CalendarDays className={`h-6 w-6 mr-2 ${isActive ? 'text-green-600' : 'text-amber-600'}`} />
            <div>
              <h3 className="font-medium">{isActive ? 'Subscription Active' : 'Subscription Inactive'}</h3>
              <p className="text-sm">
                {isTrialing 
                  ? `Trial ends in ${timeRemaining} days` 
                  : isActive 
                    ? `${profile.subscription_plan?.charAt(0).toUpperCase() + profile.subscription_plan?.slice(1)} plan renews in ${timeRemaining} days` 
                    : 'You don\'t have an active subscription'}
              </p>
            </div>
          </div>
          {!isActive && (
            <a 
              href="/checkout" 
              className="px-4 py-2 text-sm bg-brand-green text-white rounded-md hover:bg-brand-green-600 transition-colors"
            >
              Subscribe Now
            </a>
          )}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <span className="p-2 rounded-lg bg-gray-50">{metric.icon}</span>
              <span className={`text-sm font-medium ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>
                {metric.change}
              </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{metric.title}</h3>
            <p className="text-2xl font-bold mt-1">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* AI Insights */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
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
    </div>
  );
}
