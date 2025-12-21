import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DesignProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

export const useDesignProducts = () => {
  const [products, setProducts] = useState<DesignProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('id, name, price, image, category')
          .eq('is_active', true);

        if (error) throw error;
        
        setProducts(data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};
