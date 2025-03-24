
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { NavigationItem } from './types';

interface DesktopSidebarProps {
  navigation: NavigationItem[];
  onSignOut: () => void;
  userEmail?: string | null;
  businessName?: string | null;
}

export default function DesktopSidebar({ 
  navigation, 
  onSignOut, 
  userEmail, 
  businessName 
}: DesktopSidebarProps) {
  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-200">
          <h1 className="text-xl font-bold">
            <span className="text-brand-dark-900">Churnex</span>
            <span className="text-brand-green text-xs align-top">™</span>
          </h1>
        </div>
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 px-2 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-brand-green-50 text-brand-green'
                      : 'text-brand-dark-600 hover:bg-gray-50 hover:text-brand-dark-800'
                  }`
                }
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-brand-green-100 flex items-center justify-center text-brand-green">
                {userEmail?.[0].toUpperCase() || 'U'}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{businessName || userEmail}</p>
              <p className="text-xs text-gray-500 truncate">{userEmail}</p>
            </div>
            <button
              onClick={onSignOut}
              className="ml-auto p-1 rounded-md hover:bg-gray-100 text-gray-500"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
