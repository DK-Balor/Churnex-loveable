
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { getAIInsights } from '../utils/ai';
import { 
  BarChart3, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  ArrowUpRight,
  ArrowRight,
  Clock
} from 'lucide-react';

type AnalyticsData = {
  active_subscriptions: number;
  at_risk_revenue: number;
  revenue_recovered: number;
  recovery_rate: number;
};

type AIInsight = {
  type: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  actionUrl: string;
};

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([
    {
      id: '1',
      title: 'Payment recovery campaign sent',
      description: '12 customers with failed payments were contacted',
      time: '3 hours ago',
    },
    {
      id: '2',
      title: 'Churn risk analysis completed',
      description: 'AI model identified 24 at-risk customers',
      time: 'Yesterday',
    },
    {
      id: '3',
      title: 'New subscription',
      description: 'Acme Corp upgraded to Pro plan ($249/month)',
      time: '2 days ago',
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch analytics data
        const { data: analyticsData, error: analyticsError } = await supabase
          .from('analytics')
          .select('*')
          .single();

        if (analyticsError) {
          console.error('Error fetching analytics:', analyticsError);
          setAnalytics({
            active_subscriptions: 426,
            at_risk_revenue: 12850,
            revenue_recovered: 8795,
            recovery_rate: 68,
          });
        } else {
          setAnalytics(analyticsData);
        }

        // Fetch AI insights
        const { data: insightsData } = await getAIInsights();
        if (insightsData) {
          setInsights(insightsData.insights);
        }
      } catch (err) {
        console.error('Error in fetch operation:', err);
        // Default mock data when no data exists yet
        setAnalytics({
          active_subscriptions: 426,
          at_risk_revenue: 12850,
          revenue_recovered: 8795,
          recovery_rate: 68,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading dashboard data...</div>
      </div>
    );
  }

  // Function to get the appropriate color class based on severity
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-brand-dark-800">Dashboard</h1>
        <div className="text-sm text-brand-dark-500">
          Last updated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-brand-dark-500">Active Subscriptions</h3>
            <span className="p-2 bg-brand-green-50 rounded-md text-brand-green">
              <Users size={16} />
            </span>
          </div>
          <p className="text-3xl font-semibold text-brand-dark-800 mt-2">
            {analytics?.active_subscriptions?.toLocaleString() || 0}
          </p>
          <div className="flex items-center mt-2 text-sm text-brand-green">
            <ArrowUpRight size={16} className="mr-1" />
            <span>5% increase</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-brand-dark-500">At-Risk Revenue</h3>
            <span className="p-2 bg-amber-50 rounded-md text-amber-500">
              <AlertCircle size={16} />
            </span>
          </div>
          <p className="text-3xl font-semibold text-brand-dark-800 mt-2">
            ${analytics?.at_risk_revenue?.toLocaleString() || 0}
          </p>
          <div className="flex items-center mt-2 text-sm text-amber-500">
            <Link to="/dashboard/churn-prediction" className="flex items-center">
              <span>View at-risk customers</span>
              <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-brand-dark-500">Revenue Recovered</h3>
            <span className="p-2 bg-brand-green-50 rounded-md text-brand-green">
              <TrendingUp size={16} />
            </span>
          </div>
          <p className="text-3xl font-semibold text-brand-dark-800 mt-2">
            ${analytics?.revenue_recovered?.toLocaleString() || 0}
          </p>
          <div className="flex items-center mt-2 text-sm text-brand-green">
            <Link to="/dashboard/recovery" className="flex items-center">
              <span>Recovery campaigns</span>
              <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-brand-dark-500">Recovery Rate</h3>
            <span className="p-2 bg-blue-50 rounded-md text-blue-500">
              <BarChart3 size={16} />
            </span>
          </div>
          <p className="text-3xl font-semibold text-brand-dark-800 mt-2">
            {analytics?.recovery_rate || 0}%
          </p>
          <div className="flex items-center mt-2 text-sm text-blue-500">
            <span>Industry avg: 55%</span>
          </div>
        </div>
      </div>
      
      {/* AI Insights & Customer Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-medium text-brand-dark-800 mb-4">AI Insights</h2>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div 
                key={index} 
                className={`rounded-lg p-4 border ${getSeverityColor(insight.severity)}`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{insight.title}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-50">
                    {insight.severity === 'high' ? 'High priority' : 
                     insight.severity === 'medium' ? 'Medium priority' : 'Low priority'}
                  </span>
                </div>
                <p className="text-sm mt-1 mb-2">{insight.description}</p>
                <Link to={insight.actionUrl} className="text-sm font-medium inline-flex items-center">
                  Take action <ArrowRight size={14} className="ml-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-medium text-brand-dark-800 mb-4">Customer Health</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-brand-dark-600">Healthy</span>
              <span className="text-sm text-brand-dark-800 font-medium">78%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div className="bg-brand-green h-2.5 rounded-full" style={{ width: '78%' }}></div>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-brand-dark-600">At Risk</span>
              <span className="text-sm text-brand-dark-800 font-medium">15%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '15%' }}></div>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-brand-dark-600">Critical</span>
              <span className="text-sm text-brand-dark-800 font-medium">7%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '7%' }}></div>
            </div>
            
            <div className="mt-4 text-center">
              <Link 
                to="/dashboard/customers" 
                className="text-brand-green hover:text-brand-green-600 font-medium text-sm inline-flex items-center"
              >
                View customer details <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-brand-dark-800">Recent Activity</h2>
        </div>
        <ul className="divide-y divide-gray-100">
          {recentActivity.map((activity) => (
            <li key={activity.id} className="px-6 py-4">
              <div className="flex items-center">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-brand-dark-800">{activity.title}</p>
                  <p className="text-sm text-brand-dark-500">{activity.description}</p>
                </div>
                <div className="ml-4 flex-shrink-0 flex items-center text-sm text-brand-dark-400">
                  <Clock size={14} className="mr-1" />
                  <p>{activity.time}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="px-6 py-4 border-t border-gray-100 text-center">
          <a href="#" className="text-brand-green hover:text-brand-green-600 text-sm font-medium">
            View all activity
          </a>
        </div>
      </div>
    </div>
  );
}
