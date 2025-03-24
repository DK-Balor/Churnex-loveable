
import React, { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';

type AnalyticsData = {
  active_subscriptions: number;
  at_risk_revenue: number;
  revenue_recovered: number;
  recovery_rate: number;
};

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data, error } = await supabase
          .from('analytics')
          .select('*')
          .single();

        if (error) {
          console.error('Error fetching analytics:', error);
          setAnalytics({
            active_subscriptions: 426,
            at_risk_revenue: 12850,
            revenue_recovered: 8795,
            recovery_rate: 68,
          });
        } else {
          setAnalytics(data);
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

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h1>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Active Subscriptions</h3>
          <p className="text-3xl font-semibold text-gray-800 mt-2">
            {analytics?.active_subscriptions?.toLocaleString() || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">At-Risk Revenue</h3>
          <p className="text-3xl font-semibold text-gray-800 mt-2">
            ${analytics?.at_risk_revenue?.toLocaleString() || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Revenue Recovered</h3>
          <p className="text-3xl font-semibold text-gray-800 mt-2">
            ${analytics?.revenue_recovered?.toLocaleString() || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Recovery Rate</h3>
          <p className="text-3xl font-semibold text-gray-800 mt-2">
            {analytics?.recovery_rate || 0}%
          </p>
        </div>
      </div>
      
      {/* Charts & information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Churn Prediction</h2>
          <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
            <h3 className="font-medium text-blue-800">AI Insights</h3>
            <p className="text-sm text-blue-700 mt-1">
              Based on recent customer behavior, we predict 24 customers are at high risk of
              churning in the next 30 days, representing approximately $3,840 in monthly recurring
              revenue.
            </p>
            <a href="/dashboard/churn-prediction" className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block">
              View detailed churn analysis →
            </a>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Customer Health</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Healthy</span>
              <span className="text-sm text-gray-800 font-medium">78%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '78%' }}></div>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-600">At Risk</span>
              <span className="text-sm text-gray-800 font-medium">15%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '15%' }}></div>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-600">Critical</span>
              <span className="text-sm text-gray-800 font-medium">7%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '7%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Recent Activity</h2>
        </div>
        <ul className="divide-y divide-gray-200">
          <li className="px-6 py-4">
            <div className="flex items-center">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">Payment recovery campaign sent</p>
                <p className="text-sm text-gray-500">12 customers with failed payments were contacted</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <p className="text-sm text-gray-500">3 hours ago</p>
              </div>
            </div>
          </li>
          <li className="px-6 py-4">
            <div className="flex items-center">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">Churn risk analysis completed</p>
                <p className="text-sm text-gray-500">AI model identified 24 at-risk customers</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <p className="text-sm text-gray-500">Yesterday</p>
              </div>
            </div>
          </li>
          <li className="px-6 py-4">
            <div className="flex items-center">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">New subscription</p>
                <p className="text-sm text-gray-500">Acme Corp upgraded to Pro plan ($249/month)</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <p className="text-sm text-gray-500">2 days ago</p>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
