import { motion } from "framer-motion";

interface CheckoutStepperProps {
  currentStep: number;
}

const steps = ["CART", "CHECKOUT", "PAYMENT", "DONE"];

export const CheckoutStepper = ({ currentStep }: CheckoutStepperProps) => {
  return (
    <div className="w-full py-2 ">
      <div className="flex justify-between items-center text-xs sm:text-sm font-semibold">
        {steps.map((label, index) => {
          const isCurrent = currentStep === index + 1;
          const isCompleted = currentStep > index + 1;

          return (
            <div key={label} className="flex flex-col items-center flex-1">
              {/* Label */}
              <motion.span
                animate={{
                  color: isCurrent ? "#ffe600ff" : isCompleted ? "#ffffffff " : "#9ca3af",
                }}
                className={`tracking-wide font-semibold p-1 pb-0 ${
                  isCurrent ? "text-white   w-full text-center hover:cursor-text" : 
                  isCompleted ? "text-white text-center  w-full hover:cursor-text" : "text-center text-gray-400 hover:cursor-text"
                }`}
              >
                {label}
              </motion.span>

              {/* Underline */}
              <motion.div
                className="h-0.5 w-full mt-1"
                initial={false}
                animate={{
                  backgroundColor: isCurrent
                    ? "#ffffffff" // red
                    : isCompleted
                    ? "#ffffffe8" // gray
                    : "#666464ff", // light gray
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};