
import React, { useState } from 'react'
import { 
  BarChart2, 
  TrendingUp, 
  ArrowRight,
  AlertCircle,
  MessageSquare
} from 'lucide-react'

// Mock data for at-risk customers
const mockAtRiskCustomers = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `Customer ${i + 1}`,
  company: `Company ${i + 1}`,
  riskScore: Math.floor(Math.random() * 30) + 70,
  riskFactors: [
    'Declining usage metrics',
    'Support tickets increasing',
    'Late payments',
    'Contract up for renewal soon'
  ].slice(0, Math.floor(Math.random() * 3) + 1),
  churnProbability: (Math.random() * 30 + 70).toFixed(1)
}))

const ChurnPrediction = () => {
  const [selectedSegment, setSelectedSegment] = useState('all')
  
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Churn Prediction</h1>
        <p className="text-gray-600">Identify and address at-risk customers before they churn.</p>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Current Churn Rate</h3>
            <div className="p-2 rounded-full bg-blue-50">
              <BarChart2 className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-800">4.8%</p>
          <p className="text-sm text-green-600 flex items-center mt-2">
            <TrendingUp className="h-4 w-4 mr-1" />
            0.5% decrease from last month
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">At-Risk Customers</h3>
            <div className="p-2 rounded-full bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-800">87</p>
          <p className="text-sm text-gray-500 mt-2">
            7% of total customer base
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Predicted Revenue Impact</h3>
            <div className="p-2 rounded-full bg-yellow-50">
              <TrendingUp className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-800">$138,500</p>
          <p className="text-sm text-red-600 mt-2">
            11% of annual recurring revenue
          </p>
        </div>
      </div>
      
      {/* Segments and Prediction Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Churn Prediction by Segment</h3>
            <select 
              className="border rounded-md px-3 py-1.5 text-sm"
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
            >
              <option value="all">All Segments</option>
              <option value="enterprise">Enterprise</option>
              <option value="mid-market">Mid-Market</option>
              <option value="small-business">Small Business</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
            {/* This would be replaced with an actual chart component */}
            <p className="text-gray-500">Churn prediction chart placeholder</p>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">Enterprise</p>
              <p className="text-lg font-semibold text-gray-800">2.1% <span className="text-sm text-green-600">▼</span></p>
            </div>
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">Mid-Market</p>
              <p className="text-lg font-semibold text-gray-800">4.7% <span className="text-sm text-green-600">▼</span></p>
            </div>
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">Small Business</p>
              <p className="text-lg font-semibold text-gray-800">8.3% <span className="text-sm text-red-600">▲</span></p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Common Churn Factors</h3>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-red-50 rounded-md">
              <div className="flex-1">
                <p className="font-medium text-gray-800">Low Product Usage</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
              <span className="text-lg font-semibold text-gray-800 ml-2">82%</span>
            </div>
            
            <div className="flex items-center p-3 bg-orange-50 rounded-md">
              <div className="flex-1">
                <p className="font-medium text-gray-800">Support Tickets</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <span className="text-lg font-semibold text-gray-800 ml-2">65%</span>
            </div>
            
            <div className="flex items-center p-3 bg-yellow-50 rounded-md">
              <div className="flex-1">
                <p className="font-medium text-gray-800">Billing Issues</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '49%' }}></div>
                </div>
              </div>
              <span className="text-lg font-semibold text-gray-800 ml-2">49%</span>
            </div>
            
            <div className="flex items-center p-3 bg-green-50 rounded-md">
              <div className="flex-1">
                <p className="font-medium text-gray-800">Contract Length</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '38%' }}></div>
                </div>
              </div>
              <span className="text-lg font-semibold text-gray-800 ml-2">38%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* At-Risk Customers */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">High-Risk Customers</h3>
          <button className="text-blue-600 text-sm hover:underline flex items-center">
            View all <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Factors
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Churn Probability
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockAtRiskCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                    <div className="text-sm text-gray-500">{customer.company}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 w-24">
                        <div 
                          className="bg-red-500 h-2.5 rounded-full" 
                          style={{ width: `${customer.riskScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{customer.riskScore}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {customer.riskFactors.map((factor, index) => (
                        <span key={index} className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded mr-2 mb-1">
                          {factor}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-red-600">{customer.churnProbability}%</div>
                    <div className="text-xs text-gray-500">In next 30 days</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
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
      </div>
    </div>
  )
}

export default ChurnPrediction
