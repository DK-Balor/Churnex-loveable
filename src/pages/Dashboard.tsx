
import React from 'react'
import { Link } from 'react-router-dom'
import { 
  BarChart2, 
  Users, 
  TrendingDown, 
  AlertCircle, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar
} from 'lucide-react'

// Mock data
const mockData = {
  activeSubscriptions: 1243,
  activeSubscriptionsChange: 5.2,
  atRiskCustomers: 87,
  atRiskCustomersChange: 12.5,
  recoveredRevenue: 24850,
  recoveredRevenueChange: -3.2,
  churnRate: 4.8,
  churnRateChange: -0.5,
  mrr: 125000,
  mrrChange: 8.1
}

const DashboardCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon 
}: { 
  title: string; 
  value: string | number; 
  change: number; 
  icon: React.ElementType 
}) => {
  const isPositive = change >= 0
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 font-medium">{title}</h3>
        <div className="p-2 rounded-full bg-blue-50">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-semibold text-gray-800">{value}</p>
        <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? (
            <ArrowUpRight className="h-4 w-4 mr-1" />
          ) : (
            <ArrowDownRight className="h-4 w-4 mr-1" />
          )}
          <span className="text-sm font-medium">{Math.abs(change)}%</span>
        </div>
      </div>
    </div>
  )
}

const Dashboard = () => {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome back. Here's an overview of your customer churn metrics.</p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        <DashboardCard 
          title="Active Subscriptions" 
          value={mockData.activeSubscriptions.toLocaleString()} 
          change={mockData.activeSubscriptionsChange} 
          icon={Users} 
        />
        
        <DashboardCard 
          title="At Risk Customers" 
          value={mockData.atRiskCustomers} 
          change={mockData.atRiskCustomersChange} 
          icon={AlertCircle} 
        />
        
        <DashboardCard 
          title="Recovered Revenue" 
          value={`$${mockData.recoveredRevenue.toLocaleString()}`} 
          change={mockData.recoveredRevenueChange} 
          icon={TrendingDown} 
        />
        
        <DashboardCard 
          title="Churn Rate" 
          value={`${mockData.churnRate}%`} 
          change={mockData.churnRateChange} 
          icon={BarChart2} 
        />
        
        <DashboardCard 
          title="Monthly Revenue" 
          value={`$${mockData.mrr.toLocaleString()}`} 
          change={mockData.mrrChange} 
          icon={DollarSign} 
        />
      </div>
      
      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Churn Overview</h3>
              <select className="border rounded-md px-3 py-1.5 text-sm">
                <option>Last 30 days</option>
                <option>Last 60 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
              {/* This would be replaced with an actual chart component */}
              <p className="text-gray-500">Churn trend chart placeholder</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Revenue Impact</h3>
              <select className="border rounded-md px-3 py-1.5 text-sm">
                <option>Last 30 days</option>
                <option>Last 60 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
              {/* This would be replaced with an actual chart component */}
              <p className="text-gray-500">Revenue impact chart placeholder</p>
            </div>
          </div>
        </div>
        
        {/* Side Panels */}
        <div className="space-y-8">
          {/* At-Risk Customers */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">At-Risk Customers</h3>
              <Link to="/customers" className="text-blue-600 text-sm hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center p-3 hover:bg-gray-50 rounded-md">
                  <div className="bg-red-100 p-2 rounded-full mr-4">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Company {item}</p>
                    <p className="text-sm text-gray-500">Risk score: {90 - item * 5}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Upcoming Renewals */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Upcoming Renewals</h3>
              <Link to="/customers" className="text-blue-600 text-sm hover:underline">
                View calendar
              </Link>
            </div>
            <div className="flex items-center justify-center mb-4">
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-gray-700 font-medium">This week: 24 renewals</span>
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center p-3 hover:bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium text-gray-800">Company {item + 10}</p>
                    <p className="text-sm text-gray-500">Renews in {item} day{item > 1 ? 's' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
