import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ActiveProductContextType {
  activeProduct: string;
  setActiveProduct: (product: string) => void;
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
  const [activeProduct, setActiveProduct] = useState<string>('tshirt');

  return (
    <ActiveProductContext.Provider value={{ activeProduct, setActiveProduct }}>
      {children}
    </ActiveProductContext.Provider>
  );
};
