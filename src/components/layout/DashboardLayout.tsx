
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MobileMenu from './MobileMenu';
import DesktopSidebar from './DesktopSidebar';
import DashboardHeader from './DashboardHeader';
import { dashboardNavigation } from './navigation';

export default function DashboardLayout() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu component */}
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        navigation={dashboardNavigation}
        onClose={() => setIsMobileMenuOpen(false)}
        onSignOut={handleSignOut}
        userEmail={user?.email}
        businessName={profile?.business_name}
      />

      {/* Desktop sidebar component */}
      <DesktopSidebar 
        navigation={dashboardNavigation}
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
