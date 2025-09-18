
import { Link, useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Package, Home, PackageSearch, LogOut ,Bell, X,Tag
  
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from '../../context/LocationContext';
import LocationPopover from '../ui/LocationPopover';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/context/CartContext';
import Marquee from "react-fast-marquee";
import NavbarPopup from '../ui/NavbarPopup';
const Navbar = () => {
  const routerLocation = useRouterLocation();
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();
  const { clearCart } = useCart();
const [showPopup, setShowPopup] = useState(false);


// Auto-popup for new user only


const handleBellClick = () => {
  setShowPopup(true);
  ; // Reset closed state
};

const handleClosePopup = () => {
  setShowPopup(false);
   // Persist closed
};


const popupMessage = "🔥 Flat ₹200 off on orders above ₹999!";
  const { 
    currentLocation, 
    locations, 
    setCurrentLocation, 
  } = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    const handleCartUpdate = (event: CustomEvent) => {
      setCartCount(event.detail.count);
    };
    
    window.addEventListener('cart-updated' as any, handleCartUpdate as EventListener);
    
    const loadCartCount = () => {
      if (currentUser) {
        supabase
          .from('carts')
          .select('*')
          .eq('user_id', currentUser.id)
          .then(({ data }) => {
            if (data) {
              setCartCount(data.length);
            }
          });
      }
    };
    
    loadCartCount();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('cart-updated' as any, handleCartUpdate as EventListener);
    };
  }, [currentUser]);

  const isActive = (path: string) => {
    if (path === '/' && routerLocation.pathname === '/') {
      return true;
    } else if (path !== '/' && routerLocation.pathname !== '/'){
      return routerLocation.pathname.startsWith(path);
    }
    return false;
  };

  const handleLocationSelect = (location: any) => {
    setCurrentLocation(location);
    toast.success(`Location updated to ${location.name}`);
  };
  const handleSignOut = async () => {
    try {
      if (currentUser) {
        try {
          await supabase.from('carts').delete().eq('user_id', currentUser.id);
        } catch (error) {
          console.error('Error clearing cart during sign out:', error);
        }
      }
      
      clearCart();
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      if (signOut) {
        await signOut();
      }
      
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };


  return (
    <div className={`fixed top-0 left-0 right-0 z-40 bg-black border-b border-gray-800 transition-all duration-300 ${isScrolled ? 'shadow-md' : ''}`}>
      <div className="container-custom">
  <div className="flex items-center justify-between mb-2 mt-2 ">

    {/* Brand Logo */}
    <div className="flex items-center justify-between w-full px-2">
  {/* Left: Brand Text */}
  <span className="text-white font-bold text-2xl sm:text-3xl md:text-4xl tracking-wide font-poppins">
    AIJIM
  </span>

  {/* Center: Logo Image */}
  <div className="flex-grow flex justify-center items-center">
    <img
      src="/aijim-uploads/aijim.svg"
      alt="AIJIM Logo"
      className=" w-28 sm:w-38 md:w-40 lg:w-50 object-contain"
    />
  </div>
</div>

    

    {/* Right Icons */}
    <div className="flex items-center gap-4">
      
      {/* Popup Notification */}
    
      {/* Search Icon */}
      <Link
        to="/search"
        aria-label="search"
        className="text-white hover:text-blue-300 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
      </Link>

      {/* Cart Icon */}
      <Link
        to="/cart"
        aria-label="cart"
        className="flex items-center space-x-1 text-blue-400 font-medium hover:text-blue-300"
      >
        <div className="relative">
          <ShoppingCart size={22} />
          {cartCount > 0 && (
            <div>
               <span className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping opacity-95"></span>
        
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-fade-in">
              {cartCount}
            </span>
              </div>
            
            
          )}
        </div>
        <span className="hidden font-semibold sm:inline text-base sm:text-lg md:text-xl">Cart</span>
      </Link>
    </div>
  </div>
</div>  


 {/* 🔥 Flash Sale Marquee */}
            <div className="bg-red-600 h-6  pt-1 pb-1  flex items-center ">
              <Marquee gradient={false} speed={100} pauseOnHover={true} className="w-full">
                {Array.from({ length: 10 }).map((_, i) => (
                  <span key={i} className="flex items-center uppercase text-white font-semibold text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] px-4 whitespace-nowrap">
                      <Tag size={18} className='text-white'/> &nbsp;Flat ₹500 Off on Orders Above ₹2500
                  </span>
                ))}
              </Marquee>
            </div>


            








     <div className="fixed bottom-0 left-0 right-0 bg-black border-t  border-gray-800 p-2 z-50 ">
          <div className="flex items-center justify-between leading-snug">
        <Link to="/" className={`flex flex-col items-center text-xs sm:text-sm ${
      isActive('/') ? 'text-white font-medium' : 'text-[#6B7280] font-bold'
    }`}>
      <Home size={18} className={isActive('/') ? 'text-white font-bold' : 'text-[#6B7280] font-bold'} />
      <span>Home</span>
    </Link>

    <Link to="/products"   className={`flex flex-col items-center text-xs sm:text-sm ${
      isActive('/products') ? 'text-white font-semibold' : 'text-[#6B7280] font-semibold'
    }`}>
      <Package size={18} className={isActive('/products') ? 'text-white font-bold' : 'text-[#6B7280] font-bold'} />
      <span>Products</span>
    </Link>

    <Link to="/search" className={`flex flex-col items-center text-xs sm:text-sm ${
      isActive('/search') ? 'text-white font-medium' : 'text-[#6B7280] font-bold'
    }`}>
      <Search size={18} className={isActive('/search') ? 'text-white font-bold' : 'text-[#6B7280] '} />
      <span>Search</span>
    </Link>

    <Link to="/orders" className={`flex flex-col items-center text-xs sm:text-sm ${
      isActive('/orders') ? 'text-white font-medium' : 'text-[#6B7280] font-bold'
    }`}>
      <PackageSearch size={18} className={isActive('/orders') ? 'text-white font-bold' : 'text-[#6B7280] font-bold'} />
      <span>Orders</span>
    </Link>

    {currentUser ? (
      <Link to="/profile" className={`flex flex-col items-center text-xs sm:text-sm ${
        isActive('/profile') ? 'text-white font-medium' : 'text-[#6B7280] '
      }`}>
        <User size={18} className={isActive('/profile') ? 'text-white font-bold' : 'text-[#6B7280] '} />
        <span>Profile</span>
      </Link>
    ) : (
      <Link to="/signin" className={`flex flex-col items-center text-xs sm:text-sm ${
        isActive('/signin') ? 'text-white font-medium' : 'text-[#6B7280] '
      }`}>
        <User size={18} className={isActive('/signin') ? 'text-white font-bold' : 'text-[#6B7280] font-bold'} />
        <span>Sign In</span>
      </Link>
    )}
  </div>
</div>
    </div>
  );
};

export default Navbar;
