
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DeliverySettings {
  delivery_fee: number;
  min_order_amount: number;
  free_delivery_threshold: number;
}

export const useDeliverySettings = () => {
  const [settings, setSettings] = useState<DeliverySettings>({
    delivery_fee: 0,
    min_order_amount: 100,
    free_delivery_threshold: 1000
  });
  const [loading, setLoading] = useState(true);

  const refetch = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_admin_settings');
      
      if (error) throw error;
      
      if (data && Array.isArray(data) && data.length > 0) {
        const settingsData = data[0];
        setSettings(prev => ({ 
          ...prev, 
          delivery_fee: Number(settingsData.delivery_fee) || prev.delivery_fee,
          min_order_amount: Number(settingsData.min_order_amount) || prev.min_order_amount,
          free_delivery_threshold: 1000 // Default value since not in settings
        }));
      }
     
    } catch (error) {
      console.error('Error fetching delivery settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return { settings, loading, refetch };
};
