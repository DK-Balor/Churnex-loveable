
import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, LogOut } from 'lucide-react';
import { NavigationItem } from './types';

interface MobileMenuProps {
  isOpen: boolean;
  navigation: NavigationItem[];
  onClose: () => void;
  onSignOut: () => void;
  userEmail?: string | null;
  businessName?: string | null;
}

export default function MobileMenu({ 
  isOpen, 
  navigation, 
  onClose, 
  onSignOut, 
  userEmail, 
  businessName 
}: MobileMenuProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex z-40">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-600 bg-opacity-75" 
        onClick={onClose}
      ></div>

      {/* Menu sidebar */}
      <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white transform transition-transform ease-in-out duration-300 translate-x-0">
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <h1 className="text-xl font-bold">
            <span className="text-brand-dark-900">Churnex</span>
            <span className="text-brand-green text-xs align-top">™</span>
          </h1>
          <button
            className="p-1 rounded-md hover:bg-gray-100"
            onClick={onClose}
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto">
          <nav className="px-2 py-4 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-brand-green-50 text-brand-green'
                      : 'text-brand-dark-600 hover:bg-gray-50 hover:text-brand-dark-800'
                  }`
                }
                onClick={onClose}
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
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
