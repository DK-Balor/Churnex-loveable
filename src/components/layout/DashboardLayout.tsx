
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BarChart3, 
  Users, 
  Clock, 
  RefreshCw, 
  AlertTriangle,
  Settings, 
  Home
} from 'lucide-react';
import MobileMenu from './MobileMenu';
import DesktopSidebar from './DesktopSidebar';
import DashboardHeader from './DashboardHeader';
import { NavigationItem } from './types';

export default function DashboardLayout() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Customers', href: '/dashboard/customers', icon: Users },
    { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: Clock },
    { name: 'Recovery', href: '/dashboard/recovery', icon: RefreshCw },
    { name: 'Churn Prediction', href: '/dashboard/churn-prediction', icon: AlertTriangle },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu component */}
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        navigation={navigation}
        onClose={() => setIsMobileMenuOpen(false)}
        onSignOut={handleSignOut}
        userEmail={user?.email}
        businessName={profile?.business_name}
      />

      {/* Desktop sidebar component */}
      <DesktopSidebar 
        navigation={navigation}
        onSignOut={handleSignOut}
        userEmail={user?.email}
        businessName={profile?.business_name}
      />

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Header component */}
        <DashboardHeader 
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          profile={profile}
        />

        <main className="flex-1 pb-8">
          <div className="mt-8 px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
