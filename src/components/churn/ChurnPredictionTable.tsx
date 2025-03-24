
import React, { useState } from 'react';
import { formatCurrency } from '../../utils/stripe';
import { generateWinBackSuggestions } from '../../utils/ai';
import { useToast } from '../../components/ui/use-toast';
import { AlertCircle, CheckCircle, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';

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
}

export default function ChurnPredictionTable({ customers, isLoading }: ChurnPredictionTableProps) {
  const [expandedCustomers, setExpandedCustomers] = useState<Record<string, boolean>>({});
  const [generatingSuggestions, setGeneratingSuggestions] = useState<Record<string, boolean>>({});
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});
  const { toast } = useToast();

  const toggleCustomer = (customerId: string) => {
    setExpandedCustomers(prev => ({
      ...prev,
      [customerId]: !prev[customerId]
    }));
  };

  const handleGenerateSuggestions = async (customer: ChurnCustomer) => {
    setGeneratingSuggestions(prev => ({
      ...prev,
      [customer.id]: true
    }));

    try {
      const { data } = await generateWinBackSuggestions(customer.id, customer);
      
      if (data?.suggestions) {
        setSuggestions(prev => ({
          ...prev,
          [customer.id]: data.suggestions
        }));
        
        toast({
          title: "Suggestions Generated",
          description: "AI has created win-back suggestions for this customer.",
        });
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to generate win-back suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingSuggestions(prev => ({
        ...prev,
        [customer.id]: false
      }));
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'bg-red-100 text-red-800';
    if (score >= 50) return 'bg-amber-100 text-amber-800';
    return 'bg-green-100 text-green-800';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <AlertCircle className="h-10 w-10 text-blue-500 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No Customers at Risk</h3>
        <p className="text-gray-600">
          Great news! Our AI hasn't detected any customers at high risk of churning right now.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Risk Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monthly Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Predicted Churn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Activity
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <React.Fragment key={customer.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{customer.customerName}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskColor(customer.riskScore)}`}>
                      {customer.riskScore}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(customer.monthlyValue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(customer.predictedChurnDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(customer.lastActivity).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => toggleCustomer(customer.id)}
                      className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                    >
                      Details
                      {expandedCustomers[customer.id] ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                    </button>
                  </td>
                </tr>
                {expandedCustomers[customer.id] && (
                  <tr className="bg-gray-50">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Risk Factors:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {customer.riskFactors.map((factor, idx) => (
                            <li key={idx} className="text-sm text-gray-700">{factor}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Win-back suggestions section */}
                      <div className="mt-4 border-t pt-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-gray-900">Win-back Suggestions:</h4>
                          <button
                            onClick={() => handleGenerateSuggestions(customer)}
                            disabled={generatingSuggestions[customer.id]}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 inline-flex items-center"
                          >
                            {generatingSuggestions[customer.id] ? (
                              <>
                                <div className="animate-spin h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full mr-1"></div>
                                Generating...
                              </>
                            ) : (
                              <>
                                <MessageSquare className="h-3 w-3 mr-1" />
                                {suggestions[customer.id] ? 'Regenerate' : 'Generate Suggestions'}
                              </>
                            )}
                          </button>
                        </div>

                        {suggestions[customer.id] ? (
                          <ul className="list-none space-y-2">
                            {suggestions[customer.id].map((suggestion, idx) => (
                              <li key={idx} className="bg-white p-2 rounded border border-gray-200 flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500 italic">
                            Click "Generate Suggestions" to get AI-powered win-back recommendations for this customer.
                          </p>
                        )}
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
  );
}
