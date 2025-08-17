
import React from 'react';
import { cn } from '@/lib/utils';
import LimitTracker from './LimitTracker';

interface UsageCardProps {
  title: string;
  limits: {
    label: string;
    current: number;
    max: number;
    unit?: string;
    resetsIn?: string;
  }[];
  className?: string;
  icon?: React.ReactNode;
}

const UsageCard: React.FC<UsageCardProps> = ({
  title,
  limits,
  className,
  icon
}) => {
  return (
    <div className={cn(
      "glass-card p-6 overflow-hidden animate-fade-in-up",
      className
    )}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold">{title}</h3>
        {icon && (
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
      
      <div className="space-y-6">
        {limits.map((limit, index) => (
          <LimitTracker 
            key={index}
            label={limit.label}
            current={limit.current}
            max={limit.max}
            unit={limit.unit}
            resetsIn={limit.resetsIn}
          />
        ))}
      </div>
    </div>
  );
};

export default UsageCard;
