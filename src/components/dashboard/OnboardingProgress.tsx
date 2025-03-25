
import React from 'react';

interface OnboardingProgressProps {
  completedSteps: number;
  totalSteps: number;
}

export default function OnboardingProgress({ completedSteps, totalSteps }: OnboardingProgressProps) {
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div className="mb-6">
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="absolute h-full bg-brand-green transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-sm text-gray-600">{completedSteps} of {totalSteps} completed</span>
        {completedSteps > 0 && completedSteps < totalSteps && (
          <span className="text-sm font-medium text-brand-green">{progress.toFixed(0)}% complete</span>
        )}
      </div>
    </div>
  );
}
