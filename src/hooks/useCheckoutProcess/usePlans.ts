
import { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/use-toast';
import { getSubscriptionPlans } from '../../utils/stripe';

/**
 * Hook to fetch and manage subscription plans
 */
export const usePlans = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plansData = await getSubscriptionPlans();
        setPlans(plansData);
        
        // Set the default selected plan (Scale)
        const defaultPlan = plansData.find(p => p.name === 'Scale');
        if (defaultPlan) {
          setSelectedPlan(defaultPlan.id);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
        toast({
          title: "Error",
          description: "Failed to load subscription plans. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    fetchPlans();
  }, [toast]);
  
  const handleSelectPlan = (planId: string) => {
    console.log('[CHECKOUT] Plan selected:', planId);
    setSelectedPlan(planId);
  };
  
  return { plans, selectedPlan, handleSelectPlan };
};
