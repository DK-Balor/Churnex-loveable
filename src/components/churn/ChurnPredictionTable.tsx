import React from 'react';
import { ArrowUpDown, Eye } from 'lucide-react';

interface ChurnCustomer {
  id: string;
  customerName: string;
  email: string;
  riskScore: number;
  riskFactors: string[];
  monthlyValue: number;
  predictedChurnDate: string;
  lastActivity: string;
}

interface ChurnPredictionTableProps {
  customers: ChurnCustomer[];
  isLoading: boolean;
  onViewDetails: (customer: ChurnCustomer) => void;
}

export default function ChurnPredictionTable({ 
  customers, 
  isLoading,
  onViewDetails 
}: ChurnPredictionTableProps) {
  const [sortField, setSortField] = React.useState<keyof ChurnCustomer>('riskScore');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof ChurnCustomer) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedCustomers = [...customers].sort((a, b) => {
    // Special case for dates
    if (sortField === 'predictedChurnDate' || sortField === 'lastActivity') {
      return sortDirection === 'asc' 
        ? new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime()
        : new Date(b[sortField]).getTime() - new Date(a[sortField]).getTime();
    }

    // Sort by string or number
    const field = sortField;
    return sortDirection === 'asc'
      ? a[field] > b[field] ? 1 : -1
      : a[field] < b[field] ? 1 : -1;
  });

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid grid-cols-5 gap-4">
                <div className="h-4 bg-gray-200 rounded col-span-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                onClick={() => handleSort('customerName')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                <div className="flex items-center">
                  Customer
                  {sortField === 'customerName' && <ArrowUpDown className="ml-1 h-4 w-4" />}
                </div>
              </th>
              <th 
                onClick={() => handleSort('riskScore')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                <div className="flex items-center">
                  Risk Score
                  {sortField === 'riskScore' && <ArrowUpDown className="ml-1 h-4 w-4" />}
                </div>
              </th>
              <th 
                onClick={() => handleSort('monthlyValue')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                <div className="flex items-center">
                  Monthly Value
                  {sortField === 'monthlyValue' && <ArrowUpDown className="ml-1 h-4 w-4" />}
                </div>
              </th>
              <th 
                onClick={() => handleSort('predictedChurnDate')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer whitespace-nowrap"
              >
                <div className="flex items-center">
                  Predicted Churn
                  {sortField === 'predictedChurnDate' && <ArrowUpDown className="ml-1 h-4 w-4" />}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">{customer.customerName}</div>
                    <div className="text-sm text-gray-500">{customer.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    customer.riskScore >= 70 ? 'bg-red-100 text-red-800' :
                    customer.riskScore >= 40 ? 'bg-amber-100 text-amber-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {customer.riskScore}%
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${customer.monthlyValue}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(customer.predictedChurnDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onViewDetails(customer)}
                    className="text-blue-600 hover:text-blue-900 flex items-center justify-end"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Details
                  </button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No at-risk customers detected.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
