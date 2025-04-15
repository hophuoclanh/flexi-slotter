import React, { useState } from 'react';

const steps = ['Select Date', 'Select Slot', 'Guest Information'];

const StepProcessBar = () => {
  const [currentStep, setCurrentStep] = useState(0);

  // Handle navigation to previous and next step
  const goToPreviousStep = () =>
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  const goToNextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));

  return (
    <div className="flex flex-col items-center">
      {/* Step Indicator */}
      <div className="flex justify-center items-center gap-4 py-4">
        {steps.map((label, index) => {
          const isActive = index === currentStep;
          return (
            <div
              key={index}
              className={`flex items-center gap-2 ${
                isActive ? 'font-bold text-blue-600' : 'opacity-60'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  isActive ? 'border-blue-600' : 'border-gray-300'
                }`}
              >
                {index + 1}
              </div>
              <span>{label}</span>
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4">
        <button
          onClick={goToPreviousStep}
          disabled={currentStep === 0}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={goToNextStep}
          disabled={currentStep === steps.length - 1}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StepProcessBar;
