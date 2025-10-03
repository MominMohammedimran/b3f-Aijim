import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface CheckoutStepperProps {
  currentStep: number;
}

const steps = [
  { number: 1, label: 'CART' },
  { number: 2, label: 'CHECKOUT' },
  { number: 3, label: 'PAYMENT' },
  { number: 4, label: 'DONE' }
];

export const CheckoutStepper = ({ currentStep }: CheckoutStepperProps) => {
  return (
    <div className="w-full  mx-6 py-0 px-1 mb-1">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isUpcoming = currentStep < step.number;

          return (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-shrink-0">
              {/*  <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 0.6 : 0.5,
                    backgroundColor: isCompleted
                      ? 'hsl(var(--background))'
                      : isCurrent
                      ? 'hsla(0,100%,50%)'
                      : 'hsl(var(--muted))'
                  }}
                  className={`
                    relative w-16 h-16 rounded-full flex items-center justify-center
                    border-4 transition-all duration-300
                    ${
                      isCompleted
                        ? 'border-white'
                        : isCurrent
                        ? 'border-white'
                        : 'border-white'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-8 h-8 text-foreground" />
                  ) : (
                    <span
                      className={`
                        text-xl font-bold
                        ${isCurrent ? 'text-white' : 'text-foreground'}
                      `}
                    >
                      {step.number}
                    </span>
                  )}
                </motion.div>*/}

                {/* Step Label */}
                <motion.span
                  initial={false}
                  animate={{
                    color: isCurrent
                      ? 'hsl(0, 100%, 50%)'
                      : 'hsl(var(--foreground))'
                  }}
                  className=" text-xs border-b border-gray-200 mb-2 font-bold tracking-wider whitespace-nowrap"
                >
                  {step.label}
                </motion.span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mb-2 mx-2 bg-muted relative overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{
                      width: isCompleted ? '100%' : '0%'
                    }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-foreground"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
