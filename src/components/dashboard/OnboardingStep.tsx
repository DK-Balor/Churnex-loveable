
import React from 'react';
import { CheckCircle, ChevronRight } from 'lucide-react';

interface OnboardingStepProps {
  title: string;
  description: string;
  action: string;
  completed: boolean;
  isLoading: boolean;
  onAction: () => void;
}

export default function OnboardingStep({
  title,
  description,
  action,
  completed,
  isLoading,
  onAction
}: OnboardingStepProps) {
  return (
    <div 
      className={`p-4 border rounded-lg transition-colors ${
        completed 
          ? 'border-green-200 bg-green-50' 
          : 'border-gray-200 hover:border-blue-200'
      }`}
    >
      <div className="flex items-start">
        <div className="mr-3 mt-1">
          {completed ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-medium text-gray-800 mb-1 sm:mb-0">{title}</h3>
            {!completed && (
              <button
                onClick={onAction}
                disabled={isLoading}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center mt-2 sm:mt-0 disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : action}
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}
