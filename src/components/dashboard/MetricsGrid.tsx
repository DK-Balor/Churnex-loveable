
import React from 'react';
import { Users, CreditCard, BarChart3, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/stripe';

interface MetricsGridProps {
  isReadOnly: boolean;
}

export default function MetricsGrid({ isReadOnly }: MetricsGridProps) {
  // Mock data for the dashboard
  const metrics = [
    {
      title: 'Active Subscribers',
      value: '498',
      change: '+12%',
      positive: true,
      icon: <Users className="h-6 w-6 text-blue-600" />
    },
    {
      title: 'MRR Recovered',
      value: formatCurrency(7584),
      change: '+8.3%',
      positive: true,
      icon: <CreditCard className="h-6 w-6 text-green-600" />
    },
    {
      title: 'Recovery Rate',
      value: '64%',
      change: '+3%',
      positive: true,
      icon: <BarChart3 className="h-6 w-6 text-purple-600" />
    },
    {
      title: 'At-Risk MRR',
      value: formatCurrency(2150),
      change: '-5%',
      positive: true,
      icon: <AlertTriangle className="h-6 w-6 text-amber-600" />
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${isReadOnly ? 'opacity-75 pointer-events-none' : ''}`}>
      {metrics.map((metric, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2 rounded-lg bg-gray-50">{metric.icon}</span>
            <span className={`text-sm font-medium ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>
              {metric.change}
            </span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">{metric.title}</h3>
          <p className="text-2xl font-bold mt-1">{metric.value}</p>
        </div>
      ))}
    </div>
  );
}
