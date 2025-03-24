
import React from 'react';
import PlanCard from './PlanCard';

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
}

interface PlanSelectorProps {
  plans: Plan[];
  selectedPlan: string | null;
  onSelectPlan: (planId: string) => void;
}

const PlanSelector: React.FC<PlanSelectorProps> = ({ plans, selectedPlan, onSelectPlan }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-8 md:mb-12">
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          isSelected={selectedPlan === plan.id}
          onSelect={onSelectPlan}
        />
      ))}
    </div>
  );
};

export default PlanSelector;
