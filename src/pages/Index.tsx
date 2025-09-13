import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '../components/layout/Layout';
import ProductCard from '../components/ui/ProductCard';
import CategoryItem from '../components/ui/CategoryItem';
import Banner from '../components/ui/Banner';
import ProductVideoSection from '../components/ui/ProductVideoSection';
import { ScrollArea } from '../components/ui/scroll-area';
import { Product } from '../lib/types';
import { useIsMobile } from '../hooks/use-mobile';
import { useLocation } from '../context/LocationContext';
import { useWishlist } from '../context/WishlistContext';
import SEOHelmet from '@/components/seo/SEOHelmet';
import useSEO from '@/hooks/useSEO';
import Marquee from "react-fast-marquee"; 
import HeroSlider from '../components/ui/HeroSlider'
import IndexFeaturesproducts from '../components/ui/IdexFeaturesproducts'
import { supabase } from '@/integrations/supabase/client'; // ensure you have this

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { currentLocation } = useLocation();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [visibleCategories, setVisibleCategories] = useState<number>(4);
  const [startIndex, setStartIndex] = useState(0);
  const categoriesRef = useRef<HTMLDivElement>(null);
const seo = useSEO('/');
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');

  

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleResize = () => {
      if (window.innerWidth <= 640) setVisibleCategories(4);
      else if (window.innerWidth <= 1024) setVisibleCategories(4);
      else setVisibleCategories(6);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentLocation]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = supabase.from('products').select('*');
      if (selectedCategory) query = query.eq('category', selectedCategory);
      const { data, error } = await query;
      if (error) throw error;

 const transformed: Product[] = (data || []).map((item: any) => {
  const rawSizes = Array.isArray(item.sizes) ? item.sizes : [];

  const normalizedSizes: { size: string; stock: number }[] = rawSizes
    .filter((s) => typeof s === 'object' && s !== null && 'size' in s && 'stock' in s)
    .map((s) => ({
      size: String((s as any).size),
      stock: Number((s as any).stock),
    }));

  const totalStock = normalizedSizes.reduce((sum, s) => sum + s.stock, 0);

  return {
    id: item.id,
    productId: item.id,
    code: item.code || `PROD-${item.id.slice(0, 8)}`,
    name: item.name,
    description: item.description || '',
    price: item.price,
    originalPrice: item.original_price || item.price,
    discountPercentage: item.discount_percentage || 0,
    image: item.image || '',
    images: Array.isArray(item.images)
      ? item.images.filter((img) => typeof img === 'string')
      : [],
    category: item.category || '',
    stock: totalStock,
    sizes: normalizedSizes, // ✅ Correct format
    tags: Array.isArray(item.tags)
      ? item.tags.filter((tag) => typeof tag === 'string')
      : [],
    inStock: totalStock > 0,
  };
});


      setProducts(transformed);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const handleProductClick = (product: Product) => {
    navigate(`/product/details/${product.code}`);
  };

  return (
    <Layout>
       <SEOHelmet {...{ ...seo, keywords: seo.keywords?.join(', ') }} />


      <div className="bg-black min-h-screen pt-20 text-white">
       
        <div className="container-custom mt-22 pt-2">
          <HeroSlider />

          {/* 🔥 Hot Selling */}
      <div className="mb-8 mt-8 min-h-[60px] w-full   bg-gradient-to-br from-black via-gray-900 to-black

 p-4 pl-0 pr-0 shadow-md">
  <div className="flex items-center justify-evenly mb-2">
    <span className="bg-red-500 text-white px-3 py-1 mb-3 text-sm sm:text-m font-bold tracking-wide uppercase shadow">
       Hot Selling
    </span>
  </div>

  <div className="grid grid-cols-1  gap-6">
    {products
      .filter((product) => Array.isArray(product.tags) && product.tags.includes("indexmainimage"))
      .map((product, i) => (
        <div
          key={product.id}
          className="animate-fade-in"
          style={{ animationDelay: `${i * 0.08}s` }}
        >
          {/* ✅ Fixed Aspect Ratio */}
          <div className="w-full  relative h-[290px]  bg-gray-900 overflow-hidden shadow-lg relative">
            <img
              src={product.image} // adjust to your actual field
              alt={product.name}
              onClick={() => handleProductClick(product)}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>

          <div className="flex items-center justify-center gap-1 sm:gap-3 mb-3 flex-wrap text-center mt-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              {product.name}
            </h3>
            
          </div>

          {/*<div className="flex justify-center">
            <Link
              to={`/product/details/${product.id}`}
              className=" px-2 py-1 text-m font-bold bg-white text-black hover:bg-gray-200 shadow transition"
            >
              Shop Now
            </Link>
            
          </div>*/}
        </div>
      ))}
  </div>
</div>




          {/* ✨ Featured Products */}
            <h2 className="text-2xl md:text-2xl font-bold mb-5 text-left">Feature products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          
          {products.map((product, index) => (
            <div key={product.id} className={`animate-fade-in`} style={{ animationDelay: `${index * 0.1}s` }}>
              <IndexFeaturesproducts 
                product={product}
                onClick={() => handleProductClick(product)}
              />
            </div>
          ))}
        </div>

          {/* 🎥 Product Videos */}
          <ProductVideoSection />

          {/* 🛍 All Products */}
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-10 mb-6 tracking-wide"> All Products</h2>

          {loading ? (
            <p className="text-gray-400">Loading products...</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product, i) => (
                <div
                  key={product.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <ProductCard product={product} onClick={handleProductClick} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Index;
