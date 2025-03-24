
import React, { useState } from 'react';

type Subscription = {
  id: string;
  customerName: string;
  plan: string;
  amount: number;
  status: 'Active' | 'Past Due' | 'Canceled';
  nextBillingDate: string;
  paymentMethod: string;
};

const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    customerName: 'Acme Corporation',
    plan: 'Pro',
    amount: 249,
    status: 'Active',
    nextBillingDate: '2023-11-15',
    paymentMethod: 'Visa •••• 4242',
  },
  {
    id: '2',
    customerName: 'Globex Industries',
    plan: 'Scale',
    amount: 119,
    status: 'Past Due',
    nextBillingDate: '2023-10-22',
    paymentMethod: 'Mastercard •••• 5555',
  },
  {
    id: '3',
    customerName: 'Initech LLC',
    plan: 'Growth',
    amount: 59,
    status: 'Active',
    nextBillingDate: '2023-12-01',
    paymentMethod: 'Amex •••• 3782',
  },
  {
    id: '4',
    customerName: 'Stark Industries',
    plan: 'Pro',
    amount: 249,
    status: 'Active',
    nextBillingDate: '2023-11-14',
    paymentMethod: 'Visa •••• 1234',
  },
  {
    id: '5',
    customerName: 'Wayne Enterprises',
    plan: 'Pro',
    amount: 249,
    status: 'Canceled',
    nextBillingDate: 'N/A',
    paymentMethod: 'Mastercard •••• 9876',
  },
  {
    id: '6',
    customerName: 'Oscorp',
    plan: 'Scale',
    amount: 119,
    status: 'Past Due',
    nextBillingDate: '2023-10-17',
    paymentMethod: 'Visa •••• 6543',
  },
];

export default function SubscriptionsPage() {
  const [subscriptions] = useState<Subscription[]>(mockSubscriptions);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredSubscriptions = subscriptions.filter((subscription) => {
    return statusFilter === 'all' || subscription.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Past Due':
        return 'bg-yellow-100 text-yellow-800';
      case 'Canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate summary stats
  const activeSubscriptions = subscriptions.filter(s => s.status === 'Active').length;
  const pastDueSubscriptions = subscriptions.filter(s => s.status === 'Past Due').length;
  const totalMRR = subscriptions
    .filter(s => s.status !== 'Canceled')
    .reduce((sum, s) => sum + s.amount, 0);
  const atRiskMRR = subscriptions
    .filter(s => s.status === 'Past Due')
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Subscriptions</h1>
      
      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Active Subscriptions</h3>
          <p className="text-3xl font-semibold text-gray-800 mt-2">{activeSubscriptions}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Past Due</h3>
          <p className="text-3xl font-semibold text-gray-800 mt-2">{pastDueSubscriptions}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total MRR</h3>
          <p className="text-3xl font-semibold text-gray-800 mt-2">${totalMRR}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">At-Risk MRR</h3>
          <p className="text-3xl font-semibold text-gray-800 mt-2">${atRiskMRR}</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex justify-end mb-6">
        <select
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="past due">Past Due</option>
          <option value="canceled">Canceled</option>
        </select>
      </div>
      
      {/* Subscriptions table */}
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
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Billing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubscriptions.map((subscription) => (
                <tr key={subscription.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{subscription.customerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{subscription.plan}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${subscription.amount}/mo</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(subscription.status)}`}>
                      {subscription.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subscription.nextBillingDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subscription.paymentMethod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" className="text-blue-600 hover:text-blue-900 mr-3">
                      Edit
                    </a>
                    <a href="#" className="text-blue-600 hover:text-blue-900">
                      Manage
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
