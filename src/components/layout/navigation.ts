
import { 
  BarChart3, 
  Users, 
  Clock, 
  RefreshCw, 
  AlertTriangle,
  Settings, 
  Home
} from 'lucide-react';
import { NavigationItem } from './types';

export const dashboardNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Customers', href: '/dashboard/customers', icon: Users },
  { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: Clock },
  { name: 'Recovery', href: '/dashboard/recovery', icon: RefreshCw },
  { name: 'Churn Prediction', href: '/dashboard/churn-prediction', icon: AlertTriangle },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];
