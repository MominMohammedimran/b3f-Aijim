
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import AnimatedCounter from './AnimatedCounter';

interface LimitTrackerProps {
  current: number;
  max: number;
  unit?: string;
  className?: string;
  label?: string;
  resetsIn?: string;
}

const LimitTracker: React.FC<LimitTrackerProps> = ({
  current,
  max,
  unit = '',
  className,
  label = "Usage",
  resetsIn
}) => {
  const percentage = Math.min(100, (current / max) * 100);
  const progressRef = useRef<HTMLDivElement>(null);

  // Update the CSS variable for the progress animation
  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.setProperty('--progress-value', `${percentage}%`);
    }
  }, [percentage]);

  return (
    <div className={cn("rounded-xl p-5", className)}>
      <div className="flex justify-between items-center mb-2">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className="flex items-baseline space-x-1">
            <AnimatedCounter 
              value={current} 
              className="text-2xl font-semibold"
            />
            <span className="text-lg font-medium text-muted-foreground">/ {max}{unit}</span>
          </div>
        </div>
        
        {resetsIn && (
          <div className="bg-secondary/50 rounded-full px-3 py-1 flex items-center">
            <div className="w-2 h-2 rounded-full bg-primary/70 mr-2" />
            <span className="text-xs font-medium">Resets in {resetsIn}</span>
          </div>
        )}
      </div>
      
      <div className="h-2 bg-secondary/60 rounded-full overflow-hidden">
        <div 
          ref={progressRef}
          className={cn(
            "h-full rounded-full animate-progress-load",
            percentage < 70 ? "bg-primary" : percentage < 90 ? "bg-amber-500" : "bg-destructive"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default LimitTracker;
