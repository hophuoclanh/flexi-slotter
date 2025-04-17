// components/Stepper.jsx
import React from 'react';

export default function Stepper({ steps = [], currentStep = 1 }) {
  return (
    <div className="flex items-center justify-between bg-[var(--bg-color)] p-4 rounded-lg w-[950px]">
      {steps.map((label, idx) => {
        const step = idx + 1;
        const isCompleted = step < currentStep;
        const isActive    = step === currentStep;

        const circleClasses = [
          'h-8 w-8 flex items-center justify-center rounded-full border-2',
          isCompleted
            ? 'bg-[var(--primary-color)] border-[var(--primary-color)] text-white'
            : isActive
            ? 'bg-white border-[var(--primary-color)] text-[var(--primary-color)]'
            : 'bg-white border-[var(--border-color)] text-[var(--secondary-color)]'
        ].join(' ');

        const labelClasses = [
          'text-sm mt-2',
          isCompleted || isActive
            ? 'text-[var(--text-color)] font-semibold'
            : 'text-[var(--secondary-color)]'
        ].join(' ');

        return (
          <React.Fragment key={label}>
            {/* Circle + label */}
            <div className="flex flex-col items-center flex-1">
              <div className={circleClasses}>
                {isCompleted ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : step}
              </div>
              <div className={labelClasses}>{label}</div>
            </div>

            {/* Divider line (not after last) */}
            {step < steps.length && (
              <div
                className={`h-px flex-1 mx-2 ${
                  isCompleted
                    ? 'bg-[var(--primary-color)]'
                    : 'bg-[var(--border-color)]'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
