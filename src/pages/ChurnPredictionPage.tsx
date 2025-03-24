
import React, { useState } from 'react';

type CustomerRisk = {
  id: string;
  name: string;
  email: string;
  plan: string;
  churnRisk: number;
  monthlyValue: number;
  factors: string[];
};

const mockAtRiskCustomers: CustomerRisk[] = [
  {
    id: '1',
    name: 'Globex Industries',
    email: 'accounts@globex.com',
    plan: 'Scale',
    churnRisk: 86,
    monthlyValue: 119,
    factors: ['Payment failures', 'Decreasing usage', 'Support inquiries'],
  },
  {
    id: '2',
    name: 'Oscorp',
    email: 'norman@oscorp.com',
    plan: 'Scale',
    churnRisk: 78,
    monthlyValue: 119,
    factors: ['Feature usage decline', 'Competitor inquiry'],
  },
  {
    id: '3',
    name: 'Dunder Mifflin',
    email: 'michael@dundermifflin.com',
    plan: 'Growth',
    churnRisk: 72,
    monthlyValue: 59,
    factors: ['Payment failures', 'Support complaints'],
  },
  {
    id: '4',
    name: 'Soylent Corp',
    email: 'info@soylent.com',
    plan: 'Pro',
    churnRisk: 68,
    monthlyValue: 249,
    factors: ['Low feature adoption', 'Competitive comparison request'],
  },
  {
    id: '5',
    name: 'InGen',
    email: 'hammond@ingen.com',
    plan: 'Pro',
    churnRisk: 65,
    monthlyValue: 249,
    factors: ['Login frequency decreased', 'Team size reduction'],
  },
  {
    id: '6',
    name: 'Cyberdyne Systems',
    email: 'miles@cyberdyne.com',
    plan: 'Scale',
    churnRisk: 62,
    monthlyValue: 119,
    factors: ['Payment failures', 'Support request spikes'],
  },
];

export default function ChurnPredictionPage() {
  const [atRiskCustomers] = useState<CustomerRisk[]>(mockAtRiskCustomers);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = atRiskCustomers.filter((customer) => {
    return (
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Calculate the total at-risk MRR
  const totalAtRiskMRR = atRiskCustomers.reduce((sum, customer) => sum + customer.monthlyValue, 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Churn Prediction</h1>

      {/* AI Insights section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-lg font-medium text-gray-800 mb-4">AI Churn Analysis</h2>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="font-medium text-blue-800 mb-2">Monthly Overview</h3>
            <p className="text-sm text-blue-700 mb-4">
              Our AI predictive model has identified {atRiskCustomers.length} customers at high risk of
              churning this month, representing ${totalAtRiskMRR} in monthly recurring revenue.
            </p>
            <div className="mt-3">
              <p className="text-sm font-medium text-blue-800">Recommended Actions:</p>
              <ul className="mt-1 text-sm text-blue-700 list-disc list-inside">
                <li>Schedule personal check-ins with high-value accounts</li>
                <li>Address payment method issues for customers with failures</li>
                <li>Send targeted re-engagement campaigns</li>
              </ul>
            </div>
          </div>
          <div className="flex-1 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="font-medium text-blue-800 mb-2">Common Churn Factors</h3>
            <ul className="text-sm text-blue-700 space-y-2">
              <li className="flex items-center justify-between">
                <span>Payment failures:</span>
                <span className="font-medium">38%</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Decreased feature usage:</span>
                <span className="font-medium">26%</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Support issues:</span>
                <span className="font-medium">19%</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Competitor inquiries:</span>
                <span className="font-medium">12%</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Team size changes:</span>
                <span className="font-medium">5%</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search at-risk customers..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* At-risk customers table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Churn Risk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Factors
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.plan}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                        <div 
                          className={`h-2.5 rounded-full ${
                            customer.churnRisk > 75 ? 'bg-red-500' : 
                            customer.churnRisk > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`} 
                          style={{ width: `${customer.churnRisk}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium ${
                        customer.churnRisk > 75 ? 'text-red-700' : 
                        customer.churnRisk > 60 ? 'text-yellow-700' : 'text-green-700'
                      }`}>
                        {customer.churnRisk}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${customer.monthlyValue}/mo
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {customer.factors.join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" className="text-blue-600 hover:text-blue-900 mr-3">
                      Contact
                    </a>
                    <a href="#" className="text-blue-600 hover:text-blue-900">
                      View Details
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
