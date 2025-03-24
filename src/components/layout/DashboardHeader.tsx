
import React from 'react';
import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProfileType } from '../../integrations/supabase/types';

interface DashboardHeaderProps {
  onOpenMobileMenu: () => void;
  profile?: ProfileType | null;
}

export default function DashboardHeader({ onOpenMobileMenu, profile }: DashboardHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center lg:hidden">
          <button
            type="button"
            className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"
            onClick={onOpenMobileMenu}
          >
            <Menu size={24} />
          </button>
        </div>

        <div className="flex items-center">
          {profile?.subscription_plan ? (
            <span className="bg-brand-green-50 text-brand-green text-xs px-2 py-1 rounded-full uppercase">
              {profile.subscription_plan} Plan
            </span>
          ) : (
            <button
              onClick={() => navigate('/checkout')}
              className="bg-brand-green text-white text-xs px-2 py-1 rounded-full hover:bg-brand-green-600"
            >
              Start Free Trial
            </button>
          )}

          {profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date() && (
            <span className="ml-2 text-xs text-gray-500">
              Trial ends: {new Date(profile.trial_ends_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
