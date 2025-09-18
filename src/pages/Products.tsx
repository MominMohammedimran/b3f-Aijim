import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/types';
import Layout from '@/components/layout/Layout';
import { Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ui/ProductCard';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'default' | 'low' | 'newest'>('default');
  const [openMenu, setOpenMenu] = useState<'hot' | 'edition' | 'all' | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        console.error('Error:', error);
        setLoading(false);
        return;
      }

      const transformed = (data || []).map((p: any) => {
        const sizes = Array.isArray(p.variants)
          ? p.variants
              .filter((v) => v && typeof v === 'object' && v.size && v.stock != null)
              .map((v) => ({ size: String(v.size), stock: Number(v.stock) }))
          : [];
        const totalStock = sizes.reduce((s, x) => s + (x.stock || 0), 0);
        return {
          id: p.id,
          name: p.name,
          price: p.price,
          originalPrice: p.original_price || p.price,
          image: p.image || '',
          images: p.images || [],
          variants:sizes,
          code:p.code,
          description: p.description || '',
          tags: Array.isArray(p.tags) ? p.tags : [],
          inStock: totalStock > 0,
          discountPercentage:
            p.original_price && p.original_price > p.price
              ? Math.round(((p.original_price - p.price) / p.original_price) * 100)
              : 0,
        } as Product;
      });

      setProducts(transformed);
      setLoading(false);
    })();
  }, []);

  const sortProducts = useMemo(() => {
    const sorter = (list: Product[]) => {
      if (sort === 'low') return [...list].sort((a, b) => a.price - b.price);
      if (sort === 'newest') return [...list].sort((a, b) => b.id.localeCompare(a.id));
      return list;
    };
    return sorter;
  }, [sort]);

  const SortDropdown = ({ section }: { section: 'hot' | 'edition' | 'all' }) => (
    <div className="relative inline-block">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpenMenu(openMenu === section ? null : section)}
        className="flex items-center gap-1 bg-white font-bold text-black text-xs"
      >
        Sort <ChevronDown size={15} />
      </Button>

      {openMenu === section && (
        <ul
          className="absolute right-0 mt-2 w-44 bg-white text-black rounded shadow-lg z-10 text-sm"
          onMouseLeave={() => setOpenMenu(null)}
        >
          {['default', 'low', 'newest'].map((opt) => (
            <li key={opt}>
              <button
                className={`block w-full text-left px-4 py-2 font-bold hover:bg-gray-100 ${
                  sort === opt ? 'font-bold' : ''
                }`}
                onClick={() => {
                  setSort(opt as any);
                  setOpenMenu(null);
                }}
              >
                {opt === 'default'
                  ? 'Default'
                  : opt === 'low'
                  ? 'Price: Low to High'
                  : 'Newest First'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const HorizontalSection = ({
    title,
    tag,
    sectionKey,
  }: {
    title: string;
    tag: string;
    sectionKey: 'hot' | 'edition';
  }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const timer = setInterval(() => {
        if (ref.current) ref.current.scrollBy({ left: 200, behavior: 'smooth' });
      }, 3000);
      return () => clearInterval(timer);
    }, []);

    const filtered = sortProducts(products.filter((p) => p.tags?.includes(tag)));

    if (!filtered.length) return null;

    return (
      <section className="mb-10 px-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl sm:text-xl mb-1 font-bold">{title}</h2>
          <SortDropdown section={sectionKey} />
        </div>

        <div ref={ref} className="overflow-x-auto no-scrollbar ">
          <div className="flex gap-5">
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onClick={() => navigate(`/product/details/${p.code}`)}
                className="w-[155px] sm:w-[195px] md:w-[210px] flex-shrink-0"
              />
            ))}
          </div>
        </div>
      </section>
    );
  };

  return (
    <Layout>
      <div className="bg-black text-white py-16 mt-4 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-extrabold line-clamp-1 leading-snug mb-3 pt-4 px-4">
            AIJIM Collections
          </h1>

          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          ) : (
            <>
              <HorizontalSection title="🔥 Hot Selling" tag="hot" sectionKey="hot" />
              <HorizontalSection title="✨ Edition 1" tag="edition1" sectionKey="edition" />

              <section className="px-4 mt-10">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg sm:text-xl font-bold">🛍 All Products</h2>
                  <SortDropdown section="all" />
                </div>

           <div className="grid gap-4  grid-cols-[repeat(auto-fit,minmax(150px,auto))] justify-start">
{sortProducts(products).map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onClick={() => navigate(`/product/details/${p.code}`)}
                      className="w-[175px]   sm:w-[195px] md:w-[210px] "
                    />
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Products;
