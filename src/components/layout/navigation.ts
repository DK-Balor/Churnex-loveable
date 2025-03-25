
import { Home, BarChart2, Users, RefreshCw, Settings, CreditCard, Zap, Database } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: any;
  submenu?: NavItem[];
}

export const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home
  },
  {
    title: 'Customers',
    href: '/customers',
    icon: Users
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart2
  },
  {
    title: 'Subscriptions',
    href: '/subscriptions',
    icon: CreditCard
  },
  {
    title: 'Churn Prediction',
    href: '/churn-prediction',
    icon: Zap
  },
  {
    title: 'Recovery',
    href: '/recovery',
    icon: RefreshCw
  },
  {
    title: 'Integrations',
    href: '/integrations',
    icon: Database
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings
  },
];
