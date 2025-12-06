import React, { useState } from "react";
import { Product } from "@/lib/types";
import ProductImage from "../ProductImage";
import ProductDetails from "../ProductDetails";
import ProductReviewSection from "../ProductReviewSection";
import RelatedProducts from "../RelatedProducts";
import ShareModal from "../ShareModal";
import { Share2 } from "lucide-react";

interface ProductDetailsContentProps {
  product: Product;
}

const ProductDetailsContent: React.FC<ProductDetailsContentProps> = ({ product }) => {
  const [showShareModal, setShowShareModal] = useState(false);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 mt-3 md:grid-cols-2 pt-1 gap-2 shadow-md">

        {/* 📌 Image + Share */}
       <div className="relative w-full">
  {/* Label */}
 {/* AIJIM Label */}
<span
  className="absolute left-2 top-2.5 z-50 text-xs sm:text-sm font-semibold uppercase tracking-wide text-white transition-all duration-300"
  style={{
    filter: "drop-shadow(0px 0px 6px rgba(0,0,0,0.8))",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "scale(1.1)";
    e.currentTarget.style.color = "#facc15"; // Tailwind text-yellow-400
    e.currentTarget.style.filter = "drop-shadow(0px 0px 10px rgba(0,0,0,1))";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.color = "white";
    e.currentTarget.style.filter = "drop-shadow(0px 0px 6px rgba(0,0,0,0.8))";
  }}
>
  AIJIM
</span>


  {/* Product Image */}
  <ProductImage
    image={product.image}
    name={product.name}
    additionalImages={product.images || []}
  />

  {/* Share Button */}
{/* Share Button */}
<button
  onClick={() => setShowShareModal(true)}
  className="absolute top-0 right-1 z-50 p-2 transition-all duration-300"
  onMouseEnter={(e) => {
    const icon = e.currentTarget.querySelector("svg");
    icon.style.transform = "scale(1.2)";
    icon.style.color = "#ffe600ff"; // Tailwind red-500
    icon.style.filter = "drop-shadow(0px 0px 10px rgba(0,0,0,1))";
  }}
  onMouseLeave={(e) => {
    const icon = e.currentTarget.querySelector("svg");
    icon.style.transform = "scale(1)";
    icon.style.color = "white";
    icon.style.filter = "drop-shadow(0px 0px 6px rgba(0,0,0,0.8))";
  }}
>
  <Share2
    size={18}
    className="text-white transition-all"
    style={{
      filter: "drop-shadow(0px 0px 6px rgba(0,0,0,0.8))",
    }}
  />
</button>
</div>




        <ProductDetails product={product} />
      </div>

      <ProductReviewSection productId={product.id} />
      <RelatedProducts product={product} />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        product={product}
      />
    </div>
  );
};

export default ProductDetailsContent;
