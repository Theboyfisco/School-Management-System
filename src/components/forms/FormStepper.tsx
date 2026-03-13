import { CheckCircleIcon } from "@heroicons/react/24/solid";

interface FormStepperProps {
  steps: { label: string; icon?: React.ReactNode }[];
  currentStep: number;
}

const FormStepper = ({ steps, currentStep }: FormStepperProps) => {
  return (
    <div className="mb-8 w-full px-2">
      <div className="flex justify-between items-center relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-surface-200 dark:bg-surface-800 rounded-full z-0"></div>
        
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-500 rounded-full z-0 transition-all duration-300 ease-in-out"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step, index) => {
          const isCompleted = currentStep > index;
          const isCurrent = currentStep === index;
          
          return (
            <div key={step.label} className="relative z-10 flex flex-col items-center gap-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 shadow-sm
                  ${isCompleted 
                    ? 'bg-primary-500 border-primary-100 dark:border-primary-900/50 text-white' 
                    : isCurrent 
                      ? 'bg-white dark:bg-surface-900 border-primary-500 text-primary-500 scale-110 shadow-primary-500/20' 
                      : 'bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-700 text-surface-400 dark:text-surface-500'
                  }
                `}
              >
                {isCompleted ? (
                   <CheckCircleIcon className="w-6 h-6" />
                ) : (
                   step.icon ? step.icon : <span className="text-sm font-bold">{index + 1}</span>
                )}
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wider hidden sm:block absolute top-12 whitespace-nowrap
                ${isCurrent ? 'text-primary-600 dark:text-primary-400' : 'text-surface-500 dark:text-surface-400'}
              `}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-6 sm:h-10"></div> {/* Spacer for the absolute positioned labels */}
    </div>
  );
};

export default FormStepper;
