
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@/lib/types';

interface ActiveProductContextType {
  activeProduct: Product | null;
  setActiveProduct: (product: Product | null) => void;
}

const ActiveProductContext = createContext<ActiveProductContextType | undefined>(undefined);

export const useActiveProduct = () => {
  const context = useContext(ActiveProductContext);
  if (context === undefined) {
    throw new Error('useActiveProduct must be used within an ActiveProductProvider');
  }
  return context;
};

interface ActiveProductProviderProps {
  children: ReactNode;
}

export const ActiveProductProvider: React.FC<ActiveProductProviderProps> = ({ children }) => {
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  const value = {
    activeProduct,
    setActiveProduct,
  };

  return (
    <ActiveProductContext.Provider value={value}>
      {children}
    </ActiveProductContext.Provider>
  );
};
