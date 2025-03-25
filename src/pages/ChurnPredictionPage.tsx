
import React, { useEffect, useState } from 'react';
import { predictChurnRisk } from '../utils/ai';
import ChurnPredictionTable from '../components/churn/ChurnPredictionTable';
import ChurnDetails from '../components/churn/ChurnDetails';
import { useToast } from '../components/ui/use-toast';

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

export default function ChurnPredictionPage() {
  const [customers, setCustomers] = useState<ChurnCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<ChurnCustomer | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchChurnPredictions = async () => {
      try {
        setIsLoading(true);
        const { data } = await predictChurnRisk();
        
        if (data) {
          setCustomers(data);
        }
      } catch (error) {
        console.error('Error fetching churn predictions:', error);
        toast({
          title: "Error",
          description: "Failed to load churn predictions. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchChurnPredictions();
  }, [toast]);

  // Calculate at-risk metrics
  const totalAtRiskCustomers = customers.length;
  const totalAtRiskRevenue = customers.reduce((sum, customer) => sum + customer.monthlyValue, 0);
  const averageRiskScore = customers.length > 0 
    ? Math.round(customers.reduce((sum, customer) => sum + customer.riskScore, 0) / customers.length) 
    : 0;

  const handleOpenCustomerDetails = (customer: ChurnCustomer) => {
    setSelectedCustomer(customer);
  };

  const handleCloseCustomerDetails = () => {
    setSelectedCustomer(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Churn Prediction</h1>
        <p className="text-gray-600">
          Our AI identifies customers at risk of churning based on behavior patterns and activity.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">At-Risk Customers</h3>
          <p className="text-3xl font-semibold text-gray-800 mt-2">{isLoading ? '-' : totalAtRiskCustomers}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">At-Risk MRR</h3>
          <p className="text-3xl font-semibold text-gray-800 mt-2">
            {isLoading ? '-' : `$${totalAtRiskRevenue.toLocaleString()}`}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Average Risk Score</h3>
          <p className="text-3xl font-semibold text-gray-800 mt-2">
            {isLoading ? '-' : `${averageRiskScore}%`}
          </p>
        </div>
      </div>

      {/* Main content */}
      <ChurnPredictionTable 
        customers={customers} 
        isLoading={isLoading} 
        onViewDetails={handleOpenCustomerDetails}
      />

      {/* Customer details modal */}
      {selectedCustomer && (
        <ChurnDetails 
          customer={selectedCustomer} 
          onClose={handleCloseCustomerDetails} 
        />
      )}

      {/* Additional information */}
      <div className="mt-8 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="text-md font-medium text-gray-800 mb-2">About Churn Prediction</h3>
        <p className="text-sm text-gray-600">
          Our AI analyzes customer behavior patterns including payment history, product usage, 
          and engagement metrics to identify customers who might be considering canceling. 
          Predictions are updated daily. Use the win-back suggestions to proactively engage
          with at-risk customers.
        </p>
      </div>
    </div>
  );
}
