import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/lib/types";
import Layout from "@/components/layout/Layout";
import {
Loader2,
ChevronDown,
ChevronLeft,
ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Products = () => {
const [products, setProducts] = useState<Product[]>([]);
const [loading, setLoading] = useState(true);
const [sort, setSort] = useState<"default" | "low" | "newest">("default");
const [openMenu, setOpenMenu] = useState<"hot" | "edition" | "all" | null>(
null
);
const navigate = useNavigate();

// ✅ Fetch from Supabase
useEffect(() => {
(async () => {
const { data, error } = await supabase.from("products").select("*");
if (error) {
console.error("Error:", error);
setLoading(false);
return;
}

const transformed = (data || []).map((p: any) => {  
    const sizes = Array.isArray(p.variants)  
      ? p.variants  
          .filter(  
            (v) =>  
              v && typeof v === "object" && v.size && v.stock != null  
          )  
          .map((v) => ({ size: String(v.size), stock: Number(v.stock) }))  
      : [];  
    const totalStock = sizes.reduce((s, x) => s + (x.stock || 0), 0);  

    return {  
      id: p.id,  
      name: p.name,  
      price: p.price,  
      originalPrice: p.original_price || p.price,  
      image: p.image || "",  
      images: p.images || [],  
      variants: sizes,  
      code: p.code,  
      description: p.description || "",  
      tags: Array.isArray(p.tags) ? p.tags : [],  
      inStock: totalStock > 0,  
      discountPercentage:  
        p.original_price && p.original_price > p.price  
          ? Math.round(  
              ((p.original_price - p.price) / p.original_price) * 100  
            )  
          : 0,  
    } as Product;  
  });  

  setProducts(transformed);  
  setLoading(false);  
})();

}, []);

// ✅ Sorting logic
const sortProducts = useMemo(() => {
const sorter = (list: Product[]) => {
if (sort === "low") return [...list].sort((a, b) => a.price - b.price);
if (sort === "newest")
return [...list].sort((a, b) => b.id.localeCompare(a.id));
return list;
};
return sorter;
}, [sort]);

// 🔽 Sort Dropdown UI
const SortDropdown = ({ section }: { section: "hot" | "edition" | "all" }) => (
<div className="relative inline-block">
<Button
variant="outline"
size="sm"
onClick={() => setOpenMenu(openMenu === section ? null : section)}
className="flex items-center gap-1 py-0.5 bg-white font-bold text-black text-xs rounded-none"
>
Sort <ChevronDown size={15} />
</Button>

{openMenu === section && (  
    <ul  
      className="absolute right-0 mt-2 w-44 bg-white text-black rounded shadow-lg z-10 text-sm"  
      onMouseLeave={() => setOpenMenu(null)}  
    >  
      {["default", "low", "newest"].map((opt) => (  
        <li key={opt}>  
          <button  
            className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${  
              sort === opt ? "font-bold" : ""  
            }`}  
            onClick={() => {  
              setSort(opt as any);  
              setOpenMenu(null);  
            }}  
          >  
            {opt === "default"  
              ? "Default"  
              : opt === "low"  
              ? "Price: Low to High"  
              : "Newest First"}  
          </button>  
        </li>  
      ))}  
    </ul>  
  )}  
</div>

);

// ✅ Inline ProductCard Component
const ProductCardInline = ({ product }: { product: Product }) => {
const [currentImage, setCurrentImage] = useState(0);
const [isHovered, setIsHovered] = useState(false);

const images =  
  Array.isArray(product.images) && product.images.length > 0  
    ? product.images  
    : [product.image];  

const discount =  
  product.originalPrice && product.originalPrice > product.price;  

useEffect(() => {  
  if (!isHovered || images.length <= 1) return;  
  const interval = setInterval(  
    () => setCurrentImage((p) => (p + 1) % images.length),  
    1500  
  );  
  return () => clearInterval(interval);  
}, [isHovered, images.length]);  

const outOfStock = product.stock <= 0;  

return (  
  <div  
    onClick={() => navigate(`/product/details/${product.code}`)}  
    onMouseEnter={() => setIsHovered(true)}  
    onMouseLeave={() => {  
      setIsHovered(false);  
      setCurrentImage(0);  
    }}  
    className={`cursor-pointer bg-[#0b0b0b] rounded-none overflow-hidden group transition-all duration-500 hover:shadow-[0_6px_14px_rgba(255,255,255,0.07)] hover:-translate-y-1 h-full flex flex-col`}  
  >  
    {/* 🖼️ Image Section */}  
    <div className="relative aspect-[4/5] overflow-hidden bg-neutral-900 flex-shrink-0">  
      {images.map((img, i) => (  
        <img  
          key={i}  
          src={img}  
          alt={product.name}  
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${  
            i === currentImage ? "opacity-100" : "opacity-0"  
          } group-hover:scale-[1.03]`}  
        />  
      ))}  

      {outOfStock && (  
        <div className="absolute inset-0 flex items-center justify-center z-20">  
          <div className="bg-red-600 text-white text-xs sm:text-sm font-bold uppercase tracking-wide px-4 py-2 rounded-md shadow-lg">  
            SOLD OUT  
          </div>  
        </div>  
      )}  
    </div>  

    {/* 🏷️ Product Info */}  
    <div className="p-2 flex flex-col justify-between flex-grow">  
      <h3  
        className="text-[13px] sm:text-[14px] text-left sm:text-center text-white font-medium tracking-wide leading-tight min-h-[36px]"  
      >  
        {product.name}  
      </h3>  

      <div className="flex justify-center items-center gap-2 mt-1">  
        {discount && (  
          <span className="text-gray-500 text-[12px] line-through">  
            ₹{product.originalPrice}  
          </span>  
        )}  
        <span className="text-yellow-400 text-[14px] font-semibold">  
          ₹{product.price}  
        </span>  
      </div>  
    </div>  
  </div>  
);

};

// ✅ Horizontal Section (carousel)
const HorizontalSection = ({
title,
tag,
sectionKey,
}: {
title: string;
tag: string;
sectionKey: "hot" | "edition";
}) => {
const ref = useRef<HTMLDivElement>(null);

const scroll = (dir: "left" | "right") => {  
  if (!ref.current) return;  
  const distance = 250;  
  ref.current.scrollBy({  
    left: dir === "left" ? -distance : distance,  
    behavior: "smooth",  
  });  
};  

useEffect(() => {  
  const interval = setInterval(() => {  
    if (!ref.current) return;  
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;  
    const isEnd = scrollLeft + clientWidth >= scrollWidth - 10;  
    ref.current.scrollBy({  
      left: isEnd ? -scrollWidth : 250,  
      behavior: "smooth",  
    });  
  }, 4000);  
  return () => clearInterval(interval);  
}, []);  

const filtered = sortProducts(  
  products.filter((p) => p.tags?.includes(tag))  
);  
if (!filtered.length) return null;  

return (  
  <section className="mb-10 px-4 relative">  
    <div className="flex justify-between items-center mb-2">  
      <h2 className="text-lg mb-1 font-bold">{title}</h2>  
      <SortDropdown section={sectionKey} />  
    </div>  

    <div className="relative">  
      {/* Left */}  
      <button  
        onClick={() => scroll("left")}  
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black text-white p-2 rounded-full z-10"  
      >  
        <ChevronLeft size={18} />  
      </button>  

      {/* Carousel */}  
      <div  
        ref={ref}  
        className="overflow-x-auto no-scrollbar scroll-smooth flex gap-4 snap-x snap-mandatory"  
      >  
        {filtered.map((p) => (  
          <div  
            key={p.id}  
            className="snap-start flex-shrink-0 w-[160px] sm:w-[195px] md:w-[210px] h-[320px] flex"  
          >  
            <ProductCardInline product={p} />  
          </div>  
        ))}  
      </div>  

      {/* Right */}  
      <button  
        onClick={() => scroll("right")}  
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black text-white p-2 rounded-full z-10"  
      >  
        <ChevronRight size={18} />  
      </button>  
    </div>  
  </section>  
);

};

return (
<Layout>
<div className="bg-black text-white py-16 mt-4 min-h-screen">
<div className="max-w-7xl mx-auto">
<h1 className="text-xl font-semibold mb-3 pt-4 px-4">
AIJIM Collections
</h1>

{loading ? (  
        <div className="flex justify-center py-24">  
          <Loader2 className="h-6 w-6 animate-spin text-yellow-400" />  
        </div>  
      ) : (  
        <>  
          {/* 🔥 Hot Selling */}  
          <HorizontalSection  
            title="🔥 Hot Selling"  
            tag="hot"  
            sectionKey="hot"  
          />  

          {/* ✨ Edition 1 */}  
          <HorizontalSection  
            title="✨ Edition 1"  
            tag="edition1"  
            sectionKey="edition"  
          />  

          {/* 🛍 All Products */}  
          <section className="px-4 mt-10">  
            <div className="flex justify-between items-center mb-3">  
              <h2 className="text-lg font-bold">🛍 All Products</h2>  
              <SortDropdown section="all" />  
            </div>  

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">  
              {sortProducts(products).map((p) => (  
                <ProductCardInline key={p.id} product={p} />  
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
