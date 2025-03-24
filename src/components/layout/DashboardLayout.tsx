
import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { signOut, user } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Customers', path: '/dashboard/customers', icon: '👥' },
    { name: 'Subscriptions', path: '/dashboard/subscriptions', icon: '🔄' },
    { name: 'Recovery', path: '/dashboard/recovery', icon: '💰' },
    { name: 'Churn Prediction', path: '/dashboard/churn-prediction', icon: '🔮' },
    { name: 'Settings', path: '/dashboard/settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 bg-blue-800 text-white w-64 transform transition-transform duration-300 ease-in-out z-10 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">Churnex</span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-white focus:outline-none lg:hidden"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>
        <nav className="mt-8">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center text-white opacity-80 hover:opacity-100 py-3 px-6 ${
                    location.pathname === item.path ? 'bg-blue-900 opacity-100' : ''
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute bottom-0 w-full p-4">
          <div className="flex items-center justify-between">
            {user && <p className="text-sm text-blue-200">{user.email}</p>}
            <button
              onClick={() => signOut()}
              className="text-sm text-blue-200 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        {/* Mobile header */}
        <div className="bg-white shadow-md py-4 px-6 lg:hidden">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-gray-600 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <span className="text-xl font-semibold">Churnex</span>
          </div>
        </div>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
