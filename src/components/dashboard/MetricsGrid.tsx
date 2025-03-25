
import React, { useEffect, useState } from 'react';
import { Users, CreditCard, BarChart3, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/stripe';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';

interface MetricsGridProps {
  isReadOnly: boolean;
}

interface MetricsData {
  activeSubscribers: number;
  mrrRecovered: number;
  recoveryRate: number;
  atRiskMrr: number;
}

export default function MetricsGrid({ isReadOnly }: MetricsGridProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [metricsData, setMetricsData] = useState<MetricsData>({
    activeSubscribers: 0,
    mrrRecovered: 0,
    recoveryRate: 0,
    atRiskMrr: 0
  });

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Check if user has a Stripe connection
      const { data: stripeConnection, error: stripeError } = await supabase
        .from('stripe_connections')
        .select('connected, last_sync_at')
        .eq('user_id', user?.id)
        .eq('connected', true)
        .single();

      if (stripeError && stripeError.code !== 'PGRST116') {
        console.error('Error fetching Stripe connection:', stripeError);
        throw stripeError;
      }

      // If user has connected Stripe and data has been synced
      if (stripeConnection?.connected && stripeConnection?.last_sync_at) {
        // Get active subscribers count
        const { count: subscribersCount, error: subCountError } = await supabase
          .from('subscriptions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user?.id)
          .eq('status', 'active');

        if (subCountError) throw subCountError;

        // Get customers with recently ended subscriptions
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: churnedSubs, error: churnedError } = await supabase
          .from('subscriptions')
          .select('id, amount, customer_id')
          .eq('user_id', user?.id)
          .eq('status', 'canceled')
          .gte('canceled_at', thirtyDaysAgo.toISOString());

        if (churnedError) throw churnedError;

        // Calculate at-risk MRR (sum of recently churned subscriptions)
        const atRiskMrr = churnedSubs?.reduce((total, sub) => total + (sub.amount || 0), 0) || 0;

        // For this example, we'll simulate recovery rate and MRR recovered
        // In a real app, you'd track this through the recovery campaigns
        const recoveredCount = Math.floor(churnedSubs?.length * 0.25) || 0; // Assume 25% recovery
        const recoveryRate = churnedSubs?.length > 0 ? (recoveredCount / churnedSubs.length) * 100 : 0;
        const mrrRecovered = atRiskMrr * (recoveryRate / 100);

        setMetricsData({
          activeSubscribers: subscribersCount || 0,
          mrrRecovered: mrrRecovered,
          recoveryRate: Math.round(recoveryRate),
          atRiskMrr: atRiskMrr
        });
      } else {
        // Fall back to mock data if no Stripe connection
        setMetricsData({
          activeSubscribers: 498,
          mrrRecovered: 7584,
          recoveryRate: 64,
          atRiskMrr: 2150
        });
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Fallback to mock data on error
      setMetricsData({
        activeSubscribers: 498,
        mrrRecovered: 7584,
        recoveryRate: 64,
        atRiskMrr: 2150
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create metrics array from the fetched data
  const metrics = [
    {
      title: 'Active Subscribers',
      value: isLoading ? '...' : metricsData.activeSubscribers.toString(),
      change: '+12%', // This would be calculated from historical data
      positive: true,
      icon: <Users className="h-6 w-6 text-blue-600" />
    },
    {
      title: 'MRR Recovered',
      value: isLoading ? '...' : formatCurrency(metricsData.mrrRecovered),
      change: '+8.3%', // This would be calculated from historical data
      positive: true,
      icon: <CreditCard className="h-6 w-6 text-green-600" />
    },
    {
      title: 'Recovery Rate',
      value: isLoading ? '...' : `${metricsData.recoveryRate}%`,
      change: '+3%', // This would be calculated from historical data
      positive: true,
      icon: <BarChart3 className="h-6 w-6 text-purple-600" />
    },
    {
      title: 'At-Risk MRR',
      value: isLoading ? '...' : formatCurrency(metricsData.atRiskMrr),
      change: '-5%', // This would be calculated from historical data
      positive: true, // Usually negative but positive means improving (decreasing)
      icon: <AlertTriangle className="h-6 w-6 text-amber-600" />
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${isReadOnly ? 'opacity-75 pointer-events-none' : ''}`}>
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
  );
}
