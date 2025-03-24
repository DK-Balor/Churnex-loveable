
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import RecoveryPage from './pages/RecoveryPage';
import ChurnPredictionPage from './pages/ChurnPredictionPage';
import SettingsPage from './pages/SettingsPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import { Toaster } from './components/ui/toaster';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/checkout-success" 
            element={
              <ProtectedRoute>
                <CheckoutSuccessPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected dashboard routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="subscriptions" element={<SubscriptionsPage />} />
            <Route path="recovery" element={<RecoveryPage />} />
            <Route path="churn-prediction" element={<ChurnPredictionPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* Toast notifications */}
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
