
import React, { useEffect } from "react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";

const CART_STORAGE_KEY = "toast_cart"; // array of { id, lastShown }

function CartReminders() {
  const { cartItems } = useCart();

  useEffect(() => {
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;

    // Get stored cart reminders
    const stored: { id: string; lastShown: number }[] = JSON.parse(
      localStorage.getItem(CART_STORAGE_KEY) || "[]"
    );

    if (!cartItems || cartItems.length === 0) {
      // Empty cart reminder
      const emptyCart = stored.find((s) => s.id === "emptyCart");
      if (!emptyCart || now - emptyCart.lastShown >= ONE_HOUR) {
        toast.custom(
          () => (
            <div className="p-3 rounded-lg shadow bg-white border flex gap-2 items-center">
              <span className="text-sm font-medium text-black">
                Your cart is empty 🛒 — Continue shopping!
              </span>
            </div>
          ),
          { duration: 4000 }
        );

        const others = stored.filter((s) => s.id !== "emptyCart");
        localStorage.setItem(
          CART_STORAGE_KEY,
          JSON.stringify([...others, { id: "emptyCart", lastShown: now }])
        );
      }
      return;
    }

    // Cart item reminders
    cartItems.forEach((item) => {
      const lastItem = stored.find((s) => s.id === item.id);
      if (!lastItem || now - lastItem.lastShown >= ONE_HOUR) {
        toast.custom(
          () => (
            <div className="p-1 rounded-none shadow bg-white border flex gap-3 items-center w-full">
              <img
                src={item.image}
                className="w-12 h-12 rounded-md object-cover"
                alt={item.name}
              />
              <div>
                <div className="font-semibold text-sm text-black line-clamp-1">
                  {item.name}
                </div>
                <div className="flex flex-col text-[10px] font-semibold text-blue-500 gap-1">
                  <span>Still in your cart — complete order now!</span>
                  <a
                    href="/cart"
                    className="bg-red-500 text-white text-center w-full px-2 py-1 rounded"
                  >
                    Make Payment
                  </a>
                </div>
              </div>
            </div>
          ),
          { duration: 5000 }
        );

        const others = stored.filter((s) => s.id !== item.id);
        localStorage.setItem(
          CART_STORAGE_KEY,
          JSON.stringify([...others, { id: item.id, lastShown: now }])
        );
      }
    });
  }, [cartItems]);

  return null;
}

export default CartReminders;
