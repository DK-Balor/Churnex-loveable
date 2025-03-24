
import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BarChart3, 
  Users, 
  Clock, 
  RefreshCw, 
  AlertTriangle,
  Settings, 
  LogOut,
  Menu,
  X,
  Home
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Customers', href: '/dashboard/customers', icon: Users },
    { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: Clock },
    { name: 'Recovery', href: '/dashboard/recovery', icon: RefreshCw },
    { name: 'Churn Prediction', href: '/dashboard/churn-prediction', icon: AlertTriangle },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  // Function to check if a link is active
  const isActiveLink = (path: string) => {
    return window.location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="fixed inset-0 flex z-40">
          {/* Mobile menu backdrop */}
          {isMobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-gray-600 bg-opacity-75" 
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>
          )}

          {/* Mobile menu sidebar */}
          <div 
            className={`fixed inset-y-0 left-0 flex flex-col w-64 bg-white transform transition-transform ease-in-out duration-300 ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
              <h1 className="text-xl font-bold">
                <span className="text-brand-dark-900">Churnex</span>
                <span className="text-brand-green text-xs align-top">™</span>
              </h1>
              <button
                className="p-1 rounded-md hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
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
                    onClick={() => setIsMobileMenuOpen(false)}
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
                    {user?.email?.[0].toUpperCase() || 'U'}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{profile?.business_name || user?.email}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="ml-auto p-1 rounded-md hover:bg-gray-100 text-gray-500"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop layout */}
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
                  {user?.email?.[0].toUpperCase() || 'U'}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{profile?.business_name || user?.email}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="ml-auto p-1 rounded-md hover:bg-gray-100 text-gray-500"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <header className="bg-white shadow-sm z-10">
          <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"
                onClick={() => setIsMobileMenuOpen(true)}
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

        <main className="flex-1 pb-8">
          <div className="mt-8 px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
