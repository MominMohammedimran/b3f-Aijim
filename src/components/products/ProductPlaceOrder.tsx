import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Product } from "@/lib/types";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface ProductPlaceOrderProps {
  product: Product;
  selectedSizes?: string[];
  quantities?: Record<string, number>;
  variant?: string;
  className?: string;
}

const ProductPlaceOrder: React.FC<ProductPlaceOrderProps> = ({
  product,
  selectedSizes = [],
  quantities = {},
  variant = "default",
  className = "",
}) => {
  const { addToCart, cartItems } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    if (!currentUser) {
      toast.error("Please sign in to place an order");
      navigate("/signin");
      return;
    }

    if (selectedSizes.length === 0) {
      toast.error("Please select at least one size");
      return;
    }

    const cartItem = cartItems.find((c) => c.product_id === product.id);

    const sizesArray: { size: string; quantity: number }[] = [];
    const skippedSizes: string[] = [];

    selectedSizes.forEach((size) => {
      const maxStock =
        Number(product.variants?.find((v) => String(v.size) === size)?.stock) ||
        0;

      const inCartQty =
        cartItem?.sizes.find((s) => s.size === size)?.quantity || 0;
      const newQty = quantities[size] || 1;

      if (inCartQty >= maxStock) {
        skippedSizes.push(size);
        return;
      }

      const remainingQty = Math.min(newQty, maxStock - inCartQty);
      sizesArray.push({ size, quantity: remainingQty });
    });

    try {
      // If all are maxed out, just go to checkout instead of blocking
      if (sizesArray.length === 0) {
        toast.warning("Proceeding to checkout..");
        navigate("/checkout");
        return;
      }

      // Otherwise, add only valid quantities
      await addToCart({
        product_id: product.id,
        name: product.name || "Product",
        price: product.price || 0,
        sizes: sizesArray,
        image: product.image || "",
      });

      if (skippedSizes.length > 0) {
        toast.warning(
          `Added available sizes. Skipped: ${skippedSizes.join(
            ", "
          )} (max stock reached)`
        );
      } else {
        toast.success(`${product.name} added to cart successfully`);
      }

      // ✅ Always go to checkout
      navigate("/checkout");
    } catch (error) {                                    
      console.error("Place order failed:", error);
      toast.error("Failed to place order");
    }                                                                                    
  };

  return (
    <Button
      variant={variant}
      onClick={handlePlaceOrder}
      className={`${className} flex items-center justify-center gap-2`}
    >
      <CheckCircle className="h-5 w-5" />
      <span className="font-semibold text-md lg:text-lg">Place Order</span>
    </Button>
  );
};

export default ProductPlaceOrder;
