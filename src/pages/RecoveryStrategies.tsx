
import React, { useState } from 'react'
import { 
  PieChart, 
  BarChart2, 
  MoveRight, 
  CreditCard,
  ArrowUpRight,
  Mail,
  MessageSquare,
  Clock
} from 'lucide-react'

// Mock data
const mockCampaigns = [
  {
    id: 1,
    name: 'Win-back: 20% discount',
    status: 'active',
    target: 'Churned < 30 days',
    sent: 126,
    opened: 98,
    converted: 14,
    conversionRate: 11.1
  },
  {
    id: 2,
    name: 'Price sensitive: Annual offer',
    status: 'active',
    target: 'At risk - Price concerns',
    sent: 84,
    opened: 72,
    converted: 29,
    conversionRate: 34.5
  },
  {
    id: 3,
    name: 'Feature education series',
    status: 'paused',
    target: 'Low usage accounts',
    sent: 215,
    opened: 187,
    converted: 42,
    conversionRate: 19.5
  },
  {
    id: 4,
    name: 'Failed payment recovery',
    status: 'active',
    target: 'Payment failures',
    sent: 78,
    opened: 64,
    converted: 51,
    conversionRate: 65.4
  },
]

const mockPayments = [
  {
    id: 1,
    company: 'Acme Co',
    amount: 2499,
    failureReason: 'Expired card',
    status: 'recovered',
    attempts: 2,
    recoveredAt: '2023-12-15'
  },
  {
    id: 2,
    company: 'TechServe Inc',
    amount: 4999,
    failureReason: 'Insufficient funds',
    status: 'in progress',
    attempts: 1,
    recoveredAt: null
  },
  {
    id: 3,
    company: 'Global Solutions',
    amount: 1299,
    failureReason: 'Declined by bank',
    status: 'in progress',
    attempts: 1,
    recoveredAt: null
  },
  {
    id: 4,
    company: 'Marketing Pro',
    amount: 899,
    failureReason: 'Expired card',
    status: 'recovered',
    attempts: 1,
    recoveredAt: '2023-12-18'
  },
  {
    id: 5,
    company: 'Innovate LLC',
    amount: 3499,
    failureReason: 'Invalid card',
    status: 'failed',
    attempts: 3,
    recoveredAt: null
  }
]

const RecoveryStrategies = () => {
  const [activeTab, setActiveTab] = useState('campaigns')
  
  const totalRecovered = mockPayments
    .filter(p => p.status === 'recovered')
    .reduce((sum, p) => sum + p.amount, 0)
  
  const recoveryRate = Math.round((mockPayments.filter(p => p.status === 'recovered').length / mockPayments.length) * 100)
  
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Recovery Strategies</h1>
        <p className="text-gray-600">Win back customers and recover lost revenue.</p>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Revenue Recovered</h3>
            <div className="p-2 rounded-full bg-green-50">
              <BarChart2 className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-800">${(totalRecovered).toLocaleString()}</p>
          <p className="text-sm text-green-600 flex items-center mt-2">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            12% increase from last month
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Payment Recovery Rate</h3>
            <div className="p-2 rounded-full bg-blue-50">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-800">{recoveryRate}%</p>
          <p className="text-sm text-green-600 mt-2">
            5% higher than industry average
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Campaign Conversion Rate</h3>
            <div className="p-2 rounded-full bg-purple-50">
              <PieChart className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-800">24.3%</p>
          <p className="text-sm text-green-600 mt-2">
            3.7% increase from previous campaigns
          </p>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="border-b">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'campaigns'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('campaigns')}
            >
              Win-Back Campaigns
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'payments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('payments')}
            >
              Payment Recovery
            </button>
          </nav>
        </div>
        
        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Active Recovery Campaigns</h3>
              <button className="flex items-center text-white bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700">
                <span>Create Campaign</span>
                <MoveRight className="ml-2 h-4 w-4" />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target Audience
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sent
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Opened
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Converted
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conversion Rate
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          campaign.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {campaign.target}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {campaign.sent}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {campaign.opened} ({Math.round((campaign.opened / campaign.sent) * 100)}%)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {campaign.converted}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {campaign.conversionRate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900">Edit</button>
                        <button className="text-blue-600 hover:text-blue-900 ml-4">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Campaign Performance</h3>
              <div className="h-64 bg-gray-50 rounded-md flex items-center justify-center">
                {/* This would be replaced with an actual chart component */}
                <p className="text-gray-500">Campaign performance chart placeholder</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Failed Payment Recovery</h3>
              <div className="flex space-x-3">
                <button className="flex items-center text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-50">
                  <Mail className="mr-2 h-4 w-4" />
                  <span>Email Settings</span>
                </button>
                <button className="flex items-center text-white bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700">
                  <span>Recovery Settings</span>
                  <MoveRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md mb-6">
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-semibold text-blue-800">Payment Recovery Schedule</h4>
                  <p className="text-sm text-blue-600">Automatic retries: 1st retry after 24 hours, 2nd retry after 3 days, 3rd retry after 7 days</p>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Failure Reason
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Retry Attempts
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recovered Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payment.company}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${payment.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.failureReason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payment.status === 'recovered'
                            ? 'bg-green-100 text-green-800'
                            : payment.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.attempts} of 3
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.recoveredAt || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          Manual Retry
                        </button>
                        <button className="flex items-center text-blue-600 hover:text-blue-900">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Contact
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recovery Rate by Failure Reason</h3>
              <div className="h-64 bg-gray-50 rounded-md flex items-center justify-center">
                {/* This would be replaced with an actual chart component */}
                <p className="text-gray-500">Recovery rate chart placeholder</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecoveryStrategies
