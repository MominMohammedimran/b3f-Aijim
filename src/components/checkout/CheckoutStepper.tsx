import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface CheckoutStepperProps {
  currentStep: number;
}

const steps = [
  { label: "CART", path: "/cart" },
  { label: "CHECKOUT", path: "/checkout" },
  { label: "PAYMENT", path: "/payment" },
  { label: "DONE", path: "/order-complete" },
];

export const CheckoutStepper = ({ currentStep }: CheckoutStepperProps) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="w-full py-2">
      <div className="flex justify-between items-center text-xs sm:text-sm font-semibold">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCurrent = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;
          const isLocked = !isCompleted && !isCurrent;

          return (
            <div
              key={step.label}
              onClick={() => isCompleted && navigate(step.path)}
              onMouseEnter={() => setHovered(stepNumber)}
              onMouseLeave={() => setHovered(null)}
              className={`relative flex flex-col items-center flex-1 ${
                isCompleted ? "cursor-pointer" : "cursor-not-allowed"
              }`}
            >
              {/* Tooltip */}
              {isLocked && hovered === stepNumber && (
  <div className="absolute -top-12 left-2 z-100 text-[9px] bg-red-500 text-white px-3 py-1 rounded shadow font-bold">
  Complete {steps[currentStep - 1]?.label} ?
  </div>
)}

              {/* Label */}
              <motion.span
                animate={{
                  color: isCurrent
                    ? "#ffe600ff"
                    : isCompleted
                    ? "#ffffffff"
                    : "#9ca3af",
                }}
                className={`tracking-wide font-semibold p-1 pb-0 w-full text-center
                  ${isCompleted && "hover:text-yellow-400"}
                `}
              >
                {step.label}
              </motion.span>

              {/* Underline */}
              <motion.div
                className="h-0.5 w-full mt-1"
                initial={false}
                animate={{
                  backgroundColor: isCurrent
                    ? "#ffffffff"
                    : isCompleted
                    ? "#ffffffe8"
                    : "#666464ff",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
