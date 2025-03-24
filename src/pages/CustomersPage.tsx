
import React, { useState, useEffect } from 'react';
import { Search, Filter, UserPlus, Download, ArrowUpDown, AlertCircle, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../utils/stripe';

// Mock customer data
const mockCustomers = [
  {
    id: '1',
    name: 'Acme Corporation',
    email: 'billing@acmecorp.com',
    plan: 'pro',
    mrr: 249,
    status: 'active',
    joinedDate: '2023-08-15',
    lastActive: '2023-10-12',
    riskScore: 12
  },
  {
    id: '2',
    name: 'TechStart Inc',
    email: 'finance@techstart.io',
    plan: 'scale',
    mrr: 119,
    status: 'at_risk',
    joinedDate: '2023-05-22',
    lastActive: '2023-10-02',
    riskScore: 68
  },
  {
    id: '3',
    name: 'Global Solutions Ltd',
    email: 'accounts@globalsolutions.com',
    plan: 'pro',
    mrr: 249,
    status: 'past_due',
    joinedDate: '2023-07-08',
    lastActive: '2023-09-28',
    riskScore: 85
  },
  {
    id: '4',
    name: 'Innovative Designs',
    email: 'billing@innovativedesigns.co',
    plan: 'growth',
    mrr: 59,
    status: 'active',
    joinedDate: '2023-09-30',
    lastActive: '2023-10-11',
    riskScore: 5
  },
  {
    id: '5',
    name: 'Summit Enterprises',
    email: 'finance@summitent.net',
    plan: 'scale',
    mrr: 119,
    status: 'active',
    joinedDate: '2023-04-14',
    lastActive: '2023-10-10',
    riskScore: 28
  },
  {
    id: '6',
    name: 'Horizon Media Group',
    email: 'accounts@horizonmedia.org',
    plan: 'growth',
    mrr: 59,
    status: 'canceled',
    joinedDate: '2023-06-02',
    lastActive: '2023-09-15',
    riskScore: 95
  },
  {
    id: '7',
    name: 'Quantum Industries',
    email: 'billing@quantumindustries.com',
    plan: 'pro',
    mrr: 249,
    status: 'active',
    joinedDate: '2023-01-10',
    lastActive: '2023-10-12',
    riskScore: 10
  },
  {
    id: '8',
    name: 'Pinnacle Systems',
    email: 'finance@pinnaclesys.co',
    plan: 'scale',
    mrr: 119,
    status: 'active',
    joinedDate: '2023-07-20',
    lastActive: '2023-10-11',
    riskScore: 32
  }
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Update filtered customers based on search and filters
  useEffect(() => {
    let filteredCustomers = mockCustomers;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filteredCustomers = filteredCustomers.filter(customer => customer.status === statusFilter);
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredCustomers = filteredCustomers.filter(customer => 
        customer.name.toLowerCase().includes(term) || 
        customer.email.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    if (sortField) {
      filteredCustomers = [...filteredCustomers].sort((a, b) => {
        if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
        if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    setCustomers(filteredCustomers);
  }, [searchTerm, statusFilter, sortField, sortDirection]);
  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'at_risk': return 'bg-amber-100 text-amber-800';
      case 'past_due': return 'bg-red-100 text-red-800';
      case 'canceled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatStatus = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'at_risk': return 'At Risk';
      case 'past_due': return 'Past Due';
      case 'canceled': return 'Canceled';
      default: return status;
    }
  };
  
  const formatPlan = (plan) => {
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };
  
  // Calculate summary stats
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const atRiskCustomers = customers.filter(c => c.status === 'at_risk').length;
  const totalMRR = customers.filter(c => c.status !== 'canceled').reduce((sum, c) => sum + c.mrr, 0);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Customers</h1>
          <p className="text-gray-600">Manage your customer accounts and monitor subscription status.</p>
        </div>
        <button className="px-4 py-2 bg-brand-green text-white rounded-md hover:bg-brand-green-600 flex items-center">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Customer
        </button>
      </div>
      
      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Customers</h3>
          <p className="text-3xl font-semibold text-gray-800 mt-2">{totalCustomers}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Active Subscribers</h3>
          <p className="text-3xl font-semibold text-gray-800 mt-2">{activeCustomers}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">At-Risk Customers</h3>
          <p className="text-3xl font-semibold text-gray-800 mt-2">{atRiskCustomers}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total MRR</h3>
          <p className="text-3xl font-semibold text-gray-800 mt-2">{formatCurrency(totalMRR)}</p>
        </div>
      </div>
      
      {/* AI Alert for at-risk customers */}
      {atRiskCustomers > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-amber-800 mb-1">Customer Risk Alert</h3>
            <p className="text-amber-700 text-sm">
              Our AI has detected {atRiskCustomers} customers at risk of churning. Review the customer list
              below and check the churn prediction page for more details.
            </p>
            <a 
              href="/dashboard/churn-prediction" 
              className="text-sm text-amber-800 font-medium hover:text-amber-900 mt-2 inline-flex items-center"
            >
              View Churn Predictions
              <ChevronRight className="h-4 w-4 ml-1" />
            </a>
          </div>
        </div>
      )}
      
      {/* Search and filter tools */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          {/* Search bar */}
          <div className="relative md:w-1/3">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Status filter */}
          <div className="relative md:w-1/3">
            <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <select
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="at_risk">At Risk</option>
              <option value="past_due">Past Due</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
          
          {/* Export button */}
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center justify-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>
      
      {/* Customers table */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Customer
                    {sortField === 'name' && (
                      <ArrowUpDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('plan')}
                >
                  <div className="flex items-center">
                    Plan
                    {sortField === 'plan' && (
                      <ArrowUpDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('mrr')}
                >
                  <div className="flex items-center">
                    MRR
                    {sortField === 'mrr' && (
                      <ArrowUpDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    {sortField === 'status' && (
                      <ArrowUpDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('joinedDate')}
                >
                  <div className="flex items-center">
                    Joined
                    {sortField === 'joinedDate' && (
                      <ArrowUpDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('riskScore')}
                >
                  <div className="flex items-center">
                    Risk Score
                    {sortField === 'riskScore' && (
                      <ArrowUpDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatPlan(customer.plan)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(customer.mrr)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                      {formatStatus(customer.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(customer.joinedDate).toLocaleDateString()}
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
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" className="text-blue-600 hover:text-blue-900">Details</a>
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
