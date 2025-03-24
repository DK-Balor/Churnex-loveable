
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Calendar } from 'lucide-react';

// Mock data for analytics
const monthlyData = [
  { name: 'Jan', subscriptions: 40, churned: 5, recovered: 2 },
  { name: 'Feb', subscriptions: 45, churned: 7, recovered: 3 },
  { name: 'Mar', subscriptions: 50, churned: 4, recovered: 2 },
  { name: 'Apr', subscriptions: 55, churned: 8, recovered: 5 },
  { name: 'May', subscriptions: 60, churned: 6, recovered: 4 },
  { name: 'Jun', subscriptions: 70, churned: 5, recovered: 3 },
];

const revenueData = [
  { name: 'Jan', revenue: 12000 },
  { name: 'Feb', revenue: 13500 },
  { name: 'Mar', revenue: 15000 },
  { name: 'Apr', revenue: 17500 },
  { name: 'May', revenue: 20000 },
  { name: 'Jun', revenue: 22500 },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('6m');
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">
          Track your subscription metrics and business performance over time.
        </p>
      </div>
      
      {/* Time range selector */}
      <div className="flex items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
        <span className="text-sm text-gray-500 mr-4">Time Range:</span>
        <div className="space-x-2">
          {['1m', '3m', '6m', '1y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === range
                  ? 'bg-brand-green text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Active Subscribers</h3>
          <p className="text-3xl font-semibold text-gray-800 mt-2">498</p>
          <p className="text-sm text-green-600 mt-1">+12% from last month</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Monthly Revenue</h3>
          <p className="text-3xl font-semibold text-gray-800 mt-2">$22,500</p>
          <p className="text-sm text-green-600 mt-1">+8.3% from last month</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Churn Rate</h3>
          <p className="text-3xl font-semibold text-gray-800 mt-2">7.2%</p>
          <p className="text-sm text-red-600 mt-1">+1.5% from last month</p>
        </div>
      </div>
      
      {/* Subscription Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Subscription Activity</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="subscriptions" name="Active Subscriptions" fill="#4ade80" />
              <Bar dataKey="churned" name="Churned" fill="#f87171" />
              <Bar dataKey="recovered" name="Recovered" fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Revenue Trend</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={revenueData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                name="Monthly Revenue" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
