
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MobileMenu from './MobileMenu';
import DesktopSidebar from './DesktopSidebar';
import DashboardHeader from './DashboardHeader';
import { dashboardNavigation } from './navigation';
import { useToast } from '../../components/ui/use-toast';

export default function DashboardLayout() {
  const { user, profile, signOut, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    // Set loading to false after a short delay to allow data to load
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Sign out failed",
        description: "There was an error signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Show loading state
  if (isLoading || isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
