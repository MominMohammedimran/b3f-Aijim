
import { useState, useEffect } from 'react';

interface SizeInventory {
  [productType: string]: {
    [size: string]: number;
  };
}

export const useDesignToolInventory = () => {
  const [sizeInventory, setSizeInventory] = useState<SizeInventory>({
    tshirt: { s: 0, m: 0, l: 0, xl: 0, xxl: 0 },
    mug: { regular: 0,  },
    cap: { onesize: 0 }
  });
  const [loading, setLoading] = useState(false);

  const fetchProductInventory = async () => {
    setLoading(true);
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
    
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateInventory = async (productType: string, size: string, delta: number): Promise<boolean> => {
    try {
      setSizeInventory(prev => ({
        ...prev,
        [productType]: {
          ...prev[productType],
          [size]: Math.max(0, (prev[productType]?.[size] || 0) + delta)
        }
      }));
      return true;
    } catch (error) {
      console.error('Error updating inventory:', error);
      return false;
    }
  };

  return {
    sizeInventory,
    loading,
    fetchProductInventory,
    updateInventory
  };
};
