
import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchProducts } from "../utils/product";

const PRODUCT_STORAGE_KEY = "toast_products"; // array of { id, lastShown }

function ProductSuggestionReminder() {
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!products || products.length === 0) return;

    const now = Date.now();
    const DELAY = 55 * 60 * 1000; // 1 hour 5 min

    // Get stored product array or initialize
    const stored: { id: string; lastShown: number }[] = JSON.parse(
      localStorage.getItem(PRODUCT_STORAGE_KEY) || "[]"
    );

    // Filter products that were not shown recently
    const availableProducts = products.filter(
      (p) => !stored.some((s) => s.id === p.id && now - s.lastShown < DELAY)
    );

    if (availableProducts.length === 0) return;

    // Pick random product
    const product =
      availableProducts[Math.floor(Math.random() * availableProducts.length)];

    // Discount logic
    const salePrice = product.price;
    const originalPrice =
      typeof product.original_price === "number" &&
      product.original_price > salePrice
        ? product.original_price
        : salePrice;
    const discountPercent =
      originalPrice > salePrice
        ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
        : 0;

    // Show toast
    toast.custom(
      () => (
        <a
          href={`/product/${product.code}`}
          className="flex items-center gap-3 p-2 bg-white border border-gray-200 rounded-none text-black w-full"
        >
          <img
            src={product.image}
            className="w-12 h-12 rounded-md object-cover"
            alt={product.name}
          />
          <div className="flex flex-col">
            <p className="font-semibold text-sm line-clamp-1">{product.name}</p>

            {/* Highlight Sale Price and Discount */}
            {discountPercent > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-green-600 font-bold text-sm">
                  ₹{salePrice}
                </span>
                <span className="bg-red-500 text-white text-[10px] px-1 py-[1px] rounded">
                  {discountPercent}% OFF
                </span>
              </div>
            )}

            {!discountPercent && (
              <span className="text-black font-semibold mt-1">
                ₹{salePrice}
              </span>
            )}

            <span className="text-blue-500 text-xs underline mt-1">
              View Product →
            </span>
          </div>
        </a>
      ),
      { duration: 6000 }
    );

    // Update storage
    const others = stored.filter((s) => s.id !== product.id);
    localStorage.setItem(
      PRODUCT_STORAGE_KEY,
      JSON.stringify([...others, { id: product.id, lastShown: now }])
    );
  }, [products]);

  return null;
}

export default ProductSuggestionReminder;
