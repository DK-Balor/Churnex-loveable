
import React, { useState } from 'react';

type RecoveryAttempt = {
  id: string;
  customerName: string;
  email: string;
  failedAmount: number;
  failureDate: string;
  status: 'Pending' | 'Recovered' | 'Failed';
  attempts: number;
  nextAttempt: string | null;
};

const mockRecoveryAttempts: RecoveryAttempt[] = [
  {
    id: '1',
    customerName: 'Globex Industries',
    email: 'accounts@globex.com',
    failedAmount: 119,
    failureDate: '2023-10-22',
    status: 'Pending',
    attempts: 1,
    nextAttempt: '2023-10-25',
  },
  {
    id: '2',
    customerName: 'Oscorp',
    email: 'norman@oscorp.com',
    failedAmount: 119,
    failureDate: '2023-10-17',
    status: 'Pending',
    attempts: 2,
    nextAttempt: '2023-10-24',
  },
  {
    id: '3',
    customerName: 'Dunder Mifflin',
    email: 'michael@dundermifflin.com',
    failedAmount: 59,
    failureDate: '2023-10-05',
    status: 'Recovered',
    attempts: 3,
    nextAttempt: null,
  },
  {
    id: '4',
    customerName: 'Cyberdyne Systems',
    email: 'miles@cyberdyne.com',
    failedAmount: 119,
    failureDate: '2023-09-28',
    status: 'Failed',
    attempts: 6,
    nextAttempt: null,
  },
];

export default function RecoveryPage() {
  const [recoveryAttempts] = useState<RecoveryAttempt[]>(mockRecoveryAttempts);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredAttempts = recoveryAttempts.filter((attempt) => {
    return statusFilter === 'all' || attempt.status.toLowerCase() === statusFilter.toLowerCase();
  });

  // Calculate stats
  const totalAtRisk = recoveryAttempts.reduce((sum, attempt) => {
    if (attempt.status !== 'Recovered') {
      return sum + attempt.failedAmount;
    }
    return sum;
  }, 0);

  const totalRecovered = recoveryAttempts
    .filter(attempt => attempt.status === 'Recovered')
    .reduce((sum, attempt) => sum + attempt.failedAmount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Recovered':
        return 'bg-green-100 text-green-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Payment Recovery</h1>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Failed Payments</h3>
          <p className="text-3xl font-semibold text-gray-800 mt-2">{recoveryAttempts.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">At-Risk Revenue</h3>
          <p className="text-3xl font-semibold text-gray-800 mt-2">${totalAtRisk}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Recovered Revenue</h3>
          <p className="text-3xl font-semibold text-gray-800 mt-2">${totalRecovered}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Recovery Rate</h3>
          <p className="text-3xl font-semibold text-gray-800 mt-2">
            {recoveryAttempts.length > 0
              ? Math.round(
                  (recoveryAttempts.filter((a) => a.status === 'Recovered').length /
                    recoveryAttempts.length) *
                    100
                )
              : 0}
            %
          </p>
        </div>
      </div>
      
      {/* Recovery strategies */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Automated Recovery Workflows</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
            <h3 className="font-medium text-blue-800 mb-2">Dunning Emails</h3>
            <p className="text-sm text-blue-700">
              Automatic payment retry and customer notification sequence over 14 days.
            </p>
            <p className="text-sm font-medium text-blue-800 mt-2">Success rate: 65%</p>
          </div>
          <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
            <h3 className="font-medium text-blue-800 mb-2">SMS Reminders</h3>
            <p className="text-sm text-blue-700">
              Direct text message alerts for payment failures with update payment link.
            </p>
            <p className="text-sm font-medium text-blue-800 mt-2">Success rate: 48%</p>
          </div>
          <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
            <h3 className="font-medium text-blue-800 mb-2">Card Updater</h3>
            <p className="text-sm text-blue-700">
              Automated card information updates through card network connections.
            </p>
            <p className="text-sm font-medium text-blue-800 mt-2">Success rate: 72%</p>
          </div>
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
          <option value="pending">Pending</option>
          <option value="recovered">Recovered</option>
          <option value="failed">Failed</option>
        </select>
      </div>
      
      {/* Recovery attempts table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Failed Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Failure Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attempts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Attempt
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttempts.map((attempt) => (
                <tr key={attempt.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{attempt.customerName}</div>
                        <div className="text-sm text-gray-500">{attempt.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${attempt.failedAmount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attempt.failureDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(attempt.status)}`}>
                      {attempt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attempt.attempts}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attempt.nextAttempt || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" className="text-blue-600 hover:text-blue-900 mr-3">
                      Contact
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
