
import React from 'react';
import { cn } from '@/lib/utils';

const Navbar: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 animate-fade-in">
      <div className="glass-card m-4 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-bold">L</span>
          </div>
          <h1 className="text-xl font-display font-semibold tracking-tight">
            Limitless
          </h1>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          {['Dashboard', 'Usage', 'Billing', 'Settings'].map((item) => (
            <a 
              key={item} 
              href="#" 
              className={cn(
                "text-sm font-medium",
                item === 'Dashboard' 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item}
            </a>
          ))}
        </nav>
        
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center transition-transform hover:scale-105">
            <span className="text-sm font-medium">JD</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
