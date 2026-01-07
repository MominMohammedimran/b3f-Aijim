import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type BannerImages = { desktop: string[]; mobile: string[] };

interface BannerContextType {
  banners: BannerImages;
  loading: boolean;
}

const BannerContext = createContext<BannerContextType | undefined>(undefined);

export const BannerProvider = ({ children }: { children: React.ReactNode }) => {
  const [banners, setBanners] = useState<BannerImages>({ desktop: [], mobile: [] });
  const [loading, setLoading] = useState(true);

  const fetchBanners = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('images')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data && typeof data.images === 'object' && data.images !== null) {
        const images = data.images as BannerImages;
        setBanners({ 
          desktop: images.desktop || [], 
          mobile: images.mobile || [] 
        });
      } else {
        setBanners({ desktop: [], mobile: [] });
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      setBanners({ desktop: [], mobile: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();

    const channel = supabase
      .channel('global-banners')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banners' }, () => {
        fetchBanners();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBanners]);

  return (
    <BannerContext.Provider value={{ banners, loading }}>
      {children}
    </BannerContext.Provider>
  );
};

export const useBanners = () => {
  const context = useContext(BannerContext);
  if (context === undefined) {
    throw new Error('useBanners must be used within a BannerProvider');
  }
  return context;
};