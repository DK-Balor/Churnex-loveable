
import React from 'react';
import PlanCard from './PlanCard';

interface PlanSelectorProps {
  plans: any[];
  selectedPlan: string | null;
  onSelectPlan: (planId: string) => void;
}

const PlanSelector: React.FC<PlanSelectorProps> = ({ plans, selectedPlan, onSelectPlan }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
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
