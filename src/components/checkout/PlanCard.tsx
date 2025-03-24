
import React from 'react';
import { formatCurrency } from '../../utils/stripe';
import { CheckCircle } from 'lucide-react';

interface PlanCardProps {
  plan: {
    id: string;
    name: string;
    price: number;
    interval: string;
    features: string[];
  };
  isSelected: boolean;
  onSelect: (planId: string) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, isSelected, onSelect }) => {
  return (
    <div
      className={`bg-white rounded-lg border-2 p-6 transition-all ${
        isSelected ? 'border-brand-green shadow-md' : 'border-gray-200'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-brand-dark-800">{plan.name}</h2>
        {plan.name === 'Scale' && (
          <span className="bg-brand-green text-white text-xs px-2 py-1 rounded-full">Popular</span>
        )}
      </div>
      
      <div className="mb-6">
        <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
        <span className="text-brand-dark-500">/{plan.interval}</span>
      </div>
      
      <ul className="space-y-3 mb-8">
        {plan.features.map((feature: string, index: number) => (
          <li key={index} className="flex items-start">
            <CheckCircle className="h-5 w-5 text-brand-green mt-0.5 mr-2" />
            <span className="text-brand-dark-600">{feature}</span>
          </li>
        ))}
      </ul>
      
      <button
        onClick={() => onSelect(plan.id)}
        className={`w-full py-3 rounded-md font-medium transition-colors ${
          isSelected
            ? 'bg-brand-green text-white hover:bg-brand-green-600'
            : 'bg-white text-brand-dark-700 border border-brand-dark-300 hover:bg-gray-50'
        }`}
      >
        {isSelected ? 'Selected' : 'Select Plan'}
      </button>
    </div>
  );
};

export default PlanCard;
