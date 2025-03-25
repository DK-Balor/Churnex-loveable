
import React from 'react';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import WelcomeOnboarding from '../components/dashboard/WelcomeOnboarding';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';

export default function DashboardPage() {
  const { profile, user } = useAuth();
  const [hasData, setHasData] = React.useState<boolean | null>(null);
  
  React.useEffect(() => {
    if (user) {
      // Check if the user has imported any data
      checkUserData(user.id);
    }
  }, [user]);
  
  const checkUserData = async (userId: string) => {
    try {
      // Check if user has any customer or subscription data
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', userId)
        .limit(1);
      
      if (customerError) throw customerError;
      
      // Check if user has connected Stripe
      const { data: stripeData, error: stripeError } = await supabase
        .from('stripe_connections')
        .select('connected')
        .eq('user_id', userId)
        .eq('connected', true)
        .limit(1);
      
      if (stripeError) throw stripeError;
      
      // Set has data based on customers or Stripe connection
      setHasData((customerData && customerData.length > 0) || (stripeData && stripeData.length > 0));
    } catch (error) {
      console.error('Error checking user data:', error);
      setHasData(false);
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}! Here's an overview of your subscription recovery performance.
        </p>
      </div>
      
      {hasData === false && (
        <div className="mb-8 bg-blue-50 border border-blue-100 p-6 rounded-lg flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-blue-800 mb-1">Connect Your Data</h3>
            <p className="text-blue-700">
              To get accurate churn predictions and recovery insights, connect your subscription data via Stripe or CSV import.
            </p>
          </div>
          <Link to="/integrations">
            <Button className="whitespace-nowrap">
              <Database className="h-4 w-4 mr-2" />
              Connect Data
            </Button>
          </Link>
        </div>
      )}
      
      <WelcomeOnboarding />
      <DashboardOverview />
    </div>
  );
}
