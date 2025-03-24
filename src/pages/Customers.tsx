
import React, { useState } from 'react'
import { 
  Search,
  UserCheck,
  AlertCircle,
  Trash2,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronRight
} from 'lucide-react'

// Mock customer data
const mockCustomers = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `Customer ${i + 1}`,
  company: `Company ${i + 1}`,
  email: `customer${i + 1}@example.com`,
  status: i % 5 === 0 ? 'at-risk' : i % 3 === 0 ? 'churned' : 'active',
  subscriptionValue: Math.floor(Math.random() * 10000) + 1000,
  riskScore: i % 5 === 0 ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 40) + 20,
  lastActive: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toLocaleDateString()
}))

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [expandedCustomer, setExpandedCustomer] = useState<number | null>(null)
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }
  
  const filteredCustomers = mockCustomers
    .filter(customer => {
      // Apply search filter
      if (searchTerm && !customer.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !customer.company.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !customer.email.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      // Apply status filter
      if (statusFilter !== 'all' && customer.status !== statusFilter) {
        return false
      }
      
      return true
    })
    .sort((a, b) => {
      // Apply sorting
      const aValue = a[sortField as keyof typeof a]
      const bValue = b[sortField as keyof typeof b]
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue)
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      return 0
    })
  
  const handleExpandCustomer = (id: number) => {
    setExpandedCustomer(expandedCustomer === id ? null : id)
  }
  
  const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <UserCheck className="w-3 h-3 mr-1" />
          Active
        </span>
      )
    } else if (status === 'at-risk') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          At Risk
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <Trash2 className="w-3 h-3 mr-1" />
          Churned
        </span>
      )
    }
  }
  
  const RiskIndicator = ({ score }: { score: number }) => {
    let bgColor = 'bg-green-500'
    
    if (score > 70) {
      bgColor = 'bg-red-500'
    } else if (score > 40) {
      bgColor = 'bg-yellow-500'
    }
    
    return (
      <div className="flex items-center">
        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
          <div 
            className={`h-2.5 rounded-full ${bgColor}`} 
            style={{ width: `${score}%` }}
          ></div>
        </div>
        <span className="text-sm">{score}%</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
        <p className="text-gray-600">Manage and monitor your customer base.</p>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-4">
            <div className="relative inline-block text-left">
              <div className="flex">
                <button
                  type="button"
                  className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"
                >
                  <Filter className="h-5 w-5 mr-2 text-gray-400" />
                  <span>{statusFilter === 'all' ? 'All Statuses' : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`}</span>
                  <ChevronDown className="ml-2 h-5 w-5 text-gray-400" />
                </button>
              </div>
              <div className="hidden origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <button
                    className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100"
                    onClick={() => setStatusFilter('all')}
                  >
                    All Statuses
                  </button>
                  <button
                    className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100"
                    onClick={() => setStatusFilter('active')}
                  >
                    Active
                  </button>
                  <button
                    className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100"
                    onClick={() => setStatusFilter('at-risk')}
                  >
                    At Risk
                  </button>
                  <button
                    className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100"
                    onClick={() => setStatusFilter('churned')}
                  >
                    Churned
                  </button>
                </div>
              </div>
            </div>
            
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Export
            </button>
          </div>
        </div>
      </div>
      
      {/* Customer List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Customer
                    {sortField === 'name' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('subscriptionValue')}
                >
                  <div className="flex items-center">
                    Value
                    {sortField === 'subscriptionValue' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('riskScore')}
                >
                  <div className="flex items-center">
                    Risk Score
                    {sortField === 'riskScore' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('lastActive')}
                >
                  <div className="flex items-center">
                    Last Active
                    {sortField === 'lastActive' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <React.Fragment key={customer.id}>
                  <tr 
                    className={`${expandedCustomer === customer.id ? 'bg-blue-50' : 'hover:bg-gray-50'} cursor-pointer`}
                    onClick={() => handleExpandCustomer(customer.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${expandedCustomer === customer.id ? 'transform rotate-90' : ''}`} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.company}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={customer.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${customer.subscriptionValue.toLocaleString()}/year
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RiskIndicator score={customer.riskScore} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.lastActive}
                    </td>
                  </tr>
                  {expandedCustomer === customer.id && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-blue-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h4>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-gray-600">{customer.email}</p>
                            <p className="text-sm text-gray-600">{customer.company}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-2">Subscription Details</h4>
                            <p className="text-sm text-gray-600">Plan: Enterprise</p>
                            <p className="text-sm text-gray-600">Billing Cycle: Annual</p>
                            <p className="text-sm text-gray-600">Next Renewal: 03/15/2024</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-2">Actions</h4>
                            <div className="flex space-x-2">
                              <button className="px-3 py-1 text-xs font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50">
                                View Details
                              </button>
                              <button className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                                Contact
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Customers
