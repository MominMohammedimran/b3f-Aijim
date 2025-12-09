import {
  Link,
  useLocation as useRouterLocation,
  useNavigate,
} from "react-router-dom";
import {
  ShoppingCart,
  User,
  Search,
  Package,
  Home,
  PackageSearch,
  Tag,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "../../context/LocationContext";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/CartContext";
import Marquee from "react-fast-marquee";
import NotificationBell from "@/components/notifications/NotificationBell";

const Navbar = () => {
  const routerLocation = useRouterLocation();
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();
  const { clearCart } = useCart();
  const { setCurrentLocation } = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);

    const loadCartCount = async () => {
      if (currentUser) {
        const { data } = await supabase
          .from("carts")
          .select("*")
          .eq("user_id", currentUser.id);
        if (data) setCartCount(data.length);
      }
    };

    loadCartCount();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentUser]);

  const isActive = (path: string) => routerLocation.pathname === path;

  const handleSignOut = async () => {
    try {
      if (currentUser)
        await supabase.from("carts").delete().eq("user_id", currentUser.id);
      clearCart();
      await supabase.auth.signOut();
      if (signOut) await signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-40">
      {/* 🔥 Flash Sale Marquee */}
      <div className="bg-red-600 py-1 flex items-center">
        <Marquee gradient={false} speed={40} pauseOnHover className="w-full">
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className="flex items-center uppercase text-white font-semibold text-[10px] sm:text-[13px] px-4 whitespace-nowrap"
            >
              {/*<Tag size={14} className="text-white mr-1" /> Flat ₹500 Off on Orders Above ₹2500*/}
              "Every T-shirt tells a story — built from hustle. #
              <span className="font-bold ">AIJIM</span>”
            </span>
          ))}
        </Marquee>
      </div>

      {/* 🔹 Navbar Main */}
      <div
        className={`flex items-center justify-between w-full px-3 py-2 transition-all duration-300 ${
          isScrolled
            ? "backdrop-blur-md bg-black/70 shadow-md"
            : "bg-transparent"
        }`}
      >
        {/* Brand Logo - aligned left */}
        <div className="flex items-center pl-2 mb-2">
          <img
            src="/aijim-uploads/aijim.svg"
            alt="AIJIM Logo"
            className="w-28 sm:w-36 md:w-40 object-contain"
            loading="lazy"
          />
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-4 mr-4 pb-2">
          {/* Notifications */}
         <NotificationBell />

          {/* Search Icon */}
          <Link
            onClick={() => {
              window.scrollTo(0, 0);
            }}
            to="/search"
            aria-label="Search"
            className="text-white hover:text-yellow-400"
          >
            <Search size={20} />
          </Link>

          {/* Cart Icon */}
          <Link
            onClick={() => {
              window.scrollTo(0, 0);
            }}
            to="/cart"
            aria-label="Cart"
            className="relative"
          >
            <ShoppingCart
              size={20}
              className="text-white hover:text-yellow-400"
            />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* 🔸 Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 p-2 z-50">
        <div className="flex justify-around items-center text-gray-400">
          {[
            { label: "Home", icon: Home, path: "/" },
            { label: "Products", icon: Package, path: "/products" },
            { label: "Search", icon: Search, path: "/search" },
            { label: "Orders", icon: PackageSearch, path: "/orders" },
            {
              label: currentUser ? "Profile" : "Sign In",
              icon: User,
              path: currentUser ? "/profile" : "/signin",
            },
          ].map(({ label, icon: Icon, path }) => (
            <button
              key={label}
              onClick={() => {
                navigate(path);
                window.scrollTo(0, 0);
              }}
              className={`flex flex-col items-center justify-center px-2 transition-all duration-300 ${
                isActive(path)
                  ? "text-white scale-110 border-b border-white"
                  : "hover:text-yellow-400"
              }`}
            >
              <Icon size={18} />
              <span className="text-[11px] font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Navbar;